import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import React from "react";
import { createRoot } from "react-dom/client";

interface TemplateCustomization {
  id: string;
  name: string;
  
  // Brand & Logo
  companyLogo: string;
  logoPosition: "left" | "center" | "right";
  logoSize: number;
  logoOpacity: number;
  showWatermark: boolean;
  watermarkText: string;
  
  // Colors & Theme
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  headerBgColor: string;
  footerBgColor: string;
  borderColor: string;
  
  // Typography
  fontFamily: string;
  headerFontFamily: string;
  fontSize: number;
  headerFontSize: number;
  lineHeight: number;
  letterSpacing: number;
  fontWeight: "normal" | "medium" | "semibold" | "bold";
  
  // Layout & Structure
  headerStyle: "minimal" | "standard" | "detailed" | "modern" | "classic";
  footerStyle: "simple" | "detailed" | "none" | "compact" | "signature";
  layout: "single-column" | "two-column" | "sidebar" | "modern-card" | "invoice-pro";
  pageSize: "A4" | "Letter" | "A5" | "Legal";
  orientation: "portrait" | "landscape";
  margins: number;
  
  // Visual Elements
  borderStyle: "none" | "subtle" | "bold" | "dashed" | "dotted";
  borderRadius: number;
  spacing: number;
  shadowIntensity: number;
  gradientEnabled: boolean;
  gradientDirection: "to-right" | "to-bottom" | "to-br" | "to-tr";
  
  // Content Sections
  showCompanyInfo: boolean;
  showClientInfo: boolean;
  showPaymentTerms: boolean;
  showNotes: boolean;
  showTaxDetails: boolean;
  showShippingInfo: boolean;
  showDiscounts: boolean;
  showSignature: boolean;
  
  // Table & Items
  itemTableStyle: "simple" | "striped" | "bordered" | "modern" | "minimal";
  showItemImages: boolean;
  showItemCodes: boolean;
  showItemCategories: boolean;
  alternateRowColors: boolean;
  tableHeaderStyle: "simple" | "gradient" | "solid" | "outlined";
  
  // Numbers & Currency
  currencyPosition: "before" | "after";
  currencySymbol: string;
  decimalPlaces: number;
  thousandsSeparator: "," | "." | " ";
  decimalSeparator: "." | ",";
  dateFormat: "MM/DD/YYYY" | "DD/MM/YYYY" | "YYYY-MM-DD" | "DD-MM-YYYY";
  timeFormat: "12h" | "24h";
  
  // Advanced Features
  qrCodeEnabled: boolean;
  qrCodePosition: "header" | "footer" | "sidebar";
  barcodeEnabled: boolean;
  multiLanguage: boolean;
  rtlSupport: boolean;
  
  // Branding & Professional
  showPoweredBy: boolean;
  customCSS: string;
  templateVersion: string;
  
  // Custom Fields
  customFields: Array<{
    id: string;
    label: string;
    type: "text" | "number" | "date" | "email" | "url" | "textarea";
    required: boolean;
    position: "header" | "body" | "footer";
    width: "full" | "half" | "third";
    placeholder?: string;
    defaultValue?: string;
  }>;
}

interface InvoiceData {
  id: string;
  elementNumber: string;
  date: string;
  dueDate: string;
  status: string;
  
  // Company Info
  company: {
    name: string;
    address: string;
    city: string;
    phone: string;
    email: string;
    website?: string;
    taxId?: string;
  };
  
  // Client Info
  client: {
    name: string;
    address: string;
    city: string;
    email: string;
    phone?: string;
  };
  
  // Items
  items: Array<{
    id: string;
    description: string;
    code?: string;
    category?: string;
    quantity: number;
    price: number;
    total: number;
    image?: string;
  }>;
  
  // Totals
  subtotal: number;
  tax: number;
  taxRate: number;
  discount: number;
  discountType: "percentage" | "fixed";
  total: number;
  
  // Additional
  notes?: string;
  terms?: string;
  shippingCost?: number;
}

// Generate the complete invoice HTML based on customization
const generateInvoiceHTML = (
  customization: TemplateCustomization, 
  invoiceData: InvoiceData, 
  isRTL: boolean = false,
  mode: "print" | "pdf" = "print"
) => {
  const formatCurrency = (amount: number) => {
    const formattedAmount = amount.toFixed(customization.decimalPlaces);
    const parts = formattedAmount.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, customization.thousandsSeparator);
    const finalAmount = parts.join(customization.decimalSeparator);
    
    return customization.currencyPosition === 'before' 
      ? `${customization.currencySymbol}${finalAmount}`
      : `${finalAmount}${customization.currencySymbol}`;
  };

  const gradientStyle = customization.gradientEnabled ? 
    `background: linear-gradient(${customization.gradientDirection}, ${customization.primaryColor}, ${customization.secondaryColor})` : 
    `background-color: ${customization.primaryColor}`;

  return `
    <!DOCTYPE html>
    <html dir="${isRTL ? 'rtl' : 'ltr'}">
      <head>
        <meta charset="UTF-8">
        <title>Invoice ${invoiceData.elementNumber}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=${customization.fontFamily.replace(' ', '+')}&family=${customization.headerFontFamily.replace(' ', '+')}&display=swap');
          
          @page {
            size: ${customization.pageSize === 'A4' ? 'A4' : 
                   customization.pageSize === 'Letter' ? '8.5in 11in' :
                   customization.pageSize === 'A5' ? 'A5' : 
                   '8.5in 14in'};
            margin: ${customization.margins}mm;
            orientation: ${customization.orientation};
          }

          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: '${customization.fontFamily}', Arial, sans-serif;
            font-size: ${customization.fontSize}px;
            line-height: ${customization.lineHeight};
            letter-spacing: ${customization.letterSpacing}px;
            font-weight: ${customization.fontWeight};
            color: ${customization.textColor};
            background-color: ${customization.backgroundColor};
            direction: ${isRTL ? 'rtl' : 'ltr'};
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }

          .invoice-container {
            max-width: 100%;
            margin: 0 auto;
            padding: ${customization.spacing}px;
            position: relative;
          }

          .invoice-header {
            ${gradientStyle};
            color: white;
            padding: ${customization.spacing * 1.5}px;
            border-radius: ${customization.borderRadius}px;
            margin-bottom: ${customization.spacing}px;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            ${customization.shadowIntensity > 0 ? `box-shadow: 0 ${customization.shadowIntensity}px ${customization.shadowIntensity * 2}px rgba(0,0,0,0.1);` : ''}
          }

          .header-left {
            flex: 1;
          }

          .header-right {
            text-align: ${customization.logoPosition === 'left' ? 'left' : customization.logoPosition === 'right' ? 'right' : 'center'};
          }

          .invoice-title {
            font-family: '${customization.headerFontFamily}', serif;
            font-size: ${customization.headerFontSize}px;
            font-weight: bold;
            margin-bottom: 8px;
          }

          .invoice-number {
            font-size: ${customization.fontSize + 2}px;
            opacity: 0.9;
          }

          .company-logo {
            max-height: ${customization.logoSize}px;
            opacity: ${customization.logoOpacity / 100};
            border-radius: ${customization.borderRadius / 2}px;
          }

          .info-section {
            display: ${customization.layout === 'single-column' ? 'block' : 'grid'};
            grid-template-columns: ${customization.layout === 'two-column' ? '1fr 1fr' : 
                                   customization.layout === 'sidebar' ? '300px 1fr' : '1fr'};
            gap: ${customization.spacing * 2}px;
            margin-bottom: ${customization.spacing * 2}px;
          }

          .company-info, .client-info {
            ${customization.borderStyle !== 'none' ? `border: 1px ${customization.borderStyle} ${customization.borderColor};` : ''}
            border-radius: ${customization.borderRadius}px;
            padding: ${customization.spacing}px;
            background-color: ${customization.headerBgColor};
          }

          .info-title {
            font-weight: bold;
            color: ${customization.primaryColor};
            margin-bottom: ${customization.spacing / 2}px;
            font-size: ${customization.fontSize + 2}px;
          }

          .invoice-details {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: ${customization.spacing}px;
            margin-bottom: ${customization.spacing * 2}px;
            padding: ${customization.spacing}px;
            ${customization.borderStyle !== 'none' ? `border: 1px ${customization.borderStyle} ${customization.borderColor};` : ''}
            border-radius: ${customization.borderRadius}px;
            background-color: ${customization.headerBgColor};
          }

          .detail-item {
            display: flex;
            justify-content: space-between;
            padding: ${customization.spacing / 2}px 0;
          }

          .detail-label {
            font-weight: 500;
            color: ${customization.secondaryColor};
          }

          .detail-value {
            font-weight: bold;
            color: ${customization.textColor};
          }

          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: ${customization.spacing * 2}px;
            ${customization.borderStyle !== 'none' ? `border: 1px ${customization.borderStyle} ${customization.borderColor};` : ''}
            border-radius: ${customization.borderRadius}px;
            overflow: hidden;
            ${customization.shadowIntensity > 0 ? `box-shadow: 0 ${customization.shadowIntensity}px ${customization.shadowIntensity * 2}px rgba(0,0,0,0.1);` : ''}
          }

          .items-table th {
            ${customization.tableHeaderStyle === 'gradient' ? gradientStyle : 
              customization.tableHeaderStyle === 'solid' ? `background-color: ${customization.primaryColor}` :
              `background-color: ${customization.headerBgColor}`};
            color: ${customization.tableHeaderStyle === 'solid' || customization.tableHeaderStyle === 'gradient' ? 'white' : customization.primaryColor};
            padding: ${customization.spacing}px;
            text-align: left;
            font-weight: bold;
            ${customization.itemTableStyle === 'bordered' ? `border: 1px solid ${customization.borderColor};` : ''}
          }

          .items-table td {
            padding: ${customization.spacing}px;
            ${customization.itemTableStyle === 'bordered' ? `border: 1px solid ${customization.borderColor};` : ''}
            ${customization.itemTableStyle === 'striped' ? 'border-bottom: 1px solid #e5e7eb;' : ''}
          }

          .items-table tr:nth-child(even) {
            ${customization.alternateRowColors && customization.itemTableStyle === 'striped' ? 'background-color: #f9fafb;' : ''}
          }

          .totals-section {
            display: flex;
            justify-content: flex-end;
            margin-bottom: ${customization.spacing * 2}px;
          }

          .totals-table {
            min-width: 300px;
            ${customization.borderStyle !== 'none' ? `border: 1px ${customization.borderStyle} ${customization.borderColor};` : ''}
            border-radius: ${customization.borderRadius}px;
            overflow: hidden;
            background-color: ${customization.headerBgColor};
          }

          .totals-table tr {
            display: flex;
            justify-content: space-between;
            padding: ${customization.spacing / 2}px ${customization.spacing}px;
          }

          .totals-table .total-row {
            background-color: ${customization.primaryColor};
            color: white;
            font-weight: bold;
            font-size: ${customization.fontSize + 2}px;
          }

          .notes-section, .terms-section {
            margin-bottom: ${customization.spacing * 2}px;
            ${customization.borderStyle !== 'none' ? `border: 1px ${customization.borderStyle} ${customization.borderColor};` : ''}
            border-radius: ${customization.borderRadius}px;
            padding: ${customization.spacing}px;
            background-color: ${customization.headerBgColor};
          }

          .section-title {
            font-weight: bold;
            color: ${customization.primaryColor};
            margin-bottom: ${customization.spacing / 2}px;
            font-size: ${customization.fontSize + 2}px;
          }

          .footer {
            ${customization.footerStyle !== 'none' ? `
              text-align: center;
              padding: ${customization.spacing}px;
              background-color: ${customization.footerBgColor};
              border-radius: ${customization.borderRadius}px;
              margin-top: ${customization.spacing * 2}px;
              ${customization.borderStyle !== 'none' ? `border: 1px ${customization.borderStyle} ${customization.borderColor};` : ''}
            ` : 'display: none;'}
          }

          .custom-field {
            margin-bottom: ${customization.spacing / 2}px;
          }

          .custom-field-label {
            font-weight: 500;
            color: ${customization.secondaryColor};
            margin-bottom: 2px;
          }

          .custom-field-value {
            color: ${customization.textColor};
            padding: 4px 8px;
            ${customization.borderStyle !== 'none' ? `border: 1px ${customization.borderStyle} ${customization.borderColor};` : ''}
            border-radius: ${customization.borderRadius / 2}px;
            background-color: white;
          }

          .watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 4rem;
            font-weight: bold;
            color: ${customization.primaryColor};
            opacity: 0.1;
            pointer-events: none;
            z-index: 0;
            ${customization.showWatermark ? '' : 'display: none;'}
          }

          .qr-code {
            ${customization.qrCodeEnabled ? `
              position: absolute;
              ${customization.qrCodePosition === 'header' ? 'top: 20px; right: 20px;' :
                customization.qrCodePosition === 'footer' ? 'bottom: 20px; right: 20px;' :
                'top: 50%; right: 20px; transform: translateY(-50%);'}
              width: 80px;
              height: 80px;
              background: white;
              border: 2px solid ${customization.primaryColor};
              border-radius: ${customization.borderRadius}px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 10px;
              color: ${customization.primaryColor};
            ` : 'display: none;'}
          }

          ${customization.customCSS}

          @media print {
            body {
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            .invoice-container {
              padding: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          ${customization.showWatermark && customization.watermarkText ? `
            <div class="watermark">${customization.watermarkText}</div>
          ` : ''}
          
          ${customization.qrCodeEnabled ? `
            <div class="qr-code">QR CODE</div>
          ` : ''}

          <!-- Header -->
          <div class="invoice-header">
            <div class="header-left">
              <div class="invoice-title">INVOICE</div>
              <div class="invoice-number">${invoiceData.elementNumber}</div>
              <div style="margin-top: 8px; font-size: ${customization.fontSize - 1}px;">
                Status: <strong style="color: ${customization.accentColor}">${invoiceData.status}</strong>
              </div>
            </div>
            <div class="header-right">
              ${customization.companyLogo ? `
                <img src="${customization.companyLogo}" alt="Company Logo" class="company-logo">
              ` : `
                <div style="width: ${customization.logoSize}px; height: ${customization.logoSize}px; border: 2px dashed rgba(255,255,255,0.5); border-radius: ${customization.borderRadius}px; display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,0.7); font-size: 12px;">
                  LOGO
                </div>
              `}
            </div>
          </div>

          <!-- Company and Client Info -->
          ${customization.showCompanyInfo || customization.showClientInfo ? `
            <div class="info-section">
              ${customization.showCompanyInfo ? `
                <div class="company-info">
                  <div class="info-title">From:</div>
                  <div><strong>${invoiceData.company.name}</strong></div>
                  <div>${invoiceData.company.address}</div>
                  <div>${invoiceData.company.city}</div>
                  <div>Phone: ${invoiceData.company.phone}</div>
                  <div>Email: ${invoiceData.company.email}</div>
                  ${invoiceData.company.website ? `<div>Website: ${invoiceData.company.website}</div>` : ''}
                  ${invoiceData.company.taxId ? `<div>Tax ID: ${invoiceData.company.taxId}</div>` : ''}
                </div>
              ` : ''}
              
              ${customization.showClientInfo ? `
                <div class="client-info">
                  <div class="info-title">To:</div>
                  <div><strong>${invoiceData.client.name}</strong></div>
                  <div>${invoiceData.client.address}</div>
                  <div>${invoiceData.client.city}</div>
                  <div>Email: ${invoiceData.client.email}</div>
                  ${invoiceData.client.phone ? `<div>Phone: ${invoiceData.client.phone}</div>` : ''}
                </div>
              ` : ''}
            </div>
          ` : ''}

          <!-- Invoice Details -->
          <div class="invoice-details">
            <div class="detail-item">
              <span class="detail-label">Invoice Date:</span>
              <span class="detail-value">${invoiceData.date}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Due Date:</span>
              <span class="detail-value">${invoiceData.dueDate}</span>
            </div>
            ${customization.showPaymentTerms ? `
              <div class="detail-item">
                <span class="detail-label">Payment Terms:</span>
                <span class="detail-value">Net 30</span>
              </div>
            ` : ''}
            ${customization.showShippingInfo && invoiceData.shippingCost ? `
              <div class="detail-item">
                <span class="detail-label">Shipping:</span>
                <span class="detail-value">${formatCurrency(invoiceData.shippingCost)}</span>
              </div>
            ` : ''}
          </div>

          <!-- Custom Fields in Header -->
          ${customization.customFields.filter(field => field.position === 'header').map(field => `
            <div class="custom-field">
              <div class="custom-field-label">${field.label}:</div>
              <div class="custom-field-value">[${field.type} field]</div>
            </div>
          `).join('')}

          <!-- Items Table -->
          <table class="items-table">
            <thead>
              <tr>
                <th>Description</th>
                ${customization.showItemCodes ? '<th>Code</th>' : ''}
                ${customization.showItemCategories ? '<th>Category</th>' : ''}
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Rate</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${invoiceData.items.map(item => `
                <tr>
                  <td>
                    ${customization.showItemImages && item.image ? `
                      <div style="display: flex; align-items: center; gap: 10px;">
                        <img src="${item.image}" alt="${item.description}" style="width: 40px; height: 40px; border-radius: ${customization.borderRadius / 2}px; object-fit: cover;">
                        <span>${item.description}</span>
                      </div>
                    ` : item.description}
                  </td>
                  ${customization.showItemCodes ? `<td style="font-family: monospace; font-size: ${customization.fontSize - 1}px;">${item.code || '-'}</td>` : ''}
                  ${customization.showItemCategories ? `<td>${item.category || '-'}</td>` : ''}
                  <td style="text-align: center;">${item.quantity}</td>
                  <td style="text-align: right;">${formatCurrency(item.price)}</td>
                  <td style="text-align: right; font-weight: bold;">${formatCurrency(item.total)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <!-- Custom Fields in Body -->
          ${customization.customFields.filter(field => field.position === 'body').map(field => `
            <div class="custom-field">
              <div class="custom-field-label">${field.label}:</div>
              <div class="custom-field-value">[${field.type} field]</div>
            </div>
          `).join('')}

          <!-- Totals -->
          <div class="totals-section">
            <div class="totals-table">
              <div style="display: flex; justify-content: space-between; padding: ${customization.spacing / 2}px ${customization.spacing}px;">
                <span>Subtotal:</span>
                <span>${formatCurrency(invoiceData.subtotal)}</span>
              </div>
              
              ${customization.showDiscounts && invoiceData.discount > 0 ? `
                <div style="display: flex; justify-content: space-between; padding: ${customization.spacing / 2}px ${customization.spacing}px;">
                  <span>Discount ${invoiceData.discountType === 'percentage' ? '(%)' : ''}:</span>
                  <span style="color: ${customization.accentColor};">-${formatCurrency(invoiceData.discount)}</span>
                </div>
              ` : ''}
              
              ${customization.showTaxDetails && invoiceData.tax > 0 ? `
                <div style="display: flex; justify-content: space-between; padding: ${customization.spacing / 2}px ${customization.spacing}px;">
                  <span>Tax (${invoiceData.taxRate}%):</span>
                  <span>${formatCurrency(invoiceData.tax)}</span>
                </div>
              ` : ''}
              
              ${customization.showShippingInfo && invoiceData.shippingCost ? `
                <div style="display: flex; justify-content: space-between; padding: ${customization.spacing / 2}px ${customization.spacing}px;">
                  <span>Shipping:</span>
                  <span>${formatCurrency(invoiceData.shippingCost)}</span>
                </div>
              ` : ''}
              
              <div class="total-row">
                <span>Total:</span>
                <span>${formatCurrency(invoiceData.total)}</span>
              </div>
            </div>
          </div>

          <!-- Notes -->
          ${customization.showNotes && invoiceData.notes ? `
            <div class="notes-section">
              <div class="section-title">Notes:</div>
              <div>${invoiceData.notes}</div>
            </div>
          ` : ''}

          <!-- Payment Terms -->
          ${customization.showPaymentTerms && invoiceData.terms ? `
            <div class="terms-section">
              <div class="section-title">Payment Terms:</div>
              <div>${invoiceData.terms}</div>
            </div>
          ` : ''}

          <!-- Custom Fields in Footer -->
          ${customization.customFields.filter(field => field.position === 'footer').map(field => `
            <div class="custom-field">
              <div class="custom-field-label">${field.label}:</div>
              <div class="custom-field-value">[${field.type} field]</div>
            </div>
          `).join('')}

          <!-- Signature -->
          ${customization.showSignature ? `
            <div style="margin-top: ${customization.spacing * 3}px; display: flex; justify-content: space-between;">
              <div style="text-align: center; width: 200px;">
                <div style="border-top: 2px solid ${customization.borderColor}; margin-bottom: 8px;"></div>
                <div style="font-weight: bold;">Authorized Signature</div>
                <div style="font-size: ${customization.fontSize - 1}px; color: ${customization.secondaryColor};">Date: ${new Date().toLocaleDateString()}</div>
              </div>
              <div style="text-align: center; width: 200px;">
                <div style="border-top: 2px solid ${customization.borderColor}; margin-bottom: 8px;"></div>
                <div style="font-weight: bold;">Client Signature</div>
                <div style="font-size: ${customization.fontSize - 1}px; color: ${customization.secondaryColor};">Date: ___________</div>
              </div>
            </div>
          ` : ''}

          <!-- Footer -->
          ${customization.footerStyle !== 'none' ? `
            <div class="footer">
              ${customization.footerStyle === 'detailed' ? `
                <div style="margin-bottom: 8px; font-weight: bold;">Thank you for your business!</div>
                <div style="font-size: ${customization.fontSize - 1}px;">
                  Payment is due within 30 days. Late payments may incur additional fees.
                </div>
                ${customization.showPoweredBy ? `
                  <div style="margin-top: 8px; font-size: ${customization.fontSize - 2}px; color: ${customization.secondaryColor};">
                    Generated by Advanced Invoice System v${customization.templateVersion}
                  </div>
                ` : ''}
              ` : customization.footerStyle === 'simple' ? `
                <div>Thank you for your business!</div>
              ` : customization.footerStyle === 'compact' ? `
                <div style="font-size: ${customization.fontSize - 1}px;">
                  ${invoiceData.company.name} | ${invoiceData.company.phone} | ${invoiceData.company.email}
                </div>
              ` : ''}
            </div>
          ` : ''}
        </div>
      </body>
    </html>
  `;
};

// Print invoice using the designed template
export const printInvoiceTemplate = async (
  customization: TemplateCustomization,
  invoiceData: InvoiceData,
  isRTL: boolean = false
) => {
  try {
    const printWindow = window.open("", "_blank", "width=1200,height=800");
    if (!printWindow) {
      throw new Error("Failed to open print window");
    }

    const htmlContent = generateInvoiceHTML(customization, invoiceData, isRTL, "print");
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // Wait for content to load before printing
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 1000);
    };

    return true;
  } catch (error) {
    console.error("Print failed:", error);
    throw error;
  }
};

// Export invoice as PDF using the designed template
export const exportInvoiceTemplatePDF = async (
  customization: TemplateCustomization,
  invoiceData: InvoiceData,
  isRTL: boolean = false
) => {
  try {
    // Create a temporary container for rendering
    const tempContainer = document.createElement("div");
    tempContainer.style.position = "absolute";
    tempContainer.style.left = "-9999px";
    tempContainer.style.top = "-9999px";
    tempContainer.style.width = "794px"; // A4 width at 96 DPI
    tempContainer.style.background = "white";
    tempContainer.style.fontFamily = customization.fontFamily;
    
    // Add Google Fonts
    const fontLink = document.createElement("link");
    fontLink.href = `https://fonts.googleapis.com/css2?family=${customization.fontFamily.replace(' ', '+')}:wght@300;400;500;600;700&family=${customization.headerFontFamily.replace(' ', '+')}:wght@300;400;500;600;700&display=swap`;
    fontLink.rel = "stylesheet";
    document.head.appendChild(fontLink);
    
    const htmlContent = generateInvoiceHTML(customization, invoiceData, isRTL, "pdf");
    tempContainer.innerHTML = htmlContent.match(/<body[^>]*>([\s\S]*)<\/body>/i)?.[1] || htmlContent;
    
    // Apply the styles from the generated HTML
    const styleMatch = htmlContent.match(/<style>([\s\S]*?)<\/style>/);
    if (styleMatch) {
      const style = document.createElement("style");
      style.textContent = styleMatch[1];
      document.head.appendChild(style);
    }
    
    document.body.appendChild(tempContainer);

    // Wait for fonts and images to load
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Convert to canvas with high quality
    const canvas = await html2canvas(tempContainer, {
      scale: 3, // Higher scale for better quality
      useCORS: true,
      allowTaint: false,
      backgroundColor: customization.backgroundColor,
      width: 794,
      height: Math.max(1123, tempContainer.scrollHeight), // A4 height minimum
      removeContainer: false,
      imageTimeout: 15000,
      logging: false,
    });

    // Create PDF
    const imgData = canvas.toDataURL('image/png', 1.0);
    const pdf = new jsPDF({
      orientation: customization.orientation === 'landscape' ? 'landscape' : 'portrait',
      unit: 'px',
      format: customization.pageSize === 'A4' ? [794, 1123] : 
              customization.pageSize === 'Letter' ? [816, 1056] :
              customization.pageSize === 'A5' ? [559, 794] :
              [816, 1344] // Legal
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgAspectRatio = canvas.width / canvas.height;
    const pdfAspectRatio = pdfWidth / pdfHeight;

    let imgWidth, imgHeight;
    if (imgAspectRatio > pdfAspectRatio) {
      imgWidth = pdfWidth;
      imgHeight = pdfWidth / imgAspectRatio;
    } else {
      imgHeight = pdfHeight;
      imgWidth = pdfHeight * imgAspectRatio;
    }

    const x = (pdfWidth - imgWidth) / 2;
    const y = (pdfHeight - imgHeight) / 2;

    pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight, '', 'FAST');

    // Cleanup
    document.body.removeChild(tempContainer);
    document.head.removeChild(fontLink);
    if (styleMatch) {
      const addedStyle = document.head.querySelector('style:last-of-type');
      if (addedStyle) document.head.removeChild(addedStyle);
    }

    // Save PDF
    pdf.save(`invoice-${invoiceData.elementNumber.replace(/[^a-z0-9]/gi, '-')}.pdf`);
    
    return true;
  } catch (error) {
    console.error("PDF generation failed:", error);
    throw error;
  }
};

// Generate sample invoice data for preview/testing
export const generateSampleInvoiceData = (): InvoiceData => {
  return {
    id: "INV-001",
    elementNumber: "INV-2024-001",
    date: new Date().toLocaleDateString(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    status: "Draft",
    
    company: {
      name: "Your Company Name",
      address: "123 Business Street",
      city: "Business City, State 12345",
      phone: "+1 (555) 123-4567",
      email: "contact@yourcompany.com",
      website: "www.yourcompany.com",
      taxId: "TAX-123456789"
    },
    
    client: {
      name: "Client Company Ltd",
      address: "456 Client Avenue",
      city: "Client City, State 67890",
      email: "billing@clientcompany.com",
      phone: "+1 (555) 987-6543"
    },
    
    items: [
      {
        id: "1",
        description: "Web Development Services",
        code: "WEB-001",
        category: "Development",
        quantity: 1,
        price: 2500.00,
        total: 2500.00
      },
      {
        id: "2", 
        description: "UI/UX Design Consultation",
        code: "DES-001",
        category: "Design",
        quantity: 3,
        price: 150.00,
        total: 450.00
      },
      {
        id: "3",
        description: "Project Management",
        code: "PM-001", 
        category: "Management",
        quantity: 2,
        price: 200.00,
        total: 400.00
      }
    ],
    
    subtotal: 3350.00,
    tax: 335.00,
    taxRate: 10,
    discount: 167.50,
    discountType: "fixed",
    total: 3517.50,
    shippingCost: 0,
    
    notes: "Thank you for your business! Payment is due within 30 days of invoice date. Please include the invoice number with your payment.",
    terms: "Payment is due within 30 days. Late payments may incur a 1.5% monthly fee. All work performed is subject to our standard terms and conditions."
  };
};
