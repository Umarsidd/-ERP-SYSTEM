import { useCurrency } from "@/contexts/CurrencyContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { calculateAccountsTotals } from "@/lib/accounts_function";
import { loadCostCenters, loadGuide, loadProducts } from "@/lib/api_function";

import { ErrorMessage, Field, FieldArray } from "formik";
import { Minus, Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export function ChooseProductsAccounts(props: {
  totals: any;
  values: any;
  setFieldValue: any;
  setAddQuery: any;
  setIsLoading: any;
  addQuery: any;
  location: any;
  setAddQuery2: any;
  addQuery2: any;
  setIsLoading2: any;
}) {
  const {
    totals,
    values,
    setFieldValue,
    setAddQuery,
    setIsLoading,
    addQuery,
    location,
    setAddQuery2,
    addQuery2,
    setIsLoading2,
  } = props;

  const { isRTL } = useLanguage();
  const navigate = useNavigate();
  const { formatAmount, convertAmount, currentCurrency } = useCurrency();

  const [guide, setGuide] = useState([]);
  const [guideSearch, setGuideSearch] = useState<Record<number, string>>({});
  const [showGuideDropdown, setShowGuideDropdown] = useState<
    Record<number, boolean>
  >({});

  useEffect(() => {
    loadGuide(addQuery2, setIsLoading2, setGuide);
  }, [guideSearch]);

  const [costCenters, setCostCenters] = useState([]);
  const [costCenterSearch, setCostCenterSearch] = useState<
    Record<number, string>
  >({});
  const [showCostCenterDropdown, setShowCostCenterDropdown] = useState<
    Record<number, boolean>
  >({});

  useEffect(() => {
    loadCostCenters(addQuery, setIsLoading, setCostCenters);
  }, [costCenterSearch]);

  return (
    <div
      className="bg-card border border-border rounded-xl p-6 animate-slide-in-up"
      style={{ animationDelay: "200ms" }}
    >
      <h2 className="text-xl font-semibold text-foreground mb-6">
        {isRTL ? "بنود الفاتورة" : "Invoice Items"}
      </h2>
      <FieldArray name="items">
        {({ remove, push }) => (
          <div className="space-y-4">
            {values?.items?.map((item, index) => {
              // const itemTotal = calculateAccountsItemTotal(item);

              // if (
              //   location.state?.action === "CreditNotice" ||
              //   location.state?.action === "return"
              // ) {
              //   var maxQuantity = values.oldItems.filter(
              //     (c) => item.productId === c.productId,
              //   )[0].quantity;
              //   console.log("maxQuantity", maxQuantity);
              // }

              return (
                <div
                  key={index}
                  className="p-4 border border-border rounded-lg animate-scale-in"
                  style={{ animationDelay: `${300 + index * 100}ms` }}
                >
                  <div className="grid grid-cols-1 lg:grid-cols-9 gap-4">
                    {/* Product Selection */}
                    <div className="lg:col-span-2">
                      <label className="text-sm font-medium text-foreground">
                        {isRTL ? "اسم الحساب" : "Account Name"}
                      </label>
                      <div className="relative mt-1">
                        {/* <Package className="absolute ltr:right-3 rtl:left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" /> */}
                        <div className="relative">
                          <input
                            type="text"
                            placeholder={isRTL ? "البحث عن..." : "Search..."}
                            value={guideSearch[index] || item.guideName}
                            onChange={(e) => {
                              setGuideSearch((prev) => ({
                                ...prev,
                                [index]: e.target.value,
                              }));

                              setAddQuery2(e.target.value);
                            }}
                            onFocus={() =>
                              setShowGuideDropdown((prev) => ({
                                ...prev,
                                [index]: true,
                              }))
                            }
                            onBlur={() => {
                              setTimeout(
                                () =>
                                  setShowGuideDropdown((prev) => ({
                                    ...prev,
                                    [index]: false,
                                  })),
                                150,
                              );
                            }}
                            className="w-full pl- rtl:pl- rtl:pr- pr- px-2 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                          />
                          <button
                            type="button"
                            className="absolute right-3 rtl:right-auto rtl:left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                          >
                            <Search className="w-4 h-4" />
                          </button>

                          {showGuideDropdown[index] && (
                            <div className="absolute left-0 right-0 z-10 mt-1 bg-background border border-border rounded-lg max-h-56 overflow-y-auto shadow-lg">
                              {guide.map((product) => (
                                <button
                                  key={product.id}
                                  type="button"
                                  onClick={async () => {
                                    setFieldValue(
                                      `items.${index}.guideId`,
                                      product.id,
                                    );

                                    setFieldValue(
                                      `items.${index}.guideName`,
                                      product.name,
                                    );

                                    setGuideSearch((prev) => ({
                                      ...prev,
                                      [index]: product.name,
                                    }));
                                    setAddQuery2("");
                                    setShowGuideDropdown((prev) => ({
                                      ...prev,
                                      [index]: false,
                                    }));
                                  }}
                                  className="w-full p-3 text-left rtl:text-right hover:bg-muted transition-colors border-b border-border last:border-b-0"
                                >
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <div className="font-medium">
                                        {isRTL ? product.name : product.name}
                                      </div>
                                      {/* <div className="text-sm text-muted-foreground">
                                                  {product.description}
                                                </div> */}
                                    </div>
                                    {/* <div className="text-sm font-medium">
                                      {formatAmount(
                                        convertAmount(
                                          product.totalAmount,
                                          localStorage.getItem("selectedCurrency") ??
                            selectedCurrency,
                                        ),
                                      )}
                                    </div> */}
                                  </div>
                                </button>
                              ))}
                              {guide.length === 0 && (
                                <div className="p-4 text-center text-muted-foreground">
                                  {isRTL ? "لا توجد نتائج" : "No results found"}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <ErrorMessage
                        name={`items.${index}.guideId`}
                        component="div"
                        className="text-destructive text-sm mt-1"
                      />
                    </div>

                    {/* Description */}
                    <div className="lg:col-span-2">
                      <label className="text-sm font-medium text-foreground">
                        {isRTL ? "الوصف" : "Description"}
                      </label>
                      <Field
                        name={`items.${index}.description`}
                        className="w-full mt-1 px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        placeholder={isRTL ? "وصف البند" : "Item description"}
                      />
                      <ErrorMessage
                        name={`items.${index}.description`}
                        component="div"
                        className="text-destructive text-sm mt-1"
                      />
                    </div>

                    {/* Cost Center Selection */}
                    <div className="lg:col-span-2">
                      <label className="text-sm font-medium text-foreground">
                        {isRTL ? "اسم المركز التكلفي" : "Cost Center Name"}
                      </label>
                      <div className="relative mt-1">
                        {/* <Package className="absolute ltr:right-3 rtl:left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" /> */}
                        <div className="relative">
                          <input
                            type="text"
                            placeholder={isRTL ? "البحث عن..." : "Search..."}
                            value={
                              costCenterSearch[index] || item.costCenterName
                            }
                            onChange={(e) => {
                              setCostCenterSearch((prev) => ({
                                ...prev,
                                [index]: e.target.value,
                              }));

                              setAddQuery(e.target.value);
                            }}
                            onFocus={() =>
                              setShowCostCenterDropdown((prev) => ({
                                ...prev,
                                [index]: true,
                              }))
                            }
                            onBlur={() => {
                              setTimeout(
                                () =>
                                  setShowCostCenterDropdown((prev) => ({
                                    ...prev,
                                    [index]: false,
                                  })),
                                150,
                              );
                            }}
                            className="w-full pl- rtl:pl- rtl:pr- pr- px-2 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                          />
                          <button
                            type="button"
                            className="absolute right-3 rtl:right-auto rtl:left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                          >
                            <Search className="w-4 h-4" />
                          </button>

                          {showCostCenterDropdown[index] && (
                            <div className="absolute left-0 right-0 z-10 mt-1 bg-background border border-border rounded-lg max-h-56 overflow-y-auto shadow-lg">
                              {costCenters.map((product) => (
                                <button
                                  key={product.id}
                                  type="button"
                                  onClick={async () => {
                                    setFieldValue(
                                      `items.${index}.costCenterId`,
                                      product.id,
                                    );

                                    setFieldValue(
                                      `items.${index}.costCenterName`,
                                      product.name,
                                    );

                                    setCostCenterSearch((prev) => ({
                                      ...prev,
                                      [index]: product.name,
                                    }));
                                    setAddQuery("");
                                    setShowCostCenterDropdown((prev) => ({
                                      ...prev,
                                      [index]: false,
                                    }));
                                  }}
                                  className="w-full p-3 text-left rtl:text-right hover:bg-muted transition-colors border-b border-border last:border-b-0"
                                >
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <div className="font-medium">
                                        {isRTL ? product.name : product.name}
                                      </div>
                                      {/* <div className="text-sm text-muted-foreground">
                                                  {product.description}
                                                </div> */}
                                    </div>
                                    {/* <div className="text-sm font-medium">
                                      {formatAmount(
                                        convertAmount(
                                          product.totalAmount,
                                          localStorage.getItem("selectedCurrency") ??
                            selectedCurrency,
                                        ),
                                      )}
                                    </div> */}
                                  </div>
                                </button>
                              ))}
                              {costCenters.length === 0 && (
                                <div className="p-4 text-center text-muted-foreground">
                                  {isRTL ? "لا توجد نتائج" : "No results found"}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <ErrorMessage
                        name={`items.${index}.guideId`}
                        component="div"
                        className="text-destructive text-sm mt-1"
                      />
                    </div>

                    {/* Tax Rate */}
                    <div>
                      <label className="text-sm font-medium text-foreground">
                        {isRTL ? "ضريبة %" : "Tax %"}
                      </label>
                      <div className="relative mt-1">
                        {/* <Percent className="absolute ltr:right-3 rtl:left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" /> */}
                        <Field
                          name={`items.${index}.taxRate`}
                          type="number"
                          min="0"
                          max="100"
                          // step="0.01"
                          className="w-full px-2  py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                          onChange={(
                            e: React.ChangeEvent<HTMLInputElement>,
                          ) => {
                            const taxRate = parseFloat(e.target.value) || 0;
                            setFieldValue(`items.${index}.taxRate`, taxRate);
                          }}
                        />
                      </div>
                    </div>

                    {/* Unit Price */}
                    <div>
                      <label className="text-sm font-medium text-foreground">
                        {isRTL ? "مدين" : "Debit"}
                      </label>
                      <div className="relative mt-1">
                        {/* <DollarSign className="absolute ltr:right-3 rtl:left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" /> */}
                        <Field
                          name={`items.${index}.debit`}
                          type="number"
                          min="0"
                          value={item?.debit}
                          //  step="0.01"
                          className="w-full px-2  py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                          onChange={(
                            e: React.ChangeEvent<HTMLInputElement>,
                          ) => {
                            const debit = parseFloat(e.target.value) || 0;
                            setFieldValue(`items.${index}.debit`, debit);
                            setFieldValue(`items.${index}.credit`, 0);

                            // setFieldValue(
                            //   "creditTotal",
                            //   calculateAccountsTotals(values).credit,
                            // );

                            setFieldValue(
                              "debitTotal",
                              calculateAccountsTotals(values).debit,
                            );
                          }}
                        />
                      </div>
                    </div>

                    {/* Unit Price */}
                    <div>
                      <label className="text-sm font-medium text-foreground">
                        {isRTL ? "دائن" : "Credit"}
                      </label>
                      <div className="relative mt-1">
                        {/* <DollarSign className="absolute ltr:right-3 rtl:left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" /> */}
                        <Field
                          name={`items.${index}.credit`}
                          type="number"
                          min="0"
                          value={item.credit}
                          className="w-full px-2  py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                          onChange={(
                            e: React.ChangeEvent<HTMLInputElement>,
                          ) => {
                            const credit = parseFloat(e.target.value) || 0;
                            setFieldValue(`items.${index}.credit`, credit);
                            setFieldValue(`items.${index}.debit`, 0);

                            setFieldValue(
                              "creditTotal",
                              calculateAccountsTotals(values).credit,
                            );

                            // setFieldValue(
                            //   "debitTotal",
                            //   calculateAccountsTotals(values).debit,
                            // );
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="grid lg:grid-cols-3 content- items- justify-self-end mx-6 gap-4">
              {/* Tax Rate */}
              <div>
                <div className="relative mt-1">
                  <div className="items-center justify-center flex lg:w-24 w-48 px- h-10  py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all">
                    <span className="text-center">
                      {isRTL ? "الاجمالي" : "Total"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Unit Price */}
              <div>
                <div className="relative mt-1">
                  <div className="items-start justify-start px-3 flex lg:w-24 px- h-10  py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all">
                    <span className="text-center">
                      {totals?.debit}
                    </span>
                  </div>
                </div>
              </div>

              {/* Unit Price */}
              <div>
                <div className="relative mt-1">
                  <div className="items-start justify-start px-3 flex lg:w-24  px- h-10  py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all">
                    <span className="text-center">
                      {totals?.credit}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                push({
                  costCenterId: "",
                  costCenterName: "",
                  guideId: "",
                  guideName: "",
                  description: "",
                  taxRate: 0,
                  credit: 0,
                  debit: 0,
                  // creditTotal: 0,
                  // debitTotal: 0,
                })
              }
              className="w-full p-4 border-2 border-dashed border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all flex items-center justify-center space-x-2 rtl:space-x-reverse text-muted-foreground hover:text-primary"
            >
              <Plus className="w-5 h-5" />
              <span>{isRTL ? "إضافة بند" : "Add Item"}</span>
            </button>
          </div>
        )}
      </FieldArray>{" "}
    </div>
  );
}
