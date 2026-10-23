import React from 'react';
import { X, FileText, CheckCircle, ExternalLink } from 'lucide-react';

interface ReferenceSampleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReferenceSampleModal: React.FC<ReferenceSampleModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">
                Institutional Sample Reference (FMC ID CARD SAMPLE.pdf)
              </h3>
              <p className="text-xs text-gray-500">
                Source of truth for Federal Medical Centre, Birnin Kudu ID card specifications
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-emerald-900 flex items-start gap-2.5">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">
                Official Reference Design Implemented
              </span>
              <p className="text-[11px] text-emerald-800 leading-relaxed mt-0.5">
                All branding, typography, color palettes, curved ribbon banners,
                crest logos, and contact information are extracted and mapped
                directly from the uploaded CorelDRAW X7 specification.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* SSA Reference */}
            <div className="border border-gray-200 rounded-xl p-3 bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-red-700 uppercase tracking-wide">
                  Row 1: SSA Staff ID Card
                </span>
                <span className="text-[10px] bg-red-100 text-red-800 font-bold px-1.5 py-0.5 rounded">
                  Date of Issue
                </span>
              </div>
              <div className="flex gap-2 justify-center bg-white p-2 rounded-lg border border-gray-200">
                <img
                  src="/assets/card_samples/ssa_front_raw.png"
                  alt="SSA Front Sample"
                  className="w-[110px] h-[176px] object-contain shadow-xs border"
                />
                <img
                  src="/assets/card_samples/ssa_back_raw.png"
                  alt="SSA Back Sample"
                  className="w-[110px] h-[176px] object-contain shadow-xs border"
                />
              </div>
              <p className="text-[10.5px] text-gray-600 mt-2 leading-relaxed">
                SSA card features the red arched ribbon banner, blank template
                photo frame with crossed guidelines, red field labels, and
                Date of Issue format.
              </p>
            </div>

            {/* LCM Reference */}
            <div className="border border-gray-200 rounded-xl p-3 bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-blue-800 uppercase tracking-wide">
                  Row 2: LCM Staff ID Card
                </span>
                <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.5 rounded">
                  Expiry Date
                </span>
              </div>
              <div className="flex gap-2 justify-center bg-white p-2 rounded-lg border border-gray-200">
                <img
                  src="/assets/card_samples/lcm_front_raw.png"
                  alt="LCM Front Sample"
                  className="w-[110px] h-[176px] object-contain shadow-xs border"
                />
                <img
                  src="/assets/card_samples/lcm_back_raw.png"
                  alt="LCM Back Sample"
                  className="w-[110px] h-[176px] object-contain shadow-xs border"
                />
              </div>
              <p className="text-[10.5px] text-gray-600 mt-2 leading-relaxed">
                LCM card displays staff name <em>SHAFI&apos;U HALADU</em>, Nursing Services,
                Health Attendant, ID number in ribbon header (<em>STAFF I.D. CARD LCM 2431</em>),
                and Expiry Date (<em>22th OCT, 2027</em>).
              </p>
            </div>
          </div>

          {/* Contact Details from Reference */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-[11px] text-gray-700 space-y-1">
            <span className="font-bold text-gray-900 block text-xs">
              Institutional Contact Details Verified from Sample:
            </span>
            <p><strong>Address:</strong> P.M.B 1022 Along Kano Maiduguri RD, B/ Kudu Jigawa State</p>
            <p><strong>Portal:</strong> www.fmcbkd.gov.ng | <strong>Email:</strong> info@fmcbkd.gov.ng</p>
            <p><strong>Phones:</strong> 08035860870, 08067136887</p>
            <p><strong>Signatory:</strong> Chief Security</p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <a
            href="/assets/aistudio/FMC_ID_CARD_SAMPLE_d2471283.pdf"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-semibold"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Open Source PDF in New Tab
          </a>
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-800 hover:bg-gray-900 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors shadow-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
