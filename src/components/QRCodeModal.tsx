import React from 'react';
import { X, Printer, Download, Scan, CheckCircle2, Shield } from 'lucide-react';
import { Staff } from '../types';
import { AUSouthLogo } from './AUSouthLogo';

interface QRCodeModalProps {
  staff: Staff | null;
  onClose: () => void;
  onTestScan?: (tokenOrCode: string) => void;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  staff,
  onClose,
  onTestScan,
}) => {
  if (!staff) return null;

  const handleDownload = () => {
    if (!staff.qr_code_image) return;
    const a = document.createElement('a');
    a.href = staff.qr_code_image;
    a.download = `AUS_QR_${staff.staff_code}_${staff.full_name.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header Bar */}
        <div className="px-5 py-3.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#0B3B60]" />
            <h3 className="font-bold text-slate-800 text-sm">
              Official Faculty & Staff ID Badge
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Badge Card Container (Format for Print & Screen) */}
        <div className="p-6 flex flex-col items-center">
          <div
            id="printable-id-card"
            className="w-full max-w-[340px] bg-gradient-to-b from-white to-slate-50 rounded-2xl border-2 border-slate-300 shadow-md overflow-hidden relative"
          >
            {/* Top Lanyard Slot */}
            <div className="h-4 bg-slate-200 flex items-center justify-center border-b border-slate-300">
              <div className="w-12 h-1.5 bg-slate-400 rounded-full" />
            </div>

            {/* College Header */}
            <div className="bg-[#0B3B60] text-white px-4 py-3 flex items-center justify-between border-b-4 border-amber-400">
              <AUSouthLogo size="sm" lightMode showText={false} />
              <div className="text-right">
                <div className="text-xs font-black tracking-tight leading-none text-white">
                  COLLEGE OF AU SOUTH
                </div>
                <div className="text-[9px] text-amber-300 font-semibold tracking-wider uppercase mt-0.5">
                  Official Identification Card
                </div>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-4 text-center">
              {/* Photo Avatar */}
              <div className="mx-auto w-20 h-20 rounded-xl bg-gradient-to-br from-slate-200 to-slate-300 border-2 border-[#0B3B60] flex items-center justify-center text-2xl font-black text-[#0B3B60] shadow-sm mb-3">
                {staff.full_name
                  .split(' ')
                  .map(n => n[0])
                  .slice(0, 2)
                  .join('')}
              </div>

              {/* Staff Details */}
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                {staff.full_name}
              </h2>
              <p className="text-xs font-semibold text-[#0B3B60] mt-0.5">
                {staff.position}
              </p>
              <p className="text-[11px] text-slate-500 font-medium">
                {staff.department}
              </p>

              {/* Staff ID Pill */}
              <div className="my-2.5 inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-300/80 rounded-full text-xs font-mono font-bold text-amber-900">
                <span>ID:</span>
                <span>{staff.staff_code}</span>
              </div>

              {/* High-Resolution QR Code */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs inline-block mb-2">
                {staff.qr_code_image ? (
                  <img
                    src={staff.qr_code_image}
                    alt={`QR Code for ${staff.full_name}`}
                    className="w-44 h-44 object-contain mx-auto"
                  />
                ) : (
                  <div className="w-44 h-44 flex items-center justify-center text-slate-400 text-xs">
                    Loading QR...
                  </div>
                )}
              </div>

              {/* Verification & Security Token */}
              <div className="text-[10px] font-mono text-slate-400 truncate max-w-[260px] mx-auto">
                TOKEN: {staff.qr_code_token}
              </div>
              <div className="mt-1 flex items-center justify-center gap-1 text-[9px] text-emerald-600 font-semibold">
                <CheckCircle2 className="w-3 h-3" />
                <span>Authorized Institutional Token</span>
              </div>
            </div>

            {/* Bottom Card Strip */}
            <div className="bg-slate-800 text-slate-300 text-[8px] py-1 text-center font-mono tracking-widest uppercase">
              Tagum City • Valid for Academic Year 2024-2025
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 no-print">
          {onTestScan && (
            <button
              onClick={() => {
                onTestScan(staff.qr_code_token);
                onClose();
              }}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-xs"
            >
              <Scan className="w-4 h-4" />
              <span>Test Scan Now</span>
            </button>
          )}

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 hover:bg-white text-slate-700 transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Download PNG</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#0B3B60] hover:bg-[#07243c] text-white transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5 text-amber-300" />
              <span>Print Badge</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
