export interface PaymentReceiptTemplate {
  id: string;
  name: string;
  description: string;
  category: "business" | "retail" | "service" | "medical" | "restaurant" | "hotel" | "automotive" | "tech";
  style: "professional" | "elegant" | "clean" | "modern" | "classic" | "minimal" | "bold" | "artistic";
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
  templateData: ReceiptCustomization;
}

export interface ReceiptCustomization {
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
  layout: "single-column" | "two-column" | "card" | "thermal" | "modern";
  pageSize: "A4" | "Letter" | "A5" | "Thermal" | "Custom";
  
  // Receipt Specific
  receiptNumberLabel: string;
  showReceiptNumber: boolean;
  receiptTitle: string;
  titleAlignment: "left" | "center" | "right";
  showDateTime: boolean;
  dateFormat: "MM/DD/YYYY" | "DD/MM/YYYY" | "YYYY-MM-DD" | "DD MMM YYYY";
  timeFormat: "12h" | "24h";
  
  // Payment Information
  showPaymentMethod: boolean;
  showTransactionId: boolean;
  showCardInfo: boolean;
  showCashierInfo: boolean;
  showCustomerInfo: boolean;
  
  // Content & Fields
  showTaxBreakdown: boolean;
  showItemDetails: boolean;
  showQuantity: boolean;
  showUnitPrice: boolean;
  showDiscounts: boolean;
  showSubtotal: boolean;
  showTotalAmount: boolean;
  showAmountPaid: boolean;
  showChange: boolean;
  
  // Styling Options
  tableBorders: boolean;
  alternateRowColors: boolean;
  roundedCorners: boolean;
  shadowEffect: boolean;
  gradientBackground: boolean;
  
  // Additional Features
  showQRCode: boolean;
  qrCodeData: string;
  qrCodeSize: number;
  qrCodePosition: "top-right" | "bottom-center" | "bottom-right" | "custom";
  
  showBarcode: boolean;
  barcodeData: string;
  barcodeFormat: "CODE128" | "EAN13" | "EAN8" | "UPC";
  
  // Footer Content
  thankYouMessage: string;
  returnPolicy: string;
  contactInfo: string;
  socialMedia: string;
  promotionalMessage: string;
  
  // Custom Fields
  customField1Label: string;
  customField1Value: string;
  customField2Label: string;
  customField2Value: string;
  customField3Label: string;
  customField3Value: string;
  
  // Printing Options
  paperWidth: number;
  paperHeight: number;
  marginTop: number;
  marginBottom: number;
  marginLeft: number;
  marginRight: number;
}

export interface ReceiptData {
  receiptNumber: string;
  dateTime: string;
  cashierName: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  
  // Company Information
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  companyWebsite: string;
  taxId?: string;
  
  // Items
  items: Array<{
    id: string;
    name: string;
    description?: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
    taxRate?: number;
    total: number;
  }>;
  
  // Payment Details
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  amountPaid: number;
  changeAmount: number;
  
  // Payment Method
  paymentMethod: "cash" | "card" | "mobile" | "check" | "digital_wallet";
  transactionId?: string;
  cardLast4?: string;
  cardType?: string;
  
  // Additional Info
  notes?: string;
  terms?: string;
}

// Default receipt customization
export const defaultReceiptCustomization: ReceiptCustomization = {
  // Brand & Logo
  companyLogo: "",
  logoPosition: "center",
  logoSize: 100,
  logoOpacity: 100,
  showWatermark: false,
  watermarkText: "PAID",
  
  // Colors & Theme
  primaryColor: "#2563eb",
  secondaryColor: "#64748b",
  accentColor: "#10b981",
  backgroundColor: "#ffffff",
  textColor: "#1f2937",
  headerBgColor: "#f8fafc",
  footerBgColor: "#f1f5f9",
  borderColor: "#e2e8f0",
  
  // Typography
  fontFamily: "Inter",
  headerFontFamily: "Inter",
  fontSize: 14,
  headerFontSize: 18,
  lineHeight: 1.5,
  letterSpacing: 0,
  fontWeight: "normal",
  
  // Layout & Structure
  headerStyle: "standard",
  footerStyle: "simple",
  layout: "single-column",
  pageSize: "A4",
  
  // Receipt Specific
  receiptNumberLabel: "Receipt #",
  showReceiptNumber: true,
  receiptTitle: "Payment Receipt",
  titleAlignment: "center",
  showDateTime: true,
  dateFormat: "MM/DD/YYYY",
  timeFormat: "12h",
  
  // Payment Information
  showPaymentMethod: true,
  showTransactionId: true,
  showCardInfo: true,
  showCashierInfo: true,
  showCustomerInfo: true,
  
  // Content & Fields
  showTaxBreakdown: true,
  showItemDetails: true,
  showQuantity: true,
  showUnitPrice: true,
  showDiscounts: true,
  showSubtotal: true,
  showTotalAmount: true,
  showAmountPaid: true,
  showChange: true,
  
  // Styling Options
  tableBorders: true,
  alternateRowColors: false,
  roundedCorners: true,
  shadowEffect: false,
  gradientBackground: false,
  
  // Additional Features
  showQRCode: false,
  qrCodeData: "",
  qrCodeSize: 100,
  qrCodePosition: "bottom-right",
  
  showBarcode: false,
  barcodeData: "",
  barcodeFormat: "CODE128",
  
  // Footer Content
  thankYouMessage: "Thank you for your business!",
  returnPolicy: "Items can be returned within 30 days with receipt.",
  contactInfo: "For questions, contact us at support@company.com",
  socialMedia: "Follow us @company",
  promotionalMessage: "",
  
  // Custom Fields
  customField1Label: "",
  customField1Value: "",
  customField2Label: "",
  customField2Value: "",
  customField3Label: "",
  customField3Value: "",
  
  // Printing Options
  paperWidth: 210,
  paperHeight: 297,
  marginTop: 20,
  marginBottom: 20,
  marginLeft: 20,
  marginRight: 20,
};

// Receipt Templates Collection
export const receiptTemplates: PaymentReceiptTemplate[] = [
  {
    id: "business-professional",
    name: "Business Professional",
    description: "Clean and professional receipt template perfect for corporate environments",
    category: "business",
    style: "professional",
    premium: false,
    popular: true,
    new: false,
    featured: true,
    previewImage: "/templates/receipt-business-professional.png",
    colors: ["#2563eb", "#64748b", "#f8fafc"],
    features: ["Professional Layout", "Tax Breakdown", "Company Branding", "QR Code Support"],
    rating: 4.8,
    downloads: 1250,
    industry: "General Business",
    tags: ["professional", "corporate", "clean", "modern"],
    templateData: {
      ...defaultReceiptCustomization,
      primaryColor: "#2563eb",
      secondaryColor: "#64748b",
      headerStyle: "detailed",
      layout: "single-column",
      showQRCode: true,
      qrCodePosition: "bottom-right",
      footerStyle: "detailed",
    }
  },
  {
    id: "retail-modern",
    name: "Retail Modern",
    description: "Stylish receipt template designed for retail stores and boutiques",
    category: "retail",
    style: "modern",
    premium: false,
    popular: true,
    new: true,
    featured: false,
    previewImage: "/templates/receipt-retail-modern.png",
    colors: ["#10b981", "#059669", "#f0fdf4"],
    features: ["Item Grid Layout", "Discount Display", "Promotional Section", "Social Media"],
    rating: 4.7,
    downloads: 890,
    industry: "Retail & E-commerce",
    tags: ["retail", "modern", "colorful", "promotional"],
    templateData: {
      ...defaultReceiptCustomization,
      primaryColor: "#10b981",
      secondaryColor: "#059669",
      accentColor: "#34d399",
      headerBgColor: "#f0fdf4",
      layout: "two-column",
      showDiscounts: true,
      promotionalMessage: "Save 15% on your next purchase!",
      socialMedia: "Follow us @retailstore for exclusive deals",
      roundedCorners: true,
      gradientBackground: true,
    }
  },
  {
    id: "restaurant-thermal",
    name: "Restaurant Thermal",
    description: "Compact thermal printer receipt optimized for restaurants and cafes",
    category: "restaurant",
    style: "clean",
    premium: false,
    popular: false,
    new: false,
    featured: false,
    previewImage: "/templates/receipt-restaurant-thermal.png",
    colors: ["#000000", "#ffffff"],
    features: ["Thermal Printer Ready", "Compact Design", "Order Details", "Kitchen Notes"],
    rating: 4.5,
    downloads: 456,
    industry: "Food & Beverage",
    tags: ["thermal", "compact", "restaurant", "pos"],
    templateData: {
      ...defaultReceiptCustomization,
      primaryColor: "#000000",
      secondaryColor: "#666666",
      backgroundColor: "#ffffff",
      layout: "thermal",
      pageSize: "Thermal",
      paperWidth: 80,
      paperHeight: 200,
      fontSize: 12,
      headerFontSize: 14,
      marginLeft: 5,
      marginRight: 5,
      tableBorders: false,
      showQRCode: false,
      footerStyle: "compact",
    }
  },
  {
    id: "medical-elegant",
    name: "Medical Elegant",
    description: "Professional receipt template for medical practices and healthcare",
    category: "medical",
    style: "elegant",
    premium: true,
    popular: false,
    new: false,
    featured: false,
    previewImage: "/templates/receipt-medical-elegant.png",
    colors: ["#0ea5e9", "#0284c7", "#f0f9ff"],
    features: ["HIPAA Compliant", "Insurance Info", "Appointment Details", "Clean Layout"],
    rating: 4.9,
    downloads: 234,
    industry: "Healthcare",
    tags: ["medical", "healthcare", "elegant", "professional"],
    templateData: {
      ...defaultReceiptCustomization,
      primaryColor: "#0ea5e9",
      secondaryColor: "#0284c7",
      headerBgColor: "#f0f9ff",
      layout: "single-column",
      headerStyle: "detailed",
      footerStyle: "detailed",
      customField1Label: "Insurance Provider",
      customField2Label: "Policy Number",
      customField3Label: "Next Appointment",
      contactInfo: "For billing questions: billing@medicalpractice.com",
      returnPolicy: "Please retain this receipt for insurance claims.",
    }
  },
  {
    id: "service-minimal",
    name: "Service Minimal",
    description: "Clean and minimal receipt for service-based businesses",
    category: "service",
    style: "minimal",
    premium: false,
    popular: false,
    new: true,
    featured: false,
    previewImage: "/templates/receipt-service-minimal.png",
    colors: ["#6b7280", "#9ca3af", "#f9fafb"],
    features: ["Minimal Design", "Service Hours", "Contact Info", "Clean Typography"],
    rating: 4.6,
    downloads: 678,
    industry: "Professional Services",
    tags: ["minimal", "service", "clean", "simple"],
    templateData: {
      ...defaultReceiptCustomization,
      primaryColor: "#6b7280",
      secondaryColor: "#9ca3af",
      textColor: "#374151",
      headerStyle: "minimal",
      footerStyle: "simple",
      layout: "single-column",
      tableBorders: false,
      roundedCorners: false,
      shadowEffect: false,
      alternateRowColors: true,
    }
  },
  {
    id: "hotel-luxury",
    name: "Hotel Luxury",
    description: "Elegant receipt template for hotels and hospitality businesses",
    category: "hotel",
    style: "elegant",
    premium: true,
    popular: true,
    new: false,
    featured: true,
    previewImage: "/templates/receipt-hotel-luxury.png",
    colors: ["#8b5cf6", "#7c3aed", "#faf5ff"],
    features: ["Luxury Design", "Room Details", "Guest Services", "Elegant Typography"],
    rating: 4.9,
    downloads: 345,
    industry: "Hospitality",
    tags: ["luxury", "hotel", "elegant", "premium"],
    templateData: {
      ...defaultReceiptCustomization,
      primaryColor: "#8b5cf6",
      secondaryColor: "#7c3aed",
      accentColor: "#a855f7",
      headerBgColor: "#faf5ff",
      fontFamily: "Playfair Display",
      headerFontFamily: "Playfair Display",
      layout: "two-column",
      headerStyle: "detailed",
      footerStyle: "signature",
      roundedCorners: true,
      shadowEffect: true,
      gradientBackground: true,
      customField1Label: "Room Number",
      customField2Label: "Check-in Date",
      customField3Label: "Guest Services",
    }
  },
  {
    id: "automotive-bold",
    name: "Automotive Bold",
    description: "Bold and modern receipt for automotive services and repairs",
    category: "automotive",
    style: "bold",
    premium: false,
    popular: false,
    new: false,
    featured: false,
    previewImage: "/templates/receipt-automotive-bold.png",
    colors: ["#dc2626", "#b91c1c", "#fef2f2"],
    features: ["Bold Design", "Service Details", "Parts & Labor", "Warranty Info"],
    rating: 4.4,
    downloads: 567,
    industry: "Automotive",
    tags: ["automotive", "bold", "service", "repair"],
    templateData: {
      ...defaultReceiptCustomization,
      primaryColor: "#dc2626",
      secondaryColor: "#b91c1c",
      accentColor: "#ef4444",
      headerBgColor: "#fef2f2",
      fontWeight: "semibold",
      headerStyle: "modern",
      layout: "two-column",
      customField1Label: "Vehicle",
      customField2Label: "Mileage",
      customField3Label: "Warranty",
      returnPolicy: "Parts covered by manufacturer warranty. Labor guaranteed for 90 days.",
    }
  },
  {
    id: "tech-futuristic",
    name: "Tech Futuristic",
    description: "Modern futuristic receipt for tech companies and digital services",
    category: "tech",
    style: "modern",
    premium: true,
    popular: false,
    new: true,
    featured: false,
    previewImage: "/templates/receipt-tech-futuristic.png",
    colors: ["#06b6d4", "#0891b2", "#ecfeff"],
    features: ["Futuristic Design", "Digital Elements", "QR Codes", "Modern Layout"],
    rating: 4.7,
    downloads: 789,
    industry: "Technology",
    tags: ["tech", "futuristic", "digital", "modern"],
    templateData: {
      ...defaultReceiptCustomization,
      primaryColor: "#06b6d4",
      secondaryColor: "#0891b2",
      accentColor: "#22d3ee",
      headerBgColor: "#ecfeff",
      fontFamily: "JetBrains Mono",
      layout: "modern",
      headerStyle: "modern",
      showQRCode: true,
      qrCodeSize: 120,
      showBarcode: true,
      gradientBackground: true,
      roundedCorners: true,
      shadowEffect: true,
    }
  },
  {
    id: "zen-minimal",
    name: "Zen Minimal",
    description: "A peaceful, minimalist receipt with calming simplicity and gentle elegance",
    category: "business",
    style: "minimal",
    premium: false,
    popular: false,
    new: true,
    featured: false,
    previewImage: "/templates/receipt-zen-minimal.png",
    colors: ["#f8fafc", "#64748b", "#e2e8f0"],
    features: ["Ultra Minimal", "Zen-like Calm", "Soft Typography", "Clean Spacing"],
    rating: 4.9,
    downloads: 432,
    industry: "Wellness & Lifestyle",
    tags: ["zen", "minimal", "calm", "peaceful"],
    templateData: {
      ...defaultReceiptCustomization,
      primaryColor: "#64748b",
      secondaryColor: "#94a3b8",
      backgroundColor: "#f8fafc",
      textColor: "#475569",
      headerBgColor: "#f1f5f9",
      fontFamily: "Inter",
      fontSize: 13,
      headerFontSize: 16,
      fontWeight: "normal",
      layout: "single-column",
      headerStyle: "minimal",
      footerStyle: "simple",
      tableBorders: false,
      alternateRowColors: false,
      roundedCorners: true,
      shadowEffect: false,
      thankYouMessage: "With gratitude for your trust",
      returnPolicy: "Every moment, every transaction, a step in our shared journey.",
      contactInfo: "Reach us when the heart calls",
    }
  },
  {
    id: "poetry-in-motion",
    name: "Poetry in Motion",
    description: "Where transactions become verses and receipts become poetry",
    category: "retail",
    style: "artistic",
    premium: true,
    popular: false,
    new: true,
    featured: true,
    previewImage: "/templates/receipt-poetry-motion.png",
    colors: ["#fef3f2", "#e11d48", "#fecaca"],
    features: ["Artistic Layout", "Poetic Elements", "Flowing Design", "Creative Typography"],
    rating: 4.8,
    downloads: 267,
    industry: "Arts & Creative",
    tags: ["poetry", "artistic", "creative", "flowing"],
    templateData: {
      ...defaultReceiptCustomization,
      primaryColor: "#e11d48",
      secondaryColor: "#f43f5e",
      accentColor: "#fb7185",
      backgroundColor: "#fef3f2",
      textColor: "#881337",
      headerBgColor: "#fecaca",
      fontFamily: "Georgia",
      headerFontFamily: "Georgia",
      fontSize: 14,
      headerFontSize: 18,
      fontWeight: "normal",
      layout: "single-column",
      headerStyle: "detailed",
      footerStyle: "signature",
      titleAlignment: "center",
      receiptTitle: "A Moment in Commerce",
      thankYouMessage: "In every exchange, beauty unfolds",
      returnPolicy: "Like verses in time, returns welcomed within thirty suns.",
      contactInfo: "Connect with us through the threads of commerce and care",
      roundedCorners: true,
      shadowEffect: true,
    }
  },
  {
    id: "whisper-soft",
    name: "Whisper Soft",
    description: "Gentle as morning dew, soft as a whispered thank you",
    category: "service",
    style: "elegant",
    premium: false,
    popular: true,
    new: true,
    featured: false,
    previewImage: "/templates/receipt-whisper-soft.png",
    colors: ["#f0fdf4", "#22c55e", "#bbf7d0"],
    features: ["Soft Colors", "Gentle Typography", "Whisper-quiet Design", "Organic Flow"],
    rating: 4.7,
    downloads: 523,
    industry: "Beauty & Wellness",
    tags: ["soft", "gentle", "whisper", "organic"],
    templateData: {
      ...defaultReceiptCustomization,
      primaryColor: "#22c55e",
      secondaryColor: "#4ade80",
      accentColor: "#86efac",
      backgroundColor: "#f0fdf4",
      textColor: "#166534",
      headerBgColor: "#bbf7d0",
      fontFamily: "Inter",
      fontSize: 13,
      headerFontSize: 17,
      fontWeight: "normal",
      layout: "single-column",
      headerStyle: "standard",
      footerStyle: "simple",
      tableBorders: false,
      alternateRowColors: true,
      roundedCorners: true,
      shadowEffect: false,
      thankYouMessage: "Softly spoken, deeply felt - thank you",
      returnPolicy: "Like gentle rain, exchanges flow naturally within 30 days.",
      contactInfo: "Whisper to us anytime, we're listening",
    }
  },
  {
    id: "moonlight-serenade",
    name: "Moonlight Serenade",
    description: "Elegant as moonbeams, graceful as a midnight song",
    category: "restaurant",
    style: "elegant",
    premium: true,
    popular: false,
    new: true,
    featured: false,
    previewImage: "/templates/receipt-moonlight-serenade.png",
    colors: ["#1e1b4b", "#6366f1", "#c7d2fe"],
    features: ["Night-inspired", "Elegant Design", "Romantic Feel", "Sophisticated"],
    rating: 4.9,
    downloads: 189,
    industry: "Fine Dining",
    tags: ["moonlight", "elegant", "romantic", "sophisticated"],
    templateData: {
      ...defaultReceiptCustomization,
      primaryColor: "#6366f1",
      secondaryColor: "#8b5cf6",
      accentColor: "#a855f7",
      backgroundColor: "#f8fafc",
      textColor: "#1e1b4b",
      headerBgColor: "#c7d2fe",
      fontFamily: "Playfair Display",
      headerFontFamily: "Playfair Display",
      fontSize: 14,
      headerFontSize: 20,
      fontWeight: "normal",
      layout: "single-column",
      headerStyle: "detailed",
      footerStyle: "signature",
      titleAlignment: "center",
      receiptTitle: "Moonlight Memories",
      thankYouMessage: "Under stars and gratitude, we thank you",
      returnPolicy: "Like moonlight's gentle return, so welcome yours within our embrace.",
      contactInfo: "Find us where the moonlight touches the earth",
      roundedCorners: true,
      shadowEffect: true,
      gradientBackground: true,
    }
  },
  {
    id: "haiku-simplicity",
    name: "Haiku Simplicity",
    description: "Three lines of beauty: simple, clean, profound",
    category: "business",
    style: "minimal",
    premium: false,
    popular: true,
    new: true,
    featured: false,
    previewImage: "/templates/receipt-haiku-simplicity.png",
    colors: ["#fffbeb", "#f59e0b", "#fde68a"],
    features: ["Haiku-inspired", "Three-line Beauty", "Minimalist Zen", "Pure Simplicity"],
    rating: 4.6,
    downloads: 678,
    industry: "Mindfulness & Zen",
    tags: ["haiku", "simplicity", "zen", "minimal"],
    templateData: {
      ...defaultReceiptCustomization,
      primaryColor: "#f59e0b",
      secondaryColor: "#fbbf24",
      accentColor: "#fcd34d",
      backgroundColor: "#fffbeb",
      textColor: "#92400e",
      headerBgColor: "#fde68a",
      fontFamily: "Inter",
      fontSize: 13,
      headerFontSize: 16,
      fontWeight: "normal",
      layout: "single-column",
      headerStyle: "minimal",
      footerStyle: "simple",
      titleAlignment: "center",
      receiptTitle: "Simple Exchange",
      tableBorders: false,
      alternateRowColors: false,
      roundedCorners: false,
      shadowEffect: false,
      thankYouMessage: "Transaction flows / Gratitude in every line / Simple, pure, complete",
      returnPolicy: "Returns like seasons / Within thirty day cycles / Natural and free",
      contactInfo: "Connect simply / When questions arise within / We are here for you",
    }
  },
  {
    id: "canvas-dreams",
    name: "Canvas Dreams",
    description: "Where receipts become art and transactions paint stories",
    category: "retail",
    style: "artistic",
    premium: true,
    popular: false,
    new: true,
    featured: true,
    previewImage: "/templates/receipt-canvas-dreams.png",
    colors: ["#fdf2f8", "#ec4899", "#fbcfe8"],
    features: ["Artistic Canvas", "Dream-like Flow", "Creative Layout", "Story-telling"],
    rating: 4.8,
    downloads: 345,
    industry: "Art & Design",
    tags: ["canvas", "dreams", "artistic", "creative"],
    templateData: {
      ...defaultReceiptCustomization,
      primaryColor: "#ec4899",
      secondaryColor: "#f472b6",
      accentColor: "#f9a8d4",
      backgroundColor: "#fdf2f8",
      textColor: "#831843",
      headerBgColor: "#fbcfe8",
      fontFamily: "Georgia",
      headerFontFamily: "Playfair Display",
      fontSize: 14,
      headerFontSize: 19,
      fontWeight: "normal",
      layout: "two-column",
      headerStyle: "detailed",
      footerStyle: "signature",
      titleAlignment: "center",
      receiptTitle: "Art in Motion",
      thankYouMessage: "Every purchase paints a new chapter in our shared canvas",
      returnPolicy: "Like art appreciating over time, exchanges welcome within our gallery of care.",
      contactInfo: "Paint your inquiries with us - every stroke matters",
      roundedCorners: true,
      shadowEffect: true,
      gradientBackground: true,
    }
  },
  {
    id: "morning-dewdrop",
    name: "Morning Dewdrop",
    description: "Fresh as dawn, pure as the first light touching earth",
    category: "service",
    style: "clean",
    premium: false,
    popular: false,
    new: true,
    featured: false,
    previewImage: "/templates/receipt-morning-dewdrop.png",
    colors: ["#f0f9ff", "#0ea5e9", "#bae6fd"],
    features: ["Fresh Design", "Dawn-inspired", "Pure Clean Lines", "Morning Calm"],
    rating: 4.5,
    downloads: 412,
    industry: "Health & Wellness",
    tags: ["morning", "fresh", "pure", "dawn"],
    templateData: {
      ...defaultReceiptCustomization,
      primaryColor: "#0ea5e9",
      secondaryColor: "#38bdf8",
      accentColor: "#7dd3fc",
      backgroundColor: "#f0f9ff",
      textColor: "#0c4a6e",
      headerBgColor: "#bae6fd",
      fontFamily: "Inter",
      fontSize: 13,
      headerFontSize: 17,
      fontWeight: "normal",
      layout: "single-column",
      headerStyle: "standard",
      footerStyle: "simple",
      tableBorders: false,
      alternateRowColors: true,
      roundedCorners: true,
      shadowEffect: false,
      thankYouMessage: "Fresh gratitude, like morning dew upon the heart",
      returnPolicy: "Returns flow like morning streams - clear, natural, within 30 days.",
      contactInfo: "Reach us with the freshness of dawn in your voice",
    }
  },
  {
    id: "vintage-sonnet",
    name: "Vintage Sonnet",
    description: "Timeless elegance wrapped in the wisdom of bygone eras",
    category: "retail",
    style: "vintage",
    premium: true,
    popular: true,
    new: false,
    featured: false,
    previewImage: "/templates/receipt-vintage-sonnet.png",
    colors: ["#fefce8", "#eab308", "#fef3c7"],
    features: ["Vintage Charm", "Sonnet-inspired", "Timeless Elegance", "Classic Beauty"],
    rating: 4.7,
    downloads: 756,
    industry: "Antiques & Vintage",
    tags: ["vintage", "sonnet", "timeless", "classic"],
    templateData: {
      ...defaultReceiptCustomization,
      primaryColor: "#eab308",
      secondaryColor: "#facc15",
      accentColor: "#fde047",
      backgroundColor: "#fefce8",
      textColor: "#713f12",
      headerBgColor: "#fef3c7",
      fontFamily: "Times New Roman",
      headerFontFamily: "Playfair Display",
      fontSize: 14,
      headerFontSize: 18,
      fontWeight: "normal",
      layout: "single-column",
      headerStyle: "detailed",
      footerStyle: "signature",
      titleAlignment: "center",
      receiptTitle: "A Sonnet of Commerce",
      thankYouMessage: "In verses of gratitude, thy purchase doth inspire our hearts",
      returnPolicy: "As sonnets endure through time, so may thy returns find welcome here.",
      contactInfo: "Speak to us in the language of care and we shall answer",
      roundedCorners: false,
      shadowEffect: true,
      tableBorders: true,
    }
  },
  {
    id: "celestial-whisper",
    name: "Celestial Whisper",
    description: "Touched by starlight, blessed by cosmic grace",
    category: "service",
    style: "elegant",
    premium: true,
    popular: false,
    new: true,
    featured: false,
    previewImage: "/templates/receipt-celestial-whisper.png",
    colors: ["#f3e8ff", "#8b5cf6", "#ddd6fe"],
    features: ["Cosmic Inspiration", "Starlight Touch", "Celestial Grace", "Mystical Beauty"],
    rating: 4.9,
    downloads: 198,
    industry: "Spiritual & Wellness",
    tags: ["celestial", "cosmic", "starlight", "mystical"],
    templateData: {
      ...defaultReceiptCustomization,
      primaryColor: "#8b5cf6",
      secondaryColor: "#a78bfa",
      accentColor: "#c4b5fd",
      backgroundColor: "#f3e8ff",
      textColor: "#581c87",
      headerBgColor: "#ddd6fe",
      fontFamily: "Georgia",
      headerFontFamily: "Playfair Display",
      fontSize: 14,
      headerFontSize: 19,
      fontWeight: "normal",
      layout: "single-column",
      headerStyle: "detailed",
      footerStyle: "signature",
      titleAlignment: "center",
      receiptTitle: "Celestial Exchange",
      thankYouMessage: "Under cosmic blessings, we offer our deepest gratitude",
      returnPolicy: "Like stars returning to their positions, exchanges welcome in our celestial cycle.",
      contactInfo: "Whisper to the cosmos, and we shall hear your call",
      roundedCorners: true,
      shadowEffect: true,
      gradientBackground: true,
      showQRCode: true,
      qrCodeSize: 80,
    }
  },
  {
    id: "garden-verse",
    name: "Garden Verse",
    description: "Where transactions bloom like flowers in an endless garden of gratitude",
    category: "retail",
    style: "organic",
    premium: false,
    popular: false,
    new: true,
    featured: false,
    previewImage: "/templates/receipt-garden-verse.png",
    colors: ["#f0fdf4", "#16a34a", "#bbf7d0"],
    features: ["Garden-inspired", "Blooming Design", "Organic Flow", "Natural Beauty"],
    rating: 4.6,
    downloads: 389,
    industry: "Garden & Nature",
    tags: ["garden", "bloom", "natural", "organic"],
    templateData: {
      ...defaultReceiptCustomization,
      primaryColor: "#16a34a",
      secondaryColor: "#22c55e",
      accentColor: "#4ade80",
      backgroundColor: "#f0fdf4",
      textColor: "#14532d",
      headerBgColor: "#bbf7d0",
      fontFamily: "Inter",
      fontSize: 13,
      headerFontSize: 17,
      fontWeight: "normal",
      layout: "single-column",
      headerStyle: "standard",
      footerStyle: "simple",
      tableBorders: false,
      alternateRowColors: true,
      roundedCorners: true,
      shadowEffect: false,
      thankYouMessage: "In our garden of commerce, your trust helps us bloom",
      returnPolicy: "Like seasons changing, returns flow naturally within our garden of care.",
      contactInfo: "Plant your questions with us, watch answers grow",
    }
  }
];

// Get receipt template by ID
export const getReceiptTemplateById = (id: string): PaymentReceiptTemplate | undefined => {
  return receiptTemplates.find(template => template.id === id);
};

// Get receipt templates by category
export const getReceiptTemplatesByCategory = (category: string): PaymentReceiptTemplate[] => {
  return receiptTemplates.filter(template => template.category === category);
};

// Get featured receipt templates
export const getFeaturedReceiptTemplates = (): PaymentReceiptTemplate[] => {
  return receiptTemplates.filter(template => template.featured);
};

// Get popular receipt templates
export const getPopularReceiptTemplates = (): PaymentReceiptTemplate[] => {
  return receiptTemplates.filter(template => template.popular);
};

// Get new receipt templates
export const getNewReceiptTemplates = (): PaymentReceiptTemplate[] => {
  return receiptTemplates.filter(template => template.new);
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
