import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Allowed MIME types: STRICTLY PDF ONLY to save storage space and bandwidth
const ALLOWED_MIME_TYPES = ['application/pdf'];
const MAX_FILE_SIZE = 30 * 1024 * 1024; // 30 MB max

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'لم يتم اختيار أي ملف للرفع' },
        { status: 400 }
      );
    }

    // 1. Strict File Type Validation: PDF ONLY (NO IMAGES)
    const isPdfMime = ALLOWED_MIME_TYPES.includes(file.type);
    const isPdfExt = file.name.toLowerCase().endsWith('.pdf');

    if (!isPdfMime && !isPdfExt) {
      return NextResponse.json(
        {
          error: '❌ غير مسموح برفع الصور أو الملفات غير المتوافقة! الصيغة المعتمدة الوحيدة هي مستندات PDF (.pdf) فقط توفيراً لمساحة التخزين وسرعة التصفح لجميع الطلاب.',
        },
        { status: 400 }
      );
    }

    // 2. Size limit validation
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'حجم الملف يتجاوز الحد الأقصى المسموح به (30 ميجابايت)' },
        { status: 400 }
      );
    }

    // 3. Ensure uploads folder exists (using /tmp on Vercel Serverless to prevent read-only EROFS)
    const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
    let uploadsDir = isServerless ? path.join('/tmp', 'uploads') : path.join(process.cwd(), 'public', 'uploads');

    try {
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
    } catch {
      uploadsDir = path.join('/tmp', 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
    }

    // 4. Generate clean, unique filename
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitize filename
    const cleanName = file.name
      .replace(/[^a-zA-Z0-9_\u0600-\u06FF.-]/g, '_')
      .replace(/\.pdf$/i, '');
    const uniqueSuffix = Date.now();
    const finalFilename = `${uniqueSuffix}_${cleanName.slice(0, 50)}.pdf`;

    // 5. Write to local or /tmp safely
    let filePath = path.join(uploadsDir, finalFilename);
    try {
      fs.writeFileSync(filePath, buffer);
    } catch {
      uploadsDir = path.join('/tmp', 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      filePath = path.join(uploadsDir, finalFilename);
      fs.writeFileSync(filePath, buffer);
    }

    // Format human-readable file size
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
    const formattedSize = `${sizeInMb} MB`;

    let publicUrl = `/api/files/${finalFilename}`;

    // 6. Try uploading to Supabase Storage if configured
    try {
      const { isSupabaseConfigured, supabase } = await import('@/lib/supabase');
      if (isSupabaseConfigured) {
        const { data: uploadData, error: uploadErr } = await supabase.storage
          .from('resources')
          .upload(finalFilename, buffer, {
            contentType: 'application/pdf',
            upsert: true,
          });

        if (!uploadErr && uploadData) {
          const { data: urlData } = supabase.storage.from('resources').getPublicUrl(finalFilename);
          if (urlData?.publicUrl) {
            publicUrl = urlData.publicUrl;
          }
        }
      }
    } catch (storageErr) {
      console.warn('Supabase storage upload attempt error:', storageErr);
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
      file_base64: buffer.toString('base64'),
      legacy_url: `/uploads/${finalFilename}`,
      filename: file.name,
      stored_name: finalFilename,
      file_size: formattedSize,
      format: 'PDF',
      message: 'تم رفع مستند الـ PDF بنجاح وفق معايير توفير المساحة.',
    });
  } catch (err: any) {
    console.error('Upload API error:', err);
    return NextResponse.json(
      { error: err.message || 'حدث خطأ أثناء معالجة ورفع الملف' },
      { status: 500 }
    );
  }
}
