/**
 * Safe JSON Helper Utilities
 * Provides defensive programming utilities for JSON parsing and property access
 */

/**
 * Safely parse JSON with fallback value
 * @param value - The value to parse
 * @param fallback - Fallback value if parsing fails (default: null)
 * @returns Parsed JSON or fallback value
 */
export const safeJSONParse = <T = any>(value: any, fallback: T | null = null): T | null => {
  // Handle undefined, null, empty string, or literal "undefined" string
  if (
    value === undefined ||
    value === null ||
    value === "" ||
    value === "undefined" ||
    value === "null"
  ) {
    return fallback;
  }

  // If already an object, return it
  if (typeof value === "object") {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch (e) {
    console.error("JSON parse error:", e, "Value:", value);
    return fallback;
  }
};

/**
 * Safely perform string operations like toLowerCase()
 * @param value - The value to operate on
 * @param operation - The operation to perform (default: 'toLowerCase')
 * @returns Result of operation or empty string
 */
export const safeStringOperation = (
  value: any,
  operation: "toLowerCase" | "toUpperCase" | "trim" = "toLowerCase"
): string => {
  if (value === undefined || value === null) {
    return "";
  }

  const strValue = String(value);

  try {
    switch (operation) {
      case "toLowerCase":
        return strValue.toLowerCase();
      case "toUpperCase":
        return strValue.toUpperCase();
      case "trim":
        return strValue.trim();
      default:
        return strValue;
    }
  } catch (e) {
    console.error(`String operation ${operation} error:`, e, "Value:", value);
    return "";
  }
};

/**
 * Safely access nested object properties
 * @param obj - The object to access
 * @param path - The property path (e.g., 'user.profile.name')
 * @param fallback - Fallback value if property doesn't exist
 * @returns Property value or fallback
 */
export const safePropertyAccess = <T = any>(
  obj: any,
  path: string,
  fallback: T | null = null
): T | null => {
  if (!obj || typeof obj !== "object") {
    return fallback;
  }

  try {
    const keys = path.split(".");
    let result = obj;

    for (const key of keys) {
      if (result === undefined || result === null) {
        return fallback;
      }
      result = result[key];
    }

    return result !== undefined ? result : fallback;
  } catch (e) {
    console.error("Property access error:", e, "Path:", path);
    return fallback;
  }
};

/**
 * Safely get customer/supplier name from parsed data
 * @param data - The parsed data object
 * @param type - Type of entity ('customer' or 'supplier')
 * @returns Name or 'Unknown'
 */
export const safeGetEntityName = (
  data: any,
  type: "customer" | "supplier" = "customer"
): string => {
  if (!data || typeof data !== "object") {
    return "Unknown";
  }

  const entity = data[type];
  if (entity && typeof entity === "object" && entity.name) {
    return String(entity.name);
  }

  return "Unknown";
};

/**
 * Safely parse and get a numeric value
 * @param value - The value to parse
 * @param fallback - Fallback value (default: 0)
 * @returns Numeric value or fallback
 */
export const safeParseNumber = (value: any, fallback: number = 0): number => {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  const parsed = parseFloat(value);
  return isNaN(parsed) ? fallback : parsed;
};

/**
 * Safely check if a value is a valid JSON string
 * @param value - The value to check
 * @returns true if valid JSON string, false otherwise
 */
export const isValidJSON = (value: any): boolean => {
  if (
    value === undefined ||
    value === null ||
    value === "" ||
    value === "undefined" ||
    value === "null"
  ) {
    return false;
  }

  if (typeof value !== "string") {
    return false;
  }

  try {
    JSON.parse(value);
    return true;
  } catch (e) {
    return false;
  }
};
