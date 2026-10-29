
import React, { useState } from "react";
import img1 from "../../assets/kajo.svg";

import { Link } from "react-router-dom";
import {
  FaEnvelope,
  FaLock,
  FaArrowLeft,
  FaPaw,
  FaShieldAlt,
  FaCheckCircle,
  FaExclamationCircle,
  FaSpinner,
  FaPaperPlane,
  FaRedo,
  FaHeart,
} from "react-icons/fa";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// ==========================================
// CONFIGURATION
// ==========================================

const API_BASE = (
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000"
).replace(/\/+$/, "");

const FORGOT_PASSWORD_URL = API_BASE.endsWith("/api")
  ? `${API_BASE}/auth/forgot-password`
  : `${API_BASE}/api/auth/forgot-password`;

// Display development-only reset links.
// Production builds never render them.
const IS_DEVELOPMENT = import.meta.env.DEV;

// ==========================================
// VALIDATION SCHEMA
// ==========================================

const forgetPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "يرجى إدخال البريد الإلكتروني")
    .email("يرجى إدخال بريد إلكتروني صالح"),
});

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function ForgetPassword() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [resetLink, setResetLink] = useState("");
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgetPasswordSchema),
    defaultValues: {
      email: "",
    },
    mode: "onTouched",
  });

  // ========================================
  // SUBMIT REQUEST
  // ========================================

  const onSubmit = async (data) => {
    if (loading) return;

    setLoading(true);
    setServerError("");
    setResetLink("");

    try {
      const response = await fetch(
        FORGOT_PASSWORD_URL,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            email: data.email.trim(),
          }),
        }
      );

      const payload = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        // Avoid revealing whether an email is registered.
        if (response.status === 422) {
          setServerError(
            payload?.errors?.email?.[0] ||
              "يرجى التحقق من صحة البريد الإلكتروني."
          );
          return;
        }

        if (response.status === 429) {
          setServerError(
            "تم إرسال عدد كبير من الطلبات. يرجى المحاولة لاحقاً."
          );
          return;
        }

        throw new Error(
          "تعذر معالجة الطلب حالياً. يرجى المحاولة لاحقاً."
        );
      }

      setSubmittedEmail(data.email.trim());

      // Never display reset links in production.
      if (IS_DEVELOPMENT) {
        const link = payload?.reset_link;
        if (typeof link === "string") {
          try {
            const url = new URL(link);

            if (
              url.protocol === "http:" ||
              url.protocol === "https:"
            ) {
              setResetLink(url.href);
            }
          } catch {
            setResetLink("");
          }
        }
      }

      setIsSubmitted(true);
    } catch (error) {
      setServerError(
        error?.message ||
          "تعذر الاتصال بالخادم. يرجى المحاولة لاحقاً."
      );
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // RESET VIEW
  // ========================================

  const resetFormView = () => {
    setIsSubmitted(false);
    setSubmittedEmail("");
    setResetLink("");
    setServerError("");
  };

  // ========================================
  // RENDER
  // ========================================

  return (
    <main
      dir="rtl"
      className="relative isolate min-h-screen overflow-hidden bg-white text-mainColor transition-colors duration-500 dark:bg-[#101828]"
    >
      {/* BACKGROUND DECORATIONS */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -right-48 -top-48 h-[520px] w-[520px] rounded-full bg-mainColor/5 blur-[110px]" />

        <div className="absolute -bottom-48 -left-40 h-[520px] w-[520px] rounded-full bg-secondaryColor/10 blur-[110px]" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-[1350px] items-center px-4 py-12 sm:px-8 lg:px-12 lg:py-20">
        <div className="grid w-full items-center gap-12 lg:grid-cols-2 lg:gap-20">

          {/* =====================================
              RIGHT SIDE - FORM
          ===================================== */}

          <div className="order-1 mx-auto w-full max-w-[550px]">

            {/* HEADER */}
            <div className="mb-8 text-center lg:text-right">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-mainColor/15 bg-mainColor/5 px-4 py-2 text-xs font-extrabold text-mainColor dark:bg-white/10 dark:text-white">
                <FaShieldAlt size={14} />
                استعادة الوصول إلى حسابك
              </div>

              <h1 className="mb-4 text-3xl font-black leading-snug text-mainColor dark:text-white sm:text-4xl">
                {isSubmitted
                  ? "تحقق من بريدك الإلكتروني"
                  : "نسيت كلمة المرور؟"}

                <span className="text-secondaryColor">.</span>
              </h1>

              <p className="text-sm leading-8 text-secondaryColor dark:text-fourthColor sm:text-base">
                {isSubmitted
                  ? "تم استلام طلبك. إذا كان البريد مسجلاً في كاجو، ستصلك تعليمات إعادة تعيين كلمة المرور."
                  : "لا تقلق، يمكنك طلب استعادة الوصول إلى حسابك بخطوات بسيطة وآمنة."}
              </p>
            </div>

            {/* =====================================
                FORM CARD
            ===================================== */}

            <div className="rounded-[30px] border border-mainColor/10 bg-white p-5 shadow-[0_20px_70px_rgba(0,0,0,0.06)] dark:border-white/10 dark:bg-[#1D2939] sm:p-8">

              {!isSubmitted ? (
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  noValidate
                  className="space-y-6"
                >
                  {/* INTRO */}
                  <div className="mb-7 flex items-start gap-4 rounded-2xl bg-mainColor/5 p-4 dark:bg-white/5">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-mainColor/10 text-mainColor dark:text-white">
                      <FaEnvelope size={21} />
                    </span>

                    <div>
                      <h2 className="mb-1 text-sm font-extrabold text-mainColor dark:text-white">
                        استعادة كلمة المرور
                      </h2>

                      <p className="text-xs leading-7 text-secondaryColor dark:text-fourthColor">
                        أدخل بريدك الإلكتروني لإرسال طلب
                        إعادة تعيين كلمة المرور.
                      </p>
                    </div>
                  </div>

                  {/* EMAIL INPUT */}
                  <div>
                    <label
                      htmlFor="forgot-email"
                      className="mb-2 block text-sm font-bold text-mainColor dark:text-white"
                    >
                      البريد الإلكتروني
                    </label>

                    <div className="relative">
                      <FaEnvelope
                        size={18}
                        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-mainColor/60 dark:text-white/60"
                      />

                      <input
                        id="forgot-email"
                        type="email"
                        dir="ltr"
                        autoComplete="email"
                        placeholder="example@email.com"
                        aria-invalid={Boolean(errors.email)}
                        aria-describedby={
                          errors.email
                            ? "forgot-email-error"
                            : undefined
                        }
                        {...register("email")}
                        className={[
                          "h-[58px] w-full rounded-2xl border",
                          "bg-white py-3 pl-4 pr-12",
                          "text-left text-sm font-medium text-mainColor",
                          "placeholder:text-mainColor/35",
                          "outline-none transition-all duration-200",
                          "dark:bg-[#182434] dark:text-white",
                          "dark:placeholder:text-white/30",
                          "focus:border-mainColor focus:ring-4 focus:ring-mainColor/10",
                          errors.email
                            ? "border-red-500"
                            : "border-mainColor/15 dark:border-white/10",
                        ].join(" ")}
                      />
                    </div>

                    {errors.email && (
                      <p
                        id="forgot-email-error"
                        role="alert"
                        className="mt-2 flex items-center gap-2 text-xs font-medium text-red-500"
                      >
                        <FaExclamationCircle size={13} />
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* SERVER ERROR */}
                  {serverError && (
                    <div
                      role="alert"
                      aria-live="polite"
                      className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-7 text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300"
                    >
                      <FaExclamationCircle
                        size={18}
                        className="mt-1 shrink-0"
                      />

                      <p>{serverError}</p>
                    </div>
                  )}

                  {/* SUBMIT BUTTON */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="group flex h-[58px] w-full items-center justify-center gap-3 rounded-2xl bg-mainColor px-6 text-base font-extrabold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:opacity-90 hover:shadow-xl active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        جارٍ إرسال الطلب...
                      </>
                    ) : (
                      <>
                        <FaPaperPlane size={17} />
                        إرسال طلب الاستعادة
                        <FaArrowLeft
                          size={14}
                          className="transition-transform group-hover:-translate-x-1"
                        />
                      </>
                    )}
                  </button>

                  {/* BACK TO LOGIN */}
                  <div className="border-t border-mainColor/10 pt-6 text-center">
                    <p className="text-sm text-secondaryColor dark:text-fourthColor">
                      تذكرت كلمة المرور؟{" "}
                      <Link
                        to="/login"
                        className="font-extrabold text-mainColor underline-offset-4 hover:underline dark:text-white"
                      >
                        العودة لتسجيل الدخول
                      </Link>
                    </p>
                  </div>
                </form>
              ) : (
                /* =====================================
                    SUCCESS SCREEN
                ===================================== */

                <div
                  className="py-4 text-center"
                  aria-live="polite"
                >
                  {/* SUCCESS ICON */}
                  <div className="relative mx-auto mb-7 flex h-24 w-24 items-center justify-center rounded-full bg-mainColor/10">
                    <span className="absolute inset-2 rounded-full border border-dashed border-mainColor/20" />

                    <FaCheckCircle
                      size={42}
                      className="relative text-mainColor dark:text-white"
                    />
                  </div>

                  <h2 className="mb-3 text-2xl font-black text-mainColor dark:text-white">
                    تم استلام طلبك!
                  </h2>

                  <p className="mx-auto mb-6 max-w-sm text-sm leading-8 text-secondaryColor dark:text-fourthColor">
                    إذا كان البريد الإلكتروني مسجلاً لدينا،
                    ستصلك رسالة تحتوي على تعليمات استعادة
                    كلمة المرور.
                  </p>

                  {/* EMAIL */}
                  <div className="mb-6 rounded-2xl border border-mainColor/10 bg-mainColor/5 p-4 dark:bg-white/5">
                    <p className="mb-2 text-xs font-bold text-secondaryColor dark:text-fourthColor">
                      البريد الذي أدخلته
                    </p>

                    <p
                      dir="ltr"
                      className="break-all text-sm font-extrabold text-mainColor dark:text-white"
                    >
                      {submittedEmail}
                    </p>
                  </div>

                  {/* DEVELOPMENT RESET LINK */}
                  {IS_DEVELOPMENT && resetLink && (
                    <div className="mb-6 rounded-2xl border border-mainColor/20 bg-mainColor/5 p-4 text-right dark:bg-white/5">
                      <p className="mb-2 text-sm font-extrabold text-mainColor dark:text-white">
                        رابط إعادة التعيين — وضع التطوير
                      </p>

                      <p className="mb-4 text-xs leading-6 text-secondaryColor dark:text-fourthColor">
                        هذا الرابط مخصص للاختبار المحلي
                        ويجب عدم إتاحته في بيئة الإنتاج.
                      </p>

                      <a
                        href={resetLink}
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl bg-mainColor px-5 py-3 text-sm font-bold text-white"
                      >
                        فتح رابط إعادة التعيين
                        <FaArrowLeft size={13} />
                      </a>
                    </div>
                  )}

                  {/* ACTIONS */}
                  <div className="space-y-3">
                    <Link
                      to="/login"
                      className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-mainColor px-6 text-sm font-extrabold text-white shadow-md transition-all hover:-translate-y-0.5 hover:opacity-90"
                    >
                      العودة لتسجيل الدخول
                      <FaArrowLeft size={13} />
                    </Link>

                    <button
                      type="button"
                      onClick={resetFormView}
                      className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl border border-mainColor/15 bg-white px-6 text-sm font-bold text-mainColor transition-colors hover:bg-mainColor/5 dark:bg-[#182434] dark:text-white"
                    >
                      <FaRedo size={13} />
                      استخدام بريد إلكتروني آخر
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* SECURITY NOTE */}
            <div className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-secondaryColor dark:text-fourthColor">
              <FaShieldAlt className="text-mainColor dark:text-white" />
              لا تشارك رابط إعادة تعيين كلمة المرور مع أي شخص.
            </div>
          </div>

          {/* =====================================
              LEFT SIDE - BRAND VISUAL
          ===================================== */}

          <div className="order-2 hidden flex-col items-center justify-center text-center lg:flex">

            {/* IMAGE */}
            <div className="relative mb-10 flex aspect-square w-full max-w-[500px] items-center justify-center">
              <div className="absolute inset-[7%] rounded-full border border-mainColor/10 bg-gradient-to-br from-mainColor/10 via-white to-secondaryColor/10 dark:via-[#101828]" />

              <div className="absolute inset-[1%] rounded-full border border-dashed border-mainColor/15" />

              <div className="absolute left-[12%] top-[15%] h-4 w-4 rounded-full bg-secondaryColor" />

              <div className="absolute bottom-[12%] right-[15%] h-3 w-3 rounded-full bg-mainColor" />

              <img
                src={img1}
                alt="كاجو - منصة الخدمات البيطرية"
                className="relative z-10 w-[75%] max-h-[78%] object-contain drop-shadow-xl transition-transform duration-500 hover:scale-105"
              />

              {/* FLOATING CARD */}
              <div className="absolute bottom-[6%] right-[1%] z-20 flex items-center gap-3 rounded-2xl border border-mainColor/10 bg-white px-5 py-4 shadow-xl dark:bg-[#1D2939]">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-mainColor/10 text-mainColor dark:text-white">
                  <FaHeart size={20} />
                </span>

                <div className="text-right">
                  <p className="text-sm font-extrabold text-mainColor dark:text-white">
                    لأنهم من عائلتنا
                  </p>

                  <p className="mt-1 text-xs text-secondaryColor dark:text-fourthColor">
                    كل الرعاية في مكان واحد
                  </p>
                </div>
              </div>
            </div>

            {/* BRAND MESSAGE */}
            <div className="max-w-[440px]">
              <h2 className="mb-4 text-3xl font-black leading-snug text-mainColor dark:text-white">
                حسابك في كاجو
                <br />
                <span className="text-secondaryColor">
                  دائماً معك!
                </span>
              </h2>

              <p className="text-base leading-8 text-secondaryColor dark:text-fourthColor">
                استعد الوصول إلى حسابك، وواصل الاستفادة
                من خدمات الرعاية البيطرية والتبنّي
                والمتاجر في مكان واحد.
              </p>
            </div>

            {/* FEATURES */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              {[
                "حسابك",
                "خدمات أليفك",
                "مجتمع كاجو",
              ].map((text) => (
                <span
                  key={text}
                  className="inline-flex items-center gap-2 rounded-full border border-mainColor/10 bg-mainColor/5 px-4 py-2 text-xs font-bold text-mainColor dark:bg-white/10 dark:text-white"
                >
                  <FaCheckCircle size={12} />
                  {text}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
