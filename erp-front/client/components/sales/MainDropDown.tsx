import { useCurrency } from "@/contexts/CurrencyContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { selectedCurrency } from "@/data/data";
import { commonApi } from "@/lib/api";
import {
  loadBankAccounts,
  loadInvoices,
  updateBankAccounts,
  updateCustomerMeta,
} from "@/lib/api_function";
import {
  handleCopy,
  handleEdit,
  handlePayment,
} from "@/lib/function";
import { printEntry } from "@/utils/entryPrintPdf";
import { printUnifiedInvoice } from "@/utils/invoicePrintPdf";
import { printUnifiedPaymentReceipt } from "@/utils/paymentPrintPdf";
import { printQuotation } from "@/utils/quotationPrintPdf";
import {
  Copy,
  CreditCard,
  Edit,
  MoreHorizontal,
  Printer,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import CryptoJS from "crypto-js";

export function MainDropDown(props: {
  data: any;
  setIsRefreshing: any;
  titleLink: any;
  title: any;
  type: any;
  sectionName: any;
  pageName: any;
  pageName2: any;
}) {
  const {
    data,
    setIsRefreshing,
    titleLink,
    title,
    type,
    sectionName,
    pageName,
    pageName2,
  } = props;
  const { formatAmount, convertAmount } = useCurrency();

  const { isRTL } = useLanguage();
  const navigate = useNavigate();

  type type2 = {
    [key: string]: any;
  };

  const [bankAccounts, setBankAccounts] = useState<type2>({});
  const [bankAccountsMetaData, setBankAccountsMetaData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [invoice, setInvoice] = useState<type2>({});
  const [invoiceMain, setInvoiceMain] = useState<type2>({});

  useEffect(() => {
    loadBankAccounts(setBankAccounts, setBankAccountsMetaData, setIsLoading);
  }, []);

  const [installments, setInstallments] = useState<type2>({});
  useEffect(() => {
    //console.log(JSON.parse(invoice.main));
    loadInstallments();
  }, []);

  const loadInstallments = async () => {
    try {
      //    setLoading(true);

      var result = await commonApi.getAll(
        1,
        1,
        [
          {
            // useFor: "search",
            field: "invoiceID",
            operator: "=",
            value: titleLink === "payments" ? data.invoiceID : data.id,
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
      console.log("result", result.data);

      if (result.data && result.data.length > 0) {
        setInstallments(result.data[0]);
      }
    } catch (error) {
    } finally {
      //  setLoading(false);/
    }
  };

  return (
    <div className="relative group">
      <button className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all duration-200 transform hover:scale-105">
        <MoreHorizontal className="w-4 h-4" />
      </button>
      <div className="absolute top-full right-0 rtl:right-auto rtl:left-0 mt-2 w-56 bg-card border border-border rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform scale-95 group-hover:scale-100 z-20">
        <div className="p-2 space-y-1">
          {/* <button
            onClick={() => {
              handleView(
                data,
                navigate,
                `/${type}/${titleLink}/${data?.id}/view`,
              );
            }}
            className="w-full flex items-center space-x-2 rtl:space-x-reverse px-3 py-2 text-sm hover:bg-accent rounded-md transition-all duration-200 transform hover:translate-x-1 rtl:hover:-translate-x-1"
          >
            <Eye className="w-4 h-4 " />
            <span> {isRTL ? "عرض" : "View"}</span>
          </button> */}

          {Object.keys(installments).length === 0 &&
            ((JSON.parse(localStorage.getItem("subRole") || "null") as any)?.[
              sectionName
            ]?.[pageName] !== false ||
              ((JSON.parse(localStorage.getItem("subRole") || "null") as any)?.[
                sectionName
              ]?.[pageName2] === true &&
                JSON.parse(
                  CryptoJS.AES.decrypt(
                    localStorage.getItem("user"),
                    import.meta.env.VITE_SECRET,
                  ).toString(CryptoJS.enc.Utf8),
                )?.user?.id === JSON.parse(data.createdBy).id)) && ( //||
              //deletingAndEditingHisPayments

              //   ((JSON.parse(localStorage.getItem("subRole") || "null") as any)?.[
              //   sectionName
              // ]?.deletingAndEditingAllPayments !== false ||
              //   ((JSON.parse(localStorage.getItem("subRole") || "null") as any)?.[
              //     sectionName
              //   ]?.deletingAndEditingHisPayments === true &&
              //     JSON.parse(
              //       CryptoJS.AES.decrypt(
              //         localStorage.getItem("user"),
              //         import.meta.env.VITE_SECRET,
              //       ).toString(CryptoJS.enc.Utf8),
              //     )?.user?.id === JSON.parse(data.createdBy).id))

              <button
                onClick={() => {
                  handleEdit(data, navigate, `/${type}/${titleLink}/edit`);
                }}
                className="w-full flex items-center space-x-2 rtl:space-x-reverse px-3 py-2 text-sm hover:bg-accent rounded-md transition-all duration-200 transform hover:translate-x-1 rtl:hover:-translate-x-1"
              >
                <Edit className="w-4 h-4 " />
                <span>{isRTL ? "تعديل" : "Edit"}</span>
              </button>
            )}

          {titleLink != "return" &&
            titleLink != "recurring-invoices" &&
            titleLink != "payments" &&
            type != "installments" && (
              // (JSON.parse(localStorage.getItem("subRole") || "null") as any)?.[
              //   sectionName
              // ]?.create !== false &&
              <button
                onClick={() =>
                  handleCopy(
                    isRTL ? "نسخ" : "Copy",
                    isRTL
                      ? `هل تريد نسخ ${data.elementNumber}؟`
                      : `Do you want to copy ${data.elementNumber}?`,
                    data,
                    isRTL,
                    navigate,
                    `/${type}/${titleLink}/create`, //  "/${type}/invoices/create-invoice",
                  )
                }
                className="w-full flex items-center space-x-2 rtl:space-x-reverse px-3 py-2 text-sm hover:bg-accent rounded-md transition-all duration-200 transform hover:translate-x-1 rtl:hover:-translate-x-1"
              >
                <Copy className="w-4 h-4 " />
                <span>{isRTL ? "نسخ" : "Copy"}</span>
              </button>
            )}

          {
            //titleLink == "return" ||

            titleLink == "invoices" &&
              data.status !== "Paid" &&
              data.status !== "PaidByExcess" &&
              Object.keys(installments).length === 0 &&
              data.status !== "Draft" &&
              ((JSON.parse(localStorage.getItem("subRole") || "null") as any)?.[
                sectionName
              ]?.addPaymentAllInvoices !== false ||
                ((
                  JSON.parse(localStorage.getItem("subRole") || "null") as any
                )?.[sectionName]?.addPaymentHisInvoices === true &&
                  JSON.parse(
                    CryptoJS.AES.decrypt(
                      localStorage.getItem("user"),
                      import.meta.env.VITE_SECRET,
                    ).toString(CryptoJS.enc.Utf8),
                  )?.user?.id === JSON.parse(data.createdBy).id)) && (
                <button
                  onClick={() =>
                    handlePayment(
                      data,
                      navigate,
                      `/${type}/payments/new`,
                      titleLink, //  "/${type}/invoices/create-invoice",
                    )
                  }
                  className="w-full flex items-center space-x-2 rtl:space-x-reverse px-3 py-2 text-sm hover:bg-accent rounded-md transition-all duration-200 transform hover:translate-x-1 rtl:hover:-translate-x-1"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>{isRTL ? "دفع" : "Payment"}</span>
                </button>
              )
          }

          {/* {data.status !== "paid" && (
                                <button
                                  onClick={() => handlePayment(data)}
                                  className="w-full flex items-center space-x-2 rtl:space-x-reverse px-3 py-2 text-sm hover:bg-success/10 text-success rounded-md transition-all duration-200 transform hover:translate-x-1 rtl:hover:-translate-x-1"
                                >
                                  <CreditCard className="w-4 h-4" />
                                  <span>{isRTL ? "دفع" : "Payment"}</span>
                                </button> 
                              )} */}
          {titleLink != "recurring-invoices" &&
            type != "installments" &&
            titleLink !== "receivables" &&
            titleLink !== "expenses" &&
            titleLink !== "requests" &&
            titleLink !== "order-quotations" && (
              <button
                onClick={() => {
                  if (titleLink == "invoices") {
                    printUnifiedInvoice(
                      JSON.parse(data.main),
                      isRTL,
                      data.tableName,
                      formatAmount,
                      convertAmount,
                    );
                  } else if (titleLink == "payments") {
                    printUnifiedPaymentReceipt(
                      JSON.parse(data.main),
                      isRTL,
                      formatAmount,
                      convertAmount,
                    );
                  } else if (titleLink == "daily-entries") {
                    printEntry(JSON.parse(data.main), isRTL);
                  } else {
                    printQuotation(
                      {
                        ...JSON.parse(data.main),
                        title: title,
                      },

                      isRTL,
                      formatAmount,
                      convertAmount,
                    );
                  }
                }}
                className="w-full flex items-center space-x-2 rtl:space-x-reverse px-3 py-2 text-sm hover:bg-accent rounded-md transition-all duration-200 transform hover:translate-x-1 rtl:hover:-translate-x-1"
              >
                <Printer className="w-4 h-4" />
                <span>{isRTL ? "طباعة" : "Print"}</span>
              </button>
            )}
          {/* {titleLink != "recurring-invoices" &&
            titleLink != "payments" &&
            type != "installments" && (
              <button
                onClick={() =>
                  handleSendToClient(
                    isRTL ? "إرسال للعميل" : "Send to Client",
                    isRTL
                      ? `إرسال ${data.elementNumber} إلى العميل؟`
                      : `Send ${data.elementNumber} to client?`,
                    isRTL
                      ? `تم إرسال ${data.elementNumber} إلى العميل`
                      : `${data.elementNumber} sent to client`,
                    isRTL,
                  )
                }
                className="w-full flex items-center space-x-2 rtl:space-x-reverse px-3 py-2 text-sm hover:bg-accent rounded-md transition-all duration-200 transform hover:translate-x-1 rtl:hover:-translate-x-1"
              >
                <Send className="w-4 h-4" />
                <span>{isRTL ? "إرسال للعميل" : "Send to Client"}</span>
              </button>
            )} */}
          <div className="border-t border-border my-1"></div>
          {((JSON.parse(localStorage.getItem("subRole") || "null") as any)?.[
            sectionName
          ]?.[pageName] !== false ||
            ((JSON.parse(localStorage.getItem("subRole") || "null") as any)?.[
              sectionName
            ]?.[pageName2] === true &&
              JSON.parse(
                CryptoJS.AES.decrypt(
                  localStorage.getItem("user"),
                  import.meta.env.VITE_SECRET,
                ).toString(CryptoJS.enc.Utf8),
              )?.user?.id === JSON.parse(data.createdBy).id)) && (
            <button
              onClick={async () => {
                if (titleLink == "invoices") {
                  commonApi.deleteInvoice(
                    isRTL ? "حذف" : "Delete",
                    isRTL
                      ? `هل أنت متأكد من حذف ${data.elementNumber}؟ لا يمكن التراجع عن هذا الإجراء سيتم حذف الفاتوره مع كافة البيانات المرتبطه بها . `
                      : `Are you sure you want to delete ${data.elementNumber}?  This action cannot be undone and will delete the invoice along with all its related data.`,
                    data.id,
                    type,
                    isRTL,
                    setIsRefreshing,
                    bankAccounts,
                    bankAccountsMetaData,
                    data,
                    convertAmount,
                  );
                } else if (titleLink == "credit-notices") {
                  const result = await Swal.fire({
                    title: isRTL ? "حذف" : "Delete",
                    text: isRTL
                      ? `هل أنت متأكد من حذف ${data.elementNumber}؟ لا يمكن التراجع عن هذا الإجراء.`
                      : `Are you sure you want to delete ${data.elementNumber}? This action cannot be undone.`,
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonText: isRTL ? "حذف" : "Delete",
                    cancelButtonText: isRTL ? "إلغاء" : "Cancel",
                    confirmButtonColor: "#d33",
                  });

                  if (result.isConfirmed) {
                    setIsRefreshing(true);

                    var res22 = await loadInvoices(
                      data?.invoiceID,
                      1,
                      20,
                      setIsLoading,
                      setInvoice,
                      setInvoiceMain,
                      type == "purchase"
                        ? "purchase_invoices"
                        : "sales_invoices",
                    );
                    // console.log(
                    //   "result sales_invoicess ",
                    //   JSON.parse(res22.main),
                    // );

                    var res23 = await commonApi.deleteNoDialog(
                      data.id,
                      data.tableName,
                    );

                    updateCustomerMeta(
                      JSON.parse(data.main),
                      data.totalAmount,
                      "delete",
                      JSON.parse(data.main)?.customerId,
                    );

                    if (res22?.main !== undefined) {
                      var res3 = await commonApi.update(
                        data?.invoiceID,
                        {
                          main: JSON.stringify({
                            ...JSON.parse(res22.main),
                            returnAmount:
                              Number(JSON.parse(res22.main).returnAmount) -
                              Number(JSON.parse(res22.main).creditNoticeAmount),
                            creditNoticeAmount: 0,
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
                        type == "purchase"
                          ? "purchase_invoices"
                          : "sales_invoices",
                      );
                    }

                    Swal.fire({
                      icon: "success",
                      title: isRTL ? "تم الحذف" : "Deleted",
                      text: isRTL ? "تم حذف بنجاح" : "deleted successfully",
                      timer: 1500,
                      showConfirmButton: false,
                    });

                    setIsRefreshing(false);
                  }
                } else if (titleLink == "return") {
                  const result = await Swal.fire({
                    title: isRTL ? "حذف" : "Delete",
                    text: isRTL
                      ? `هل أنت متأكد من حذف ${data.elementNumber}؟ لا يمكن التراجع عن هذا الإجراء.`
                      : `Are you sure you want to delete ${data.elementNumber}? This action cannot be undone.`,
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonText: isRTL ? "حذف" : "Delete",
                    cancelButtonText: isRTL ? "إلغاء" : "Cancel",
                    confirmButtonColor: "#d33",
                  });

                  if (result.isConfirmed) {
                    setIsRefreshing(true);

                    var res22 = await loadInvoices(
                      data?.invoiceID,
                      1,
                      20,
                      setIsLoading,
                      setInvoice,
                      setInvoiceMain,
                      type == "purchase"
                        ? "purchase_invoices"
                        : "sales_invoices",
                    );
                    // console.log(
                    //   "result sales_invoicess ",
                    //   JSON.parse(res22.main),
                    // );

                    var res23 = await commonApi.deleteNoDialog(
                      data.id,
                      data.tableName,
                    );

                    // if(JSON.parse(data.main)?.paymentId!== undefined){ var res24 = await Array.from(
                    //   JSON.parse(data.main)?.paymentId,
                    // ).forEach(async (i) => {
                    //   var res = await commonApi.deleteNoDialog(
                    //     i,
                    //     type == "purchase" ? "purchase_payment" : "sales_payment",
                    //   );
                    // });}

                    if (JSON.parse(data.main)?.depositPaid) {
                      var convertedAmount = convertAmount(
                        Number(
                          JSON.parse(data.main)
                            ?.returnForOnlyOneReturnAmountPaid,
                        ),
                        localStorage.getItem("selectedCurrency") ??
                          selectedCurrency,
                        (JSON.parse(JSON.parse(data.main)?.currency)?.code ||
                          localStorage.getItem("selectedCurrency")) ??
                          selectedCurrency,
                      );

                      var res25 = await updateBankAccounts(
                        bankAccounts.id,
                        type == "purchase"
                          ? Number(bankAccounts.totalAmount) -
                              Number(convertedAmount)
                          : Number(bankAccounts.totalAmount) +
                              Number(convertedAmount),
                        Number(convertedAmount),
                        "Delete return Invoice",
                        type == "purchase" ? "Withdraw" : "Deposit",
                        bankAccountsMetaData,
                        {
                          issueDate: data.issueDate,
                          customer: JSON.parse(data.main)?.customer,
                          elementNumber: data.elementNumber,
                          currency: JSON.parse(data.main)?.currency,
                        },
                      );
                    }

                    var res26 = await commonApi.update(
                      data?.invoiceID,
                      {
                        main: JSON.stringify({
                          ...JSON.parse(res22.main),
                          returnAmount:
                            Number(JSON.parse(res22.main).returnAmount) -
                            Number(data?.totalAmount),
                          returnOnlyAmount:
                            Number(JSON.parse(res22.main).returnOnlyAmount) -
                            Number(
                              JSON.parse(data.main)
                                ?.returnForOnlyOneReturnAmountPaid,
                            ),
                          returnStatus: null,
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
                      type == "purchase"
                        ? "purchase_invoices"
                        : "sales_invoices",
                    );

                    updateCustomerMeta(
                      JSON.parse(data.main),
                      data.totalAmount,
                      "delete",

                      JSON.parse(data.main)?.customerId,
                    );

                    Swal.fire({
                      icon: "success",
                      title: isRTL ? "تم الحذف" : "Deleted",
                      text: isRTL ? "تم حذف بنجاح" : "deleted successfully",
                      timer: 1500,
                      showConfirmButton: false,
                    });

                    setIsRefreshing(false);
                  }
                } else if (titleLink == "payments") {
                  const result = await Swal.fire({
                    title: isRTL ? "حذف" : "Delete",
                    text: isRTL
                      ? `هل أنت متأكد من حذف هذا العنصر؟ لا يمكن التراجع عن هذا الإجراء.`
                      : `Are you sure you want to delete this item? This action cannot be undone.`,
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonText: isRTL ? "حذف" : "Delete",
                    cancelButtonText: isRTL ? "إلغاء" : "Cancel",
                    confirmButtonColor: "#d33",
                  });

                  if (result.isConfirmed) {
                    setIsRefreshing(true);

                    var res22 = await loadInvoices(
                      data?.invoiceID,
                      1,
                      20,
                      setIsLoading,
                      setInvoice,
                      setInvoiceMain,
                      type == "purchase"
                        ? "purchase_invoices"
                        : "sales_invoices",
                    );
                    // console.log(
                    //   "result sales_invoicess ",
                    //   JSON.parse(res22.main),
                    // );

                    var res23 = await commonApi.deleteNoDialog(
                      data.id,
                      data.tableName,
                    );

                    updateCustomerMeta(
                      JSON.parse(data.main),
                      data.totalAmount,
                      "delete",

                      JSON.parse(data.main)?.customerId,
                    );

                    // var res24 = await Array.from(
                    //   JSON.parse(data.main)?.paymentId,
                    // ).forEach(async (i) => {
                    //   var res = await commonApi.deleteNoDialog(
                    //     i,
                    //     type == "purchase" ? "purchase_payment" : "sales_payment",
                    //   );
                    // });

                    var x = 0,
                      inv = res22?.main ? JSON.parse(res22?.main) : {},
                      y = "",
                      z = true;

                    var convertedAmount = convertAmount(
                      Number(data?.totalAmount),
                      localStorage.getItem("selectedCurrency") ??
                        selectedCurrency,
                      (JSON.parse(JSON.parse(data.main)?.currency)?.code ||
                        localStorage.getItem("selectedCurrency")) ??
                        selectedCurrency,
                    );

                    // if (JSON.parse(data?.main)?.type == "return") {
                    //   z = true;
                    //   inv.returnAmount =
                    //     Number(inv.returnAmount) - Number(data?.totalAmount);
                    //   inv.returnOnlyAmount =
                    //     Number(inv.returnOnlyAmount) - Number(data?.totalAmount);

                    //   inv.returnStatus =
                    //     Number(inv.totalAmount) - Number(inv.returnOnlyAmount) <=
                    //     0
                    //       ? "Returned"
                    //       : "PartiallyReturned";

                    //   if (type == "purchase") {
                    //     x = Number(bankAccounts.totalAmount) - convertedAmount;
                    //     y = "Withdraw";
                    //   } else {
                    //     x = Number(bankAccounts.totalAmount) + convertedAmount;
                    //     y = "Deposit";
                    //   }
                    // } else {
                    z = false;
                    inv.paidAmount =
                      Number(inv?.paidAmount) - Number(data?.totalAmount);

                    inv.status =
                      Number(inv?.paidAmount) == Number(inv?.totalAmount)
                        ? "Paid"
                        : inv?.paidAmount == 0
                          ? "Unpaid"
                          : inv?.paidAmount > Number(inv?.totalAmount)
                            ? "Paid" //"PaidByExcess"
                            : "PartiallyPaid";

                    if (type == "purchase") {
                      x = Number(bankAccounts?.totalAmount) + convertedAmount;
                      y = "Deposit";
                    } else {
                      x = Number(bankAccounts?.totalAmount) - convertedAmount;
                      y = "Withdraw";
                    }
                    //  }

                    var res25 = await updateBankAccounts(
                      bankAccounts.id,
                      x,
                      convertedAmount,
                      "Delete Payment",
                      y,
                      bankAccountsMetaData,
                      {
                        issueDate: data.issueDate,
                        customer: JSON.parse(data.main)?.customer,
                        currency: JSON.parse(data.main)?.currency,

                        elementNumber: data.elementNumber,
                      },
                    );

                    // if (z) {

                    //   //error id here you need to fetch return from elementNumber
                    //   await commonApi.update(
                    //     JSON.parse(data?.main)?.returnId,
                    //     {
                    //       updatedAt: new Date().toISOString(),
                    //       updatedBy: JSON.stringify(
                    //         JSON.parse(CryptoJS.AES.decrypt(localStorage.getItem("user"),import.meta.env.VITE_SECRET).toString(CryptoJS.enc.Utf8))?.user,
                    //       ),
                    //       status: inv.returnStatus,
                    //     },
                    //     type == "purchase" ? "purchase_return" : "sales_return",
                    //   );
                    // }

                    if (JSON.parse(data?.main)?.type == "installments") {
                      var tempValue = 0;

                      var newArr = JSON.parse(
                        installments?.installmentsList,
                      ).data;

                      newArr.map((obj) => {
                        if (
                          obj.id === JSON.parse(data?.main).installmentsOtherId
                        ) {
                          tempValue =
                            obj?.installmentAmountPaid -
                            Number(data?.totalAmount);

                          if (tempValue <= 0) {
                            obj.status = "Unpaid";
                          } else {
                            obj.status = "PartiallyPaid";
                          }

                          obj.installmentAmountPaid = tempValue;
                          obj.remainingAmount =
                            obj.installmentAmount - tempValue;
                        }
                      });

                      var currStat = newArr.filter(
                        (item) => item.status === "Unpaid",
                      );

                      var dueDate = new Date(data.issueDate);
                      dueDate = currStat[0]?.dueDate;

                      commonApi.update(
                        JSON.parse(data?.main).installmentsMainId,
                        {
                          updatedAt: new Date().toISOString(),
                          installmentsList: JSON.stringify({
                            data: newArr,
                          }),
                          installmentAmountPaid:
                            Number(installments.installmentAmountPaid) -
                            Number(data?.totalAmount),
                          main: JSON.stringify({
                            ...JSON.parse(installments.main),
                            installmentAmountPaid:
                              Number(installments.installmentAmountPaid) -
                              Number(data?.totalAmount),
                            status:
                              currStat.length <= 0 ? "Paid" : "PartiallyPaid",
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
                          status:
                            currStat.length == newArr.length
                              ? "Unpaid"
                              : "PartiallyPaid",
                        },
                        "installments",
                      );
                    }

                    var res26 = await commonApi.update(
                      data?.invoiceID,
                      {
                        main: JSON.stringify({
                          ...inv,
                        }),
                        status: inv.status,
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
                      type == "purchase"
                        ? "purchase_invoices"
                        : "sales_invoices",
                    );

                    Swal.fire({
                      icon: "success",
                      title: isRTL ? "تم الحذف" : "Deleted",
                      text: isRTL ? "تم حذف بنجاح" : "deleted successfully",
                      timer: 1500,
                      showConfirmButton: false,
                    });

                    setIsRefreshing(false);
                  }
                } else if (titleLink == "receivables") {
                  const result = await Swal.fire({
                    title: isRTL ? "حذف" : "Delete",
                    text: isRTL
                      ? `هل أنت متأكد من حذف ${data.elementNumber}؟ لا يمكن التراجع عن هذا الإجراء.`
                      : `Are you sure you want to delete ${data.elementNumber}? This action cannot be undone.`,
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonText: isRTL ? "حذف" : "Delete",
                    cancelButtonText: isRTL ? "إلغاء" : "Cancel",
                    confirmButtonColor: "#d33",
                  });

                  if (result.isConfirmed) {
                    setIsRefreshing(true);

                    // var convertedAmount = convertAmount(
                    //   Number(data?.totalAmount),
                    //   localStorage.getItem("selectedCurrency") ??
                    //     selectedCurrency,
                    //   (JSON.parse(JSON.parse(data.main)?.currency)?.code ||
                    //     localStorage.getItem("selectedCurrency")) ??
                    //     selectedCurrency,
                    // );

                    var res25 = await updateBankAccounts(
                      bankAccounts.id,
                      Number(bankAccounts.totalAmount) -
                        Number(data?.totalAmount),
                      Number(data?.totalAmount),
                      "Delete Receivables",
                      "Withdraw",
                      bankAccountsMetaData,
                      {
                        issueDate: data.issueDate,
                        customer: JSON.parse(data.main)?.customer,
                        elementNumber: data.elementNumber,
                        currency: JSON.parse(data.main)?.currency,
                      },
                    );

                    var res23 = await commonApi.deleteNoDialog(
                      data.id,
                      data.tableName,
                    );

                    setIsRefreshing(false);
                  }
                } else if (titleLink == "expenses") {
                  const result = await Swal.fire({
                    title: isRTL ? "حذف" : "Delete",
                    text: isRTL
                      ? `هل أنت متأكد من حذف ${data.elementNumber}؟ لا يمكن التراجع عن هذا الإجراء.`
                      : `Are you sure you want to delete ${data.elementNumber}? This action cannot be undone.`,
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonText: isRTL ? "حذف" : "Delete",
                    cancelButtonText: isRTL ? "إلغاء" : "Cancel",
                    confirmButtonColor: "#d33",
                  });

                  if (result.isConfirmed) {
                    setIsRefreshing(true);

                    // var convertedAmount = convertAmount(
                    //   Number(data?.totalAmount),
                    //   localStorage.getItem("selectedCurrency") ??
                    //     selectedCurrency,
                    //   (JSON.parse(JSON.parse(data.main)?.currency)?.code ||
                    //     localStorage.getItem("selectedCurrency")) ??
                    //     selectedCurrency,
                    // );

                    var res25 = await updateBankAccounts(
                      bankAccounts.id,
                      Number(bankAccounts.totalAmount) +
                        Number(data?.totalAmount),
                      Number(data?.totalAmount),
                      "Delete Expenses",
                      "Deposit",
                      bankAccountsMetaData,
                      {
                        issueDate: data.issueDate,
                        customer: JSON.parse(data.main)?.customer,
                        elementNumber: data.elementNumber,
                        currency: JSON.parse(data.main)?.currency,
                      },
                    );

                    var res23 = await commonApi.deleteNoDialog(
                      data.id,
                      data.tableName,
                    );

                    setIsRefreshing(false);
                  }
                } else {
                  commonApi.delete(
                    isRTL ? "حذف" : "Delete",
                    isRTL
                      ? `هل أنت متأكد من حذف ${data.elementNumber}؟ لا يمكن التراجع عن هذا الإجراء.`
                      : `Are you sure you want to delete ${data.elementNumber}? This action cannot be undone.`,
                    data.id,
                    data.tableName,
                    isRTL,
                    setIsRefreshing,
                  );
                }
              }}
              className="w-full flex items-center space-x-2 rtl:space-x-reverse px-3 py-2 text-sm hover:bg-destructive/10 text-destructive rounded-md transition-all duration-200 transform hover:translate-x-1 rtl:hover:-translate-x-1"
            >
              <Trash2 className="w-4 h-4" />
              <span>{isRTL ? "حذف" : "Delete"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
