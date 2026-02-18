import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { BackButton } from "@/components/common/BackButton";
import {
  Check,
  Copy,
  Edit,
  Filter,
  Plus,
  Save,
  Search,
  Trash2,
} from "lucide-react";
import { handleCopy, handleEdit, mainFilter } from "@/lib/function";
import { commonApi } from "@/lib/api";
import { useLanguage } from "@/contexts/LanguageContext";
import LightweightDialog, {
  LightweightDialogContent,
  LightweightDialogHeader,
  LightweightDialogTitle,
} from "@/components/ui/lightweight-dialog";
import Swal from "sweetalert2";
import CryptoJS from "crypto-js";

export default function InventoryNow() {
  const navigate = useNavigate();
  const { isRTL } = useLanguage();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mainData, setMainData] = useState(location.state?.viewFrom);

  const [isSubmitting2, setIsSubmitting2] = useState(false);
  const [isSubmitting3, setIsSubmitting3] = useState(false);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [products, setProducts] = useState([]);
  const [addQuery, setAddQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [sort, setSort] = useState({
    field: "id",
    direction: "desc",
    type: "basic",
    json_path: "$.elementNumber",
  });

  useEffect(() => {
    loadData();
  }, [addQuery, isRefreshing]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      var filter = await mainFilter({
        search: addQuery,
        status: "all",
        category: "all",
        paymentMethod: "all",
        salesPerson: "all",
        dateFrom: "",
        dateTo: "",
        amountFrom: "",
        amountTo: "",
        dueDateFrom: "",
        dueDateTo: "",
      });

      var result = await commonApi.getAll(
        1,
        1000,
        filter,
        sort,
        "inventory_products",
      );
      console.log("result", result);

      setProducts(result.data);
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const [items, setItems] = useState(JSON.parse(mainData?.items)?.items || []);

  const [showFilterSearch, setShowFilterSearch] = useState(false);

  const [filterQuery, setFilterQuery] = useState("");
  const filteredItems = useMemo(() => {
    const q = filterQuery.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) => it.elementNumber.toLowerCase().includes(q));
  }, [items, filterQuery]);

  // Add products modal state
  const [showAddModal, setShowAddModal] = useState(false);

  // In-modal chosen items (user picks products to add)
  const [chosenIds, setChosenIds] = useState(
    JSON.parse(mainData?.items)?.items?.map((i: any) => i.id) || [],
  );

  // useEffect(() => {
  //   setChosenIds(
  //     JSON.parse(mainData?.items)?.items?.map((i: any) => i.id) || [],
  //   );
  //   console.log("mainData?.items?.items", chosenIds);
  // }, []);

  const [chosenItems, setChosenItems] = useState(
    JSON.parse(mainData?.items)?.items || [],
  );

  // const chosenItems = useMemo(() => {
  //   return products.filter((p) => chosenIds.includes(p.id));
  // }, [chosenIds]);

  // Search within chosen items inside the modal
  const [chosenSearch, setChosenSearch] = useState("");
  const filteredChosen = useMemo(() => {
    const q = chosenSearch.trim().toLowerCase();
    if (!q) return chosenItems;
    return chosenItems.filter((c) => c.elementNumber.toLowerCase().includes(q));
  }, [chosenItems, chosenSearch]);

  const availableFiltered = useMemo(() => {
    const q = addQuery.trim().toLowerCase();
    return products.filter(
      (p) =>
        p.elementNumber.toLowerCase().includes(q) && !chosenIds.includes(p.id),
    );
  }, [addQuery, chosenIds]);

  function toggleChoose(item: any) {
    setChosenIds((prev) =>
      prev.includes(item.id)
        ? prev.filter((x) => x !== item.id)
        : [...prev, item.id],
    );

    setChosenItems((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item],
    );
  }

  function confirmAdd() {
    // const toAdd = products
    //   .filter((p) => chosenIds.includes(p.id))
    //  .map((p) => ({ product: p.name, price: p.price }));
    setItems(
      chosenItems,
      //   (prev) => [...prev, ...toAdd]
    );
    //  setChosenIds([]);
    setAddQuery("");
    setChosenSearch("");
    setShowAddModal(false);
  }

  function removeItem(index: number, item: any) {
    setItems((prev) => prev.filter((x) => x.id !== item.id));
    // setItems((prev) => prev.filter((_, i) => i !== index));

    setChosenIds((prev) => prev.filter((x) => x !== item.id));

    setChosenItems((prev) => prev.filter((x) => x.id !== item.id));
  }

  const handleSubmit = async () => {
    setIsSubmitting2(true);
    try {
      await commonApi.update(
        mainData.id,
        {
          items: JSON.stringify({ items: items }),
          updatedAt: new Date().toISOString(),
          // status: values.status,
        },
        "inventory_inventory",
      );

      await Swal.fire({
        icon: "success",
        title: isRTL ? "تم الحفظ بنجاح" : "Inventory has been saved",

        text: isRTL ? "تم الحفظ  " : "Inventory has been saved",

        timer: 2000,
        showConfirmButton: false,
      });

      navigate("/inventory/inventory");
    } catch (error: any) {
      console.error("Error:", error);
    } finally {
      setIsSubmitting2(false);
      //   resetForm();
    }
  };

  const handleSubmitInventory = async () => {
    setIsSubmitting3(true);
    try {
      // Get current user for audit trail
      const currentUser = JSON.parse(
        CryptoJS.AES.decrypt(
          localStorage.getItem("user"),
          import.meta.env.VITE_SECRET,
        ).toString(CryptoJS.enc.Utf8),
      )?.user;

      // Directly update each product's stock quantity with the entered value
      // No arithmetic operations - just save the exact quantity entered by user
      for (const item of items) {
        await commonApi.update(
          item.id,
          {
            stockQuantity: Number(item.currentStockQuantity || 0),
            oldQuantity: Number(item.currentStockQuantity || 0),
            updatedAt: new Date().toISOString(),
            updatedBy: JSON.stringify(currentUser),
          },
          "inventory_products",
        );
      }

      // Save Inventory Record Itself
      await commonApi.update(
        mainData.id,
        {
          items: JSON.stringify({ items: items }),
          updatedAt: new Date().toISOString(),
          status: "completed",
        },
        "inventory_inventory",
      );

      await Swal.fire({
        icon: "success",
        title: isRTL ? "تم التقديم بنجاح" : "Inventory Submitted Successfully",
        text: isRTL
          ? "تم تحديث المخزون"
          : "Stock quantities have been updated",
        timer: 2000,
        showConfirmButton: false,
      });

      navigate("/inventory/inventory");
    } catch (error) {
      console.error("Submit Error:", error);
      Swal.fire({
        icon: "error",
        title: isRTL ? "خطأ" : "Error",
        text: isRTL ? "حدث خطأ أثناء التقديم" : "An error occurred while submitting",
      });
    } finally {
      setIsSubmitting3(false);
    }
  };

  if (!mainData) {
    return (
      <div className="container mx-auto p-4 sm:p-6">
        <div className="text-center text-muted-foreground">
          {isRTL ? " غير موجود" : " Not Found"}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          <BackButton />

          <div>
            <h1 className="text-2xl font-bold">
              {isRTL ? "تفاصيل الجرد" : "Inventory Details"}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            disabled={isSubmitting2}
            variant="outline"
            size="sm"
            className="flex-1 sm:flex-none"
            onClick={() => {
              handleSubmit();
            }}
          >
            {" "}
            {isSubmitting2 && (
              <div className="w-5 h-5 border-2 border-primary- border-t-primary-foreground rounded-full animate-spin text-" />
            )}
            <Save className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline"> {isRTL ? "حفظ" : "Save"}</span>
          </Button>

          <Button
            disabled={isSubmitting3}
            size="sm"
            className="flex-1 sm:flex-none"
            onClick={() => {
              handleSubmitInventory();
            }}
          >
            {" "}
            {isSubmitting3 && (
              <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
            )}
            <Check className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">
              {" "}
              {isRTL ? "تقديم الجرد" : "Submit Inventory"}
            </span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="flex-1 sm:flex-none"
            onClick={() => setShowFilterSearch((s) => !s)}
          >
            <Search className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">
              {" "}
              {isRTL ? "بحث" : "Search"}
            </span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="flex-1 sm:flex-none"
            onClick={() => {
              setItems(products);
            }}
          >
            <Plus className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">
              {" "}
              {isRTL ? "إضافة جميع منتجات" : "Add All Products"}
            </span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="flex-1 sm:flex-none bg-primary text-primary-foreground rounded-lg hover:bg-secondary transition-colors text-sm"
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">
              {" "}
              {isRTL ? "إضافة منتجات" : "Add Products"}
            </span>
          </Button>
        </div>
      </motion.div>

      {showFilterSearch && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          className="overflow-hidden"
        >
          <div className="flex items-center gap-2">
            <input
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder={isRTL ? "ابحث في العناصر..." : "Search in items..."}
              className="flex-1 px-3 py-2 border rounded-md"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setFilterQuery("");
                setShowFilterSearch(false);
              }}
            >
              {isRTL ? "إلغاء" : "Close"}
            </Button>
          </div>
        </motion.div>
      )}

      <Card className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold">{mainData.name}</h3>
            <div className="text-sm text-muted-foreground">
              {mainData.status}
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            {items.length} {isRTL ? "عنصر" : "items"}
          </div>
        </div>

        <div className="mt-3">
          {filteredItems.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              {isRTL ? "لا توجد نتائج" : "No results"}
            </div>
          ) : (
            filteredItems.map((it, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 p-4 border-b items-center"
              >
                {/* SKU */}
                <div className="space-y-1">
                  <div className="font-medium text-sm">
                    {isRTL ? "الرقم التسلسلي" : "SKU"}
                  </div>
                  <div className="text-sm text-muted-foreground">{it.sku}</div>
                </div>

                {/* Product Name */}
                <div className="space-y-1">
                  <div className="font-medium text-sm">
                    {isRTL ? "اسم المنتج" : "Product Name"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {it.elementNumber}
                  </div>
                </div>

                {/* System Quantity */}
                <div className="space-y-1">
                  <div className="font-medium text-sm">
                    {isRTL ? "العدد في البرنامج" : "System Quantity"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {JSON.parse(it.main).stockQuantity}
                  </div>
                </div>

                {/* Stock Quantity Input */}
                <div className="space-y-1">
                  <div className="font-medium text-sm">
                    {isRTL ? "العدد في المخزون" : "Stock Quantity"}
                  </div>
                  <input
                    type="number"
                    step="1"
                    value={it.currentStockQuantity}
                    onChange={(e) => {
                      setItems((prev) =>
                        prev.map((p, i) =>
                          p.id === it.id
                            ? { ...p, currentStockQuantity: e.target.value }
                            : p,
                        ),
                      );
                    }}
                    className="w-full px-3 py-2 border rounded-md text-sm"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <div className="font-medium text-sm">
                    {isRTL ? "الوصف" : "Description"}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      value={it.stockDescription}
                      onChange={(e) => {
                        setItems((prev) =>
                          prev.map((p, i) =>
                            p.id === it.id
                              ? { ...p, stockDescription: e.target.value }
                              : p,
                          ),
                        );
                      }}
                      className="flex-1 px-3 py-2 border rounded-md text-sm"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(idx, it)}
                      className="text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </Card>

      <LightweightDialog open={showAddModal} onOpenChange={setShowAddModal}>
        <LightweightDialogContent className="sm:w-[900px] sm:h-[77vh]">
          <div className="flex items-center justify-between mb-">
            <h3 className="text-lg font-semibold">
              {isRTL ? "إضافة منتجات" : "Add Products"}
            </h3>
            <div className="flex items-center  gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowAddModal(false);
                  setChosenIds([]);
                  setAddQuery("");
                  setChosenSearch("");
                }}
              >
                {isRTL ? "إغلاق" : "Close"}
              </Button>
            </div>
          </div>

          <LightweightDialogHeader>
            <></>
          </LightweightDialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-7">
            <div>
              <label className="text-sm font-medium block mb-1">
                {isRTL ? "ابحث وأختر" : "Search & Choose"}
              </label>
              <input
                value={addQuery}
                onChange={(e) => setAddQuery(e.target.value)}
                placeholder={
                  isRTL ? "ابحث عن المنتجات..." : "Search products..."
                }
                className="w-full px-3 py-2 border rounded-md mb-2"
              />
              <div className="max-h- overflow-auto border rounded">
                {availableFiltered.map((p) => (
                  <div
                    key={p.id}
                    className="p-2 flex items-center justify-between hover:bg-muted"
                  >
                    <div>
                      <div className="font-medium">{p.elementNumber}</div>
                      <div className="text-sm text-muted-foreground">
                        {p.totalAmount}
                      </div>
                    </div>
                    <div>
                      <Button size="sm" onClick={() => toggleChoose(p)}>
                        {isRTL
                          ? chosenIds.includes(p.id)
                            ? "مُختار"
                            : "اختر"
                          : chosenIds.includes(p.id)
                            ? "Selected"
                            : "Choose"}
                      </Button>
                    </div>
                  </div>
                ))}
                {availableFiltered.length === 0 && (
                  <div className="p-2 text-sm text-muted-foreground">
                    {isRTL ? "لا توجد منتجات" : "No products"}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">
                {isRTL ? "المنتقاة" : "Chosen"}
              </label>
              <input
                value={chosenSearch}
                onChange={(e) => setChosenSearch(e.target.value)}
                placeholder={isRTL ? "ابحث في المختارة..." : "Search chosen..."}
                className="w-full px-3 py-2 border rounded-md mb-2"
              />
              <div className="max-h- overflow-auto border rounded">
                {filteredChosen.map((c) => (
                  <div
                    key={c.id}
                    className="p-2 flex items-center justify-between border-b"
                  >
                    <div>
                      <div className="font-medium">{c.elementNumber}</div>
                      <div className="text-sm text-muted-foreground">
                        {c.totalAmount}
                      </div>
                    </div>
                    <div>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => toggleChoose(c)}
                      >
                        {isRTL ? "إزالة" : "Remove"}
                      </Button>
                    </div>
                  </div>
                ))}
                {filteredChosen.length === 0 && (
                  <div className="p-2 text-sm text-muted-foreground">
                    {isRTL ? "لا توجد عناصر مختارة" : "No chosen items"}
                  </div>
                )}
              </div>

              <div className="mt-3 flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setChosenIds([]);
                    setChosenItems([]);
                    setChosenSearch("");
                  }}
                >
                  {isRTL ? "مسح" : "Clear"}
                </Button>
                <Button
                  size="sm"
                  onClick={confirmAdd}
                  disabled={chosenIds.length === 0}
                >
                  {isRTL ? "أضف إلى الجرد" : "Add to Inventory"}
                </Button>
              </div>
            </div>
          </div>
        </LightweightDialogContent>
      </LightweightDialog>
    </div>
  );
}
