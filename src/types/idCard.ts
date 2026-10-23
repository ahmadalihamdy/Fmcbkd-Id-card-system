export type StandardIDType = 'SSA' | 'LCM' | 'Intern';
export type IDType = StandardIDType | string;

export type PrintStatus = 'Not Printed' | 'Printed' | 'Not Printed / Updated';

export type UserRole = 'Administrator' | 'Printing Operator';

export type PhotoFitMode = 'contain' | 'cover' | 'manual';

export type BloodGroup =
  | 'A+'
  | 'A-'
  | 'B+'
  | 'B-'
  | 'AB+'
  | 'AB-'
  | 'O+'
  | 'O-'
  | 'Unknown / Not Provided';

export interface PrintHistoryEntry {
  timestamp: string;
  copies: number;
  printedBy?: string;
  notes?: string;
}

export interface StaffData {
  id?: string;
  idType: IDType;
  idNumber: string;
  fullName: string;
  department: string;
  designation: string; // Designation or Intern Category
  dateValue: string; // Date of issue for SSA; Expiry Date for LCM; Validity/Posting Date for Intern
  bloodGroup: BloodGroup;
  photoUrl: string | null;
  photoFitMode?: PhotoFitMode; // 'contain' (Fit Entire Photo), 'cover' (Fill Frame), 'manual' (Crop/Zoom)
  photoZoomPercent?: number; // 0% to 100% zoom slider
  photoScale?: number; // Internal scale factor
  photoX?: number; // Horizontal pan (px)
  photoY?: number; // Vertical pan (px)
  photoRotation?: number; // Rotation degrees
  photoBgColor?: string; // Background color for letterbox in 'contain' mode
  signatureUrl: string | null;
  printStatus: PrintStatus;
  dateCreated: string;
  lastPrintedDate?: string | null;
  printCount?: number;
  printHistory?: PrintHistoryEntry[];
  lastPrintedContentSnapshot?: string; // Serialized snapshot of core card fields to detect updates
  updatedAt?: string;
  customFields?: Record<string, string>; // Dynamic extra fields for custom ID types
}

export interface DepartmentItem {
  id: string;
  name: string;
  code?: string;
  isActive: boolean;
}

export interface PrintOptions {
  side: 'both' | 'front' | 'back';
  copies: number;
  showBleedMarks: boolean;
  colorMode: 'color' | 'grayscale';
  flipOrientation: 'flip-long-edge' | 'flip-short-edge';
}

export interface IDTypeConfig {
  id: string;
  label: string;
  name?: string;
  code: string;
  description: string;
  dateLabel: string;
  dateDefaultFormat: 'issue' | 'expiry' | 'validity';
  accentColor: string;
  colorTheme?: 'red' | 'blue' | 'emerald' | string;
  isCustom?: boolean;
}
