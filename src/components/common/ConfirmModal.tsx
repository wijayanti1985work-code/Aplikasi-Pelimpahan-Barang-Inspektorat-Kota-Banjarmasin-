import React from 'react';
import { AlertTriangle, AlertCircle, HelpCircle, Check, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  subMessage?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'primary' | 'success';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  subMessage,
  confirmLabel = 'Ya, Lanjutkan',
  cancelLabel = 'Batal',
  variant = 'danger',
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: <AlertTriangle className="w-5 h-5 text-rose-600" />,
          iconBg: 'bg-rose-100',
          confirmBtn: 'bg-rose-600 hover:bg-rose-700 text-white',
        };
      case 'warning':
        return {
          icon: <AlertCircle className="w-5 h-5 text-amber-600" />,
          iconBg: 'bg-amber-100',
          confirmBtn: 'bg-amber-600 hover:bg-amber-700 text-white',
        };
      case 'success':
        return {
          icon: <Check className="w-5 h-5 text-emerald-600" />,
          iconBg: 'bg-emerald-100',
          confirmBtn: 'bg-emerald-600 hover:bg-emerald-700 text-white',
        };
      case 'primary':
      default:
        return {
          icon: <HelpCircle className="w-5 h-5 text-[#0F766E]" />,
          iconBg: 'bg-[#CCFBF1]',
          confirmBtn: 'bg-[#0F766E] hover:bg-[#0d6861] text-white',
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className="fixed inset-0 z-70 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-[#E5E7EB] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-5 sm:p-6 space-y-4">
          <div className="flex items-start gap-3.5">
            <div className={`w-10 h-10 rounded-xl ${styles.iconBg} flex items-center justify-center shrink-0`}>
              {styles.icon}
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold text-[#111827] leading-snug">{title}</h3>
              <p className="text-xs text-[#6B7280] mt-1 leading-relaxed">{message}</p>
              {subMessage && (
                <p className="text-[11px] text-[#6B7280] mt-2 bg-[#F3F4F6] p-2 rounded-lg border border-[#E5E7EB]">
                  {subMessage}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition-colors cursor-pointer"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className={`px-4 py-2 text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer ${styles.confirmBtn}`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
