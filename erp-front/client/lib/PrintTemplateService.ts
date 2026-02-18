import { v4 as uuidv4 } from "uuid";

export interface PrintSection {
    id: string;
    type: "text" | "image" | "table" | "divider" | "columns" | "qr" | "barcode" | "header" | "footer" | "spacer";
    content?: string; // For text/variables
    children?: PrintSection[]; // For columns
    style?: React.CSSProperties; // Specific styles
    visible: boolean;
    label: string; // For UI display
    field?: string; // For dynamic fields mapping
}

export interface PrintStyles {
    fontFamily: string;
    fontSize: number;
    width: number; // mm
    marginTop: number;
    marginBottom: number;
    marginLeft: number;
    marginRight: number;
    textAlign: "left" | "center" | "right";
}

export interface PrintTemplate {
    id: string;
    name: string;
    isDefault: boolean;
    createdAt: number;
    updatedAt: number;
    sections: PrintSection[];
    styles: PrintStyles;
}

const STORAGE_KEY = "pos_print_templates";

export const PrintTemplateService = {
    getTemplates: (): PrintTemplate[] => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (!stored) return [];
            return JSON.parse(stored);
        } catch (e) {
            console.error("Failed to load templates", e);
            return [];
        }
    },

    saveTemplate: (template: PrintTemplate): void => {
        const templates = PrintTemplateService.getTemplates();
        const index = templates.findIndex((t) => t.id === template.id);

        if (index >= 0) {
            templates[index] = { ...template, updatedAt: Date.now() };
        } else {
            templates.push({ ...template, createdAt: Date.now(), updatedAt: Date.now() });
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
    },

    deleteTemplate: (id: string): void => {
        const templates = PrintTemplateService.getTemplates().filter((t) => t.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
    },

    setDefaultTemplate: (id: string): void => {
        const templates = PrintTemplateService.getTemplates().map((t) => ({
            ...t,
            isDefault: t.id === id,
        }));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
    },

    getDefaultTemplate: (): PrintTemplate | null => {
        const templates = PrintTemplateService.getTemplates();
        return templates.find((t) => t.isDefault) || templates[0] || null;
    },

    getTemplateById: (id: string): PrintTemplate | null => {
        const templates = PrintTemplateService.getTemplates();
        return templates.find((t) => t.id === id) || null;
    },

    createDefaultTemplate: (): PrintTemplate => {
        return {
            id: uuidv4(),
            name: "New Template",
            isDefault: false,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            styles: {
                fontFamily: "Inter",
                fontSize: 12,
                width: 80, // Thermal default
                marginTop: 0,
                marginBottom: 0,
                marginLeft: 0,
                marginRight: 0,
                textAlign: "left",
            },
            sections: [
                {
                    id: uuidv4(),
                    type: "header",
                    label: "Header (Logo & Info)",
                    visible: true,
                    content: "",
                    style: { textAlign: "center" }
                },
                {
                    id: uuidv4(),
                    type: "text",
                    label: "Store Name",
                    visible: true,
                    content: "{{store_name}}",
                    style: { fontSize: "16px", fontWeight: "bold", textAlign: "center", marginBottom: "5px" }
                },
                {
                    id: uuidv4(),
                    type: "divider",
                    label: "Divider",
                    visible: true,
                    style: { borderTop: "1px dashed #000", margin: "5px 0" }
                },
                {
                    id: uuidv4(),
                    type: "text",
                    label: "Invoice Info",
                    visible: true,
                    content: "Inv: {{invoice_no}}\nDate: {{date}} {{time}}",
                    style: { fontSize: "12px" }
                },
                {
                    id: uuidv4(),
                    type: "divider",
                    label: "Divider",
                    visible: true,
                    style: { borderTop: "1px dashed #000", margin: "5px 0" }
                },
                {
                    id: uuidv4(),
                    type: "table",
                    label: "Items Table",
                    visible: true,
                    content: "items", // special marker
                },
                {
                    id: uuidv4(),
                    type: "divider",
                    label: "Divider",
                    visible: true,
                    style: { borderTop: "1px dashed #000", margin: "5px 0" }
                },
                {
                    id: uuidv4(),
                    type: "text",
                    label: "Totals",
                    visible: true,
                    content: "Total: {{total}}\nTax: {{tax}}\nDiscount: {{discount}}",
                    style: { textAlign: "right", fontWeight: "bold" }
                },
                {
                    id: uuidv4(),
                    type: "footer",
                    label: "Footer",
                    visible: true,
                    content: "Thank you for your visit!",
                    style: { textAlign: "center", marginTop: "10px" }
                }
            ],
        };
    }
};
