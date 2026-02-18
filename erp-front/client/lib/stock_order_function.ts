import { commonApi } from "./api";
import CryptoJS from "crypto-js";

export const changeProductData = async (pro) => {
  if (Array.isArray(pro)) {
    pro.forEach(async (item: any) => {
      if (!item || !item.id) return;
      try {
        commonApi.update(
          item.id,
          {
            updatedAt: new Date().toISOString(),
            stockQuantity: item.stockQuantity,
            oldQuantity: item.stockQuantity,
            main: item.main,

            updatedBy: JSON.stringify(
              JSON.parse(
                CryptoJS.AES.decrypt(
                  localStorage.getItem("user"),
                  import.meta.env.VITE_SECRET,
                ).toString(CryptoJS.enc.Utf8),
              )?.user,
            ),
          },
          "inventory_products",
        );
      } catch (err) {
        console.error("Failed to update product stock", err);
      }
    });
  }
};



export const minusOrAddDeleteProductData = async (isAdd, array, mainData) => {
  try {
    const main = JSON.parse(mainData.main || "{}");
    const items = main?.items || [];

    for (const item of items) {
      const itemProductId = String(item.productId);
      const qty = Number(item.quantity || 0);
      const warehouse = item?.warehouses;

      for (const product of array) {
        if (String(product.id) !== itemProductId) continue;

        // Parse once, mutate, then re-stringify
        const productMain = JSON.parse(product.main || "{}");
        if (!productMain.warehouses) productMain.warehouses = [];

        // Update total stock for non-Transfer
        if (main?.type !== "Transfer") {
          product.stockQuantity = isAdd
            ? product.stockQuantity + qty
            : product.stockQuantity - qty;
        }

        const targetWarehouses =
          main?.type === "Transfer"
            ? [main?.warehousesFrom, main?.warehousesTo]
            : [warehouse || "main"];

        for (const warehouseName of targetWarehouses) {
          if (!warehouseName) continue;
          const key = warehouseName.toString().toLowerCase();

          const idx = productMain.warehouses.findIndex(
            (w) => w.warehouseName.toLowerCase() === key,
          );

          if (idx !== -1) {
            if (main?.type === "Transfer") {
              if (key === main?.warehousesFrom?.toLowerCase()) {
                productMain.warehouses[idx].quantity -= qty;
              } else if (key === main?.warehousesTo?.toLowerCase()) {
                productMain.warehouses[idx].quantity += qty;
              }
            } else {
              productMain.warehouses[idx].quantity = isAdd
                ? productMain.warehouses[idx].quantity + qty
                : productMain.warehouses[idx].quantity - qty;
            }
          } else {
            const initialQty =
              main?.type === "Transfer"
                ? key === main?.warehousesTo?.toLowerCase()
                  ? qty
                  : -qty
                : isAdd
                  ? qty
                  : -qty;

            productMain.warehouses.push({
              warehouseName,
              warehouseId: Math.floor(Math.random() * 1_000_000),
              quantity: initialQty,
            });
          }
        }

        // Persist changes back to product
        product.main = JSON.stringify(productMain);
      }
    }

    return array;
  } catch (error) {
    console.error("Error in minusOrAddDeleteProductData:", error);
    throw error;
  }
};

// export var minusOrAddDeleteProductData = async (isAdd, array, mainData) => {
//   try {
//     const main = JSON.parse(mainData.main);
//     const items = main?.items || [];

//     // Use for...of instead of forEach to handle async properly
//     for (const item of items) {
//       const itemProductId = String(item.productId);
//       const qty = Number(item.quantity || 0);
//       const warehouse = item?.warehouses;

//       // Use for...of here too
//       for (const product of array) {
//         if (String(product.id) === itemProductId) {
//           if (main?.type !== "Transfer") {
//             product.stockQuantity = isAdd
//               ? product.stockQuantity + qty
//               : product.stockQuantity - qty;
//           }

//           const targetWarehouses =
//             main?.type === "Transfer"
//               ? [main?.warehousesFrom, main?.warehousesTo]
//               : [warehouse || "main"];

//           for (const warehouseName of targetWarehouses) {
//             // Initialize warehouses array if it doesn't exist
//             if (!JSON.parse(product.main).warehouses) {
//               JSON.parse(product.main).warehouses = [];
//             }
//             const warehouseIndex = JSON.parse(
//               product.main,
//             ).warehouses.findIndex(
//               (w) =>
//                 w.warehouseName.toLowerCase().toString() ===
//                 warehouseName.toLowerCase().toString(),
//             );
//             console.error("warehouseIndex", warehouseIndex);
//             if (warehouseIndex !== -1) {
//               // Update existing warehouse
//               if (main?.type === "Transfer") {
//                 if (warehouseName === main?.warehousesFrom) {
//                   JSON.parse(product.main).warehouses[
//                     warehouseIndex
//                   ].quantity -= qty;
//                 } else if (warehouseName === main?.warehousesTo) {
//                   JSON.parse(product.main).warehouses[
//                     warehouseIndex
//                   ].quantity += qty;
//                 }
//               } else {
//                 JSON.parse(product.main).warehouses[warehouseIndex].quantity =
//                   isAdd
//                     ? JSON.parse(product.main).warehouses[warehouseIndex]
//                         .quantity + qty
//                     : JSON.parse(product.main).warehouses[warehouseIndex]
//                         .quantity - qty;
//               }

//               console.error(
//                 "productproduct",
//                 JSON.parse(product.main).warehouses,
//               );
//             } else {
//               // Add new warehouse
//               const initialQty =
//                 main?.type === "Transfer"
//                   ? warehouseName === main?.warehousesTo
//                     ? qty
//                     : -qty
//                   : isAdd
//                     ? qty
//                     : -qty;

//               JSON.parse(product.main).warehouses.push({
//                 warehouseName: warehouseName,
//                 warehouseId: Math.floor(Math.random() * 1000000),
//                 quantity: initialQty,
//               });
//             }
//           }
//         }
//       }
//     }

//     return array;
//   } catch (error) {
//     console.error("Error in minusOrAddDeleteProductData:", error);
//     throw error;
//   }
// };

// export var minusOrAddDeleteProductData = async (isAdd, array, mainData) => {
//   try {
//     const main = JSON.parse(mainData.main);
//     const items = main?.items || [];

//     items.forEach(async (item) => {
//       const itemProductId = String(item.productId);
//       const qty = Number(item.quantity || 0);
//       const warehouse = item?.warehouses;

//       array.forEach(async (product) => {
//         if (String(product.id) === itemProductId) {
//           if (main?.type !== "Transfer") {
//             product.stockQuantity = isAdd
//               ? (product.stockQuantity += qty)
//               : (product.stockQuantity -= qty);
//           }

//           const targetWarehouses =
//             main?.type === "Transfer"
//               ? [main?.warehousesFrom, main?.warehousesTo]
//               : [warehouse || "main"];

//           targetWarehouses.forEach((warehouseName) => {
//             const warehouseIndex = product?.warehouses?.findIndex(
//               (w) => w.warehouseName === warehouseName,
//             );

//             if (warehouseIndex !== -1) {
//               if (main?.type === "Transfer") {
//                 if (warehouseName === main?.warehousesFrom) {
//                   product.warehouses[warehouseIndex].quantity -= qty;
//                 } else if (warehouseName === main?.warehousesTo) {
//                   product.warehouses[warehouseIndex].quantity += qty;
//                 }
//               } else {
//                 product.warehouses[warehouseIndex].quantity = isAdd
//                   ? product.warehouses[warehouseIndex].quantity + qty
//                   : product.warehouses[warehouseIndex].quantity - qty;
//               }
//             } else {
//               if (!product.warehouses) {
//                 product.warehouses = [];
//               }

//               const initialQty =
//                 main?.type === "Transfer"
//                   ? warehouseName === main?.warehousesTo
//                     ? qty
//                     : -qty
//                   : isAdd
//                     ? qty
//                     : -qty;

//               product.warehouses.push({
//                 warehouseName: warehouseName,
//                 warehouseId: Math.floor(Math.random() * 1000000),

//                 quantity: initialQty,
//               });
//             }
//           });
//         }
//       });
//     });

//     return array;
//   } catch (error) {
//   } finally {
//   }
// };

export const loadStockOrderData = async (
  setIsLoading,
  location,
  setMainData,
) => {
  try {
    setIsLoading(true);

    var result = await commonApi.getAll(
      1,
      100,
      [
        {
          field: "id",
          operator: "=",
          value: location.state?.viewFrom.id,
          type: "basic",
          andOr: "or",
        },
      ],
      {
        field: "id",
        direction: "desc",
        type: "basic",
        json_path: "$.elementNumber",
      },
      "inventory_stock_order",
    );
    //console.log("result", result[0]);

    setMainData(result.data[0]);

    // await loadProductData(result.data[0]);
  } catch (error) {
  } finally {
    setIsLoading(false);
  }
};

export var loadProductData = async (data) => {
  try {
    // setIsLoading(true);

    var filter = [];

    for (var i = 0; i < JSON.parse(data.main).items.length; i++) {
      var item = JSON.parse(data.main).items[i];
      filter.push({
        field: "id",
        operator: "=",
        value: item.productId,
        type: "basic",
        andOr: "or",
      });
    }

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
      "inventory_products",
    );

    return result.data;
    //  console.log("result inventory_products", result.data);
    //  console.log("result inventory_products11111 result.data ", result.data);

    // setProducts(result.data);
    // setOldProducts(result.data);
  } catch (error) {
  } finally {
    //  setIsLoading(false);
  }
};
