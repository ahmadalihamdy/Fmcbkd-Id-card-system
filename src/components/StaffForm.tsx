import React, { useRef, useState } from 'react';
import {
  BloodGroup,
  DepartmentItem,
  IDType,
  IDTypeConfig,
  PhotoFitMode,
  StaffData,
} from '../types/idCard';
import { BLOOD_GROUPS, DEFAULT_ID_TYPES, INTERN_CADRES } from '../constants/initialData';
import {
  Upload,
  Camera,
  Trash2,
  Sliders,
  PenTool,
  RotateCcw,
  Printer,
  FileDown,
  BookmarkPlus,
  Sparkles,
  Building2,
  AlertCircle,
  CheckCircle2,
  ZoomIn,
  ZoomOut,
  Scissors,
  Maximize,
  Minimize,
  Layers,
} from 'lucide-react';

interface StaffFormProps {
  data: StaffData;
  onChange: (updates: Partial<StaffData>) => void;
  onIDTypeChange: (newType: IDType) => void;
  idTypes?: IDTypeConfig[];
  departments: DepartmentItem[];
  onOpenDepartments: () => void;
  onOpenPhotoCropper: () => void;
  onOpenSignaturePad: () => void;
  onOpenSampleManager?: () => void;
  onPrint: () => void;
  onExportPDF: (side: 'both' | 'front' | 'back' | 'a4-sheet') => void;
  onReset: () => void;
  onSaveRecord: () => void;
  onLoadSample: (type: IDType) => void;
}

export const StaffForm: React.FC<StaffFormProps> = ({
  data,
  onChange,
  onIDTypeChange,
  idTypes = DEFAULT_ID_TYPES,
  departments,
  onOpenDepartments,
  onOpenPhotoCropper,
  onOpenSignaturePad,
  onOpenSampleManager,
  onPrint,
  onExportPDF,
  onReset,
  onSaveRecord,
  onLoadSample,
}) => {
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const signatureInputRef = useRef<HTMLInputElement | null>(null);
  const [departmentSearch, setDepartmentSearch] = useState('');
  const [showDeptDropdown, setShowDeptDropdown] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);

  const isSSA = data.idType === 'SSA';
  const isLCM = data.idType === 'LCM';
  const isIntern = data.idType === 'Intern';

  // Current photo zoom percent (0 - 100%)
  const zoomPercent = data.photoZoomPercent !== undefined ? data.photoZoomPercent : 100;

  const handleZoomSliderChange = (newPercent: number) => {
    const clamped = Math.max(0, Math.min(100, newPercent));
    const newScale = 0.35 + (clamped / 100) * 0.65;
    onChange({
      photoZoomPercent: clamped,
      photoScale: newScale,
    });
  };

  // Handle Photo Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/^image\/(png|jpe?g)$/i)) {
      alert('Please upload a valid PNG, JPG, or JPEG image.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('Photo file size must not exceed 10MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      onChange({
        photoUrl: event.target?.result as string,
        photoZoomPercent: 100,
        photoScale: 1,
        photoX: 0,
        photoY: 0,
        photoRotation: 0,
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Handle Signature Upload
  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/^image\/(png|jpe?g)$/i)) {
      alert('Please upload a valid PNG, JPG, or JPEG signature image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      onChange({ signatureUrl: event.target?.result as string });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Filtered active departments
  const filteredDepartments = departments
    .filter((d) => d.isActive)
    .filter((d) =>
      d.name.toLowerCase().includes(departmentSearch.toLowerCase())
    );

  // Quick Date Helpers
  const setQuickExpiry = (yearsToAdd: number) => {
    const date = new Date();
    date.setFullYear(date.getFullYear() + yearsToAdd);
    const months = [
      'JAN',
      'FEB',
      'MAR',
      'APR',
      'MAY',
      'JUN',
      'JUL',
      'AUG',
      'SEP',
      'OCT',
      'NOV',
      'DEC',
    ];
    const day = date.getDate();
    let suffix = 'th';
    if (day === 1 || day === 21 || day === 31) suffix = 'st';
    else if (day === 2 || day === 22) suffix = 'nd';
    else if (day === 3 || day === 23) suffix = 'rd';

    const formatted = `${day}${suffix} ${months[date.getMonth()]}, ${date.getFullYear()}`;
    onChange({ dateValue: formatted });
  };

  const setTodayDate = () => {
    const date = new Date();
    const months = [
      'JAN',
      'FEB',
      'MAR',
      'APR',
      'MAY',
      'JUN',
      'JUL',
      'AUG',
      'SEP',
      'OCT',
      'NOV',
      'DEC',
    ];
    const day = date.getDate();
    let suffix = 'th';
    if (day === 1 || day === 21 || day === 31) suffix = 'st';
    else if (day === 2 || day === 22) suffix = 'nd';
    else if (day === 3 || day === 23) suffix = 'rd';

    const formatted = `${day}${suffix} ${months[date.getMonth()]}, ${date.getFullYear()}`;
    onChange({ dateValue: formatted });
  };

  // Validation status
  const isComplete =
    data.idNumber?.trim() &&
    data.fullName?.trim() &&
    data.department?.trim() &&
    data.designation?.trim() &&
    data.dateValue?.trim();

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-xs flex flex-col h-full overflow-hidden">
      {/* Top Form Header */}
      <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            Staff Information &amp; Data Entry
            {isComplete ? (
              <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Ready to Print
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> Incomplete
              </span>
            )}
          </h2>
          <p className="text-xs text-gray-500">
            Federal Medical Centre, Birnin Kudu — IT Unit Printing Section
          </p>
        </div>

        {/* Sample Data Loader & Sample Manager */}
        <div className="flex items-center gap-1.5">
          {onOpenSampleManager && (
            <button
              type="button"
              onClick={onOpenSampleManager}
              className="flex items-center gap-1 text-xs font-semibold text-indigo-700 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded-lg border border-indigo-200 transition-colors"
              title="Upload PDF/Image Sample & Assign Templates"
            >
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span>Sample &amp; Template Manager</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onLoadSample(data.idType)}
            className="flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg border border-blue-200 transition-colors"
            title="Load reference sample data"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Load {data.idType} Sample</span>
          </button>
        </div>
      </div>

      {/* Main Form Fields (Scrollable) */}
      <div className="p-5 flex-1 overflow-y-auto space-y-4 text-xs font-medium text-gray-700">
        {/* ID TYPE SELECTION (Dynamic with SSA, LCM, Intern & Custom Types) */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-black text-gray-800 uppercase tracking-wider">
              Select Staff ID Type
            </label>
            {onOpenSampleManager && (
              <button
                type="button"
                onClick={onOpenSampleManager}
                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                + New / Replace Sample
              </button>
            )}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {idTypes.map((typeConfig) => {
              const isSelected = data.idType === typeConfig.id;
              const isRed =
                typeConfig.colorTheme === 'red' ||
                typeConfig.accentColor?.includes('red') ||
                typeConfig.id === 'SSA';
              const isGreen =
                typeConfig.colorTheme === 'emerald' ||
                typeConfig.accentColor?.includes('emerald') ||
                typeConfig.accentColor?.includes('green') ||
                typeConfig.id === 'Intern';
              const isBlue = !isRed && !isGreen;

              return (
                <button
                  key={typeConfig.id}
                  type="button"
                  onClick={() => onIDTypeChange(typeConfig.id)}
                  className={`p-2.5 rounded-lg border text-left transition-all flex flex-col justify-between ${
                    isSelected
                      ? isRed
                        ? 'border-red-600 bg-red-50/70 ring-2 ring-red-500/30'
                        : isGreen
                        ? 'border-emerald-700 bg-emerald-50/70 ring-2 ring-emerald-500/30'
                        : 'border-blue-700 bg-blue-50/70 ring-2 ring-blue-500/30'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`font-black text-xs ${
                        isSelected
                          ? isRed
                            ? 'text-red-700'
                            : isGreen
                            ? 'text-emerald-800'
                            : 'text-blue-800'
                          : 'text-gray-900'
                      }`}
                    >
                      {typeConfig.name || typeConfig.label}
                    </span>
                    <span
                      className={`w-3 h-3 rounded-full border-2 ${
                        isSelected
                          ? isRed
                            ? 'border-red-600 bg-red-600'
                            : isGreen
                            ? 'border-emerald-700 bg-emerald-700'
                            : 'border-blue-700 bg-blue-700'
                          : 'border-gray-300 bg-white'
                      }`}
                    />
                  </div>
                  <div className="text-[10px] text-gray-500 mt-1 font-medium truncate">
                    {typeConfig.description || (typeConfig.dateLabel ? `• ${typeConfig.dateLabel}` : 'Staff ID')}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 1. ID NUMBER */}
        <div>
          <label className="block font-bold text-gray-800 mb-1">
            Staff / Intern ID Number: <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data.idNumber}
            onChange={(e) => onChange({ idNumber: e.target.value.toUpperCase() })}
            placeholder={
              isSSA
                ? 'e.g. SSA 0812 or FMC/SSA/0492'
                : isLCM
                ? 'e.g. 2431'
                : 'e.g. INT/2026/041'
            }
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white uppercase font-mono"
          />
        </div>

        {/* 2. FULL NAME */}
        <div>
          <label className="block font-bold text-gray-800 mb-1">
            Full Name: <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data.fullName}
            onChange={(e) => onChange({ fullName: e.target.value.toUpperCase() })}
            placeholder={
              isIntern
                ? 'e.g. DR. IBRAHIM SULEIMAN'
                : "e.g. SHAFI'U HALADU or DR. AMINA KABIR"
            }
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white uppercase"
          />
        </div>

        {/* 3. DEPARTMENT */}
        <div className="relative">
          <div className="flex items-center justify-between mb-1">
            <label className="font-bold text-gray-800">
              Department / Clinical Unit: <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={onOpenDepartments}
              className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <Building2 className="w-3 h-3" />
              Manage Directory
            </button>
          </div>

          <div className="relative">
            <input
              type="text"
              value={data.department}
              onFocus={() => setShowDeptDropdown(true)}
              onChange={(e) => {
                const val = e.target.value.toUpperCase();
                onChange({ department: val });
                setDepartmentSearch(val);
                setShowDeptDropdown(true);
              }}
              placeholder="Search or select department..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white uppercase"
            />
            {showDeptDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg z-30 divide-y divide-gray-100">
                {filteredDepartments.length === 0 ? (
                  <div className="p-3 text-gray-400 text-center text-xs">
                    No matching department. Type to use custom.
                  </div>
                ) : (
                  filteredDepartments.map((dept) => (
                    <button
                      key={dept.id}
                      type="button"
                      onClick={() => {
                        onChange({ department: dept.name });
                        setShowDeptDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-semibold hover:bg-blue-50 text-gray-800 transition-colors"
                    >
                      {dept.name}
                    </button>
                  ))
                )}
                <div
                  className="p-1.5 bg-gray-50 text-center text-[10px] text-blue-600 font-bold cursor-pointer hover:bg-gray-100"
                  onClick={() => setShowDeptDropdown(false)}
                >
                  Close Dropdown
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 4. DESIGNATION OR INTERN CADRE */}
        <div>
          <label className="block font-bold text-gray-800 mb-1">
            {isIntern ? 'Intern Cadre / Category:' : 'Designation / Job Title:'}{' '}
            <span className="text-red-500">*</span>
          </label>
          {isIntern ? (
            <div className="space-y-1.5">
              <select
                value={data.designation}
                onChange={(e) => onChange({ designation: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white"
              >
                <option value="">-- Select Intern Cadre --</option>
                {INTERN_CADRES.map((cadre) => (
                  <option key={cadre} value={cadre}>
                    {cadre}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={data.designation}
                onChange={(e) => onChange({ designation: e.target.value.toUpperCase() })}
                placeholder="Or type custom intern category..."
                className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-xs font-bold focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white uppercase"
              />
            </div>
          ) : (
            <input
              type="text"
              value={data.designation}
              onChange={(e) => onChange({ designation: e.target.value.toUpperCase() })}
              placeholder={
                isSSA
                  ? 'e.g. SENIOR MEDICAL OFFICER, PRINCIPAL NURSING OFFICER'
                  : 'e.g. HEALTH ATTENDANT, ADMINISTRATIVE ASSISTANT'
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white uppercase"
            />
          )}
        </div>

        {/* 5. DATE FIELD */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="font-bold text-gray-800">
              {isSSA ? 'Date of Issue:' : isLCM ? 'Expiry Date:' : 'Validity / Posting Period:'}{' '}
              <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-1 text-[10px]">
              {isSSA ? (
                <button
                  type="button"
                  onClick={setTodayDate}
                  className="text-blue-600 hover:underline font-semibold"
                >
                  Set Today
                </button>
              ) : isLCM ? (
                <>
                  <button
                    type="button"
                    onClick={() => setQuickExpiry(3)}
                    className="text-blue-600 hover:underline font-semibold"
                  >
                    +3 Years
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => setQuickExpiry(5)}
                    className="text-blue-600 hover:underline font-semibold"
                  >
                    +5 Years
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setQuickExpiry(1)}
                    className="text-emerald-700 hover:underline font-semibold"
                  >
                    +1 Year (Internship)
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => setQuickExpiry(2)}
                    className="text-emerald-700 hover:underline font-semibold"
                  >
                    +2 Years
                  </button>
                </>
              )}
            </div>
          </div>
          <input
            type="text"
            value={data.dateValue}
            onChange={(e) => onChange({ dateValue: e.target.value.toUpperCase() })}
            placeholder={
              isSSA
                ? 'e.g. 15th JAN, 2024'
                : isLCM
                ? 'e.g. 22th OCT, 2027'
                : 'e.g. 31st DEC, 2027'
            }
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white uppercase font-mono"
          />
        </div>

        {/* 6. BLOOD GROUP */}
        <div>
          <label className="block font-bold text-gray-800 mb-1">Blood Group:</label>
          <select
            value={data.bloodGroup}
            onChange={(e) => onChange({ bloodGroup: e.target.value as BloodGroup })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white"
          >
            {BLOOD_GROUPS.map((bg) => (
              <option key={bg} value={bg}>
                {bg}
              </option>
            ))}
          </select>
        </div>

        {/* 7. PASSPORT PHOTOGRAPH WITH ZOOM 0-100% SLIDER */}
        <div className="border border-gray-200 rounded-xl p-3.5 bg-gray-50 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-gray-800 text-xs flex items-center gap-1.5">
              <Scissors className="w-3.5 h-3.5 text-blue-600" />
              Passport Photograph (0–100% Zoom Fit)
            </span>
            {data.photoUrl && (
              <span className="text-[10px] font-mono font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                Zoom: {Math.round(zoomPercent)}%
              </span>
            )}
          </div>

          <input
            ref={photoInputRef}
            type="file"
            accept="image/png, image/jpeg, image/jpg"
            onChange={handlePhotoUpload}
            className="hidden"
          />

          {data.photoUrl ? (
            <div className="space-y-2">
              {/* Photo Fit Mode (Section 3: contain, cover, manual) */}
              <div className="bg-white p-2.5 rounded-lg border border-gray-200 space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-gray-700">Photo Fit Mode:</span>
                  <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                    {(data.photoFitMode || 'contain') === 'contain'
                      ? 'Fit Entire (Default — No Head Clipping)'
                      : data.photoFitMode === 'cover'
                      ? 'Fill Frame (Cropped Edges)'
                      : 'Manual Crop & Pan'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <button
                    type="button"
                    onClick={() => onChange({ photoFitMode: 'contain' })}
                    className={`py-1.5 px-1.5 rounded-lg text-[10.5px] font-bold border transition-colors flex items-center justify-center gap-1 ${
                      (data.photoFitMode || 'contain') === 'contain'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <Minimize className="w-3 h-3" />
                    <span>Fit Entire</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onChange({ photoFitMode: 'cover' })}
                    className={`py-1.5 px-1.5 rounded-lg text-[10.5px] font-bold border transition-colors flex items-center justify-center gap-1 ${
                      data.photoFitMode === 'cover'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <Maximize className="w-3 h-3" />
                    <span>Fill Frame</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onChange({ photoFitMode: 'manual' })}
                    className={`py-1.5 px-1.5 rounded-lg text-[10.5px] font-bold border transition-colors flex items-center justify-center gap-1 ${
                      data.photoFitMode === 'manual'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <Sliders className="w-3 h-3" />
                    <span>Manual</span>
                  </button>
                </div>
              </div>

              {/* Zoom Scale Slider (0% to 100%) */}
              <div className="bg-white p-2.5 rounded-lg border border-gray-200">
                <div className="flex justify-between items-center text-[11px] mb-1">
                  <span className="text-gray-600 font-semibold flex items-center gap-1">
                    <ZoomIn className="w-3 h-3 text-blue-600" />
                    Zoom Fit Slider:
                  </span>
                  <span className="font-mono font-bold text-gray-900">
                    {Math.round(zoomPercent)}% {zoomPercent === 100 ? '(Normal Fit)' : ''}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <ZoomOut className="w-3.5 h-3.5 text-gray-400" />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={zoomPercent}
                    onChange={(e) => handleZoomSliderChange(parseInt(e.target.value, 10))}
                    className="w-full accent-blue-600 cursor-pointer h-1.5 bg-gray-200 rounded"
                  />
                  <ZoomIn className="w-3.5 h-3.5 text-gray-400" />
                </div>
              </div>

              {/* Actions: Fine Adjust / Reset / Remove */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onOpenPhotoCropper}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold py-1.5 px-2 rounded-lg border border-blue-200 transition-colors text-xs"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  Full Alignment &amp; Pan
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onChange({
                      photoFitMode: 'contain',
                      photoZoomPercent: 100,
                      photoScale: 1,
                      photoX: 0,
                      photoY: 0,
                      photoRotation: 0,
                    })
                  }
                  className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg border border-gray-200 text-[11px] font-medium"
                  title="Reset to 100% Fit & Center"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => onChange({ photoUrl: null })}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition-colors"
                  title="Remove Photo"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                className="flex-1 flex items-center justify-center gap-1.5 bg-white hover:bg-gray-100 text-gray-700 font-semibold py-2 px-3 rounded-lg border border-gray-300 transition-colors text-xs shadow-xs"
              >
                <Upload className="w-3.5 h-3.5 text-blue-600" />
                Upload Photo
              </button>
              <button
                type="button"
                onClick={() =>
                  onChange({
                    photoUrl: '/assets/sample_photo.png',
                    photoZoomPercent: 100,
                    photoScale: 1,
                    photoX: 0,
                    photoY: 0,
                    photoRotation: 0,
                  })
                }
                className="bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium py-2 px-2.5 rounded-lg border border-gray-200 transition-colors text-[11px]"
                title="Use sample portrait photo"
              >
                Sample
              </button>
            </div>
          )}
        </div>

        {/* 8. HOLDER SIGNATURE */}
        <div className="border border-gray-200 rounded-xl p-3.5 bg-gray-50 flex flex-col justify-between">
          <div>
            <span className="font-bold text-gray-800 block text-xs mb-1">
              Holder Signature
            </span>
            <p className="text-[10.5px] text-gray-500 mb-2">
              Draw digital signature or upload PNG/JPG
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <input
              ref={signatureInputRef}
              type="file"
              accept="image/png, image/jpeg, image/jpg"
              onChange={handleSignatureUpload}
              className="hidden"
            />

            {data.signatureUrl ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onOpenSignaturePad}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold py-1.5 px-2 rounded-lg border border-blue-200 transition-colors text-xs"
                >
                  <PenTool className="w-3.5 h-3.5" />
                  Redraw
                </button>
                <button
                  type="button"
                  onClick={() => onChange({ signatureUrl: null })}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition-colors"
                  title="Remove Signature"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={onOpenSignaturePad}
                  className="flex-1 flex items-center justify-center gap-1 bg-white hover:bg-gray-100 text-gray-700 font-semibold py-2 px-2 rounded-lg border border-gray-300 transition-colors text-xs shadow-xs"
                >
                  <PenTool className="w-3.5 h-3.5 text-blue-600" />
                  Digital Sign Pad
                </button>
                <button
                  type="button"
                  onClick={() => signatureInputRef.current?.click()}
                  className="flex items-center justify-center p-2 bg-white hover:bg-gray-100 text-gray-700 rounded-lg border border-gray-300 transition-colors text-xs shadow-xs"
                  title="Upload signature image"
                >
                  <Upload className="w-3.5 h-3.5 text-gray-600" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Action Buttons (Section 4: Print ID Card Activated) */}
      <div className="p-4 bg-gray-50 border-t border-gray-200 space-y-2.5">
        <div className="grid grid-cols-2 gap-2.5">
          {/* Fully Operational Print Button */}
          <button
            type="button"
            onClick={onPrint}
            className="flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 active:scale-[0.98] text-white font-bold py-2.5 px-4 rounded-xl shadow-md transition-all text-xs cursor-pointer"
            title="Open print workflow for this card"
          >
            <Printer className="w-4 h-4" />
            Print ID Card
          </button>

          {/* Export PDF with Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setExportMenuOpen(!exportMenuOpen)}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-md transition-all text-xs cursor-pointer"
            >
              <FileDown className="w-4 h-4" />
              Export PDF
            </button>

            {exportMenuOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-xl shadow-xl z-30 overflow-hidden divide-y divide-gray-100 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    onExportPDF('both');
                    setExportMenuOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-2 font-semibold text-gray-800 hover:bg-emerald-50 transition-colors"
                >
                  Both Sides (2-Page Standard CR80)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onExportPDF('a4-sheet');
                    setExportMenuOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-2 font-semibold text-gray-800 hover:bg-emerald-50 transition-colors"
                >
                  A4 Print Sheet (Side-by-Side + Crop Marks)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onExportPDF('front');
                    setExportMenuOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-2 font-semibold text-gray-800 hover:bg-emerald-50 transition-colors"
                >
                  Front Side Only
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onExportPDF('back');
                    setExportMenuOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-2 font-semibold text-gray-800 hover:bg-emerald-50 transition-colors"
                >
                  Back Side Only
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Secondary Row: Save Record & Reset Form */}
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onSaveRecord}
            className="flex-1 flex items-center justify-center gap-1.5 bg-white hover:bg-gray-100 text-gray-700 font-semibold py-2 px-3 rounded-lg border border-gray-300 text-xs transition-colors shadow-xs"
          >
            <BookmarkPlus className="w-3.5 h-3.5 text-blue-600" />
            Save to Archive
          </button>

          <button
            type="button"
            onClick={() => {
              if (
                window.confirm(
                  'Are you sure you want to clear this form? All entered information will be reset.'
                )
              ) {
                onReset();
              }
            }}
            className="flex items-center justify-center gap-1 bg-white hover:bg-red-50 text-red-600 hover:text-red-700 font-semibold py-2 px-3 rounded-lg border border-gray-300 hover:border-red-300 text-xs transition-colors shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};
