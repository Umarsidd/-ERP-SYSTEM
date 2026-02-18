
// ... imports omitted as we use inline logic ...

/* 
   COPY OF handleProductSelect logic for testing 
*/
const handleProductSelect = (
    product: any,
    index: number,
    setFieldValue: any,
    isPurchase: boolean = false,
    convertAmount: any,
    currency: any,
    isStockAdjust: string | null = null,
    priceListId: string | null = null,
) => {
    const main = JSON.parse(product.main || "{}");
    let baseSellingPrice = parseFloat(product.totalAmount || 0);
    let basePurchasePrice = parseFloat(main?.purchasePrice || 0);
    const unitList = main?.unitList || [];
    const defaultUnitId = isPurchase ? main?.unitBuy : main?.unitSell;
    const defaultUnitName = isPurchase ? main?.unitBuyVal : main?.unitSellVal;

    let unitQuantity = 1;
    let selectedUnitInfo = unitList.find(
        (u: any) => u.unit === defaultUnitId || u.unit === defaultUnitName,
    );

    if (selectedUnitInfo) {
        if (selectedUnitInfo.operator === "divide") {
            unitQuantity = 1 / parseFloat(selectedUnitInfo.unit || "1");
        } else {
            unitQuantity = parseFloat(selectedUnitInfo.unit || "1");
        }
    } else if (defaultUnitId && !isNaN(parseFloat(defaultUnitId))) {
        if (parseFloat(defaultUnitId) > 0) {
            unitQuantity = parseFloat(defaultUnitId);
        }
    }

    const convertedSellingPrice = convertAmount(baseSellingPrice, currency);
    const convertedPurchasePrice = convertAmount(basePurchasePrice, currency);

    const unitSellingPrice = convertedSellingPrice * unitQuantity;
    const unitPurchasePrice = convertedPurchasePrice * unitQuantity;

    const unitPrice = isPurchase ? unitPurchasePrice : unitSellingPrice;
    const unitPrice2 = isPurchase ? unitSellingPrice : unitPurchasePrice;

    const originalUnitPrice = convertedSellingPrice;
    const originalUnitPrice2 = convertedPurchasePrice;

    setFieldValue(`items.${index}.unitPrice`, unitPrice);
    setFieldValue(`items.${index}.originalUnitPrice`, originalUnitPrice);
};


/* 
   COPY OF handlePriceListProductSelect logic for testing 
*/
const handlePriceListProductSelect = (
    product: any,
    index: number,
    setFieldValue: any,
    isPurchase: boolean = true,
    convertAmount: any,
    currency: any,
    priceListPrice: number = 0,
) => {
    const main = JSON.parse(product.main || "{}");
    let baseSellingPrice = parseFloat(product.totalAmount || 0);

    let basePurchasePrice = parseFloat(priceListPrice.toString() || "0"); // ADAPTATION

    const unitList = main?.unitList || [];
    const defaultUnitId = isPurchase ? main?.unitBuy : main?.unitSell;
    const defaultUnitName = isPurchase ? main?.unitBuyVal : main?.unitSellVal;

    let unitQuantity = 1;
    let selectedUnitInfo = unitList.find(
        (u: any) => u.unit === defaultUnitId || u.unit === defaultUnitName,
    );

    if (selectedUnitInfo) {
        if (selectedUnitInfo.operator === "divide") {
            unitQuantity = 1 / parseFloat(selectedUnitInfo.unit || "1");
        } else {
            unitQuantity = parseFloat(selectedUnitInfo.unit || "1");
        }
    } else if (defaultUnitId && !isNaN(parseFloat(defaultUnitId))) {
        if (parseFloat(defaultUnitId) > 0) {
            unitQuantity = parseFloat(defaultUnitId);
        }
    }

    const convertedSellingPrice = convertAmount(baseSellingPrice, currency);
    const convertedPurchasePrice = convertAmount(basePurchasePrice, currency);

    const unitSellingPrice = convertedSellingPrice * unitQuantity;
    const unitPurchasePrice = convertedPurchasePrice * unitQuantity;

    const unitPrice = isPurchase ? unitPurchasePrice : unitSellingPrice;
    const unitPrice2 = isPurchase ? unitSellingPrice : unitPurchasePrice; // Mirrors logic

    // const originalUnitPrice = convertedSellingPrice;
    const originalUnitPrice2 = convertedPurchasePrice;

    setFieldValue(`items.${index}.unitPrice`, unitPrice);
    setFieldValue(`items.${index}.originalUnitPrice2`, originalUnitPrice2);
};


// Mock dependencies
const mockSetFieldValue = (field: string, value: any) => { };
const mockConvertAmount = (amount: number, currency: any) => amount;

// UPDATED MOCK PRODUCT with correct structure
const mockProduct = {
    id: "prod-123",
    elementNumber: "PROD-001",
    totalAmount: "100", // Base Price
    oldQuantity: 50,
    main: JSON.stringify({
        purchasePrice: "80",
        unitSell: "12",    // Factor as string
        unitSellVal: "Box",
        unitBuy: "12",     // Factor as string
        unitBuyVal: "Box",
        unitList: [
            { unit: "12", unitVal: "Box", operator: "multiply" },
            { unit: "1", unitVal: "Piece", operator: "multiply" }
        ]
    })
};

console.log("--- Starting Verification Tests (Inline Logic) ---");

// Test 1
console.log("\n1. Testing handleProductSelect (Sales)...");
let salesFields: Record<string, any> = {};
const setSalesField = (f: string, v: any) => { salesFields[f] = v; };

handleProductSelect(mockProduct, 0, setSalesField, false, mockConvertAmount, {});

// Expectation: 
// unitQuantity = 12
// unitSellingPrice = 100 * 12 = 1200
console.log(`Sales Unit Price: ${salesFields['items.0.unitPrice']} (Expected 1200)`);
console.log(`Sales Base Price: ${salesFields['items.0.originalUnitPrice']} (Expected 100)`);


// Test 2
console.log("\n2. Testing handlePriceListProductSelect (Purchase)...");
let purchFields: Record<string, any> = {};
const setPurchField = (f: string, v: any) => { purchFields[f] = v; };

const plPrice = 75; // Price from list for Base Unit (Piece)

// Call the function
handlePriceListProductSelect(mockProduct, 0, setPurchField, true, mockConvertAmount, {}, plPrice);

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
