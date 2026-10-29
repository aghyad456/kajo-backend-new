
import React, { useState } from "react";

import img1 from "../../assets/kajo.svg";

import { Link, useNavigate, useLocation } from "react-router-dom";

import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaArrowLeft,
  FaPaw,
  FaHeart,
  FaCheckCircle,
  FaShieldAlt,
  FaExclamationCircle,
  FaSpinner,
} from "react-icons/fa";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { loginSchema } from "../../schema/loginSchema";
import { useAuth } from "../../context/AuthContext";

// ========================================
// REUSABLE LOGIN INPUT
// ========================================

function LoginField({
  label,
  name,
  type = "text",
  placeholder,
  icon: Icon,
  register,
  error,
  autoComplete,
  endContent,
}) {
  return (
    <div className="w-full">
      <label
        htmlFor={`login-${name}`}
        className="mb-2 block text-sm font-bold text-mainColor dark:text-white"
      >
        {label}
      </label>

      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-mainColor/60 dark:text-white/60">
          <Icon size={17} />
        </span>

        <input
          id={`login-${name}`}
          type={type}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={
            error ? `login-${name}-error` : undefined
          }
          {...register(name)}
          className={[
            "h-[58px] w-full rounded-2xl border",
            "bg-white py-3 pr-12",
            endContent ? "pl-14" : "pl-4",
            "text-sm font-medium text-mainColor",
            "placeholder:text-mainColor/35",
            "outline-none transition-all duration-200",
            "dark:bg-[#182434] dark:text-white",
            "dark:placeholder:text-white/30",
            "focus:border-mainColor focus:ring-4 focus:ring-mainColor/10",
            error
              ? "border-red-500"
              : "border-mainColor/15 dark:border-white/10",
          ].join(" ")}
        />

        {endContent && (
          <div className="absolute inset-y-0 left-3 flex items-center">
            {endContent}
          </div>
        )}
      </div>

      {error && (
        <p
          id={`login-${name}-error`}
          role="alert"
          className="mt-2 flex items-center gap-2 text-xs font-medium text-red-500"
        >
          <FaExclamationCircle />
          {error.message}
        </p>
      )}
    </div>
  );
}

// ========================================
// LOGIN PAGE
// ========================================

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onTouched",
  });

  // ========================================
  // HANDLE LOGIN
  // ========================================

  const onSubmit = async (data) => {
    if (loading) return;

    setServerError("");
    setLoading(true);

    try {
      const user = await login(data.email, data.password);

      // Preserve protected route redirect
      const from = location.state?.from?.pathname;

      if (from) {
        navigate(from, { replace: true });
        return;
      }

      // Admin
      if (Number(user.role) === 1) {
        navigate("/admin/users-requests", {
          replace: true,
        });
      } else {
        navigate("/app", {
          replace: true,
        });
      }
    } catch (error) {
      setServerError(
        error?.message ||
          "تعذر تسجيل الدخول. يرجى التحقق من البيانات والمحاولة مجدداً."
      );
    } finally {
      setLoading(false);
    }
  };

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
        <div className="absolute -right-48 -top-40 h-[520px] w-[520px] rounded-full bg-mainColor/5 blur-[110px]" />

        <div className="absolute -bottom-48 -left-40 h-[520px] w-[520px] rounded-full bg-secondaryColor/10 blur-[110px]" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-[1350px] items-center px-4 py-12 sm:px-8 lg:px-12 lg:py-20">

        <div className="grid w-full items-center gap-12 lg:grid-cols-2 lg:gap-20">

          {/* =====================================
              RIGHT SIDE - LOGIN FORM
          ===================================== */}

          <div className="order-1 mx-auto w-full max-w-[550px]">

            {/* Header */}
            <div className="mb-8 text-center lg:text-right">

              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-mainColor/15 bg-mainColor/5 px-4 py-2 text-xs font-extrabold text-mainColor dark:bg-white/10 dark:text-white">
                <FaPaw size={14} />
                أهلاً بعودتك إلى كاجو
              </div>

              <h1 className="mb-3 text-3xl font-black text-mainColor dark:text-white sm:text-4xl">
                سعيدون بعودتك!
                <span className="text-secondaryColor">.</span>
              </h1>

              <p className="text-sm leading-8 text-secondaryColor dark:text-fourthColor sm:text-base">
                سجّل دخولك للمتابعة واستكشاف خدمات
                كاجو المخصصة لك ولصديقك الأليف.
              </p>
            </div>

            {/* Form Card */}
            <div className="rounded-[30px] border border-mainColor/10 bg-white p-5 shadow-[0_20px_70px_rgba(0,0,0,0.06)] dark:border-white/10 dark:bg-[#1D2939] sm:p-8">

              <form
                onSubmit={handleSubmit(onSubmit)}
                noValidate
                className="space-y-6"
              >
                {/* Email */}
                <LoginField
                  label="البريد الإلكتروني"
                  name="email"
                  type="email"
                  placeholder="example@email.com"
                  icon={FaEnvelope}
                  register={register}
                  error={errors.email}
                  autoComplete="email"
                />

                {/* Password */}
                <LoginField
                  label="كلمة المرور"
                  name="password"
                  type={
                    showPassword ? "text" : "password"
                  }
                  placeholder="أدخل كلمة المرور"
                  icon={FaLock}
                  register={register}
                  error={errors.password}
                  autoComplete="current-password"
                  endContent={
                    <button
                      type="button"
                      aria-label={
                        showPassword
                          ? "إخفاء كلمة المرور"
                          : "إظهار كلمة المرور"
                      }
                      aria-pressed={showPassword}
                      onClick={() =>
                        setShowPassword((prev) => !prev)
                      }
                      className="rounded-lg p-2 text-mainColor/60 transition-colors hover:bg-mainColor/10 dark:text-white/70"
                    >
                      {showPassword ? (
                        <FaEyeSlash size={17} />
                      ) : (
                        <FaEye size={17} />
                      )}
                    </button>
                  }
                />

                {/* Forgot Password */}
                <div className="flex justify-start">
                  <Link
                    to="/forgot-password"
                    className="text-sm font-bold text-mainColor transition-colors hover:text-secondaryColor hover:underline dark:text-white"
                  >
                    نسيت كلمة المرور؟
                  </Link>
                </div>

                {/* Server Error */}
                {serverError && (
                  <div
                    role="alert"
                    aria-live="polite"
                    className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium leading-7 text-red-600 dark:border-red-900/40 dark:bg-red-950/20"
                  >
                    <FaExclamationCircle
                      size={18}
                      className="mt-1 shrink-0"
                    />

                    <span>{serverError}</span>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className={[
                    "group flex h-[58px] w-full",
                    "items-center justify-center gap-3",
                    "rounded-2xl bg-mainColor",
                    "text-base font-extrabold text-white",
                    "shadow-lg transition-all duration-300",
                    "hover:-translate-y-0.5 hover:opacity-90",
                    "hover:shadow-xl active:scale-[0.99]",
                    "disabled:cursor-not-allowed",
                    "disabled:opacity-60",
                    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-mainColor",
                  ].join(" ")}
                >
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      جارٍ تسجيل الدخول...
                    </>
                  ) : (
                    <>
                      تسجيل الدخول
                      <FaArrowLeft
                        size={16}
                        className="transition-transform group-hover:-translate-x-1"
                      />
                    </>
                  )}
                </button>

                {/* Register */}
                <div className="border-t border-mainColor/10 pt-6 text-center">
                  <p className="text-sm text-secondaryColor dark:text-fourthColor">
                    ليس لديك حساب بعد؟{" "}
                    <Link
                      to="/register"
                      className="font-extrabold text-mainColor underline-offset-4 hover:underline dark:text-white"
                    >
                      أنشئ حسابك الآن
                    </Link>
                  </p>
                </div>
              </form>
            </div>

            {/* Security Note */}
            <div className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-secondaryColor dark:text-fourthColor">
              <FaShieldAlt className="text-mainColor dark:text-white" />
              حافظ على خصوصية بيانات حسابك
            </div>
          </div>

          {/* =====================================
              LEFT SIDE - KAJO VISUAL
          ===================================== */}

          <div className="order-2 hidden flex-col items-center justify-center text-center lg:flex">

            <div className="relative mb-10 flex aspect-square w-full max-w-[500px] items-center justify-center">

              {/* Background */}
              <div className="absolute inset-[7%] rounded-full border border-mainColor/10 bg-gradient-to-br from-mainColor/10 via-white to-secondaryColor/10 dark:via-[#101828]" />

              <div className="absolute inset-[1%] rounded-full border border-dashed border-mainColor/15" />

              <div className="absolute left-[12%] top-[15%] h-4 w-4 rounded-full bg-secondaryColor" />

              <div className="absolute bottom-[12%] right-[15%] h-3 w-3 rounded-full bg-mainColor" />

              {/* Main illustration */}
              <img
                src={img1}
                alt="كاجو - منصة الخدمات البيطرية"
                className="relative z-10 w-[75%] max-h-[78%] object-contain drop-shadow-xl transition-transform duration-500 hover:scale-105"
              />

              {/* Floating Card */}
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

            {/* Visual Message */}
            <div className="max-w-[440px]">
              <h2 className="mb-4 text-3xl font-black leading-snug text-mainColor dark:text-white">
                رعاية أليفك تبدأ
                <br />
                <span className="text-secondaryColor">
                  من هنا!
                </span>
              </h2>

              <p className="text-base leading-8 text-secondaryColor dark:text-fourthColor">
                كل ما تحتاجه من خدمات بيطرية
                وملاجئ ومتاجر، في منصة واحدة
                تجمع الاهتمام والمحبة.
              </p>
            </div>

            {/* Advantages */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              {[
                "رعاية بيطرية",
                "تبنّي الحيوانات",
                "متاجر ومستلزمات",
              ].map((text) => (
                <span
                  key={text}
                  className="inline-flex items-center gap-2 rounded-full border border-mainColor/10 bg-mainColor/5 px-4 py-2 text-xs font-bold text-mainColor dark:bg-white/10 dark:text-white"
                >
                  <FaCheckCircle size={13} />
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
