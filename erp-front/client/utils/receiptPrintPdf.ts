import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { ReceiptCustomization, ReceiptData } from '../data/receiptTemplates';

// Generate receipt HTML with full styling
export const generateReceiptHTML = (
  customization: ReceiptCustomization,
  receiptData: ReceiptData,
  isRTL: boolean = false
): string => {
  const {
    // Brand & Logo
    companyLogo,
    logoPosition,
    logoSize,
    logoOpacity,
    showWatermark,
    watermarkText,
    
    // Colors & Theme
    primaryColor,
    secondaryColor,
    accentColor,
    backgroundColor,
    textColor,
    headerBgColor,
    footerBgColor,
    borderColor,
    
    // Typography
    fontFamily,
    headerFontFamily,
    fontSize,
    headerFontSize,
    lineHeight,
    letterSpacing,
    fontWeight,
    
    // Layout & Structure
    headerStyle,
    footerStyle,
    layout,
    
    // Receipt Specific
    receiptNumberLabel,
    showReceiptNumber,
    receiptTitle,
    titleAlignment,
    showDateTime,
    dateFormat,
    timeFormat,
    
    // Payment Information
    showPaymentMethod,
    showTransactionId,
    showCardInfo,
    showCashierInfo,
    showCustomerInfo,
    
    // Content & Fields
    showTaxBreakdown,
    showItemDetails,
    showQuantity,
    showUnitPrice,
    showDiscounts,
    showSubtotal,
    showTotalAmount,
    showAmountPaid,
    showChange,
    
    // Styling Options
    tableBorders,
    alternateRowColors,
    roundedCorners,
    shadowEffect,
    gradientBackground,
    
    // Additional Features
    showQRCode,
    qrCodeData,
    qrCodeSize,
    qrCodePosition,
    
    showBarcode,
    barcodeData,
    
    // Footer Content
    thankYouMessage,
    returnPolicy,
    contactInfo,
    socialMedia,
    promotionalMessage,
    
    // Custom Fields
    customField1Label,
    customField1Value,
    customField2Label,
    customField2Value,
    customField3Label,
    customField3Value,
    
    // Printing Options
    marginTop,
    marginBottom,
    marginLeft,
    marginRight,
  } = customization;

  // Format date and time
  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    let formattedDate = '';
    let formattedTime = '';
    
    switch (dateFormat) {
      case 'MM/DD/YYYY':
        formattedDate = date.toLocaleDateString('en-US');
        break;
      case 'DD/MM/YYYY':
        formattedDate = date.toLocaleDateString('en-GB');
        break;
      case 'YYYY-MM-DD':
        formattedDate = date.toISOString().split('T')[0];
        break;
      case 'DD MMM YYYY':
        formattedDate = date.toLocaleDateString('en-GB', { 
          day: '2-digit', 
          month: 'short', 
          year: 'numeric' 
        });
        break;
      default:
        formattedDate = date.toLocaleDateString();
    }
    
    if (timeFormat === '12h') {
      formattedTime = date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    } else {
      formattedTime = date.toLocaleTimeString('en-GB', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
    }
    
    return { date: formattedDate, time: formattedTime };
  };

  const { date, time } = formatDateTime(receiptData.dateTime);

  // Generate QR Code data URL (placeholder)
  const generateQRCode = (data: string, size: number) => {
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${size}" height="${size}" fill="white" stroke="${borderColor}" stroke-width="1"/>
        <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="${textColor}" font-size="8">QR Code</text>
      </svg>
    `)}`;
  };

  // Generate items table HTML
  const generateItemsTable = () => {
    if (!showItemDetails) return '';
    
    const headerCells = [];
    if (showQuantity) headerCells.push('<th style="padding: 8px; text-align: left; border-bottom: 1px solid ' + borderColor + ';">Qty</th>');
    headerCells.push('<th style="padding: 8px; text-align: left; border-bottom: 1px solid ' + borderColor + ';">Item</th>');
    if (showUnitPrice) headerCells.push('<th style="padding: 8px; text-align: right; border-bottom: 1px solid ' + borderColor + ';">Price</th>');
    if (showDiscounts) headerCells.push('<th style="padding: 8px; text-align: right; border-bottom: 1px solid ' + borderColor + ';">Discount</th>');
    headerCells.push('<th style="padding: 8px; text-align: right; border-bottom: 1px solid ' + borderColor + ';">Total</th>');
    
    const itemRows = receiptData.items.map((item, index) => {
      const rowStyle = alternateRowColors && index % 2 === 1 ? 
        `background-color: ${headerBgColor}` : '';
      
      const cells = [];
      if (showQuantity) cells.push(`<td style="padding: 8px; ${rowStyle}">${item.quantity}</td>`);
      cells.push(`<td style="padding: 8px; ${rowStyle}">
        <div style="font-weight: ${fontWeight};">${item.name}</div>
        ${item.description ? `<div style="font-size: ${fontSize - 2}px; color: ${secondaryColor};">${item.description}</div>` : ''}
      </td>`);
      if (showUnitPrice) cells.push(`<td style="padding: 8px; text-align: right; ${rowStyle}">$${item.unitPrice.toFixed(2)}</td>`);
      if (showDiscounts && item.discount) cells.push(`<td style="padding: 8px; text-align: right; ${rowStyle}">-$${item.discount.toFixed(2)}</td>`);
      if (showDiscounts && !item.discount) cells.push(`<td style="padding: 8px; text-align: right; ${rowStyle}">-</td>`);
      cells.push(`<td style="padding: 8px; text-align: right; font-weight: ${fontWeight}; ${rowStyle}">$${item.total.toFixed(2)}</td>`);
      
      return `<tr>${cells.join('')}</tr>`;
    }).join('');
    
    return `
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0; ${tableBorders ? `border: 1px solid ${borderColor}` : ''}">
        <thead>
          <tr style="background-color: ${headerBgColor};">
            ${headerCells.join('')}
          </tr>
        </thead>
        <tbody>
          ${itemRows}
        </tbody>
      </table>
    `;
  };

  // Generate totals section
  const generateTotalsSection = () => {
    const totals = [];
    
    if (showSubtotal) {
      totals.push(`
        <div style="display: flex; justify-content: space-between; padding: 4px 0;">
          <span>Subtotal:</span>
          <span>$${receiptData.subtotal.toFixed(2)}</span>
        </div>
      `);
    }
    
    if (showDiscounts && receiptData.discountAmount > 0) {
      totals.push(`
        <div style="display: flex; justify-content: space-between; padding: 4px 0; color: ${accentColor};">
          <span>Discount:</span>
          <span>-$${receiptData.discountAmount.toFixed(2)}</span>
        </div>
      `);
    }
    
    if (showTaxBreakdown && receiptData.taxAmount > 0) {
      totals.push(`
        <div style="display: flex; justify-content: space-between; padding: 4px 0;">
          <span>Tax:</span>
          <span>$${receiptData.taxAmount.toFixed(2)}</span>
        </div>
      `);
    }
    
    if (showTotalAmount) {
      totals.push(`
        <div style="display: flex; justify-content: space-between; padding: 8px 0; font-weight: bold; font-size: ${fontSize + 2}px; border-top: 2px solid ${primaryColor}; color: ${primaryColor};">
          <span>Total:</span>
          <span>$${receiptData.totalAmount.toFixed(2)}</span>
        </div>
      `);
    }
    
    if (showAmountPaid) {
      totals.push(`
        <div style="display: flex; justify-content: space-between; padding: 4px 0;">
          <span>Amount Paid:</span>
          <span>$${receiptData.amountPaid.toFixed(2)}</span>
        </div>
      `);
    }
    
    if (showChange && receiptData.changeAmount > 0) {
      totals.push(`
        <div style="display: flex; justify-content: space-between; padding: 4px 0;">
          <span>Change:</span>
          <span>$${receiptData.changeAmount.toFixed(2)}</span>
        </div>
      `);
    }
    
    return `<div style="margin: 20px 0;">${totals.join('')}</div>`;
  };

  // Generate payment info section
  const generatePaymentInfo = () => {
    if (!showPaymentMethod && !showTransactionId && !showCardInfo) return '';
    
    const paymentInfo = [];
    
    if (showPaymentMethod) {
      paymentInfo.push(`<div><strong>Payment Method:</strong> ${receiptData.paymentMethod.toUpperCase()}</div>`);
    }
    
    if (showTransactionId && receiptData.transactionId) {
      paymentInfo.push(`<div><strong>Transaction ID:</strong> ${receiptData.transactionId}</div>`);
    }
    
    if (showCardInfo && receiptData.cardLast4) {
      paymentInfo.push(`<div><strong>Card:</strong> ${receiptData.cardType} ending in ${receiptData.cardLast4}</div>`);
    }
    
    return paymentInfo.length > 0 ? `
      <div style="margin: 20px 0; padding: 15px; background-color: ${headerBgColor}; ${roundedCorners ? 'border-radius: 8px;' : ''}">
        ${paymentInfo.join('')}
      </div>
    ` : '';
  };

  // Generate customer info section
  const generateCustomerInfo = () => {
    if (!showCustomerInfo || !receiptData.customerName) return '';
    
    return `
      <div style="margin: 20px 0;">
        <h4 style="margin: 0 0 10px 0; color: ${primaryColor};">Customer Information</h4>
        <div><strong>Name:</strong> ${receiptData.customerName}</div>
        ${receiptData.customerPhone ? `<div><strong>Phone:</strong> ${receiptData.customerPhone}</div>` : ''}
        ${receiptData.customerEmail ? `<div><strong>Email:</strong> ${receiptData.customerEmail}</div>` : ''}
      </div>
    `;
  };

  // Generate custom fields section
  const generateCustomFields = () => {
    const fields = [];
    
    if (customField1Label && customField1Value) {
      fields.push(`<div><strong>${customField1Label}:</strong> ${customField1Value}</div>`);
    }
    if (customField2Label && customField2Value) {
      fields.push(`<div><strong>${customField2Label}:</strong> ${customField2Value}</div>`);
    }
    if (customField3Label && customField3Value) {
      fields.push(`<div><strong>${customField3Label}:</strong> ${customField3Value}</div>`);
    }
    
    return fields.length > 0 ? `
      <div style="margin: 20px 0;">
        ${fields.join('')}
      </div>
    ` : '';
  };

  // Main HTML structure
  return `
    <!DOCTYPE html>
    <html dir="${isRTL ? 'rtl' : 'ltr'}" lang="${isRTL ? 'ar' : 'en'}">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Receipt</title>
      <link href="https://fonts.googleapis.com/css2?family=${fontFamily.replace(' ', '+')}&family=${headerFontFamily.replace(' ', '+')}&display=swap" rel="stylesheet">
      <style>
        @page {
          margin: ${marginTop}mm ${marginRight}mm ${marginBottom}mm ${marginLeft}mm;
          size: ${customization.pageSize || 'A4'};
        }
        
        @media print {
          body {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print { display: none !important; }
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: '${fontFamily}', sans-serif;
          font-size: ${fontSize}px;
          line-height: ${lineHeight};
          letter-spacing: ${letterSpacing}px;
          color: ${textColor};
          background-color: ${backgroundColor};
          ${gradientBackground ? `background: linear-gradient(135deg, ${backgroundColor} 0%, ${headerBgColor} 100%);` : ''}
        }
        
        .receipt-container {
          max-width: 800px;
          margin: 0 auto;
          background-color: ${backgroundColor};
          ${shadowEffect ? `box-shadow: 0 10px 30px rgba(0,0,0,0.1);` : ''}
          ${roundedCorners ? 'border-radius: 12px;' : ''}
          overflow: hidden;
          position: relative;
        }
        
        ${showWatermark ? `
        .receipt-container::before {
          content: '${watermarkText}';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-45deg);
          font-size: 72px;
          font-weight: bold;
          color: rgba(${parseInt(primaryColor.slice(1, 3), 16)}, ${parseInt(primaryColor.slice(3, 5), 16)}, ${parseInt(primaryColor.slice(5, 7), 16)}, 0.1);
          z-index: 1;
          pointer-events: none;
        }` : ''}
        
        .receipt-content {
          position: relative;
          z-index: 2;
          padding: 30px;
        }
        
        .receipt-header {
          text-align: ${titleAlignment};
          margin-bottom: 30px;
          ${headerStyle === 'detailed' ? `padding: 20px; background-color: ${headerBgColor}; ${roundedCorners ? 'border-radius: 8px;' : ''}` : ''}
        }
        
        .receipt-title {
          font-family: '${headerFontFamily}', serif;
          font-size: ${headerFontSize + 6}px;
          font-weight: bold;
          color: ${primaryColor};
          margin-bottom: 10px;
        }
        
        .company-logo {
          text-align: ${logoPosition};
          margin-bottom: 20px;
        }
        
        .company-logo img {
          max-width: ${logoSize}px;
          height: auto;
          opacity: ${logoOpacity / 100};
        }
        
        .company-info {
          text-align: ${titleAlignment};
          margin-bottom: 20px;
        }
        
        .company-name {
          font-size: ${headerFontSize + 2}px;
          font-weight: bold;
          color: ${primaryColor};
          margin-bottom: 5px;
        }
        
        .receipt-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 10px;
        }
        
        .receipt-footer {
          margin-top: 30px;
          ${footerStyle === 'detailed' ? `padding: 20px; background-color: ${footerBgColor}; ${roundedCorners ? 'border-radius: 8px;' : ''}` : ''}
          text-align: center;
          font-size: ${fontSize - 1}px;
        }
        
        .qr-code {
          position: absolute;
          ${qrCodePosition.includes('top') ? 'top: 20px;' : 'bottom: 20px;'}
          ${qrCodePosition.includes('right') ? 'right: 20px;' : qrCodePosition.includes('center') ? 'left: 50%; transform: translateX(-50%);' : 'left: 20px;'}
        }
        
        ${layout === 'thermal' ? `
          .receipt-container { max-width: 300px; }
          .receipt-content { padding: 15px; }
          .receipt-title { font-size: ${headerFontSize}px; }
        ` : ''}
      </style>
    </head>
    <body>
      <div class="receipt-container">
        <div class="receipt-content">
          <!-- Header -->
          <div class="receipt-header">
            ${companyLogo ? `
              <div class="company-logo">
                <img src="${companyLogo}" alt="Company Logo" />
              </div>
            ` : ''}
            
            <div class="company-info">
              <div class="company-name">${receiptData.companyName}</div>
              <div>${receiptData.companyAddress}</div>
              <div>${receiptData.companyPhone}</div>
              ${receiptData.companyEmail ? `<div>${receiptData.companyEmail}</div>` : ''}
              ${receiptData.companyWebsite ? `<div>${receiptData.companyWebsite}</div>` : ''}
              ${receiptData.taxId ? `<div>Tax ID: ${receiptData.taxId}</div>` : ''}
            </div>
            
            <h1 class="receipt-title">${receiptTitle}</h1>
          </div>
          
          <!-- Receipt Info -->
          <div class="receipt-info">
            <div>
              ${showReceiptNumber ? `<div><strong>${receiptNumberLabel}</strong> ${receiptData.receiptNumber}</div>` : ''}
              ${showDateTime ? `<div><strong>Date:</strong> ${date}</div>` : ''}
              ${showDateTime ? `<div><strong>Time:</strong> ${time}</div>` : ''}
            </div>
            <div>
              ${showCashierInfo ? `<div><strong>Cashier:</strong> ${receiptData.cashierName}</div>` : ''}
            </div>
          </div>
          
          <!-- Customer Info -->
          ${generateCustomerInfo()}
          
          <!-- Items Table -->
          ${generateItemsTable()}
          
          <!-- Totals -->
          ${generateTotalsSection()}
          
          <!-- Payment Info -->
          ${generatePaymentInfo()}
          
          <!-- Custom Fields -->
          ${generateCustomFields()}
          
          <!-- Footer -->
          <div class="receipt-footer">
            ${thankYouMessage ? `<div style="font-weight: bold; color: ${primaryColor}; margin-bottom: 10px;">${thankYouMessage}</div>` : ''}
            ${returnPolicy ? `<div style="margin-bottom: 10px;">${returnPolicy}</div>` : ''}
            ${contactInfo ? `<div style="margin-bottom: 10px;">${contactInfo}</div>` : ''}
            ${socialMedia ? `<div style="margin-bottom: 10px;">${socialMedia}</div>` : ''}
            ${promotionalMessage ? `<div style="color: ${accentColor}; font-weight: bold; margin-bottom: 10px;">${promotionalMessage}</div>` : ''}
            
            ${receiptData.notes ? `<div style="margin-top: 15px; font-style: italic;">${receiptData.notes}</div>` : ''}
            ${receiptData.terms ? `<div style="margin-top: 10px; font-size: ${fontSize - 2}px; color: ${secondaryColor};">${receiptData.terms}</div>` : ''}
          </div>
        </div>
        
        <!-- QR Code -->
        ${showQRCode ? `
          <div class="qr-code">
            <img src="${generateQRCode(qrCodeData || receiptData.receiptNumber, qrCodeSize)}" alt="QR Code" />
          </div>
        ` : ''}
      </div>
    </body>
    </html>
  `;
};

// Print receipt function
export const printReceiptTemplate = async (
  customization: ReceiptCustomization,
  receiptData: ReceiptData,
  isRTL: boolean = false
): Promise<void> => {
  try {
    const html = generateReceiptHTML(customization, receiptData, isRTL);
    
    // Create a temporary iframe for printing
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.top = '-9999px';
    iframe.style.left = '-9999px';
    iframe.style.width = '210mm';
    iframe.style.height = '297mm';
    
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

    // Wait for fonts and images to load
    await new Promise(resolve => {
      if (doc.readyState === 'complete') {
        resolve(undefined);
      } else {
        iframe.onload = () => resolve(undefined);
      }
    });

    // Wait a bit more for rendering and font loading
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Print
    iframe.contentWindow?.print();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 1000);
    
  } catch (error) {
    console.error('Error printing receipt:', error);
    throw new Error('Failed to print receipt. Please try again.');
  }
};

// Export receipt as PDF function
export const exportReceiptTemplatePDF = async (
  customization: ReceiptCustomization,
  receiptData: ReceiptData,
  isRTL: boolean = false
): Promise<void> => {
  try {
    const html = generateReceiptHTML(customization, receiptData, isRTL);
    
    // Create a temporary div for rendering
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    tempDiv.style.position = 'fixed';
    tempDiv.style.top = '-9999px';
    tempDiv.style.left = '-9999px';
    tempDiv.style.width = '210mm';
    tempDiv.style.zIndex = '-1000';
    
    document.body.appendChild(tempDiv);
    
    // Wait for fonts to load
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const receiptElement = tempDiv.querySelector('.receipt-container') as HTMLElement;
    if (!receiptElement) {
      throw new Error('Receipt element not found');
    }
    
    // Configure html2canvas options
    const canvas = await html2canvas(receiptElement, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: customization.backgroundColor,
      width: receiptElement.scrollWidth,
      height: receiptElement.scrollHeight,
      windowWidth: receiptElement.scrollWidth,
      windowHeight: receiptElement.scrollHeight,
    });
    
    // Calculate PDF dimensions
    const pageWidth = customization.pageSize === 'Thermal' ? 80 : 210;
    const pageHeight = customization.pageSize === 'Thermal' ? 
      (canvas.height * 80) / canvas.width : 297;
    
    // Create PDF
    const pdf = new jsPDF({
      orientation: pageHeight > pageWidth ? 'portrait' : 'landscape',
      unit: 'mm',
      format: customization.pageSize === 'Thermal' ? [80, pageHeight] : customization.pageSize || 'a4'
    });
    
    const imgData = canvas.toDataURL('image/png');
    const imgWidth = pageWidth - (customization.marginLeft + customization.marginRight);
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    pdf.addImage(
      imgData,
      'PNG',
      customization.marginLeft,
      customization.marginTop,
      imgWidth,
      imgHeight
    );
    
    // Generate filename
    const filename = `receipt-${receiptData.receiptNumber}-${new Date().toISOString().split('T')[0]}.pdf`;
    
    // Save PDF
    pdf.save(filename);
    
    // Clean up
    document.body.removeChild(tempDiv);
    
  } catch (error) {
    console.error('Error exporting receipt PDF:', error);
    throw new Error('Failed to export receipt as PDF. Please try again.');
  }
};

// Generate sample receipt data for preview
export const generateSampleReceiptData = (): ReceiptData => {
  return {
    receiptNumber: "RCP-2024-001234",
    dateTime: new Date().toISOString(),
    cashierName: "John Smith",
    customerName: "Alice Johnson",
    customerPhone: "+1 (555) 123-4567",
    customerEmail: "alice@example.com",
    
    companyName: "Your Business Name",
    companyAddress: "123 Main Street, City, State 12345",
    companyPhone: "+1 (555) 987-6543",
    companyEmail: "info@yourbusiness.com",
    companyWebsite: "www.yourbusiness.com",
    taxId: "TAX123456789",
    
    items: [
      {
        id: "1",
        name: "Product A",
        description: "High-quality product with excellent features",
        quantity: 2,
        unitPrice: 25.99,
        discount: 0,
        taxRate: 8.25,
        total: 51.98
      },
      {
        id: "2",
        name: "Service B",
        description: "Professional service consultation",
        quantity: 1,
        unitPrice: 75.00,
        discount: 5.00,
        taxRate: 8.25,
        total: 70.00
      },
      {
        id: "3",
        name: "Product C",
        description: "Premium product with warranty",
        quantity: 1,
        unitPrice: 149.99,
        discount: 15.00,
        taxRate: 8.25,
        total: 134.99
      }
    ],
    
    subtotal: 256.97,
    taxAmount: 21.20,
    discountAmount: 20.00,
    totalAmount: 258.17,
    amountPaid: 260.00,
    changeAmount: 1.83,
    
    paymentMethod: "card",
    transactionId: "TXN-789012345",
    cardLast4: "4567",
    cardType: "Visa",
    
    notes: "Thank you for choosing our services!",
    terms: "All sales are final. Returns accepted within 30 days with receipt."
  };
};
