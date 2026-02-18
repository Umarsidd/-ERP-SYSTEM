import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Formik, Form, ErrorMessage, Field } from "formik";
import * as Yup from "yup";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { BackButton } from "@/components/common/BackButton";

import { useLanguage } from "@/contexts/LanguageContext";
import Swal from "sweetalert2";
import { commonApi } from "@/lib/api";
import { Paperclip, Send, Upload, Warehouse, X, RefreshCw } from "lucide-react";
import { productStatuses, productUnits } from "@/data/data";
import { MainButtons } from "@/components/common/MainButtons";
import {
  generateNumber,
  handleFileUpload,
  removeAttachment,
  generateBarcode,
} from "@/lib/products_function";
import { useSetting } from "@/contexts/SettingContext";
import CryptoJS from "crypto-js";

export function AddProducts(props: {
  isDialog: boolean;
  setShowAddModal: any;
}) {
  const { isDialog, setShowAddModal } = props;
  const { settings, refreshSettings, isLoading } = useSetting();

  const [conversionUnitList, setConversionUnitList] = useState([
    {
      unitName: "اختر معامل التحويل",
      value: "choose ",
    },
  ]);

  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { isRTL } = useLanguage();
  const location = useLocation();
  const [serverImages, setServerImages] = useState(
    location.state?.action == "edit"
      ? (JSON.parse(location?.state?.newData?.attachments)?.images ?? [])
      : [],
  );

  useEffect(() => {
    if (location.state?.action == "edit") {
      settings?.unitTemplates.filter((r) => {
        if (r.id === JSON.parse(location?.state?.newData?.main)?.unitVal) {
          var x = r.conversions;
          setConversionUnitList(x);

          setConversionUnitList((prev) => {
            if (prev.some((x) => x.value === "1")) return prev;
            return [
              ...prev,
              {
                unitName: r.baseUnit,
                value: "1",
              },
              ,
            ]; // prepend
          });
        }
      });
    }
  }, []);

  const brands = settings?.brands || [];
  const categories = settings?.categories || [];


  const [initialValues, setInitialValues] = useState({
    sku: generateNumber("SKU"),
    name: "",
    description: "",
    brandId: "",
    categoryId: "",
    //category: "",
    barcode: "",
    unit: "",
    unitSell: "",
    unitBuy: "",
    unitList: [],
    unitVal: "",
    unitSellVal: "",
    unitBuyVal: "",
    currency: "IQD",
    purchasePrice: "",
    sellingPrice: "",
    stockQuantity: 0,
    //reorderPoint: "",
    //warehouse: "",
    lowStockThreshold: 0,
    minSellingPrice: 0,
    attachments: [],
    discount: 0,
    profitMargin: 0,
    status: "Active",
    discountType: "percentage",
    warehouses: [{ warehouseName: "main", warehouseId: "1", quantity: 0 }],
  });

  const schema = Yup.object().shape({
    name: Yup.string().required(isRTL ? "مطلوب" : "Required"),
    sku: Yup.string().required(isRTL ? "مطلوب" : "Required"),
    // barcode: Yup.string().required(isRTL ? "مطلوب" : "Required"),
    unit: Yup.string()
      .min(1)
      .required(isRTL ? "مطلوب" : "Required"),
    currency: Yup.string().required(isRTL ? "مطلوب" : "Required"),
    purchasePrice: Yup.string().required(isRTL ? "مطلوب" : "Required"),
    sellingPrice: Yup.string().required(isRTL ? "مطلوب" : "Required"),
    stockQuantity: Yup.string().required(isRTL ? "مطلوب" : "Required"),
    minSellingPrice: Yup.string().required(isRTL ? "مطلوب" : "Required"),
  });

  const handleSubmit = async (values: any) => {
    setIsSubmitting(true);
    try {
      var res = await commonApi.upload(values.attachments);
      console.log("attachments", res);
      if (res.result === false) {
        await Swal.fire({
          icon: "error",
          title: isRTL ? "خطأ" : "Error",
          text:
            //     res.error.message ||
            isRTL
              ? "صيغة المرفق غير مدعومة او حجمة كبير جدا"
              : "Attachment format is not supported or its size is too large",
          confirmButtonText: isRTL ? "حسناً" : "OK",
        });
      } else {
        const submitData = {
          ...values,
          attachments: [],
        };

        if (location.state?.action == "edit") {
          await commonApi.update(
            location.state?.newData.id,
            {
              updatedAt: new Date().toISOString(),
              issueDate: submitData.issueDate,
              main: JSON.stringify({
                ...submitData,
                // warehouses: submitData.warehouses.map((w) => ({
                //   warehouseName: w.warehouseName,
                //   warehouseId: w.warehouseId,
                //   quantity: w.quantity,
                // })),
              }),
              elementNumber: submitData.name,
              totalAmount: submitData.sellingPrice,
              updatedBy: JSON.stringify(
                JSON.parse(
                  CryptoJS.AES.decrypt(
                    localStorage.getItem("user"),
                    import.meta.env.VITE_SECRET,
                  ).toString(CryptoJS.enc.Utf8),
                )?.user,
              ),
              stockQuantity: submitData.stockQuantity,
              oldQuantity: submitData.stockQuantity,
              status: submitData.status,
              sku: submitData.sku,
              attachments: JSON.stringify({
                images: [...res, ...serverImages],
              }),
            },
            "inventory_products",
          );
        } else {
          await commonApi.create(
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
              stockQuantity: submitData.stockQuantity,
              oldQuantity: submitData.stockQuantity,
              issueDate: submitData.issueDate,
              main: JSON.stringify({
                ...submitData,
                warehouses: [
                  {
                    warehouseName: "main",
                    warehouseId: "1",
                    quantity: submitData.stockQuantity,
                  },
                ],
              }),
              elementNumber: submitData.name,
              sku: submitData.sku,
              totalAmount: submitData.sellingPrice,
              status: submitData.status,
              attachments: JSON.stringify({
                images: [...res, ...serverImages],
              }),
            },
            "inventory_products",
          );
        }

        await Swal.fire({
          icon: "success",
          title:
            location.state?.action == "edit"
              ? isRTL
                ? "تم حفظ المنتج بنجاح"
                : "Product has been saved"
              : isRTL
                ? "تم إنشاء المنتج"
                : "Product created",
          text:
            location.state?.action == "edit"
              ? isRTL
                ? "تم حفظ المنتج "
                : "Product has been saved"
              : isRTL
                ? "تم إنشاء المنتج بنجاح"
                : "Product has been created",
          timer: 2000,
          showConfirmButton: false,
        });

        if (!isDialog) {
          navigate("/inventory/products");
        } else {
          setShowAddModal(false);
        }
      }
    } catch (error: any) {
      console.error("Error:", error);
    } finally {
      setIsSubmitting(false);
      //   resetForm();
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-4 sm:p-6">
      <Formik
        initialValues={
          location.state?.action == "copy"
            ? {
              ...JSON.parse(location.state?.newData.main),
              sku: generateNumber("SKU"),
            }
            : location.state?.action == "edit"
              ? JSON.parse(location.state?.newData.main)
              : initialValues
        }
        validationSchema={schema}
        onSubmit={(values) => handleSubmit(values)}
      >
        {({ values, handleChange, handleBlur, setFieldValue, submitForm }) => (
          <Form className="space-y-4">
            {!isDialog && (
              <motion.div
                // initial={{ opacity: 0, y: -8 }}
                // animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center space-x-4 rtl:space-x-reverse  mt-12 sm:mt-0">
                  <BackButton />
                  <div>
                    <h1 className="text-2xl font-bold">
                      {isRTL ? "إضافة / تحرير المنتج" : "Add / Edit Product"}
                    </h1>

                    <p className="text-muted-foreground text-sm sm:text-base">
                      {isRTL
                        ? "قم بإضافة منتج جديد إلى المخزون الخاص بك أو تعديل منتج موجود."
                        : "Add a new product to your inventory or edit an existing product."}
                    </p>
                  </div>
                </div>

                <MainButtons
                  values={values}
                  setShowPreview={null}
                  handleSubmit={handleSubmit}
                  isSubmitting={isSubmitting}
                  isDraft={null}
                  location={location}
                  submit="submit"
                />
              </motion.div>
            )}

            <Card className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>{isRTL ? "اسم المنتج" : "Product Name"}</Label>
                  <Input
                    name="name"
                    value={values.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  <ErrorMessage
                    name="name"
                    component="div"
                    className="text-destructive text-sm"
                  />
                </div>

                <div>
                  <Label>{isRTL ? " الرقم التسلسلي SKU" : "SKU"}</Label>
                  <Input
                    name="sku"
                    value={values.sku}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  <ErrorMessage
                    name="sku"
                    component="div"
                    className="text-destructive text-sm"
                  />
                </div>

                <div>
                  <Label>{isRTL ? "حالة المنتج" : "Product Status"}</Label>
                  <Field
                    as="select"
                    name="status"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {productStatuses.map((option) => (
                      <option key={option.value} value={option.value}>
                        {isRTL ? option.labelAr : option.label}
                      </option>
                    ))}
                  </Field>
                  <ErrorMessage
                    name="status"
                    component="div"
                    className="text-destructive text-sm"
                  />
                </div>



                <div>
                  <Label>{isRTL ? "العلامة التجارية" : "Brand"}</Label>
                  <Field
                    as="select"
                    name="brandId"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">{isRTL ? "اختر العلامة التجارية" : "Select Brand"}</option>
                    {brands.map((brand: any) => (
                      <option key={brand.id} value={brand.id}>
                        {brand.name}
                      </option>
                    ))}
                  </Field>
                </div>

                <div>
                  <Label>{isRTL ? "التصنيف (الفئة)" : "Classification (Category)"}</Label>
                  <Field
                    as="select"
                    name="categoryId"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">{isRTL ? "اختر الفئة" : "Select Category"}</option>
                    {categories.map((category: any) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </Field>
                </div>

                <div>
                  <Label>{isRTL ? "الباركود" : "Barcode"}</Label>
                  <div className="flex gap-2">
                    <Input
                      name="barcode"
                      value={values.barcode}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    <button
                      type="button"
                      onClick={() => setFieldValue("barcode", generateBarcode())}
                      className="p-2 border rounded-md hover:bg-muted"
                      title={isRTL ? "توليد باركود" : "Generate Barcode"}
                    >
                      <RefreshCw className="h-4 w-4" />
                    </button>
                  </div>
                  <ErrorMessage
                    name="barcode"
                    component="div"
                    className="text-destructive text-sm"
                  />
                </div>

                <div>
                  <Label>{isRTL ? "الخصم" : "Discount"}</Label>
                  <Input
                    type="number"
                    min={0}
                    name="discount"
                    value={values.discount}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />{" "}
                  <ErrorMessage
                    name="discount"
                    component="div"
                    className="text-destructive text-sm"
                  />
                </div>

                <div>
                  <Label>{isRTL ? "نوع الخصم" : "Discount Type"}</Label>
                  <Field
                    as="select"
                    name="discountType"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="percentage">
                      {isRTL ? "نسبة مئوية" : "Percentage"}
                    </option>
                    <option value="fixed">
                      {isRTL ? "مبلغ ثابت" : "Fixed Amount"}
                    </option>
                  </Field>{" "}
                  <ErrorMessage
                    name="discountType"
                    component="div"
                    className="text-destructive text-sm"
                  />
                </div>

                <div>
                  <Label>
                    {isRTL ? "اختر نموذج الوحدة" : "Select Unit Template"}
                  </Label>
                  <Field
                    as="select"
                    name="unitVal"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    onChange={(e: any) => {
                      console.log("selected unit template", e.target.value);

                      settings?.unitTemplates.filter((r) => {
                        if (r.id === e.target.value) {
                          var x = r.conversions;
                          var y = r.conversions;

                          var z = y.filter((item) => item.value === "1");
                          if (z.length === 0) {
                            y.push({ unitName: r.baseUnit, value: "1" });
                          }
                          setConversionUnitList(x);

                          setConversionUnitList((prev) => {
                            if (prev.some((x) => x.value === "1")) return prev;
                            return [
                              ...prev,
                              {
                                unitName: r.baseUnit,
                                value: "1",
                              },
                              ,
                            ]; // prepend
                          });
                          setFieldValue("unit", r.name);
                          setFieldValue("unitList", y);
                          setFieldValue("unitBuy", y[0].value);
                          setFieldValue("unitBuyVal", y[0].unitName);
                          setFieldValue("unitSell", y[0].value);
                          setFieldValue("unitSellVal", y[0].unitName);
                        }
                      });
                      setFieldValue("unitVal", e.target.value);
                    }}
                  >
                    <option key={"1122"} value={""}>
                      {isRTL ? "اختر نموذج الوحدة" : "Select Unit Template"}
                    </option>
                    {settings?.unitTemplates?.map((c) => (
                      <option key={c.id} value={c.id}>
                        {isRTL ? `${c.name}` : `${c.name}`}
                      </option>
                    ))}
                  </Field>
                  <ErrorMessage
                    name="unit"
                    component="div"
                    className="text-destructive text-sm"
                  />
                </div>
                {/* <div>
                  <Label>{isRTL ? "العملة" : "Currency"}</Label>
                  <Field
                    as="select"
                    name="currency"
                    id="currency"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {currencies.map((c) => (
                      <option key={c.code} value={c.code}>
                        {isRTL
                          ? `${c.code} - ${c.symbol}`
                          : `${c.code} - ${c.symbol}`}
                      </option>
                    ))}
                  </Field>

                  <ErrorMessage
                    name="currency"
                    component="div"
                    className="text-destructive text-sm"
                  />
                </div> */}

                <div className="flex justify-between gap-4">
                  <div className="w-full">
                    <Label>{isRTL ? "سعر الشراء" : "Purchase Price"}</Label>
                    <Input
                      type="number"
                      min={0}
                      name="purchasePrice"
                      value={values.purchasePrice}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />{" "}
                    <ErrorMessage
                      name="purchasePrice"
                      component="div"
                      className="text-destructive text-sm"
                    />
                  </div>
                  <div>
                    <Label>{isRTL ? "الوحدة" : "Unit"}</Label>
                    <Field
                      as="select"
                      name="unitBuy"
                      className="xl:w-28 flex h-10 w-24 rounded-md border border-input bg-background px-3 py-2 text-sm"
                      onChange={(e: any) => {
                        conversionUnitList.filter((r) => {
                          if (
                            r.value.toString() === e.target.value.toString()
                          ) {
                            setFieldValue("unitBuyVal", r.unitName);
                          }
                        });

                        setFieldValue("unitBuy", e.target.value);
                      }}
                    >
                      {conversionUnitList.map((c) => (
                        <option key={c.value} value={c.value}>
                          {isRTL ? `${c.unitName}` : `${c.value}`}
                        </option>
                      ))}
                    </Field>
                    <ErrorMessage
                      name="unitBuy"
                      component="div"
                      className="text-destructive text-sm"
                    />
                  </div>
                </div>
                <div className="flex justify-between gap-4">
                  <div className="w-full">
                    <Label>{isRTL ? "سعر البيع" : "Selling Price"}</Label>
                    <Input
                      type="number"
                      min={0}
                      name="sellingPrice"
                      value={values.sellingPrice}
                      //    className="xl:w-56"
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />{" "}
                    <ErrorMessage
                      name="sellingPrice"
                      component="div"
                      className="text-destructive text-sm"
                    />
                  </div>
                  <div>
                    <Label>{isRTL ? "الوحدة" : "Unit"}</Label>
                    <Field
                      as="select"
                      name="unitSell"
                      className="xl:w-28 flex h-10 w-24 rounded-md border border-input bg-background px-3 py-2 text-sm"
                      onChange={(e: any) => {
                        conversionUnitList.filter((r) => {
                          if (
                            r.value.toString() === e.target.value.toString()
                          ) {
                            setFieldValue("unitSellVal", r.unitName);
                          }
                        });

                        setFieldValue("unitSell", e.target.value);
                      }}
                    >
                      {conversionUnitList.map((c) => (
                        <option key={c.value} value={c.value}>
                          {isRTL ? `${c.unitName}` : `${c.value}`}
                        </option>
                      ))}
                    </Field>
                    <ErrorMessage
                      name="unitSell"
                      component="div"
                      className="text-destructive text-sm"
                    />
                  </div>
                </div>

                {/* <div>
                  <Label>
                    {isRTL ? "أقل سعر بيع" : "Minimum Selling Price"}
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    name="minSellingPrice"
                    value={values.minSellingPrice}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />{" "}
                  <ErrorMessage
                    name="minSellingPrice"
                    component="div"
                    className="text-destructive text-sm"
                  />
                </div> */}
                {/* </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4"> */}
                {/* <div>
                  <Label>
                    {isRTL
                      ? "هامش الربح نسبة مئوية"
                      : "Profit Margin Percentage"}
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    name="profitMargin"
                    value={values.profitMargin}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />{" "}
                  <ErrorMessage
                    name="profitMargin"
                    component="div"
                    className="text-destructive text-sm"
                  />
                </div> */}

                {/* </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4"> */}
                <div>
                  <Label>{isRTL ? "الكمية بالمخزون" : "Stock Quantity"}</Label>
                  <Input
                    type="number"
                    min={0}
                    name="stockQuantity"
                    value={values.stockQuantity}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />{" "}
                  <ErrorMessage
                    name="stockQuantity"
                    component="div"
                    className="text-destructive text-sm"
                  />
                </div>
                {/* 
                <div>
                  <Label>
                    {isRTL
                      ? "نبهني عند وصول الكمية إلى أقل من"
                      : "Notify me when the quantity reaches less than"}
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    name="lowStockThreshold"
                    value={values.lowStockThreshold}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />{" "}
                  <ErrorMessage
                    name="lowStockThreshold"
                    component="div"
                    className="text-destructive text-sm"
                  />
                </div> */}
              </div>
              <div className="my-5">
                <div>
                  <Label>{isRTL ? "الوصف" : "Description"}</Label>
                  <Textarea
                    name="description"
                    value={values.description}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />{" "}
                  <ErrorMessage
                    name="description"
                    component="div"
                    className="text-destructive text-sm"
                  />
                </div>
              </div>
              {/* File Attachments */}
              <div
                className="bg-card border border-border rounded-xl p-6 animate-slide-in-up"
                style={{ animationDelay: "550ms" }}
              >
                <h2 className="text-xl font-semibold text-foreground mb-6">
                  {isRTL ? "المرفقات" : "Attachments"}
                </h2>

                <div className="space-y-4">
                  {location.state?.action == "edit" ? (
                    <div className="mb-3">
                      <h4 className="text-sm font-medium mb-2">
                        {isRTL ? "التحميلات التي على الخادم" : "Server Uploads"}
                      </h4>
                      <div className="flex gap-3 overflow-x-auto pb-2">
                        {serverImages.map((f: any) => {
                          // const attached = !!selectedServerFiles.find(
                          //   (s) => s.id === f.id,
                          // );
                          return (
                            <div
                              key={f.id}
                              className="w-40 p-2 bg-card border border-border rounded-lg flex-shrink-0"
                            >
                              <div className="w-full h-24 mb-2 bg-muted rounded overflow-hidden flex items-center justify-center">
                                {f.mime && f.mime.startsWith("image") ? (
                                  <img
                                    src={f.url}
                                    alt={f.original_name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="text-muted-foreground text-sm">
                                    {f.original_name}
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="text-xs text-muted-foreground truncate">
                                  {f.original_name}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setServerImages(
                                      serverImages.filter(
                                        (file: any) => file.url !== f.url,
                                      ),
                                    );

                                    console.log(serverImages);
                                  }}
                                  className={`px-2 py-1 text-xs rounded ${1 == 1 ? "bg-red-500 text-white" : "bg-muted/20"}`}
                                >
                                  {isRTL ? "حذف" : "Delete"}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="mb-3 text-sm text-muted-foreground">
                      {/* {isRTL
                        ? "لم يتم العثور على تحميلات على الخادم"
                        : "No server uploads found"} */}
                    </div>
                  )}

                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary hover:bg-primary/5 transition-all">
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                      onChange={(e) =>
                        handleFileUpload(
                          e.target.files,
                          setFieldValue,
                          values.attachments,
                          isRTL,
                        )
                      }
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-lg font-medium text-foreground mb-2">
                        {isRTL ? "اختر الملفات" : "Choose files"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {isRTL
                          ? "PDF, DOC, DOCX, JPG, PNG, GIF (حد أقصى 10MB)"
                          : "PDF, DOC, DOCX, JPG, PNG, GIF (Max 10MB)"}
                      </p>
                    </label>
                  </div>

                  {values.attachments.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-foreground">
                        {isRTL ? "الملفات المرفقة:" : "Attached Files:"}
                      </h4>
                      {values.attachments.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-muted rounded-lg"
                        >
                          <div className="flex items-center space-x-3 rtl:space-x-reverse">
                            <Paperclip className="w-5 h-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium text-foreground">
                                {file.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              removeAttachment(
                                index,
                                values.attachments,
                                setFieldValue,
                              )
                            }
                            className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {isDialog && (
                <div className="flex items-center gap-3 mt-5">
                  <button
                    type="button"
                    onClick={() => submitForm()}
                    disabled={isSubmitting}
                    className="mx-1 flex items-center justify-center space-x-2 rtl:space-x-reverse px-4  py-2 bg-primary text-primary-foreground rounded-lg hover:bg-secondary transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        <span>
                          {location.state?.action == "edit"
                            ? isRTL
                              ? "جاري التعديل..."
                              : "Editing..."
                            : isRTL
                              ? "جاري الإنشاء..."
                              : "Creating..."}
                        </span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span> {isRTL ? "حفظ" : "Save"}</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </Card>
          </Form>
        )}
      </Formik>
    </div >
  );
}
