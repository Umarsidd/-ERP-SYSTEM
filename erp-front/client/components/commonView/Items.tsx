import { motion } from "framer-motion";
import { FileText } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { Separator } from "../ui/separator";
import { useCurrency } from "@/contexts/CurrencyContext";
import { selectedCurrency, selectedSymbol } from "@/data/data";

export function Items(props: { data: any }) {
  const { data } = props;
  const { isRTL } = useLanguage();
  const { formatAmount, convertAmount } = useCurrency();

  return (
    <>
      {/* Items */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {isRTL ? "العناصر والخدمات" : "Items & Services"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Desktop Table View */}
            <div className=" md:block overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-start p-2 font-semibold">
                      {isRTL ? "اسم العنصر" : "Name"}
                    </th>
                    <th className="text-start p-2 font-semibold">
                      {isRTL ? "الكمية" : "Quantity"}
                    </th>

                    <th className="text-start p-2 font-semibold">
                      {isRTL ? "سعر الوحدة" : "Unit Price"}
                    </th>
                    {JSON.parse(data.main).items.some(
                      (item) => item.discount,
                    ) && (
                      <th className="text-start p-2 font-semibold">
                        {isRTL ? "الخصم" : "Discount"}
                      </th>
                    )}

                    {JSON.parse(data.main).items.some(
                      (item) => item.taxRate,
                    ) && (
                      <th className="text-start p-2 font-semibold">
                        {isRTL ? "ضرائب %" : "Tax %"}
                      </th>
                    )}

                    <th className="text-start p-2 font-semibold">
                      {isRTL ? "الإجمالي" : "Total"}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {JSON.parse(data.main).items.map((item, index) => (
                    <tr
                      key={item.id}
                      className={index % 2 === 0 ? "bg-gray-50" : ""}
                    >
                      <td className="p-2">{item.productName}</td>
                      <td className="p-2 text-start">
                        {item.quantity} {item.unitName}
                      </td>
                      <td className="p-2 text-start">
                        {formatAmount(
                          convertAmount(
                            item.unitPrice,
                            localStorage.getItem("selectedCurrency") ??
                              selectedCurrency,
                          ),
                          ((JSON.parse(data.main)?.currency &&
                            JSON.parse(JSON.parse(data.main)?.currency)
                              ?.symbol) ||
                            localStorage.getItem("selectedCurrencySymbol")) ??
                            selectedSymbol,
                        )}
                      </td>
                      {JSON.parse(data.main).items.some((i) => i.discount) && (
                        <td className="p-2 text-start">
                          {item.discount ? `${item.discount}%` : "-"}
                        </td>
                      )}

                      {JSON.parse(data.main).items.some((i) => i.taxRate) && (
                        <td className="p-2 text-start">
                          {item.taxRate ? `${item.taxRate}%` : "-"}
                        </td>
                      )}

                      <td className="p-2 text-start font-semibold">
                        {formatAmount(
                          convertAmount(
                            item.total,
                            localStorage.getItem("selectedCurrency") ??
                              selectedCurrency,
                          ),
                          ((JSON.parse(data.main)?.currency &&
                            JSON.parse(JSON.parse(data.main)?.currency)
                              ?.symbol) ||
                            localStorage.getItem("selectedCurrencySymbol")) ??
                            selectedSymbol,
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            {/* <div className="block md:hidden space-y-3">
              {JSON.parse(quotation.main).items.map((item, index) => (
                <div
                  key={item.id}
                  className="border border-border rounded-lg p-3 bg-muted/20"
                >
                  <div className="space-y-2">
                    <div className="font-medium text-sm">
                      {isRTL ? "الوصف:" : "Description:"}
                    </div>
                    <div className="text-sm">{item.description}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">
                        {isRTL ? "الكمية" : "Quantity"}
                      </div>
                      <div className="font-medium text-sm">{item.quantity}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">
                        {isRTL ? "سعر الوحدة" : "Unit Price"}
                      </div>
                      <div className="font-medium text-sm">
                        {item.unitPrice.toFixed(2)}
                      </div>
                    </div>
                    {item.discount ? (
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">
                          {isRTL ? "الخصم" : "Discount"}
                        </div>
                        <div className="font-medium text-sm text-green-600">
                          {item.discount}%
                        </div>
                      </div>
                    ) : (
                      <></>
                    )}
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">
                        {isRTL ? "الإجمالي" : "Total"}
                      </div>
                      <div className="font-semibold text-sm">
                        {item.total.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div> */}

            <Separator className="my-4" />

            <div className="flex justify-end">
              <div className="w-full sm:w-64 space-y-2">
                {JSON.parse(data.main)?.amount?.subtotal > 0 && (
                  <div className="flex justify-between text-sm sm:text-base">
                    <span>{isRTL ? "المجموع الفرعي:" : "Subtotal:"}</span>
                    <span className="font-medium">
                      {formatAmount(
                        convertAmount(
                          JSON.parse(data.main)?.amount?.subtotal,
                          localStorage.getItem("selectedCurrency") ??
                            selectedCurrency,
                        ),
                        ((JSON.parse(data.main)?.currency &&
                          JSON.parse(JSON.parse(data?.main)?.currency)
                            ?.symbol) ||
                          localStorage.getItem("selectedCurrencySymbol")) ??
                          selectedSymbol,
                      )}
                    </span>
                  </div>
                )}

                {JSON.parse(data.main)?.amount?.totalTax > 0 && (
                  <div className="flex justify-between text-sm sm:text-base">
                    <span>{isRTL ? "الضريبة:" : "Tax:"}</span>
                    <span>
                      {formatAmount(
                        convertAmount(
                          JSON.parse(data.main)?.amount?.totalTax,
                          localStorage.getItem("selectedCurrency") ??
                            selectedCurrency,
                        ),
                        ((JSON.parse(data.main)?.currency &&
                          JSON.parse(JSON.parse(data.main)?.currency)
                            ?.symbol) ||
                          localStorage.getItem("selectedCurrencySymbol")) ??
                          selectedSymbol,
                      )}
                    </span>
                  </div>
                )}

                {JSON.parse(data.main)?.amount?.totalItemDiscounts > 0 && (
                  <div className="flex justify-between text-red-600 text-sm sm:text-base">
                    <span>{isRTL ? "خصومات البنود:" : "Item Discounts:"}</span>
                    <span className="font-medium">
                      -
                      {formatAmount(
                        convertAmount(
                          JSON.parse(data.main)?.amount?.totalItemDiscounts,
                          localStorage.getItem("selectedCurrency") ??
                            selectedCurrency,
                        ),
                        ((JSON.parse(data.main)?.currency &&
                          JSON.parse(JSON.parse(data.main)?.currency)
                            ?.symbol) ||
                          localStorage.getItem("selectedCurrencySymbol")) ??
                          selectedSymbol,
                      )}
                    </span>
                  </div>
                )}

                {JSON.parse(data.main)?.amount?.discount > 0 && (
                  <div className="flex justify-between text-red-600 text-sm sm:text-base">
                    <span>{isRTL ? "خصم الفاتورة:" : "Invoice Discount:"}</span>
                    <span className="font-medium">
                      -
                      {formatAmount(
                        convertAmount(
                          JSON.parse(data.main)?.amount?.discount,
                          localStorage.getItem("selectedCurrency") ??
                            selectedCurrency,
                        ),
                        ((JSON.parse(data.main)?.currency &&
                          JSON.parse(JSON.parse(data.main)?.currency)
                            ?.symbol) ||
                          localStorage.getItem("selectedCurrencySymbol")) ??
                          selectedSymbol,
                      )}
                    </span>
                  </div>
                )}

                {JSON.parse(data.main)?.shippingCost > 0 && (
                  <div className="flex justify-between text-sm sm:text-base ">
                    <span>{isRTL ? "الشحن:" : "Shipping:"}</span>
                    <span className="font-medium">
                      {formatAmount(
                        convertAmount(
                          JSON.parse(data.main)?.shippingCost,
                          localStorage.getItem("selectedCurrency") ??
                            selectedCurrency,
                        ),
                        ((JSON.parse(data.main)?.currency &&
                          JSON.parse(JSON.parse(data.main)?.currency)
                            ?.symbol) ||
                          localStorage.getItem("selectedCurrencySymbol")) ??
                          selectedSymbol,
                      )}
                    </span>
                  </div>
                )}

                <div className="flex justify-between font-bold text-base sm:text-lg border-t pt-2">
                  <span>{isRTL ? "الإجمالي:" : "Total:"}</span>
                  <span>
                    {formatAmount(
                      convertAmount(
                        data.totalAmount ?? 0,
                        localStorage.getItem("selectedCurrency") ??
                          selectedCurrency,
                      ),
                      ((JSON.parse(data.main)?.currency &&
                        JSON.parse(JSON.parse(data.main)?.currency)?.symbol) ||
                        localStorage.getItem("selectedCurrencySymbol")) ??
                        selectedSymbol,
                    )}
                  </span>
                </div>

                {JSON.parse(data.main)?.depositAmount > 0 && (
                  <>
                    <div className="flex justify-between text-gray-600 text-sm">
                      <span>{isRTL ? "المبلغ المدفوع:" : "Deposit:"}</span>
                      <span className="font-medium">
                        -
                        {formatAmount(
                          convertAmount(
                            JSON.parse(data.main)?.depositAmount,
                            localStorage.getItem("selectedCurrency") ??
                              selectedCurrency,
                          ),
                          ((JSON.parse(data.main)?.currency &&
                            JSON.parse(JSON.parse(data.main)?.currency)
                              ?.symbol) ||
                            localStorage.getItem("selectedCurrencySymbol")) ??
                            selectedSymbol,
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-green-600">
                      <span>{isRTL ? "المبلغ المتبقي:" : "Amount Due:"}</span>
                      <span>
                        {formatAmount(
                          convertAmount(
                            JSON.parse(data.main)?.amount.total -
                              JSON.parse(data.main)?.depositAmount,
                            localStorage.getItem("selectedCurrency") ??
                              selectedCurrency,
                          ),
                          ((JSON.parse(data.main)?.currency &&
                            JSON.parse(JSON.parse(data.main)?.currency)
                              ?.symbol) ||
                            localStorage.getItem("selectedCurrencySymbol")) ??
                            selectedSymbol,
                        )}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
}
