import React from 'react';
import { StaffData } from '../types/idCard';
import { CardTemplate, TemplateElement } from '../types/template';
import { User } from 'lucide-react';

interface CardFrontProps {
  data: StaffData;
  showBleed?: boolean;
  scale?: number;
  useTemplateBg?: boolean;
  customTemplate?: CardTemplate;
}

export const CardFront: React.FC<CardFrontProps> = ({
  data,
  showBleed = false,
  scale = 1,
  useTemplateBg = true,
  customTemplate,
}) => {
  const isSSA = data.idType === 'SSA';
  const isLCM = data.idType === 'LCM';
  const isIntern = data.idType === 'Intern';

  // Calculate photo scale from photoZoomPercent (100% = 1.0 fit, 0% = 0.35 fit)
  const currentPhotoScale =
    data.photoZoomPercent !== undefined
      ? 0.35 + (data.photoZoomPercent / 100) * 0.65
      : data.photoScale || 1;

  // If a customized template exists with custom elements, render dynamically!
  if (customTemplate && customTemplate.elements.length > 0) {
    return (
      <div
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
        }}
        className="relative select-none transition-transform duration-150"
      >
        {/* Outer Bleed Guide */}
        {showBleed && (
          <div className="absolute -inset-2.5 border-2 border-dashed border-red-400 pointer-events-none rounded-[16px] z-30 flex items-start justify-end p-1">
            <span className="bg-red-500 text-white text-[9px] px-1 rounded font-mono font-bold tracking-tight">
              3mm Bleed Margin
            </span>
          </div>
        )}

        <div
          id="fmc-card-front"
          className="w-[340px] h-[540px] bg-white rounded-[12px] shadow-2xl relative overflow-hidden border border-gray-300 font-sans text-black"
          style={{
            backgroundColor: customTemplate.backgroundColor || '#ffffff',
            boxSizing: 'border-box',
          }}
        >
          {/* Background image if enabled */}
          {customTemplate.useTemplateBg && customTemplate.backgroundTemplateImage && (
            <img
              src={customTemplate.backgroundTemplateImage}
              alt="Template Background"
              className="absolute inset-0 w-full h-full object-fill pointer-events-none z-0"
            />
          )}

          {/* Render each template element dynamically */}
          {customTemplate.elements.map((el: TemplateElement) => {
            if (!el.visible) return null;

            return (
              <div
                key={el.id}
                className="absolute select-none overflow-hidden"
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
                {el.type === 'logo' && (
                  <img
                    src={el.content || '/assets/card_samples/fmc_logo.png'}
                    alt="FMC Logo"
                    className="w-full h-full object-contain pointer-events-none drop-shadow-xs"
                  />
                )}

                {el.type === 'photo' && (
                  <div
                    className="w-full h-full relative overflow-hidden flex items-center justify-center"
                    style={{ backgroundColor: data.photoBgColor || '#ffffff' }}
                  >
                    {data.photoUrl ? (
                      <img
                        src={data.photoUrl}
                        alt={data.fullName || 'Passport'}
                        className={`pointer-events-none select-none transition-transform duration-75 ${
                          (data.photoFitMode || 'contain') === 'contain'
                            ? 'w-full h-full object-contain'
                            : (data.photoFitMode || 'contain') === 'cover'
                            ? 'w-full h-full object-cover'
                            : 'max-w-none'
                        }`}
                        style={{
                          transform: `translate(${data.photoX || 0}px, ${
                            data.photoY || 0
                          }px) scale(${currentPhotoScale}) rotate(${
                            data.photoRotation || 0
                          }deg)`,
                          transformOrigin: 'center center',
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 text-gray-400 p-2">
                        <User className="w-10 h-10 stroke-[1.2] text-gray-300 mb-0.5" />
                        <span className="text-[8.5px] uppercase tracking-wider text-gray-400 font-bold">
                          PASSPORT PHOTO
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {el.type === 'maskPatch' && (
                  <div
                    className="w-full h-full pointer-events-none"
                    style={{
                      backgroundColor: el.style.backgroundColor || '#ffffff',
                      borderRadius: `${el.style.borderRadius || 0}px`,
                      opacity: el.style.opacity ?? 1,
                    }}
                  />
                )}

                {el.type === 'signature' && (
                  <div className="w-full h-full flex flex-col items-center justify-center">
                    <div className="w-full h-[24px] border-b border-gray-400 flex items-center justify-center">
                      {data.signatureUrl ? (
                        <img
                          src={data.signatureUrl}
                          alt="Signature"
                          className="max-h-[22px] max-w-[95px] object-contain"
                        />
                      ) : (
                        <span className="text-[8px] italic text-gray-300">Sign here</span>
                      )}
                    </div>
                    <span className="text-[9px] font-bold text-[#b70000] tracking-tight mt-0.5">
                      {el.prefix || 'Holder Signature'}
                    </span>
                  </div>
                )}

                {(el.type === 'text' || el.type === 'ribbon' || el.type === 'footer') && (
                  <div className="w-full whitespace-pre-wrap leading-tight">
                    {el.content
                      ? el.content
                      : el.fieldKey === 'idNumber'
                      ? `${el.prefix || 'STAFF I.D. CARD '}${data.idType.toUpperCase()} ${
                          data.idNumber || ''
                        }`
                      : el.fieldKey === 'fullName'
                      ? data.fullName || 'STAFF FULL NAME'
                      : el.fieldKey === 'department'
                      ? `${el.prefix || 'Department: '}${data.department || '—'}`
                      : el.fieldKey === 'designation'
                      ? `${el.prefix || (isIntern ? 'Intern Cadre: ' : 'Designation: ')}${
                          data.designation || '—'
                        }`
                      : el.fieldKey === 'dateValue'
                      ? `${
                          el.prefix ||
                          (isSSA
                            ? 'Date of issue: '
                            : isLCM
                            ? 'Expiry Date: '
                            : 'Valid Until: ')
                        }${data.dateValue || '—'}`
                      : el.fieldKey === 'bloodGroup'
                      ? `${el.prefix || 'Blood Group: '}${
                          data.bloodGroup === 'Unknown / Not Provided' ? '—' : data.bloodGroup
                        }`
                      : el.fieldKey && data.customFields?.[el.fieldKey]
                      ? `${el.prefix || ''}${data.customFields[el.fieldKey]}`
                      : el.label}
                  </div>
                )}

                {el.type === 'shape' && <div className="w-full h-full" />}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Fallback: Built-in default layout
  return (
    <div
      style={{
        transform: `scale(${scale})`,
        transformOrigin: 'top center',
      }}
      className="relative select-none transition-transform duration-150"
    >
      {/* Outer Bleed Guide */}
      {showBleed && (
        <div className="absolute -inset-2.5 border-2 border-dashed border-red-400 pointer-events-none rounded-[16px] z-30 flex items-start justify-end p-1">
          <span className="bg-red-500 text-white text-[9px] px-1 rounded font-mono font-bold tracking-tight">
            3mm Bleed Margin
          </span>
        </div>
      )}

      {/* Card Container */}
      <div
        id="fmc-card-front"
        className="w-[340px] h-[540px] bg-white rounded-[12px] shadow-2xl relative overflow-hidden border border-gray-300 font-sans text-black"
        style={{ boxSizing: 'border-box' }}
      >
        {useTemplateBg && !isIntern ? (
          /* Using original sample PDF background */
          <div className="absolute inset-0 z-0">
            <img
              src={
                isSSA
                  ? '/assets/templates/ssa_front_template.png'
                  : '/assets/templates/lcm_front_template.png'
              }
              alt="FMC Birnin Kudu Card Template"
              className="w-full h-full object-fill pointer-events-none"
            />
          </div>
        ) : (
          /* Vector Layout (Used for Intern and Clean Mode) */
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-white">
            <div
              className="absolute top-0 left-0 right-0 h-[100px]"
              style={{
                background: isIntern
                  ? 'radial-gradient(ellipse at 50% -20%, #d1fae5 0%, #a7f3d0 60%, #ffffff 100%)'
                  : isSSA
                  ? 'radial-gradient(ellipse at 50% -20%, #fee2e2 0%, #fecaca 60%, #ffffff 100%)'
                  : 'radial-gradient(ellipse at 50% -20%, #e0f2fe 0%, #bae6fd 60%, #ffffff 100%)',
              }}
            />

            <div
              className={`absolute top-[110px] left-[-30px] w-[50px] h-[220px] rounded-r-full transform -rotate-6 opacity-80 ${
                isIntern
                  ? 'bg-gradient-to-b from-[#047857] via-[#059669] to-[#047857]'
                  : isSSA
                  ? 'bg-gradient-to-b from-[#b70000] via-[#dc2626] to-[#b70000]'
                  : 'bg-gradient-to-b from-[#1e3a8a] via-[#2563eb] to-[#1e3a8a]'
              }`}
            />
          </div>
        )}

        {/* Content Layers */}
        <div className="relative z-10 w-full h-full flex flex-col justify-between">
          {/* Header Section */}
          <div className="pt-2.5 px-3 flex flex-col items-center">
            {(!useTemplateBg || isIntern) && (
              <>
                <div className="w-[52px] h-[52px] mb-1">
                  <img
                    src="/assets/card_samples/fmc_logo.png"
                    alt="FMC Birnin Kudu Crest"
                    className="w-full h-full object-contain drop-shadow-xs"
                  />
                </div>

                <h1 className="text-[12px] font-black tracking-tight text-[#002b80] text-center leading-tight drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)]">
                  FEDERAL MEDICAL CENTRE BIRNIN KUDU
                </h1>

                <div
                  className={`mt-1.5 w-full py-1 px-2 rounded-sm shadow-xs flex items-center justify-center transform skew-x-[-4deg] ${
                    isIntern
                      ? 'bg-gradient-to-r from-[#047857] via-[#059669] to-[#047857] text-white'
                      : isSSA
                      ? 'bg-gradient-to-r from-[#990000] via-[#c00000] to-[#800000] text-white'
                      : 'bg-gradient-to-r from-[#001f5c] via-[#002f8a] to-[#001f5c] text-white'
                  }`}
                >
                  <span className="text-[11.5px] font-black tracking-wider uppercase drop-shadow-xs">
                    STAFF I.D. CARD {data.idType.toUpperCase()}{' '}
                    {data.idNumber ? `${data.idNumber}` : ''}
                  </span>
                </div>
              </>
            )}

            {useTemplateBg && !isIntern && (
              <div className="w-full relative h-[105px]">
                <div className="absolute top-[82px] left-0 right-0 flex items-center justify-center">
                  <span className="text-[11px] font-black tracking-wide text-white uppercase drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
                    STAFF I.D. CARD {data.idType}{' '}
                    {data.idNumber ? `${data.idNumber}` : ''}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Photograph Frame & Staff Full Name */}
          <div className="flex flex-col items-center -mt-2">
            <div
              className={`w-[136px] h-[162px] border-[2px] rounded-[2px] shadow-xs relative overflow-hidden flex items-center justify-center ${
                isIntern ? 'border-[#047857]' : 'border-[#b70000]'
              }`}
              style={{ backgroundColor: data.photoBgColor || '#ffffff' }}
            >
              {data.photoUrl ? (
                <div
                  className="w-full h-full relative overflow-hidden flex items-center justify-center"
                  style={{ backgroundColor: data.photoBgColor || '#ffffff' }}
                >
                  <img
                    src={data.photoUrl}
                    alt={data.fullName || 'Passport Photograph'}
                    className={`pointer-events-none select-none transition-transform duration-75 ${
                      (data.photoFitMode || 'contain') === 'contain'
                        ? 'w-full h-full object-contain'
                        : (data.photoFitMode || 'contain') === 'cover'
                        ? 'w-full h-full object-cover'
                        : 'max-w-none'
                    }`}
                    style={{
                      transform: `translate(${data.photoX || 0}px, ${
                        data.photoY || 0
                      }px) scale(${currentPhotoScale}) rotate(${
                        data.photoRotation || 0
                      }deg)`,
                      transformOrigin: 'center center',
                    }}
                  />
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 text-gray-400 p-2">
                  <User className="w-12 h-12 stroke-[1.2] text-gray-300 mb-1" />
                  <span className="text-[9px] uppercase tracking-wider text-gray-400 text-center font-bold">
                    PASSPORT PHOTO
                  </span>
                </div>
              )}
            </div>

            {/* Staff Full Name */}
            <div className="w-[92%] mt-1.5 min-h-[22px] flex items-center justify-center">
              <h2 className="text-[14px] font-black text-black tracking-wide uppercase text-center leading-tight truncate px-1">
                {data.fullName?.trim() || (
                  <span className="text-gray-300 font-bold">STAFF FULL NAME</span>
                )}
              </h2>
            </div>
          </div>

          {/* Details Section */}
          <div className="px-5 mb-1 flex flex-col space-y-[4px] text-[11px] leading-tight">
            {/* Department */}
            <div className="flex items-baseline">
              <span
                className={`font-bold tracking-tight shrink-0 w-[84px] ${
                  isIntern ? 'text-[#047857]' : 'text-[#b70000]'
                }`}
              >
                Department:
              </span>
              <span className="font-black text-black uppercase truncate pl-1">
                {data.department || <span className="text-gray-300 font-semibold">—</span>}
              </span>
            </div>

            {/* Designation / Cadre */}
            <div className="flex items-baseline">
              <span
                className={`font-bold tracking-tight shrink-0 w-[84px] ${
                  isIntern ? 'text-[#047857]' : 'text-[#b70000]'
                }`}
              >
                {isIntern ? 'Intern Cadre:' : 'Designation:'}
              </span>
              <span className="font-black text-black uppercase truncate pl-1">
                {data.designation || <span className="text-gray-300 font-semibold">—</span>}
              </span>
            </div>

            {/* Date Field */}
            <div className="flex items-baseline">
              <span
                className={`font-bold tracking-tight shrink-0 w-[84px] ${
                  isIntern ? 'text-[#047857]' : 'text-[#b70000]'
                }`}
              >
                {isSSA ? 'Date of issue:' : isLCM ? 'Expiry Date:' : 'Valid Until:'}
              </span>
              <span className="font-black text-black uppercase truncate pl-1">
                {data.dateValue || <span className="text-gray-300 font-semibold">—</span>}
              </span>
            </div>

            {/* Blood Group and Holder Signature */}
            <div className="flex items-end justify-between pt-0.5">
              <div className="flex items-baseline">
                <span
                  className={`font-bold tracking-tight shrink-0 w-[84px] ${
                    isIntern ? 'text-[#047857]' : 'text-[#b70000]'
                  }`}
                >
                  Blood Group:
                </span>
                <span className="font-black text-black uppercase pl-1 text-[11.5px]">
                  {data.bloodGroup === 'Unknown / Not Provided' ? '—' : data.bloodGroup}
                </span>
              </div>

              <div className="flex flex-col items-center w-[105px]">
                <div className="h-[24px] w-full flex items-center justify-center border-b border-gray-400 mb-0.5">
                  {data.signatureUrl ? (
                    <img
                      src={data.signatureUrl}
                      alt="Holder Signature"
                      className="max-h-[22px] max-w-[95px] object-contain"
                    />
                  ) : (
                    <span className="text-[8.5px] italic text-gray-300">Sign here</span>
                  )}
                </div>
                <span
                  className={`text-[9px] font-bold tracking-tight ${
                    isIntern ? 'text-[#047857]' : 'text-[#b70000]'
                  }`}
                >
                  Holder Signature
                </span>
              </div>
            </div>
          </div>

          {/* Footer Box */}
          <div className="px-3 pb-2.5">
            <div className="border border-black rounded-[6px] py-1 px-1 bg-white flex flex-col items-center justify-center text-center shadow-xs">
              <p className="text-[8.2px] font-bold text-black tracking-tight leading-none mb-0.5">
                P.M.B 1022 Along Kano Maiduguri RD, B/ Kudu Jigawa State
              </p>
              <p className="text-[8px] font-bold text-black tracking-tight leading-none">
                info@fmcbkd.gov.ng / www.fmcbkd.gov.ng
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
