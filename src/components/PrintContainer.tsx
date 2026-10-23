import React from 'react';
import { PrintOptions, StaffData } from '../types/idCard';
import { CardTemplate } from '../types/template';
import { CardFront } from './CardFront';
import { CardBack } from './CardBack';

interface PrintContainerProps {
  data: StaffData;
  printOptions: PrintOptions;
  cardWidthMm: number;
  cardHeightMm: number;
  frontTemplate?: CardTemplate;
  backTemplate?: CardTemplate;
}

export const PrintContainer: React.FC<PrintContainerProps> = ({
  data,
  printOptions,
  frontTemplate,
  backTemplate,
}) => {
  const shouldPrintFront = printOptions.side === 'both' || printOptions.side === 'front';
  const shouldPrintBack = printOptions.side === 'both' || printOptions.side === 'back';

  return (
    <div id="print-root" className="hidden print:block bg-white text-black">
      {/* Front Page */}
      {shouldPrintFront && (
        <div className="print-card-page flex items-center justify-center">
          <div className="print-card-wrapper">
            <CardFront
              data={data}
              showBleed={false}
              scale={1}
              useTemplateBg={true}
              customTemplate={frontTemplate}
            />
          </div>
        </div>
      )}

      {/* Back Page */}
      {shouldPrintBack && (
        <div className="print-card-page flex items-center justify-center">
          <div className="print-card-wrapper">
            <CardBack
              data={data}
              showBleed={false}
              scale={1}
              useTemplateBg={true}
              customTemplate={backTemplate}
            />
          </div>
        </div>
      )}
    </div>
  );
};
