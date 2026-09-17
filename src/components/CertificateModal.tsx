import React from 'react';
import { Course, Enrollment, User } from '../types';
import { X, Award, Printer, Download, CheckCircle2, ShieldCheck } from 'lucide-react';

interface CertificateModalProps {
  course: Course;
  enrollment: Enrollment;
  user: User;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  course,
  enrollment,
  user,
  onClose
}) => {
  const certId = enrollment.certificateId || `HAL-CERT-2026-${Math.floor(100000 + Math.random() * 900000)}`;
  const completionDate = enrollment.completedDate || new Date().toISOString().split('T')[0];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-white w-full max-w-3xl rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col print:border-none print:shadow-none">
        {/* Modal Top Actions */}
        <div className="bg-slate-100 px-5 py-3 flex items-center justify-between border-b border-slate-200 print:hidden">
          <div className="flex items-center space-x-2 text-xs text-slate-700 font-medium">
            <Award className="w-4 h-4 text-[#0070F2]" />
            <span>HAL Verified Digital Credential • Certificate ID: {certId}</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded shadow-xs transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-1.5 rounded transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Sheet Display */}
        <div id="printable-hal-certificate" className="p-8 sm:p-12 bg-white relative text-center border-8 border-[#1b2a3a] m-4 rounded-lg shadow-inner">
          {/* Subtle Decorative Corner Accents */}
          <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-[#0070F2]" />
          <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-[#0070F2]" />
          <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-[#0070F2]" />
          <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-[#0070F2]" />

          {/* HAL Brand Header */}
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="bg-[#0070F2] text-white font-black text-xs px-2.5 py-1 rounded">
              HAL
            </div>
            <span className="text-sm font-semibold tracking-wider text-slate-800 uppercase font-sans">
              SuccessFactors Learning Academy
            </span>
          </div>

          <p className="text-xs text-slate-400 uppercase tracking-[0.25em] font-mono mb-2">
            Official Enterprise Verification
          </p>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1b2a3a] tracking-tight uppercase font-serif mb-6">
            Certificate of Completion
          </h1>

          <p className="text-xs text-slate-500 italic mb-2">This is to certify that</p>

          {/* Recipient */}
          <div className="mb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-[#0070F2] underline decoration-1 underline-offset-8">
              {user.name}
            </h2>
            <p className="text-xs text-slate-600 font-mono mt-2">
              HAL Personnel No: {user.sapId} • {user.department}
            </p>
          </div>

          <p className="text-xs text-slate-500 max-w-lg mx-auto leading-relaxed mb-6">
            has successfully fulfilled all curriculum requirements, continuous compliance assessments, and knowledge check evaluations for the enterprise course:
          </p>

          {/* Course Name Banner */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 max-w-xl mx-auto mb-8">
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1">
              Item ID: {course.itemId} • Rev. {course.version}
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              {course.title}
            </h3>
            <div className="mt-2 flex items-center justify-center space-x-4 text-xs text-slate-600">
              <span>Domain: <strong>{course.category}</strong></span>
              <span>•</span>
              <span>Credit: <strong>{course.creditHours} Hours</strong></span>
              <span>•</span>
              <span>Score: <strong>{enrollment.quizScore ?? 100}%</strong></span>
            </div>
          </div>

          {/* Signatures & Seal */}
          <div className="grid grid-cols-3 gap-4 items-end pt-6 border-t border-slate-200 max-w-xl mx-auto text-left">
            <div>
              <div className="text-[11px] font-mono text-slate-500">Date Completed</div>
              <div className="text-xs font-bold text-slate-800">{completionDate}</div>
              <div className="text-[10px] text-slate-400">Valid: 12 Months</div>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full border-2 border-[#0070F2] flex items-center justify-center bg-blue-50 text-[#0070F2] mb-1">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">
                HAL Certified Seal
              </span>
            </div>

            <div className="text-right">
              <div className="text-[11px] font-mono text-slate-500">Authorized Officer</div>
              <div className="text-xs font-bold text-slate-800 font-serif italic">Helena Vance</div>
              <div className="text-[10px] text-slate-400">Global VP of Learning & Development</div>
            </div>
          </div>

          <div className="mt-6 text-[10px] font-mono text-slate-400">
            System ID: PRD-HAL-LMS-EMEA-042 • Token Hash: {certId}-VERIFIED
          </div>
        </div>
      </div>
    </div>
  );
};
