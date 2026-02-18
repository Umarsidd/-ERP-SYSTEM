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
) => {
  var unit = isPurchase
    ? JSON.parse(product.main)?.unitBuy
    : JSON.parse(product.main)?.unitSell;
  var unit2 = !isPurchase
    ? JSON.parse(product.main)?.unitBuy
    : JSON.parse(product.main)?.unitSell;

  var unitName = isPurchase
    ? JSON.parse(product.main)?.unitBuyVal
    : JSON.parse(product.main)?.unitSellVal;

  var originalUnitPrice = convertAmount(
    isPurchase
      ? parseFloat(JSON.parse(product.main)?.unitBuy ?? 1) > 1
        ? parseFloat(JSON.parse(product.main)?.purchasePrice) /
        parseFloat(JSON.parse(product.main)?.unitBuy ?? 1)
        : parseFloat(JSON.parse(product.main)?.purchasePrice)
      : parseFloat(JSON.parse(product.main)?.unitSell ?? 1) > 1
        ? parseFloat(product.totalAmount) /
        parseFloat(JSON.parse(product.main)?.unitSell ?? 1)
        : parseFloat(product.totalAmount),
    currency,
  );

  var originalUnitPrice2 = convertAmount(
    !isPurchase
      ? parseFloat(JSON.parse(product.main)?.unitBuy ?? 1) > 1
        ? parseFloat(JSON.parse(product.main)?.purchasePrice) /
        parseFloat(JSON.parse(product.main)?.unitBuy ?? 1)
        : parseFloat(JSON.parse(product.main)?.purchasePrice)
      : parseFloat(JSON.parse(product.main)?.unitSell ?? 1) > 1
        ? parseFloat(product.totalAmount) /
        parseFloat(JSON.parse(product.main)?.unitSell ?? 1)
        : parseFloat(product.totalAmount),
    currency,
  );

  setFieldValue(`items.${index}.originalUnitPrice`, originalUnitPrice);
  if (unit) {
    setFieldValue(`items.${index}.unit`, unit);
    setFieldValue(`items.${index}.unitName`, unitName);

    var price = unit * originalUnitPrice;
  } else {
    setFieldValue(`items.${index}.unit`, "1");

    var price = Number(originalUnitPrice);
  }
  setFieldValue(`items.${index}.unitList`, JSON.parse(product?.main)?.unitList);
  setFieldValue(`items.${index}.unitPrice`, price);
  setFieldValue(`items.${index}.productId`, product.id);
  setFieldValue(`items.${index}.productName`, product.elementNumber);
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

  setFieldValue(`items.${index}.unitPrice2`, (unit2 ?? 1) * originalUnitPrice2);
  setFieldValue(`items.${index}.originalUnitPrice2`, originalUnitPrice2);

  // setFieldValue(`items.${index}.description`, product.description);

  console.log("selected unit", unit);
  // Recalculate total
  const item = {
    productId: product.id,
    productName: product.elementNumber,
    oldQuantity: product.oldQuantity,
    stockQuantity: product.stockQuantity,
    //  description: product.description,
    quantity: 1,
    unitPrice: price,
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
