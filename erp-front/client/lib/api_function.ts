import { selectedCurrency } from "@/data/data";
import { commonApi } from "./api";
import { mainFilter } from "./function";
import { generateNumber } from "./products_function";
import { authApi } from "./authApi";
import CryptoJS from "crypto-js";
import { format } from "date-fns";
import { loadProductData, minusOrAddDeleteProductData, changeProductData } from "./stock_order_function";
import { safeJSONParse } from "./safe_json_helper";


export async function addStockOrder(
  submitData,
  edit,
  type,
  status,
  name,
  id,
  invoiceID,
) {
  try {
    var res;

    if (localStorage.getItem("enableInventoryStockOrders") === "true") {
      if (edit === "edit") {
        res = await commonApi.updateOtherFields(
          "inventory_stock_order",
          "invoiceID",
          id,
          {
            updatedAt: new Date().toISOString(),
            updatedBy: JSON.stringify(
              JSON.parse(
                CryptoJS.AES.decrypt(
                  localStorage.getItem("user"),
                  import.meta.env.VITE_SECRET,
                ).toString(CryptoJS.enc.Utf8),
              )?.user,
            ),
            issueDate: submitData.issueDate,
            main: JSON.stringify({
              ...submitData,

              name: name,
              // customerId: submitData.customerId,
              // customer: submitData.customer,
              // issueDate: submitData.issueDate,
              // items: submitData.items,
              type: type,
              // notes: "",
              // attachments: [],
              // amount: submitData.amount,
              status: status,
            }),
            //  elementNumber: elementNumber,
            totalAmount: submitData.amount?.total,
            status: status,
          },
        );
        console.log("inventory_stock_order", res);
      } else {
        const elementNumber = generateNumber("ORD");

        res = await commonApi.create(
          {
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            invoiceID: invoiceID,
            updatedBy: JSON.stringify(
              JSON.parse(
                CryptoJS.AES.decrypt(
                  localStorage.getItem("user"),
                  import.meta.env.VITE_SECRET,
                ).toString(CryptoJS.enc.Utf8),
              )?.user,
            ),
            createdBy: JSON.stringify(
              JSON.parse(
                CryptoJS.AES.decrypt(
                  localStorage.getItem("user"),
                  import.meta.env.VITE_SECRET,
                ).toString(CryptoJS.enc.Utf8),
              )?.user,
            ),
            issueDate: submitData.issueDate,
            main: JSON.stringify({
              ...submitData,
              elementNumber: elementNumber,
              name: name,
              // customerId: submitData.customerId,
              // customer: submitData.customer,
              // issueDate: submitData.issueDate,
              // items: submitData.items,
              type: type,
              // notes: "",
              // attachments: [],
              // amount: submitData.amount,
              status: status,
            }),
            elementNumber: elementNumber,
            totalAmount: submitData.amount?.total,
            status: status,
          },
          "inventory_stock_order",
        );
      }
    } else {
      loadProductData({
        main: JSON.stringify({ ...submitData, type: type, name: name, }),
      }).then(async (productsData) => {
        var resProducts = await minusOrAddDeleteProductData(
          type === "Add",
          productsData,
          {
            main: JSON.stringify({ ...submitData, type: type, name: name }),
          },
        );

        console.log("products after delete:", resProducts);

        // Update product prices for purchase invoices
        // Price should ONLY be updated from purchase invoices, not from any other source
        if (name === "purchase_invoices") {
          resProducts.forEach((product) => {
            const invoiceItem = submitData.items.find(
              (item) => String(item.productId) === String(product.id)
            );

            if (invoiceItem && invoiceItem.unitPrice) {
              const main = JSON.parse(product.main || "{}");

              // Update Purchase Price
              // We must use the base unit price (price per piece) which is stored in originalUnitPrice2 for Purchase Invoices
              // If originalUnitPrice2 is missing, fallback to calculating it from unitPrice / unit
              let newPurchasePrice = invoiceItem.originalUnitPrice2;

              if (!newPurchasePrice) {
                const unitQuantity = parseFloat(invoiceItem.unit) || 1;
                newPurchasePrice = invoiceItem.unitPrice / unitQuantity;
              }

              main.purchasePrice = Number(newPurchasePrice);

              // Update Default Buy Unit and Unit Name if available
              if (invoiceItem.unitName) {
                // If the user selected a specific unit for this purchase, let's update it as the default buy unit ?
                // The prompt says: "Update product: main.purchasePrice, main.unitBuy, main.unitBuyVal"
                // invoiceItem.unitName stores the name (e.g. "Box")
                // invoiceItem.unit stores the quantity/factor (e.g. 12) OR the ID. 
                // In handleProductSelect we set unitName = defaultUnitName, unit = unitQuantity.
                // We need to map back to the Unit ID if possible, or just store the values.
                // "main.unitBuy" usually stores the ID or Factor. "main.unitBuyVal" stores the Name.

                main.unitBuy = invoiceItem.unit; // This is likely the factor now (e.g. 12)
                main.unitBuyVal = invoiceItem.unitName;
              }

              // Only update selling price if explicitly provided/changed?
              // The prompt says: "If necessary, also update selling price (if provided)"
              // In Purchase Invoice, originalUnitPrice stores the Selling Price (per piece).
              // If the user edited it, we should update it.
              if (invoiceItem.originalUnitPrice) {
                main.salePrice = Number(invoiceItem.originalUnitPrice);
                // Some products use totalAmount as selling price
                product.totalAmount = Number(invoiceItem.originalUnitPrice);
              }

              product.main = JSON.stringify(main);
            }
          });
        }

        changeProductData(resProducts);
      });
    }
    // console.log("inventory_stock_order", res);
    // return res;
  } catch (error) {
  } finally {
  }
}

export async function addPayment(
  submitData,
  location,
  edit,
  tableName,
  type,
  status,
  amount,
) {
  try {
    const rews = await commonApi.create(
      {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        issueDate: submitData.issueDate,
        createdBy: JSON.stringify(
          JSON.parse(
            CryptoJS.AES.decrypt(
              localStorage.getItem("user"),
              import.meta.env.VITE_SECRET,
            ).toString(CryptoJS.enc.Utf8),
          )?.user,
        ),
        updatedBy: JSON.stringify(
          JSON.parse(
            CryptoJS.AES.decrypt(
              localStorage.getItem("user"),
              import.meta.env.VITE_SECRET,
            ).toString(CryptoJS.enc.Utf8),
          )?.user,
        ),
        invoiceID:
          edit == "edit"
            ? location.state?.newData.invoiceID
            : location.state?.newData.id,
        invoice:
          edit == "edit"
            ? location.state?.newData.invoice
            : location.state?.newData.main,

        main: JSON.stringify({
          currency: submitData?.currency,
          customerId: submitData.customer?.id,
          customer: submitData.customer,
          attachments: [],
          status: status,
          type: type,
          returnId: edit == "edit" ? submitData.returnId : edit,
          amount: amount,
          paymentMethod: submitData.paymentMethod,
          issueDate: new Date().toISOString().split("T")[0],
          transactionId: submitData.transactionId,
          notes: "",
        }),
        elementNumber: submitData.transactionId,
        totalAmount: amount,
        status: status,
      },
      tableName,
    );

    // support both axios-like (rews.data) and fetch-wrapper (rews)
    // const data = rews && rews.data !== undefined ? rews.data : rews;

    // console.log("addPayment response:", data);
    // return data;

    console.log("rewsssss", rews);
    return rews;
  } catch (error) {
  } finally {
  }
}

export const loadGuide = async (addQuery, setIsLoading, setGuide) => {
  try {
    setIsLoading(true);

    var x = {
      search: addQuery,
      status: "all",
      category: "all",
      paymentMethod: "all",
      salesPerson: "all",
      dateFrom: "",
      dateTo: "",
      amountFrom: "",
      amountTo: "",
      dueDateFrom: "",
      dueDateTo: "",
    };
    var filter = await mainFilter(x);

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
      "accounts_guide",
    );
    // console.log("result", result);
    setGuide(JSON.parse(result.data[0].meta).subTree);
  } catch (error) {
  } finally {
    setIsLoading(false);
  }
};

export const loadCostCenters = async (
  addQuery,
  setIsLoading,
  setCostCenters,
) => {
  try {
    setIsLoading(true);

    var x = {
      search: addQuery,
      status: "all",
      category: "all",
      paymentMethod: "all",
      salesPerson: "all",
      dateFrom: "",
      dateTo: "",
      amountFrom: "",
      amountTo: "",
      dueDateFrom: "",
      dueDateTo: "",
    };
    var filter = await mainFilter(x);

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
      "cost_centers",
    );
    // console.log("result", result);
    setCostCenters(JSON.parse(result.data[0].meta).subTree);
  } catch (error) {
  } finally {
    setIsLoading(false);
  }
};

export const loadProducts = async (addQuery, setIsLoading, setProducts) => {
  try {
    setIsLoading(true);

    var x = {
      search: addQuery,
      status: "all",
      category: "all",
      paymentMethod: "all",
      salesPerson: "all",
      dateFrom: "",
      dateTo: "",
      amountFrom: "",
      amountTo: "",
      dueDateFrom: "",
      dueDateTo: "",
    };
    var filter = await mainFilter(x);
    if (
      (JSON.parse(localStorage.getItem("subRole") || "null") as any)
        ?.Inventory?.viewHisProducts === true
    ) {
      filter.push({
        field: "createdBy",
        operator: "=",
        value: JSON.parse(
          CryptoJS.AES.decrypt(
            localStorage.getItem("user"),
            import.meta.env.VITE_SECRET,
          ).toString(CryptoJS.enc.Utf8),
        )?.user?.id,
        type: "json",
        andOr: "and",
        json_path: "$.id",
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
    // console.log("result", result);
    setProducts(result.data);
  } catch (error) {
  } finally {
    setIsLoading(false);
  }
};

export const loadCustomers = async (
  addQuery,
  setIsLoading,
  setCustomers,
  role = "customer",
  condition = "",
  section = "",
) => {
  try {
    setIsLoading(true);

    var x = {
      search: addQuery,
      status: "all",
      category: "all",
      paymentMethod: "all",
      salesPerson: "all",
      dateFrom: "",
      dateTo: "",
      amountFrom: "",
      amountTo: "",
      dueDateFrom: "",
      dueDateTo: "",
    };
    var filter = await mainFilter(x);

    if (
      role == "customer" &&
      (JSON.parse(localStorage.getItem("subRole") || "null") as any)?.[
      section
      ]?.[condition] === true
    ) {
      filter.push({
        field: "createdBy",
        operator: "=",
        value: JSON.parse(
          CryptoJS.AES.decrypt(
            localStorage.getItem("user"),
            import.meta.env.VITE_SECRET,
          ).toString(CryptoJS.enc.Utf8),
        )?.user?.id,
        type: "json",
        andOr: "and",
        json_path: "$.id",
      });
    }

    var result = await authApi.getAll(
      1,
      20,
      filter,
      {
        field: "id",
        direction: "desc",
        type: "basic",
        json_path: "$.elementNumber",
      },
      "users",
      role,
    );
    setCustomers(result.data);
  } catch (error) {
  } finally {
    setIsLoading(false);
  }
};

export const loadInstallments = async (
  id,
  setIsLoading,
  setInstallments,
  currentPage,
  itemsPerPage,
) => {
  try {
    setIsLoading(true);

    var result = await commonApi.getAll(
      currentPage,
      itemsPerPage,
      [
        {
          // useFor: "search",
          field: "invoiceID",
          operator: "=",
          value: id,
          type: "basic",
          andOr: "and",
        },
      ],
      {
        field: "id",
        direction: "desc",
        type: "basic",
        json_path: "$.elementNumber",
      },
      "installments",
    );
    //  console.log("result", result.data[0]);
    // console.log("mmmm", JSON.parse(location?.state?.newData?.main));

    if (result.data && result.data.length > 0) {
      setInstallments(result.data[0]);
    }
  } catch (error) {
  } finally {
    setIsLoading(false);
  }
};

export const loadInvoices = async (
  id,
  currentPage,
  itemsPerPage,
  setIsLoading,
  setInvoice,
  setInvoiceMain,
  tableName,
) => {
  try {
    setIsLoading(true);

    var result = await commonApi.getAll(
      currentPage,
      itemsPerPage,
      [
        {
          // useFor: "search",
          field: "id",
          operator: "=",
          value: id,
          type: "basic",
          andOr: "and",
        },
      ],
      {
        field: "id",
        direction: "desc",
        type: "basic",
        json_path: "$.elementNumber",
      },
      tableName,
    );

    //  console.log("mmmm", JSON.parse(location?.state?.newData?.main));

    if (result.data && result.data.length > 0) {
      setInvoice(result.data[0]);
      setInvoiceMain(JSON.parse(result.data[0].main) ?? []);
      console.log("result sales_invoicess invoiceMain", result.data[0]);

      return result.data[0];
    }
  } catch (error) {
  } finally {
    setIsLoading(false);
  }
};

export function updateBankAccounts(
  id,
  totalAmount,
  amount,
  opration,
  amountType,
  bankAccountsMetaData,
  submitData,
) {
  commonApi.update(
    id,
    {
      updatedAt: new Date().toISOString(),
      totalAmount: totalAmount,
      // meta: JSON.stringify({  make problem err
      //   data: [
      //     ...bankAccountsMetaData,
      //     {
      //       createdAt: new Date().toISOString(),
      //       bankId: id,
      //       opration: opration,
      //       amountType: amountType,
      //       referenceDate: submitData.issueDate,
      //       customer: submitData.customer,
      //       currency: submitData?.currency,

      //       financeElementNumber: submitData.elementNumber,
      //       deposit: amountType === "Deposit" ? amount : 0,
      //       withdraw: amountType === "Withdraw" ? amount : 0,
      //       totalAmount: totalAmount,
      //       createdBy: JSON.stringify(
      //         JSON.parse(CryptoJS.AES.decrypt(localStorage.getItem("user"),import.meta.env.VITE_SECRET).toString(CryptoJS.enc.Utf8))?.user,
      //       ),
      //     },
      //   ],
      // }),
    },
    "bank_accounts",
  );
}

export async function loadBankAccounts(
  setBankAccounts,
  setBankAccountsMetaData,
  setIsLoading,
) {
  try {
    ///  setIsLoading(true);
    var result = await commonApi.getAll(
      1,
      100,
      [
        //   {
        //     field: "invoiceID",
        //     operator: "=",
        //     value: location.state?.newData?.invoiceID,
        //     type: "basic",
        //     andOr: "and",
        //   },
      ],
      {
        field: "id",
        direction: "desc",
        type: "basic",
        json_path: "$.elementNumber",
      },
      "bank_accounts",
    );

    // Check if result.data exists and has items
    if (!result?.data || result.data.length === 0) {
      console.warn("No bank accounts found");
      return;
    }

    var userId = JSON.parse(
      CryptoJS.AES.decrypt(
        localStorage.getItem("user"),
        import.meta.env.VITE_SECRET,
      ).toString(CryptoJS.enc.Utf8),
    )?.user?.id;

    const userIdStr = userId == null ? null : String(userId);

    var y = (result?.data ?? []).filter((c) => {
      const main = safeJSONParse(c.main, {}) as any;
      const users = Array.isArray(main.usersIDS) ? main.usersIDS : [];
      return (
        userIdStr !== null && users.some((u) => u && String(u.id) === userIdStr) // compare by id
      );
    });

    //var y = [];
    // var y = result.data.filter((c) => JSON.parse(c.main)?.usersIDS?.includes(userId));
    console.log("bankAccounts userId", userId);
    console.log(
      "bankAccounts JSON.parse(c.main)?.usersIDS",
      (safeJSONParse(result.data[0]?.main, {}) as any)?.usersIDS,
    );
    console.log("bankAccounts y0000", y);

    if (y.length >= 1) {
      var k = y.filter((c) => c.status === "Main");
      if (k.length >= 1) y = k;
      console.log("bankAccounts y1111", y);

    } else {
      y = result.data.filter((c) => c.status === "Main");
      if (y.length === 0 && result.data.length > 0) y = [result.data[0]];
      console.log("bankAccounts y22222", y);


    }

    // Check if y has items before accessing
    if (y.length > 0 && y[0]) {
      setBankAccounts(y[0]);
      const metaData = safeJSONParse(y[0].meta, { data: [] });
      setBankAccountsMetaData(metaData?.data ?? []);
    } else {
      console.warn("No valid bank account found");
    }

  } catch (error) {
    console.log("error", error);
  } finally {
    // setIsLoading(false);
  }
}

export async function updateCustomerMeta(
  submitData,
  totalAmount,
  name,
  customerID,
) {
  try {
    // Get all user statements for this customer
    var result = await commonApi.getAll(
      1,
      1000,
      [
        {
          field: "main",
          operator: "=",
          value: customerID,
          type: "json",
          andOr: "and",
          json_path: "$.customerId",
        },
      ],
      {
        field: "id",
        direction: "desc",
        type: "basic",
      },
      "user_statement",
    );

    const statements = result.data || [];

    if (name === "invoicedelete") {
      // Soft delete statements by invoiceIDForDeleteMetaCustomer
      const toDelete = statements.filter((e) => {
        const main = JSON.parse(e.main);
        return (
          Number(main.invoiceIDForDeleteMetaCustomer) ===
          Number(submitData.invoiceIDForDeleteMetaCustomer)
        );
      });

      for (const statement of toDelete) {
        await commonApi.update(
          statement.id,
          {
            updatedAt: new Date().toISOString(),
            deleted_at: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
          },
          "user_statement",
        );
      }
    } else if (name === "delete") {
      // Soft delete statements by elementNumber
      const toDelete = statements.filter((e) => {
        const main = JSON.parse(e.main);
        return main.elementNumber === submitData.elementNumber;
      });

      for (const statement of toDelete) {
        await commonApi.update(
          statement.id,
          {
            updatedAt: new Date().toISOString(),
            deleted_at: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
          },
          "user_statement",
        );
      }
    } else {
      // Update existing statements
      const toUpdate = statements.filter((e) => {
        const main = JSON.parse(e.main);
        return main.elementNumber === submitData.elementNumber;
      });

      for (const statement of toUpdate) {
        const mainData = JSON.parse(statement.main);
        const updatedMain = {
          ...mainData,
          totalAmount: totalAmount,
          paidAmount: submitData?.paidAmount ?? 0,
          returnAmount: submitData?.returnAmount ?? 0,
          returnOnlyAmount: submitData?.returnOnlyAmount ?? 0,
          currency: submitData?.currency,
        };

        await commonApi.update(
          statement.id,
          {
            updatedAt: new Date().toISOString(),
            main: JSON.stringify(updatedMain),
          },
          "user_statement",
        );
      }
    }
  } catch (error) {
    console.error("Error updating user statement:", error);
    throw error;
  }
}

export async function addCustomerMeta(
  submitData,
  totalAmount,
  name,
  invoiceID,
  customerID,
) {
  try {
    // Create statement data object
    const statementData = {
      id: new Date().getTime(),
      createdAt: new Date().toISOString(),
      customerId: customerID,
      invoiceID: invoiceID,
      name: name,
      currency: submitData?.currency,
      invoiceIDForDeleteMetaCustomer: Number(
        submitData?.invoiceIDForDeleteMetaCustomer,
      ),
      totalAmount: totalAmount,
      elementNumber: submitData.elementNumber,
      paidAmount: submitData?.paidAmount ?? 0,
      returnAmount: submitData?.returnAmount ?? 0,
      returnOnlyAmount: submitData?.returnOnlyAmount ?? 0,
      createdBy: JSON.stringify(
        JSON.parse(
          CryptoJS.AES.decrypt(
            localStorage.getItem("user"),
            import.meta.env.VITE_SECRET,
          ).toString(CryptoJS.enc.Utf8),
        )?.user,
      ),
    };

    // Create a new record in user_statement table
    // Following the same pattern as CreateQuote.tsx
    await commonApi.create(
      {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        main: JSON.stringify(statementData),
        elementNumber: submitData.elementNumber,
        createdBy: JSON.stringify(
          JSON.parse(
            CryptoJS.AES.decrypt(
              localStorage.getItem("user"),
              import.meta.env.VITE_SECRET,
            ).toString(CryptoJS.enc.Utf8),
          )?.user,
        ),
        updatedBy: JSON.stringify(
          JSON.parse(
            CryptoJS.AES.decrypt(
              localStorage.getItem("user"),
              import.meta.env.VITE_SECRET,
            ).toString(CryptoJS.enc.Utf8),
          )?.user,
        ),
      },
      "user_statement",
    );
  } catch (error) {
    console.error("Error adding user statement:", error);
    throw error;
  }
}

export async function getCustomerTransactions(customerID) {
  try {
    // Get all user statements for this customer from the new table
    var result = await commonApi.getAll(
      1,
      1000,
      [
        {
          field: "main",
          operator: "=",
          value: customerID,
          type: "json",
          andOr: "and",
          json_path: "$.customerId",
        },
      ],
      {
        field: "id",
        direction: "desc",
        type: "basic",
      },
      "user_statement",
    );

    // Parse main field and return data in the same format as before for backward compatibility
    const parsedData = (result.data || []).map((item) => {
      try {
        return JSON.parse(item.main);
      } catch (e) {
        console.error("Error parsing statement main field:", e);
        return null;
      }
    }).filter(item => item !== null);

    return {
      data: parsedData,
    };
  } catch (error) {
    console.error("Error getting user statements:", error);
    return { data: [] };
  }
}


export const loadUserData2 = async (
  user: any,
  setIsLoading,
  tableNameArray,
  location,
  convertAmount,
  setStatementData?: (data: any[]) => void,
) => {
  setIsLoading(true);

  // Fetch statement data from user_statement table
  if (setStatementData && user?.id) {
    try {
      const statementResult = await commonApi.getAll(
        1,
        1000,
        [
          {
            field: "main",
            operator: "=",
            value: user.id,
            type: "json",
            andOr: "and",
            json_path: "$.customerId",
          },
        ],
        {
          field: "createdAt",
          direction: "asc",
          type: "basic",
        },
        "user_statement",
      );

      // Parse the main field from each statement record
      const parsedStatements = (statementResult.data || []).map((item) => {
        return safeJSONParse(item.main, null);
      }).filter(item => item !== null);

      setStatementData(parsedStatements);
    } catch (error) {
      console.error("Error loading statement data:", error);
      setStatementData([]);
    }
  }

  for (var i = 0; i < 4; i++) {
    const tableInfo = tableNameArray[i];

    var result = await commonApi.getAll(
      1,
      2222,
      [
        {
          field: "main",
          operator: "=",
          value: user?.id ?? location.state?.viewFrom?.id,

          andOr: "and",
          type: "json",
          json_path: "$.customerId",
        },
      ],
      {
        field: "id",
        direction: "desc",
        type: "basic",
        json_path: "$.elementNumber",
      },
      tableInfo.name,
    );

    const data = Array.isArray(result.data)
      ? result.data
      : (result.data?.data ?? []);

    tableInfo.list(data);
    var invoicesData;
    if (
      tableInfo.name === "sales_invoices" ||
      tableInfo.name === "purchase_invoices"
    ) {
      invoicesData = data;
    }
    //  console.error("sales_payment");
    if (
      tableInfo.name === "sales_payment" ||
      tableInfo.name === "purchase_payment"
    ) {
      // const sum2 = (data || []).reduce((acc, item) => {
      //   const val = parseFloat(item?.totalAmount ?? 0) || 0;
      //   var val2 = convertAmount(
      //     val || 0,
      //     localStorage.getItem("selectedCurrency") ?? selectedCurrency,
      //     ((JSON.parse(item.main)?.currency &&
      //       JSON.parse(JSON.parse(item.main)?.currency)?.code) ||
      //       localStorage.getItem("selectedCurrency")) ??
      //       selectedCurrency,
      //   );
      //   return acc + val2;
      // }, 0);
      const sum2 = (data || []).reduce((acc, item) => {
        if (item?.invoiceID == null) {
          // true for null OR undefined
          const val = parseFloat(item?.totalAmount ?? 0) || 0;

          // safe parse of item.main?.currency and fallback
          let itemCurrency;
          try {
            const main = JSON.parse(item?.main || "{}");
            itemCurrency = main?.currency
              ? JSON.parse(main.currency)?.code
              : null;
          } catch (e) {
            itemCurrency = null;
          }
          const targetCurrency =
            localStorage.getItem("selectedCurrency") ?? selectedCurrency;
          const fromCurrency =
            itemCurrency ??
            localStorage.getItem("selectedCurrency") ??
            selectedCurrency;

          const val2 = convertAmount(val, targetCurrency, fromCurrency);
          return acc + val2;
        }
        return acc;
      }, 0);

      const sum = (invoicesData || []).reduce((acc, item) => {
        const val = parseFloat(JSON.parse(item.main)?.paidAmount) || 0;
        var val2 = convertAmount(
          val || 0,
          localStorage.getItem("selectedCurrency") ?? selectedCurrency,
          ((JSON.parse(item.main)?.currency &&
            JSON.parse(JSON.parse(item.main)?.currency)?.code) ||
            localStorage.getItem("selectedCurrency")) ??
          selectedCurrency,
        );

        return acc + val2;
      }, 0);

      //console.error(sum, sum2);
      // console.error("sales_payment");
      tableInfo.list2(sum + sum2);
    } else {
      const sum = (data || []).reduce((acc, item) => {
        const val = parseFloat(item?.totalAmount ?? 0) || 0;

        var val2 = convertAmount(
          val || 0,
          localStorage.getItem("selectedCurrency") ?? selectedCurrency,
          ((JSON.parse(item.main)?.currency &&
            JSON.parse(JSON.parse(item.main)?.currency)?.code) ||
            localStorage.getItem("selectedCurrency")) ??
          selectedCurrency,
        );

        return acc + val2;
      }, 0);

      tableInfo.list2(sum);
    }
  }

  setIsLoading(false);
};
export const loadUserData = async (
  setIsLoading2,
  setCustomer,
  location,
  setIsLoading,
  tableNameArray,
  convertAmount,
  setStatementData?: (data: any[]) => void,
) => {
  try {
    setIsLoading2(true);
    var result = await authApi.getOneUser(location.state?.viewFrom?.id);
    const user = result.data[0];
    setCustomer(user);

    await loadUserData2(
      user,
      setIsLoading,
      tableNameArray,
      location,
      convertAmount,
      setStatementData,
    );
    setIsLoading2(false);
  } catch (error) {
    // setIsLoading(false);
    console.error("Error loading customer data:", error);
  }
};

export async function loadBranches(setBranches) {
  try {
    //  setIsLoading(true);
    var result = await commonApi.getAll(
      1,
      100,
      [],
      {
        field: "id",
        direction: "desc",
        type: "basic",
        json_path: "$.elementNumber",
      },
      "branches",
    );

    setBranches(result.data);
    console.log("branches", result.data);
    if (result.data && result.data.length > 0 && result.data[0]?.main) {
      console.log((safeJSONParse(result.data[0].main, {}) as any).usersIDS);
    }
  } catch (error) {
    console.log("error", error);
  } finally {
    // setIsLoading(false);
  }
}


export const loadWarehouse = async (setMainData) => {
  try {
    var result = await commonApi.getAll(
      1,
      100,
      [],
      {
        field: "id",
        direction: "desc",
        type: "basic",
        json_path: "$.elementNumber",
      },
      "inventory_warehouse",
    );
    console.log("loadWarehouse", result);

    setMainData(result.data);
  } catch (error) {
  } finally {
  }
};

// export async function getUserDataById(customerID, tableName, setData, setIsLoading) {
//   setIsLoading(true);
//   var result = await commonApi.getAll(
//     1,
//     222,
//     [
//       {
//         field: "main",
//         operator: "=",
//         value: customerID,

//         andOr: "and",
//         type: "json",
//         json_path: "$.customerId",
//       },
//     ],
//     {
//       field: "id",
//       direction: "desc",
//       type: "basic",
//       json_path: "$.elementNumber",
//     },


export const loadCustomersForFilter = async (setCustomers, role = 'customer') => {
  try {
    var filter = [];
    var result = await authApi.getAll(1, 1000, filter, { field: 'id', direction: 'desc', type: 'basic', json_path: '$.elementNumber' }, 'users', role);
    setCustomers(result.data);
  } catch (error) {
    console.error('Error loading customers for filter:', error);
  }
};

export const loadEmployeesForFilter = async (setEmployees) => {
  try {
    var filter = [];
    var result = await authApi.getAll(1, 1000, filter, { field: 'id', direction: 'desc', type: 'basic', json_path: '$.elementNumber' }, 'users', 'editor');
    setEmployees(result.data);
  } catch (error) {
    console.error('Error loading employees for filter:', error);
  }
};
