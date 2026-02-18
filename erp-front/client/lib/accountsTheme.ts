/**
 * Deftra-Style Design Tokens for Accounting Modules
 * 
 * Centralized design system for Chart of Accounts and Cost Center modules
 * following Deftra's clean, enterprise-grade UI design patterns.
 */

export const DEFTRA_COLORS = {
    // Primary colors
    primary: '#3b82f6',           // Blue for selections and primary actions
    primaryHover: '#2563eb',      // Darker blue for hover states
    primaryLight: '#dbeafe',      // Light blue for backgrounds

    // Background colors
    background: '#ffffff',         // White cards and panels
    pageBg: '#f9fafb',            // Light gray page background
    secondaryBg: '#f3f4f6',       // Secondary background (muted areas)

    // Border colors
    border: '#e5e7eb',            // Subtle borders
    borderDark: '#d1d5db',        // Darker borders

    // Interactive states
    hover: '#f3f4f6',             // Hover background
    active: '#eff6ff',            // Active/selected background

    // Text colors
    text: '#111827',              // Primary text (dark gray)
    textSecondary: '#6b7280',     // Secondary text (medium gray)
    textMuted: '#9ca3af',         // Muted text (light gray)

    // Account type colors (matching ACCOUNT_CATEGORIES)
    assets: '#3b82f6',            // Blue
    liabilities: '#ef4444',       // Red
    equity: '#8b5cf6',            // Purple
    revenue: '#10b981',           // Green
    expenses: '#f59e0b',          // Orange

    // Status colors
    success: '#10b981',           // Green
    warning: '#f59e0b',           // Orange
    error: '#ef4444',             // Red
    info: '#3b82f6',              // Blue

    // Badge colors
    badgeBg: '#f3f4f6',           // Light gray background for badges
    badgeText: '#374151',         // Dark text for badges
};

export const DEFTRA_SPACING = {
    // Padding and margins
    xs: '0.25rem',      // 4px - minimal spacing
    sm: '0.375rem',     // 6px - compact spacing
    md: '0.5rem',       // 8px - normal spacing
    lg: '0.75rem',      // 12px - comfortable spacing
    xl: '1rem',         // 16px - large spacing
    '2xl': '1.5rem',    // 24px - extra large spacing

    // Tree indentation
    treeIndent: '1.25rem',  // 20px - indent per level

    // Gap between elements
    gapSm: '0.5rem',    // 8px
    gapMd: '0.75rem',   // 12px
    gapLg: '1rem',      // 16px
};

export const DEFTRA_SHADOWS = {
    // Card shadows
    card: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    cardHover: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',

    // Dropdown shadows
    dropdown: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',

    // Button shadows
    button: '0 1px 2px 0 rgb(0 0 0 / 0.05)',

    // None
    none: 'none',
};

export const DEFTRA_BORDERS = {
    // Border radius
    radiusSm: '0.25rem',   // 4px - small radius
    radiusMd: '0.375rem',  // 6px - medium radius
    radiusLg: '0.5rem',    // 8px - large radius
    radiusXl: '0.75rem',   // 12px - extra large radius
    radiusFull: '9999px',  // Full radius (pills)

    // Border width
    width: '1px',
    widthThick: '2px',
};

export const DEFTRA_TYPOGRAPHY = {
    // Font families
    fontSans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontMono: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',

    // Font sizes
    textXs: '0.75rem',     // 12px
    textSm: '0.875rem',    // 14px
    textBase: '1rem',      // 16px
    textLg: '1.125rem',    // 18px
    textXl: '1.25rem',     // 20px
    text2Xl: '1.5rem',     // 24px

    // Font weights
    weightNormal: 400,
    weightMedium: 500,
    weightSemibold: 600,
    weightBold: 700,

    // Line heights
    lineHeightTight: 1.25,
    lineHeightNormal: 1.5,
    lineHeightRelaxed: 1.75,
};

export const DEFTRA_TRANSITIONS = {
    // Transition durations
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',

    // Easing functions
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
};

/**
 * Get color for account category based on code
 */
export function getAccountCategoryColor(code: string): string {
    const categoryCode = code.charAt(0);

    switch (categoryCode) {
        case '1':
            return DEFTRA_COLORS.assets;
        case '2':
            return DEFTRA_COLORS.liabilities;
        case '3':
            return DEFTRA_COLORS.equity;
        case '4':
            return DEFTRA_COLORS.revenue;
        case '5':
            return DEFTRA_COLORS.expenses;
        default:
            return DEFTRA_COLORS.textMuted;
    }
}

/**
 * Get background color for account category badge
 */
export function getAccountCategoryBgColor(code: string): string {
    const categoryCode = code.charAt(0);

    switch (categoryCode) {
        case '1':
            return '#dbeafe'; // light blue
        case '2':
            return '#fee2e2'; // light red
        case '3':
            return '#f3e8ff'; // light purple
        case '4':
            return '#d1fae5'; // light green
        case '5':
            return '#fed7aa'; // light orange
        default:
            return DEFTRA_COLORS.badgeBg;
    }
}

/**
 * Deftra-style utility classes (can be used with cn() utility)
 */
export const DEFTRA_CLASSES = {
    // Card styles
    card: 'bg-white border border-gray-200 rounded-lg shadow-sm',
    cardHover: 'transition-shadow duration-200 hover:shadow-md',

    // Tree node styles
    treeNode: 'py-1.5 px-2 rounded-md cursor-pointer transition-colors',
    treeNodeHover: 'hover:bg-gray-50',
    treeNodeSelected: 'bg-blue-50 text-blue-600',

    // Badge styles
    badge: 'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
    badgeOutline: 'border',

    // Button styles
    button: 'inline-flex items-center justify-center rounded-md font-medium transition-colors',
    buttonPrimary: 'bg-blue-600 text-white hover:bg-blue-700',
    buttonSecondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
    buttonGhost: 'hover:bg-gray-100 text-gray-700',

    // Input styles
    input: 'w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',

    // Label styles
    label: 'block text-sm font-medium text-gray-700 mb-1',
};
