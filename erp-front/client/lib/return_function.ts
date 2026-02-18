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
  invoiceMain,
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
        status: "Returned",
        attachments: [],
      };

      if (location.state?.action == "edit") {
        var diff =
          Number(submitData.amount?.total) -
          Number(location.state?.newData.totalAmount);
        var newAmount = Number(invoiceMain.returnAmount) + diff;
        var newreturnOnlyAmount = Number(invoiceMain.returnOnlyAmount);
        var returnForOnlyOneReturnAmountPaid = JSON.parse(
          location.state?.newData?.main,
        )?.returnForOnlyOneReturnAmountPaid;

        if (
          values.depositPaid === true &&
          (JSON.parse(location.state?.newData?.main)?.depositPaid === false ||
            location.state?.newData.status == "Draft") &&
          returnForOnlyOneReturnAmountPaid === 0
        ) {
          newreturnOnlyAmount =
            newreturnOnlyAmount + Number(submitData.amount?.total);
          returnForOnlyOneReturnAmountPaid = Number(submitData.amount?.total);

          var convertedAmount = convertAmount(
            Number(submitData.amount?.total),
            localStorage.getItem("selectedCurrency") ?? selectedCurrency,
            (JSON.parse(submitData?.currency)?.code ||
              localStorage.getItem("selectedCurrency")) ??
              selectedCurrency,
          );

          updateBankAccounts(
            bankAccounts.id,
            tableName === "sales_return"
              ? Number(bankAccounts.totalAmount) - convertedAmount
              : Number(bankAccounts.totalAmount) + convertedAmount,
            convertedAmount,
            tableName,
            tableName === "sales_return" ? "Withdraw" : "Deposit",
            bankAccountsMetaData,
            submitData,
          );
        } else if (
          Number(location.state?.newData.totalAmount) !==
          Number(submitData.amount?.total)
        ) {
          if (values.depositPaid) {
            newreturnOnlyAmount + diff;
            returnForOnlyOneReturnAmountPaid + diff;

            var convertedAmount = convertAmount(
              Number(submitData.amount?.total) -
                Number(location.state?.newData.totalAmount),
              localStorage.getItem("selectedCurrency") ?? selectedCurrency,
              (JSON.parse(submitData?.currency)?.code ||
                localStorage.getItem("selectedCurrency")) ??
                selectedCurrency,
            );

            updateBankAccounts(
              bankAccounts.id,
              tableName === "sales_return"
                ? Number(bankAccounts.totalAmount) - convertedAmount
                : Number(bankAccounts.totalAmount) + convertedAmount,
              convertedAmount,
              tableName,
              tableName === "sales_return" ? "Withdraw" : "Deposit",
              bankAccountsMetaData,
              submitData,
            );
          }
        }
        if (
          invoiceMain?.returnAmount !== null ||
          invoiceMain?.returnAmount !== undefined
        ) {
          commonApi.update(
            location.state?.newData.invoiceID,
            {
              main: JSON.stringify({
                ...invoiceMain,
                returnAmount: newAmount,
                returnOnlyAmount: newreturnOnlyAmount,
                returnStatus: "Returned",
              }),
              updatedAt: new Date().toISOString(),
              updatedBy: JSON.stringify(
                JSON.parse(
                  CryptoJS.AES.decrypt(
                    localStorage.getItem("user"),
                    import.meta.env.VITE_SECRET,
                  ).toString(CryptoJS.enc.Utf8),
                )?.user,
              ),
            },
            tableName === "sales_return"
              ? "sales_invoices"
              : "purchase_invoices",
          );
        }

        await commonApi.update(
          location.state?.newData.id,
          {
            updatedAt: new Date().toISOString(),
            issueDate: submitData.issueDate,
            updatedBy: JSON.stringify(
              JSON.parse(
                CryptoJS.AES.decrypt(
                  localStorage.getItem("user"),
                  import.meta.env.VITE_SECRET,
                ).toString(CryptoJS.enc.Utf8),
              )?.user,
            ),
            dueDate: submitData.dueDate,
            main: JSON.stringify({
              ...submitData,
              returnForOnlyOneReturnAmountPaid:
                returnForOnlyOneReturnAmountPaid,
            }),
            elementNumber: submitData.elementNumber,
            totalAmount: submitData.amount?.total,
            status: "Returned",
            attachments: JSON.stringify({
              images: [...res, ...serverImages],
            }),
          },
          tableName,
        );
        submitData.invoiceIDForDeleteMetaCustomer =
          location?.state?.newData?.invoiceID;

        var res4 = await addStockOrder(
          submitData,
          "edit",
          tableName === "sales_return" ? "Add" : "Withdraw",
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
            location.state?.newData?.invoiceID,
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
        submitData.invoiceIDForDeleteMetaCustomer =
          location?.state?.newData?.id;
        var inv;
        if (location.state?.action == "return") {
          inv = JSON.parse(location?.state?.newData?.main);
        }
        var newReturnOnlyAmount = Number(inv?.returnOnlyAmount ?? 0);

        var returnForOnlyOneReturnAmountPaid2 = 0;

        if (values.depositPaid && !isDraftSubmission) {
          returnForOnlyOneReturnAmountPaid2 = Number(submitData.amount?.total);
          newReturnOnlyAmount =
            Number(inv?.returnOnlyAmount ?? 0) +
            Number(submitData.amount?.total);
          var convertedAmount = convertAmount(
            Number(submitData.amount?.total),
            localStorage.getItem("selectedCurrency") ?? selectedCurrency,
            (JSON.parse(submitData?.currency)?.code ||
              localStorage.getItem("selectedCurrency")) ??
              selectedCurrency,
          );

          updateBankAccounts(
            bankAccounts.id,
            tableName === "sales_return"
              ? Number(bankAccounts.totalAmount) - convertedAmount
              : Number(bankAccounts.totalAmount) + convertedAmount,
            convertedAmount,
            tableName,
            tableName === "sales_return" ? "Withdraw" : "Deposit",
            bankAccountsMetaData,
            submitData,
          );
        }

        var res2 = await commonApi.create(
          {
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
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
            issueDate: submitData.issueDate,
            dueDate: submitData.dueDate,
            invoiceID: location?.state?.newData?.id,
            invoice: location?.state?.newData?.main,
            main: JSON.stringify({
              ...submitData,
              returnForOnlyOneReturnAmountPaid:
                returnForOnlyOneReturnAmountPaid2,
            }),
            elementNumber: submitData.elementNumber,
            totalAmount: submitData.amount?.total,
            status: !isDraftSubmission ? "Returned" : "Draft",
            attachments: JSON.stringify({
              images: [...res, ...serverImages],
            }),
          },
          tableName,
        );

        if (isDraftSubmission === false) {
          if (location.state?.action == "return") {
            commonApi.update(
              location.state?.newData.id,
              {
                main: JSON.stringify({
                  ...inv,

                  returnAmount:
                    Number(inv.returnAmount) + Number(submitData.amount?.total),

                  returnOnlyAmount: newReturnOnlyAmount,

                  returnStatus: "Returned",
                }),
                updatedAt: new Date().toISOString(),
                updatedBy: JSON.stringify(
                  JSON.parse(
                    CryptoJS.AES.decrypt(
                      localStorage.getItem("user"),
                      import.meta.env.VITE_SECRET,
                    ).toString(CryptoJS.enc.Utf8),
                  )?.user,
                ),
              },
              tableName === "sales_return"
                ? "sales_invoices"
                : "purchase_invoices",
            );
          }

          var res4 = await addStockOrder(
            submitData,
            "Add",
            tableName === "sales_return" ? "Add" : "Withdraw",
            "stockPending",
            tableName,
            res2.data.id,
            res2.data.id,
          );

          addCustomerMeta(
            submitData,
            submitData.amount?.total,
            tableName,
            res2.data.id,
            submitData.customerId,
          );
        }
      }

      if (isDraftSubmission === false) {
        tableName === "sales_return"
          ? addOrEditAccountsEntry(
              location,
              submitData,
              location.state?.action == "edit"
                ? location.state?.newData.id
                : res2.data.id,
              tableName,
              tableName,
              submitData.customer.name,
            )
          : addOrEditAccountsEntry(
              location,
              submitData,
              location.state?.action == "edit"
                ? location.state?.newData.id
                : res2.data.id,
              tableName,
              submitData.customer.name,
              tableName,
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
            ? "تم إنشاء فاتورة الارجاع بنجاح"
            : "Return Created Successfully",
        text: isDraftSubmission
          ? isRTL
            ? "تم حفظ فاتورة الارجاع كمسودة"
            : "Return has been saved as draft"
          : isRTL
            ? "تم إنشاء فاتورة الارجاع وإرسالها"
            : "Return has been created and sent",
        timer: 1000,
        showConfirmButton: false,
      });

      navigate(`/${pageName}/returned-invoices`);
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

export const handleSubmitCreditNotice = async (
  values,
  isDraftSubmission = false,
  isRTL,
  setIsSubmitting,
  setIsDraft,
  location,
  invoiceMain,
  serverImages,
  navigate,
  tableName,
  pageName,
) => {
  setIsSubmitting(true);
  setIsDraft(isDraftSubmission);

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
          ? "يرجى إضافة بنود صحيحة للفاتورة مع وصف وكمية وسعر صحيح"
          : "Please add valid credit notice items with description, quantity, and unit price",
      );
    }
    // }

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
        status: isDraftSubmission ? "Draft" : "Sent",
        attachments: [],
      };
      if (location.state?.action == "edit") {
        if (
          invoiceMain?.returnAmount !== null ||
          invoiceMain?.returnAmount !== undefined
        ) {
          var diff =
            Number(submitData.amount?.total) -
            Number(location.state?.newData.totalAmount);
          var newAmount = 0;
          var creditNoticeAmount = 0;
          newAmount = Number(invoiceMain.returnAmount) + diff;
          creditNoticeAmount = Number(invoiceMain.creditNoticeAmount) + diff;

          if (
            Number(location.state?.newData.totalAmount) !==
            Number(submitData.amount?.total)
          ) {
            commonApi.update(
              location.state?.newData.invoiceID,
              {
                main: JSON.stringify({
                  ...invoiceMain,
                  returnAmount: newAmount,
                  creditNoticeAmount: creditNoticeAmount,
                }),
                updatedAt: new Date().toISOString(),
                updatedBy: JSON.stringify(
                  JSON.parse(
                    CryptoJS.AES.decrypt(
                      localStorage.getItem("user"),
                      import.meta.env.VITE_SECRET,
                    ).toString(CryptoJS.enc.Utf8),
                  )?.user,
                ),
              },
              tableName === "purchase_credit_notices"
                ? "purchase_invoices"
                : "sales_invoices",
            );
          }
        }

        await commonApi.update(
          location.state?.newData.id,
          {
            updatedAt: new Date().toISOString(),
            issueDate: submitData.issueDate,
            isActive: isDraftSubmission,
            main: JSON.stringify(submitData),
            elementNumber: submitData.elementNumber,
            updatedBy: JSON.stringify(
              JSON.parse(
                CryptoJS.AES.decrypt(
                  localStorage.getItem("user"),
                  import.meta.env.VITE_SECRET,
                ).toString(CryptoJS.enc.Utf8),
              )?.user,
            ),
            totalAmount: submitData.amount?.total,
            status: submitData.status,
            attachments: JSON.stringify({
              images: [...res, ...serverImages],
            }),
          },
          tableName,
        );
        submitData.invoiceIDForDeleteMetaCustomer =
          location?.state?.newData?.invoiceID;

        var res4 = await addStockOrder(
          submitData,
          "edit",
          tableName === "purchase_credit_notices" ? "Withdraw" : "Add",
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
            location.state?.newData?.invoiceID,
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
        submitData.invoiceIDForDeleteMetaCustomer =
          location?.state?.newData?.id;

        if (location.state?.action == "CreditNotice") {
          if (!isDraftSubmission) {
            var inv = JSON.parse(location.state?.newData.main);

            commonApi.update(
              location.state?.newData.id,
              {
                main: JSON.stringify({
                  ...inv,
                  returnAmount:
                    Number(inv.returnAmount) + Number(submitData.amount?.total),
                  creditNoticeAmount: Number(submitData.amount?.total),
                }),
                updatedAt: new Date().toISOString(),
                updatedBy: JSON.stringify(
                  JSON.parse(
                    CryptoJS.AES.decrypt(
                      localStorage.getItem("user"),
                      import.meta.env.VITE_SECRET,
                    ).toString(CryptoJS.enc.Utf8),
                  )?.user,
                ),
              },
              tableName === "purchase_credit_notices"
                ? "purchase_invoices"
                : "sales_invoices",
            );
          }
        }

        var res2 = await commonApi.create(
          {
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
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
              location.state?.action == "CreditNotice"
                ? location.state?.newData.id
                : null,
            invoice:
              location.state?.action == "CreditNotice"
                ? location.state?.newData.main
                : null,

            issueDate: submitData.issueDate,
            isActive: isDraftSubmission,
            main: JSON.stringify(submitData),
            elementNumber: submitData.elementNumber,
            totalAmount: submitData.amount?.total,
            status: submitData.status,
            attachments: JSON.stringify({
              images: [...res, ...serverImages],
            }),
          },
          tableName,
        );
        if (!isDraftSubmission) {
          var res4 = await addStockOrder(
            submitData,
            "Add",
            tableName === "purchase_credit_notices" ? "Withdraw" : "Add",
            "stockPending",
            tableName,
            res2.data.id,
            res2.data.id,
          );

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
        tableName === "purchase_credit_notices"
          ? addOrEditAccountsEntry(
              location,
              submitData,
              location.state?.action == "edit"
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
            ? "تم إنشاء الاشعار الدائن بنجاح"
            : "Credit Notice Created Successfully",
        text: isDraftSubmission
          ? isRTL
            ? "تم حفظ الاشعار الدائن كمسودة"
            : "Credit Notice has been saved as draft"
          : isRTL
            ? "تم إنشاء الاشعار الدائن وإرسالها"
            : "Credit Notice has been created and sent",
        timer: 2000,
        showConfirmButton: false,
      });

      navigate(`/${pageName}/credit-notices`);
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

export const returnInitialValues = {
  elementNumber: generateNumber("RET"),
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
  issueDate: new Date().toISOString().split("T")[0],
  dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0],
  items: [
    {
      productId: "",
      stockQuantity: 0,
      productName: "",
      description: "",
      quantity: 1,
      unitPrice: 0,
      oldQuantity: 0,
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
  depositPaid: false,
  attachments: [],
  amount: null,
  status: "Draft",
  paymentMethod: "Cash",
  fields: [],
  invoiceIDForDeleteMetaCustomer: "",
  currency: JSON.stringify({
    code: localStorage.getItem("selectedCurrency") ?? selectedCurrency,
    symbol: localStorage.getItem("selectedCurrencySymbol") ?? selectedSymbol,
  }),
  paymentTerm: null,
  returnAmount: 0,
  returnOnlyAmount: 0,
  returnForOnlyOneReturnAmountPaid: 0,
  stockStatus: "stockPending",
};
