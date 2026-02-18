import React, { useEffect, useRef, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { BackButton } from "@/components/common/BackButton";
import { Copy, Edit, Printer, Trash2, Upload } from "lucide-react";
import { handleCopy, handleEdit } from "@/lib/function";
import {  commonApi } from "@/lib/api";
import { useCurrency } from "@/contexts/CurrencyContext";
import { DisplayImages } from "@/components/invoices/DisplayImages";
import { selectedCurrency } from "@/data/data";
import CryptoJS from "crypto-js";

export default function ProductView() {
  const navigate = useNavigate();
  const { isRTL } = useLanguage();
  const location = useLocation();
  const [product, setProduct] = useState(location.state?.viewFrom);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { formatAmount, convertAmount } = useCurrency();

  useEffect(() => {
   console.log(product);
   console.log(JSON.parse(product.main));
  }, []);

  if (!product) {
    return (
      <div className="container mx-auto p-4 sm:p-6">
        <div className="text-center text-muted-foreground">
          {isRTL ? "المنتج غير موجود" : "Product Not Found"}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          <BackButton />

          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {isRTL ? "عرض المنتج" : "Product Details"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isRTL
                ? "تفاصيل المنتج والمعلومات"
                : "Product full details and information"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 sm:flex-none"
            onClick={() => {
              handleCopy(
                isRTL ? "نسخ " : "Copy ",
                isRTL
                  ? `هل تريد نسخ ${product.elementNumber}؟`
                  : `Do you want to copy ${product.elementNumber}?`,
                product,
                isRTL,
                navigate,
                "/inventory/products/new",
              );
            }}
          >
            <Copy className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">{isRTL ? "نسخ" : "Copy"}</span>
          </Button>

          {((JSON.parse(localStorage.getItem("subRole") || "null") as any)
            ?.Inventory?.editAndDeleteAllProducts !== false ||
            ((JSON.parse(localStorage.getItem("subRole") || "null") as any)
              ?.Inventory?.editAndDeleteHisProducts === true &&
              JSON.parse(
                CryptoJS.AES.decrypt(
                  localStorage.getItem("user"),
                  import.meta.env.VITE_SECRET,
                ).toString(CryptoJS.enc.Utf8),
              )?.user?.id === JSON.parse(product.createdBy).id)) && <Button
            variant="outline"
            size="sm"
            disabled={isSubmitting}
            className="flex-1 sm:flex-none"
            onClick={async () => {
              setIsSubmitting(true);
              var res = await commonApi.delete(
                isRTL ? "حذف" : "Delete",
                isRTL
                  ? `هل أنت متأكد من حذف ${product.elementNumber}؟ لا يمكن التراجع عن هذا الإجراء.`
                  : `Are you sure you want to delete ${product.elementNumber}? This action cannot be undone.`,
                product.id,
                product.tableName,
                isRTL,
                setIsRefreshing,
              );
              console.log(" deleting res:", res);

              setIsSubmitting(false);

              if (res) {
                navigate(-1);
              }
            }}
          >
            {isSubmitting && (
              <div className="w-5 h-5 border-2 border-primary- border-t-primary-foreground rounded-full animate-spin text-" />
            )}

            <Trash2 className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">{isRTL ? "حذف" : "Delete"}</span>
          </Button>}

          {((JSON.parse(localStorage.getItem("subRole") || "null") as any)
            ?.Inventory?.editAndDeleteAllProducts !== false ||
            ((JSON.parse(localStorage.getItem("subRole") || "null") as any)
              ?.Inventory?.editAndDeleteHisProducts === true &&
              JSON.parse(
                CryptoJS.AES.decrypt(
                  localStorage.getItem("user"),
                  import.meta.env.VITE_SECRET,
                ).toString(CryptoJS.enc.Utf8),
              )?.user?.id === JSON.parse(product.createdBy).id)) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                handleEdit(product, navigate, `/inventory/products/edit`)
              }
              className="flex items-center space-x-2 rtl:space-x-reverse px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-secondary transition-colors text-sm"
            >
              <Edit className="w-4 h-4" />
              <span className="hidden sm:inline">
                {isRTL ? "تحرير" : "Edit"}
              </span>
            </Button>
          )}
        </div>
      </motion.div>

      <Card className="p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="grid grid-cols-1 md:grid-cols- gap-4">
            <div className="col-span-">
              <h2 className="text-lg font-semibold">{product.elementNumber}</h2>
              <div className="text-sm text-muted-foreground">
                {/* SKU: JSON.parse(product.main)?. */}
                {product.sku} • {product.status}
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <div className="text-xs text-muted-foreground">
                    {isRTL ? "سعر البيع" : "Buying Price"}
                  </div>
                  <div className="font-medium">
                    {formatAmount(
                      convertAmount(
                        JSON.parse(product.main)?.sellingPrice,
                        localStorage.getItem("selectedCurrency") ??
                          selectedCurrency,
                      ),
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">
                    {isRTL ? "وحدة البيع" : "Selling Unit"}
                  </div>
                  <div className="font-medium">
                    {JSON.parse(product.main)?.unitSellVal}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-muted-foreground">
                    {isRTL ? "تكلفة الشراء" : "Purchase Cost"}
                  </div>
                  <div className="font-medium">
                    {formatAmount(
                      convertAmount(
                        JSON.parse(product.main)?.purchasePrice,
                        localStorage.getItem("selectedCurrency") ??
                          selectedCurrency,
                      ),
                    )}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-muted-foreground">
                    {isRTL ? "وحدة الشراء" : "Purchase Unit"}
                  </div>
                  <div className="font-medium">
                    {JSON.parse(product.main)?.unitBuyVal}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-muted-foreground">
                    {isRTL ? "الباركود" : "Barcode"}
                  </div>
                  <div className="font-medium">
                    {JSON.parse(product.main)?.barcode}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">
                    {isRTL ? "الوحدة" : "Unit"}
                  </div>
                  <div className="font-medium">
                    {JSON.parse(product.main)?.unit}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-muted-foreground">
                    {isRTL ? "المخزون" : "Stock"}
                  </div>
                  <div className="font-medium text- mt-">
                    {product?.stockQuantity}
                  </div>

                  {/* <div className="mt-4 text-xs text-muted-foreground">
                {isRTL ? "المستودع" : "Warehouse"}
              </div>
              <div className="mt-2 font-medium">
                {JSON.parse(product.main)?.warehouse}
              </div> */}
                </div>
              </div>

              <div className="mt-4">
                <div className="text-xs text-muted-foreground">
                  {isRTL ? "الوصف" : "Description"}
                </div>
                <div className="font-medium text-sm mt-1">
                  {JSON.parse(product.main)?.description || "-"}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="mt-8 mb-2">
          <DisplayImages data={JSON.parse(product.attachments)?.images} />
        </div>
      </Card>
    </div>
  );
}
