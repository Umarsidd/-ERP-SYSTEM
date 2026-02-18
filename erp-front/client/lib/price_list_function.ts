import { commonApi } from "./api";
import { calculateItemTotal } from "./products_function";

/**
 * Load active price lists from the database
 */
export const loadPriceLists = async (setIsLoading, setPriceLists) => {
  try {
    setIsLoading(true);

    var filter = [];

    // Only load active price lists
    filter.push({
      field: "status",
      operator: "=",
      value: "Active",
      type: "basic",
      andOr: "and",
    });

    var result = await commonApi.getAll(
      1,
      100,
      filter,
      {
        field: "id",
        direction: "desc",
        type: "basic",
        json_path: "$.elementNumber",
      },
      "inventory_price_lists",
    );

    setPriceLists(result.data);
  } catch (error) {
    console.error("Error loading price lists:", error);
  } finally {
    setIsLoading(false);
  }
};

/**
 * Get price from a price list for a specific product
 * @param productId - The ID of the product
 * @param priceListItems - Array of items from the price list
 * @param isPurchase - Whether this is for purchase (true) or sales (false)
 * @returns The price from the price list, or null if not found
 */
export const getPriceFromPriceList = (productId, priceListItems, isPurchase = false) => {
  if (!priceListItems || priceListItems.length === 0) return null;

  const priceItem = priceListItems.find(item => item.productId === productId);
  if (!priceItem) return null;

  return isPurchase ? priceItem.purchasePrice : priceItem.salePrice;
};

/**
 * Update all item prices when price list changes
 * @param priceList - The selected price list object
 * @param values - Current form values
 * @param setFieldValue - Formik's setFieldValue function
 * @param isPurchase - Whether this is a purchase invoice
 * @param convertAmount - Currency conversion function
 * @param currency - Target currency code
 */
export const handlePriceListChange = (priceList, values, setFieldValue, isPurchase = false, convertAmount?, currency?) => {
  if (!priceList || !priceList.items) return;

  const priceListItems = JSON.parse(priceList.items || "{}").items || [];

  values.items.forEach((item, index) => {
    if (item.productId) {
      var priceListPrice = getPriceFromPriceList(
        item.productId,
        priceListItems,
        isPurchase
      );

      if (priceListPrice !== null) {
        // Convert currency if convertAmount is provided
        if (convertAmount && currency) {
          priceListPrice = convertAmount(priceListPrice, currency);
        }

        // Get current unit factor from the item
        var currentUnit = parseFloat(item.unit) || 1;

        // Calculate original unit price (per piece / base unit)
        var originalPrice = currentUnit > 1
          ? priceListPrice / currentUnit
          : priceListPrice;

        // Calculate unit price for selected unit
        var unitPrice = originalPrice * currentUnit;

        // Update prices
        setFieldValue(`items.${index}.unitPrice`, unitPrice);

        if (isPurchase) {
          setFieldValue(`items.${index}.originalUnitPrice2`, originalPrice);
        } else {
          setFieldValue(`items.${index}.originalUnitPrice`, originalPrice);
        }

        // Recalculate total using calculateItemTotal
        const updatedItem = {
          ...item,
          unitPrice: unitPrice,
        };
        setFieldValue(`items.${index}.total`, calculateItemTotal(updatedItem));
      }
    }
  });
};

/**
 * Handle product selection with Price List price override.
 * Mirrors handleProductSelect logic exactly from products_function.ts
 * Only difference: uses priceListPrice as the price source for the relevant side.
 */
export const handlePriceListProductSelect = (
  product,
  index: number,
  setFieldValue: any,
  isPurchase: boolean = true,
  convertAmount,
  currency,
  priceListPrice: number = 0,
  isStockAdjust: string | null = null,
  priceListId: string | null = null,
) => {
  // Mirror handleProductSelect: get unit factor
  var unit = isPurchase
    ? JSON.parse(product.main)?.unitBuy
    : JSON.parse(product.main)?.unitSell;
  var unit2 = !isPurchase
    ? JSON.parse(product.main)?.unitBuy
    : JSON.parse(product.main)?.unitSell;

  var unitName = isPurchase
    ? JSON.parse(product.main)?.unitBuyVal
    : JSON.parse(product.main)?.unitSellVal;

  // Price List adaptation:
  // For the ACTIVE side (isPurchase ? purchase : selling), use priceListPrice
  // For the OTHER side, use product's default price
  // Then apply convertAmount and unit factor division — same math as handleProductSelect

  var originalUnitPrice = convertAmount(
    isPurchase
      // Purchase side: use priceListPrice instead of product.main.purchasePrice
      ? parseFloat(unit ?? 1) > 1
        ? priceListPrice / parseFloat(unit ?? 1)
        : priceListPrice
      // Selling side: use priceListPrice instead of product.totalAmount
      : parseFloat(unit ?? 1) > 1
        ? priceListPrice / parseFloat(unit ?? 1)
        : priceListPrice,
    currency,
  );

  var originalUnitPrice2 = convertAmount(
    !isPurchase
      // Other side (purchase): use product default purchasePrice
      ? parseFloat(JSON.parse(product.main)?.unitBuy ?? 1) > 1
        ? parseFloat(JSON.parse(product.main)?.purchasePrice) /
        parseFloat(JSON.parse(product.main)?.unitBuy ?? 1)
        : parseFloat(JSON.parse(product.main)?.purchasePrice)
      // Other side (selling): use product default totalAmount
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

  console.log("selected unit", unit);
  // Recalculate total
  const item = {
    productId: product.id,
    productName: product.elementNumber,
    oldQuantity: product.oldQuantity,
    stockQuantity: product.stockQuantity,
    quantity: 1,
    unitPrice: price,
    discount: 0,
    discountType: "percentage" as const,
    taxRate: 0,
    total: 0,
  };
  setFieldValue(`items.${index}.total`, calculateItemTotal(item));
};
