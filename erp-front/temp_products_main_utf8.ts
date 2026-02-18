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

  // Get base prices
  const purchasePrice = parseFloat(main?.purchasePrice || 0);
  const sellingPrice = parseFloat(product.totalAmount || 0);

  // Get unit information for the primary unit (buy or sell based on transaction type)
  const primaryUnit = isPurchase ? main?.unitBuy : main?.unitSell;
  const primaryUnitVal = isPurchase ? main?.unitBuyVal : main?.unitSellVal;
  const secondaryUnit = isPurchase ? main?.unitSell : main?.unitBuy;

  // Get unit list and find the selected unit's operator
  const unitList = main?.unitList || [];

  // Calculate original unit price (price per base unit)
  // Original unit price is the price for a single base unit (e.g., price per piece)
  let originalPriceForPrimary = isPurchase ? purchasePrice : sellingPrice;
  let originalPriceForSecondary = isPurchase ? sellingPrice : purchasePrice;

  // If we have a unit conversion, apply it to get the base unit price
  if (primaryUnit && parseFloat(primaryUnit) > 1) {
    const unitQuantity = parseFloat(primaryUnit);
    const unitInfo = unitList.find(u => u.unit === primaryUnit || u.unit === primaryUnitVal);
    const operator = unitInfo?.operator || "multiply";

    // If multiply: carton (12 pieces) = $12, so each piece = $12 / 12 = $1
    // If divide: use division to get base price
    if (operator === "multiply") {
      originalPriceForPrimary = originalPriceForPrimary / unitQuantity;
    } else {
      originalPriceForPrimary = originalPriceForPrimary * unitQuantity;
    }
  }

  if (secondaryUnit && parseFloat(secondaryUnit) > 1) {
    const unitQuantity = parseFloat(secondaryUnit);
    const unitInfo = unitList.find(u => u.unit === secondaryUnit);
    const operator = unitInfo?.operator || "multiply";

    if (operator === "multiply") {
      originalPriceForSecondary = originalPriceForSecondary / unitQuantity;
    } else {
      originalPriceForSecondary = originalPriceForSecondary * unitQuantity;
    }
  }

  // Convert to current currency
  originalPriceForPrimary = convertAmount(originalPriceForPrimary, currency);
  originalPriceForSecondary = convertAmount(originalPriceForSecondary, currency);

  // Calculate unit price (price for the selected unit quantity)
  let unitPrice = originalPriceForPrimary;
  if (primaryUnit && parseFloat(primaryUnit) > 1) {
    const unitQuantity = parseFloat(primaryUnit);
    const unitInfo = unitList.find(u => u.unit === primaryUnit || u.unit === primaryUnitVal);
    const operator = unitInfo?.operator || "multiply";

    if (operator === "multiply") {
      unitPrice = originalPriceForPrimary * unitQuantity;
    } else {
      unitPrice = originalPriceForPrimary / unitQuantity;
    }
  }

  let unitPrice2 = originalPriceForSecondary;
  if (secondaryUnit && parseFloat(secondaryUnit) > 1) {
    const unitQuantity = parseFloat(secondaryUnit);
    const unitInfo = unitList.find(u => u.unit === secondaryUnit);
    const operator = unitInfo?.operator || "multiply";

    if (operator === "multiply") {
      unitPrice2 = originalPriceForSecondary * unitQuantity;
    } else {
      unitPrice2 = originalPriceForSecondary / unitQuantity;
    }
  }

  // Set all field values
  setFieldValue(`items.${index}.productId`, product.id);
  setFieldValue(`items.${index}.productName`, product.elementNumber);
  setFieldValue(`items.${index}.unitList`, unitList);

  // Set primary unit
  setFieldValue(`items.${index}.unit`, primaryUnit || "1");
  setFieldValue(`items.${index}.unitName`, primaryUnitVal || "");

  // Set prices for the selected transaction type
  // For SALES: unitPrice = selling price, unitPrice2 = purchase price
  // For PURCHASE: unitPrice = purchase price, unitPrice2 = selling price
  setFieldValue(`items.${index}.unitPrice`, unitPrice);
  setFieldValue(`items.${index}.originalUnitPrice`, originalPriceForPrimary);
  setFieldValue(`items.${index}.unitPrice2`, unitPrice2);
  setFieldValue(`items.${index}.originalUnitPrice2`, originalPriceForSecondary);

  // Set stock quantity
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

  // Calculate initial total
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
