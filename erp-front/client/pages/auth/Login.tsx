import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Building2,
  Globe,
  Loader2,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import logo from "@assets/logo4.png";
import { useLanguage } from "@/contexts/LanguageContext";
import { authApi, authApiMain } from "@/lib/authApi";
import CryptoJS from "crypto-js";

const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    //   .min(6, 'Password must be at least 6 characters')
    .required("Password is required"),
  // rememberMe: Yup.boolean(),
});

const LoginSchemaAr = Yup.object().shape({
  email: Yup.string()
    .email("عنوان بريد إلكتروني غير صحيح")
    .required("البريد الإلكتروني مطلوب"),
  password: Yup.string()
    //  .min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل')
    .required("كلمة المرور مطلوبة"),
  // rememberMe: Yup.boolean(),
});

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { isRTL, toggleRTL } = useLanguage();

  const handleSubmit = async (values: any) => {
    setIsLoading(true);
    try {
      const encrypted = CryptoJS.AES.encrypt(
        JSON.stringify("main"),
        import.meta.env.VITE_SECRET,
      ).toString();
      localStorage.setItem("other", encrypted);

     




      var res = await authApiMain.login(values, isRTL);

      const encrypted2 = CryptoJS.AES.encrypt(
        JSON.stringify(res.data.access_token),
        import.meta.env.VITE_SECRET,
      ).toString();
      const encrypted3 = CryptoJS.AES.encrypt(
        JSON.stringify(res.data.refresh_token),
        import.meta.env.VITE_SECRET,
      ).toString();
      const encrypted4 = CryptoJS.AES.encrypt(
        JSON.stringify(res.data.user.invoiceID),
        import.meta.env.VITE_SECRET,
      ).toString();

      localStorage.setItem("somthing", encrypted2);
      localStorage.setItem("somthing2", encrypted3);
      localStorage.setItem("other", encrypted4);
      var res2 = await authApi.login(values, isRTL);

      const encrypted5 = CryptoJS.AES.encrypt(
        JSON.stringify(res2.data),
        import.meta.env.VITE_SECRET,
      ).toString();

        localStorage.setItem("user", encrypted5);
         window.location.href = "/";

         console.log("encrypted", localStorage.getItem("user"));

    } catch (error) {
      console.error("Registration error:", error);
    } finally {
      setIsLoading(false);
    }
  };

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
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 rtl:space-x-reverse mb-">
            <img src={logo} alt="logo" className="w-52 h- object-contain" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            {isRTL ? "مرحباً بعودتك" : "Welcome Back"}
          </h2>
          <p className="text-muted-foreground">
            {isRTL
              ? "قم بتسجيل الدخول للوصول إلى حسابك"
              : "Sign in to access your account"}
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
          <Formik
            initialValues={{
              email: "",
              password: "",
              //  rememberMe: false,
            }}
            validationSchema={isRTL ? LoginSchemaAr : LoginSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched }) => (
              <Form className="space-y-4">
                {/* Email Field */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    {isRTL ? "البريد الإلكتروني" : "Email Address"}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Field
                      name="email"
                      type="email"
                      placeholder={
                        isRTL ? "أدخل بريدك الإلكتروني" : "Enter your email"
                      }
                      className={cn(
                        "w-full pl-10 rtl:pl-4 rtl:pr-10 pr-4 py-3 bg-background border border-border rounded-lg",
                        "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                        "placeholder:text-muted-foreground",
                        errors.email &&
                          touched.email &&
                          "border-destructive focus:ring-destructive",
                      )}
                    />
                  </div>
                  <ErrorMessage
                    name="email"
                    component="div"
                    className="text-sm text-destructive"
                  />
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    {isRTL ? "كلمة المرور" : "Password"}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Field
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder={
                        isRTL ? "أدخل كلمة المرور" : "Enter your password"
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

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2 rtl:space-x-reverse">
                    {/* <Field
                      name="rememberMe"
                      type="checkbox"
                      className="w-4 h-4 text-primary bg-background border border-border rounded focus:ring-primary focus:ring-2"
                    />
                    <span className="text-sm text-foreground">
                      {isRTL ? 'تذكرني' : 'Remember me'}
                    </span> */}
                  </label>
                  {/* <Link
                    to="/auth/forgot-password"
                    className="text-sm text-primary hover:text-primary/80 font-medium"
                  >
                    {isRTL ? "نسيت كلمة المرور؟" : "Forgot password?"}
                  </Link> */}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className={cn(
                    "w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium",
                    "hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    "flex items-center justify-center space-x-2 rtl:space-x-reverse",
                    "transition-all duration-200",
                  )}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>
                        {isRTL ? "جارِ تسجيل الدخول..." : "Signing in..."}
                      </span>
                    </>
                  ) : (
                    <>
                      <span>{isRTL ? "تسجيل الدخول" : "Sign In"}</span>
                      {isRTL ? (
                        <ArrowLeft className="w-4 h-4" />
                      ) : (
                        <ArrowRight className="w-4 h-4" />
                      )}
                    </>
                  )}
                </button>
              </Form>
            )}
          </Formik>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {isRTL ? "ليس لديك حساب؟" : "Don't have an account?"}{" "}
              <Link
                to="/auth/register"
                className="text-primary hover:text-primary/80 font-medium"
              >
                {isRTL ? "إنشاء حساب جديد" : "Sign up"}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
