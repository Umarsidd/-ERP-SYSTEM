import Swal from "sweetalert2";
import { commonApi } from "./api";
import { generateTransactionId } from "./products_function";
import { selectedCurrency, selectedSymbol } from "@/data/data";
import {
  addCustomerMeta,
  updateBankAccounts,
  updateCustomerMeta,
} from "./api_function";
import { addOrEditAccountsEntry } from "./accounts_function";
import CryptoJS from "crypto-js";

export const paymentHandleSubmit = async (
  values,
  isRTL,
  setIsSubmitting,
  location,
  invoiceMain,
  convertAmount,
  bankAccounts,
  bankAccountsMetaData,
  serverImages,
  navigate,
  tableName,
  pageName,
  invoice,
  installments,
) => {
  try {
    setIsSubmitting(true);
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
        attachments: [],
      };

      if (location.state?.action == "edit") {
        if (
          (JSON.parse(location.state?.newData?.main)?.type == "invoices" ||
            JSON.parse(location.state?.newData?.main)?.type ==
              "installments") &&
          (invoiceMain?.returnAmount === null ||
            invoiceMain?.returnAmount === undefined)
        ) {
          throw new Error(
            isRTL ? "حدث خطأ غير متوقع" : "An unexpected error occurred",
          );
        }

        var total = location.state?.newData?.totalAmount;
        var newTotal = Number(submitData.amount) - Number(total);

        if (
          JSON.parse(location.state?.newData?.main)?.type == "invoices" &&
          Number(total) !== Number(submitData.amount) //&&
          //  invoice.status !== "Paid" && invoice.status !== "PaidByExcess"
        ) {
          var diff = 0;
          var raise =
            Number(invoice.totalAmount) - Number(invoiceMain.paidAmount);

          if (invoiceMain.numberOfPayments > 1) {
            diff = raise - Number(newTotal);
          } else {
            diff = Number(invoice.totalAmount) - Number(submitData.amount);
          }

          var newState = "";
          if (diff == Number(0)) {
            newState = "Paid";
            submitData.remainAmount = 0;
            submitData.raisedAmount = 0;
          } else if (diff < Number(0)) {
            submitData.raisedAmount = Math.abs(Number(diff));
            newState = "Paid"; //"PaidByExcess";
            submitData.remainAmount = 0;
          } else {
            newState = "PartiallyPaid";
            submitData.remainAmount = Math.abs(Number(diff));
            submitData.raisedAmount = 0;
          }
          // }

          commonApi.update(
            invoice.id,
            {
              main: JSON.stringify({
                ...invoiceMain,
                status: newState,
                remainAmount: submitData.remainAmount,
                raisedAmount: submitData.raisedAmount,
                paidAmount: Number(invoiceMain.paidAmount) + Number(newTotal),
              }),
              status: newState,
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
            tableName === "sales_payment"
              ? "sales_invoices"
              : "purchase_invoices",
          );

          var convertedAmount = convertAmount(
            Number(newTotal),
            localStorage.getItem("selectedCurrency") ?? selectedCurrency,
            (JSON.parse(submitData?.currency)?.code ||
              localStorage.getItem("selectedCurrency")) ??
              selectedCurrency,
          );

          updateBankAccounts(
            bankAccounts.id,
            tableName === "sales_payment"
              ? Number(bankAccounts.totalAmount) + convertedAmount
              : Number(bankAccounts.totalAmount) - convertedAmount,
            convertedAmount,
            tableName,
            tableName === "sales_payment" ? "Deposit" : "Withdraw",
            bankAccountsMetaData,
            submitData,
          );
        }

        if (
          JSON.parse(location.state?.newData?.main)?.type == "installments" &&
          Number(total) !== Number(submitData.amount)
          //Object.keys(installments).length > 0
        ) {
          var newValue = 0;
          var operator = "+";
          //var newStat = "Paid";
          var tempValue = 0;

          var newArr = JSON.parse(installments?.installmentsList).data;
          var oldAmount = location.state?.newData.totalAmount;

          newArr.map((obj) => {
            if (
              obj.id ===
              JSON.parse(location?.state?.newData?.main).installmentsOtherId
            ) {
              if (oldAmount >= submitData.amount) {
                newValue = oldAmount - submitData.amount;
                operator = "-";
                tempValue = obj?.installmentAmountPaid - newValue;

                if (tempValue < obj?.installmentAmount) {
                  obj.status = "PartiallyPaid";
                }
              } else {
                newValue = submitData.amount - oldAmount;

                operator = "+";

                tempValue = obj?.installmentAmountPaid + newValue;

                if (tempValue >= obj?.installmentAmount) {
                  obj.status = "Paid";
                }
              }

              obj.installmentAmountPaid = tempValue;
              obj.remainingAmount = obj.installmentAmount - tempValue;
            }
          });

          var currStat = newArr.filter((item) => item.status !== "Paid");

          var dueDate = new Date(submitData.issueDate);

          dueDate = currStat[0]?.dueDate;

          commonApi.update(
            submitData.invoiceID,
            {
              main: JSON.stringify({
                ...invoiceMain,
                status: currStat.length <= 0 ? "Paid" : "PartiallyPaid",

                remainAmount:
                  Number(invoiceMain.totalAmount) -
                  (operator == "-"
                    ? Number(invoiceMain.paidAmount) - Number(newValue)
                    : Number(invoiceMain.paidAmount) + Number(newValue)),
                paidAmount:
                  operator == "-"
                    ? Number(invoiceMain.paidAmount) - Number(newValue)
                    : Number(invoiceMain.paidAmount) + Number(newValue),
              }),

              status: currStat.length <= 0 ? "Paid" : "PartiallyPaid",
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
            tableName === "sales_payment"
              ? "sales_invoices"
              : "purchase_invoices",
          );

          if (
            Number(location.state?.newData.totalAmount) !==
            Number(values.amount)
          ) {
            var convertedAmount = convertAmount(
              Number(values.amount) -
                Number(location.state?.newData.totalAmount),
              localStorage.getItem("selectedCurrency") ?? selectedCurrency,
              (JSON.parse(submitData?.currency)?.code ||
                localStorage.getItem("selectedCurrency")) ??
                selectedCurrency,
            );

            updateBankAccounts(
              bankAccounts.id,
              tableName === "sales_payment"
                ? Number(bankAccounts.totalAmount) + convertedAmount
                : Number(bankAccounts.totalAmount) - convertedAmount,
              convertedAmount,
              tableName,
              tableName === "sales_payment" ? "Deposit" : "Withdraw",
              bankAccountsMetaData,
              submitData,
            );
          }

          commonApi.update(
            JSON.parse(location?.state?.newData?.main).installmentsMainId,
            {
              updatedAt: new Date().toISOString(),
              installmentsList: JSON.stringify({
                data: newArr,
              }),
              installmentAmountPaid:
                operator == "-"
                  ? Number(installments.installmentAmountPaid) -
                    Number(newValue)
                  : Number(installments.installmentAmountPaid) +
                    Number(newValue),
              main: JSON.stringify({
                ...JSON.parse(installments.main),
                installmentAmountPaid:
                  operator == "-"
                    ? Number(installments.installmentAmountPaid) -
                      Number(newValue)
                    : Number(installments.installmentAmountPaid) +
                      Number(newValue),
                status: currStat.length <= 0 ? "Paid" : "PartiallyPaid",
              }),

              dueDate: new Date(dueDate),
              updatedBy: JSON.stringify(
                JSON.parse(
                  CryptoJS.AES.decrypt(
                    localStorage.getItem("user"),
                    import.meta.env.VITE_SECRET,
                  ).toString(CryptoJS.enc.Utf8),
                )?.user,
              ),
              status: currStat.length <= 0 ? "Paid" : "PartiallyPaid",
            },
            "installments",
          );
        }

        commonApi.update(
          location.state?.newData.id,
          {
            //  createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),

            issueDate: submitData.issueDate,
            //  dueDate: submitData.dueDate,

            // isActive: isDraftSubmission,
            main: JSON.stringify(submitData),
            elementNumber: submitData.elementNumber,
            totalAmount: submitData.amount,
            status: submitData.status,
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

        // updateCustomerMeta(
        //   submitData,
        //   submitData.amount,
        //   tableName,
        //   submitData.customerId,
        // );
      } else {
        ///create here
        submitData.invoiceIDForDeleteMetaCustomer =
          location.state?.action == "return" ||
          location.state?.action == "installments"
            ? (location.state?.newData?.invoiceID ?? null)
            : (location.state?.newData?.id ?? null);

        if (location.state?.action == "installments") {
          const newArr = JSON.parse(
            location.state?.newData.installmentsList,
          ).data.map((obj) =>
            obj.id === location.state?.newData.installmentsOtherId
              ? {
                  ...obj,
                  status:
                    submitData.amount >= submitData.installmentAmount ||
                    (obj.status == "PartiallyPaid" &&
                      submitData.amount >= obj.remainingAmount)
                      ? "Paid"
                      : "PartiallyPaid",
                  customerId: submitData.customerId,
                  customer: submitData.customer,
                  issueDate: new Date(submitData.issueDate),
                  dueDate: new Date(submitData.issueDate),
                  installmentAmountPaid:
                    obj.status == "PartiallyPaid" //&& submitData.amount >= obj.remainingAmount
                      ? submitData.amount + obj.installmentAmountPaid
                      : submitData.amount,
                  remainingAmount:
                    obj.status == "PartiallyPaid" //&& submitData.amount >= obj.remainingAmount
                      ? submitData.installmentAmount -
                        (submitData.amount + obj.installmentAmountPaid)
                      : submitData.installmentAmount - submitData.amount,
                }
              : obj,
          );

          var currStat = newArr.filter((item) => item.status !== "Paid");
          var dueDate = new Date(submitData.issueDate);
          dueDate = currStat[0]?.dueDate;
          // dueDate =
          //   newArr[location.state?.newData.installmentsOtherId]?.dueDate;
          //  if (currStat.length <= 0) {
          commonApi.update(
            submitData.invoiceID,
            {
              main: JSON.stringify({
                ...invoiceMain,
                status: currStat.length <= 0 ? "Paid" : "PartiallyPaid",

                remainAmount:
                  Number(invoiceMain.totalAmount) -
                  Number(invoiceMain.paidAmount) +
                  Number(submitData.amount),
                paidAmount:
                  Number(invoiceMain.paidAmount) + Number(submitData.amount),
              }),

              status: currStat.length <= 0 ? "Paid" : "PartiallyPaid",
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
            tableName === "sales_payment"
              ? "sales_invoices"
              : "purchase_invoices",
          );
          //  }

          commonApi.update(
            location.state?.newData.installmentsMainId,
            {
              updatedAt: new Date().toISOString(),
              installmentsList: JSON.stringify({
                data: newArr,
              }),
              installmentAmountPaid:
                Number(location.state?.newData.installmentAmountPaid) +
                Number(submitData.amount),
              //   installmentAmount: submitData.installmentAmount,
              main: JSON.stringify({
                ...JSON.parse(location.state?.newData.main),
                installmentAmountPaid:
                  Number(location.state?.newData.installmentAmountPaid) +
                  Number(submitData.amount),
                //   installmentAmount: submitData.installmentAmount,
                status: currStat.length <= 0 ? "Paid" : "PartiallyPaid",
              }),
              // invoice: submitData.invoice,
              dueDate: new Date(dueDate),
              updatedBy: JSON.stringify(
                JSON.parse(
                  CryptoJS.AES.decrypt(
                    localStorage.getItem("user"),
                    import.meta.env.VITE_SECRET,
                  ).toString(CryptoJS.enc.Utf8),
                )?.user,
              ),
              status: currStat.length <= 0 ? "Paid" : "PartiallyPaid",
            },
            "installments",
          );
          var convertedAmount = convertAmount(
            Number(values.amount),
            localStorage.getItem("selectedCurrency") ?? selectedCurrency,
            (JSON.parse(submitData?.currency)?.code ||
              localStorage.getItem("selectedCurrency")) ??
              selectedCurrency,
          );

          updateBankAccounts(
            bankAccounts.id,
            tableName === "sales_payment"
              ? Number(bankAccounts.totalAmount) + convertedAmount
              : Number(bankAccounts.totalAmount) - convertedAmount,
            convertedAmount,
            tableName,
            tableName === "sales_payment" ? "Deposit" : "Withdraw",
            bankAccountsMetaData,
            submitData,
          );
        }

        if (location.state?.action == "invoices") {
          var invoicesMain = JSON.parse(location.state?.newData.main);
          var diff =
            Number(location.state?.newData.totalAmount) -
            Number(invoicesMain.paidAmount ?? 0) -
            Number(submitData.amount);

          var newState = "";
          if (diff == Number(0)) {
            newState = "Paid";
            submitData.remainAmount = 0;
            submitData.raisedAmount = 0;
          } else if (diff < Number(0)) {
            submitData.raisedAmount = Math.abs(Number(diff));
            submitData.remainAmount = 0;
            newState = "Paid"; //"PaidByExcess";
          } else {
            newState = "PartiallyPaid";
            submitData.remainAmount = Math.abs(Number(diff));
            submitData.raisedAmount = 0;
          }

          commonApi.update(
            location.state?.newData.id,
            {
              main: JSON.stringify({
                ...invoicesMain,
                status: newState,
                remainAmount: submitData.remainAmount,
                raisedAmount: submitData.raisedAmount,
                numberOfPayments: Number(invoicesMain.numberOfPayments) + 1,
                paidAmount:
                  Number(invoicesMain.paidAmount) + Number(submitData.amount),
              }),
              status: newState,
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
            tableName === "sales_payment"
              ? "sales_invoices"
              : "purchase_invoices",
          );

          var convertedAmount = convertAmount(
            Number(values.amount),
            localStorage.getItem("selectedCurrency") ?? selectedCurrency,
            (JSON.parse(submitData?.currency)?.code ||
              localStorage.getItem("selectedCurrency")) ??
              selectedCurrency,
          );

          updateBankAccounts(
            bankAccounts.id,
            tableName === "sales_payment"
              ? Number(bankAccounts.totalAmount) + convertedAmount
              : Number(bankAccounts.totalAmount) - convertedAmount,
            convertedAmount,
            tableName,
            tableName === "sales_payment" ? "Deposit" : "Withdraw",
            bankAccountsMetaData,
            submitData,
          );
        }

        submitData = {
          ...submitData,
          type:
            location.state?.action == "installments"
              ? "installments"
              : location.state?.action == "return"
                ? "return"
                : location.state?.action == "invoices"
                  ? "invoices"
                  : location.state?.action == "addPaymentCredit"
                    ? "addPaymentCredit"
                    : "invoices",
        };

        var res2 = await commonApi.create(
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
              location.state?.action == "return" ||
              location.state?.action == "installments"
                ? (location.state?.newData?.invoiceID ?? null)
                : (location.state?.newData?.id ?? null),
            invoice:
              location.state?.action == "return" ||
              location.state?.action == "installments"
                ? (location.state?.newData?.invoice ?? null)
                : (location.state?.newData?.main ?? null),

            main: JSON.stringify(submitData),
            elementNumber: submitData.elementNumber,
            totalAmount: submitData.amount,
            status: submitData.status,
            attachments: JSON.stringify({
              images: [...res, ...serverImages],
            }),
          },
          tableName,
        );

        // addCustomerMeta(
        //   submitData,
        //   submitData.amount,
        //   tableName,
        //   res2.data.id,
        //   submitData.customerId,
        // );
      }

      if (
        location.state?.action == "addPaymentCredit" ||
        JSON.parse(location.state?.newData?.main)?.type == "addPaymentCredit"
      ) {
        if (location.state?.action == "edit") {
          updateCustomerMeta(
            submitData,
            submitData.amount,
            tableName,
            submitData.customerId,
          );
        } else {
          addCustomerMeta(
            submitData,
            submitData.amount,
            tableName,
            res2.data.id,
            submitData.customerId,
          );
        }
        var convertedAmount = convertAmount(
          location.state?.action == "edit"
            ? Number(submitData.amount) -
                Number(location.state?.newData?.totalAmount)
            : Number(values.amount),
          localStorage.getItem("selectedCurrency") ?? selectedCurrency,
          (JSON.parse(submitData?.currency)?.code ||
            localStorage.getItem("selectedCurrency")) ??
            selectedCurrency,
        );

        updateBankAccounts(
          bankAccounts.id,
          tableName === "sales_payment"
            ? Number(bankAccounts.totalAmount) + convertedAmount
            : Number(bankAccounts.totalAmount) - convertedAmount,
          convertedAmount,
          tableName,
          tableName === "sales_payment" ? "Deposit" : "Withdraw",
          bankAccountsMetaData,
          submitData,
        );
      }

      tableName === "sales_payment"
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

      await Swal.fire({
        icon: "success",
        title: isRTL ? "تم الدفع بنجاح" : "Payment Successfully",
        text: isRTL ? "تم الدفع بنجاح" : "Payment Successfully",
        timer: 700,
        showConfirmButton: false,
      });

      navigate(
        location.state?.action == "installments"
          ? "/installments/agreements"
          : `/${pageName}/payments`,
      );
    }
  } catch (error) {
    console.error("Error uploading attachments:", error);
  } finally {
    setIsSubmitting(false);
  }
};

export const paymentInvoicesInitialValues = {
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
  attachments: [],
  status: "Completed",
  type: "",
  elementNumber: generateTransactionId(),
  amount: 0,
  paymentMethod: "Cash",
  issueDate: new Date().toISOString().split("T")[0],
  transactionId: generateTransactionId(),
  notes: "",
  fields: [],
  currency: JSON.stringify({
    code: localStorage.getItem("selectedCurrency") ?? selectedCurrency,
    symbol: localStorage.getItem("selectedCurrencySymbol") ?? selectedSymbol,
  }),
  invoiceIDForDeleteMetaCustomer: "",
};
