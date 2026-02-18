import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import CryptoJS from "crypto-js";
import {
  Eye,
  EyeOff,
  Lock,
  ArrowLeft,
  ArrowRight,
  Building2,
  Globe,
  Loader2,
  CheckCircle,
  Shield,
  Key,
} from "lucide-react";
import { cn } from "@/lib/utils";
import logo from "@assets/logo4.png";
import { useLanguage } from "@/contexts/LanguageContext";
import { authApi } from "@/lib/authApi";

const ResetPasswordSchema = Yup.object().shape({
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number",
    )
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Confirm password is required"),
});

const ResetPasswordSchemaAr = Yup.object().shape({
  password: Yup.string()
    .min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "كلمة المرور يجب أن تحتوي على حرف كبير وحرف صغير ورقم",
    )
    .required("كلمة المرور مطلوبة"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "كلمات المرور غير متطابقة")
    .required("تأكيد كلمة المرور مطلوب"),
});

export default function ResetPassword() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { isRTL, toggleRTL } = useLanguage();

  const navigate = useNavigate();

  const handleSubmit = async (values: any) => {
    setIsLoading(true);
    try {
      await authApi.update(
        JSON.parse(
          CryptoJS.AES.decrypt(
            localStorage.getItem("user"),
            import.meta.env.VITE_SECRET,
          ).toString(CryptoJS.enc.Utf8),
        )?.user.id,
        {
          password: values.password,
        },
      );

      navigate(-1);
    } catch (error) {
      console.error("Reset password error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // const redirectToLogin = () => {
  //   setTimeout(() => {
  //     window.location.href = '/auth/login';
  //   }, 3000);
  // };

  // if (isSuccess) {
  //   redirectToLogin();
  // }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-primary/5 to-primary/10 flex items- justify-center p-4"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Language Toggle */}
      <button
        onClick={toggleRTL}
        className="fixed top-4 right-4 rtl:right-auto rtl:left-4 p-2 rounded-lg bg-card border border-border hover:bg-muted transition-colors z-10"
        title={isRTL ? "Switch to English" : "التبديل إلى العربية"}
      >
        <Globe className="w-5 h-5" />
      </button>

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-">
          <div className="inline-flex items-center space-x-2 rtl:space-x-reverse mb-">
            <img src={logo} alt="logo" className="w-52 h- object-contain" />
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
          {!isSuccess ? (
            <>
              {/* Reset Password Form */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Key className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  {isRTL ? "إعادة تعيين كلمة المرور" : "Reset Password"}
                </h2>
                <p className="text-muted-foreground">
                  {isRTL
                    ? "أدخل كلمة مرور جديدة قوية لحسابك"
                    : "Enter a new strong password for your account"}
                </p>
              </div>

              <Formik
                initialValues={{
                  password: "",
                  confirmPassword: "",
                }}
                validationSchema={
                  isRTL ? ResetPasswordSchemaAr : ResetPasswordSchema
                }
                onSubmit={handleSubmit}
              >
                {({ errors, touched, values }) => (
                  <Form className="space-y-4">
                    {/* Password Field */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        {isRTL ? "كلمة المرور الجديدة" : "New Password"}
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Field
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder={
                            isRTL
                              ? "أدخل كلمة المرور الجديدة"
                              : "Enter new password"
                          }
                          className={cn(
                            "w-full pl-10 rtl:pl-4 rtl:pr-10 pr-12 rtl:pr-12 rtl:pl-12 py-3 bg-background border border-border rounded-lg",
                            "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                            "placeholder:text-muted-foreground",
                            errors.password &&
                              touched.password &&
                              "border-destructive focus:ring-destructive",
                          )}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 rtl:right-auto rtl:left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      <ErrorMessage
                        name="password"
                        component="div"
                        className="text-sm text-destructive"
                      />
                    </div>

                    {/* Confirm Password Field */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        {isRTL ? "تأكيد كلمة المرور" : "Confirm Password"}
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Field
                          name="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder={
                            isRTL ? "تأكيد كلمة المرور" : "Confirm new password"
                          }
                          className={cn(
                            "w-full pl-10 rtl:pl-4 rtl:pr-10 pr-12 rtl:pr-12 rtl:pl-12 py-3 bg-background border border-border rounded-lg",
                            "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                            "placeholder:text-muted-foreground",
                            errors.confirmPassword &&
                              touched.confirmPassword &&
                              "border-destructive focus:ring-destructive",
                          )}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute right-3 rtl:right-auto rtl:left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      <ErrorMessage
                        name="confirmPassword"
                        component="div"
                        className="text-sm text-destructive"
                      />
                    </div>

                    {/* Password Strength Indicator */}
                    {values.password && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-foreground">
                          {isRTL ? "قوة كلمة المرور:" : "Password Strength:"}
                        </p>
                        <div className="space-y-1">
                          <div
                            className={cn(
                              "flex items-center space-x-2 rtl:space-x-reverse text-xs",
                              values.password.length >= 8
                                ? "text-success"
                                : "text-muted-foreground",
                            )}
                          >
                            <CheckCircle className="w-3 h-3" />
                            <span>
                              {isRTL
                                ? "على الأقل 8 أحرف"
                                : "At least 8 characters"}
                            </span>
                          </div>
                          <div
                            className={cn(
                              "flex items-center space-x-2 rtl:space-x-reverse text-xs",
                              /[A-Z]/.test(values.password)
                                ? "text-success"
                                : "text-muted-foreground",
                            )}
                          >
                            <CheckCircle className="w-3 h-3" />
                            <span>
                              {isRTL ? "حرف كبير واحد" : "One uppercase letter"}
                            </span>
                          </div>
                          <div
                            className={cn(
                              "flex items-center space-x-2 rtl:space-x-reverse text-xs",
                              /[a-z]/.test(values.password)
                                ? "text-success"
                                : "text-muted-foreground",
                            )}
                          >
                            <CheckCircle className="w-3 h-3" />
                            <span>
                              {isRTL ? "حرف صغير واحد" : "One lowercase letter"}
                            </span>
                          </div>
                          <div
                            className={cn(
                              "flex items-center space-x-2 rtl:space-x-reverse text-xs",
                              /\d/.test(values.password)
                                ? "text-success"
                                : "text-muted-foreground",
                            )}
                          >
                            <CheckCircle className="w-3 h-3" />
                            <span>{isRTL ? "رقم واحد" : "One number"}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className={cn(
                        "w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium",
                        "hover:bg-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                        "disabled:opacity-50 disabled:cursor-not-allowed",
                        "flex items-center justify-center space-x-2 rtl:space-x-reverse",
                        "transition-all duration-200",
                      )}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>
                            {isRTL
                              ? "جارِ تحديث كلمة المرور..."
                              : "Updating password..."}
                          </span>
                        </>
                      ) : (
                        <>
                          <Shield className="w-4 h-4" />
                          <span>
                            {isRTL ? "تحديث كلمة المرور" : "Update Password"}
                          </span>
                        </>
                      )}
                    </button>
                  </Form>
                )}
              </Formik>
            </>
          ) : (
            <>
              {/* Success Message */}
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8 text-success" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">
                  {isRTL
                    ? "تم تحديث كلمة المرور بنجاح!"
                    : "Password Updated Successfully!"}
                </h2>
                <p className="text-muted-foreground">
                  {isRTL
                    ? "تم تحديث كلمة المرور الخاصة بك بنجاح. سيتم توجيهك إلى صفحة تسجيل الدخول"
                    : "Your password has been updated successfully. You will be redirected to the login page"}
                </p>
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
              </div>
            </>
          )}

          {/* Back to Login */}
          {/* {!isSuccess && (
            <div className="mt-6 text-center">
              <Link
                to="/auth/login"
                className="inline-flex items-center space-x-2 rtl:space-x-reverse text-primary hover:text-primary font-medium"
              >
                {isRTL ? (
                  <ArrowRight className="w-4 h-4" />
                ) : (
                  <ArrowLeft className="w-4 h-4" />
                )}
                <span>
                  {isRTL ? "العودة إلى تسجيل الدخول" : "Back to Login"}
                </span>
              </Link>
            </div>
          )} */}
        </div>

        {/* Security Notice */}
        {!isSuccess && (
          <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-border">
            <p className="text-xs text-muted-foreground text-center">
              {isRTL
                ? "تأكد من استخدام كلمة مرور قوية تحتوي على أحرف كبيرة وصغيرة وأرقام"
                : "Make sure to use a strong password with uppercase, lowercase letters and numbers"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
