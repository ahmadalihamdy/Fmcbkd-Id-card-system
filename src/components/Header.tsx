import React from 'react';
import { IDType, UserRole } from '../types/idCard';
import {
  Printer,
  CreditCard,
  Building2,
  Sliders,
  FileText,
  Shield,
  Palette,
  Layers,
} from 'lucide-react';

interface HeaderProps {
  selectedIDType: IDType;
  userRole: UserRole;
  onToggleUserRole: () => void;
  onOpenRecords: () => void;
  onOpenDepartments: () => void;
  onOpenPrintSettings: () => void;
  onOpenReferenceModal: () => void;
  onOpenTemplateEditor: () => void;
  onOpenSampleManager?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedIDType,
  userRole,
  onToggleUserRole,
  onOpenRecords,
  onOpenDepartments,
  onOpenPrintSettings,
  onOpenReferenceModal,
  onOpenTemplateEditor,
  onOpenSampleManager,
}) => {
  const isAdmin = userRole === 'Administrator';

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-xs print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Left: FMC Birnin Kudu Branding */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border border-gray-200 p-0.5 bg-white shadow-xs flex items-center justify-center shrink-0">
            <img
              src="/assets/card_samples/fmc_logo.png"
              alt="Federal Medical Centre Birnin Kudu Logo"
              className="w-full h-full object-contain"
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-extrabold text-gray-900 tracking-tight leading-tight">
                FEDERAL MEDICAL CENTRE, BIRNIN KUDU
              </h1>
              <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                JIGAWA STATE
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
              <span className="font-semibold text-blue-700">
                IT Unit — Printing Section
              </span>
              <span>•</span>
              <span className="font-medium">Staff ID Card Printing System</span>
            </div>
          </div>
        </div>

        {/* Right: ID Type Badge, Role Selector & Actions */}
        <div className="flex items-center gap-2.5">
          {/* Active ID Type Status Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border bg-gray-50 text-xs">
            <span className="text-gray-500 font-medium">Template:</span>
            <span
              className={`font-black px-2 py-0.5 rounded text-[11px] tracking-wide ${
                selectedIDType === 'SSA'
                  ? 'bg-red-600 text-white shadow-xs'
                  : selectedIDType === 'LCM'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'bg-emerald-700 text-white shadow-xs'
              }`}
            >
              {selectedIDType.toUpperCase()} CARD
            </span>
          </div>

          {/* User Role Switcher (Section 6) */}
          <button
            type="button"
            onClick={onToggleUserRole}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold transition-colors cursor-pointer ${
              isAdmin
                ? 'bg-purple-50 text-purple-900 border-purple-200 hover:bg-purple-100'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
            title="Click to toggle between Administrator and Printing Operator mode"
          >
            <Shield className={`w-3.5 h-3.5 ${isAdmin ? 'text-purple-600' : 'text-slate-500'}`} />
            <span>{userRole}</span>
          </button>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 border-l pl-2 border-gray-200">
            {/* ID Card Sample & Template Manager Button */}
            {onOpenSampleManager && (
              <button
                onClick={onOpenSampleManager}
                className="flex items-center gap-1 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-2.5 py-1.5 rounded-lg transition-colors shadow-xs"
                title="Upload ID Card Sample (PDF / Image) & Assign Templates"
              >
                <Layers className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden sm:inline">Upload Sample</span>
              </button>
            )}

            {/* Template Editor button (Admin or direct) */}
            <button
              onClick={onOpenTemplateEditor}
              className="flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1.5 rounded-lg transition-colors shadow-xs"
              title="Open Card Template Designer"
            >
              <Palette className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">Template Editor</span>
            </button>

            <button
              onClick={onOpenRecords}
              className="flex items-center gap-1 text-xs font-semibold text-gray-700 hover:text-blue-700 hover:bg-gray-100 px-2.5 py-1.5 rounded-lg transition-colors"
              title="View Archived Staff Records (Printed / Not Printed)"
            >
              <CreditCard className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden md:inline">Archive</span>
            </button>

            <button
              onClick={onOpenDepartments}
              className="flex items-center gap-1 text-xs font-semibold text-gray-700 hover:text-blue-700 hover:bg-gray-100 px-2 py-1.5 rounded-lg transition-colors"
              title="Manage Department Directory"
            >
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden lg:inline">Depts</span>
            </button>

            <button
              onClick={onOpenPrintSettings}
              className="flex items-center gap-1 text-xs font-semibold text-gray-700 hover:text-blue-700 hover:bg-gray-100 px-2 py-1.5 rounded-lg transition-colors"
              title="Configure Print & Card Size"
            >
              <Sliders className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden lg:inline">Print Settings</span>
            </button>

            <button
              onClick={onOpenReferenceModal}
              className="flex items-center gap-1 text-xs font-semibold text-gray-700 hover:text-blue-700 hover:bg-gray-100 px-2 py-1.5 rounded-lg transition-colors"
              title="View Reference PDF Sample"
            >
              <FileText className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden xl:inline">Sample Ref</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
