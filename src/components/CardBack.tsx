import React, { useEffect, useState } from 'react';
import { StaffData } from '../types/idCard';
import { CardTemplate, TemplateElement } from '../types/template';
import { buildQRText, generateQRCodeDataUrl } from '../utils/qrGenerator';
import { QrCode } from 'lucide-react';

interface CardBackProps {
  data: StaffData;
  showBleed?: boolean;
  scale?: number;
  useTemplateBg?: boolean;
  customTemplate?: CardTemplate;
}

export const CardBack: React.FC<CardBackProps> = ({
  data,
  showBleed = false,
  scale = 1,
  useTemplateBg = true,
  customTemplate,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const isIntern = data.idType === 'Intern';

  useEffect(() => {
    let isMounted = true;
    const text = buildQRText(data);
    generateQRCodeDataUrl(text, 260).then((url) => {
      if (isMounted) {
        setQrDataUrl(url);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [
    data.idType,
    data.idNumber,
    data.fullName,
    data.department,
    data.designation,
    data.dateValue,
    data.bloodGroup,
  ]);

  // If a custom template is provided with custom elements, render dynamically!
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
          id="fmc-card-back"
          className="w-[340px] h-[540px] bg-white rounded-[12px] shadow-2xl relative overflow-hidden border border-gray-300 font-sans text-black"
          style={{
            backgroundColor: customTemplate.backgroundColor || '#ffffff',
            boxSizing: 'border-box',
          }}
        >
          {/* Background image if enabled */}
          {customTemplate.useTemplateBg && customTemplate.backgroundTemplateImage && !isIntern && (
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
                  lineHeight: el.style.lineHeight || 1.3,
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
                {el.type === 'qr' && (
                  <div className="w-full h-full p-1 bg-white border border-gray-200 rounded-lg flex flex-col items-center justify-center shadow-xs">
                    {qrDataUrl ? (
                      <img
                        src={qrDataUrl}
                        alt="Verification QR Code"
                        className="w-[85%] h-[85%] object-contain"
                      />
                    ) : (
                      <QrCode className="w-[80%] h-[80%] text-gray-400" />
                    )}
                    <span className="text-[7px] font-bold text-gray-600 tracking-wider uppercase mt-0.5">
                      SCAN TO VERIFY
                    </span>
                  </div>
                )}

                {el.type === 'image' && el.content && (
                  <img
                    src={el.content}
                    alt={el.label}
                    className="w-full h-full object-contain pointer-events-none"
                  />
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

                {(el.type === 'text' || el.type === 'footer') && (
                  <div className="w-full whitespace-pre-wrap leading-tight">
                    {el.content || el.label}
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

  // Fallback: Default Reference Layout
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
        id="fmc-card-back"
        className="w-[340px] h-[540px] bg-white rounded-[12px] shadow-2xl relative overflow-hidden border border-gray-300 font-sans text-black"
        style={{ boxSizing: 'border-box' }}
      >
        {useTemplateBg && !isIntern ? (
          <div className="absolute inset-0 z-0">
            <img
              src="/assets/templates/card_back_template.png"
              alt="FMC Card Back Reference"
              className="w-full h-full object-fill pointer-events-none"
            />
          </div>
        ) : (
          <div className="absolute inset-0 z-0 bg-white" />
        )}

        {/* Dynamic Content Overlay */}
        <div className="relative z-10 w-full h-full flex flex-col justify-between p-4">
          {/* Top Section: Dynamic QR Code */}
          <div className="flex flex-col items-center pt-2">
            <div className="p-1.5 bg-white border border-gray-200 rounded-lg shadow-xs flex flex-col items-center">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Staff Verification QR Code"
                  className="w-[105px] h-[105px] object-contain"
                />
              ) : (
                <div className="w-[105px] h-[105px] bg-gray-100 flex items-center justify-center text-[10px] text-gray-400">
                  Generating QR...
                </div>
              )}
              <span className="text-[7.5px] font-bold text-gray-600 tracking-wider uppercase mt-1">
                Scan to Verify Staff Details
              </span>
            </div>
          </div>

          {/* Institutional Typography */}
          {(!useTemplateBg || isIntern) && (
            <div className="flex flex-col items-center text-center px-2 space-y-2 mt-1">
              <div>
                <p className="text-[10px] font-semibold text-gray-700 leading-tight">
                  Holder of this card is an approved staff/intern of
                </p>
                <h3 className="text-[12px] font-black text-black tracking-wide leading-tight">
                  FEDERAL MEDICAL CENTRE BIRNIN KUDU
                </h3>
              </div>

              <div className="space-y-1 text-[9px] text-black font-semibold leading-relaxed">
                <p>This card is property of</p>
                <p className="font-bold">Federal Medical Centre Birnin Kudu</p>
                <p>If found please return to:</p>
                <p>any nearest police station or Federal Medical</p>
                <p>Centre Along Kano Maiduguri Road,</p>
                <p>Birnin Kudu Jigawa State.</p>
                <p className="pt-0.5">
                  <span className="font-bold">www.fmcbkd.gov.ng</span> Email:{' '}
                  <span className="font-bold">info@fmcbkd.gov.ng</span>
                </p>
                <p className="font-bold">Tel: 08035860870, 08067136887</p>
              </div>

              {/* Chief Security Signature & Designation */}
              <div className="flex flex-col items-center pt-2">
                <img
                  src="/assets/card_samples/chief_security_signature.png"
                  alt="Chief Security Signature"
                  className="h-[36px] object-contain"
                />
                <span className="text-[11px] font-black text-black tracking-wide mt-0.5">
                  Chief Security
                </span>
              </div>
            </div>
          )}

          <div className="h-2" />
        </div>
      </div>
    </div>
  );
};
