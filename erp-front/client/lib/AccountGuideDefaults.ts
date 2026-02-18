import { AccountNode } from "./accounts_function";

/**
 * Default Chart of Accounts Structure aligned with Daftra
 * 
 * Main Categories:
 * 1. Assets
 * 2. Liabilities
 * 3. Equity
 * 4. Revenue
 * 5. Expenses
 */

export const DEFAULT_ACCOUNT_STRUCTURE: AccountNode[] = [
    // 1. ASSETS
    {
        id: "acc-1",
        code: "1",
        name: "Assets",
        nameAr: "الأصول",
        accountType: "main",
        balanceType: "debit",
        children: [
            {
                id: "acc-1-1",
                code: "1.1",
                name: "Current Assets",
                nameAr: "الأصول المتداولة",
                accountType: "main",
                balanceType: "debit",
                children: [
                    {
                        id: "acc-1-1-1",
                        code: "1.1.1",
                        name: "Cash",
                        nameAr: "النقدية",
                        accountType: "sub",
                        balanceType: "debit",
                        children: [],
                    },
                    {
                        id: "acc-1-1-2",
                        code: "1.1.2",
                        name: "Bank Accounts",
                        nameAr: "الحسابات البنكية",
                        accountType: "sub",
                        balanceType: "debit",
                        children: [],
                    },
                    {
                        id: "acc-1-1-3",
                        code: "1.1.3",
                        name: "Accounts Receivable",
                        nameAr: "الذمم المدينة",
                        accountType: "sub",
                        balanceType: "debit",
                        children: [],
                    },
                    {
                        id: "acc-1-1-4",
                        code: "1.1.4",
                        name: "Inventory",
                        nameAr: "المخزون",
                        accountType: "sub",
                        balanceType: "debit",
                        children: [],
                    },
                    {
                        id: "acc-1-1-5",
                        code: "1.1.5",
                        name: "Prepaid Expenses",
                        nameAr: "المصروفات المدفوعة مقدماً",
                        accountType: "sub",
                        balanceType: "debit",
                        children: [],
                    },
                ],
            },
            {
                id: "acc-1-2",
                code: "1.2",
                name: "Fixed Assets",
                nameAr: "الأصول الثابتة",
                accountType: "main",
                balanceType: "debit",
                children: [
                    {
                        id: "acc-1-2-1",
                        code: "1.2.1",
                        name: "Property",
                        nameAr: "العقارات",
                        accountType: "sub",
                        balanceType: "debit",
                        children: [],
                    },
                    {
                        id: "acc-1-2-2",
                        code: "1.2.2",
                        name: "Equipment",
                        nameAr: "المعدات",
                        accountType: "sub",
                        balanceType: "debit",
                        children: [],
                    },
                    {
                        id: "acc-1-2-3",
                        code: "1.2.3",
                        name: "Vehicles",
                        nameAr: "المركبات",
                        accountType: "sub",
                        balanceType: "debit",
                        children: [],
                    },
                    {
                        id: "acc-1-2-4",
                        code: "1.2.4",
                        name: "Furniture & Fixtures",
                        nameAr: "الأثاث والتجهيزات",
                        accountType: "sub",
                        balanceType: "debit",
                        children: [],
                    },
                    {
                        id: "acc-1-2-5",
                        code: "1.2.5",
                        name: "Accumulated Depreciation",
                        nameAr: "مجمع الإهلاك",
                        accountType: "sub",
                        balanceType: "credit",
                        children: [],
                    },
                ],
            },
        ],
    },

    // 2. LIABILITIES
    {
        id: "acc-2",
        code: "2",
        name: "Liabilities",
        nameAr: "الخصوم",
        accountType: "main",
        balanceType: "credit",
        children: [
            {
                id: "acc-2-1",
                code: "2.1",
                name: "Current Liabilities",
                nameAr: "الخصوم المتداولة",
                accountType: "main",
                balanceType: "credit",
                children: [
                    {
                        id: "acc-2-1-1",
                        code: "2.1.1",
                        name: "Accounts Payable",
                        nameAr: "الذمم الدائنة",
                        accountType: "sub",
                        balanceType: "credit",
                        children: [],
                    },
                    {
                        id: "acc-2-1-2",
                        code: "2.1.2",
                        name: "Short-term Loans",
                        nameAr: "القروض قصيرة الأجل",
                        accountType: "sub",
                        balanceType: "credit",
                        children: [],
                    },
                    {
                        id: "acc-2-1-3",
                        code: "2.1.3",
                        name: "Accrued Expenses",
                        nameAr: "المصروفات المستحقة",
                        accountType: "sub",
                        balanceType: "credit",
                        children: [],
                    },
                    {
                        id: "acc-2-1-4",
                        code: "2.1.4",
                        name: "Taxes Payable",
                        nameAr: "الضرائب المستحقة",
                        accountType: "sub",
                        balanceType: "credit",
                        children: [],
                    },
                ],
            },
            {
                id: "acc-2-2",
                code: "2.2",
                name: "Long-term Liabilities",
                nameAr: "الخصوم طويلة الأجل",
                accountType: "main",
                balanceType: "credit",
                children: [
                    {
                        id: "acc-2-2-1",
                        code: "2.2.1",
                        name: "Long-term Loans",
                        nameAr: "القروض طويلة الأجل",
                        accountType: "sub",
                        balanceType: "credit",
                        children: [],
                    },
                    {
                        id: "acc-2-2-2",
                        code: "2.2.2",
                        name: "Bonds Payable",
                        nameAr: "السندات المستحقة",
                        accountType: "sub",
                        balanceType: "credit",
                        children: [],
                    },
                ],
            },
        ],
    },

    // 3. EQUITY
    {
        id: "acc-3",
        code: "3",
        name: "Equity",
        nameAr: "حقوق الملكية",
        accountType: "main",
        balanceType: "credit",
        children: [
            {
                id: "acc-3-1",
                code: "3.1",
                name: "Owner's Equity",
                nameAr: "رأس المال",
                accountType: "sub",
                balanceType: "credit",
                children: [],
            },
            {
                id: "acc-3-2",
                code: "3.2",
                name: "Retained Earnings",
                nameAr: "الأرباح المحتجزة",
                accountType: "sub",
                balanceType: "credit",
                children: [],
            },
            {
                id: "acc-3-3",
                code: "3.3",
                name: "Drawings",
                nameAr: "المسحوبات",
                accountType: "sub",
                balanceType: "debit",
                children: [],
            },
        ],
    },

    // 4. REVENUE
    {
        id: "acc-4",
        code: "4",
        name: "Revenue",
        nameAr: "الإيرادات",
        accountType: "main",
        balanceType: "credit",
        children: [
            {
                id: "acc-4-1",
                code: "4.1",
                name: "Sales Revenue",
                nameAr: "إيرادات المبيعات",
                accountType: "main",
                balanceType: "credit",
                children: [
                    {
                        id: "acc-4-1-1",
                        code: "4.1.1",
                        name: "Product Sales",
                        nameAr: "مبيعات المنتجات",
                        accountType: "sub",
                        balanceType: "credit",
                        children: [],
                    },
                    {
                        id: "acc-4-1-2",
                        code: "4.1.2",
                        name: "Service Revenue",
                        nameAr: "إيرادات الخدمات",
                        accountType: "sub",
                        balanceType: "credit",
                        children: [],
                    },
                ],
            },
            {
                id: "acc-4-2",
                code: "4.2",
                name: "Other Income",
                nameAr: "الإيرادات الأخرى",
                accountType: "main",
                balanceType: "credit",
                children: [
                    {
                        id: "acc-4-2-1",
                        code: "4.2.1",
                        name: "Interest Income",
                        nameAr: "إيرادات الفوائد",
                        accountType: "sub",
                        balanceType: "credit",
                        children: [],
                    },
                    {
                        id: "acc-4-2-2",
                        code: "4.2.2",
                        name: "Rental Income",
                        nameAr: "إيرادات الإيجار",
                        accountType: "sub",
                        balanceType: "credit",
                        children: [],
                    },
                ],
            },
        ],
    },

    // 5. EXPENSES
    {
        id: "acc-5",
        code: "5",
        name: "Expenses",
        nameAr: "المصروفات",
        accountType: "main",
        balanceType: "debit",
        children: [
            {
                id: "acc-5-1",
                code: "5.1",
                name: "Operating Expenses",
                nameAr: "المصروفات التشغيلية",
                accountType: "main",
                balanceType: "debit",
                children: [
                    {
                        id: "acc-5-1-1",
                        code: "5.1.1",
                        name: "Salaries & Wages",
                        nameAr: "الرواتب والأجور",
                        accountType: "sub",
                        balanceType: "debit",
                        children: [],
                    },
                    {
                        id: "acc-5-1-2",
                        code: "5.1.2",
                        name: "Rent Expense",
                        nameAr: "مصروف الإيجار",
                        accountType: "sub",
                        balanceType: "debit",
                        children: [],
                    },
                    {
                        id: "acc-5-1-3",
                        code: "5.1.3",
                        name: "Utilities",
                        nameAr: "المرافق",
                        accountType: "sub",
                        balanceType: "debit",
                        children: [],
                    },
                    {
                        id: "acc-5-1-4",
                        code: "5.1.4",
                        name: "Insurance",
                        nameAr: "التأمين",
                        accountType: "sub",
                        balanceType: "debit",
                        children: [],
                    },
                ],
            },
            {
                id: "acc-5-2",
                code: "5.2",
                name: "Administrative Expenses",
                nameAr: "المصروفات الإدارية",
                accountType: "main",
                balanceType: "debit",
                children: [
                    {
                        id: "acc-5-2-1",
                        code: "5.2.1",
                        name: "Office Supplies",
                        nameAr: "اللوازم المكتبية",
                        accountType: "sub",
                        balanceType: "debit",
                        children: [],
                    },
                    {
                        id: "acc-5-2-2",
                        code: "5.2.2",
                        name: "Professional Fees",
                        nameAr: "الأتعاب المهنية",
                        accountType: "sub",
                        balanceType: "debit",
                        children: [],
                    },
                    {
                        id: "acc-5-2-3",
                        code: "5.2.3",
                        name: "Travel & Entertainment",
                        nameAr: "السفر والترفيه",
                        accountType: "sub",
                        balanceType: "debit",
                        children: [],
                    },
                ],
            },
            {
                id: "acc-5-3",
                code: "5.3",
                name: "Selling Expenses",
                nameAr: "مصروفات البيع",
                accountType: "main",
                balanceType: "debit",
                children: [
                    {
                        id: "acc-5-3-1",
                        code: "5.3.1",
                        name: "Marketing & Advertising",
                        nameAr: "التسويق والإعلان",
                        accountType: "sub",
                        balanceType: "debit",
                        children: [],
                    },
                    {
                        id: "acc-5-3-2",
                        code: "5.3.2",
                        name: "Sales Commissions",
                        nameAr: "عمولات المبيعات",
                        accountType: "sub",
                        balanceType: "debit",
                        children: [],
                    },
                ],
            },
            {
                id: "acc-5-4",
                code: "5.4",
                name: "Other Expenses",
                nameAr: "المصروفات الأخرى",
                accountType: "main",
                balanceType: "debit",
                children: [
                    {
                        id: "acc-5-4-1",
                        code: "5.4.1",
                        name: "Interest Expense",
                        nameAr: "مصروف الفوائد",
                        accountType: "sub",
                        balanceType: "debit",
                        children: [],
                    },
                    {
                        id: "acc-5-4-2",
                        code: "5.4.2",
                        name: "Depreciation Expense",
                        nameAr: "مصروف الإهلاك",
                        accountType: "sub",
                        balanceType: "debit",
                        children: [],
                    },
                    {
                        id: "acc-5-4-3",
                        code: "5.4.3",
                        name: "Miscellaneous Expenses",
                        nameAr: "مصروفات متنوعة",
                        accountType: "sub",
                        balanceType: "debit",
                        children: [],
                    },
                ],
            },
        ],
    },
];

/**
 * Account category definitions with metadata
 */
export const ACCOUNT_CATEGORIES = [
    {
        code: "1",
        name: "Assets",
        nameAr: "الأصول",
        color: "bg-blue-500",
        icon: "Wallet",
        balanceType: "debit" as const,
    },
    {
        code: "2",
        name: "Liabilities",
        nameAr: "الخصوم",
        color: "bg-red-500",
        icon: "CreditCard",
        balanceType: "credit" as const,
    },
    {
        code: "3",
        name: "Equity",
        nameAr: "حقوق الملكية",
        color: "bg-purple-500",
        icon: "PieChart",
        balanceType: "credit" as const,
    },
    {
        code: "4",
        name: "Revenue",
        nameAr: "الإيرادات",
        color: "bg-green-500",
        icon: "TrendingUp",
        balanceType: "credit" as const,
    },
    {
        code: "5",
        name: "Expenses",
        nameAr: "المصروفات",
        color: "bg-orange-500",
        icon: "TrendingDown",
        balanceType: "debit" as const,
    },
];

/**
 * Get category information by code
 */
export function getCategoryByCode(code: string) {
    const categoryCode = code.charAt(0);
    return ACCOUNT_CATEGORIES.find((cat) => cat.code === categoryCode);
}

/**
 * Get category color class
 */
export function getCategoryColor(code: string): string {
    const category = getCategoryByCode(code);
    return category?.color || "bg-gray-500";
}

/**
 * Check if default accounts need to be initialized
 */
export function shouldInitializeDefaults(existingAccounts: AccountNode[]): boolean {
    // Check if we have the 5 main categories
    const mainCategories = existingAccounts.filter((acc) =>
        acc.accountType === "main" && acc.code.length === 1
    );

    return mainCategories.length < 5;
}
