import { IDType, PhotoFitMode } from './idCard';

export type TemplateTarget =
  | 'SSA_FRONT'
  | 'SSA_BACK'
  | 'LCM_FRONT'
  | 'LCM_BACK'
  | 'INTERN_FRONT'
  | 'INTERN_BACK'
  | string;

export type ElementType =
  | 'text'
  | 'photo'
  | 'signature'
  | 'qr'
  | 'logo'
  | 'image'
  | 'shape'
  | 'footer'
  | 'ribbon'
  | 'maskPatch';

export interface ElementStyle {
  fontFamily: string;
  fontSize: number;
  fontWeight: 'normal' | 'bold' | 'bolder' | 'black';
  fontStyle: 'normal' | 'italic';
  textDecoration: 'none' | 'underline';
  textAlign: 'left' | 'center' | 'right';
  color: string;
  backgroundColor: string;
  letterSpacing: number;
  lineHeight: number;
  rotation: number;
  opacity: number;
  borderRadius: number;
  borderColor: string;
  borderWidth: number;
  borderStyle: 'solid' | 'dashed' | 'dotted' | 'none';
  padding: number;
}

export interface TemplateElement {
  id: string;
  type: ElementType;
  label: string;
  isDynamic: boolean; // True for form-bound inputs (Name, Dept, Photo, QR, etc.), False for static artwork
  fieldKey?: string; // Binds to StaffData (e.g. 'fullName', 'department', 'idNumber', 'customField', etc.)
  content?: string; // Static text, image URL, or custom text
  prefix?: string; // e.g. "Department: "
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  visible: boolean;
  locked?: boolean;
  photoFitMode?: PhotoFitMode; // Specific for photo elements: contain, cover, manual
  style: ElementStyle;
}

export interface TemplateVersionSnapshot {
  version: number;
  updatedAt: string;
  backgroundTemplateImage?: string;
  useTemplateBg: boolean;
  elements: TemplateElement[];
  note?: string;
}

export interface CardTemplate {
  id?: string;
  target: TemplateTarget;
  name: string;
  idType: IDType;
  side: 'front' | 'back';
  canvasWidth: number; // 340px
  canvasHeight: number; // 540px
  backgroundColor: string;
  backgroundTemplateImage?: string; // Uploaded ID card sample (PNG, JPG, rendered PDF page)
  useTemplateBg: boolean;
  version: number;
  previousVersions?: TemplateVersionSnapshot[];
  elements: TemplateElement[];
  updatedAt: string;
}
