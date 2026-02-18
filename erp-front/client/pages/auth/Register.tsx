import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  Building2,
  Globe,
  Loader2,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import logo from "@assets/logo4.png";
import { useLanguage } from "@/contexts/LanguageContext";
import { generateNumber } from "@/lib/products_function";
import { authApi, authApiMain } from "@/lib/authApi";
import CryptoJS from "crypto-js";

const RegisterSchema = Yup.object().shape({
  firstName: Yup.string()
    .min(2, "First name must be at least 2 characters")
    .required("First name is required"),
  lastName: Yup.string()
    .min(2, "Last name must be at least 2 characters")
    .required("Last name is required"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  // phone: Yup.string()
  //   .matches(/^[\+]?[0-9][\d]{0,15}$/, "Invalid phone number")
  //   .required("Phone number is required"),
  // password: Yup.string()
  //   .min(8, "Password must be at least 8 characters")
  //   .matches(
  //     /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
  //     "Password must contain at least one uppercase letter, one lowercase letter, and one number",
  //   )
  //   .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Confirm password is required"),
  agreeToTerms: Yup.boolean().oneOf(
    [true],
    "You must agree to the terms and conditions",
  ),
});

const RegisterSchemaAr = Yup.object().shape({
  firstName: Yup.string()
    .min(2, "الاسم الأول يجب أن يكون حرفين على الأقل")
    .required("الاسم الأول مطلوب"),
  lastName: Yup.string()
    .min(2, "اسم العائلة يجب أن يكون حرفين على الأقل")
    .required("اسم العائلة مطلوب"),
  email: Yup.string()
    .email("عنوان بريد إلكتروني غير صحيح")
    .required("البريد الإلكتروني مطلوب"),
  // phone: Yup.string()
  //   .matches(/^[\+]?[1-9][\d]{0,15}$/, "رقم هاتف غير صحيح")
  //   .required("رقم الهاتف مطلوب"),
  // password: Yup.string()
  //   .min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل")
  //   .matches(
  //     /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
  //     "كلمة المرور يجب أن تحتوي على حرف كبير وحرف صغير ورقم",
  //   )
  //    .required("كلمة المرور مطلوبة"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "كلمات المرور غير متطابقة")
    .required("تأكيد كلمة المرور مطلوب"),
  agreeToTerms: Yup.boolean().oneOf([true], "يجب الموافقة على الشروط والأحكام"),
});

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { isRTL, toggleRTL } = useLanguage();

  const [initialValues, setInitialValues] = useState({
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    role: "Admin",
    firstName: "",
    lastName: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
    name: "",
    type: "individual",
    elementNumber: generateNumber("USR"),
    code: generateNumber("USR"),
    company: "",
    email: "",
    phone: "",
    altPhone: "",
    vatNumber: "",
    taxId: "",
    currency: "",
    creditLimit: "",
    address: "",
    city: "",
    state: "",
    postal: "",
    country: "",
    notes: "",
    contacts: [],
    attachments: [],
    subRole: "Admin",
  });

  const handleSubmit = async (values: any) => {
    setIsLoading(true);
    try {
      const encrypted = CryptoJS.AES.encrypt(
        JSON.stringify("main"),
        import.meta.env.VITE_SECRET,
      ).toString();
      localStorage.setItem("other", encrypted);
      var x = {
        role: "Admin",
        invoiceID: "",
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone,
        password: values.password,
        status: "Active",
        main: JSON.stringify({
          ...values,
          password: "",
          confirmPassword: "",
          name: values.firstName + " " + values.lastName,
        }),
        issueDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        elementNumber: values.firstName + " " + values.lastName,
        name: values.firstName + " " + values.lastName,
      };
      var res = await authApiMain.registerWithDataBase(x, isRTL);


            const encrypted2 = CryptoJS.AES.encrypt(
              JSON.stringify(res.data.access_token2),
              import.meta.env.VITE_SECRET,
            ).toString();
            const encrypted3 = CryptoJS.AES.encrypt(
              JSON.stringify(res.data.refresh_token2),
              import.meta.env.VITE_SECRET,
            ).toString();
            const encrypted4 = CryptoJS.AES.encrypt(
              JSON.stringify(res.data.dumyTestData),
              import.meta.env.VITE_SECRET,
            ).toString();
                  const encrypted5 = CryptoJS.AES.encrypt(
                    JSON.stringify(res.data),
                    import.meta.env.VITE_SECRET,
                  ).toString();


      localStorage.setItem("somthing", encrypted2);
      localStorage.setItem("somthing2", encrypted3);
      localStorage.setItem("other", encrypted4);

      localStorage.setItem("user", encrypted5);
      window.location.href = "/";
    } catch (error) {
      console.error("Registration error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-primary/5 to-primary/10 flex items- justify-center p-"
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

      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 rtl:space-x-reverse mb-">
            <img src={logo} alt="logo" className="w- h-40 object-" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            {isRTL ? "إنشاء حساب جديد" : "Create New Account"}
          </h2>
          <p className="text-muted-foreground">
            {isRTL
              ? "قم بإنشاء حسابك للبدء في استخدام النظام"
              : "Create your account to start using the system"}
          </p>
        </div>

        {/* Registration Form */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
          <Formik
            initialValues={initialValues}
            validationSchema={isRTL ? RegisterSchemaAr : RegisterSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched, values }) => (
              <Form className="space-y-4">
                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      {isRTL ? "الاسم الأول" : "First Name"}
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Field
                        name="firstName"
                        type="text"
                        placeholder={isRTL ? "الاسم الأول" : "First name"}
                        className={cn(
                          "w-full pl-10 rtl:pl-4 rtl:pr-10 pr-4 py-3 bg-background border border-border rounded-lg",
                          "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                          "placeholder:text-muted-foreground",
                          errors.firstName &&
                            touched.firstName &&
                            "border-destructive focus:ring-destructive",
                        )}
                      />
                    </div>
                    <ErrorMessage
                      name="firstName"
                      component="div"
                      className="text-sm text-destructive"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      {isRTL ? "اسم العائلة" : "Last Name"}
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Field
                        name="lastName"
                        type="text"
                        placeholder={isRTL ? "اسم العائلة" : "Last name"}
                        className={cn(
                          "w-full pl-10 rtl:pl-4 rtl:pr-10 pr-4 py-3 bg-background border border-border rounded-lg",
                          "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                          "placeholder:text-muted-foreground",
                          errors.lastName &&
                            touched.lastName &&
                            "border-destructive focus:ring-destructive",
                        )}
                      />
                    </div>
                    <ErrorMessage
                      name="lastName"
                      component="div"
                      className="text-sm text-destructive"
                    />
                  </div>
                </div>

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

                {/* Phone Field */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    {isRTL ? "رقم الهاتف" : "Phone Number"}
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Field
                      dir={isRTL ? "rtl" : "ltr"}
                      name="phone"
                      type="tel"
                      placeholder={
                        isRTL ? "أدخل رقم هاتفك" : "Enter your phone number"
                      }
                      className={cn(
                        "w-full pl-10 rtl:pl-4 rtl:pr-10 pr-4 py-3 bg-background border border-border rounded-lg",
                        "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                        "placeholder:text-muted-foreground",
                        errors.phone &&
                          touched.phone &&
                          "border-destructive focus:ring-destructive",
                      )}
                    />
                  </div>
                  <ErrorMessage
                    name="phone"
                    component="div"
                    className="text-sm text-destructive"
                  />
                </div>

                {/* Password Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      {isRTL ? "كلمة المرور" : "Password"}
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Field
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder={isRTL ? "كلمة المرور" : "Password"}
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
                          isRTL ? "تأكيد كلمة المرور" : "Confirm password"
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
                          {isRTL ? "على الأقل 8 أحرف" : "At least 8 characters"}
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

                {/* Terms Agreement */}
                <div className="space-y-2">
                  <label className="flex items-start space-x-2 rtl:space-x-reverse">
                    <Field
                      name="agreeToTerms"
                      type="checkbox"
                      className="w-4 h-4 mt-1 text-primary bg-background border border-border rounded focus:ring-primary focus:ring-2"
                    />
                    <span className="text-sm text-foreground">
                      {isRTL ? "أوافق على" : "I agree to the"}{" "}
                      <span
                        //to="/terms"
                        className="text-primary hover:text-primary font-medium"
                      >
                        {isRTL ? "الشروط والأحكام" : "Terms and Conditions"}
                      </span>{" "}
                      {isRTL ? "و" : "and"}{" "}
                      <span
                        // to="/privacy"
                        className="text-primary hover:text-primary font-medium"
                      >
                        {isRTL ? "سياسة الخصوصية" : "Privacy Policy"}
                      </span>
                    </span>
                  </label>
                  <ErrorMessage
                    name="agreeToTerms"
                    component="div"
                    className="text-sm text-destructive"
                  />
                </div>

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
                        {isRTL ? "جارِ إنشاء الحساب..." : "Creating account..."}
                      </span>
                    </>
                  ) : (
                    <>
                      <span>{isRTL ? "إنشاء حساب" : "Create Account"}</span>
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

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {isRTL ? "لديك حساب بالفعل؟" : "Already have an account?"}{" "}
              <Link
                to="/auth/login"
                className="text-primary hover:text-primary font-medium"
              >
                {isRTL ? "تسجيل الدخول" : "Sign in"}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
