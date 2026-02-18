import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Globe,
  Loader2,
  CheckCircle,
  RefreshCw,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import logo from "@assets/logo4.png";   
import { useLanguage } from '@/contexts/LanguageContext';

const OTPSchema = Yup.object().shape({
  otp: Yup.string()
    .matches(/^\d{6}$/, 'OTP must be 6 digits')
    .required('OTP is required'),
});

const OTPSchemaAr = Yup.object().shape({
  otp: Yup.string()
    .matches(/^\d{6}$/, 'رمز التحقق يجب أن يكون 6 أرقام')
    .required('رمز التحقق مطلوب'),
});

export default function OTP() {
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const { isRTL, toggleRTL } = useLanguage();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [countdown]);



  const handleOtpChange = (index: number, value: string) => {
    const newOtpValues = [...otpValues];
    newOtpValues[index] = value;
    setOtpValues(newOtpValues);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (values: any) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('OTP verification:', values);
      // Redirect to reset password or dashboard based on context
      window.location.href = '/auth/reset-password';
    } catch (error) {
      console.error('OTP verification error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsResending(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Resending OTP');
      setCountdown(60);
      setCanResend(false);
      // Clear current OTP
      setOtpValues(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (error) {
      console.error('Resend OTP error:', error);
    } finally {
      setIsResending(false);
    }
  };

  const otpString = otpValues.join('');

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

        {/* OTP Verification Form */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              {isRTL ? "التحقق من رمز الأمان" : "Verify Security Code"}
            </h2>
            <p className="text-muted-foreground">
              {isRTL
                ? "أدخل الرمز المكون من 6 أرقام المرسل إلى بريدك الإلكتروني"
                : "Enter the 6-digit code sent to your email"}
            </p>
          </div>

          <Formik
            initialValues={{ otp: otpString }}
            validationSchema={isRTL ? OTPSchemaAr : OTPSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ setFieldValue, errors, touched }) => {
              // Update formik value when OTP changes
              useEffect(() => {
                setFieldValue("otp", otpString);
              }, [otpString, setFieldValue]);

              return (
                <Form className="space-y-6">
                  {/* OTP Input Fields */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground text-center block">
                      {isRTL ? "رمز التحقق" : "Verification Code"}
                    </label>
                    <div className="flex justify-center space-x-3 rtl:space-x-reverse">
                      {otpValues.map((value, index) => (
                        <input
                          key={index}
                          ref={(el) => (inputRefs.current[index] = el)}
                          type="text"
                          maxLength={1}
                          value={value}
                          onChange={(e) =>
                            handleOtpChange(
                              index,
                              e.target.value.replace(/\D/g, ""),
                            )
                          }
                          onKeyDown={(e) => handleKeyDown(index, e)}
                          className={cn(
                            "w-12 h-12 text-center text-lg font-semibold bg-background border border-border rounded-lg",
                            "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                            "transition-all duration-200",
                            errors.otp &&
                              touched.otp &&
                              "border-destructive focus:ring-destructive",
                          )}
                        />
                      ))}
                    </div>
                    <Field name="otp" type="hidden" />
                    <ErrorMessage
                      name="otp"
                      component="div"
                      className="text-sm text-destructive text-center"
                    />
                  </div>

                  {/* Countdown Timer */}
                  <div className="text-center">
                    {!canResend ? (
                      <p className="text-sm text-muted-foreground">
                        {isRTL
                          ? `يمكنك طلب رمز جديد خلال ${countdown} ثانية`
                          : `You can request a new code in ${countdown} seconds`}
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={isResending}
                        className="inline-flex items-center space-x-2 rtl:space-x-reverse text-primary hover:text-primary/80 font-medium disabled:opacity-50"
                      >
                        {isResending ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>
                              {isRTL ? "جارِ الإرسال..." : "Sending..."}
                            </span>
                          </>
                        ) : (
                          <>
                            <RefreshCw className="w-4 h-4" />
                            <span>
                              {isRTL ? "إرسال رمز جديد" : "Send new code"}
                            </span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading || otpString.length !== 6}
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
                        <span>{isRTL ? "جارِ التحقق..." : "Verifying..."}</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span>{isRTL ? "تحقق من الرمز" : "Verify Code"}</span>
                      </>
                    )}
                  </button>
                </Form>
              );
            }}
          </Formik>

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

        {/* Security Notice */}
        <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-border">
          <p className="text-xs text-muted-foreground text-center">
            {isRTL
              ? "لأمانك، لا تشارك رمز التحقق مع أي شخص آخر"
              : "For your security, do not share this verification code with anyone"}
          </p>
        </div>
      </div>
    </div>
  );
}
