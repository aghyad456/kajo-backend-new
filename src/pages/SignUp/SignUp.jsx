
import React, { useState } from "react";
import img1 from "../../assets/kajo.svg";

import { Link, useNavigate } from "react-router-dom";

import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaArrowLeft,
  FaCheckCircle,
  FaPaw,
  FaStore,
  FaHome,
  FaUserMd,
  FaShieldAlt,
  FaHeart,
  FaFileUpload,
  FaExclamationCircle,
  FaSpinner,
} from "react-icons/fa";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "../../schema/registerSchema";
import { api } from "../../api/apiClient";

// ========================================
// ACCOUNT TYPES
// ========================================

const roles = [
  {
    value: "user",
    label: "مستخدم عادي",
    description: "استكشف خدمات كاجو",
    icon: FaUser,
  },
  {
    value: "shop_owner",
    label: "صاحب متجر",
    description: "اعرض منتجات متجرك",
    icon: FaStore,
  },
  {
    value: "shelter_owner",
    label: "صاحب ملجأ",
    description: "ساعد الحيوانات في إيجاد منزل",
    icon: FaHome,
  },
  {
    value: "doctor",
    label: "طبيب بيطري",
    description: "قدّم خدماتك البيطرية",
    icon: FaUserMd,
  },
];

// ========================================
// REUSABLE INPUT
// ========================================

function FormField({
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
        htmlFor={`signup-${name}`}
        className="mb-2 block text-sm font-bold text-mainColor dark:text-white"
      >
        {label}
      </label>

      <div className="relative">
        <div
          className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-mainColor/60 dark:text-white/60"
        >
          <Icon size={17} />
        </div>

        <input
          id={`signup-${name}`}
          type={type}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={
            error ? `signup-${name}-error` : undefined
          }
          {...register(name)}
          className={[
            "h-[56px] w-full rounded-2xl border",
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
          id={`signup-${name}-error`}
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
// MAIN COMPONENT
// ========================================

export default function SignUp() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      rePassword: "",
      role: "user",
      document: null,
    },
    mode: "onTouched",
  });

  const selectedRole = watch("role") || "user";

  const requiresApproval = [
    "shop_owner",
    "shelter_owner",
    "doctor",
  ].includes(selectedRole);

  // ========================================
  // REGISTER
  // ========================================

  const onSubmit = async (data) => {
    if (loading) return;

    setServerError("");
    setLoading(true);

    try {
      const response = await api.register({
        name: data.name.trim(),
        email: data.email.trim(),
        password: data.password,
        requested_role: data.role || "user",
      });

      // Preserve existing authentication behavior
      if (response?.token) {
        localStorage.setItem("token", response.token);
      }

      if (response?.user) {
        localStorage.setItem(
          "user",
          JSON.stringify(response.user)
        );
      }

      if (response?.pending_request) {
        navigate("/waiting-approval", {
          replace: true,
        });
        return;
      }

      navigate("/app", {
        replace: true,
      });
    } catch (error) {
      const validationErrors = error?.data?.errors;

      const firstValidationError = validationErrors
        ? Object.values(validationErrors)
            .flat()
            .find(Boolean)
        : null;

      const message =
        firstValidationError ||
        error?.data?.message ||
        error?.message ||
        "حدث خطأ أثناء إنشاء الحساب، يرجى المحاولة مجدداً.";

      setServerError(String(message));
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
        <div className="absolute -right-48 -top-40 h-[520px] w-[520px] rounded-full bg-mainColor/5 blur-[100px]" />
        <div className="absolute -bottom-40 -left-40 h-[520px] w-[520px] rounded-full bg-secondaryColor/10 blur-[100px]" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-[1350px] items-center px-4 py-12 sm:px-8 lg:px-12 lg:py-20">
        <div className="grid w-full items-center gap-12 lg:grid-cols-2 lg:gap-20">

          {/* =====================================
              RIGHT SIDE - REGISTER FORM
          ===================================== */}

          <div className="order-1 mx-auto w-full max-w-[570px]">

            {/* Header */}
            <div className="mb-8 text-center lg:text-right">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-mainColor/15 bg-mainColor/5 px-4 py-2 text-xs font-extrabold text-mainColor dark:bg-white/10 dark:text-white">
                <FaPaw size={14} />
                انضم إلى عائلة كاجو
              </div>

              <h1 className="mb-3 text-3xl font-black text-mainColor dark:text-white sm:text-4xl">
                أنشئ حسابك الجديد
                <span className="text-secondaryColor">.</span>
              </h1>

              <p className="text-sm leading-8 text-secondaryColor dark:text-fourthColor sm:text-base">
                ابدأ رحلتك معنا واكتشف عالماً متكاملاً
                لرعاية أصدقائنا الأليفين.
              </p>
            </div>

            {/* Register Card */}
            <div className="rounded-[30px] border border-mainColor/10 bg-white p-5 shadow-[0_20px_70px_rgba(0,0,0,0.06)] dark:border-white/10 dark:bg-[#1D2939] sm:p-8">

              <form
                onSubmit={handleSubmit(onSubmit)}
                noValidate
                className="space-y-5"
              >
                {/* Name */}
                <FormField
                  label="الاسم الكامل"
                  name="name"
                  placeholder="أدخل اسمك الكامل"
                  icon={FaUser}
                  register={register}
                  error={errors.name}
                  autoComplete="name"
                />

                {/* Email */}
                <FormField
                  label="البريد الإلكتروني"
                  name="email"
                  type="email"
                  placeholder="example@email.com"
                  icon={FaEnvelope}
                  register={register}
                  error={errors.email}
                  autoComplete="email"
                />

                {/* Password fields */}
                <div className="grid gap-4 sm:grid-cols-2">

                  <FormField
                    label="كلمة المرور"
                    name="password"
                    type={
                      showPassword ? "text" : "password"
                    }
                    placeholder="كلمة المرور"
                    icon={FaLock}
                    register={register}
                    error={errors.password}
                    autoComplete="new-password"
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

                  <FormField
                    label="تأكيد كلمة المرور"
                    name="rePassword"
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="تأكيد كلمة المرور"
                    icon={FaLock}
                    register={register}
                    error={errors.rePassword}
                    autoComplete="new-password"
                    endContent={
                      <button
                        type="button"
                        aria-label={
                          showConfirmPassword
                            ? "إخفاء تأكيد كلمة المرور"
                            : "إظهار تأكيد كلمة المرور"
                        }
                        aria-pressed={showConfirmPassword}
                        onClick={() =>
                          setShowConfirmPassword(
                            (prev) => !prev
                          )
                        }
                        className="rounded-lg p-2 text-mainColor/60 transition-colors hover:bg-mainColor/10 dark:text-white/70"
                      >
                        {showConfirmPassword ? (
                          <FaEyeSlash size={17} />
                        ) : (
                          <FaEye size={17} />
                        )}
                      </button>
                    }
                  />
                </div>

                {/* Role Selection */}
                <div className="pt-2">
                  <div className="mb-4">
                    <h2 className="text-base font-extrabold text-mainColor dark:text-white">
                      كيف تحب تستخدم كاجو؟
                    </h2>

                    <p className="mt-1 text-xs leading-6 text-secondaryColor dark:text-fourthColor">
                      اختر نوع الحساب المناسب لك
                    </p>
                  </div>

                  <input
                    type="hidden"
                    {...register("role")}
                  />

                  <div className="grid grid-cols-2 gap-3">
                    {roles.map((role) => {
                      const Icon = role.icon;

                      const active =
                        selectedRole === role.value;

                      return (
                        <button
                          key={role.value}
                          type="button"
                          aria-pressed={active}
                          onClick={() => {
                            setValue(
                              "role",
                              role.value,
                              {
                                shouldValidate: true,
                                shouldDirty: true,
                                shouldTouch: true,
                              }
                            );
                          }}
                          className={[
                            "group relative flex min-h-[135px]",
                            "flex-col items-center justify-center",
                            "gap-2 rounded-2xl border-2 p-4",
                            "text-center transition-all duration-300",
                            "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mainColor",
                            active
                              ? "border-mainColor bg-mainColor/5 shadow-md dark:bg-white/10"
                              : "border-mainColor/10 bg-white hover:-translate-y-1 hover:border-mainColor/30 dark:bg-[#182434]",
                          ].join(" ")}
                        >
                          {active && (
                            <FaCheckCircle
                              size={16}
                              className="absolute left-3 top-3 text-mainColor dark:text-white"
                            />
                          )}

                          <span
                            className={[
                              "flex h-11 w-11 items-center justify-center",
                              "rounded-xl transition-all duration-300",
                              active
                                ? "bg-mainColor text-white"
                                : "bg-mainColor/10 text-mainColor dark:text-white",
                            ].join(" ")}
                          >
                            <Icon size={20} />
                          </span>

                          <span className="text-sm font-extrabold text-mainColor dark:text-white">
                            {role.label}
                          </span>

                          <span className="text-xs leading-5 text-secondaryColor dark:text-fourthColor">
                            {role.description}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {errors.role && (
                    <p
                      role="alert"
                      className="mt-2 text-xs font-medium text-red-500"
                    >
                      {errors.role.message}
                    </p>
                  )}
                </div>

                {/* Business account notice */}
                {requiresApproval && (
                  <div className="rounded-2xl border border-mainColor/15 bg-mainColor/5 p-4 dark:bg-white/5">
                    <div className="flex items-start gap-3">
                      <FaShieldAlt
                        size={20}
                        className="mt-1 shrink-0 text-mainColor dark:text-white"
                      />

                      <div>
                        <p className="text-sm font-extrabold text-mainColor dark:text-white">
                          حساب يحتاج إلى موافقة الإدارة
                        </p>

                        <p className="mt-2 text-xs leading-7 text-secondaryColor dark:text-fourthColor">
                          سيتم إرسال طلب الانضمام إلى إدارة
                          كاجو لمراجعته. يمكنك تصفح المنصة
                          كمستخدم عادي حتى تتم الموافقة.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Document Upload */}
                {requiresApproval && (
                  <div>
                    <label
                      htmlFor="signup-document"
                      className="mb-2 block text-sm font-bold text-mainColor dark:text-white"
                    >
                      وثيقة إثبات النشاط
                    </label>

                    <div className="relative rounded-2xl border-2 border-dashed border-mainColor/20 bg-mainColor/5 px-4 py-5 text-center dark:bg-white/5">
                      <FaFileUpload
                        size={26}
                        className="mx-auto mb-3 text-mainColor dark:text-white"
                      />

                      <label
                        htmlFor="signup-document"
                        className="cursor-pointer text-sm font-bold text-mainColor underline dark:text-white"
                      >
                        اختر ملفاً من جهازك
                      </label>

                      <input
                        id="signup-document"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        aria-describedby="document-note"
                        {...register("document", {
                          setValueAs: (files) => files,
                        })}
                        className="mt-3 block w-full text-xs text-secondaryColor file:ml-3 file:rounded-lg file:border-0 file:bg-mainColor file:px-3 file:py-2 file:font-bold file:text-white"
                      />

                      <p
                        id="document-note"
                        className="mt-3 text-xs leading-6 text-secondaryColor dark:text-fourthColor"
                      >
                        رفع الوثائق غير مفعّل حالياً.
                        اختيار الملف لا يعني إرساله إلى الإدارة.
                      </p>
                    </div>

                    {errors.document && (
                      <p
                        role="alert"
                        className="mt-2 text-xs text-red-500"
                      >
                        {errors.document.message}
                      </p>
                    )}
                  </div>
                )}

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
                      جارٍ إنشاء الحساب...
                    </>
                  ) : (
                    <>
                      إنشاء حساب
                      <FaArrowLeft
                        size={16}
                        className="transition-transform group-hover:-translate-x-1"
                      />
                    </>
                  )}
                </button>

                {/* Login Link */}
                <p className="pt-2 text-center text-sm text-secondaryColor dark:text-fourthColor">
                  لديك حساب بالفعل؟{" "}
                  <Link
                    to="/login"
                    className="font-extrabold text-mainColor underline-offset-4 hover:underline dark:text-white"
                  >
                    تسجيل الدخول
                  </Link>
                </p>
              </form>
            </div>

            {/* Security Message */}
            <div className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-secondaryColor dark:text-fourthColor">
              <FaShieldAlt className="text-mainColor dark:text-white" />
              استخدم كلمة مرور قوية لحماية حسابك
            </div>
          </div>

          {/* =====================================
              LEFT SIDE - VISUAL
          ===================================== */}

          <div className="order-2 hidden flex-col items-center justify-center text-center lg:flex">

            {/* Illustration */}
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

            {/* Visual Text */}
            <div className="max-w-[440px]">
              <h2 className="mb-4 text-3xl font-black leading-snug text-mainColor dark:text-white">
                عالم أليفك يبدأ
                <br />
                <span className="text-secondaryColor">
                  بخطوة واحدة!
                </span>
              </h2>

              <p className="text-base leading-8 text-secondaryColor dark:text-fourthColor">
                انضم إلى كاجو واستكشف عالماً يجمع
                الرعاية البيطرية والتبنّي والمتاجر
                في تجربة رقمية واحدة.
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
