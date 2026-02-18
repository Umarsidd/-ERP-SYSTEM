
// Use relative paths that tsx can resolve from C:\Users\lenovo\Desktop\erp\erp-front
// Try without extension or with correct relative path
import { handleProductSelect, calculateItemTotal } from './client/lib/products_function.ts';
import { handlePriceListProductSelect } from './client/lib/price_list_function.ts';

// Rest of the file remains the same...
// Mock dependencies
const mockSetFieldValue = (field: string, value: any) => {
    // console.log(`SET ${field} = ${value}`);
};

const mockConvertAmount = (amount: number, currency: any) => amount;

const mockProduct = {
    id: "prod-123",
    elementNumber: "PROD-001",
    totalAmount: "100", // Base Price
    oldQuantity: 50,
    main: JSON.stringify({
        purchasePrice: "80",
        unitSell: "box",
        unitSellVal: "Box", // Default Sell Unit
        unitBuy: "box",
        unitBuyVal: "Box", // Default Buy Unit
        unitList: [
            { unit: "box", unitVal: "Box", operator: "multiply", unit: "12" },
            { unit: "piece", unitVal: "Piece", operator: "multiply", unit: "1" }
        ]
    })
};

console.log("--- Starting Verification Tests ---");

// Test 1
console.log("\n1. Testing handleProductSelect (Sales)...");
let salesFields: Record<string, any> = {};
const setSalesField = (f: string, v: any) => { salesFields[f] = v; };

handleProductSelect(mockProduct, 0, setSalesField, false, mockConvertAmount, {}, null, null);

// Expectation: 
// unitQuantity = 12
// unitSellingPrice = 100 * 12 = 1200
console.log(`Sales Unit Price: ${salesFields['items.0.unitPrice']} (Expected 1200)`);
console.log(`Sales Base Price: ${salesFields['items.0.originalUnitPrice']} (Expected 100)`);


// Test 2
console.log("\n2. Testing handlePriceListProductSelect (Purchase)...");
let purchFields: Record<string, any> = {};
const setPurchField = (f: string, v: any) => { purchFields[f] = v; };

const plPrice = 75; // Price from list for Base Unit

// Call the function
handlePriceListProductSelect(mockProduct, 0, setPurchField, true, mockConvertAmount, {}, plPrice, null, null);

// Expectation:
// unitQuantity = 12
// unitPurchasePrice = 75 * 12 = 900
console.log(`Purchase Unit Price: ${purchFields['items.0.unitPrice']} (Expected 900)`);
console.log(`Purchase Base Price 2: ${purchFields['items.0.originalUnitPrice2']} (Expected 75)`);

if (salesFields['items.0.unitPrice'] === 1200 && purchFields['items.0.unitPrice'] === 900) {
    console.log("\n✅ SUCCESS: Logic verified.");
} else {
    console.log("\n❌ FAILURE: Logic mismatch.");
}
