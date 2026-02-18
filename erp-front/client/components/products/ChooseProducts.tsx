import { useCurrency } from "@/contexts/CurrencyContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { loadProducts, loadWarehouse } from "@/lib/api_function";
import { ErrorMessage, Field, FieldArray } from "formik";
import { Minus, Plus, Search, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { Button } from "../ui/button";
import LightweightDialog, {
  LightweightDialogContent,
  LightweightDialogHeader,
} from "../ui/lightweight-dialog";
import { AddProducts } from "./AddProducts";
import { useSetting } from "@/contexts/SettingContext";
import {
  calculateItemTotal,
  handleProductSelect,
} from "@/lib/products_function";
import { selectedCurrency } from "@/data/data";
import { getPriceFromPriceList, handlePriceListProductSelect } from "@/lib/price_list_function";

export function ChooseProducts(props: {
  values: any;
  setFieldValue: any;
  setAddQuery: any;
  setIsLoading: any;
  addQuery: any;
  location: any;
  isPurchase?: boolean;
  productSearch?;
  setProductSearch?;
  warehousesSearch?;
  setWarehousesSearch?;
  priceLists?: any[];
}) {
  const {
    values,
    setFieldValue,
    setAddQuery,
    setIsLoading,
    addQuery,
    location,
    isPurchase = false,
    productSearch,
    setProductSearch,
    warehousesSearch,
    setWarehousesSearch,
    priceLists = [],
  } = props;

  const { isRTL } = useLanguage();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);

  const { formatAmount, convertAmount } = useCurrency();

  const { settings, refreshSettings } = useSetting();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showProductDropdown, setShowProductDropdown] = useState<
    Record<number, boolean>
  >({});

  const [warehouses, setWarehouses] = useState([]);
  const [showwarehousesModal, setShowwarehousesModal] = useState(false);
  const [showwarehousesDropdown, setShowwarehousesDropdown] = useState<
    Record<number, boolean>
  >({});

  useEffect(() => {
    loadProducts(addQuery, setIsLoading, setProducts);
  }, [productSearch]);

  useEffect(() => {
    loadWarehouse(setWarehouses);
  }, [warehousesSearch]);

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
            {values.items.map((item, index) => {
              const itemTotal = calculateItemTotal(item);

              if (
                location.state?.action === "CreditNotice" ||
                location.state?.action === "return"
              ) {
                var maxQuantity = values?.oldItems?.filter(
                  (c) => item?.productId === c.productId,
                )[0]?.quantity;
                console.log("maxQuantity", maxQuantity);
              }

              return (
                <div
                  key={index}
                  className="p-4 border border-border rounded-lg animate-scale-in"
                  style={{ animationDelay: `${300 + index * 100}ms` }}
                >
                  <div className="flex flex-col lg:flex-row gap-2 items-end">
                    {/* Product Selection */}
                    <div className="flex-1 min-w-[150px]">
                      <label className="text-sm font-medium text-foreground">
                        {isRTL ? "المنتج" : "Product"}
                      </label>
                      <div className="relative mt-1">
                        {/* <Package className="absolute ltr:right-3 rtl:left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" /> */}
                        <div className="relative">
                          <input
                            type="text"
                            placeholder={
                              isRTL ? "البحث عن منتج..." : "Search product..."
                            }
                            value={productSearch[index] || item.productName}
                            onChange={(e) => {
                              setProductSearch((prev) => ({
                                ...prev,
                                [index]: e.target.value,
                              }));

                              setAddQuery(e.target.value);
                            }}
                            onFocus={() =>
                              setShowProductDropdown((prev) => ({
                                ...prev,
                                [index]: true,
                              }))
                            }
                            onBlur={() => {
                              setTimeout(
                                () =>
                                  setShowProductDropdown((prev) => ({
                                    ...prev,
                                    [index]: false,
                                  })),
                                150,
                              );
                            }}
                            className="w-full pl- rtl:pl- rtl:pr- pr- px-2 py-2 bg-primary-50  border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                          />
                          <button
                            type="button"
                            // onClick={() =>
                            // setProductSearch((prev) => ({
                            //   ...prev,
                            //   [index]: "",
                            // }))
                            // }
                            className="absolute right-3 rtl:right-auto rtl:left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                          >
                            <Search className="w-4 h-4" />
                          </button>

                          {showProductDropdown[index] && (
                            <div className="absolute left-0 right-0 z-50 mt-1 bg-background border border-border rounded-lg max-h-56 overflow-y-auto shadow-lg">
                              {products.map((product) => (
                                <button
                                  key={product.id}
                                  type="button"
                                  onClick={async () => {
                                    //   var existing = [];
                                    var oldExisting = [];
                                    // existing = values.items.filter(
                                    //   (c) => c.productId == product.id,
                                    // );
                                    ///  console.log("existing", existing);

                                    if (
                                      //    existing.length <= 0 &&
                                      product.stockQuantity > 0 ||
                                      isPurchase ||
                                      (settings &&
                                        settings?.allowNegativeInventory)
                                    ) {
                                      if (
                                        location.state?.action ===
                                        "CreditNotice" ||
                                        location.state?.action === "return"
                                      ) {
                                        oldExisting = values.oldItems.filter(
                                          (c) => c.productId === product.id,
                                        );

                                        console.log("oldExisting", oldExisting);

                                        if (oldExisting.length > 0) {
                                          handleProductSelect(
                                            product,
                                            index,
                                            setFieldValue,
                                            isPurchase,
                                            convertAmount,
                                            JSON.parse(values.currency).code,
                                          );
                                          setProductSearch((prev) => ({
                                            ...prev,
                                            [index]: product.elementNumber,
                                          }));
                                          setAddQuery("");
                                          setShowProductDropdown((prev) => ({
                                            ...prev,
                                            [index]: false,
                                          }));

                                          // Auto-add new row if this is the last row
                                          if (
                                            index ===
                                            values.items.length - 1
                                          ) {
                                            push({
                                              productId: "",
                                              productName: "",
                                              stockQuantity: 0,
                                              oldQuantity: 0,
                                              description: "",
                                              quantity: 1,
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
                                            });
                                          }

                                          // if (
                                          //   values.items[values.items.length - 1]
                                          //     .productId !== ""
                                          // ) {
                                          //   push({
                                          //     productId: "",
                                          //     productName: "",
                                          //     stockQuantity: 0,
                                          //     oldQuantity: 0,
                                          //     description: "",
                                          //     quantity: 1,
                                          //     unitPrice: 0,
                                          //     discount: 0,
                                          //     discountType: "percentage",
                                          //     taxRate: 0,
                                          //     total: 0,
                                          //   });
                                          // }
                                        } else {
                                          if (oldExisting.length <= 0) {
                                            await Swal.fire({
                                              icon: "error",
                                              title: isRTL ? "" : "",
                                              text: isRTL
                                                ? "لا يمكن إضافة منتجات جديدة"
                                                : "Cannot add new products",

                                              confirmButtonText: isRTL
                                                ? "حسناً"
                                                : "OK",
                                            });
                                          }
                                        }
                                      } else {
                                        handleProductSelect(
                                          product,
                                          index,
                                          setFieldValue,
                                          isPurchase,
                                          convertAmount,
                                          JSON.parse(values.currency).code,
                                        );
                                        setProductSearch((prev) => ({
                                          ...prev,
                                          [index]: product.elementNumber,
                                        }));
                                        setAddQuery("");
                                        setShowProductDropdown((prev) => ({
                                          ...prev,
                                          [index]: false,
                                        }));

                                        // Apply price list price if selected
                                        if (
                                          values.priceListId &&
                                          priceLists &&
                                          priceLists.length > 0
                                        ) {
                                          const selectedPriceList =
                                            priceLists.find(
                                              (pl) =>
                                                pl.id === values.priceListId,
                                            );

                                          if (selectedPriceList) {
                                            const priceListItems =
                                              JSON.parse(
                                                selectedPriceList.items || "{}",
                                              ).items || [];
                                            const priceListPrice =
                                              getPriceFromPriceList(
                                                product.id,
                                                priceListItems,
                                                isPurchase,
                                              );

                                            if (priceListPrice !== null) {
                                              // Use handlePriceListProductSelect which mirrors
                                              // handleProductSelect with proper unit math,
                                              // convertAmount, and dual pricing
                                              handlePriceListProductSelect(
                                                product,
                                                index,
                                                setFieldValue,
                                                isPurchase,
                                                convertAmount,
                                                JSON.parse(values.currency).code,
                                                priceListPrice,
                                                null,
                                                values.priceListId,
                                              );
                                            }
                                          }
                                        }

                                        // Auto-add new row if this is the last row
                                        if (index === values.items.length - 1) {
                                          push({
                                            productId: "",
                                            productName: "",
                                            stockQuantity: 0,
                                            oldQuantity: 0,
                                            description: "",
                                            quantity: 1,
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
                                          });
                                        }
                                      }
                                    } else {
                                      // if (existing.length > 0) {
                                      //   await Swal.fire({
                                      //     icon: "error",
                                      //     title: isRTL ? "" : "",
                                      //     text: isRTL
                                      //       ? "العنصر موجود بالفعل"
                                      //       : "Item already exists",

                                      //     confirmButtonText: isRTL
                                      //       ? "حسناً"
                                      //       : "OK",
                                      //   });
                                      // } else {
                                      await Swal.fire({
                                        icon: "error",
                                        title: isRTL ? "" : "",
                                        text: isRTL
                                          ? "العنصر غير متوفر في المخزون"
                                          : "Item not available in stock",

                                        confirmButtonText: isRTL
                                          ? "حسناً"
                                          : "OK",
                                      });
                                      // }
                                    }
                                    console.log(item);
                                  }}
                                  className="w-full p-3 text-left rtl:text-right hover:bg-muted transition-colors border-b border-border last:border-b-0"
                                >
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <div className="font-medium">
                                        {isRTL
                                          ? product.elementNumber
                                          : product.elementNumber}
                                      </div>
                                      {/* <div className="text-sm text-muted-foreground">
                                                  {product.description}
                                                </div> */}
                                    </div>
                                    <div className="text-sm font-medium">
                                      {formatAmount(
                                        convertAmount(
                                          isPurchase
                                            ? JSON.parse(product.main)
                                              ?.purchasePrice
                                            : product.totalAmount,
                                          JSON.parse(values.currency).code,
                                        ),
                                        JSON.parse(values.currency).symbol,
                                      )}
                                    </div>
                                  </div>
                                </button>
                              ))}
                              {products.length === 0 && (
                                <div className="p-4 text-center text-muted-foreground">
                                  {isRTL ? "لا توجد نتائج" : "No results found"}
                                </div>
                              )}

                              <div className="flex items-center justify-center p-2 border-t border-border hover:bg-muted/50 cursor-pointer text-primary font-medium">
                                {" "}
                                <span
                                  onClick={() => setShowAddModal(true)}
                                  className="text-center cursor-pointer"
                                >
                                  {isRTL ? "إضافة عنصر" : "Add Item"}
                                </span>{" "}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <ErrorMessage
                        name={`items.${index}.productId`}
                        component="div"
                        className="text-destructive text-sm mt-1"
                      />
                    </div>

                    {/* Description */}
                    {/* <div className="lg:col-span-2">
                                <label className="text-sm font-medium text-foreground">
                                  {isRTL ? "الوصف" : "Description"}
                                </label>
                                <Field
                                  name={`items.${index}.description`}
                                  className="w-full mt-1 px-4 py-2 bg-primary-50  border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                  placeholder={
                                    isRTL ? "وصف البند" : "Item description"
                                  }
                                />
                                <ErrorMessage
                                  name={`items.${index}.description`}
                                  component="div"
                                  className="text-destructive text-sm mt-1"
                                />
                              </div> */}

                    {values.isWareHouse && (
                      <div className="w-[150px]">
                        <label className="text-sm font-medium text-foreground">
                          {isRTL ? " المستودع" : "Warehouse"}
                        </label>
                        <div className="relative mt-1">
                          {/* <Package className="absolute ltr:right-3 rtl:left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" /> */}
                          <div className="relative">
                            <input
                              type="text"
                              placeholder={
                                isRTL ? "بحث عن مستودع" : "Search warehouse..."
                              }
                              value={warehousesSearch[index] || item.warehouses}
                              onChange={(e) => {
                                setWarehousesSearch((prev) => ({
                                  ...prev,
                                  [index]: e.target.value,
                                }));

                                setAddQuery(e.target.value);
                              }}
                              onFocus={() =>
                                setShowwarehousesDropdown((prev) => ({
                                  ...prev,
                                  [index]: true,
                                }))
                              }
                              onBlur={() => {
                                setTimeout(
                                  () =>
                                    setShowwarehousesDropdown((prev) => ({
                                      ...prev,
                                      [index]: false,
                                    })),
                                  150,
                                );
                              }}
                              className="w-full pl- rtl:pl- rtl:pr- pr- px-2 py-2 bg-primary-50  border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                            />

                            {showwarehousesDropdown[index] && (
                              <div className="absolute left-0 right-0 z-10 mt-1 bg-background border border-border rounded-lg max-h-56 overflow-y-auto shadow-lg">
                                {warehouses.map((warehouse) => (
                                  <button
                                    key={warehouse.id}
                                    type="button"
                                    onClick={async () => {
                                      setFieldValue(
                                        `items.${index}.warehouses`,
                                        warehouse.elementNumber,
                                      );
                                      setWarehousesSearch((prev) => ({
                                        ...prev,
                                        [index]: warehouse.elementNumber,
                                      }));
                                      setAddQuery("");
                                      setShowwarehousesDropdown((prev) => ({
                                        ...prev,
                                        [index]: false,
                                      }));
                                    }}
                                    className="w-full p-3 text-left rtl:text-right hover:bg-muted transition-colors border-b border-border last:border-b-0"
                                  >
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <div className="font-medium">
                                          {isRTL
                                            ? warehouse.elementNumber
                                            : warehouse.elementNumber}
                                        </div>
                                        {/* <div className="text-sm text-muted-foreground">
                                                  {product.description}
                                                </div> */}
                                      </div>
                                    </div>
                                  </button>
                                ))}
                                {warehouses.length === 0 && (
                                  <div className="p-4 text-center text-muted-foreground">
                                    {isRTL
                                      ? "لا توجد نتائج"
                                      : "No results found"}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <ErrorMessage
                          name={`items.${index}.warehouses`}
                          component="div"
                          className="text-destructive text-sm mt-1"
                        />
                      </div>
                    )}

                    {/* Quantity */}
                    <div className="w-[80px]">
                      <label className="text-sm font-medium text-foreground">
                        {isRTL ? "الكمية" : "Qty"}
                      </label>
                      <Field
                        name={`items.${index}.quantity`}
                        type="number"
                        min="0"
                        max={
                          !isPurchase &&
                            settings &&
                            settings?.allowNegativeInventory === false
                            ? (maxQuantity ?? item.oldQuantity)
                            : undefined
                        }
                        // step="0.01"
                        className="w-full h-[42px] mt-1 px-4 py-2 bg-primary-50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          const quantity = parseFloat(e.target.value) || 0;
                          setFieldValue(`items.${index}.quantity`, quantity);
                          setFieldValue(
                            `items.${index}.total`,
                            calculateItemTotal({ ...item, quantity }),
                          );

                          setFieldValue(
                            `items.${index}.stockQuantity`,
                            isPurchase
                              ? item.oldQuantity + quantity
                              : item.oldQuantity - quantity,
                          );
                          // console.log(item);
                          //   console.log(item);
                          //err
                          //لازم تخلي القيمه من البدايه
                        }}
                      />
                    </div>
                    {item?.unitList?.length > 0 && (
                      <div className="w-[100px]">
                        <label>{isRTL ? "الوحدة" : "Unit"}</label>
                        <Field
                          as="select"
                          name={`items.${index}.unit`}
                          className="w-full h-[42px] mt-1 px-2 flex items-center bg-primary-50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                          onChange={(
                            e: React.ChangeEvent<HTMLInputElement>,
                          ) => {
                            setFieldValue(
                              `items.${index}.unit`,
                              e.target.value,
                            );

                            item?.unitList?.filter((r) => {
                              if (
                                r.value.toString() === e.target.value.toString()
                              ) {
                                var unitName = r.unitName;
                                setFieldValue(
                                  `items.${index}.unitName`,
                                  unitName,
                                );
                              }
                            });

                            var unitPrice =
                              parseFloat(item?.originalUnitPrice) *
                              parseFloat(e.target.value);

                            setFieldValue(
                              `items.${index}.unitPrice`,
                              unitPrice,
                            );
                            setFieldValue(
                              `items.${index}.total`,
                              calculateItemTotal({
                                ...item,
                                unitPrice,
                              }),
                            );

                            console.log(item);
                          }}
                        >
                          {item?.unitList?.map((c) => (
                            <option key={c.unitName} value={c.value}>
                              {isRTL ? `${c.unitName}` : `${c.unitName}`}
                            </option>
                          ))}
                        </Field>
                      </div>
                    )}

                    {/* Unit Price */}
                    <div className="w-[110px]">
                      <label className="text-sm font-medium text-foreground">
                        {isRTL ? "السعر" : "Price"}
                      </label>
                      <div className="relative mt-1">
                        {/* <DollarSign className="absolute ltr:right-3 rtl:left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" /> */}
                        <Field
                          name={`items.${index}.unitPrice`}
                          type="number"
                          min="0"
                          value={item.unitPrice?.toFixed(0)}
                          //  step="0.01"
                          className="w-full h-[42px] px-2 py-2 bg-primary-50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                          onChange={(
                            e: React.ChangeEvent<HTMLInputElement>,
                          ) => {
                            const unitPrice = parseFloat(e.target.value) || 0;
                            setFieldValue(
                              `items.${index}.unitPrice`,
                              unitPrice,
                            );
                            setFieldValue(
                              `items.${index}.total`,
                              calculateItemTotal({
                                ...item,
                                unitPrice,
                              }),
                            );
                          }}
                        />
                      </div>
                    </div>

                    {/* Discount */}
                    {!settings?.hideDiscount && (
                      <div className="w-[220px]">
                        <label className="text-sm font-medium text-foreground">
                          {isRTL ? "خصم" : "Discount"}
                        </label>
                        <div className="flex mt-1 space-x-1 rtl:space-x-reverse">
                          <div className="relative flex-1">
                            <Field
                              name={`items.${index}.discount`}
                              type="number"
                              min="0"
                              className="w-full h-[42px] px-2 py-2 bg-primary-50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                              onChange={(
                                e: React.ChangeEvent<HTMLInputElement>,
                              ) => {
                                const discount =
                                  parseFloat(e.target.value) || 0;
                                setFieldValue(
                                  `items.${index}.discount`,
                                  discount,
                                );
                                setFieldValue(
                                  `items.${index}.total`,
                                  calculateItemTotal({
                                    ...item,
                                    discount,
                                  }),
                                );
                              }}
                            />
                          </div>
                          <Field
                            as="select"
                            name={`items.${index}.discountType`}
                            className="h-[42px] w-auto min-w-[140px] px-2 flex items-center bg-primary-50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                            onChange={(
                              e: React.ChangeEvent<HTMLSelectElement>,
                            ) => {
                              setFieldValue(
                                `items.${index}.discountType`,
                                e.target.value,
                              );
                              setFieldValue(
                                `items.${index}.total`,
                                calculateItemTotal({
                                  ...item,
                                  discountType: e.target.value as
                                    | "percentage"
                                    | "fixed",
                                }),
                              );
                            }}
                          >
                            <option value="percentage">
                              {isRTL ? "نسبة مئوية (%)" : "Percentage (%)"}
                            </option>
                            <option value="fixed">
                              {isRTL ? "مبلغ ثابت" : "Fixed Amount"}
                            </option>
                          </Field>
                        </div>
                      </div>
                    )}

                    {/* Tax Rate */}
                    {!settings?.hideTax && (
                      <div className="w-[80px]">
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
                            className="w-full px-2  py-2 bg-primary-50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>,
                            ) => {
                              const taxRate = parseFloat(e.target.value) || 0;
                              setFieldValue(`items.${index}.taxRate`, taxRate);
                              setFieldValue(
                                `items.${index}.total`,
                                calculateItemTotal({
                                  ...item,
                                  taxRate,
                                }),
                              );
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Total and Actions */}
                    <div className="flex items-center gap-2">
                      <div className="w-[120px]">
                        <label className="text-sm font-medium text-foreground">
                          {isRTL ? "الإجمالي" : "Total"}
                        </label>
                        <div className="w-full mt-1 px-2 py-2 bg-primary-50 border border-border rounded-lg text-sm font-medium flex items-center h-[42px]">
                          {formatAmount(
                            convertAmount(
                              itemTotal,
                              localStorage.getItem("selectedCurrency") ??
                              selectedCurrency,
                            ),
                            JSON.parse(values.currency).symbol,
                          )}
                        </div>
                      </div>
                      {values.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="px-2 mt-6 h-[42px] flex items-center justify-center text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-6 h-6" />
                        </button>
                      )}
                      {values.items.length === 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            remove(index);
                            // Add a new empty row to replace the deleted one
                            push({
                              productId: "",
                              productName: "",
                              stockQuantity: 0,
                              oldQuantity: 0,
                              description: "",
                              quantity: 1,
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
                            });
                          }}
                          className="px-2 mt-6 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-6 h-6" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            <button
              type="button"
              onClick={() =>
                push({
                  productId: "",
                  productName: "",
                  stockQuantity: 0,
                  oldQuantity: 0,
                  description: "",
                  quantity: 1,
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
      <LightweightDialog open={showAddModal} onOpenChange={setShowAddModal}>
        <LightweightDialogContent className="sm:w-[900px] sm:h-[77vh]">
          <div className="flex items-center justify-between mb-">
            <h3 className="text-lg font-semibold">
              {isRTL ? "إضافة عنصر" : "Add Item"}
            </h3>
            <div className="flex items-center  gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowAddModal(false);
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <LightweightDialogHeader>
            <></>
          </LightweightDialogHeader>

          <>
            <AddProducts isDialog={true} setShowAddModal={setShowAddModal} />
          </>
        </LightweightDialogContent>
      </LightweightDialog>
    </div>
  );
}
