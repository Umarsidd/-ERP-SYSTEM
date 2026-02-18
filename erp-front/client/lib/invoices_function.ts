import Swal from "sweetalert2";
import { commonApi } from "./api";
import { calculateTotals, generateNumber } from "./products_function";
import { selectedCurrency, selectedSymbol } from "@/data/data";
import {
  addCustomerMeta,
  addStockOrder,
  updateBankAccounts,
  updateCustomerMeta,
} from "./api_function";
import { addOrEditAccountsEntry } from "./accounts_function";
import CryptoJS from "crypto-js";

export const handleSubmit = async (
  values,
  isDraftSubmission = false,
  isRTL,
  setIsSubmitting,
  setIsDraft,
  location,
  convertAmount,
  bankAccounts,
  bankAccountsMetaData,
  serverImages,
  navigate,
  tableName,
  pageName,
) => {
  setIsSubmitting(true);
  setIsDraft(isDraftSubmission);

  // Filter out empty rows (rows with no product selected or empty product id)
  if (values.items && Array.isArray(values.items)) {
    values.items = values.items.filter((item) => item.productId && item.productId.trim() !== "");
  }

  try {
    if (!values.customerId || !values.customer.name) {
      throw new Error(
        isRTL
          ? "يرجى اختيار العميل من القائمة"
          : "Please select a customer from the list",
      );
    } else if (
      values.items.length === 0 ||
      values.items.some((item) => item.quantity <= 0 || item.unitPrice <= 0)
    ) {
      throw new Error(
        isRTL
          ? "يرجى إضافة بنود صحيحة للفاتورة مع كمية وسعر صحيح"
          : "Please add valid Return items with quantity and unit price",
      );
    }

    var res = await commonApi.upload(values.attachments);
    console.log("attachments", res);
    if (res.result === false) {
      await Swal.fire({
        icon: "error",
        title: isRTL ? "خطأ" : "Error",
        text: isRTL
          ? "صيغة المرفق غير مدعومة او حجمة كبير جدا"
          : "Attachment format is not supported or its size is too large",
        confirmButtonText: isRTL ? "حسناً" : "OK",
      });
    } else {
      var submitData = {
        ...values,
        amount: calculateTotals(values),
        attachments: [],
      };

      submitData = {
        ...submitData,
        status: isDraftSubmission
          ? "Draft"
          : values.depositPaid
            ? "Paid"
            : location.state?.newData?.status == "Paid"
              ? "Paid"
              : location.state?.newData?.status == "PartiallyPaid"
                ? "PartiallyPaid"
                : "Unpaid",
      };

      if (location.state?.action == "edit") {
        if (
          location.state?.newData.status === "Draft" &&
          submitData.status !== "Paid"
        ) {
          submitData.paidAmount = Number(
            JSON.parse(location.state?.newData.main).depositAmount,
          );

          var convertedAmount = convertAmount(
            Number(submitData.paidAmount),
            localStorage.getItem("selectedCurrency") ?? selectedCurrency,
            (JSON.parse(submitData?.currency)?.code ||
              localStorage.getItem("selectedCurrency")) ??
            selectedCurrency,
          );

          updateBankAccounts(
            bankAccounts.id,
            tableName === "sales_invoices"
              ? Number(bankAccounts.totalAmount) + convertedAmount
              : Number(bankAccounts.totalAmount) - convertedAmount,
            convertedAmount,
            tableName,
            tableName === "sales_invoices" ? "Deposit" : "Withdraw",
            bankAccountsMetaData,
            submitData,
          );
        } else if (
          Number(JSON.parse(location.state?.newData.main).depositAmount) !==
          Number(submitData.depositAmount) &&
          submitData.status !== "Paid"
        ) {
          var newDepositAmount =
            Number(submitData.depositAmount) -
            Number(JSON.parse(location.state?.newData.main).depositAmount);

          submitData.paidAmount =
            Number(submitData.paidAmount) + Number(newDepositAmount);

          var convertedAmount = convertAmount(
            Number(newDepositAmount),
            localStorage.getItem("selectedCurrency") ?? selectedCurrency,
            (JSON.parse(submitData?.currency)?.code ||
              localStorage.getItem("selectedCurrency")) ??
            selectedCurrency,
          );

          updateBankAccounts(
            bankAccounts.id,
            tableName === "sales_invoices"
              ? Number(bankAccounts.totalAmount) + convertedAmount
              : Number(bankAccounts.totalAmount) - convertedAmount,
            convertedAmount,
            tableName,
            tableName === "sales_invoices" ? "Deposit" : "Withdraw",
            bankAccountsMetaData,
            submitData,
          );
        }

        if (
          (location.state?.newData.status == "Unpaid" ||
            location.state?.newData.status == "Draft") &&
          submitData.status == "Paid"
        ) {
          submitData.paidAmount = Number(submitData.amount?.total);
          var convertedAmount = convertAmount(
            Number(submitData.amount?.total),
            localStorage.getItem("selectedCurrency") ?? selectedCurrency,
            (JSON.parse(submitData?.currency)?.code ||
              localStorage.getItem("selectedCurrency")) ??
            selectedCurrency,
          );

          updateBankAccounts(
            bankAccounts.id,
            tableName === "sales_invoices"
              ? Number(bankAccounts.totalAmount) + convertedAmount
              : Number(bankAccounts.totalAmount) - convertedAmount,
            convertedAmount,
            tableName,
            tableName === "sales_invoices" ? "Deposit" : "Withdraw",
            bankAccountsMetaData,
            submitData,
          );
        } else if (
          (location.state?.newData.status == "PartiallyPaid" ||
            Number(location.state?.newData?.totalAmount) !==
            Number(submitData.amount?.total)) &&
          submitData.status == "Paid"
        ) {
          var convertedAmount = convertAmount(
            Number(submitData.amount?.total) - Number(submitData.paidAmount),
            localStorage.getItem("selectedCurrency") ?? selectedCurrency,
            (JSON.parse(submitData?.currency)?.code ||
              localStorage.getItem("selectedCurrency")) ??
            selectedCurrency,
          );

          updateBankAccounts(
            bankAccounts.id,
            tableName === "sales_invoices"
              ? Number(bankAccounts.totalAmount) + convertedAmount
              : Number(bankAccounts.totalAmount) - convertedAmount,
            convertedAmount,
            tableName,
            tableName === "sales_invoices"
              ? Number(submitData.amount?.total) > Number(submitData.paidAmount)
                ? "Deposit"
                : "Withdraw"
              : Number(submitData.amount?.total) > Number(submitData.paidAmount)
                ? "Withdraw"
                : "Deposit",
            bankAccountsMetaData,
            submitData,
          );
          submitData.paidAmount = Number(submitData.amount?.total);
        }

        var res3 = await commonApi.update(
          location.state?.newData.id,
          {
            updatedAt: new Date().toISOString(),
            issueDate: submitData.issueDate,
            dueDate: submitData.dueDate,
            main: JSON.stringify(submitData),
            elementNumber: submitData.elementNumber,
            totalAmount: submitData.amount?.total,
            status: submitData.status,
            paymentMethod: submitData.paymentMethod,
            updatedBy: JSON.stringify(
              JSON.parse(
                CryptoJS.AES.decrypt(
                  localStorage.getItem("user"),
                  import.meta.env.VITE_SECRET,
                ).toString(CryptoJS.enc.Utf8),
              )?.user,
            ),
            attachments: JSON.stringify({
              images: [...res, ...serverImages],
            }),
          },
          tableName,
        );
        submitData.invoiceIDForDeleteMetaCustomer = location.state?.newData.id;

        var res4 = await addStockOrder(
          submitData,
          "edit",
          tableName === "sales_invoices" ? "Withdraw" : "Add",
          "stockPending",
          tableName,
          location.state?.newData.id,
          location.state?.newData.id,
        );

        if (location.state?.newData.status === "Draft") {
          addCustomerMeta(
            submitData,
            submitData.amount?.total,
            tableName,
            location.state?.newData.id,
            submitData.customerId,
          );
        } else {
          updateCustomerMeta(
            submitData,
            submitData.amount?.total,
            tableName,
            submitData.customerId,
          );
        }
      } else {
        if (values.depositPaid && !isDraftSubmission) {
          submitData.paidAmount = Number(submitData.amount?.total);
        } else if (!isDraftSubmission) {
          submitData.paidAmount = submitData.depositAmount;
        }

        var res2 = await commonApi.create(
          {
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            issueDate: submitData.issueDate,
            dueDate: submitData.dueDate,
            main: JSON.stringify(submitData),
            elementNumber: submitData.elementNumber,
            totalAmount: submitData.amount?.total,
            paymentMethod: submitData.paymentMethod,
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
            status: submitData.status,
            attachments: JSON.stringify({
              images: [...res, ...serverImages],
            }),
          },
          tableName,
        );

        submitData.invoiceIDForDeleteMetaCustomer = res2.data.id;

        if (!isDraftSubmission) {
          var res4 = await addStockOrder(
            submitData,
            "Add",
            tableName === "sales_invoices" ? "Withdraw" : "Add",
            "stockPending",
            tableName,
            res2.data.id,
            res2.data.id,
          );
        }

        if (location.state?.newData.convert == true) {
          commonApi.update(
            location.state?.newData.id,
            {
              status: "Completed",
            },
            tableName === "sales_invoices"
              ? "sales_quotations"
              : "purchase_orders",
          );
        }

        if (!isDraftSubmission) {
          //submitData.depositAmount

          var convertedAmount = convertAmount(
            values.depositPaid
              ? Number(submitData.amount?.total)
              : Number(submitData.depositAmount),
            localStorage.getItem("selectedCurrency") ?? selectedCurrency,
            (JSON.parse(submitData?.currency)?.code ||
              localStorage.getItem("selectedCurrency")) ??
            selectedCurrency,
          );

          updateBankAccounts(
            bankAccounts.id,
            tableName === "sales_invoices"
              ? Number(bankAccounts.totalAmount) + convertedAmount
              : Number(bankAccounts.totalAmount) - convertedAmount,
            convertedAmount,
            tableName,
            tableName === "sales_invoices" ? "Deposit" : "Withdraw",
            bankAccountsMetaData,
            submitData,
          );
        }
        if (!isDraftSubmission) {
          addCustomerMeta(
            submitData,
            submitData.amount?.total,
            tableName,
            res2.data.id,
            submitData.customerId,
          );
        }
      }
      if (!isDraftSubmission) {
        tableName === "sales_invoices"
          ? addOrEditAccountsEntry(
            location,
            submitData,
            location.state?.action === "edit"
              ? location.state?.newData.id
              : res2.data.id,
            tableName,
            submitData.customer.name,
            tableName,
          )
          : addOrEditAccountsEntry(
            location,
            submitData,
            location.state?.action == "edit"
              ? location.state?.newData.id
              : res2.data.id,
            tableName,
            tableName,
            submitData.customer.name,
          );
      }
      // Show success message
      await Swal.fire({
        icon: "success",
        title: isDraftSubmission
          ? isRTL
            ? "تم حفظ المسودة بنجاح"
            : "Draft Saved Successfully"
          : isRTL
            ? "تم إنشاء الفاتورة بنجاح"
            : "Invoice Created Successfully",
        text: isDraftSubmission
          ? isRTL
            ? "تم حفظ الفاتورة كمسودة"
            : "Invoice has been saved as draft"
          : isRTL
            ? "تم إنشاء الفاتورة وإرسالها"
            : "Invoice has been created and sent",
        timer: 2000,
        showConfirmButton: false,
      });

      // Update product purchase prices if changed (For Purchase Invoices)
      if (pageName === "purchase" && !isDraftSubmission) {
        try {
          // Process updates concurrently
          await Promise.all(
            values.items.map(async (item) => {
              if (!item.productId) return;

              const invoiceUnit = Number(item.unit) || 1;
              const currentBasePriceInInvoice = Number(item.unitPrice) / invoiceUnit;
              const originalBasePriceInInvoice = Number(item.originalUnitPrice);

              // Check if price changed (with small tolerance for float errors)
              if (originalBasePriceInInvoice > 0 && Math.abs(currentBasePriceInInvoice - originalBasePriceInInvoice) > 0.001) {
                try {
                  // Fetch product current data
                  const result = await commonApi.getAll(
                    1,
                    1,
                    [{ field: "id", operator: "=", value: item.productId }],
                    { field: "id", direction: "asc", type: "basic" },
                    "products"
                  );

                  if (result.data && result.data.length > 0) {
                    const product = result.data[0];
                    if (product.main) {
                      const mainData = JSON.parse(product.main);
                      const oldProductPrice = Number(mainData.purchasePrice) || 0;

                      // Calculate new product price using ratio to handle currency conversion implicitly
                      const ratio = currentBasePriceInInvoice / originalBasePriceInInvoice;
                      const newProductPrice = oldProductPrice * ratio;

                      mainData.purchasePrice = newProductPrice;

                      // Update product
                      await commonApi.update(
                        product.id,
                        {
                          updatedAt: new Date().toISOString(),
                          main: JSON.stringify(mainData),
                        },
                        "products"
                      );
                    }
                  }
                } catch (err) {
                  console.error(`Failed to update price for product ${item.productId}`, err);
                  // Continue with other items even if one fails
                }
              }
            })
          );
        } catch (error) {
          console.error("Error updating product prices:", error);
        }
      }

      navigate(`/${pageName}/invoices`);
    }
  } catch (error: any) {
    console.error("Error:", error);
    await Swal.fire({
      icon: "error",
      title: isRTL ? "خطأ" : "Error",
      text:
        error.message ||
        (isRTL ? "حدث خطأ غير متوقع" : "An unexpected error occurred"),
      confirmButtonText: isRTL ? "حسناً" : "OK",
    });
  } finally {
    setIsSubmitting(false);
    setIsDraft(false);
  }
};

export const invoicesInitialValues = {
  elementNumber: generateNumber("INV"),
  customerId: "",
  customer: {
    id: "",
    name: "",
    nameAr: "",
    email: "",
    phone: "",
    address: "",
    addressAr: "",
    taxNumber: "",
  },
  salesRepId: "",
  salesRep: {
    id: "",
    name: "",
    nameAr: "",
    email: "",
    commission: 0,
  },
  paymentTermId: "1", // Default to Net 30
  transactionId: "",
  paymentTerm: null,
  issueDate: new Date().toISOString().split("T")[0],
  dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0],
  items: [
    {
      productId: "",
      productName: "",
      description: "",
      quantity: 1,
      stockQuantity: 0,
      oldQuantity: 0,
      unitPrice: 0,
      discount: 0,
      discountType: "percentage",
      taxRate: 0,
      total: 0,
      unitList: [],
      unit: "",
      originalUnitPrice: 0,
      unitName: "",
      warehouses: "main",
      unitPrice2: 0,
      originalUnitPrice2: 0,
    },
  ],
  notes: "",
  discountType: "percentage",
  discountValue: 0,
  shippingCost: 0,
  shippingAddress: "",
  shippingAddressAr: "",
  shippingMethod: "Standard Delivery",
  depositAmount: 0,
  remainAmount: 0,
  raisedAmount: 0,
  paidAmount: 0,
  numberOfPayments: 0,
  returnAmount: 0,
  returnOnlyAmount: 0,
  returnForOnlyOneReturnAmountPaid: 0,

  depositPaid: false,
  attachments: [],
  amount: null,
  stockStatus: "stockPending",
  status: "Draft",
  paymentMethod: "Cash",
  fields: [],
  currency: JSON.stringify({
    code: localStorage.getItem("selectedCurrency") ?? selectedCurrency,
    symbol: localStorage.getItem("selectedCurrencySymbol") ?? selectedSymbol,
  }),
  invoiceIDForDeleteMetaCustomer: "",
  isWareHouse: false,
  priceListId: "",
  priceListName: "Default",
  revenueAccountId: "",
  costCenterId: "",
};
