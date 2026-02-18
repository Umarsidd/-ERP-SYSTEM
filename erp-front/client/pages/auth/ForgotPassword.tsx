import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import {
  Mail,
  ArrowLeft,
  ArrowRight,
  Building2,
  Globe,
  Loader2,
  CheckCircle,
  Send,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import logo from "@assets/logo4.png";   


const ForgotPasswordSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
});

const ForgotPasswordSchemaAr = Yup.object().shape({
  email: Yup.string()
    .email('عنوان بريد إلكتروني غير صحيح')
    .required('البريد الإلكتروني مطلوب'),
});

export default function ForgotPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [email, setEmail] = useState('');

    const { isRTL, toggleRTL } = useLanguage();

  const handleSubmit = async (values: any) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Forgot password values:', values);
      setEmail(values.email);
      setIsEmailSent(true);
    } catch (error) {
      console.error('Forgot password error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Resending email to:', email);
    } catch (error) {
      console.error('Resend email error:', error);
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
        <div className="text-center mb-">
          <div className="inline-flex items-center space-x-2 rtl:space-x-reverse mb-4">
            <img src={logo} alt="logo" className="w-60 h-60 object-contain" />
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
          {!isEmailSent ? (
            <>
              {/* Forgot Password Form */}
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  {isRTL ? "نسيت كلمة المرور؟" : "Forgot Password?"}
                </h2>
                <p className="text-muted-foreground">
                  {isRTL
                    ? "لا تقلق، سنرسل لك رابط إعادة تعيين كلمة المرور"
                    : "Don't worry, we'll send you a reset link"}
                </p>
              </div>

              <Formik
                initialValues={{ email: "" }}
                validationSchema={
                  isRTL ? ForgotPasswordSchemaAr : ForgotPasswordSchema
                }
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
                            isRTL
                              ? "أدخل بريدك الإلكتروني"
                              : "Enter your email address"
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
                            {isRTL ? "جارِ الإرسال..." : "Sending..."}
                          </span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>
                            {isRTL ? "إرسال رابط الإعادة" : "Send Reset Link"}
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
                  {isRTL ? "تم إرسال البريد الإلكتروني!" : "Email Sent!"}
                </h2>
                <p className="text-muted-foreground">
                  {isRTL
                    ? `تم إرسال رابط إعادة تعيين كلمة المرور إلى ${email}`
                    : `We've sent a password reset link to ${email}`}
                </p>
                <div className="bg-muted/30 rounded-lg p-4 text-sm text-muted-foreground">
                  {isRTL
                    ? "تحقق من صندوق البريد الوارد أو مجلد الرسائل المزعجة"
                    : "Check your inbox or spam folder for the reset link"}
                </div>

                {/* Resend Button */}
                <button
                  onClick={handleResendEmail}
                  disabled={isLoading}
                  className={cn(
                    "w-full bg-muted text-muted-foreground py-3 rounded-lg font-medium",
                    "hover:bg-muted/80 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    "flex items-center justify-center space-x-2 rtl:space-x-reverse",
                    "transition-all duration-200",
                  )}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{isRTL ? "جارِ الإرسال..." : "Sending..."}</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>
                        {isRTL ? "إعادة إرسال البريد" : "Resend Email"}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </>
          )}

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <Link
              to="/auth/login"
              className="inline-flex items-center space-x-2 rtl:space-x-reverse text-primary hover:text-primary/80 font-medium"
            >
              {isRTL ? (
                <ArrowRight className="w-4 h-4" />
              ) : (
                <ArrowLeft className="w-4 h-4" />
              )}
              <span>{isRTL ? "العودة إلى تسجيل الدخول" : "Back to Login"}</span>
            </Link>
          </div>
        </div>

        {/* Help Text */}
        {!isEmailSent && (
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {isRTL ? "تذكرت كلمة المرور؟" : "Remember your password?"}{" "}
              <Link
                to="/auth/login"
                className="text-primary hover:text-primary/80 font-medium"
              >
                {isRTL ? "تسجيل الدخول" : "Sign in"}
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
