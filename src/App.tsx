import React, { useState, useEffect, useRef } from 'react';
import {
  IDType,
  IDTypeConfig,
  StaffData,
  DepartmentItem,
  PrintOptions,
  PrintStatus,
  UserRole,
} from './types/idCard';
import { CardTemplate, TemplateTarget } from './types/template';
import {
  DEFAULT_LCM_DATA,
  DEFAULT_SSA_DATA,
  DEFAULT_INTERN_DATA,
  BLANK_DATA,
  INITIAL_DEPARTMENTS,
  DEFAULT_ID_TYPES,
} from './constants/initialData';
import { DEFAULT_TEMPLATES } from './constants/defaultTemplates';
import { Header } from './components/Header';
import { CardPreview } from './components/CardPreview';
import { StaffForm } from './components/StaffForm';
import { PhotoCropperModal } from './components/PhotoCropperModal';
import { SignaturePadModal } from './components/SignaturePadModal';
import { DepartmentManagerModal } from './components/DepartmentManagerModal';
import { SavedRecordsModal } from './components/SavedRecordsModal';
import { PrintSettingsModal } from './components/PrintSettingsModal';
import { ReferenceSampleModal } from './components/ReferenceSampleModal';
import { TemplateEditorModal } from './components/TemplateEditorModal';
import { SampleUploadModal } from './components/SampleUploadModal';
import { PrintConfirmModal } from './components/PrintConfirmModal';
import { PrintContainer } from './components/PrintContainer';
import { exportCardToPDF } from './utils/pdfExport';

// Helper to compute a snapshot hash of printable content
const computeContentSnapshot = (data: StaffData): string => {
  return JSON.stringify({
    idType: data.idType,
    idNumber: data.idNumber,
    fullName: data.fullName,
    department: data.department,
    designation: data.designation,
    dateValue: data.dateValue,
    bloodGroup: data.bloodGroup,
    hasPhoto: !!data.photoUrl,
    hasSig: !!data.signatureUrl,
  });
};

export default function App() {
  // User Role (Administrator or Printing Operator)
  const [userRole, setUserRole] = useState<UserRole>(() => {
    try {
      const saved = localStorage.getItem('fmcbkd_user_role');
      return (saved as UserRole) || 'Administrator';
    } catch {
      return 'Administrator';
    }
  });

  // Separate states for SSA, LCM, and Intern to prevent accidental data loss on switch
  const [selectedIDType, setSelectedIDType] = useState<IDType>('LCM');
  const [ssaData, setSsaData] = useState<StaffData>(DEFAULT_SSA_DATA);
  const [lcmData, setLcmData] = useState<StaffData>(DEFAULT_LCM_DATA);
  const [internData, setInternData] = useState<StaffData>(DEFAULT_INTERN_DATA);

  // ID Types configured (defaults to SSA, LCM, Intern, can add custom types)
  const [idTypes, setIdTypes] = useState<IDTypeConfig[]>(() => {
    try {
      const saved = localStorage.getItem('fmcbkd_id_types');
      return saved ? JSON.parse(saved) : DEFAULT_ID_TYPES;
    } catch {
      return DEFAULT_ID_TYPES;
    }
  });

  // Customized Templates for all 6 targets (persisted in localStorage)
  const [templates, setTemplates] = useState<Record<TemplateTarget, CardTemplate>>(() => {
    try {
      const saved = localStorage.getItem('fmcbkd_templates_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_TEMPLATES, ...parsed };
      }
      return DEFAULT_TEMPLATES;
    } catch {
      return DEFAULT_TEMPLATES;
    }
  });

  // Departments list (persisted in localStorage)
  const [departments, setDepartments] = useState<DepartmentItem[]>(() => {
    try {
      const saved = localStorage.getItem('fmcbkd_departments');
      return saved ? JSON.parse(saved) : INITIAL_DEPARTMENTS;
    } catch {
      return INITIAL_DEPARTMENTS;
    }
  });

  // Saved Records Archive (persisted in localStorage)
  const [records, setRecords] = useState<StaffData[]>(() => {
    try {
      const saved = localStorage.getItem('fmcbkd_saved_records');
      return saved
        ? JSON.parse(saved)
        : [DEFAULT_LCM_DATA, DEFAULT_SSA_DATA, DEFAULT_INTERN_DATA];
    } catch {
      return [DEFAULT_LCM_DATA, DEFAULT_SSA_DATA, DEFAULT_INTERN_DATA];
    }
  });

  // Print & Dimensions Configuration
  const [printOptions, setPrintOptions] = useState<PrintOptions>({
    side: 'both',
    copies: 1,
    showBleedMarks: false,
    colorMode: 'color',
    flipOrientation: 'flip-long-edge',
  });
  const [cardWidthMm, setCardWidthMm] = useState<number>(54);
  const [cardHeightMm, setCardHeightMm] = useState<number>(85.6);

  // Modals State
  const [isPhotoCropperOpen, setIsPhotoCropperOpen] = useState(false);
  const [isSignaturePadOpen, setIsSignaturePadOpen] = useState(false);
  const [isDeptManagerOpen, setIsDeptManagerOpen] = useState(false);
  const [isRecordsOpen, setIsRecordsOpen] = useState(false);
  const [isPrintSettingsOpen, setIsPrintSettingsOpen] = useState(false);
  const [isReferenceModalOpen, setIsReferenceModalOpen] = useState(false);
  const [isTemplateEditorOpen, setIsTemplateEditorOpen] = useState(false);
  const [isSampleManagerOpen, setIsSampleManagerOpen] = useState(false);
  const [isPrintConfirmOpen, setIsPrintConfirmOpen] = useState(false);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('fmcbkd_user_role', userRole);
    } catch (e) {
      console.error(e);
    }
  }, [userRole]);

  useEffect(() => {
    try {
      localStorage.setItem('fmcbkd_templates_v2', JSON.stringify(templates));
    } catch (e) {
      console.error(e);
    }
  }, [templates]);

  useEffect(() => {
    try {
      localStorage.setItem('fmcbkd_departments', JSON.stringify(departments));
    } catch (e) {
      console.error(e);
    }
  }, [departments]);

  useEffect(() => {
    try {
      localStorage.setItem('fmcbkd_saved_records', JSON.stringify(records));
    } catch (e) {
      console.error(e);
    }
  }, [records]);

  useEffect(() => {
    try {
      localStorage.setItem('fmcbkd_id_types', JSON.stringify(idTypes));
    } catch (e) {
      console.error(e);
    }
  }, [idTypes]);

  const handleSaveTemplateReplacement = (target: TemplateTarget, updatedTemplate: CardTemplate) => {
    setTemplates((prev) => ({
      ...prev,
      [target]: updatedTemplate,
    }));
    showToast(`Template for ${target} successfully saved! (v${updatedTemplate.version || 1})`);
  };

  const handleAddNewIDType = (newType: IDTypeConfig) => {
    setIdTypes((prev) => {
      if (prev.some((t) => t.id === newType.id)) {
        return prev.map((t) => (t.id === newType.id ? newType : t));
      }
      return [...prev, newType];
    });
    showToast(`New ID Type "${newType.name || newType.label}" configured!`);
  };

  // Active data based on selected type
  const activeData =
    selectedIDType === 'SSA'
      ? ssaData
      : selectedIDType === 'LCM'
      ? lcmData
      : internData;

  // Active front and back templates
  const frontTemplateKey: TemplateTarget =
    selectedIDType === 'SSA'
      ? 'SSA_FRONT'
      : selectedIDType === 'LCM'
      ? 'LCM_FRONT'
      : 'INTERN_FRONT';

  const backTemplateKey: TemplateTarget =
    selectedIDType === 'SSA'
      ? 'SSA_BACK'
      : selectedIDType === 'LCM'
      ? 'LCM_BACK'
      : 'INTERN_BACK';

  const activeFrontTemplate = templates[frontTemplateKey];
  const activeBackTemplate = templates[backTemplateKey];

  // Update active card data with change tracking for print status
  const handleUpdateActiveData = (updates: Partial<StaffData>) => {
    const updateFn = (prev: StaffData): StaffData => {
      const updated: StaffData = { ...prev, ...updates };
      // If card was printed, check if content changed
      if (prev.printStatus === 'Printed' && prev.lastPrintedContentSnapshot) {
        const newSnapshot = computeContentSnapshot(updated);
        if (newSnapshot !== prev.lastPrintedContentSnapshot) {
          updated.printStatus = 'Not Printed / Updated';
        }
      }
      return updated;
    };

    if (selectedIDType === 'SSA') {
      setSsaData(updateFn);
    } else if (selectedIDType === 'LCM') {
      setLcmData(updateFn);
    } else {
      setInternData(updateFn);
    }
  };

  const handleIDTypeChange = (newType: IDType) => {
    setSelectedIDType(newType);
    showToast(`Switched to ${newType.toUpperCase()} Staff ID Card template`);
  };

  const handleReset = () => {
    const blank: StaffData = {
      ...BLANK_DATA,
      id: `rec-${selectedIDType.toLowerCase()}-${Date.now()}`,
      idType: selectedIDType,
    };
    if (selectedIDType === 'SSA') {
      setSsaData(blank);
    } else if (selectedIDType === 'LCM') {
      setLcmData(blank);
    } else {
      setInternData(blank);
    }
    showToast(`${selectedIDType} form reset to blank`);
  };

  const handleLoadSample = (type: IDType) => {
    if (type === 'SSA') {
      setSsaData(DEFAULT_SSA_DATA);
    } else if (type === 'LCM') {
      setLcmData(DEFAULT_LCM_DATA);
    } else {
      setInternData(DEFAULT_INTERN_DATA);
    }
    showToast(`Loaded reference sample for ${type}`);
  };

  const handleSaveRecord = () => {
    if (!activeData.fullName.trim() || !activeData.idNumber.trim()) {
      alert('Please enter at least a Full Name and ID Number before saving.');
      return;
    }
    const recordId = activeData.id || `rec-${Date.now()}`;
    const newRecord: StaffData = {
      ...activeData,
      id: recordId,
      updatedAt: new Date().toISOString(),
    };

    setRecords((prev) => [
      newRecord,
      ...prev.filter((r) => r.id !== recordId && r.idNumber !== activeData.idNumber),
    ]);
    showToast(`Card for "${activeData.fullName}" saved to archive!`);
  };

  const handleLoadRecord = (record: StaffData) => {
    setSelectedIDType(record.idType);
    if (record.idType === 'SSA') {
      setSsaData(record);
    } else if (record.idType === 'LCM') {
      setLcmData(record);
    } else {
      setInternData(record);
    }
    showToast(`Loaded "${record.fullName}" (${record.idType}) into editor`);
  };

  const handleDeleteRecord = (recordId: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== recordId && r.idNumber !== recordId));
    showToast('Record deleted from archive');
  };

  const handleUpdateRecordStatus = (recordId: string, newStatus: PrintStatus) => {
    setRecords((prev) =>
      prev.map((r) =>
        r.id === recordId || r.idNumber === recordId
          ? {
              ...r,
              printStatus: newStatus,
              lastPrintedDate:
                newStatus === 'Printed' ? new Date().toISOString() : r.lastPrintedDate,
            }
          : r
      )
    );
    if (activeData.id === recordId || activeData.idNumber === recordId) {
      handleUpdateActiveData({ printStatus: newStatus });
    }
    showToast(`Record status updated to: ${newStatus}`);
  };

  // Section 4: Operational Print Workflow
  const handlePrint = () => {
    // 1. Validation
    if (!activeData.fullName?.trim() || !activeData.idNumber?.trim()) {
      alert(
        'Incomplete Staff Information: Please enter at least Full Name and ID Number before printing.'
      );
      return;
    }

    // 2. Invoke native browser print
    window.print();

    // 3. Launch confirmation dialog after print window closes
    setTimeout(() => {
      setIsPrintConfirmOpen(true);
    }, 600);
  };

  // Print directly from Archive table
  const handlePrintRecordDirectly = (rec: StaffData) => {
    handleLoadRecord(rec);
    setTimeout(() => {
      window.print();
      setTimeout(() => {
        setIsPrintConfirmOpen(true);
      }, 600);
    }, 400);
  };

  // Print Confirmed by operator
  const handleConfirmPrintSuccess = (copies: number, notes?: string) => {
    const timestamp = new Date().toISOString();
    const snapshot = computeContentSnapshot(activeData);
    const recordId = activeData.id || `rec-${Date.now()}`;

    const updatedRecord: StaffData = {
      ...activeData,
      id: recordId,
      printStatus: 'Printed',
      lastPrintedDate: timestamp,
      printCount: (activeData.printCount || 0) + copies,
      lastPrintedContentSnapshot: snapshot,
      printHistory: [
        ...(activeData.printHistory || []),
        {
          timestamp,
          copies,
          printedBy: userRole,
          notes: notes || 'Physical card printed successfully',
        },
      ],
    };

    // Update active editor state
    if (selectedIDType === 'SSA') {
      setSsaData(updatedRecord);
    } else if (selectedIDType === 'LCM') {
      setLcmData(updatedRecord);
    } else {
      setInternData(updatedRecord);
    }

    // Upsert into records archive
    setRecords((prev) => [
      updatedRecord,
      ...prev.filter((r) => r.id !== recordId && r.idNumber !== activeData.idNumber),
    ]);

    showToast(`Printed successfully! Archive status updated to "Printed" (${copies} copy)`);
  };

  const handleReportPrintFailure = (reason: string) => {
    showToast(`Print canceled or failed: ${reason}. Status remains "Not Printed".`);
  };

  // Export PDF
  const handleExportPDF = async (side: 'both' | 'front' | 'back' | 'a4-sheet') => {
    try {
      showToast('Generating high-resolution PDF...');
      const cleanName = (activeData.fullName || 'STAFF')
        .replace(/[^a-zA-Z0-9]/g, '_')
        .toUpperCase();
      const cleanID = (activeData.idNumber || 'CARD').replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `FMCBKD_${activeData.idType.toUpperCase()}_${cleanID}_${cleanName}.pdf`;

      await exportCardToPDF({
        frontElementId: 'fmc-card-front',
        backElementId: 'fmc-card-back',
        exportSide: side,
        fileName: filename,
        cardWidthMm,
        cardHeightMm,
      });
      showToast('PDF downloaded successfully!');
    } catch (err) {
      console.error('PDF export failed:', err);
      alert('Failed to export PDF. Please ensure card images are loaded.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 z-50 bg-gray-900 text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2 border border-gray-700 animate-fade-in print:hidden">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          {toastMessage}
        </div>
      )}

      {/* Institutional Header with Role & Template Editor Access */}
      <Header
        selectedIDType={selectedIDType}
        userRole={userRole}
        onToggleUserRole={() => {
          const next = userRole === 'Administrator' ? 'Printing Operator' : 'Administrator';
          setUserRole(next);
          showToast(`Switched mode to: ${next}`);
        }}
        onOpenRecords={() => setIsRecordsOpen(true)}
        onOpenDepartments={() => setIsDeptManagerOpen(true)}
        onOpenPrintSettings={() => setIsPrintSettingsOpen(true)}
        onOpenReferenceModal={() => setIsReferenceModalOpen(true)}
        onOpenTemplateEditor={() => setIsTemplateEditorOpen(true)}
        onOpenSampleManager={() => setIsSampleManagerOpen(true)}
      />

      {/* Main Two-Column Workstation */}
      <main
        id="app-screen"
        className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 print:hidden"
      >
        {/* LEFT COLUMN: LIVE CARD PREVIEW (7 cols on desktop) */}
        <div className="lg:col-span-7 flex flex-col">
          <CardPreview
            data={activeData}
            showBleed={printOptions.showBleedMarks}
            onToggleBleed={() =>
              setPrintOptions((prev) => ({
                ...prev,
                showBleedMarks: !prev.showBleedMarks,
              }))
            }
            onPrint={handlePrint}
            onOpenTemplateEditor={() => setIsTemplateEditorOpen(true)}
            frontTemplate={activeFrontTemplate}
            backTemplate={activeBackTemplate}
          />
        </div>

        {/* RIGHT COLUMN: DATA ENTRY FORM (5 cols on desktop) */}
        <div className="lg:col-span-5 flex flex-col">
          <StaffForm
            data={activeData}
            onChange={handleUpdateActiveData}
            onIDTypeChange={handleIDTypeChange}
            idTypes={idTypes}
            departments={departments}
            onOpenDepartments={() => setIsDeptManagerOpen(true)}
            onOpenPhotoCropper={() => setIsPhotoCropperOpen(true)}
            onOpenSignaturePad={() => setIsSignaturePadOpen(true)}
            onOpenSampleManager={() => setIsSampleManagerOpen(true)}
            onPrint={handlePrint}
            onExportPDF={handleExportPDF}
            onReset={handleReset}
            onSaveRecord={handleSaveRecord}
            onLoadSample={handleLoadSample}
          />
        </div>
      </main>

      {/* Dedicated Print Container for Browser window.print() */}
      <PrintContainer
        data={activeData}
        printOptions={printOptions}
        cardWidthMm={cardWidthMm}
        cardHeightMm={cardHeightMm}
        frontTemplate={activeFrontTemplate}
        backTemplate={activeBackTemplate}
      />

      {/* Modals & Dialogs */}
      <PhotoCropperModal
        isOpen={isPhotoCropperOpen}
        photoUrl={activeData.photoUrl}
        fitMode={activeData.photoFitMode || 'contain'}
        zoomPercent={activeData.photoZoomPercent ?? 100}
        panX={activeData.photoX || 0}
        panY={activeData.photoY || 0}
        rotation={activeData.photoRotation || 0}
        bgColor={activeData.photoBgColor || '#ffffff'}
        onUpdate={(updates) => handleUpdateActiveData(updates)}
        onClose={() => setIsPhotoCropperOpen(false)}
        onReset={() =>
          handleUpdateActiveData({
            photoFitMode: 'contain',
            photoZoomPercent: 100,
            photoScale: 1,
            photoX: 0,
            photoY: 0,
            photoRotation: 0,
            photoBgColor: '#ffffff',
          })
        }
      />

      <SignaturePadModal
        isOpen={isSignaturePadOpen}
        onSave={(dataUrl) => handleUpdateActiveData({ signatureUrl: dataUrl })}
        onClose={() => setIsSignaturePadOpen(false)}
      />

      <DepartmentManagerModal
        isOpen={isDeptManagerOpen}
        departments={departments}
        onUpdateDepartments={setDepartments}
        onClose={() => setIsDeptManagerOpen(false)}
      />

      <SavedRecordsModal
        isOpen={isRecordsOpen}
        records={records}
        onLoadRecord={handleLoadRecord}
        onDeleteRecord={handleDeleteRecord}
        onUpdateRecordStatus={handleUpdateRecordStatus}
        onPrintRecordDirectly={handlePrintRecordDirectly}
        onImportRecords={(newRecords) =>
          setRecords((prev) => [...newRecords, ...prev])
        }
        onClose={() => setIsRecordsOpen(false)}
      />

      <PrintSettingsModal
        isOpen={isPrintSettingsOpen}
        printOptions={printOptions}
        cardWidthMm={cardWidthMm}
        cardHeightMm={cardHeightMm}
        onUpdatePrintOptions={(opts) =>
          setPrintOptions((prev) => ({ ...prev, ...opts }))
        }
        onUpdateDimensions={(w, h) => {
          setCardWidthMm(w);
          setCardHeightMm(h);
        }}
        onClose={() => setIsPrintSettingsOpen(false)}
      />

      <ReferenceSampleModal
        isOpen={isReferenceModalOpen}
        onClose={() => setIsReferenceModalOpen(false)}
      />

      {/* Section 3: Visual Drag & Drop Template Editor */}
      <TemplateEditorModal
        isOpen={isTemplateEditorOpen}
        activeTarget={frontTemplateKey}
        templates={templates}
        sampleStaffData={activeData}
        onSaveTemplates={(updated) => {
          setTemplates(updated);
          showToast('Card templates saved successfully! Changes applied to preview and print.');
        }}
        onClose={() => setIsTemplateEditorOpen(false)}
      />

      {/* Advanced Update: Dynamic ID Card Sample Upload & Template Replacement */}
      <SampleUploadModal
        isOpen={isSampleManagerOpen}
        templates={templates}
        idTypes={idTypes}
        activeIDType={selectedIDType}
        onSaveTemplateReplacement={handleSaveTemplateReplacement}
        onAddNewIDType={handleAddNewIDType}
        onClose={() => setIsSampleManagerOpen(false)}
      />

      {/* Section 4: Print Confirmation Dialog */}
      <PrintConfirmModal
        isOpen={isPrintConfirmOpen}
        staffData={activeData}
        copiesPrinted={printOptions.copies || 1}
        onConfirmSuccess={handleConfirmPrintSuccess}
        onReportFailure={handleReportPrintFailure}
        onClose={() => setIsPrintConfirmOpen(false)}
      />
    </div>
  );
}
