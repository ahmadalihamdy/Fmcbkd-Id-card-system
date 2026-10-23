import React, { useState, useRef } from 'react';
import { CardTemplate, TemplateTarget, TemplateElement } from '../types/template';
import { IDType, IDTypeConfig } from '../types/idCard';
import { renderPDFPages, RenderedPDFPage } from '../utils/pdfRenderer';
import {
  Upload,
  FileText,
  Image as ImageIcon,
  Check,
  X,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Eye,
  Layers,
  History,
  Trash2,
  ShieldCheck,
  Plus,
} from 'lucide-react';

interface SampleUploadModalProps {
  isOpen: boolean;
  templates: Record<TemplateTarget, CardTemplate>;
  idTypes: IDTypeConfig[];
  activeIDType: IDType;
  onSaveTemplateReplacement: (target: TemplateTarget, updatedTemplate: CardTemplate) => void;
  onAddNewIDType: (newType: IDTypeConfig) => void;
  onClose: () => void;
}

export const SampleUploadModal: React.FC<SampleUploadModalProps> = ({
  isOpen,
  templates,
  idTypes,
  activeIDType,
  onSaveTemplateReplacement,
  onAddNewIDType,
  onClose,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Workflow steps: 1 = Upload / Select, 2 = Configure & Preview, 3 = History / Version restore
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Upload state
  const [uploadedPages, setUploadedPages] = useState<RenderedPDFPage[]>([]);
  const [selectedPageIndex, setSelectedPageIndex] = useState<number>(0);
  const [uploadedImageSrc, setUploadedImageSrc] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Target assignment
  const [targetIDType, setTargetIDType] = useState<IDType>(activeIDType || 'SSA');
  const [targetSide, setTargetSide] = useState<'front' | 'back'>('front');
  const [mode, setMode] = useState<'replace' | 'new'>('replace');

  // Confirmation before replacing
  const [showReplaceConfirm, setShowReplaceConfirm] = useState<boolean>(false);

  // Add Custom ID Type modal inline
  const [showNewTypeInput, setShowNewTypeInput] = useState<boolean>(false);
  const [newTypeCode, setNewTypeCode] = useState<string>('');
  const [newTypeLabel, setNewTypeLabel] = useState<string>('');

  if (!isOpen) return null;

  // Resolve target key e.g. "SSA_FRONT" or "LCM_BACK"
  const resolvedTargetKey = `${targetIDType.toUpperCase()}_${targetSide.toUpperCase()}` as TemplateTarget;
  const existingTemplate = templates[resolvedTargetKey];

  // Handle File Upload (PDF, PNG, JPG)
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    setIsProcessing(true);

    try {
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        // Multi-page PDF renderer
        const pages = await renderPDFPages(file, 2.5);
        if (pages.length > 0) {
          setUploadedPages(pages);
          setSelectedPageIndex(0);
          setUploadedImageSrc(pages[0].dataUrl);
          setStep(2);
        } else {
          alert('Could not render pages from the uploaded PDF.');
        }
      } else if (file.type.match(/^image\/(png|jpe?g|webp)$/i)) {
        // Image file reader
        const reader = new FileReader();
        reader.onload = (event) => {
          const dataUrl = event.target?.result as string;
          setUploadedPages([]);
          setUploadedImageSrc(dataUrl);
          setStep(2);
        };
        reader.readAsDataURL(file);
      } else {
        alert('Please upload a PDF document or a PNG/JPG/JPEG image.');
      }
    } catch (err) {
      console.error('Error reading ID sample:', err);
      alert('Failed to process file. If uploading PDF, please ensure it is not password-protected.');
    } finally {
      setIsProcessing(false);
      e.target.value = '';
    }
  };

  // Switch selected page when PDF has multiple pages (e.g. Page 1 = Front, Page 2 = Back)
  const handleSelectPage = (index: number) => {
    setSelectedPageIndex(index);
    if (uploadedPages[index]) {
      setUploadedImageSrc(uploadedPages[index].dataUrl);
    }
  };

  // Execute Save / Replace Template
  const handleConfirmSave = () => {
    if (!uploadedImageSrc) return;

    // Build version history snapshot
    const currentVersion = existingTemplate?.version || 1;
    const historySnapshot = existingTemplate
      ? [
          ...(existingTemplate.previousVersions || []),
          {
            version: currentVersion,
            updatedAt: existingTemplate.updatedAt || new Date().toISOString(),
            backgroundTemplateImage: existingTemplate.backgroundTemplateImage,
            useTemplateBg: existingTemplate.useTemplateBg,
            elements: existingTemplate.elements,
            note: `Replaced by operator on ${new Date().toLocaleDateString()}`,
          },
        ]
      : [];

    // Create or update template
    const newTemplate: CardTemplate = {
      target: resolvedTargetKey,
      name: `${targetIDType} Staff ID — ${targetSide === 'front' ? 'Front' : 'Back'}`,
      idType: targetIDType,
      side: targetSide,
      canvasWidth: 340,
      canvasHeight: 540,
      backgroundColor: '#ffffff',
      backgroundTemplateImage: uploadedImageSrc,
      useTemplateBg: true,
      version: currentVersion + 1,
      previousVersions: historySnapshot,
      elements: existingTemplate?.elements || [],
      updatedAt: new Date().toISOString(),
    };

    onSaveTemplateReplacement(resolvedTargetKey, newTemplate);
    setShowReplaceConfirm(false);
    onClose();
  };

  // Restore previous version from history
  const handleRestoreVersion = (versionIdx: number) => {
    if (!existingTemplate?.previousVersions?.[versionIdx]) return;
    const past = existingTemplate.previousVersions[versionIdx];
    if (
      window.confirm(
        `Restore Version ${past.version} from ${new Date(past.updatedAt).toLocaleDateString()}?`
      )
    ) {
      const restored: CardTemplate = {
        ...existingTemplate,
        version: existingTemplate.version + 1,
        backgroundTemplateImage: past.backgroundTemplateImage,
        useTemplateBg: past.useTemplateBg,
        elements: past.elements,
        updatedAt: new Date().toISOString(),
      };
      onSaveTemplateReplacement(resolvedTargetKey, restored);
      onClose();
    }
  };

  // Handle adding custom ID type
  const handleCreateNewType = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTypeCode.trim() || !newTypeLabel.trim()) return;

    const newConfig: IDTypeConfig = {
      id: `type-${newTypeCode.toLowerCase()}-${Date.now()}`,
      label: newTypeLabel.trim(),
      code: newTypeCode.trim().toUpperCase(),
      description: 'Custom Hospital ID Type',
      dateLabel: 'Valid Until',
      dateDefaultFormat: 'validity',
      accentColor: '#1e3a8a',
      isCustom: true,
    };
    onAddNewIDType(newConfig);
    setTargetIDType(newConfig.code);
    setShowNewTypeInput(false);
    setNewTypeCode('');
    setNewTypeLabel('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 select-none">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                ID Card Sample &amp; Template Manager
                <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full uppercase">
                  PDF / PNG / JPG
                </span>
              </h3>
              <p className="text-xs text-gray-500">
                Upload new official hospital sample designs, replace templates, or assign to any ID type
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Step Tabs */}
        <div className="px-6 py-2.5 bg-slate-100 border-b border-gray-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setStep(1)}
              className={`font-bold pb-1 border-b-2 transition-all ${
                step === 1 ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              1. Upload Sample File
            </button>
            <button
              onClick={() => {
                if (uploadedImageSrc) setStep(2);
              }}
              disabled={!uploadedImageSrc}
              className={`font-bold pb-1 border-b-2 transition-all ${
                step === 2
                  ? 'border-blue-600 text-blue-700'
                  : !uploadedImageSrc
                  ? 'opacity-40 border-transparent text-gray-400'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              2. Assign to ID Type &amp; Preview
            </button>
            <button
              onClick={() => setStep(3)}
              className={`font-bold pb-1 border-b-2 transition-all flex items-center gap-1 ${
                step === 3 ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              3. Version History &amp; Backup
            </button>
          </div>

          {existingTemplate && (
            <span className="text-[11px] text-gray-500 font-mono">
              Current: <strong>{existingTemplate.name}</strong> (v{existingTemplate.version || 1})
            </span>
          )}
        </div>

        {/* Body content based on step */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 1 && (
            /* STEP 1: Upload File Area */
            <div className="space-y-6">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,image/png,image/jpeg,image/jpg,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-blue-300 hover:border-blue-500 bg-blue-50/40 hover:bg-blue-50 rounded-xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all shadow-inner group"
              >
                <div className="w-16 h-16 rounded-full bg-blue-100 group-hover:scale-110 text-blue-600 flex items-center justify-center mb-4 transition-transform shadow-xs">
                  <Upload className="w-8 h-8" />
                </div>
                <h4 className="text-base font-bold text-gray-900 mb-1">
                  Click to Browse or Drop Official ID Card Sample
                </h4>
                <p className="text-xs text-gray-500 max-w-md leading-relaxed">
                  Upload an approved <strong>PDF document</strong> (multi-page supported) or a crisp <strong>PNG / JPG image</strong>.
                  The design will be rendered at high resolution and set as the background template.
                </p>
                <div className="flex items-center gap-2 mt-4 text-[11px] font-semibold text-blue-700 bg-white px-3 py-1.5 rounded-full border border-blue-200 shadow-xs">
                  <FileText className="w-3.5 h-3.5" /> PDF (Front/Back Pages) • <ImageIcon className="w-3.5 h-3.5" /> PNG • JPG
                </div>
              </div>

              {isProcessing && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-center text-xs font-bold text-blue-800 animate-pulse">
                  Rendering high-resolution artwork from uploaded document...
                </div>
              )}

              {/* Quick existing template select */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <span className="font-bold text-gray-800 text-xs block mb-2">
                  Or Select Existing Official Template to Inspect / Reassign:
                </span>
                <div className="grid grid-cols-3 gap-2.5">
                  {Object.values(templates).slice(0, 6).map((tmpl) => (
                    <button
                      key={tmpl.target}
                      type="button"
                      onClick={() => {
                        if (tmpl.backgroundTemplateImage) {
                          setUploadedImageSrc(tmpl.backgroundTemplateImage);
                          setTargetIDType(tmpl.idType);
                          setTargetSide(tmpl.side);
                          setStep(2);
                        }
                      }}
                      className="p-2.5 bg-white border border-gray-200 hover:border-blue-400 rounded-lg text-left shadow-xs transition-colors flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-xs text-gray-900">{tmpl.name}</div>
                        <div className="text-[10px] text-gray-500">v{tmpl.version || 1} • {tmpl.elements.length} elements</div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            /* STEP 2: Configure & Preview */
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Left Column: Sample Preview & Multi-page selector (5 cols) */}
              <div className="md:col-span-5 flex flex-col items-center">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Uploaded Sample Preview
                </span>

                {/* PDF Multi-Page selector if PDF has multiple pages */}
                {uploadedPages.length > 1 && (
                  <div className="w-full bg-blue-50 border border-blue-200 rounded-lg p-2.5 mb-3">
                    <span className="text-[11px] font-bold text-blue-900 block mb-1">
                      Multi-Page PDF Detected ({uploadedPages.length} pages):
                    </span>
                    <p className="text-[10.5px] text-blue-800 mb-2">
                      Select which page represents this card side:
                    </p>
                    <div className="flex gap-2">
                      {uploadedPages.map((pg, idx) => (
                        <button
                          key={pg.pageNumber}
                          type="button"
                          onClick={() => handleSelectPage(idx)}
                          className={`flex-1 py-1 px-2 rounded text-xs font-bold transition-all ${
                            selectedPageIndex === idx
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                          }`}
                        >
                          Page {pg.pageNumber} {idx === 0 ? '(Front)' : idx === 1 ? '(Back)' : ''}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Card Canvas Simulator (340x540 aspect ratio) */}
                <div className="w-[200px] h-[318px] bg-white rounded-lg border-2 border-gray-300 shadow-xl overflow-hidden relative flex items-center justify-center">
                  {uploadedImageSrc ? (
                    <img
                      src={uploadedImageSrc}
                      alt="Uploaded ID Sample"
                      className="w-full h-full object-fill pointer-events-none"
                    />
                  ) : (
                    <span className="text-gray-400 text-xs">No preview</span>
                  )}
                  <div className="absolute top-2 right-2 bg-black/70 text-white text-[9px] px-1.5 py-0.5 rounded font-mono">
                    340 × 540
                  </div>
                </div>

                <div className="text-[11px] text-gray-500 mt-3 text-center max-w-xs">
                  This image will be stored as the crisp background design. Dynamic staff fields will be mapped over it.
                </div>
              </div>

              {/* Right Column: Template Assignment Settings (7 cols) */}
              <div className="md:col-span-7 space-y-4 text-xs font-medium text-gray-700">
                {/* 1. Assign to ID Type */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-gray-900 block text-xs">
                      1. Assign this Sample to ID Type:
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowNewTypeInput(!showNewTypeInput)}
                      className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Add New ID Type
                    </button>
                  </div>

                  {/* Add New Type inline form */}
                  {showNewTypeInput && (
                    <form onSubmit={handleCreateNewType} className="bg-white p-3 rounded-lg border border-blue-200 space-y-2">
                      <span className="font-bold text-blue-900 block text-xs">Register New ID Type</span>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Code (e.g. NYSC, DOC)"
                          value={newTypeCode}
                          onChange={(e) => setNewTypeCode(e.target.value.toUpperCase())}
                          className="border border-gray-300 rounded px-2 py-1 text-xs uppercase font-mono"
                        />
                        <input
                          type="text"
                          placeholder="Label (e.g. NYSC Corps Member)"
                          value={newTypeLabel}
                          onChange={(e) => setNewTypeLabel(e.target.value)}
                          className="border border-gray-300 rounded px-2 py-1 text-xs"
                        />
                      </div>
                      <div className="flex justify-end gap-1.5 pt-1">
                        <button
                          type="button"
                          onClick={() => setShowNewTypeInput(false)}
                          className="text-[11px] text-gray-500 px-2 py-1"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="bg-blue-600 text-white font-bold px-3 py-1 rounded text-xs"
                        >
                          Create ID Type
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="grid grid-cols-3 gap-2">
                    {idTypes.map((type) => (
                      <button
                        key={type.code}
                        type="button"
                        onClick={() => setTargetIDType(type.code)}
                        className={`p-2.5 rounded-lg border text-left transition-all ${
                          targetIDType === type.code
                            ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/30'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <div className="font-black text-xs text-gray-900">{type.code}</div>
                        <div className="text-[10px] text-gray-500 truncate">{type.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Front vs Back Card Side */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                  <label className="font-bold text-gray-900 block text-xs">
                    2. Select Card Side:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setTargetSide('front')}
                      className={`p-2.5 rounded-lg border text-left transition-all ${
                        targetSide === 'front'
                          ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/30'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="font-bold text-xs text-gray-900">Front Side</div>
                      <div className="text-[10.5px] text-gray-500">Photograph, Name, Details, Signature</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTargetSide('back')}
                      className={`p-2.5 rounded-lg border text-left transition-all ${
                        targetSide === 'back'
                          ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/30'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="font-bold text-xs text-gray-900">Back Side</div>
                      <div className="text-[10.5px] text-gray-500">QR Code, Property Notice, Chief Security</div>
                    </button>
                  </div>
                </div>

                {/* Replacement Confirmation Notice */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-amber-900 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    Target Template: {resolvedTargetKey}
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    Saving will assign this new artwork to <strong>{targetIDType} ({targetSide.toUpperCase()})</strong>.
                    Existing staff records will NOT be deleted or lost. The previous version will be preserved in version history.
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs text-gray-500 hover:text-gray-800"
                  >
                    ← Back to Upload
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowReplaceConfirm(true)}
                    className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all"
                  >
                    <Check className="w-4 h-4" />
                    Save &amp; Replace Template
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            /* STEP 3: Version History & Backup Restore */
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">
                    Version History &amp; Template Backups ({resolvedTargetKey})
                  </h4>
                  <p className="text-xs text-gray-500">
                    Restore previously saved background samples or layouts
                  </p>
                </div>
              </div>

              {!existingTemplate?.previousVersions || existingTemplate.previousVersions.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-xs">
                  No previous backup versions recorded for {resolvedTargetKey}.
                  Backups are automatically saved every time a template is replaced or updated.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {existingTemplate.previousVersions.map((v, i) => (
                    <div
                      key={v.version}
                      className="flex items-center justify-between p-3.5 bg-gray-50 border border-gray-200 rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                          v{v.version}
                        </div>
                        <div>
                          <div className="font-bold text-xs text-gray-900">
                            Version {v.version} — {new Date(v.updatedAt).toLocaleString()}
                          </div>
                          <div className="text-[10.5px] text-gray-500">
                            {v.note || 'Saved backup'} • {v.elements.length} elements mapped
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRestoreVersion(i)}
                        className="flex items-center gap-1.5 bg-white hover:bg-blue-50 text-blue-700 font-bold text-xs px-3 py-1.5 rounded-lg border border-blue-200 transition-colors shadow-xs"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Restore This Version
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Confirmation Modal before replacing */}
        {showReplaceConfirm && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
            <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-md p-5 space-y-4 animate-in fade-in zoom-in-95">
              <div className="flex items-center gap-2.5 text-amber-600 font-bold text-sm">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Confirm Template Replacement
              </div>
              <p className="text-xs text-gray-700 leading-relaxed">
                Are you sure you want to replace the background template for{' '}
                <strong>{targetIDType} ({targetSide.toUpperCase()})</strong> with this new design?
              </p>
              <p className="text-[11px] text-gray-500">
                A backup snapshot of the current version will be archived automatically in version history so you can revert at any time.
              </p>
              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowReplaceConfirm(false)}
                  className="text-xs font-semibold text-gray-600 px-3 py-1.5"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSave}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-lg shadow-sm"
                >
                  Yes, Replace Template
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
          <span>Supported: Multi-page PDF, PNG, JPG, JPEG</span>
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-800 hover:bg-gray-900 text-white font-semibold px-4 py-2 rounded-lg transition-colors shadow-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
