import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface ToastProps {
  show: boolean;
  title: string;
  message: string;
  type?: 'success' | 'error';
}

export const Toast: React.FC<ToastProps> = ({ show, title, message, type = 'success' }) => {
  return (
    <div
      className={`fixed top-5 right-5 z-50 transform transition-all duration-300 pointer-events-none flex items-center gap-3 bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md ${
        show ? 'translate-y-0 opacity-100' : '-translate-y-20 opacity-0'
      }`}
    >
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
          type === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
        }`}
      >
        {type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
      </div>
      <div>
        <h4 className="text-xs font-bold leading-tight">{title}</h4>
        <p className="text-[11px] text-slate-300 mt-0.5">{message}</p>
      </div>
    </div>
  );
};
