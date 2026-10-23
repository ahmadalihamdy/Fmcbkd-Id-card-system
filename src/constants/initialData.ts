import { BloodGroup, DepartmentItem, IDTypeConfig, StaffData } from '../types/idCard';

export const INSTITUTIONAL_INFO = {
  name: 'FEDERAL MEDICAL CENTRE BIRNIN KUDU',
  state: 'Jigawa State',
  unit: 'IT Unit — Printing Section',
  address: 'P.M.B 1022 Along Kano Maiduguri RD, B/ Kudu Jigawa State',
  email: 'info@fmcbkd.gov.ng',
  website: 'www.fmcbkd.gov.ng',
  contactNumbers: '08035860870, 08067136887',
  securityOfficer: 'Chief Security',
  propertyNotice: `Holder of this card is a staff of
FEDERAL MEDICAL CENTRE BIRNIN KUDU

This card is property of 
Federal Medical Centre Birnin Kudu
If found please return to: 
any nearest police station or Federal Medical 
Centre Along Kano Maiduguri Road, 
Birnin Kudu Jigawa State.
www.fmcbkd.gov.ng Email: info@fmcbkd.gov.ng 
Tel: 08035860870, 08067136887`,
};

export const DEFAULT_ID_TYPES: IDTypeConfig[] = [
  {
    id: 'type-ssa',
    label: 'SSA Staff ID Card',
    code: 'SSA',
    description: 'Senior Staff Association • Permanent Clinical & Administrative',
    dateLabel: 'Date of issue',
    dateDefaultFormat: 'issue',
    accentColor: '#b70000',
    isCustom: false,
  },
  {
    id: 'type-lcm',
    label: 'LCM Staff ID Card',
    code: 'LCM',
    description: 'Local / Contract Staff • Contract Term & Expiry Date',
    dateLabel: 'Expiry Date',
    dateDefaultFormat: 'expiry',
    accentColor: '#001f5c',
    isCustom: false,
  },
  {
    id: 'type-intern',
    label: 'Intern ID Card',
    code: 'Intern',
    description: 'Clinical / Administrative Intern • Posting Validity',
    dateLabel: 'Valid Until',
    dateDefaultFormat: 'validity',
    accentColor: '#047857',
    isCustom: false,
  },
];

export const BLOOD_GROUPS: BloodGroup[] = [
  'A+',
  'A-',
  'B+',
  'B-',
  'AB+',
  'AB-',
  'O+',
  'O-',
  'Unknown / Not Provided',
];

export const INTERN_CADRES = [
  'HOUSE OFFICER / INTERN DOCTOR',
  'INTERN PHARMACIST',
  'INTERN NURSING OFFICER',
  'INTERN MEDICAL LAB SCIENTIST',
  'INTERN PHYSIOTHERAPIST',
  'INTERN RADIOGRAPHER',
  'INTERN DIETITIAN',
  'IT / ICT INTERN',
  'ADMINISTRATIVE INTERN',
];

export const INITIAL_DEPARTMENTS: DepartmentItem[] = [
  { id: 'dept-1', name: 'NURSING SERVICES', code: 'NS', isActive: true },
  { id: 'dept-2', name: 'HEALTH ATTENDANTS UNIT', code: 'HA', isActive: true },
  { id: 'dept-3', name: 'ADMINISTRATION & HUMAN RESOURCES', code: 'ADMIN', isActive: true },
  { id: 'dept-4', name: 'IT UNIT / PRINTING SECTION', code: 'IT', isActive: true },
  { id: 'dept-5', name: 'INTERNAL MEDICINE', code: 'MED', isActive: true },
  { id: 'dept-6', name: 'SURGERY', code: 'SURG', isActive: true },
  { id: 'dept-7', name: 'OBSTETRICS & GYNAECOLOGY (O&G)', code: 'O&G', isActive: true },
  { id: 'dept-8', name: 'PAEDIATRICS', code: 'PAED', isActive: true },
  { id: 'dept-9', name: 'PHARMACY SERVICES', code: 'PHARM', isActive: true },
  { id: 'dept-10', name: 'MEDICAL LABORATORY SERVICES', code: 'MLS', isActive: true },
  { id: 'dept-11', name: 'RADIOLOGY & IMAGING', code: 'RAD', isActive: true },
  { id: 'dept-12', name: 'HEALTH RECORDS & INFORMATION', code: 'HIM', isActive: true },
  { id: 'dept-13', name: 'WORKS, MAINTENANCE & TRANSPORT', code: 'WMT', isActive: true },
  { id: 'dept-14', name: 'FINANCE & ACCOUNTS', code: 'FIN', isActive: true },
  { id: 'dept-15', name: 'ANAESTHESIA & INTENSIVE CARE', code: 'AIC', isActive: true },
  { id: 'dept-16', name: 'DIETETICS & NUTRITION', code: 'DIET', isActive: true },
  { id: 'dept-17', name: 'PHYSIOTHERAPY', code: 'PT', isActive: true },
  { id: 'dept-18', name: 'OPHTHALMOLOGY', code: 'OPH', isActive: true },
  { id: 'dept-19', name: 'DENTAL SURGERY', code: 'DENT', isActive: true },
  { id: 'dept-20', name: 'COMMUNITY MEDICINE & NHIA', code: 'COM', isActive: true },
  { id: 'dept-21', name: 'SECURITY UNIT', code: 'SEC', isActive: true },
  { id: 'dept-22', name: 'PROCUREMENT & STORES', code: 'PROC', isActive: true },
];

export const DEFAULT_LCM_DATA: StaffData = {
  id: 'rec-lcm-2431',
  idType: 'LCM',
  idNumber: '2431',
  fullName: "SHAFI'U HALADU",
  department: 'NURSING SERVICES',
  designation: 'HEALTH ATTENDANT',
  dateValue: '22th OCT, 2027',
  bloodGroup: 'B+',
  photoUrl: '/assets/sample_photo.png',
  photoFitMode: 'contain', // Default: Fit Entire Photo (never cut off face/shoulders)
  photoZoomPercent: 100,
  photoScale: 1,
  photoX: 0,
  photoY: 0,
  photoRotation: 0,
  photoBgColor: '#ffffff',
  signatureUrl: null,
  printStatus: 'Not Printed',
  dateCreated: '2026-10-22T04:30:00.000Z',
  lastPrintedDate: null,
  printCount: 0,
  printHistory: [],
};

export const DEFAULT_SSA_DATA: StaffData = {
  id: 'rec-ssa-0812',
  idType: 'SSA',
  idNumber: 'SSA 0812',
  fullName: 'DR. AMINA MOHAMMED',
  department: 'INTERNAL MEDICINE',
  designation: 'SENIOR MEDICAL OFFICER',
  dateValue: '15th JAN, 2024',
  bloodGroup: 'O+',
  photoUrl: '/assets/sample_photo.png',
  photoFitMode: 'contain',
  photoZoomPercent: 100,
  photoScale: 1,
  photoX: 0,
  photoY: 0,
  photoRotation: 0,
  photoBgColor: '#ffffff',
  signatureUrl: null,
  printStatus: 'Printed',
  dateCreated: '2026-10-20T08:15:00.000Z',
  lastPrintedDate: '2026-10-20T09:30:00.000Z',
  printCount: 1,
  printHistory: [
    {
      timestamp: '2026-10-20T09:30:00.000Z',
      copies: 1,
      printedBy: 'IT Printing Section Operator',
      notes: 'Initial PVC issuance',
    },
  ],
};

export const DEFAULT_INTERN_DATA: StaffData = {
  id: 'rec-intern-041',
  idType: 'Intern',
  idNumber: 'INT/2026/041',
  fullName: 'DR. IBRAHIM SULEIMAN',
  department: 'INTERNAL MEDICINE',
  designation: 'HOUSE OFFICER / INTERN DOCTOR',
  dateValue: '31st DEC, 2027',
  bloodGroup: 'A+',
  photoUrl: '/assets/sample_photo.png',
  photoFitMode: 'contain',
  photoZoomPercent: 100,
  photoScale: 1,
  photoX: 0,
  photoY: 0,
  photoRotation: 0,
  photoBgColor: '#ffffff',
  signatureUrl: null,
  printStatus: 'Not Printed',
  dateCreated: '2026-10-22T06:00:00.000Z',
  lastPrintedDate: null,
  printCount: 0,
  printHistory: [],
};

export const BLANK_DATA: StaffData = {
  idType: 'SSA',
  idNumber: '',
  fullName: '',
  department: '',
  designation: '',
  dateValue: '',
  bloodGroup: 'Unknown / Not Provided',
  photoUrl: null,
  photoFitMode: 'contain',
  photoZoomPercent: 100,
  photoScale: 1,
  photoX: 0,
  photoY: 0,
  photoRotation: 0,
  photoBgColor: '#ffffff',
  signatureUrl: null,
  printStatus: 'Not Printed',
  dateCreated: new Date().toISOString(),
  lastPrintedDate: null,
  printCount: 0,
  printHistory: [],
};
