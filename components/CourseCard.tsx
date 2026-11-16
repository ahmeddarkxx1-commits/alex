'use client';

import React from 'react';
import { Subject, Resource } from '@/types/database';
import { 
  Crosshair, 
  MapPin, 
  PenTool, 
  Ruler, 
  Binary, 
  Monitor, 
  Languages, 
  ShieldAlert,
  Globe2,
  Navigation,
  Database,
  Calculator,
  Scale,
  Percent,
  Layers,
  Wheat,
  Spline,
  Laptop,
  Camera,
  Glasses,
  Grid,
  Mountain,
  Boxes,
  Map,
  Scan,
  LayoutTemplate,
  Sigma,
  FileCheck2,
  Palette,
  BookOpen,
  Trophy,
  ChevronLeft,
  FileText,
  FileCheck
} from 'lucide-react';

interface CourseCardProps {
  subject: Subject;
  resourcesCount: number;
  sheetsCount: number;
  onOpenSubject: (subject: Subject) => void;
}

export default function CourseCard({
  subject,
  resourcesCount,
  sheetsCount,
  onOpenSubject,
}: CourseCardProps) {
  // Map icon
  const getSubjectIcon = (iconName?: string) => {
    const props = { className: 'w-6 h-6' };
    switch (iconName) {
      case 'Crosshair': return <Crosshair {...props} />;
      case 'MapPin': return <MapPin {...props} />;
      case 'PenTool': return <PenTool {...props} />;
      case 'Ruler': return <Ruler {...props} />;
      case 'Binary': return <Binary {...props} />;
      case 'Monitor': return <Monitor {...props} />;
      case 'Languages': return <Languages {...props} />;
      case 'ShieldAlert': return <ShieldAlert {...props} />;
      case 'Globe2': return <Globe2 {...props} />;
      case 'Navigation': return <Navigation {...props} />;
      case 'Database': return <Database {...props} />;
      case 'Calculator': return <Calculator {...props} />;
      case 'Scale': return <Scale {...props} />;
      case 'Percent': return <Percent {...props} />;
      case 'Layers': return <Layers {...props} />;
      case 'Wheat': return <Wheat {...props} />;
      case 'Spline': return <Spline {...props} />;
      case 'Laptop': return <Laptop {...props} />;
      case 'Camera': return <Camera {...props} />;
      case 'Glasses': return <Glasses {...props} />;
      case 'Grid': return <Grid {...props} />;
      case 'Mountain': return <Mountain {...props} />;
      case 'Boxes': return <Boxes {...props} />;
      case 'Map': return <Map {...props} />;
      case 'Scan': return <Scan {...props} />;
      case 'LayoutTemplate': return <LayoutTemplate {...props} />;
      case 'Sigma': return <Sigma {...props} />;
      case 'FileCheck2': return <FileCheck2 {...props} />;
      case 'Palette': return <Palette {...props} />;
      case 'Trophy': return <Trophy {...props} />;
      default: return <BookOpen {...props} />;
    }
  };

  return (
    <div
      onClick={() => onOpenSubject(subject)}
      className="group relative flex flex-col justify-between bg-[#0F172A]/80 hover:bg-[#131E36] border border-slate-800 hover:border-cyan-500/60 rounded-3xl p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl hover:shadow-cyan-950/30 cursor-pointer"
    >
      <div>
        {/* Top Header: Code & Icon */}
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-all shadow-md">
            {getSubjectIcon(subject.icon_name)}
          </div>

          <span className="text-xs font-mono font-bold text-slate-400 bg-slate-900/90 px-3 py-1 rounded-xl border border-slate-800 group-hover:text-cyan-300 group-hover:border-cyan-500/30 transition-colors">
            {subject.code}
          </span>
        </div>

        {/* Subject Title */}
        <h3 className="text-lg sm:text-xl font-black text-white group-hover:text-cyan-300 transition-colors leading-snug mb-2">
          {subject.name_ar}
        </h3>

        {/* Instructor */}
        {subject.instructor_name && (
          <p className="text-xs text-cyan-400/90 font-bold mb-2">
            المحاضر: {subject.instructor_name}
          </p>
        )}

        {/* Description */}
        <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 mb-4">
          {subject.description || 'المقرر الدراسي المعتمد لشعبة المساحة العامة.'}
        </p>
      </div>

      {/* Footer Badges & Action */}
      <div className="pt-4 border-t border-slate-800/80 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-300 font-bold">
            <FileText className="w-3.5 h-3.5 text-cyan-400" />
            <span>{resourcesCount} ملفات وتلخيصات</span>
          </div>

          {sheetsCount > 0 ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-black text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-lg">
              <FileCheck className="w-3 h-3" />
              {sheetsCount} شيتات
            </span>
          ) : (
            <span className="text-[11px] text-slate-400">مكتمل</span>
          )}
        </div>

        <button className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-900 group-hover:bg-cyan-500 text-slate-300 group-hover:text-slate-950 text-xs font-extrabold border border-slate-800 group-hover:border-cyan-400 transition-all shadow-sm">
          <span>استعراض مذكرات وشيتات المادة</span>
          <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        </button>
      </div>
    </div>
  );
}
