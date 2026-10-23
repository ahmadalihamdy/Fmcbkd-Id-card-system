import React, { useState, useRef, useEffect } from 'react';
import {
  CardTemplate,
  TemplateElement,
  TemplateTarget,
  ElementType,
} from '../types/template';
import { DEFAULT_TEMPLATES } from '../constants/defaultTemplates';
import {
  X,
  Type,
  Image as ImageIcon,
  Square,
  QrCode,
  Copy,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Trash2,
  Undo2,
  Redo2,
  RotateCcw,
  Save,
  Check,
  Move,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Sparkles,
  Sliders,
  Lock,
  Unlock,
  Grid,
  Layers,
  User,
  CreditCard,
  Building,
  Briefcase,
  Calendar,
  HeartPulse,
  PenTool,
  PlusCircle,
  FileText,
  Palette,
  Shield,
  HelpCircle,
  Upload,
} from 'lucide-react';
import { StaffData, IDTypeConfig } from '../types/idCard';

interface TemplateEditorModalProps {
  isOpen: boolean;
  activeTarget: TemplateTarget;
  templates: Record<TemplateTarget, CardTemplate>;
  sampleStaffData: StaffData;
  idTypes?: IDTypeConfig[];
  onSaveTemplates: (updated: Record<TemplateTarget, CardTemplate>) => void;
  onOpenSampleManager?: () => void;
  onClose: () => void;
}

const FONT_OPTIONS = [
  'Inter',
  'Roboto Condensed',
  'Arial',
  'Helvetica',
  'Times New Roman',
  'Courier New',
  'Georgia',
  'Trebuchet MS',
  'Verdana',
];

interface AvailableFieldItem {
  fieldKey: string;
  type: ElementType;
  label: string;
  prefix?: string;
  defaultW: number;
  defaultH: number;
  icon: React.ReactNode;
  category: 'core' | 'media' | 'utility';
  isDynamic: boolean;
  defaultContent?: string;
}

const AVAILABLE_FIELDS: AvailableFieldItem[] = [
  {
    fieldKey: 'fullName',
    type: 'text',
    label: 'Full Name',
    defaultW: 280,
    defaultH: 24,
    icon: <User className="w-3.5 h-3.5 text-blue-500" />,
    category: 'core',
    isDynamic: true,
  },
  {
    fieldKey: 'idNumber',
    type: 'text',
    label: 'Staff ID Number',
    prefix: 'ID NO: ',
    defaultW: 200,
    defaultH: 20,
    icon: <CreditCard className="w-3.5 h-3.5 text-emerald-500" />,
    category: 'core',
    isDynamic: true,
  },
  {
    fieldKey: 'department',
    type: 'text',
    label: 'Department',
    prefix: 'Department: ',
    defaultW: 280,
    defaultH: 18,
    icon: <Building className="w-3.5 h-3.5 text-purple-500" />,
    category: 'core',
    isDynamic: true,
  },
  {
    fieldKey: 'designation',
    type: 'text',
    label: 'Designation / Cadre',
    prefix: 'Designation: ',
    defaultW: 280,
    defaultH: 18,
    icon: <Briefcase className="w-3.5 h-3.5 text-amber-500" />,
    category: 'core',
    isDynamic: true,
  },
  {
    fieldKey: 'dateValue',
    type: 'text',
    label: 'Date Field (Issue / Expiry)',
    prefix: 'Date: ',
    defaultW: 200,
    defaultH: 18,
    icon: <Calendar className="w-3.5 h-3.5 text-rose-500" />,
    category: 'core',
    isDynamic: true,
  },
  {
    fieldKey: 'bloodGroup',
    type: 'text',
    label: 'Blood Group',
    prefix: 'Blood Group: ',
    defaultW: 160,
    defaultH: 18,
    icon: <HeartPulse className="w-3.5 h-3.5 text-red-500" />,
    category: 'core',
    isDynamic: true,
  },
  {
    fieldKey: 'idType',
    type: 'text',
    label: 'ID Type Label',
    prefix: 'STAFF I.D. CARD ',
    defaultW: 240,
    defaultH: 22,
    icon: <Shield className="w-3.5 h-3.5 text-indigo-500" />,
    category: 'core',
    isDynamic: true,
  },
  {
    fieldKey: 'photoUrl',
    type: 'photo',
    label: 'Passport Photograph',
    defaultW: 136,
    defaultH: 162,
    icon: <User className="w-3.5 h-3.5 text-blue-600" />,
    category: 'media',
    isDynamic: true,
  },
  {
    fieldKey: 'signatureUrl',
    type: 'signature',
    label: 'Holder Signature',
    prefix: 'Holder Signature',
    defaultW: 108,
    defaultH: 42,
    icon: <PenTool className="w-3.5 h-3.5 text-slate-700" />,
    category: 'media',
    isDynamic: true,
  },
  {
    fieldKey: 'qrCode',
    type: 'qr',
    label: 'Dynamic QR Code',
    defaultW: 120,
    defaultH: 120,
    icon: <QrCode className="w-3.5 h-3.5 text-black" />,
    category: 'media',
    isDynamic: true,
  },
  {
    fieldKey: 'logo',
    type: 'logo',
    label: 'Hospital Crest / Logo',
    defaultW: 52,
    defaultH: 52,
    icon: <ImageIcon className="w-3.5 h-3.5 text-teal-600" />,
    category: 'utility',
    isDynamic: false,
    defaultContent: '/assets/card_samples/fmc_logo.png',
  },
  {
    fieldKey: 'customText',
    type: 'text',
    label: 'Custom Text Element',
    defaultW: 220,
    defaultH: 22,
    icon: <Type className="w-3.5 h-3.5 text-blue-400" />,
    category: 'utility',
    isDynamic: false,
    defaultContent: 'Custom Card Text',
  },
  {
    fieldKey: 'maskPatch',
    type: 'maskPatch',
    label: 'Sample Cover Mask Patch',
    defaultW: 160,
    defaultH: 24,
    icon: <Square className="w-3.5 h-3.5 text-gray-500" />,
    category: 'utility',
    isDynamic: false,
    defaultContent: 'Covers placeholder text on uploaded sample',
  },
];

export const TemplateEditorModal: React.FC<TemplateEditorModalProps> = ({
  isOpen,
  activeTarget: initialTarget,
  templates,
  sampleStaffData,
  idTypes = [],
  onSaveTemplates,
  onOpenSampleManager,
  onClose,
}) => {
  const [currentTarget, setCurrentTarget] = useState<TemplateTarget>(initialTarget);
  const [localTemplates, setLocalTemplates] = useState<Record<TemplateTarget, CardTemplate>>(templates);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  // Snap to grid and guide lines
  const [snapToGrid, setSnapToGrid] = useState<boolean>(true);
  const [showGridGuide, setShowGridGuide] = useState<boolean>(false);
  const gridSize = 6;

  // History stack for Undo / Redo
  const [history, setHistory] = useState<Record<TemplateTarget, CardTemplate>[]>([templates]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Dragging and resizing state
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<'se' | 'e' | 's'>('se');
  const dragStartRef = useRef<{
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
    initialW: number;
    initialH: number;
  }>({
    startX: 0,
    startY: 0,
    initialX: 0,
    initialY: 0,
    initialW: 0,
    initialH: 0,
  });

  const canvasRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setCurrentTarget(initialTarget);
      setLocalTemplates(templates);
      setHistory([templates]);
      setHistoryIndex(0);
      setSelectedElementId(null);
    }
  }, [isOpen, initialTarget, templates]);

  if (!isOpen) return null;

  const currentTemplate = localTemplates[currentTarget] || DEFAULT_TEMPLATES.SSA_FRONT;
  const selectedElement = currentTemplate.elements.find((el) => el.id === selectedElementId) || null;

  // Record history snapshot
  const pushHistory = (newTemplates: Record<TemplateTarget, CardTemplate>) => {
    const updated = history.slice(0, historyIndex + 1);
    updated.push(newTemplates);
    setHistory(updated);
    setHistoryIndex(updated.length - 1);
    setLocalTemplates(newTemplates);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIdx = historyIndex - 1;
      setHistoryIndex(newIdx);
      setLocalTemplates(history[newIdx]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIdx = historyIndex + 1;
      setHistoryIndex(newIdx);
      setLocalTemplates(history[newIdx]);
    }
  };

  // Update elements in current template
  const updateElements = (newElements: TemplateElement[]) => {
    const updatedTemplate: CardTemplate = {
      ...currentTemplate,
      elements: newElements,
      updatedAt: new Date().toISOString(),
    };
    const updatedAll = {
      ...localTemplates,
      [currentTarget]: updatedTemplate,
    };
    pushHistory(updatedAll);
  };

  // Update a single element property
  const updateSelectedElement = (updates: Partial<TemplateElement>) => {
    if (!selectedElement) return;
    const newElements = currentTemplate.elements.map((el) =>
      el.id === selectedElement.id ? { ...el, ...updates } : el
    );
    updateElements(newElements);
  };

  // Update style of selected element
  const updateSelectedStyle = (styleUpdates: Partial<TemplateElement['style']>) => {
    if (!selectedElement) return;
    const newElements = currentTemplate.elements.map((el) =>
      el.id === selectedElement.id
        ? { ...el, style: { ...el.style, ...styleUpdates } }
        : el
    );
    updateElements(newElements);
  };

  // Snap utility
  const snapVal = (val: number) => (snapToGrid ? Math.round(val / gridSize) * gridSize : Math.round(val));

  // Section 4.B: Add or Drop Field onto Canvas
  const handleAddFieldToCanvas = (field: AvailableFieldItem, dropX?: number, dropY?: number) => {
    const newId = `el-${field.fieldKey}-${Date.now()}`;
    const xPos = dropX !== undefined ? snapVal(dropX) : snapVal(30);
    const yPos = dropY !== undefined ? snapVal(dropY) : snapVal(180);

    const isMask = field.type === 'maskPatch';

    const newEl: TemplateElement = {
      id: newId,
      type: field.type,
      label: field.label,
      isDynamic: field.isDynamic,
      fieldKey: field.fieldKey,
      prefix: field.prefix,
      content: field.defaultContent || (isMask ? '' : undefined),
      x: Math.max(0, Math.min(340 - field.defaultW, xPos)),
      y: Math.max(0, Math.min(540 - field.defaultH, yPos)),
      width: field.defaultW,
      height: field.defaultH,
      zIndex: isMask ? 1 : currentTemplate.elements.length + 1,
      visible: true,
      locked: false,
      photoFitMode: field.type === 'photo' ? 'contain' : undefined,
      style: {
        fontFamily: 'Inter',
        fontSize: field.fieldKey === 'fullName' ? 14 : 11,
        fontWeight: field.fieldKey === 'fullName' ? 'black' : 'bold',
        fontStyle: 'normal',
        textDecoration: 'none',
        textAlign: field.fieldKey === 'fullName' ? 'center' : 'left',
        color: field.fieldKey === 'idType' ? '#ffffff' : '#000000',
        backgroundColor:
          isMask
            ? '#ffffff'
            : field.fieldKey === 'idType'
            ? '#b70000'
            : 'transparent',
        letterSpacing: 0,
        lineHeight: 1.2,
        rotation: 0,
        opacity: 1,
        borderRadius: isMask ? 0 : field.fieldKey === 'idType' ? 3 : 0,
        borderColor: isMask ? 'transparent' : field.type === 'photo' ? '#b70000' : 'transparent',
        borderWidth: field.type === 'photo' ? 2 : 0,
        borderStyle: field.type === 'photo' ? 'solid' : 'none',
        padding: field.type === 'photo' ? 0 : 0,
      },
    };

    updateElements([...currentTemplate.elements, newEl]);
    setSelectedElementId(newId);
  };

  // Drag-and-drop from sidebar onto canvas
  const handleFieldDragStart = (e: React.DragEvent, field: AvailableFieldItem) => {
    e.dataTransfer.setData('application/json', JSON.stringify(field));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleCanvasDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dataStr = e.dataTransfer.getData('application/json');
    if (!dataStr) return;

    try {
      const field = JSON.parse(dataStr) as AvailableFieldItem;
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const dropX = e.clientX - rect.left - field.defaultW / 2;
        const dropY = e.clientY - rect.top - field.defaultH / 2;
        handleAddFieldToCanvas(field, dropX, dropY);
      }
    } catch (err) {
      console.error('Drop parse error:', err);
    }
  };

  // Duplicate, Delete, Layer Order
  const handleDuplicate = () => {
    if (!selectedElement) return;
    const newId = `el-dup-${Date.now()}`;
    const duplicate: TemplateElement = {
      ...selectedElement,
      id: newId,
      label: `${selectedElement.label} (Copy)`,
      x: snapVal(Math.min(selectedElement.x + 12, 300)),
      y: snapVal(Math.min(selectedElement.y + 12, 500)),
      zIndex: currentTemplate.elements.length + 1,
    };
    updateElements([...currentTemplate.elements, duplicate]);
    setSelectedElementId(newId);
  };

  const handleDelete = () => {
    if (!selectedElement) return;
    if (selectedElement.isDynamic && (selectedElement.fieldKey === 'fullName' || selectedElement.fieldKey === 'photoUrl')) {
      if (!window.confirm(`Warning: "${selectedElement.label}" is a core ID field. Are you sure you want to remove it from this template?`)) {
        return;
      }
    }
    updateElements(currentTemplate.elements.filter((el) => el.id !== selectedElement.id));
    setSelectedElementId(null);
  };

  const handleMoveZ = (dir: 'up' | 'down') => {
    if (!selectedElement) return;
    const currentZ = selectedElement.zIndex || 1;
    const newZ = dir === 'up' ? currentZ + 1 : Math.max(1, currentZ - 1);
    updateSelectedElement({ zIndex: newZ });
  };

  const handleToggleLock = () => {
    if (!selectedElement) return;
    updateSelectedElement({ locked: !selectedElement.locked });
  };

  const handleToggleVisibility = () => {
    if (!selectedElement) return;
    updateSelectedElement({ visible: !selectedElement.visible });
  };

  const handleCenterHorizontal = () => {
    if (!selectedElement) return;
    const newX = snapVal((340 - selectedElement.width) / 2);
    updateSelectedElement({ x: Math.max(0, newX) });
  };

  const handleResetTemplate = () => {
    if (
      window.confirm(
        `Reset ${currentTemplate.name} to FMC Birnin Kudu original specification? All custom coordinates will be restored.`
      )
    ) {
      const defaultTemplate = DEFAULT_TEMPLATES[currentTarget] || DEFAULT_TEMPLATES.SSA_FRONT;
      const updated = {
        ...localTemplates,
        [currentTarget]: defaultTemplate,
      };
      pushHistory(updated);
      setSelectedElementId(null);
    }
  };

  const handleSaveAndClose = () => {
    onSaveTemplates(localTemplates);
    onClose();
  };

  // Canvas Drag & Resize handlers
  const handleElementMouseDown = (e: React.MouseEvent, el: TemplateElement) => {
    e.stopPropagation();
    setSelectedElementId(el.id);
    if (el.locked) return;

    setIsDragging(true);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: el.x,
      initialY: el.y,
      initialW: el.width,
      initialH: el.height,
    };
  };

  const handleResizeMouseDown = (e: React.MouseEvent, dir: 'se' | 'e' | 's') => {
    e.stopPropagation();
    if (!selectedElement || selectedElement.locked) return;
    setIsResizing(true);
    setResizeDirection(dir);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: selectedElement.x,
      initialY: selectedElement.y,
      initialW: selectedElement.width,
      initialH: selectedElement.height,
    };
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (!selectedElement || selectedElement.locked) return;

    if (isDragging) {
      const deltaX = e.clientX - dragStartRef.current.startX;
      const deltaY = e.clientY - dragStartRef.current.startY;

      const rawX = dragStartRef.current.initialX + deltaX;
      const rawY = dragStartRef.current.initialY + deltaY;

      const newX = snapVal(Math.max(0, Math.min(340 - selectedElement.width, rawX)));
      const newY = snapVal(Math.max(0, Math.min(540 - selectedElement.height, rawY)));

      const newElements = currentTemplate.elements.map((el) =>
        el.id === selectedElement.id ? { ...el, x: newX, y: newY } : el
      );
      setLocalTemplates({
        ...localTemplates,
        [currentTarget]: { ...currentTemplate, elements: newElements },
      });
    } else if (isResizing) {
      const deltaX = e.clientX - dragStartRef.current.startX;
      const deltaY = e.clientY - dragStartRef.current.startY;

      let newW = dragStartRef.current.initialW;
      let newH = dragStartRef.current.initialH;

      if (resizeDirection === 'se' || resizeDirection === 'e') {
        newW = snapVal(Math.max(20, Math.min(340 - selectedElement.x, dragStartRef.current.initialW + deltaX)));
      }
      if (resizeDirection === 'se' || resizeDirection === 's') {
        newH = snapVal(Math.max(12, Math.min(540 - selectedElement.y, dragStartRef.current.initialH + deltaY)));
      }

      const newElements = currentTemplate.elements.map((el) =>
        el.id === selectedElement.id ? { ...el, width: newW, height: newH } : el
      );
      setLocalTemplates({
        ...localTemplates,
        [currentTarget]: { ...currentTemplate, elements: newElements },
      });
    }
  };

  const handleCanvasMouseUp = () => {
    if (isDragging || isResizing) {
      setIsDragging(false);
      setIsResizing(false);
      pushHistory(localTemplates);
    }
  };

  // Helper to resolve element preview value using current form data
  const renderElementValue = (el: TemplateElement) => {
    if (el.content && !el.isDynamic) return el.content;
    const prefix = el.prefix || '';
    switch (el.fieldKey) {
      case 'idNumber':
        return `${prefix}${sampleStaffData.idNumber || '2431'}`;
      case 'fullName':
        return sampleStaffData.fullName || "SHAFI'U HALADU";
      case 'department':
        return `${prefix}${sampleStaffData.department || 'NURSING SERVICES'}`;
      case 'designation':
        return `${prefix}${sampleStaffData.designation || 'HEALTH ATTENDANT'}`;
      case 'dateValue':
        return `${prefix}${sampleStaffData.dateValue || '22th OCT, 2027'}`;
      case 'bloodGroup':
        return `${prefix}${sampleStaffData.bloodGroup || 'B+'}`;
      case 'idType':
        return `${prefix}${currentTemplate.idType.toUpperCase()}`;
      default:
        return el.content || el.label;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-2 select-none">
      <div className="bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-700 w-full max-w-[96vw] h-[95vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Top Header */}
        <div className="px-5 py-2.5 bg-slate-800 border-b border-slate-700 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black tracking-wide text-white flex items-center gap-2">
                Field-to-Template Assignment &amp; Card Layout Editor
                <span className="text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/40 px-2 py-0.5 rounded">
                  Drag &amp; Drop Form Fields
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Drag form inputs onto the canvas, reposition elements, cover sample placeholders, and format fonts
              </p>
            </div>
          </div>

          {/* Template Target Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold">Active Template:</span>
            <select
              value={currentTarget}
              onChange={(e) => {
                setCurrentTarget(e.target.value as TemplateTarget);
                setSelectedElementId(null);
              }}
              className="bg-slate-700 text-white border border-slate-600 rounded-lg px-3 py-1.5 text-xs font-bold focus:ring-2 focus:ring-blue-500 focus:outline-hidden cursor-pointer"
            >
              {Object.keys(localTemplates).map((key) => (
                <option key={key} value={key}>
                  {localTemplates[key]?.name || key}
                </option>
              ))}
            </select>

            {onOpenSampleManager && (
              <button
                type="button"
                onClick={onOpenSampleManager}
                className="flex items-center gap-1.5 bg-blue-600/80 hover:bg-blue-600 text-white font-bold text-xs px-2.5 py-1.5 rounded-lg border border-blue-400/50 transition-colors shadow-xs"
                title="Upload new ID card PDF/image sample or replace template background"
              >
                <Upload className="w-3.5 h-3.5" />
                Upload New Sample
              </button>
            )}
          </div>

          {/* Undo / Redo / Close */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className="p-1.5 rounded text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-40 transition-colors"
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className="p-1.5 rounded text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-40 transition-colors"
              title="Redo"
            >
              <Redo2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-700 transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sub-Toolbar */}
        <div className="px-5 py-2 bg-slate-800/90 border-b border-slate-700 flex flex-wrap items-center justify-between gap-2 text-xs">
          {/* Alignment & Grid controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSnapToGrid(!snapToGrid)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-semibold transition-colors ${
                snapToGrid
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-400 hover:text-white'
              }`}
              title="Snap element positions to grid"
            >
              <Grid className="w-3.5 h-3.5" />
              Snap Grid ({gridSize}px)
            </button>

            {selectedElement && (
              <>
                <button
                  type="button"
                  onClick={handleCenterHorizontal}
                  className="bg-slate-700 hover:bg-slate-600 text-slate-200 px-2 py-1 rounded-md font-medium"
                  title="Center Horizontally on Card"
                >
                  Center Horiz.
                </button>
                <button
                  type="button"
                  onClick={handleToggleLock}
                  className={`p-1 rounded ${selectedElement.locked ? 'bg-amber-600 text-white' : 'bg-slate-700 text-slate-300'}`}
                  title={selectedElement.locked ? 'Unlock Position' : 'Lock Position'}
                >
                  {selectedElement.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                </button>
              </>
            )}
          </div>

          {/* Background sample toggle */}
          <div className="flex items-center gap-2">
            {currentTemplate.backgroundTemplateImage && (
              <button
                type="button"
                onClick={() => {
                  const updated: CardTemplate = {
                    ...currentTemplate,
                    useTemplateBg: !currentTemplate.useTemplateBg,
                  };
                  pushHistory({ ...localTemplates, [currentTarget]: updated });
                }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-semibold transition-colors ${
                  currentTemplate.useTemplateBg
                    ? 'bg-emerald-900/60 text-emerald-200 border border-emerald-600'
                    : 'bg-slate-700 text-slate-400'
                }`}
                title="Toggle sample artwork background visibility"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                {currentTemplate.useTemplateBg ? 'Sample Artwork ON' : 'Sample Artwork OFF'}
              </button>
            )}

            <button
              onClick={handleResetTemplate}
              className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Layout
            </button>
          </div>
        </div>

        {/* Main Work Area: 3 Columns
            Col 1: Available Form Fields Panel (Left, 240px)
            Col 2: Card Canvas Area (Center, Flex-1)
            Col 3: Properties & Formatting Panel (Right, 280px)
        */}
        <div className="flex-1 flex overflow-hidden">
          {/* ================= COLUMN 1: AVAILABLE FORM FIELDS ================= */}
          <div className="w-60 bg-slate-800/95 border-r border-slate-700 p-3.5 flex flex-col overflow-y-auto text-xs select-none">
            <div className="border-b border-slate-700 pb-2 mb-3">
              <span className="font-bold text-white text-xs block">
                Available Form Fields
              </span>
              <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">
                Drag onto canvas or click &quot;+&quot; to assign to card
              </p>
            </div>

            {/* Core Fields */}
            <div className="space-y-1.5 flex-1 overflow-y-auto">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block pt-1">
                Staff Identity Fields
              </span>
              {AVAILABLE_FIELDS.filter((f) => f.category === 'core').map((field) => (
                <div
                  key={field.fieldKey}
                  draggable
                  onDragStart={(e) => handleFieldDragStart(e, field)}
                  onClick={() => handleAddFieldToCanvas(field)}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-700/80 hover:bg-blue-600/30 border border-slate-600/70 hover:border-blue-400 text-slate-200 hover:text-white cursor-grab active:cursor-grabbing transition-all group"
                  title="Drag onto card canvas or click to place"
                >
                  <div className="flex items-center gap-2 truncate">
                    {field.icon}
                    <span className="font-semibold text-[11px] truncate">{field.label}</span>
                  </div>
                  <PlusCircle className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-300 shrink-0" />
                </div>
              ))}

              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block pt-2.5">
                Media &amp; Verification
              </span>
              {AVAILABLE_FIELDS.filter((f) => f.category === 'media').map((field) => (
                <div
                  key={field.fieldKey}
                  draggable
                  onDragStart={(e) => handleFieldDragStart(e, field)}
                  onClick={() => handleAddFieldToCanvas(field)}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-700/80 hover:bg-blue-600/30 border border-slate-600/70 hover:border-blue-400 text-slate-200 hover:text-white cursor-grab active:cursor-grabbing transition-all group"
                  title="Drag onto card canvas or click to place"
                >
                  <div className="flex items-center gap-2 truncate">
                    {field.icon}
                    <span className="font-semibold text-[11px] truncate">{field.label}</span>
                  </div>
                  <PlusCircle className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-300 shrink-0" />
                </div>
              ))}

              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block pt-2.5">
                Artwork &amp; Cover Masks
              </span>
              {AVAILABLE_FIELDS.filter((f) => f.category === 'utility').map((field) => (
                <div
                  key={field.fieldKey}
                  draggable
                  onDragStart={(e) => handleFieldDragStart(e, field)}
                  onClick={() => handleAddFieldToCanvas(field)}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-700/80 hover:bg-blue-600/30 border border-slate-600/70 hover:border-blue-400 text-slate-200 hover:text-white cursor-grab active:cursor-grabbing transition-all group"
                  title={field.type === 'maskPatch' ? 'Place over old sample text to cover it' : 'Drag onto card'}
                >
                  <div className="flex items-center gap-2 truncate">
                    {field.icon}
                    <span className="font-semibold text-[11px] truncate">{field.label}</span>
                  </div>
                  <PlusCircle className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-300 shrink-0" />
                </div>
              ))}
            </div>

            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-700 mt-2 text-[10px] text-slate-400 leading-tight">
              <strong>Mask Patch Tip:</strong> Drop a &quot;Sample Cover Mask Patch&quot; to hide placeholder text on uploaded sample images.
            </div>
          </div>

          {/* ================= COLUMN 2: CARD CANVAS WORK AREA ================= */}
          <div
            className="flex-1 bg-slate-950 p-6 flex items-center justify-center overflow-auto pattern-grid relative select-none"
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onDragOver={handleCanvasDragOver}
            onDrop={handleCanvasDrop}
            onClick={() => setSelectedElementId(null)}
          >
            {/* The 340px x 540px ID Card Canvas */}
            <div
              ref={canvasRef}
              className="w-[340px] h-[540px] bg-white rounded-[12px] shadow-2xl relative overflow-hidden border-2 border-slate-500/70 text-black shrink-0 font-sans cursor-default"
              style={{
                backgroundColor: currentTemplate.backgroundColor,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Optional Background PDF Artwork */}
              {currentTemplate.useTemplateBg && currentTemplate.backgroundTemplateImage && (
                <img
                  src={currentTemplate.backgroundTemplateImage}
                  alt="Template Base"
                  className="absolute inset-0 w-full h-full object-fill pointer-events-none z-0"
                />
              )}

              {/* Elements rendered with exact coordinates */}
              {currentTemplate.elements.map((el) => {
                if (!el.visible) return null;
                const isSelected = selectedElementId === el.id;

                return (
                  <div
                    key={el.id}
                    onMouseDown={(e) => handleElementMouseDown(e, el)}
                    className={`absolute select-none transition-shadow ${
                      el.locked ? 'cursor-not-allowed' : 'cursor-move'
                    } ${
                      isSelected
                        ? 'ring-2 ring-blue-600 ring-offset-1 z-40 shadow-lg'
                        : 'hover:ring-1 hover:ring-blue-400/50'
                    }`}
                    style={{
                      left: `${el.x}px`,
                      top: `${el.y}px`,
                      width: `${el.width}px`,
                      height: `${el.height}px`,
                      zIndex: el.zIndex,
                      backgroundColor: el.style.backgroundColor || 'transparent',
                      color: el.style.color || '#000000',
                      fontFamily: el.style.fontFamily || 'Inter',
                      fontSize: `${el.style.fontSize}px`,
                      fontWeight: el.style.fontWeight || 'normal',
                      fontStyle: el.style.fontStyle || 'normal',
                      textDecoration: el.style.textDecoration || 'none',
                      textAlign: el.style.textAlign || 'left',
                      letterSpacing: `${el.style.letterSpacing || 0}px`,
                      lineHeight: el.style.lineHeight || 1.2,
                      transform: `rotate(${el.style.rotation || 0}deg)`,
                      opacity: el.style.opacity ?? 1,
                      borderRadius: `${el.style.borderRadius || 0}px`,
                      borderColor: el.style.borderColor || 'transparent',
                      borderWidth: `${el.style.borderWidth || 0}px`,
                      borderStyle: el.style.borderStyle || 'none',
                      padding: `${el.style.padding || 0}px`,
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: el.style.textAlign === 'center' ? 'center' : 'flex-start',
                      justifyContent:
                        el.style.textAlign === 'center'
                          ? 'center'
                          : el.style.textAlign === 'right'
                          ? 'flex-end'
                          : 'flex-start',
                    }}
                  >
                    {/* Element Renderers */}
                    {el.type === 'logo' && (
                      <img
                        src={el.content || '/assets/card_samples/fmc_logo.png'}
                        alt="Logo"
                        className="w-full h-full object-contain pointer-events-none drop-shadow-xs"
                      />
                    )}

                    {el.type === 'photo' && (
                      <div className="w-full h-full bg-slate-50 relative overflow-hidden flex items-center justify-center">
                        {sampleStaffData.photoUrl ? (
                          <img
                            src={sampleStaffData.photoUrl}
                            alt="Staff"
                            className={`w-full h-full pointer-events-none ${
                              el.photoFitMode === 'cover' ? 'object-cover' : 'object-contain'
                            }`}
                          />
                        ) : (
                          <span className="text-[10px] text-gray-400 font-bold uppercase">
                            PHOTO
                          </span>
                        )}
                      </div>
                    )}

                    {el.type === 'signature' && (
                      <div className="w-full h-full flex flex-col items-center justify-center">
                        <div className="w-full h-[24px] border-b border-gray-300 flex items-center justify-center">
                          {sampleStaffData.signatureUrl ? (
                            <img
                              src={sampleStaffData.signatureUrl}
                              alt="Signature"
                              className="max-h-[22px] object-contain"
                            />
                          ) : (
                            <span className="text-[8px] italic text-gray-300">Signature</span>
                          )}
                        </div>
                        <span className="text-[9px] font-bold text-red-600 mt-0.5">
                          {el.prefix || 'Holder Signature'}
                        </span>
                      </div>
                    )}

                    {el.type === 'qr' && (
                      <div className="w-full h-full p-1 bg-white border border-gray-200 rounded flex flex-col items-center justify-center">
                        <QrCode className="w-[85%] h-[85%] text-black stroke-[1.5]" />
                        <span className="text-[6.5px] uppercase font-bold text-gray-500">
                          QR VERIFY
                        </span>
                      </div>
                    )}

                    {el.type === 'maskPatch' && (
                      <div className="w-full h-full border border-dashed border-gray-400/40" />
                    )}

                    {el.type === 'image' && el.content && (
                      <img
                        src={el.content}
                        alt={el.label}
                        className="w-full h-full object-contain pointer-events-none"
                      />
                    )}

                    {(el.type === 'text' || el.type === 'ribbon' || el.type === 'footer') && (
                      <div className="w-full whitespace-pre-wrap leading-tight">
                        {renderElementValue(el)}
                      </div>
                    )}

                    {el.type === 'shape' && <div className="w-full h-full" />}

                    {/* Resize Handle */}
                    {isSelected && !el.locked && (
                      <div
                        onMouseDown={(e) => handleResizeMouseDown(e, 'se')}
                        className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-blue-600 border border-white cursor-se-resize rounded-tl-sm z-40"
                        title="Drag to resize"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ================= COLUMN 3: PROPERTIES & FORMATTING ================= */}
          <div className="w-80 bg-slate-800/95 border-l border-slate-700 p-4 flex flex-col overflow-y-auto text-xs space-y-4 select-none">
            {selectedElement ? (
              <>
                <div className="border-b border-slate-700 pb-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-white">Element Properties</h3>
                    <span className="text-[10px] font-mono bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded">
                      {selectedElement.isDynamic ? 'Dynamic Input' : 'Static Artwork'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 font-semibold">
                    {selectedElement.label}
                  </p>
                </div>

                {/* Field-to-Input Binding Dropdown */}
                <div className="space-y-1 bg-slate-900/60 p-2.5 rounded-lg border border-slate-700">
                  <label className="text-[10px] text-slate-300 font-bold uppercase tracking-wider block">
                    Form Field Binding:
                  </label>
                  <select
                    value={selectedElement.fieldKey || ''}
                    onChange={(e) => {
                      const newKey = e.target.value;
                      const matched = AVAILABLE_FIELDS.find((f) => f.fieldKey === newKey);
                      updateSelectedElement({
                        fieldKey: newKey,
                        isDynamic: !!matched?.isDynamic,
                        label: matched?.label || selectedElement.label,
                      });
                    }}
                    className="w-full bg-slate-700 text-white rounded px-2 py-1 text-xs border border-slate-600 font-semibold"
                  >
                    <option value="">-- Custom / Unbound Static --</option>
                    {AVAILABLE_FIELDS.map((f) => (
                      <option key={f.fieldKey} value={f.fieldKey}>
                        {f.label} ({f.isDynamic ? 'Dynamic' : 'Static'})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Position & Size */}
                <div className="space-y-2">
                  <span className="font-bold text-slate-200 block text-[11px] uppercase tracking-wider">
                    Coordinates &amp; Dimensions
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400 block">X Pos (px):</label>
                      <input
                        type="number"
                        min="0"
                        max="340"
                        value={selectedElement.x}
                        onChange={(e) => updateSelectedElement({ x: parseInt(e.target.value) || 0 })}
                        className="w-full bg-slate-700 text-white rounded px-2 py-1 text-xs border border-slate-600 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block">Y Pos (px):</label>
                      <input
                        type="number"
                        min="0"
                        max="540"
                        value={selectedElement.y}
                        onChange={(e) => updateSelectedElement({ y: parseInt(e.target.value) || 0 })}
                        className="w-full bg-slate-700 text-white rounded px-2 py-1 text-xs border border-slate-600 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block">Width (px):</label>
                      <input
                        type="number"
                        min="10"
                        max="340"
                        value={selectedElement.width}
                        onChange={(e) => updateSelectedElement({ width: parseInt(e.target.value) || 10 })}
                        className="w-full bg-slate-700 text-white rounded px-2 py-1 text-xs border border-slate-600 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block">Height (px):</label>
                      <input
                        type="number"
                        min="10"
                        max="540"
                        value={selectedElement.height}
                        onChange={(e) => updateSelectedElement({ height: parseInt(e.target.value) || 10 })}
                        className="w-full bg-slate-700 text-white rounded px-2 py-1 text-xs border border-slate-600 font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Specific controls for Photo Elements */}
                {selectedElement.type === 'photo' && (
                  <div className="space-y-1.5 border-t border-slate-700 pt-3">
                    <span className="font-bold text-slate-200 block text-[11px] uppercase tracking-wider">
                      Passport Fitting Mode
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => updateSelectedElement({ photoFitMode: 'contain' })}
                        className={`p-1.5 rounded font-bold text-[10px] border ${
                          selectedElement.photoFitMode !== 'cover'
                            ? 'bg-blue-600 text-white border-blue-500'
                            : 'bg-slate-700 text-slate-300'
                        }`}
                      >
                        Fit Entire Photo (contain)
                      </button>
                      <button
                        type="button"
                        onClick={() => updateSelectedElement({ photoFitMode: 'cover' })}
                        className={`p-1.5 rounded font-bold text-[10px] border ${
                          selectedElement.photoFitMode === 'cover'
                            ? 'bg-blue-600 text-white border-blue-500'
                            : 'bg-slate-700 text-slate-300'
                        }`}
                      >
                        Fill Frame (cover)
                      </button>
                    </div>
                  </div>
                )}

                {/* Prefix Label */}
                {selectedElement.type === 'text' && (
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Prefix Label (e.g. &quot;Department: &quot;):</label>
                    <input
                      type="text"
                      value={selectedElement.prefix || ''}
                      onChange={(e) => updateSelectedElement({ prefix: e.target.value })}
                      className="w-full bg-slate-700 text-white rounded px-2 py-1 text-xs border border-slate-600 font-medium"
                    />
                  </div>
                )}

                {/* Typography & Fonts */}
                {(selectedElement.type === 'text' || selectedElement.type === 'ribbon' || selectedElement.type === 'footer') && (
                  <div className="space-y-2 border-t border-slate-700 pt-3">
                    <span className="font-bold text-slate-200 block text-[11px] uppercase tracking-wider">
                      Font &amp; Appearance
                    </span>

                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Font Family:</label>
                      <select
                        value={selectedElement.style.fontFamily || 'Inter'}
                        onChange={(e) => updateSelectedStyle({ fontFamily: e.target.value })}
                        className="w-full bg-slate-700 text-white rounded px-2 py-1 text-xs border border-slate-600"
                      >
                        {FONT_OPTIONS.map((f) => (
                          <option key={f} value={f}>
                            {f}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">Size (px):</label>
                        <input
                          type="number"
                          min="6"
                          max="36"
                          step="0.5"
                          value={selectedElement.style.fontSize || 11}
                          onChange={(e) => updateSelectedStyle({ fontSize: parseFloat(e.target.value) || 11 })}
                          className="w-full bg-slate-700 text-white rounded px-2 py-1 text-xs border border-slate-600 font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">Weight:</label>
                        <select
                          value={selectedElement.style.fontWeight || 'bold'}
                          onChange={(e) =>
                            updateSelectedStyle({
                              fontWeight: e.target.value as 'normal' | 'bold' | 'bolder' | 'black',
                            })
                          }
                          className="w-full bg-slate-700 text-white rounded px-2 py-1 text-xs border border-slate-600"
                        >
                          <option value="normal">Normal</option>
                          <option value="bold">Bold</option>
                          <option value="bolder">Bolder</option>
                          <option value="black">Black (Heavy)</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() =>
                          updateSelectedStyle({
                            fontStyle: selectedElement.style.fontStyle === 'italic' ? 'normal' : 'italic',
                          })
                        }
                        className={`p-1.5 rounded border ${
                          selectedElement.style.fontStyle === 'italic'
                            ? 'bg-blue-600 border-blue-500 text-white'
                            : 'bg-slate-700 border-slate-600 text-slate-300'
                        }`}
                        title="Italic"
                      >
                        <Italic className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          updateSelectedStyle({
                            textDecoration:
                              selectedElement.style.textDecoration === 'underline' ? 'none' : 'underline',
                          })
                        }
                        className={`p-1.5 rounded border ${
                          selectedElement.style.textDecoration === 'underline'
                            ? 'bg-blue-600 border-blue-500 text-white'
                            : 'bg-slate-700 border-slate-600 text-slate-300'
                        }`}
                        title="Underline"
                      >
                        <Underline className="w-3.5 h-3.5" />
                      </button>

                      <div className="flex items-center gap-0.5 bg-slate-700 p-0.5 rounded border border-slate-600 ml-auto">
                        {(['left', 'center', 'right'] as const).map((align) => (
                          <button
                            key={align}
                            type="button"
                            onClick={() => updateSelectedStyle({ textAlign: align })}
                            className={`p-1 rounded ${
                              selectedElement.style.textAlign === align
                                ? 'bg-blue-600 text-white'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            {align === 'left' && <AlignLeft className="w-3 h-3" />}
                            {align === 'center' && <AlignCenter className="w-3 h-3" />}
                            {align === 'right' && <AlignRight className="w-3 h-3" />}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Colors */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">Text Color:</label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            value={selectedElement.style.color || '#000000'}
                            onChange={(e) => updateSelectedStyle({ color: e.target.value })}
                            className="w-6 h-6 rounded border border-slate-600 cursor-pointer bg-transparent"
                          />
                          <input
                            type="text"
                            value={selectedElement.style.color || '#000000'}
                            onChange={(e) => updateSelectedStyle({ color: e.target.value })}
                            className="flex-1 bg-slate-700 text-white rounded px-1.5 py-0.5 text-[10px] font-mono border border-slate-600 uppercase"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">Background:</label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            value={
                              selectedElement.style.backgroundColor === 'transparent'
                                ? '#ffffff'
                                : selectedElement.style.backgroundColor || '#ffffff'
                            }
                            onChange={(e) => updateSelectedStyle({ backgroundColor: e.target.value })}
                            className="w-6 h-6 rounded border border-slate-600 cursor-pointer bg-transparent"
                          />
                          <button
                            type="button"
                            onClick={() => updateSelectedStyle({ backgroundColor: 'transparent' })}
                            className="text-[9px] text-slate-400 hover:text-white underline"
                          >
                            Clear
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Cover Mask Color (for maskPatch elements) */}
                {selectedElement.type === 'maskPatch' && (
                  <div className="space-y-1 bg-gray-900/60 p-2 rounded border border-slate-700">
                    <span className="text-[10px] text-slate-300 font-bold block">Mask Patch Fill Color:</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={selectedElement.style.backgroundColor || '#ffffff'}
                        onChange={(e) => updateSelectedStyle({ backgroundColor: e.target.value })}
                        className="w-7 h-7 rounded border border-slate-600 cursor-pointer"
                      />
                      <span className="text-[10px] text-slate-400">Match sample background to cover old text</span>
                    </div>
                  </div>
                )}

                {/* Element Actions toolbar */}
                <div className="flex items-center justify-between border-t border-slate-700 pt-3">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={handleDuplicate}
                      className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded text-slate-300 hover:text-white"
                      title="Duplicate"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMoveZ('up')}
                      className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded text-slate-300 hover:text-white"
                      title="Bring Forward"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMoveZ('down')}
                      className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded text-slate-300 hover:text-white"
                      title="Send Backward"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={handleToggleVisibility}
                      className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded text-slate-300 hover:text-white"
                      title={selectedElement.visible ? 'Hide' : 'Show'}
                    >
                      {selectedElement.visible ? <Eye className="w-3.5 h-3.5 text-blue-400" /> : <EyeOff className="w-3.5 h-3.5 text-amber-400" />}
                    </button>
                  </div>

                  <button
                    onClick={handleDelete}
                    className="p-1.5 bg-red-950/70 hover:bg-red-900 border border-red-700/60 rounded text-red-200"
                    title="Remove from layout"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400 p-4">
                <Move className="w-8 h-8 text-slate-600 mb-2 stroke-[1.5]" />
                <span className="font-bold text-xs text-slate-300">No Field Selected</span>
                <p className="text-[11px] text-slate-500 mt-1">
                  Click on any field on the canvas or drag a form field from the left panel onto the card.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-800 border-t border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>
              Elements: <strong>{currentTemplate.elements.length}</strong>
            </span>
            <span>•</span>
            <span>CR80 Canvas: 340 × 540 px</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveAndClose}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm transition-colors"
            >
              <Save className="w-4 h-4" />
              Save Layout Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
