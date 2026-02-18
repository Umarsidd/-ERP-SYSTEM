import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Eye, FileText, Save, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function MainButtons(props: {
  values: any;
  setShowPreview: any;
  handleSubmit: any;
  isSubmitting: any;
  isDraft: any;
  location: any;
  submit?: any;
  setIsSubmitting?: any;
  setIsDraft?: any;
  invoiceMain?: any;
  convertAmount?: any;
  bankAccounts?: any;
  bankAccountsMetaData?: any;
  serverImages?: any;
  tableName?: string;
  pageName?: string;
  invoice?: any;
  installments?: any;
  position?: "absolute" | "static" | "relative";
}) {
  const {
    values,
    setShowPreview,
    handleSubmit,
    isSubmitting,
    isDraft,
    location,
    submit = "button",

    setIsSubmitting,
    setIsDraft,
    invoiceMain,
    convertAmount,
    bankAccounts,
    bankAccountsMetaData,
    serverImages,
    tableName,
    pageName,
    invoice,
    installments,
    position = "absolute",
  } = props;

  const { isRTL } = useLanguage();
  const navigate = useNavigate();

  const positionClasses =
    position === "absolute"
      ? `absolute top-[85px] sm:top-32 ${isRTL
        ? "left-2 sm:left-16 2xl:left-16"
        : "right-2 sm:right-16 2xl:right-16"
      }`
      : "";

  return (
    <div
      //   initial={{ opacity: 0, x: 20 }}
      //  animate={{ opacity: 1, x: 0 }}
      // transition={{ delay: 0.1 }}
      className="z-10"
    >
      <div
        className={`flex flex-wrap items-center justify-center bg-background px-4 py-3  rounded-lg shadow-md ${positionClasses}`}
      >
        {setShowPreview && (
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className="mx-1 flex items-center justify-center space-x-2 rtl:space-x-reverse px-4  py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors disabled:opacity-50"
          >
            <Eye className="w-4 h-4" />
            <span>{isRTL ? "معاينة" : "Preview"}</span>
          </button>
        )}
        {isDraft && location.state?.action != "edit" && (
          <button
            type="button"
            onClick={() =>
              tableName === "sales_invoices" ||
                tableName === "purchase_invoices"
                ? handleSubmit(
                  values,
                  true,
                  isRTL,
                  setIsSubmitting,
                  setIsDraft,
                  location,
                  convertAmount,
                  bankAccounts,
                  bankAccountsMetaData,
                  serverImages,
                  navigate,
                  tableName,
                  pageName,
                )
                : tableName === "sales_payment" ||
                  tableName === "purchase_payment"
                  ? handleSubmit(
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
                  )
                  : tableName === "sales_credit_notices" ||
                    tableName === "purchase_credit_notices"
                    ? handleSubmit(
                      values,
                      true,
                      isRTL,
                      setIsSubmitting,
                      setIsDraft,
                      location,
                      invoiceMain,
                      serverImages,
                      navigate,
                      tableName,
                      pageName,
                    )
                    : tableName === "sales_return" ||
                      tableName === "purchase_return"
                      ? handleSubmit(
                        values,
                        true,
                        isRTL,
                        setIsSubmitting,
                        setIsDraft,
                        location,
                        invoiceMain,
                        convertAmount,
                        bankAccounts,
                        bankAccountsMetaData,
                        serverImages,
                        navigate,
                        tableName,
                        pageName,
                      )
                      : handleSubmit(values, true)
            }
            disabled={isSubmitting}
            className="mx-1 flex items-center justify-center space-x-2 rtl:space-x-reverse px-4  py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors disabled:opacity-50"
          >
            <>
              <Save className="w-4 h-4" />
              <span>{isRTL ? "مسودة" : "Draft"}</span>
            </>
          </button>
        )}
        {
          <button
            type={submit}
            onClick={() =>
              submit !== "submit"
                ? tableName === "sales_invoices" ||
                  tableName === "purchase_invoices"
                  ? handleSubmit(
                    values,
                    false,
                    isRTL,
                    setIsSubmitting,
                    setIsDraft,
                    location,
                    convertAmount,
                    bankAccounts,
                    bankAccountsMetaData,
                    serverImages,
                    navigate,
                    tableName,
                    pageName,
                  )
                  : tableName === "sales_payment" ||
                    tableName === "purchase_payment"
                    ? handleSubmit(
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
                    )
                    : tableName === "sales_credit_notices" ||
                      tableName === "purchase_credit_notices"
                      ? handleSubmit(
                        values,
                        false,
                        isRTL,
                        setIsSubmitting,
                        setIsDraft,
                        location,
                        invoiceMain,
                        serverImages,
                        navigate,
                        tableName,
                        pageName,
                      )
                      : tableName === "sales_return" ||
                        tableName === "purchase_return"
                        ? handleSubmit(
                          values,
                          false,
                          isRTL,
                          setIsSubmitting,
                          setIsDraft,
                          location,
                          invoiceMain,
                          convertAmount,
                          bankAccounts,
                          bankAccountsMetaData,
                          serverImages,
                          navigate,
                          tableName,
                          pageName,
                        )
                        : handleSubmit(values, false)
                : undefined
            }
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
        }
      </div>
    </div>
  );
}
