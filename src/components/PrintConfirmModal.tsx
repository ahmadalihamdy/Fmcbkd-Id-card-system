import React, { useState } from 'react';
import { CheckCircle2, XCircle, Printer, AlertTriangle } from 'lucide-react';
import { StaffData } from '../types/idCard';

interface PrintConfirmModalProps {
  isOpen: boolean;
  staffData: StaffData;
  copiesPrinted: number;
  onConfirmSuccess: (copies: number, notes?: string) => void;
  onReportFailure: (reason: string) => void;
  onClose: () => void;
}

export const PrintConfirmModal: React.FC<PrintConfirmModalProps> = ({
  isOpen,
  staffData,
  copiesPrinted,
  onConfirmSuccess,
  onReportFailure,
  onClose,
}) => {
  const [copies, setCopies] = useState(copiesPrinted || 1);
  const [notes, setNotes] = useState('');
  const [failureReason, setFailureReason] = useState('Print canceled by operator');
  const [showFailureInput, setShowFailureInput] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-md overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-50 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">
                Confirm Print Job Outcome
              </h3>
              <p className="text-[11px] text-gray-500">
                FMC Birnin Kudu IT Unit — Printing Section
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 text-xs space-y-4">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-gray-900 text-xs">
                {staffData.fullName || 'Staff Member'}
              </span>
              <span className="font-mono text-[10px] font-bold bg-white px-2 py-0.5 rounded border border-gray-200">
                {staffData.idType} #{staffData.idNumber || 'N/A'}
              </span>
            </div>
            <p className="text-[11px] text-gray-600">
              Department: <strong>{staffData.department || 'N/A'}</strong>
            </p>
          </div>

          {!showFailureInput ? (
            <>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-900 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Did the ID card print successfully?</span>
                  <p className="text-[10.5px] text-amber-800 mt-0.5">
                    Confirming updates the Archive status to <strong>Printed</strong> and records the print timestamp.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                <span className="font-semibold text-gray-700">Number of physical cards produced:</span>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={copies}
                  onChange={(e) => setCopies(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 border border-gray-300 rounded px-2 py-1 text-center font-bold bg-white text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                  Optional operator notes / batch log:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Card printer tray 1, standard PVC stock"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs bg-white text-gray-800"
                />
              </div>
            </>
          ) : (
            <div className="space-y-2 bg-red-50 p-3 rounded-lg border border-red-200 text-red-900">
              <span className="font-bold block">Report print failure or cancellation</span>
              <p className="text-[11px] text-red-700">
                Status will remain <strong>Not Printed</strong>. Please specify the issue:
              </p>
              <select
                value={failureReason}
                onChange={(e) => setFailureReason(e.target.value)}
                className="w-full border border-red-300 rounded p-1.5 bg-white text-xs font-medium text-gray-900"
              >
                <option value="Print dialog canceled by user">Print dialog canceled by user</option>
                <option value="Printer offline or paper jam">Printer offline or paper jam</option>
                <option value="Ribbon or PVC blank error">Ribbon or PVC blank error</option>
                <option value="Quality defect / Reprint required">Quality defect / Reprint required</option>
              </select>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 bg-gray-50 border-t border-gray-200 flex items-center justify-between gap-2">
          {!showFailureInput ? (
            <>
              <button
                type="button"
                onClick={() => setShowFailureInput(true)}
                className="flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors"
              >
                <XCircle className="w-4 h-4" />
                No, Print Failed / Canceled
              </button>

              <button
                type="button"
                onClick={() => {
                  onConfirmSuccess(copies, notes);
                  onClose();
                }}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-lg shadow-sm transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                Yes, Printed Successfully
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setShowFailureInput(false)}
                className="text-xs text-gray-600 hover:text-gray-900 px-3 py-1.5"
              >
                Back
              </button>

              <button
                type="button"
                onClick={() => {
                  onReportFailure(failureReason);
                  onClose();
                }}
                className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2 rounded-lg shadow-sm transition-colors"
              >
                Save as Not Printed
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
