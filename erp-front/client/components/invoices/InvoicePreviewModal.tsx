import { useLanguage } from "@/contexts/LanguageContext";
import ReliableRichTextEditor from "../editor/ReliableRichTextEditor";
import { Paperclip, Upload, X } from "lucide-react";
import { UnifiedInvoiceTemplate } from "../template/InvoiceTemplate";
import { calculateTotals } from "@/lib/products_function";
import { selectedCurrency, selectedSymbol } from "@/data/data";




export function InvoicePreviewModal(props: {
  values: any;
  setShowPreview: any;

}) {
  const { values, setShowPreview} =
    props;

  const { isRTL } = useLanguage();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-800">
            {isRTL ? "معاينة الفاتورة" : "Invoice Preview"}
          </h2>
          <button
            onClick={() => setShowPreview(false)}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Invoice Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          <UnifiedInvoiceTemplate
            invoice={{
              saleOrPurchase: "sales",

              elementNumber: values.elementNumber,
              customer: values.customer || {
                name: isRTL ? "عميل غير محدد" : "Customer Not Selected",
                nameAr: "عميل غير محدد",
                email: "",
                phone: "",
                address: "",
                addressAr: "",
                taxNumber: "",
              },
              salesRep: values.salesRep,
              paymentTerm: values.paymentTerm,
              amount: calculateTotals(values).total,
              status: values.status,
              issueDate: values.issueDate,
              dueDate: values.dueDate,
              items:
                values.items.length > 0
                  ? values.items
                  : [
                      {
                        description: isRTL
                          ? "بند تجريبي للمعاينة"
                          : "Sample item for preview",
                        quantity: 1,
                        unitPrice: 100,
                        taxRate: 0,
                      },
                    ],
              notes: values.notes,
              //   notesAr: values.notesAr,
              //   terms: values.terms,
              //  termsAr: values.termsAr,
              discountType: values.discountType,
              discountValue: values.discountValue,
              shippingCost: values.shippingCost,
              shippingAddress: values.shippingAddress,
              shippingAddressAr: values.shippingAddressAr,
              shippingMethod: values.shippingMethod,
              depositAmount: values.depositAmount,
              depositPaid: values.depositPaid,

              remainAmount: 0,
              raisedAmount: 0,
              paidAmount: 0,
              numberOfPayments: 0,
              returnAmount: 0,
              returnOnlyAmount: 0,

              attachments: values.attachments || [],

              stockStatus: values.stockStatus,

              paymentMethod: values.paymentMethod,
              fields: values.fields || [],
              currency:values.currency || JSON.stringify({
                code:
                  localStorage.getItem("selectedCurrency") ?? selectedCurrency,
                symbol:
                  localStorage.getItem("selectedCurrencySymbol") ??
                  selectedSymbol,
              }),
            }}
            isRTL={isRTL}
            mode="preview"
          />
        </div>
      </div>
    </div>
  );
};