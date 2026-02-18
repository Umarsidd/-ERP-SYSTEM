export interface InvoiceTemplate {
  id: string;
  name: string;
  description: string;
  category: "business" | "creative" | "minimal" | "modern" | "classic" | "luxury" | "tech" | "medical" | "retail" | "service";
  style: "professional" | "elegant" | "bold" | "clean" | "artistic" | "luxury" | "geometric" | "organic" | "vintage" | "futuristic";
  premium: boolean;
  popular: boolean;
  new: boolean;
  featured: boolean;
  previewImage: string;
  colors: string[];
  features: string[];
  rating: number;
  downloads: number;
  industry: string;
  tags: string[];
  templateData: {
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
  };
}

export const invoiceTemplates: InvoiceTemplate[] = [
  {
    id: "corporate-pro",
    name: "Corporate Professional",
    description: "Ultimate professional template for corporate businesses with advanced features",
    category: "business",
    style: "professional",
    premium: true,
    popular: true,
    new: false,
    featured: true,
    previewImage: "/api/placeholder/300/400",
    colors: ["#1e40af", "#3b82f6", "#60a5fa"],
    features: ["Advanced Layout", "Custom Branding", "Multi-currency", "Digital Signature", "QR Codes"],
    rating: 4.9,
    downloads: 25430,
    industry: "Corporate Business",
    tags: ["corporate", "professional", "advanced", "enterprise"],
    templateData: {
      companyLogo: "",
      logoPosition: "left",
      logoSize: 120,
      logoOpacity: 100,
      showWatermark: false,
      watermarkText: "",
      primaryColor: "#1e40af",
      secondaryColor: "#64748b",
      accentColor: "#3b82f6",
      backgroundColor: "#ffffff",
      textColor: "#1f2937",
      headerBgColor: "#f8fafc",
      footerBgColor: "#f1f5f9",
      borderColor: "#e2e8f0",
      fontFamily: "Inter",
      headerFontFamily: "Inter",
      fontSize: 14,
      headerFontSize: 28,
      lineHeight: 1.6,
      letterSpacing: 0,
      fontWeight: "normal",
      headerStyle: "detailed",
      footerStyle: "detailed",
      layout: "two-column",
      pageSize: "A4",
      orientation: "portrait",
      margins: 20,
      borderStyle: "subtle",
      borderRadius: 8,
      spacing: 20,
      shadowIntensity: 2,
      gradientEnabled: true,
      gradientDirection: "to-br",
      showCompanyInfo: true,
      showClientInfo: true,
      showPaymentTerms: true,
      showNotes: true,
      showTaxDetails: true,
      showShippingInfo: true,
      showDiscounts: true,
      showSignature: true,
      itemTableStyle: "modern",
      showItemImages: true,
      showItemCodes: true,
      showItemCategories: true,
      alternateRowColors: true,
      tableHeaderStyle: "gradient",
      currencyPosition: "before",
      currencySymbol: "$",
      decimalPlaces: 2,
      thousandsSeparator: ",",
      decimalSeparator: ".",
      dateFormat: "MM/DD/YYYY",
      timeFormat: "12h",
      qrCodeEnabled: true,
      qrCodePosition: "footer",
      barcodeEnabled: true,
      multiLanguage: true,
      rtlSupport: true,
      showPoweredBy: false,
      customCSS: "",
      templateVersion: "2.0"
    }
  },
  {
    id: "minimal-elegance",
    name: "Minimal Elegance",
    description: "Clean, minimalist design with elegant typography and spacious layout",
    category: "minimal",
    style: "elegant",
    premium: false,
    popular: true,
    new: false,
    featured: true,
    previewImage: "/api/placeholder/300/400",
    colors: ["#000000", "#ffffff", "#6b7280"],
    features: ["Clean Design", "Typography Focus", "Scandinavian Style", "Print Optimized"],
    rating: 4.8,
    downloads: 18920,
    industry: "Design Studios",
    tags: ["minimal", "clean", "elegant", "scandinavian"],
    templateData: {
      companyLogo: "",
      logoPosition: "center",
      logoSize: 100,
      logoOpacity: 100,
      showWatermark: false,
      watermarkText: "",
      primaryColor: "#000000",
      secondaryColor: "#6b7280",
      accentColor: "#374151",
      backgroundColor: "#ffffff",
      textColor: "#1f2937",
      headerBgColor: "#ffffff",
      footerBgColor: "#f9fafb",
      borderColor: "#e5e7eb",
      fontFamily: "Inter",
      headerFontFamily: "Inter",
      fontSize: 14,
      headerFontSize: 32,
      lineHeight: 1.8,
      letterSpacing: 0.5,
      fontWeight: "normal",
      headerStyle: "minimal",
      footerStyle: "simple",
      layout: "single-column",
      pageSize: "A4",
      orientation: "portrait",
      margins: 30,
      borderStyle: "none",
      borderRadius: 0,
      spacing: 24,
      shadowIntensity: 0,
      gradientEnabled: false,
      gradientDirection: "to-right",
      showCompanyInfo: true,
      showClientInfo: true,
      showPaymentTerms: true,
      showNotes: true,
      showTaxDetails: true,
      showShippingInfo: false,
      showDiscounts: true,
      showSignature: false,
      itemTableStyle: "minimal",
      showItemImages: false,
      showItemCodes: false,
      showItemCategories: false,
      alternateRowColors: false,
      tableHeaderStyle: "simple",
      currencyPosition: "before",
      currencySymbol: "$",
      decimalPlaces: 2,
      thousandsSeparator: ",",
      decimalSeparator: ".",
      dateFormat: "DD/MM/YYYY",
      timeFormat: "24h",
      qrCodeEnabled: false,
      qrCodePosition: "footer",
      barcodeEnabled: false,
      multiLanguage: false,
      rtlSupport: false,
      showPoweredBy: false,
      customCSS: "",
      templateVersion: "1.0"
    }
  },
  {
    id: "luxury-gold",
    name: "Luxury Gold Edition",
    description: "Premium luxury template with gold accents for high-end businesses",
    category: "luxury",
    style: "luxury",
    premium: true,
    popular: true,
    new: true,
    featured: true,
    previewImage: "/api/placeholder/300/400",
    colors: ["#d97706", "#92400e", "#1f2937"],
    features: ["Gold Accents", "Luxury Styling", "Premium Feel", "Executive Layout"],
    rating: 4.9,
    downloads: 12350,
    industry: "Luxury Services",
    tags: ["luxury", "gold", "premium", "executive"],
    templateData: {
      companyLogo: "",
      logoPosition: "center",
      logoSize: 140,
      logoOpacity: 100,
      showWatermark: true,
      watermarkText: "PREMIUM",
      primaryColor: "#d97706",
      secondaryColor: "#92400e",
      accentColor: "#f59e0b",
      backgroundColor: "#fefdf9",
      textColor: "#1f2937",
      headerBgColor: "#fef3c7",
      footerBgColor: "#fef3c7",
      borderColor: "#d97706",
      fontFamily: "Playfair Display",
      headerFontFamily: "Playfair Display",
      fontSize: 15,
      headerFontSize: 36,
      lineHeight: 1.7,
      letterSpacing: 0.3,
      fontWeight: "normal",
      headerStyle: "detailed",
      footerStyle: "signature",
      layout: "modern-card",
      pageSize: "A4",
      orientation: "portrait",
      margins: 25,
      borderStyle: "bold",
      borderRadius: 12,
      spacing: 24,
      shadowIntensity: 3,
      gradientEnabled: true,
      gradientDirection: "to-br",
      showCompanyInfo: true,
      showClientInfo: true,
      showPaymentTerms: true,
      showNotes: true,
      showTaxDetails: true,
      showShippingInfo: true,
      showDiscounts: true,
      showSignature: true,
      itemTableStyle: "bordered",
      showItemImages: true,
      showItemCodes: true,
      showItemCategories: true,
      alternateRowColors: true,
      tableHeaderStyle: "gradient",
      currencyPosition: "before",
      currencySymbol: "$",
      decimalPlaces: 2,
      thousandsSeparator: ",",
      decimalSeparator: ".",
      dateFormat: "DD/MM/YYYY",
      timeFormat: "12h",
      qrCodeEnabled: true,
      qrCodePosition: "header",
      barcodeEnabled: false,
      multiLanguage: true,
      rtlSupport: true,
      showPoweredBy: false,
      customCSS: "",
      templateVersion: "3.0"
    }
  },
  {
    id: "tech-startup",
    name: "Tech Startup",
    description: "Modern tech-focused design perfect for startups and SaaS companies",
    category: "tech",
    style: "futuristic",
    premium: false,
    popular: true,
    new: true,
    featured: true,
    previewImage: "/api/placeholder/300/400",
    colors: ["#3b82f6", "#1e293b", "#0f172a"],
    features: ["Tech Aesthetics", "Startup Friendly", "Modern Colors", "SaaS Optimized"],
    rating: 4.8,
    downloads: 15670,
    industry: "Technology",
    tags: ["tech", "startup", "modern", "saas"],
    templateData: {
      companyLogo: "",
      logoPosition: "left",
      logoSize: 110,
      logoOpacity: 100,
      showWatermark: false,
      watermarkText: "",
      primaryColor: "#3b82f6",
      secondaryColor: "#1e293b",
      accentColor: "#06b6d4",
      backgroundColor: "#ffffff",
      textColor: "#0f172a",
      headerBgColor: "#f0f9ff",
      footerBgColor: "#f8fafc",
      borderColor: "#e2e8f0",
      fontFamily: "JetBrains Mono",
      headerFontFamily: "Inter",
      fontSize: 13,
      headerFontSize: 30,
      lineHeight: 1.5,
      letterSpacing: 0,
      fontWeight: "normal",
      headerStyle: "modern",
      footerStyle: "compact",
      layout: "sidebar",
      pageSize: "A4",
      orientation: "portrait",
      margins: 18,
      borderStyle: "subtle",
      borderRadius: 6,
      spacing: 16,
      shadowIntensity: 1,
      gradientEnabled: true,
      gradientDirection: "to-br",
      showCompanyInfo: true,
      showClientInfo: true,
      showPaymentTerms: true,
      showNotes: true,
      showTaxDetails: true,
      showShippingInfo: false,
      showDiscounts: true,
      showSignature: false,
      itemTableStyle: "modern",
      showItemImages: false,
      showItemCodes: true,
      showItemCategories: true,
      alternateRowColors: true,
      tableHeaderStyle: "gradient",
      currencyPosition: "before",
      currencySymbol: "$",
      decimalPlaces: 2,
      thousandsSeparator: ",",
      decimalSeparator: ".",
      dateFormat: "YYYY-MM-DD",
      timeFormat: "24h",
      qrCodeEnabled: true,
      qrCodePosition: "sidebar",
      barcodeEnabled: true,
      multiLanguage: false,
      rtlSupport: false,
      showPoweredBy: true,
      customCSS: "",
      templateVersion: "2.5"
    }
  },
  {
    id: "creative-agency",
    name: "Creative Agency",
    description: "Vibrant and artistic template perfect for creative agencies and designers",
    category: "creative",
    style: "artistic",
    premium: true,
    popular: false,
    new: true,
    featured: false,
    previewImage: "/api/placeholder/300/400",
    colors: ["#f59e0b", "#ef4444", "#10b981"],
    features: ["Creative Elements", "Artistic Layout", "Color Harmony", "Brand Expression"],
    rating: 4.7,
    downloads: 8920,
    industry: "Creative Agencies",
    tags: ["creative", "artistic", "colorful", "agency"],
    templateData: {
      companyLogo: "",
      logoPosition: "center",
      logoSize: 130,
      logoOpacity: 100,
      showWatermark: false,
      watermarkText: "",
      primaryColor: "#f59e0b",
      secondaryColor: "#ef4444",
      accentColor: "#10b981",
      backgroundColor: "#fffbeb",
      textColor: "#1f2937",
      headerBgColor: "#fef3c7",
      footerBgColor: "#ecfdf5",
      borderColor: "#f59e0b",
      fontFamily: "Nunito",
      headerFontFamily: "Nunito",
      fontSize: 14,
      headerFontSize: 34,
      lineHeight: 1.6,
      letterSpacing: 0.2,
      fontWeight: "medium",
      headerStyle: "detailed",
      footerStyle: "detailed",
      layout: "modern-card",
      pageSize: "A4",
      orientation: "portrait",
      margins: 22,
      borderStyle: "bold",
      borderRadius: 16,
      spacing: 20,
      shadowIntensity: 2,
      gradientEnabled: true,
      gradientDirection: "to-tr",
      showCompanyInfo: true,
      showClientInfo: true,
      showPaymentTerms: true,
      showNotes: true,
      showTaxDetails: true,
      showShippingInfo: true,
      showDiscounts: true,
      showSignature: true,
      itemTableStyle: "modern",
      showItemImages: true,
      showItemCodes: false,
      showItemCategories: true,
      alternateRowColors: true,
      tableHeaderStyle: "gradient",
      currencyPosition: "before",
      currencySymbol: "$",
      decimalPlaces: 2,
      thousandsSeparator: ",",
      decimalSeparator: ".",
      dateFormat: "DD/MM/YYYY",
      timeFormat: "12h",
      qrCodeEnabled: false,
      qrCodePosition: "footer",
      barcodeEnabled: false,
      multiLanguage: true,
      rtlSupport: true,
      showPoweredBy: false,
      customCSS: ".creative-accent { background: linear-gradient(45deg, #f59e0b, #ef4444, #10b981); }",
      templateVersion: "1.8"
    }
  },
  {
    id: "medical-professional",
    name: "Medical Professional",
    description: "Clean, trustworthy design perfect for healthcare providers and medical practices",
    category: "medical",
    style: "professional",
    premium: true,
    popular: false,
    new: true,
    featured: false,
    previewImage: "/api/placeholder/300/400",
    colors: ["#0ea5e9", "#06b6d4", "#10b981"],
    features: ["Medical Compliance", "Trust Building", "Clean Design", "Healthcare Focused"],
    rating: 4.7,
    downloads: 6450,
    industry: "Healthcare",
    tags: ["medical", "healthcare", "professional", "clinical"],
    templateData: {
      companyLogo: "",
      logoPosition: "left",
      logoSize: 100,
      logoOpacity: 100,
      showWatermark: false,
      watermarkText: "",
      primaryColor: "#0ea5e9",
      secondaryColor: "#06b6d4",
      accentColor: "#10b981",
      backgroundColor: "#ffffff",
      textColor: "#1f2937",
      headerBgColor: "#f0f9ff",
      footerBgColor: "#ecfeff",
      borderColor: "#bae6fd",
      fontFamily: "Roboto",
      headerFontFamily: "Roboto",
      fontSize: 14,
      headerFontSize: 26,
      lineHeight: 1.6,
      letterSpacing: 0,
      fontWeight: "normal",
      headerStyle: "standard",
      footerStyle: "detailed",
      layout: "single-column",
      pageSize: "A4",
      orientation: "portrait",
      margins: 20,
      borderStyle: "subtle",
      borderRadius: 4,
      spacing: 18,
      shadowIntensity: 1,
      gradientEnabled: false,
      gradientDirection: "to-right",
      showCompanyInfo: true,
      showClientInfo: true,
      showPaymentTerms: true,
      showNotes: true,
      showTaxDetails: true,
      showShippingInfo: false,
      showDiscounts: false,
      showSignature: true,
      itemTableStyle: "bordered",
      showItemImages: false,
      showItemCodes: true,
      showItemCategories: true,
      alternateRowColors: true,
      tableHeaderStyle: "solid",
      currencyPosition: "before",
      currencySymbol: "$",
      decimalPlaces: 2,
      thousandsSeparator: ",",
      decimalSeparator: ".",
      dateFormat: "MM/DD/YYYY",
      timeFormat: "12h",
      qrCodeEnabled: false,
      qrCodePosition: "footer",
      barcodeEnabled: false,
      multiLanguage: false,
      rtlSupport: false,
      showPoweredBy: false,
      customCSS: "",
      templateVersion: "1.5"
    }
  },
  {
    id: "retail-boutique",
    name: "Retail Boutique",
    description: "Stylish template designed for boutiques and fashion businesses with luxury aesthetics",
    category: "retail",
    style: "luxury",
    premium: true,
    popular: false,
    new: false,
    featured: false,
    previewImage: "/api/placeholder/300/400",
    colors: ["#be185d", "#7c3aed", "#dc2626"],
    features: ["Fashion Forward", "Boutique Styling", "Luxury Feel", "Brand Focused"],
    rating: 4.6,
    downloads: 7230,
    industry: "Fashion & Retail",
    tags: ["fashion", "luxury", "boutique", "retail"],
    templateData: {
      companyLogo: "",
      logoPosition: "center",
      logoSize: 120,
      logoOpacity: 100,
      showWatermark: false,
      watermarkText: "",
      primaryColor: "#be185d",
      secondaryColor: "#7c3aed",
      accentColor: "#dc2626",
      backgroundColor: "#fdf2f8",
      textColor: "#1f2937",
      headerBgColor: "#fce7f3",
      footerBgColor: "#f3e8ff",
      borderColor: "#be185d",
      fontFamily: "Cormorant Garamond",
      headerFontFamily: "Cormorant Garamond",
      fontSize: 15,
      headerFontSize: 38,
      lineHeight: 1.7,
      letterSpacing: 0.5,
      fontWeight: "normal",
      headerStyle: "detailed",
      footerStyle: "signature",
      layout: "two-column",
      pageSize: "A4",
      orientation: "portrait",
      margins: 25,
      borderStyle: "subtle",
      borderRadius: 8,
      spacing: 22,
      shadowIntensity: 2,
      gradientEnabled: true,
      gradientDirection: "to-br",
      showCompanyInfo: true,
      showClientInfo: true,
      showPaymentTerms: true,
      showNotes: true,
      showTaxDetails: true,
      showShippingInfo: true,
      showDiscounts: true,
      showSignature: true,
      itemTableStyle: "modern",
      showItemImages: true,
      showItemCodes: true,
      showItemCategories: true,
      alternateRowColors: false,
      tableHeaderStyle: "gradient",
      currencyPosition: "before",
      currencySymbol: "$",
      decimalPlaces: 2,
      thousandsSeparator: ",",
      decimalSeparator: ".",
      dateFormat: "DD/MM/YYYY",
      timeFormat: "12h",
      qrCodeEnabled: false,
      qrCodePosition: "footer",
      barcodeEnabled: false,
      multiLanguage: true,
      rtlSupport: true,
      showPoweredBy: false,
      customCSS: "",
      templateVersion: "2.0"
    }
  },
  {
    id: "construction-pro",
    name: "Construction Pro",
    description: "Strong, reliable template for construction companies and contractors",
    category: "business",
    style: "bold",
    premium: false,
    popular: false,
    new: false,
    featured: false,
    previewImage: "/api/placeholder/300/400",
    colors: ["#ea580c", "#dc2626", "#1f2937"],
    features: ["Industrial Design", "Construction Focus", "Strong Branding", "Contractor Ready"],
    rating: 4.4,
    downloads: 4890,
    industry: "Construction",
    tags: ["construction", "industrial", "contractor", "engineering"],
    templateData: {
      companyLogo: "",
      logoPosition: "left",
      logoSize: 100,
      logoOpacity: 100,
      showWatermark: false,
      watermarkText: "",
      primaryColor: "#ea580c",
      secondaryColor: "#dc2626",
      accentColor: "#f97316",
      backgroundColor: "#ffffff",
      textColor: "#1f2937",
      headerBgColor: "#fff7ed",
      footerBgColor: "#fef2f2",
      borderColor: "#ea580c",
      fontFamily: "Roboto Slab",
      headerFontFamily: "Roboto Slab",
      fontSize: 14,
      headerFontSize: 28,
      lineHeight: 1.5,
      letterSpacing: 0,
      fontWeight: "medium",
      headerStyle: "standard",
      footerStyle: "detailed",
      layout: "single-column",
      pageSize: "A4",
      orientation: "portrait",
      margins: 20,
      borderStyle: "bold",
      borderRadius: 4,
      spacing: 16,
      shadowIntensity: 1,
      gradientEnabled: false,
      gradientDirection: "to-right",
      showCompanyInfo: true,
      showClientInfo: true,
      showPaymentTerms: true,
      showNotes: true,
      showTaxDetails: true,
      showShippingInfo: true,
      showDiscounts: true,
      showSignature: true,
      itemTableStyle: "bordered",
      showItemImages: false,
      showItemCodes: true,
      showItemCategories: true,
      alternateRowColors: true,
      tableHeaderStyle: "solid",
      currencyPosition: "before",
      currencySymbol: "$",
      decimalPlaces: 2,
      thousandsSeparator: ",",
      decimalSeparator: ".",
      dateFormat: "MM/DD/YYYY",
      timeFormat: "12h",
      qrCodeEnabled: false,
      qrCodePosition: "footer",
      barcodeEnabled: false,
      multiLanguage: false,
      rtlSupport: false,
      showPoweredBy: true,
      customCSS: "",
      templateVersion: "1.0"
    }
  }
];

export const getTemplateById = (id: string): InvoiceTemplate | undefined => {
  return invoiceTemplates.find(template => template.id === id);
};

export const getTemplatesByCategory = (category: string): InvoiceTemplate[] => {
  if (category === "all") return invoiceTemplates;
  return invoiceTemplates.filter(template => template.category === category);
};

export const getTemplatesByStyle = (style: string): InvoiceTemplate[] => {
  if (style === "all") return invoiceTemplates;
  return invoiceTemplates.filter(template => template.style === style);
};

export const getFeaturedTemplates = (): InvoiceTemplate[] => {
  return invoiceTemplates.filter(template => template.featured);
};

export const getPopularTemplates = (): InvoiceTemplate[] => {
  return invoiceTemplates.filter(template => template.popular);
};

export const getNewTemplates = (): InvoiceTemplate[] => {
  return invoiceTemplates.filter(template => template.new);
};

export const getPremiumTemplates = (): InvoiceTemplate[] => {
  return invoiceTemplates.filter(template => template.premium);
};
