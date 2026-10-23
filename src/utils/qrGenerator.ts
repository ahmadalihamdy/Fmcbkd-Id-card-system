import QRCode from 'qrcode';
import { StaffData } from '../types/idCard';

/**
 * Builds the structured plain text string for the staff ID card QR code
 * in strict accordance with FMC Birnin Kudu specification for SSA, LCM, and Intern.
 */
export function buildQRText(data: StaffData): string {
  const lines: string[] = [
    'FEDERAL MEDICAL CENTRE BIRNIN KUDU',
    'STAFF ID CARD',
    `ID TYPE: ${data.idType.toUpperCase()}`,
  ];

  if (data.idNumber?.trim()) {
    lines.push(`ID NUMBER: ${data.idNumber.trim()}`);
  }

  if (data.fullName?.trim()) {
    lines.push(`FULL NAME: ${data.fullName.trim()}`);
  }

  if (data.department?.trim()) {
    lines.push(`DEPARTMENT: ${data.department.trim()}`);
  }

  if (data.designation?.trim()) {
    lines.push(
      data.idType === 'Intern'
        ? `INTERN CADRE: ${data.designation.trim()}`
        : `DESIGNATION: ${data.designation.trim()}`
    );
  }

  if (data.idType === 'SSA') {
    if (data.dateValue?.trim()) {
      lines.push(`DATE OF ISSUE: ${data.dateValue.trim()}`);
    }
  } else if (data.idType === 'LCM') {
    if (data.dateValue?.trim()) {
      lines.push(`EXPIRY DATE: ${data.dateValue.trim()}`);
    }
  } else {
    // Intern
    if (data.dateValue?.trim()) {
      lines.push(`VALID UNTIL: ${data.dateValue.trim()}`);
    }
  }

  if (data.bloodGroup && data.bloodGroup !== 'Unknown / Not Provided') {
    lines.push(`BLOOD GROUP: ${data.bloodGroup}`);
  }

  return lines.join('\n');
}

/**
 * Generates a Data URL for the QR code canvas
 */
export async function generateQRCodeDataUrl(
  text: string,
  width: number = 300
): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      width,
      margin: 2,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    });
  } catch (err) {
    console.error('Failed to generate QR Code:', err);
    return '';
  }
}
