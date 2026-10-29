
import React, { useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import {
  FaLock,
  FaEye,
  FaEyeSlash,
  FaShieldAlt,
  FaCheckCircle,
  FaExclamationCircle,
  FaSpinner,
  FaArrowLeft,
  FaPaw,
  FaKey,
  FaHeart,
  FaEnvelope,
} from "react-icons/fa";

import kajoLogo from "../../assets/kajo.svg";

// ==========================================
// API CONFIGURATION
// ==========================================

const API_BASE = (
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000"
).replace(/\/+$/, "");

const RESET_PASSWORD_URL = API_BASE.endsWith("/api")
  ? `${API_BASE}/auth/reset-password`
  : `${API_BASE}/api/auth/reset-password`;

// ==========================================
// PASSWORD VALIDATION
// ==========================================

function getPasswordStrength(password) {
  if (!password) return 0;

  let score = 0;

  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
    score++;
  }
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  return Math.min(score, 4);
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  visible,
  onToggleVisibility,
  placeholder,
  autoComplete,
  error,
  disabled,
}) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="block text-sm font-extrabold text-mainColor dark:text-white"
      >
        {label}
      </label>

      <div className="relative">
        <FaLock
          size={17}
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-mainColor/60 dark:text-white/60"
        />

        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className={[
            "h-14 w-full rounded-2xl border bg-white",
            "py-3 pl-14 pr-12 text-sm font-medium",
            "text-mainColor placeholder:text-mainColor/35",
            "outline-none transition-all",
            "focus:border-mainColor focus:ring-4 focus:ring-mainColor/10",
            "disabled:cursor-not-allowed disabled:opacity-60",
            "dark:bg-[#101828] dark:text-white",
            "dark:placeholder:text-white/30",
            error
              ? "border-red-500"
              : "border-mainColor/15 dark:border-white/10",
          ].join(" ")}
        />

        <button
          type="button"
          onClick={onToggleVisibility}
          disabled={disabled}
          aria-label={
            visible ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"
          }
          aria-pressed={visible}
          className="absolute left-3 top-1/2 -translate-y-1/2 rounded-xl p-2 text-mainColor/60 transition-colors hover:bg-mainColor/10 disabled:opacity-50 dark:text-white/70"
        >
          {visible ? (
            <FaEyeSlash size={18} />
          ) : (
            <FaEye size={18} />
          )}
        </button>
      </div>

      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="flex items-center gap-2 text-xs font-medium text-red-500"
        >
          <FaExclamationCircle size={13} />
          {error}
        </p>
      )}
    </div>
  );
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function ResetPassword() {
  const [params] = useSearchParams();

  // useSearchParams already decodes URL parameters.
  const token = params.get("token") || "";
  const email = params.get("email") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const submittingRef = useRef(false);

  // ========================================
  // VALIDATION
  // ========================================

  const validLink = Boolean(
    token.trim() &&
    email.trim() &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  );

  const passwordError = useMemo(() => {
    if (!password) {
      return "يرجى إدخال كلمة المرور الجديدة.";
    }

    if (password.length < 8) {
      return "يجب أن تتكون كلمة المرور من 8 أحرف على الأقل.";
    }

    return "";
  }, [password]);

  const confirmError = useMemo(() => {
    if (!confirmPassword) {
      return "يرجى تأكيد كلمة المرور.";
    }

    if (password !== confirmPassword) {
      return "كلمتا المرور غير متطابقتين.";
    }

    return "";
  }, [password, confirmPassword]);

  const strength = useMemo(
    () => getPasswordStrength(password),
    [password]
  );

  const strengthInfo =
    strength <= 1
      ? { label: "ضعيفة", color: "bg-red-500" }
      : strength === 2
      ? { label: "متوسطة", color: "bg-secondaryColor" }
      : strength === 3
      ? { label: "جيدة", color: "bg-mainColor" }
      : { label: "قوية", color: "bg-mainColor" };

  const canSubmit =
    validLink &&
    !passwordError &&
    !confirmError &&
    !loading &&
    !success;

  // ========================================
  // SUBMIT
  // ========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSubmitted(true);
    setServerError("");

    if (!canSubmit || submittingRef.current) {
      return;
    }

    submittingRef.current = true;
    setLoading(true);

    try {
      const response = await fetch(RESET_PASSWORD_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          token,
          email,
          password,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 422) {
          const validationErrors = data?.errors;

          const message =
            validationErrors?.password?.[0] ||
            validationErrors?.token?.[0] ||
            validationErrors?.email?.[0] ||
            data?.message ||
            "بيانات إعادة التعيين غير صالحة.";

          setServerError(message);
          return;
        }

        if (response.status === 429) {
          setServerError(
            "تم إرسال عدد كبير من الطلبات. حاول مجدداً لاحقاً."
          );
          return;
        }

        setServerError(
          data?.message ||
            "تعذر تغيير كلمة المرور. يرجى المحاولة مجدداً."
        );
        return;
      }

      setSuccess(true);

      // Remove password values from React state.
      setPassword("");
      setConfirmPassword("");

      // Do not navigate automatically.
      // The user can proceed using the login button.
    } catch {
      setServerError(
        "تعذر الاتصال بالخادم. تأكد من اتصالك بالإنترنت وحاول مجدداً."
      );
    } finally {
      submittingRef.current = false;
      setLoading(false);
    }
  };

  // ========================================
  // RENDER
  // ========================================

  return (
    <main
      dir="rtl"
      className="relative isolate min-h-screen overflow-hidden bg-white text-mainColor transition-colors duration-500 dark:bg-[#101828]"
    >
      {/* BACKGROUND */}
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
              FORM SIDE
          ===================================== */}

          <div className="order-1 mx-auto w-full max-w-[550px]">

            {/* HEADER */}
            <div className="mb-8 text-center lg:text-right">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-mainColor/15 bg-mainColor/5 px-4 py-2 text-xs font-extrabold text-mainColor dark:bg-white/10 dark:text-white">
                <FaShieldAlt size={14} />
                أمان حسابك في كاجو
              </div>

              <h1 className="mb-4 text-3xl font-black leading-snug text-mainColor dark:text-white sm:text-4xl">
                {success
                  ? "تم تغيير كلمة المرور!"
                  : "تعيين كلمة مرور جديدة"}

                <span className="text-secondaryColor">.</span>
              </h1>

              <p className="text-sm leading-8 text-secondaryColor dark:text-fourthColor sm:text-base">
                {success
                  ? "أصبح بإمكانك استخدام كلمة المرور الجديدة لتسجيل الدخول إلى حسابك."
                  : "اختر كلمة مرور قوية لحماية حسابك ومتابعة رحلتك مع كاجو."}
              </p>
            </div>

            {/* CARD */}
            <div className="rounded-[30px] border border-mainColor/10 bg-white p-5 shadow-[0_20px_70px_rgba(0,0,0,0.06)] dark:border-white/10 dark:bg-[#1D2939] sm:p-8">

              {/* =====================================
                  SUCCESS
              ===================================== */}
              {success ? (
                <div
                  role="status"
                  aria-live="polite"
                  className="py-5 text-center"
                >
                  <div className="relative mx-auto mb-7 flex h-24 w-24 items-center justify-center rounded-full bg-mainColor/10">
                    <span className="absolute inset-2 rounded-full border border-dashed border-mainColor/20" />

                    <FaCheckCircle
                      size={43}
                      className="relative text-mainColor dark:text-white"
                    />
                  </div>

                  <h2 className="mb-4 text-2xl font-black text-mainColor dark:text-white">
                    تمت إعادة التعيين بنجاح
                  </h2>

                  <p className="mx-auto mb-8 max-w-sm text-sm leading-8 text-secondaryColor dark:text-fourthColor">
                    تم تحديث كلمة المرور بنجاح.
                    يمكنك الآن تسجيل الدخول باستخدام
                    كلمة المرور الجديدة.
                  </p>

                  <Link
                    to="/login"
                    replace="true"
                    className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-mainColor px-6 text-sm font-extrabold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:opacity-90"
                  >
                    الانتقال لتسجيل الدخول
                    <FaArrowLeft size={14} />
                  </Link>
                </div>
              ) : !validLink ? (
                /* =====================================
                    INVALID LINK
                ===================================== */
                <div className="py-5 text-center">
                  <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-red-50 text-red-500 dark:bg-red-950/20">
                    <FaExclamationCircle size={41} />
                  </div>

                  <h2 className="mb-4 text-xl font-black text-mainColor dark:text-white">
                    رابط الاستعادة غير صالح
                  </h2>

                  <p className="mb-7 text-sm leading-8 text-secondaryColor dark:text-fourthColor">
                    الرابط غير مكتمل أو لا يحتوي على بيانات
                    الاستعادة المطلوبة. يرجى طلب رابط جديد
                    عبر صفحة استعادة كلمة المرور.
                  </p>

                  <Link
                    to="/forgot-password"
                    className="flex h-14 items-center justify-center gap-3 rounded-2xl bg-mainColor px-6 text-sm font-extrabold text-white shadow-md transition-opacity hover:opacity-90"
                  >
                    طلب رابط استعادة جديد
                    <FaArrowLeft size={13} />
                  </Link>
                </div>
              ) : (
                /* =====================================
                    RESET FORM
                ===================================== */
                <form
                  onSubmit={handleSubmit}
                  noValidate
                  className="space-y-6"
                >
                  {/* EMAIL */}
                  <div className="flex items-start gap-4 rounded-2xl bg-mainColor/5 p-4 dark:bg-white/5">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-mainColor/10 text-mainColor dark:text-white">
                      <FaEnvelope size={18} />
                    </span>

                    <div className="min-w-0">
                      <p className="mb-1 text-xs font-bold text-secondaryColor dark:text-fourthColor">
                        الحساب المطلوب تحديثه
                      </p>

                      <p
                        dir="ltr"
                        className="break-all text-right text-sm font-extrabold text-mainColor dark:text-white"
                      >
                        {email}
                      </p>
                    </div>
                  </div>

                  {/* PASSWORD */}
                  <div>
                    <PasswordField
                      id="reset-password"
                      label="كلمة المرور الجديدة"
                      value={password}
                      onChange={setPassword}
                      visible={showPassword}
                      onToggleVisibility={() =>
                        setShowPassword((prev) => !prev)
                      }
                      placeholder="8 أحرف على الأقل"
                      autoComplete="new-password"
                      error={
                        submitted ? passwordError : ""
                      }
                      disabled={loading}
                    />

                    {/* PASSWORD STRENGTH */}
                    {password && (
                      <div className="mt-4">
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <span className="text-xs font-bold text-secondaryColor dark:text-fourthColor">
                            قوة كلمة المرور
                          </span>

                          <span className="text-xs font-extrabold text-mainColor dark:text-white">
                            {strengthInfo.label}
                          </span>
                        </div>

                        <div className="grid grid-cols-4 gap-2">
                          {[1, 2, 3, 4].map((level) => (
                            <span
                              key={level}
                              className={[
                                "h-2 rounded-full transition-colors duration-300",
                                level <= strength
                                  ? strengthInfo.color
                                  : "bg-mainColor/10 dark:bg-white/10",
                              ].join(" ")}
                            />
                          ))}
                        </div>

                        <p className="mt-3 text-xs leading-6 text-secondaryColor dark:text-fourthColor">
                          للحصول على كلمة مرور أقوى،
                          استخدم أحرفاً متنوعة وأرقاماً
                          ورموزاً، وابتعد عن الكلمات الشائعة.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* CONFIRM PASSWORD */}
                  <PasswordField
                    id="reset-confirm-password"
                    label="تأكيد كلمة المرور الجديدة"
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    visible={showConfirmPassword}
                    onToggleVisibility={() =>
                      setShowConfirmPassword((prev) => !prev)
                    }
                    placeholder="أعد كتابة كلمة المرور"
                    autoComplete="new-password"
                    error={
                      submitted ? confirmError : ""
                    }
                    disabled={loading}
                  />

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

                  {/* SUBMIT */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex h-[58px] w-full items-center justify-center gap-3 rounded-2xl bg-mainColor px-6 text-base font-extrabold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        جارٍ حفظ كلمة المرور...
                      </>
                    ) : (
                      <>
                        <FaKey size={17} />
                        حفظ كلمة المرور الجديدة
                        <FaArrowLeft size={14} />
                      </>
                    )}
                  </button>

                  {/* BACK */}
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
              )}
            </div>

            {/* SECURITY NOTE */}
            <div className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-secondaryColor dark:text-fourthColor">
              <FaShieldAlt className="text-mainColor dark:text-white" />
              لا تشارك رابط الاستعادة أو كلمة مرورك مع أي شخص.
            </div>
          </div>

          {/* =====================================
              BRAND SIDE
          ===================================== */}
          <div className="order-2 hidden flex-col items-center justify-center text-center lg:flex">
            <div className="relative mb-10 flex aspect-square w-full max-w-[500px] items-center justify-center">
              <div className="absolute inset-[7%] rounded-full border border-mainColor/10 bg-gradient-to-br from-mainColor/10 via-white to-secondaryColor/10 dark:via-[#101828]" />

              <div className="absolute inset-[1%] rounded-full border border-dashed border-mainColor/15" />

              <div className="absolute left-[12%] top-[15%] h-4 w-4 rounded-full bg-secondaryColor" />

              <div className="absolute bottom-[12%] right-[15%] h-3 w-3 rounded-full bg-mainColor" />

              <img
                src={kajoLogo}
                alt="كاجو - منصة الخدمات البيطرية"
                className="relative z-10 max-h-[78%] w-[75%] object-contain drop-shadow-xl"
              />

              <div className="absolute bottom-[6%] right-[1%] z-20 flex items-center gap-3 rounded-2xl border border-mainColor/10 bg-white px-5 py-4 shadow-xl dark:bg-[#1D2939]">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-mainColor/10 text-mainColor dark:text-white">
                  <FaHeart size={19} />
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

            <div className="max-w-[440px]">
              <h2 className="mb-4 text-3xl font-black leading-snug text-mainColor dark:text-white">
                حسابك بأمان
                <br />
                <span className="text-secondaryColor">
                  مع كاجو دائماً
                </span>
              </h2>

              <p className="text-base leading-8 text-secondaryColor dark:text-fourthColor">
                احمِ حسابك بكلمة مرور جديدة،
                وواصل الاستفادة من خدمات العيادات
                والتبنّي والمتاجر ومجتمع كاجو.
              </p>
            </div>

            <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-mainColor/10 bg-mainColor/5 px-5 py-3 text-xs font-extrabold text-mainColor dark:bg-white/10 dark:text-white">
              <FaPaw />
              كاجو — لأنهم من عائلتنا
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
