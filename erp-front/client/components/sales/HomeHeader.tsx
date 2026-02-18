import { useLanguage } from "@/contexts/LanguageContext";
import {
  downloadProductImportTemplate,
  handleExcelAndImagesImport,
} from "@/lib/excelParser";
import { motion } from "framer-motion";
import {
  Monitor,
  Smartphone,
  RefreshCw,
  Plus,
  Upload,
  X,
  MessageSquareReply,
  MoreHorizontal,
} from "lucide-react";
import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import LightweightDialog, {
  LightweightDialogContent,
  LightweightDialogHeader,
} from "../ui/lightweight-dialog";
import { Alert, AlertDescription } from "../ui/alert";
import { generateNumber } from "@/lib/products_function";

export function HomeHeader(props: {
  isRefreshing: any;
  handleRefresh: any;
  viewMode: any;
  setViewMode: any;
  isMobile: any;
  title: any;
  description: any;
  other: any;
  href: any;
  setIsRefreshing?: any;
  sectionName?: string;
  pageName?: string;
}) {
  const {
    isRefreshing,
    handleRefresh,
    viewMode,
    setViewMode,
    isMobile,
    title,
    description,
    other,
    href,
    setIsRefreshing,
    sectionName,
    pageName,
  } = props;

  const { isRTL } = useLanguage();
  const multiFileInputRef = useRef<HTMLInputElement>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center space-x-3 rtl:space-x-reverse"
        >
          {/* View Mode Toggle */}
          {viewMode && (
            <div className="flex bg-muted rounded-lg p-1">
              <button
                onClick={() => setViewMode("table")}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === "table"
                    ? "bg-background shadow-sm"
                    : "hover:bg-background/50"
                }`}
                disabled={isMobile}
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("cards")}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === "cards"
                    ? "bg-background shadow-sm"
                    : "hover:bg-background/50"
                }`}
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>
          )}

          {setIsRefreshing &&
            (JSON.parse(localStorage.getItem("subRole") || "null") as any)?.[
              sectionName
            ]?.[pageName] !== false && (
              <div>
                {" "}
                <button
                  onClick={() => {
                    setShowAddModal(true);
                  }}
                  //  disabled={isRefreshing}
                  className="flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-secondary transition-colors disabled:opacity-50"
                >
                  <Upload className="w-4 h-4" />
                  <span>{isRTL ? "استيراد ملف اكسل" : "Import Excel"}</span>
                </button>
              </div>
            )}

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-secondary transition-colors disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
            <span>{isRTL ? "تحديث" : "Refresh"}</span>
          </button>

          {other &&
            (JSON.parse(localStorage.getItem("subRole") || "null") as any)?.[
              sectionName
            ]?.[pageName] !== false &&
            (pageName !== "addStockOrder" ? (
              <Link
                to={href}
                className="flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-secondary transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>{other}</span>
              </Link>
            ) : (
              <div className="relative group">
                <button className="flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-secondary transition-colors">
                  <Plus className="w-4 h-4" />
                  <span>{other}</span> <MoreHorizontal className="w-4 h-4" />
                </button>
                <div className="absolute top-full right-0 rtl:right-auto rtl:left-0 mt-2 w-56 bg-card border border-border rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform scale-95 group-hover:scale-100 z-20">
                  <div className="p-2 space-y-1">
                    <button
                      onClick={() => {
                        navigate(href, {
                          state: { newData: "Add", action: "create" },
                        });
                      }}
                      className="w-full flex items-center space-x-2 rtl:space-x-reverse px-3 py-2 text-sm hover:bg-accent rounded-md transition-all duration-200 transform hover:translate-x-1 rtl:hover:-translate-x-1"
                    >
                      <MessageSquareReply className="w-4 h-4" />
                      <span>{isRTL ? "اضافة" : "Add"}</span>
                    </button>

                    <button
                      onClick={() => {
                        navigate(href, {
                          state: { newData: "Withdraw", action: "create" },
                        });
                      }}
                      className="w-full flex items-center space-x-2 rtl:space-x-reverse px-3 py-2 text-sm hover:bg-accent rounded-md transition-all duration-200 transform hover:translate-x-1 rtl:hover:-translate-x-1"
                    >
                      <MessageSquareReply className="w-4 h-4" />
                      <span>{isRTL ? "صرف" : "Withdraw"}</span>
                    </button>

                    <button
                      onClick={() => {
                        navigate(href, {
                          state: { newData: "Transfer", action: "create" },
                        });
                      }}
                      className="w-full flex items-center space-x-2 rtl:space-x-reverse px-3 py-2 text-sm hover:bg-accent rounded-md transition-all duration-200 transform hover:translate-x-1 rtl:hover:-translate-x-1"
                    >
                      <MessageSquareReply className="w-4 h-4" />
                      <span>{isRTL ? "تحويل مخزني" : "Transfer"}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </motion.div>
      </motion.div>

      <LightweightDialog open={showAddModal} onOpenChange={setShowAddModal}>
        <LightweightDialogContent className="sm:w-[900px] sm:h-[77vh]">
          <div className="flex items-center justify-between mb-">
            <h3 className="text-lg font-semibold">
              <span>{isRTL ? "استيراد ملف اكسل" : "Import Excel"}</span>
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
            <input
              ref={multiFileInputRef}
              type="file"
              multiple
              accept=".xlsx,.xls,image/*"
              className="hidden"
              onChange={(event) =>
                handleExcelAndImagesImport(
                  event,
                  isRTL,
                  setIsRefreshing,
                  multiFileInputRef,
                  setShowAddModal,
                )
              }
            />

            <button
              onClick={() => multiFileInputRef.current?.click()}
              className="flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-secondary transition-colors disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              <span>{isRTL ? "استيراد ملف اكسل" : "Import Excel"}</span>
            </button>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Alert className="border-green-200 bg-green-50 dark:bg-green-950 mt-4">
                <AlertDescription>
                  <span className="font-medium">
                    {isRTL ? "ملاحظة:" : "Note:"}{" "}
                  </span>
                  <span className="ml-2">
                    {isRTL
                      ? "ارفع ملف الاكسل وصور المنتجات دفعة واحدة ويجب ان تضع اسم الصوره وامتدادها داخل عمود الصور في ملف الاكسل."
                      : ""}
                  </span>
                </AlertDescription>
              </Alert>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950 mt-4">
                <AlertDescription>
                  <span className="font-medium">
                    {isRTL ? "مهم:" : "Important:"}{" "}
                  </span>
                  <span className="ml-2">
                    {isRTL
                      ? "يجب ان تكون اسماء اعمدة ملف الاكسل مطابقة تماما لاسماء الحقول في النظام لتجنب اخطاء الاستيراد."
                      : "Column names in the Excel file must exactly match the field names in the system to avoid import errors."}
                  </span>
                </AlertDescription>
              </Alert>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950 mt-4">
                <AlertDescription>
                  <span className="font-medium">
                    {isRTL ? "الحقول:" : "Fields:"}{" "}
                  </span>
                  <span className="ml-2">
                    SKU, Name, Category, Selling Price, Stock, Image, Purchase
                    Price, Description, Barcode
                  </span>
                </AlertDescription>
              </Alert>

              <Button
                variant="outline"
                onClick={downloadProductImportTemplate}
                className="flex items-center gap-2 mt-5"
                title={isRTL ? "تحميل قالب إكسل" : "Download Excel template"}
              >
                {isRTL ? "تحميل قالب إكسل تجريبي (عينة)" : "Template"}
              </Button>
            </motion.div>
          </>
        </LightweightDialogContent>
      </LightweightDialog>

      {/* Import/Export Actions */}
      {/* <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex flex-wrap items-center gap-4">
         <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <button
              onClick={handleExportPDF}
              className="flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-all duration-200 transform hover:scale-105"
            >
              <FileType className="w-4 h-4" />
              <span>{isRTL ? "تصدير PDF" : "Export PDF"}</span>
            </button>
            <button
              onClick={handleExportExcel}
              className="flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-all duration-200 transform hover:scale-105"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>{isRTL ? "تصدير Excel" : "Export Excel"}</span>
            </button>
          </div> 
        </div>
      </div> */}
    </div>
  );
}
