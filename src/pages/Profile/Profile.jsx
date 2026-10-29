
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { Link } from "react-router-dom";

import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaPhone,
  FaMapMarkerAlt,
  FaClipboardList,
  FaCamera,
  FaEye,
  FaEyeSlash,
  FaSave,
  FaPaw,
  FaShieldAlt,
  FaBookmark,
  FaHome,
  FaArrowLeft,
  FaCheckCircle,
  FaExclamationCircle,
  FaSpinner,
  FaSyncAlt,
  FaTimes,
} from "react-icons/fa";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { profileSchema } from "../../schema/profileSchema";
import { useAuth } from "../../context/AuthContext";
import {
  api,
  setAuth,
  getStoredUser,
} from "../../api/apiClient";

// ==========================================
// CONFIGURATION
// ==========================================

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

function getRoleInfo(role) {
  const value = Number(role);

  switch (value) {
    case 1:
      return {
        label: "مدير النظام",
        placeholder: "اسم المدير",
      };

    case 3:
      return {
        label: "صاحب متجر",
        placeholder: "اسم صاحب المتجر",
      };

    case 4:
      return {
        label: "صاحب ملجأ",
        placeholder: "اسم صاحب الملجأ",
      };

    case 5:
      return {
        label: "طبيب بيطري",
        placeholder: "اسم الطبيب",
      };

    default:
      return {
        label: "عضو في مجتمع كاجو",
        placeholder: "اسم المستخدم",
      };
  }
}

function getProfileData(response) {
  return response?.user ?? response?.data?.user ?? response;
}

function InputField({
  label,
  name,
  icon: Icon,
  register,
  error,
  type = "text",
  placeholder,
  autoComplete,
  endContent,
}) {
  return (
    <div className="min-w-0">
      <label
        htmlFor={`profile-${name}`}
        className="mb-2 block text-sm font-extrabold text-mainColor dark:text-white"
      >
        {label}
      </label>

      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-mainColor/55 dark:text-white/60">
          <Icon size={17} />
        </span>

        <input
          id={`profile-${name}`}
          type={type}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={
            error ? `profile-${name}-error` : undefined
          }
          {...register(name)}
          className={[
            "h-14 w-full rounded-2xl border",
            "bg-white py-3 pr-12",
            endContent ? "pl-14" : "pl-4",
            "text-sm font-medium text-mainColor",
            "placeholder:text-mainColor/35",
            "outline-none transition-all",
            "focus:border-mainColor focus:ring-4 focus:ring-mainColor/10",
            "dark:bg-[#101828] dark:text-white",
            "dark:placeholder:text-white/30",
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
          id={`profile-${name}-error`}
          role="alert"
          className="mt-2 flex items-center gap-2 text-xs font-medium text-red-500"
        >
          <FaExclamationCircle size={13} />
          {error.message}
        </p>
      )}
    </div>
  );
}

function SectionTitle({ icon: Icon, title, description }) {
  return (
    <div className="mb-6 flex items-center gap-4">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-mainColor/10 text-mainColor dark:text-white">
        <Icon size={20} />
      </span>

      <div>
        <h2 className="text-lg font-black text-mainColor dark:text-white">
          {title}
        </h2>

        <p className="mt-1 text-xs leading-6 text-secondaryColor dark:text-fourthColor">
          {description}
        </p>
      </div>
    </div>
  );
}

// ==========================================
// PROFILE
// ==========================================

export default function Profile() {
  const { user, setUser } = useAuth();

  const [profile, setProfile] = useState(user || null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [notification, setNotification] = useState(null);
  const [imageError, setImageError] = useState("");

  const [imagePreview, setImagePreview] = useState("");
  const [imageFile, setImageFile] = useState(null);

  const [showPassword, setShowPassword] = useState(false);

  const fileInputRef = useRef(null);
  const previewUrlRef = useRef(null);
  const mountedRef = useRef(false);
  const savingRef = useRef(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      password: "",
      phone: user?.phone || "",
      address: user?.address || "",
    },
    mode: "onTouched",
  });

  // ======================================
  // IMAGE HELPERS
  // ======================================

  const revokePreviewUrl = useCallback(() => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
  }, []);

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setImageError("");
    setNotification(null);

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setImageError(
        "يرجى اختيار صورة JPG أو PNG أو WEBP."
      );
      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setImageError(
        "حجم الصورة يجب ألا يتجاوز 5 ميغابايت."
      );
      event.target.value = "";
      return;
    }

    revokePreviewUrl();

    const objectUrl = URL.createObjectURL(file);

    previewUrlRef.current = objectUrl;
    setImageFile(file);
    setImagePreview(objectUrl);
  };

  const cancelImageChange = () => {
    revokePreviewUrl();

    setImageFile(null);
    setImagePreview(profile?.avatar_url || "");
    setImageError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ======================================
  // LOAD PROFILE
  // ======================================

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setNotification(null);

    try {
      const response = await api.profile();
      const data = getProfileData(response);

      if (
        !data ||
        typeof data !== "object" ||
        Array.isArray(data)
      ) {
        throw new Error("بيانات الحساب غير متاحة.");
      }

      if (!mountedRef.current) return;

      reset({
        name: data.name || "",
        email: data.email || "",
        password: "",
        phone: data.phone || "",
        address: data.address || "",
      });

      revokePreviewUrl();

      setProfile(data);
      setImagePreview(data.avatar_url || "");
      setImageFile(null);

      const stored = getStoredUser() || {};
      const merged = { ...stored, ...data };

      setAuth({ user: merged });
      setUser?.(merged);
    } catch (error) {
      if (mountedRef.current) {
        setNotification({
          type: "error",
          message:
            error?.data?.message ||
            error?.message ||
            "تعذر تحميل بيانات الحساب.",
        });
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [reset, revokePreviewUrl, setUser]);

  useEffect(() => {
    mountedRef.current = true;

    loadProfile();

    return () => {
      mountedRef.current = false;
      revokePreviewUrl();
    };
  }, [loadProfile, revokePreviewUrl]);

  // ======================================
  // SAVE PROFILE
  // ======================================

  const onSubmit = async (data) => {
    if (savingRef.current) return;

    savingRef.current = true;
    setSaving(true);
    setNotification(null);

    try {
      const formData = new FormData();

      formData.append("name", data.name || "");
      formData.append("email", data.email || "");
      formData.append("phone", data.phone || "");
      formData.append("address", data.address || "");

      if (data.password?.trim()) {
        formData.append("password", data.password.trim());
      }

      if (imageFile) {
        formData.append("avatar", imageFile);
      }

      const response = await api.updateProfile(formData);
      const updated = getProfileData(response);

      if (
        !updated ||
        typeof updated !== "object" ||
        Array.isArray(updated)
      ) {
        throw new Error(
          "تم استلام استجابة غير صالحة من الخادم."
        );
      }

      if (!mountedRef.current) return;

      const stored = getStoredUser() || {};

      const merged = {
        ...stored,
        ...profile,
        ...updated,
      };

      setAuth({ user: merged });
      setUser?.(merged);
      setProfile(merged);

      reset({
        name: merged.name || "",
        email: merged.email || "",
        password: "",
        phone: merged.phone || "",
        address: merged.address || "",
      });

      revokePreviewUrl();

      setImagePreview(merged.avatar_url || "");
      setImageFile(null);
      setImageError("");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setNotification({
        type: "success",
        message: "تم حفظ تعديلات الملف الشخصي بنجاح.",
      });
    } catch (error) {
      if (mountedRef.current) {
        setNotification({
          type: "error",
          message:
            error?.data?.message ||
            error?.message ||
            "تعذر حفظ التغييرات، يرجى المحاولة مجدداً.",
        });
      }
    } finally {
      savingRef.current = false;

      if (mountedRef.current) {
        setSaving(false);
      }
    }
  };

  // ======================================
  // PROFILE DATA
  // ======================================

  const currentProfile = profile || user || {};

  const roleInfo = getRoleInfo(currentProfile.role);

  const displayName =
    currentProfile.name || "صديق كاجو";

  const displayEmail =
    currentProfile.email || "لم يتم تحديد البريد";

  const avatarInitial =
    String(displayName).trim().charAt(0) || "ك";

  const hasChanges = isDirty || Boolean(imageFile);

  // ======================================
  // LOADING
  // ======================================

  if (loading) {
    return (
      <main
        dir="rtl"
        role="status"
        className="flex min-h-screen flex-col items-center justify-center gap-5 bg-fivethColor dark:bg-[#101828]"
      >
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-mainColor/10">
          <FaSpinner
            size={32}
            className="animate-spin text-mainColor dark:text-white"
          />
        </div>

        <p className="font-bold text-mainColor dark:text-white">
          جارٍ تحميل الملف الشخصي...
        </p>
      </main>
    );
  }

  return (
    <main
      dir="rtl"
      className="relative min-h-screen overflow-hidden bg-fivethColor text-mainColor transition-colors duration-500 dark:bg-[#101828]"
    >
      {/* BACKGROUND */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -right-48 -top-48 h-[480px] w-[480px] rounded-full bg-mainColor/5 blur-[110px]" />

        <div className="absolute -bottom-40 -left-40 h-[440px] w-[440px] rounded-full bg-secondaryColor/10 blur-[110px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">

        {/* ====================================
            PAGE HEADER
        ==================================== */}

        <header className="mb-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-mainColor/15 bg-mainColor/5 px-4 py-2 text-xs font-extrabold text-mainColor dark:bg-white/10 dark:text-white">
            <FaPaw size={13} />
            حسابي في كاجو
          </div>

          <h1 className="text-3xl font-black text-mainColor dark:text-white sm:text-4xl">
            الملف الشخصي
          </h1>

          <p className="mt-3 text-sm leading-8 text-secondaryColor dark:text-fourthColor">
            إدارة بيانات حسابك وصورتك الشخصية وإعدادات الأمان.
          </p>
        </header>

        {/* ====================================
            NOTIFICATION
        ==================================== */}

        {notification && (
          <div
            role="status"
            aria-live="polite"
            className={[
              "mb-7 flex items-start justify-between gap-4 rounded-2xl border p-5",
              notification.type === "success"
                ? "border-mainColor/20 bg-mainColor/10 text-mainColor dark:text-white"
                : "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/20 dark:text-red-300",
            ].join(" ")}
          >
            <div className="flex items-start gap-3">
              {notification.type === "success" ? (
                <FaCheckCircle
                  size={20}
                  className="mt-1 shrink-0"
                />
              ) : (
                <FaExclamationCircle
                  size={20}
                  className="mt-1 shrink-0"
                />
              )}

              <p className="text-sm font-bold leading-7">
                {notification.message}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setNotification(null)}
              aria-label="إغلاق الرسالة"
              className="shrink-0"
            >
              <FaTimes />
            </button>
          </div>
        )}

        {/* ====================================
            TWO-COLUMN LAYOUT
        ==================================== */}

        <div className="grid items-start gap-7 lg:grid-cols-[310px_minmax(0,1fr)]">

          {/* PROFILE SIDEBAR */}
          <aside className="space-y-6">

            {/* PROFILE CARD */}
            <section className="overflow-hidden rounded-[28px] border border-mainColor/10 bg-white shadow-sm dark:border-white/10 dark:bg-[#1D2939]">

              <div className="relative h-28 bg-mainColor">
                <div className="absolute -left-8 -top-8 h-28 w-28 rounded-full bg-white/10" />
                <div className="absolute right-8 top-6 h-3 w-3 rounded-full bg-white/30" />
              </div>

              <div className="px-5 pb-7 text-center">

                {/* AVATAR */}
                <div className="relative mx-auto -mt-14 mb-5 h-32 w-32">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    onChange={handleImageChange}
                    aria-label="اختيار صورة جديدة للحساب"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                    aria-label="تغيير صورة الحساب"
                    className="group relative h-32 w-32 overflow-hidden rounded-full border-4 border-white bg-mainColor text-white shadow-xl outline-none transition-transform hover:scale-105 focus-visible:ring-4 focus-visible:ring-mainColor/30 dark:border-[#1D2939]"
                  >
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="الصورة الشخصية"
                        className="h-full w-full object-cover"
                        onError={(event) => {
                          event.currentTarget.style.display =
                            "none";
                        }}
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-5xl font-black">
                        {avatarInitial}
                      </span>
                    )}

                    <span className="absolute inset-0 flex items-center justify-center bg-mainColor/75 text-sm font-extrabold text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                      <FaCamera className="ml-2" />
                      تغيير
                    </span>
                  </button>

                  <span className="pointer-events-none absolute bottom-1 left-0 flex h-9 w-9 items-center justify-center rounded-full border-3 border-white bg-mainColor text-white shadow-md dark:border-[#1D2939]">
                    <FaCamera size={14} />
                  </span>
                </div>

                {/* USER INFO */}
                <h2 className="break-words text-xl font-black text-mainColor dark:text-white">
                  {displayName}
                </h2>

                <p
                  dir="ltr"
                  className="mt-2 break-all text-sm text-secondaryColor dark:text-fourthColor"
                >
                  {displayEmail}
                </p>

                <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-mainColor/10 px-4 py-2 text-xs font-extrabold text-mainColor dark:bg-white/10 dark:text-white">
                  <FaShieldAlt size={13} />
                  {roleInfo.label}
                </span>

                {/* IMAGE SELECTION */}
                {imageFile && (
                  <div className="mt-5 rounded-2xl bg-mainColor/5 p-4 text-xs leading-6 text-mainColor dark:bg-white/5 dark:text-white">
                    <p className="mb-2 font-bold">
                      تم اختيار صورة جديدة.
                    </p>

                    <p className="mb-3 text-secondaryColor dark:text-fourthColor">
                      اضغط «حفظ التغييرات» لاعتمادها.
                    </p>

                    <button
                      type="button"
                      onClick={cancelImageChange}
                      className="font-extrabold underline underline-offset-4"
                    >
                      إلغاء تغيير الصورة
                    </button>
                  </div>
                )}

                {imageError && (
                  <p
                    role="alert"
                    className="mt-4 text-xs font-bold leading-6 text-red-500"
                  >
                    {imageError}
                  </p>
                )}

                <p className="mt-5 text-xs leading-6 text-secondaryColor dark:text-fourthColor">
                  يمكنك رفع JPG أو PNG أو WEBP،
                  بحجم أقصاه 5 ميغابايت.
                </p>
              </div>
            </section>

            {/* QUICK LINKS */}
            <nav
              aria-label="روابط الحساب"
              className="rounded-[28px] border border-mainColor/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1D2939]"
            >
              <h3 className="mb-5 text-base font-extrabold text-mainColor dark:text-white">
                روابط سريعة
              </h3>

              <div className="space-y-2">
                {[
                  {
                    label: "نشاطاتي وطلباتي",
                    path: "/app/my-activities",
                    icon: FaClipboardList,
                  },
                  {
                    label: "المنشورات المحفوظة",
                    path: "/app/saved",
                    icon: FaBookmark,
                  },
                  {
                    label: "مجتمع كاجو",
                    path: "/app/feed",
                    icon: FaHome,
                  },
                ].map((item) => {
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className="group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-mainColor transition-colors hover:bg-mainColor/5 dark:text-white"
                    >
                      <Icon
                        size={16}
                        className="text-secondaryColor"
                      />

                      <span>{item.label}</span>

                      <FaArrowLeft
                        size={12}
                        className="mr-auto transition-transform group-hover:-translate-x-1"
                      />
                    </Link>
                  );
                })}
              </div>
            </nav>
          </aside>

          {/* ====================================
              PROFILE FORM
          ==================================== */}

          <div className="min-w-0">
            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="space-y-7"
            >
              {/* PERSONAL DETAILS */}
              <section className="rounded-[28px] border border-mainColor/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1D2939] sm:p-8">
                <SectionTitle
                  icon={FaUser}
                  title="المعلومات الشخصية"
                  description="تعديل الاسم والبريد وبيانات التواصل الخاصة بحسابك."
                />

                <div className="grid gap-5 sm:grid-cols-2">
                  <InputField
                    label="الاسم"
                    name="name"
                    placeholder={roleInfo.placeholder}
                    icon={FaUser}
                    register={register}
                    error={errors.name}
                    autoComplete="name"
                  />

                  <InputField
                    label="البريد الإلكتروني"
                    name="email"
                    type="email"
                    placeholder="example@email.com"
                    icon={FaEnvelope}
                    register={register}
                    error={errors.email}
                    autoComplete="email"
                  />

                  <InputField
                    label="رقم الهاتف"
                    name="phone"
                    type="tel"
                    placeholder="أدخل رقم الهاتف"
                    icon={FaPhone}
                    register={register}
                    error={errors.phone}
                    autoComplete="tel"
                  />

                  <InputField
                    label="العنوان"
                    name="address"
                    placeholder="أدخل عنوانك"
                    icon={FaMapMarkerAlt}
                    register={register}
                    error={errors.address}
                    autoComplete="street-address"
                  />
                </div>
              </section>

              {/* SECURITY */}
              <section className="rounded-[28px] border border-mainColor/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1D2939] sm:p-8">
                <SectionTitle
                  icon={FaLock}
                  title="الأمان وكلمة المرور"
                  description="يمكنك تحديث كلمة المرور، أو ترك الحقل فارغاً للاحتفاظ بالكلمة الحالية."
                />

                <InputField
                  label="كلمة المرور الجديدة (اختياري)"
                  name="password"
                  type={
                    showPassword ? "text" : "password"
                  }
                  placeholder="أدخل كلمة مرور جديدة"
                  icon={FaLock}
                  register={register}
                  error={errors.password}
                  autoComplete="new-password"
                  endContent={
                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((prev) => !prev)
                      }
                      aria-label={
                        showPassword
                          ? "إخفاء كلمة المرور"
                          : "إظهار كلمة المرور"
                      }
                      aria-pressed={showPassword}
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

                <div className="mt-5 flex items-start gap-3 rounded-2xl bg-mainColor/5 p-4 dark:bg-white/5">
                  <FaShieldAlt
                    size={17}
                    className="mt-1 shrink-0 text-mainColor dark:text-white"
                  />

                  <p className="text-xs leading-7 text-secondaryColor dark:text-fourthColor">
                    اختر كلمة مرور قوية يصعب تخمينها،
                    ولا تشارك بيانات دخولك مع الآخرين.
                  </p>
                </div>
              </section>

              {/* SAVE ACTIONS */}
              <section className="flex flex-wrap items-center justify-between gap-4 rounded-[24px] border border-mainColor/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1D2939] sm:p-6">
                <div>
                  <h3 className="text-sm font-extrabold text-mainColor dark:text-white">
                    حفظ إعدادات الحساب
                  </h3>

                  <p className="mt-1 text-xs leading-6 text-secondaryColor dark:text-fourthColor">
                    {hasChanges
                      ? "لديك تعديلات لم يتم حفظها بعد."
                      : "بيانات الحساب جاهزة."}
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={saving || !hasChanges}
                  className="inline-flex h-14 items-center justify-center gap-3 rounded-2xl bg-mainColor px-7 text-sm font-extrabold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      جارٍ حفظ التغييرات...
                    </>
                  ) : (
                    <>
                      <FaSave size={17} />
                      حفظ التغييرات
                    </>
                  )}
                </button>
              </section>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
