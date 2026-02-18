import { PrintTemplate } from "@/lib/PrintTemplateService";

export const printDynamicReceipt = async (
    template: PrintTemplate,
    data: any, // Invoice data + customizations
    isRTL: boolean = false
): Promise<void> => {
    try {
        const html = generateDynamicHTML(template, data, isRTL);

        // Create a temporary iframe for printing
        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.top = '-9999px';
        iframe.style.left = '-9999px';
        iframe.style.width = `${template.styles?.width || 80}mm`;
        iframe.style.height = '100%';

        document.body.appendChild(iframe);

        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!doc) {
            throw new Error('Unable to access iframe document');
        }

        doc.open();
        doc.write(html);
        doc.close();

        // Ensure exact styling preservation for print
        const printStyles = doc.createElement('style');
        printStyles.textContent = `
      @media print {
        @page {
           margin: ${template.styles?.marginTop || 0}mm ${template.styles?.marginRight || 0}mm ${template.styles?.marginBottom || 0}mm ${template.styles?.marginLeft || 0}mm;
           size: ${template.styles?.width || 80}mm auto;
        }
        * {
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        body {
          margin: 0 !important;
          padding: 0 !important;
        }
      }
    `;
        doc.head.appendChild(printStyles);

        // Wait for content to render
        await new Promise(resolve => setTimeout(resolve, 500));

        // Print
        iframe.contentWindow?.print();

        // Clean up
        setTimeout(() => {
            document.body.removeChild(iframe);
        }, 1000);

    } catch (error) {
        console.error('Error printing dynamic receipt:', error);
    }
};

const generateDynamicHTML = (template: PrintTemplate, data: any, isRTL: boolean): string => {
    const styles = template.styles || { fontFamily: 'Inter', fontSize: 12, width: 80 };

    // Replace placeholders helper
    const replaceVars = (text: string) => {
        if (!text) return "";
        let res = text;
        res = res.replace(/{{store_name}}/g, data.companyName || "Store Name");
        res = res.replace(/{{invoice_no}}/g, data.elementNumber || "INV-000");
        res = res.replace(/{{date}}/g, data.issueDate || new Date().toLocaleDateString());
        res = res.replace(/{{time}}/g, new Date().toLocaleTimeString());
        res = res.replace(/{{total}}/g, data.totalAmount?.toFixed(2) || "0.00");

        // Add more variables as needed
        return res;
    };

    let sectionsHTML = template.sections.map(section => {
        if (!section.visible) return "";

        const sectionStyle = `
          text-align: ${section.style?.textAlign || 'left'};
          font-size: ${section.style?.fontSize || styles.fontSize + 'px'};
          font-weight: ${section.style?.fontWeight || 'normal'};
          margin: ${section.style?.margin || '0'};
          ${section.style?.borderTop ? `border-top: ${section.style.borderTop};` : ''}
       `;

        if (section.type === 'text' || section.type === 'header' || section.type === 'footer') {
            return `<div style="${sectionStyle}">${replaceVars(section.content || "").replace(/\n/g, '<br>')}</div>`;
        }

        if (section.type === 'divider') {
            return `<div style="${sectionStyle}"></div>`;
        }

        if (section.type === 'table' && section.content === 'items') {
            // Render Items Table
            const items = data.items || [];
            const rows = items.map((item: any) => `
               <tr>
                   <td style="text-align: left; padding: 2px;">${item.productName || item.description}</td>
                   <td style="text-align: center; padding: 2px;">${item.quantity}</td>
                   <td style="text-align: right; padding: 2px;">${(item.unitPrice * item.quantity).toFixed(2)}</td>
               </tr>
           `).join('');

            return `
             <table style="width: 100%; border-collapse: collapse; font-size: ${styles.fontSize}px; margin: 5px 0;">
                <thead>
                    <tr style="border-bottom: 1px solid #000;">
                        <th style="text-align: left;">Item</th>
                        <th style="text-align: center;">Qty</th>
                        <th style="text-align: right;">Total</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
             </table>
           `;
        }

        return "";
    }).join('');

    return `
     <!DOCTYPE html>
     <html dir="${isRTL ? 'rtl' : 'ltr'}">
     <head>
        <meta charset="UTF-8">
        <style>
            body {
                font-family: '${styles.fontFamily}', sans-serif;
                font-size: ${styles.fontSize}px;
                width: ${styles.width}mm;
                line-height: 1.4;
                color: #000;
                background: #fff;
            }
        </style>
     </head>
     <body>
        ${sectionsHTML}
     </body>
     </html>
   `;
};
