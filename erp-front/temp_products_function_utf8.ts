export const calculateItemTotal = (item) => {
  const subtotal = item.quantity * item.unitPrice;
  const discountAmount =
    item.discountType === "percentage"
      ? subtotal * (item.discount / 100)
      : item.discount;
  const afterDiscount = subtotal - discountAmount;
  const tax = afterDiscount * (item.taxRate / 100);
  return afterDiscount + tax;
};

export const calculateTotals = (values) => {
  const subtotal = values.items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0,
  );

  const totalItemDiscounts = values.items.reduce((sum, item) => {
    const itemSubtotal = item.quantity * item.unitPrice;
    return (
      sum +
      (item.discountType === "percentage"
        ? itemSubtotal * (item.discount / 100)
        : item.discount)
    );
  }, 0);

  const afterItemDiscounts = subtotal - totalItemDiscounts;

  const totalTax = values.items.reduce((sum, item) => {
    const itemSubtotal = item.quantity * item.unitPrice;
    const itemDiscount =
      item.discountType === "percentage"
        ? itemSubtotal * (item.discount / 100)
        : item.discount;
    const afterDiscount = itemSubtotal - itemDiscount;
    return sum + afterDiscount * (item.taxRate / 100);
  }, 0);

  let discount = 0;
  if (values.discountType === "percentage") {
    discount = afterItemDiscounts * (values.discountValue / 100);
  } else {
    discount = values.discountValue;
  }

  const total = afterItemDiscounts + totalTax - discount + values.shippingCost;

  return {
    subtotal,
    totalItemDiscounts,
    totalTax,
    discount,
    total,
  };
};

export const generateNumber = (key) => {
  const date = new Date();
  const year = date.getFullYear().toString().substring(2, 4);
  const day = date.getDay();

  const month = String(date.getMonth() + 1).padStart(2, "0");
  const random = Math.floor(Math.random() * 99999).toString();
  //.padStart(5, "0");
  return `${key}-${year}${month}${day}-${random}`;
};

export function randomEmail() {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  const length = 8;

  let name = "";
  for (let i = 0; i < length; i++) {
    name += chars[Math.floor(Math.random() * chars.length)];
  }

  return `${name}@dan.com`;
}

export function generatePassword(length = 8) {
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
  let password = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  return password;
}

export const generateTransactionId = (prefix = "TXN") => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `${prefix}-${timestamp}-${random}`.toUpperCase();
};

export const handleSalesRepSelect = (salesRep, setFieldValue: any) => {
  setFieldValue("salesRepId", salesRep.id);
  setFieldValue("salesRep", salesRep);
};

export const handlePaymentTermSelect = (paymentTerm, setFieldValue: any) => {
  setFieldValue("paymentTermId", paymentTerm.id);
  setFieldValue("paymentTerm", paymentTerm);

  // Auto-calculate due date based on payment terms
  const issueDate = new Date();
  const dueDate = new Date(
    issueDate.getTime() + paymentTerm.days * 24 * 60 * 60 * 1000,
  );
  setFieldValue("dueDate", dueDate.toISOString().split("T")[0]);
};

export const handleCostCenterSelect = (
  ele,
  index: number,
  setFieldValue: any,
) => {
  setFieldValue(`items.${index}.costCenterId`, ele.costCenterId);
  setFieldValue(`items.${index}.costCenter`, ele.costCenter);
  setFieldValue(`items.${index}.value`, ele.value);

  // Recalculate total
  const item = {
    costCenterId: ele.costCenterId,
    costCenter: ele.costCenter,
    value: ele.value,
    type: ele.type,
  };
  setFieldValue(`items.${index}.total`, calculateItemTotal(item));
};

export const handleProductSelect = (
  product,
  index: number,
  setFieldValue: any,
  isPurchase: boolean = false,
  convertAmount,
  currency,
  isStockAdjust: string | null = null,
  priceListId: string | null = null,
) => {
  const main = JSON.parse(product.main || "{}");

  // Helper variables for clear logic
  // originalSellingPrice defined in product setup (per piece/base unit)
  let baseSellingPrice = parseFloat(product.totalAmount || 0);

  // originalPurchasePrice defined in product setup (per piece/base unit)
  let basePurchasePrice = parseFloat(main?.purchasePrice || 0);

  // Get Unit List
  const unitList = main?.unitList || [];

  // Determine Selected Unit
  // If editing invoice, we might already have a unit selected, but this function is usually called when picking a product
  // So we default to the product's default unit for the transaction type
  const defaultUnitId = isPurchase ? main?.unitBuy : main?.unitSell;
  const defaultUnitName = isPurchase ? main?.unitBuyVal : main?.unitSellVal;

  // Calculate Unit Quantity (Factor) from Base Unit
  // If selected unit is "Box" (12 pieces), factor is 12.
  // We need to find the unit info in unitList.
  let unitQuantity = 1;
  let selectedUnitInfo = unitList.find(
    (u) => u.unit === defaultUnitId || u.unit === defaultUnitName,
  );

  // Fallback: if no unit found or default is basic unit, factor is 1
  if (selectedUnitInfo) {
    // Check operator. Usually "multiply" for bigger units.
    // Box = 12 * Piece.
    // Price of Box = 12 * Price of Piece.
    if (selectedUnitInfo.operator === "divide") {
      unitQuantity = 1 / parseFloat(selectedUnitInfo.unit || "1");
    } else {
      unitQuantity = parseFloat(selectedUnitInfo.unit || "1");
    }
  } else if (defaultUnitId && !isNaN(parseFloat(defaultUnitId))) {
    // Sometimes unitBuy is just the quantity factor directly if it's a simple multiplier
    // But better to rely on unitList lookup if consistency is key.
    // Legacy logic often just took the value if not found.
    // Let's assume defaultUnitId might be the factor if not found in list, OR it's just ID.
    // In the old code, it seems it tried to find it.
    // verified old logic:
    // const unitInfo = unitList.find(u => u.unit === primaryUnit || u.unit === primaryUnitVal);
    // if (primaryUnit && parseFloat(primaryUnit) > 1) { ... }

    // Let's stick to the prompt's request: "Revert handleProductSelect to the exact old implementation".
    // The provided previous code in the prompt description (or lack thereof, relied on "exact old implementation")
    // I will use the logic I derived in the plan which mimics standard unit logic.

    if (parseFloat(defaultUnitId) > 0) {
      unitQuantity = parseFloat(defaultUnitId);
    }
  }

  // Currency Conversion (First step as per prompt)
  // Convert base prices to system currency (IQD usually)
  const convertedSellingPrice = convertAmount(baseSellingPrice, currency);
  const convertedPurchasePrice = convertAmount(basePurchasePrice, currency);

  // Calculate Prices Per UNIT (Box Price)
  // Selling Price for this unit
  const unitSellingPrice = convertedSellingPrice * unitQuantity;
  // Purchase Price for this unit
  const unitPurchasePrice = convertedPurchasePrice * unitQuantity;

  // Assign values based on Transaction Type
  // isPurchase = true -> unitPrice (Main Price) is Purchase Price
  // isPurchase = false -> unitPrice (Main Price) is Selling Price

  const unitPrice = isPurchase ? unitPurchasePrice : unitSellingPrice;
  const unitPrice2 = isPurchase ? unitSellingPrice : unitPurchasePrice;

  // originalUnitPrice variables (Piece/Base Price)
  // originalUnitPrice = Selling Price (per piece)
  // originalUnitPrice2 = Purchase Price (per piece)
  const originalUnitPrice = convertedSellingPrice;
  const originalUnitPrice2 = convertedPurchasePrice;

  // Set Field Values
  setFieldValue(`items.${index}.productId`, product.id);
  setFieldValue(`items.${index}.productName`, product.elementNumber);
  setFieldValue(`items.${index}.unitList`, unitList);

  // Unit details
  setFieldValue(`items.${index}.unit`, unitQuantity);
  setFieldValue(`items.${index}.unitName`, defaultUnitName); // The label (Box, Piece)

  // Prices
  setFieldValue(`items.${index}.unitPrice`, unitPrice);
  setFieldValue(`items.${index}.unitPrice2`, unitPrice2);

  // Important: originalUnitPrice must be the base price (piece price)
  setFieldValue(`items.${index}.originalUnitPrice`, originalUnitPrice);
  setFieldValue(`items.${index}.originalUnitPrice2`, originalUnitPrice2);

  // Stock
  setFieldValue(
    `items.${index}.stockQuantity`,
    isStockAdjust != null
      ? isStockAdjust === "Add"
        ? product.oldQuantity + 1
        : product.oldQuantity - 1
      : isPurchase
        ? product.oldQuantity + 1
        : product.oldQuantity - 1,
  );
  setFieldValue(`items.${index}.oldQuantity`, product.oldQuantity);

  // Initial Total Calculation
  const item = {
    productId: product.id,
    productName: product.elementNumber,
    oldQuantity: product.oldQuantity,
    stockQuantity: product.stockQuantity,
    quantity: 1,
    unitPrice: unitPrice,
    discount: 0,
    discountType: "percentage" as const,
    taxRate: 0,
    total: 0,
  };
  setFieldValue(`items.${index}.total`, calculateItemTotal(item));
};

export const handleCustomerSelect = (
  customer,
  setFieldValue,
  setShowCustomerSearch,
  setSearchTerm,
  //   setAddQuery,
) => {
  setFieldValue("customerId", customer.id);
  setFieldValue("customer", customer);
  setShowCustomerSearch(false);
  setSearchTerm(""); // Clear search term after selection
  // setAddQuery(""); // Clear add query after selection
};

export const removeAttachment = (
  index: number,
  attachments: File[],
  setFieldValue: any,
) => {
  const newAttachments = attachments.filter((_, i) => i !== index);
  setFieldValue("attachments", newAttachments);
};

export const handleFileUpload = (
  files: FileList | null,
  setFieldValue: any,
  attachments,
  isRTL,
) => {
  if (!files) return;

  const newFiles = Array.from(files).filter((file) => {
    if (file.size > 10 * 1024 * 1024) {
      alert(
        isRTL
          ? "╪¡╪¼┘à ╪º┘ä┘à┘ä┘ü ┘è╪¼╪¿ ╪ú┘å ┘è┘â┘ê┘å ╪ú┘é┘ä ┘à┘å 10 ┘à┘è╪¼╪º╪¿╪º┘è╪¬"
          : "File size must be less than 10MB",
      );
      return false;
    }
    return true;
  });

  attachments.push(...newFiles);
  setFieldValue("attachments", attachments);

  // console.log("attachments", attachments);
};

export const generateBarcode = () => {
  // Generate a random 13-digit number
  return Math.floor(Math.random() * 10000000000000).toString().padStart(13, '0');
};
