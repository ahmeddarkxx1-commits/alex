import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await context.params;
    if (!filename) {
      return NextResponse.json({ error: 'اسم الملف مطلوب' }, { status: 400 });
    }

    // Sanitize to prevent path traversal
    const safeFilename = path.basename(filename);
    const localUploadsPath = path.join(process.cwd(), 'public', 'uploads', safeFilename);
    const tmpUploadsPath = path.join('/tmp', 'uploads', safeFilename);

    let targetFilePath = '';
    if (fs.existsSync(tmpUploadsPath)) {
      targetFilePath = tmpUploadsPath;
    } else if (fs.existsSync(localUploadsPath)) {
      targetFilePath = localUploadsPath;
    }

    if (!targetFilePath) {
      // 1. Check Supabase Storage
      const { isSupabaseConfigured, supabase } = await import('@/lib/supabase');
      if (isSupabaseConfigured) {
        try {
          const { data: fileBlob, error } = await supabase.storage.from('resources').download(safeFilename);
          if (!error && fileBlob) {
            const arrayBuf = await fileBlob.arrayBuffer();
            return new NextResponse(Buffer.from(arrayBuf), {
              headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `inline; filename="${encodeURIComponent(safeFilename)}"`,
                'Cache-Control': 'public, max-age=31536000, immutable',
              },
            });
          }
        } catch {
          // ignore
        }

        // 2. Check Supabase Database resources table (Persistent Cloud Storage)
        try {
          const { data: resList, error: dbErr } = await (supabase
            .from('resources') as any)
            .select('content_markdown, file_url')
            .like('file_url', `%${safeFilename}%`)
            .limit(1);

          const resData: any = resList?.[0];

          if (!dbErr && resData?.content_markdown?.startsWith('PDF_DATA:::')) {
            const parts = resData.content_markdown.split(':::');
            const base64Str = parts[1];
            if (base64Str) {
              const fileBuffer = Buffer.from(base64Str, 'base64');

              // Cache to /tmp for faster future reads
              try {
                const tmpDir = path.join('/tmp', 'uploads');
                if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
                fs.writeFileSync(path.join(tmpDir, safeFilename), fileBuffer);
              } catch {
                // ignore
              }

              return new NextResponse(fileBuffer, {
                headers: {
                  'Content-Type': 'application/pdf',
                  'Content-Length': fileBuffer.length.toString(),
                  'Content-Disposition': `inline; filename="${encodeURIComponent(safeFilename)}"`,
                  'Cache-Control': 'public, max-age=31536000, immutable',
                },
              });
            }
          }
        } catch (dbReadErr) {
          console.warn('Database PDF retrieval error:', dbReadErr);
        }
      }
      return NextResponse.json({ error: 'الملف غير موجود على السيرفر' }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(targetFilePath);
    const stats = fs.statSync(targetFilePath);

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Length': stats.size.toString(),
        'Content-Disposition': `inline; filename="${encodeURIComponent(safeFilename)}"`,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (err: any) {
    console.error('File serving error:', err);
    return NextResponse.json({ error: 'تعذر قراءة أو تقديم الملف' }, { status: 500 });
  }
}
