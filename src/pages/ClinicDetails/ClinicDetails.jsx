
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Link, useParams } from "react-router-dom";

import {
  FaStethoscope,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaCalendarAlt,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaArrowLeft,
  FaArrowRight,
  FaSyncAlt,
  FaPaw,
  FaInfoCircle,
  FaHeart,
  FaSpinner,
} from "react-icons/fa";

import DynamicFormModal from "../../components/modals/DynamicFormModal";
import { api } from "../../api/apiClient";
import fallbackClinicImg from "../../assets/man.svg";

// ======================================
// API & IMAGE HELPERS
// ======================================

const BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000"
).replace(/\/api\/?$/, "").replace(/\/$/, "");

function normalizeClinicResponse(response) {
  return (
    response?.clinic ||
    response?.data?.clinic ||
    response?.data ||
    response
  );
}

function normalizeSlotsResponse(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.slots)) return response.slots;
  if (Array.isArray(response?.data?.slots))
    return response.data.slots;
  if (Array.isArray(response?.data?.data))
    return response.data.data;
  if (Array.isArray(response?.data))
    return response.data;

  return [];
}

function resolveClinicImage(clinic) {
  const raw =
    clinic?.avatar_url ||
    clinic?.avatar_path ||
    clinic?.image ||
    clinic?.avatar ||
    "";

  if (!raw || typeof raw !== "string") {
    return fallbackClinicImg;
  }

  if (/^https?:\/\//i.test(raw) || raw.startsWith("data:")) {
    return raw;
  }

  const path = raw.startsWith("/") ? raw : `/${raw}`;

  return `${BASE_URL}${path}`;
}

// ======================================
// DATE & TIME HELPERS
// ======================================

function parseDateOnly(value) {
  if (!value) return null;

  const match = String(value).match(
    /^(\d{4})-(\d{2})-(\d{2})/
  );

  if (!match) return null;

  const [, year, month, day] = match;

  const date = new Date(
    Number(year),
    Number(month) - 1,
    Number(day)
  );

  if (
    date.getFullYear() !== Number(year) ||
    date.getMonth() !== Number(month) - 1 ||
    date.getDate() !== Number(day)
  ) {
    return null;
  }

  return date;
}

function formatDate(value) {
  const date = parseDateOnly(value);
  if (!date) return value || "—";

  return new Intl.DateTimeFormat("ar", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function getDayName(value) {
  const date = parseDateOnly(value);
  if (!date) return "—";

  return new Intl.DateTimeFormat("ar", {
    weekday: "long",
  }).format(date);
}

function formatTime(value) {
  if (!value) return "—";

  const match = String(value).match(
    /^(\d{1,2}):(\d{2})/
  );

  if (!match) return value;

  const hour = Number(match[1]);
  const minute = Number(match[2]);

  if (hour > 23 || minute > 59) return value;

  const period = hour >= 12 ? "مساءً" : "صباحاً";
  const formattedHour = hour % 12 || 12;

  return `${formattedHour}:${String(minute).padStart(
    2,
    "0"
  )} ${period}`;
}

function getStatusInfo(status) {
  const value = String(status ?? "available").toLowerCase();

  const statuses = {
    available: {
      label: "متاح للحجز",
      available: true,
      className:
        "bg-mainColor/10 text-mainColor dark:bg-white/10 dark:text-white",
    },
    booked: {
      label: "محجوز",
      available: false,
      className:
        "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300",
    },
    pending: {
      label: "قيد المراجعة",
      available: false,
      className:
        "bg-secondaryColor/10 text-secondaryColor",
    },
    approved: {
      label: "مؤكد",
      available: false,
      className:
        "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300",
    },
    rejected: {
      label: "غير متاح",
      available: false,
      className:
        "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300",
    },
  };

  return (
    statuses[value] || {
      label: "غير متاح",
      available: false,
      className:
        "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300",
    }
  );
}

// ======================================
// INFORMATION CARD
// ======================================

function InfoCard({ icon: Icon, label, value, href }) {
  const content = (
    <>
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-mainColor/10 text-mainColor dark:text-white">
        <Icon size={19} />
      </span>

      <span className="min-w-0 flex-1">
        <span className="mb-1 block text-xs font-medium text-secondaryColor dark:text-fourthColor">
          {label}
        </span>

        <span className="block break-words text-sm font-extrabold text-mainColor dark:text-white">
          {value || "غير محدد"}
        </span>
      </span>
    </>
  );

  const className =
    "flex min-w-0 items-center gap-4 rounded-2xl border border-mainColor/10 bg-white p-4 transition-all duration-300 hover:border-mainColor/25 hover:shadow-md dark:border-white/10 dark:bg-[#1D2939]";

  if (href) {
    return (
      <a href={href} className={className}>
        {content}
      </a>
    );
  }

  return <div className={className}>{content}</div>;
}

// ======================================
// APPOINTMENT CARD
// ======================================

function AppointmentCard({ slot, onBook }) {
  const status = getStatusInfo(slot?.status);

  return (
    <article className="group rounded-[24px] border border-mainColor/10 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-mainColor/25 hover:shadow-lg dark:border-white/10 dark:bg-[#1D2939]">
      <div className="mb-5 flex items-start justify-between gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-mainColor/10 text-mainColor dark:text-white">
          <FaCalendarAlt size={20} />
        </span>

        <span
          className={`rounded-full px-3 py-2 text-xs font-extrabold ${status.className}`}
        >
          {status.label}
        </span>
      </div>

      <h3 className="text-xl font-black text-mainColor dark:text-white">
        {getDayName(slot?.date)}
      </h3>

      <p className="mt-2 text-sm text-secondaryColor dark:text-fourthColor">
        {formatDate(slot?.date)}
      </p>

      <div className="my-5 flex items-center gap-3 rounded-2xl bg-mainColor/5 p-4 dark:bg-white/5">
        <FaClock className="text-mainColor dark:text-white" />

        <span
          dir="ltr"
          className="text-lg font-extrabold text-mainColor dark:text-white"
        >
          {formatTime(slot?.time)}
        </span>
      </div>

      <button
        type="button"
        disabled={!status.available || slot?.id == null}
        onClick={() => onBook(slot)}
        className={[
          "flex h-12 w-full items-center justify-center gap-3",
          "rounded-xl text-sm font-extrabold transition-all",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mainColor",
          status.available && slot?.id != null
            ? "bg-mainColor text-white shadow-md hover:-translate-y-0.5 hover:opacity-90"
            : "cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-white/10 dark:text-gray-400",
        ].join(" ")}
      >
        {status.available && slot?.id != null ? (
          <>
            احجز هذا الموعد
            <FaArrowLeft size={13} />
          </>
        ) : (
          "غير متاح للحجز"
        )}
      </button>
    </article>
  );
}

// ======================================
// MAIN PAGE
// ======================================

export default function ClinicDetails() {
  const { id } = useParams();

  const [clinicInfo, setClinicInfo] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");
  const [bookingError, setBookingError] = useState("");
  const [success, setSuccess] = useState("");

  const [filter, setFilter] = useState("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  const requestRef = useRef(0);
  const bookingRef = useRef(false);

  // ======================================
  // LOAD CLINIC
  // ======================================

  const load = useCallback(
    async (silent = false) => {
      const requestId = ++requestRef.current;

      if (silent) setRefreshing(true);
      else setLoading(true);

      setError("");

      try {
        if (!id) {
          throw new Error(
            "معرّف العيادة غير موجود في الرابط."
          );
        }

        const [clinicRes, slotsRes] = await Promise.all([
          api.clinicDetails(id),
          api.clinicSlotsPublic(id),
        ]);

        if (requestId !== requestRef.current) return;

        const clinic = normalizeClinicResponse(clinicRes);
        const slots = normalizeSlotsResponse(slotsRes);

        if (!clinic || typeof clinic !== "object") {
          throw new Error("بيانات العيادة غير متاحة.");
        }

        setClinicInfo({
          ...clinic,
          id: clinic.id ?? id,
          name: clinic.name || "عيادة بيطرية",
          specialty: clinic.specialty || "غير محدد",
          address: clinic.location || "غير محدد",
          phone: clinic.phone || "",
          email: clinic.email || clinic.user?.email || "",
        });

        setAvailableSlots(slots);
      } catch (err) {
        if (requestId !== requestRef.current) return;

        setError(
          err?.data?.message ||
            err?.message ||
            "تعذر تحميل بيانات العيادة."
        );
      } finally {
        if (requestId === requestRef.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [id]
  );

  useEffect(() => {
    load();

    return () => {
      requestRef.current += 1;
    };
  }, [load]);

  // ======================================
  // DERIVED DATA
  // ======================================

  const clinicImage = useMemo(
    () => resolveClinicImage(clinicInfo),
    [clinicInfo]
  );

  const sortedSlots = useMemo(() => {
    return [...availableSlots].sort((a, b) => {
      const first = `${a?.date || ""} ${a?.time || ""}`;
      const second = `${b?.date || ""} ${b?.time || ""}`;

      return first.localeCompare(second);
    });
  }, [availableSlots]);

  const availableCount = sortedSlots.filter(
    (slot) => getStatusInfo(slot.status).available
  ).length;

  const unavailableCount =
    sortedSlots.length - availableCount;

  const filteredSlots = sortedSlots.filter((slot) => {
    const available = getStatusInfo(slot.status).available;

    if (filter === "available") return available;
    if (filter === "unavailable") return !available;

    return true;
  });

  const filters = [
    {
      value: "all",
      label: "جميع المواعيد",
      count: sortedSlots.length,
    },
    {
      value: "available",
      label: "المتاحة",
      count: availableCount,
    },
    {
      value: "unavailable",
      label: "غير المتاحة",
      count: unavailableCount,
    },
  ];

  // ======================================
  // BOOKING
  // ======================================

  const openBooking = (slot) => {
    if (
      !slot?.id ||
      !getStatusInfo(slot.status).available ||
      bookingRef.current
    ) {
      return;
    }

    setBookingError("");
    setSuccess("");
    setSelectedSlot(slot);
    setIsModalOpen(true);
  };

  const closeBooking = () => {
    if (bookingRef.current) return;

    setIsModalOpen(false);
    setSelectedSlot(null);
  };

  const submitBooking = async (data) => {
    if (bookingRef.current) return;

    if (!selectedSlot?.id) {
      setBookingError("الرجاء اختيار موعد صالح.");
      throw new Error("الرجاء اختيار موعد صالح.");
    }

    bookingRef.current = true;
    setBookingLoading(true);
    setBookingError("");
    setSuccess("");

    try {
      await api.createBooking({
        slot_id: selectedSlot.id,
        animal_type: data.animal_type,
        notes: data.notes || null,
      });

      setIsModalOpen(false);
      setSelectedSlot(null);

      setSuccess(
        "تم إرسال طلب الحجز بنجاح. يرجى انتظار تأكيد العيادة."
      );

      setFilter("all");
      await load(true);
    } catch (err) {
      const message =
        err?.data?.message ||
        err?.message ||
        "فشل إرسال طلب الحجز.";

      setBookingError(message);
      throw err;
    } finally {
      bookingRef.current = false;
      setBookingLoading(false);
    }
  };

  const bookingFields = [
    {
      name: "animal_type",
      placeholder: "نوع الحيوان (قط، كلب، طائر...)",
    },
    {
      name: "date",
      placeholder: "تاريخ الموعد",
      disabled: true,
      defaultValue: selectedSlot?.date || "",
    },
    {
      name: "time",
      placeholder: "التوقيت",
      disabled: true,
      defaultValue: selectedSlot?.time || "",
    },
    {
      name: "status",
      placeholder: "حالة الحجز",
      disabled: true,
      defaultValue: "pending",
    },
    {
      name: "notes",
      placeholder: "ملاحظات عن الحالة (اختياري)",
    },
  ];

  // ======================================
  // LOADING SCREEN
  // ======================================

  if (loading) {
    return (
      <main
        dir="rtl"
        role="status"
        className="flex min-h-screen flex-col items-center justify-center gap-5 bg-fivethColor dark:bg-[#101828]"
      >
        <FaSpinner
          size={35}
          className="animate-spin text-mainColor dark:text-white"
        />

        <p className="font-bold text-mainColor dark:text-white">
          جارٍ تحميل تفاصيل العيادة...
        </p>
      </main>
    );
  }

  // ======================================
  // ERROR SCREEN
  // ======================================

  if (error && !clinicInfo) {
    return (
      <main
        dir="rtl"
        className="flex min-h-screen items-center justify-center bg-fivethColor px-4 dark:bg-[#101828]"
      >
        <div className="w-full max-w-lg rounded-[28px] border border-mainColor/10 bg-white p-9 text-center shadow-lg dark:bg-[#1D2939]">
          <FaExclamationTriangle
            size={35}
            className="mx-auto mb-5 text-red-500"
          />

          <h1 className="mb-3 text-2xl font-black text-mainColor dark:text-white">
            تعذر عرض العيادة
          </h1>

          <p className="mb-7 text-sm leading-8 text-secondaryColor dark:text-fourthColor">
            {error}
          </p>

          <button
            type="button"
            onClick={() => load()}
            className="rounded-xl bg-mainColor px-7 py-3 font-bold text-white"
          >
            إعادة المحاولة
          </button>
        </div>
      </main>
    );
  }

  // ======================================
  // PAGE RENDER
  // ======================================

  return (
    <main
      dir="rtl"
      className="relative min-h-screen overflow-hidden bg-fivethColor text-mainColor transition-colors duration-500 dark:bg-[#101828]"
    >
      {/* Decorative background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -right-48 -top-40 h-96 w-96 rounded-full bg-mainColor/5 blur-[100px]" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-secondaryColor/10 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-7 lg:px-10">

        {/* BREADCRUMB */}
        <nav
          aria-label="مسار التنقل"
          className="mb-8 flex flex-wrap items-center gap-2 text-sm font-bold"
        >
          <Link
            to="/app/feed"
            className="text-secondaryColor hover:text-mainColor dark:text-fourthColor"
          >
            الرئيسية
          </Link>

          <FaArrowLeft size={11} className="text-secondaryColor" />

          <Link
            to="/app/clinics"
            className="text-secondaryColor hover:text-mainColor dark:text-fourthColor"
          >
            العيادات
          </Link>

          <FaArrowLeft size={11} className="text-secondaryColor" />

          <span
            aria-current="page"
            className="text-mainColor dark:text-white"
          >
            {clinicInfo?.name}
          </span>
        </nav>

        {/* PAGE TITLE */}
        <header className="mb-8 flex flex-wrap items-end justify-between gap-5">
          <div>
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-mainColor/15 bg-mainColor/5 px-4 py-2 text-xs font-extrabold text-mainColor dark:bg-white/10 dark:text-white">
              <FaStethoscope />
              خدمات كاجو البيطرية
            </span>

            <h1 className="text-3xl font-black text-mainColor dark:text-white sm:text-4xl">
              تفاصيل العيادة
            </h1>

            <p className="mt-3 text-sm leading-8 text-secondaryColor dark:text-fourthColor">
              تعرّف على العيادة واستكشف مواعيد الحجز المتوفرة.
            </p>
          </div>

          <Link
            to="/app/clinics"
            className="inline-flex items-center gap-2 rounded-2xl border border-mainColor/15 bg-white px-5 py-3 text-sm font-bold text-mainColor transition-colors hover:bg-mainColor/5 dark:bg-[#1D2939] dark:text-white"
          >
            <FaArrowRight size={13} />
            العودة للعيادات
          </Link>
        </header>

        {/* SUCCESS MESSAGE */}
        {success && (
          <div
            role="status"
            className="mb-7 flex items-start gap-3 rounded-2xl border border-mainColor/20 bg-mainColor/10 p-5 text-mainColor dark:text-white"
          >
            <FaCheckCircle
              size={21}
              className="mt-1 shrink-0"
            />
            <p className="font-bold leading-7">{success}</p>
          </div>
        )}

        {/* BOOKING ERROR */}
        {bookingError && (
          <div
            role="alert"
            className="mb-7 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700 dark:border-red-900 dark:bg-red-950/20 dark:text-red-300"
          >
            <FaExclamationTriangle
              className="mt-1 shrink-0"
            />
            <p className="text-sm font-bold leading-7">
              {bookingError}
            </p>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mb-7 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-bold text-red-700"
          >
            {error}
          </div>
        )}

        {/* ======================================
            CLINIC HERO
        ====================================== */}

        <section className="relative mb-8 overflow-hidden rounded-[32px] border border-mainColor/10 bg-white shadow-lg dark:border-white/10 dark:bg-[#1D2939]">
          <div className="absolute inset-x-0 top-0 h-28 bg-mainColor/10" />

          <div className="relative grid items-center gap-8 p-6 pt-14 md:grid-cols-[260px_minmax(0,1fr)] md:p-10 md:pt-16">

            {/* Clinic image */}
            <div className="mx-auto w-full max-w-[260px]">
              <div className="relative aspect-square overflow-hidden rounded-[28px] border-4 border-white bg-mainColor/5 shadow-xl dark:border-[#1D2939]">
                <img
                  src={clinicImage}
                  alt={`صورة ${clinicInfo.name}`}
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src =
                      fallbackClinicImg;
                  }}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            {/* Clinic description */}
            <div className="min-w-0 text-center md:text-right">
              <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-mainColor px-4 py-2 text-xs font-extrabold text-white">
                <FaStethoscope size={13} />
                عيادة بيطرية
              </span>

              <h2 className="mb-4 break-words text-3xl font-black text-mainColor dark:text-white sm:text-4xl">
                {clinicInfo.name}
              </h2>

              <div className="mb-6 flex items-center justify-center gap-2 text-sm text-secondaryColor dark:text-fourthColor md:justify-start">
                <FaMapMarkerAlt className="shrink-0 text-mainColor dark:text-white" />
                <span>{clinicInfo.address}</span>
              </div>

              <p className="mb-6 max-w-xl text-sm leading-8 text-secondaryColor dark:text-fourthColor">
                أهلاً بك في صفحة العيادة على كاجو.
                يمكنك الاطلاع على معلومات التواصل
                واستكشاف المواعيد المتوفرة، ثم إرسال
                طلب حجز الموعد الذي يناسبك.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3 md:justify-start">
                <span className="inline-flex items-center gap-2 rounded-xl bg-mainColor/10 px-4 py-3 text-sm font-bold text-mainColor dark:text-white">
                  <FaStethoscope />
                  {clinicInfo.specialty}
                </span>

                <a
                  href="#clinic-appointments"
                  className="inline-flex items-center gap-2 rounded-xl bg-mainColor px-5 py-3 text-sm font-bold text-white shadow-sm transition-all hover:opacity-90"
                >
                  <FaCalendarAlt />
                  عرض المواعيد
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================
            CONTACT DETAILS
        ====================================== */}

        <section className="mb-12">
          <h2 className="mb-5 text-xl font-extrabold text-mainColor dark:text-white">
            معلومات العيادة
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <InfoCard
              icon={FaMapMarkerAlt}
              label="العنوان"
              value={clinicInfo.address}
            />

            <InfoCard
              icon={FaPhoneAlt}
              label="رقم التواصل"
              value={clinicInfo.phone}
              href={
                clinicInfo.phone
                  ? `tel:${clinicInfo.phone}`
                  : undefined
              }
            />

            <InfoCard
              icon={FaEnvelope}
              label="البريد الإلكتروني"
              value={clinicInfo.email}
              href={
                clinicInfo.email
                  ? `mailto:${clinicInfo.email}`
                  : undefined
              }
            />
          </div>
        </section>

        {/* ======================================
            APPOINTMENTS
        ====================================== */}

        <section
          id="clinic-appointments"
          className="scroll-mt-28"
        >
          <div className="mb-7 flex flex-wrap items-end justify-between gap-5">
            <div>
              <span className="mb-3 inline-flex items-center gap-2 text-sm font-bold text-secondaryColor dark:text-fourthColor">
                <FaCalendarAlt />
                الحجز الإلكتروني
              </span>

              <h2 className="text-2xl font-black text-mainColor dark:text-white sm:text-3xl">
                المواعيد المتوفرة
              </h2>

              <p className="mt-3 text-sm leading-7 text-secondaryColor dark:text-fourthColor">
                اختر موعدك المناسب وأرسل طلب الحجز للعيادة.
              </p>
            </div>

            <button
              type="button"
              disabled={refreshing || bookingLoading}
              onClick={() => load(true)}
              className="inline-flex h-12 items-center gap-2 rounded-xl border border-mainColor/15 bg-white px-5 text-sm font-bold text-mainColor transition-colors hover:bg-mainColor/5 disabled:opacity-50 dark:bg-[#1D2939] dark:text-white"
            >
              <FaSyncAlt
                className={refreshing ? "animate-spin" : ""}
              />
              تحديث المواعيد
            </button>
          </div>

          {/* Summary */}
          <div className="mb-6 grid grid-cols-2 gap-4">
            <div className="rounded-[22px] border border-mainColor/10 bg-white p-5 dark:bg-[#1D2939]">
              <div className="mb-3 flex items-center gap-2 text-sm font-bold text-secondaryColor dark:text-fourthColor">
                <FaCheckCircle className="text-mainColor dark:text-white" />
                مواعيد متاحة
              </div>

              <p className="text-3xl font-black text-mainColor dark:text-white">
                {availableCount}
              </p>
            </div>

            <div className="rounded-[22px] border border-mainColor/10 bg-white p-5 dark:bg-[#1D2939]">
              <div className="mb-3 flex items-center gap-2 text-sm font-bold text-secondaryColor dark:text-fourthColor">
                <FaCalendarAlt className="text-mainColor dark:text-white" />
                إجمالي المواعيد
              </div>

              <p className="text-3xl font-black text-mainColor dark:text-white">
                {sortedSlots.length}
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-7 flex flex-wrap gap-3">
            {filters.map((item) => {
              const active = filter === item.value;

              return (
                <button
                  key={item.value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setFilter(item.value)}
                  className={[
                    "inline-flex items-center gap-2 rounded-xl",
                    "px-5 py-3 text-sm font-bold transition-all",
                    active
                      ? "bg-mainColor text-white shadow-md"
                      : "border border-mainColor/10 bg-white text-mainColor hover:bg-mainColor/5 dark:bg-[#1D2939] dark:text-white",
                  ].join(" ")}
                >
                  {item.label}

                  <span
                    className={
                      active
                        ? "rounded-lg bg-white/20 px-2 py-0.5 text-xs"
                        : "rounded-lg bg-mainColor/10 px-2 py-0.5 text-xs"
                    }
                  >
                    {item.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Loading refresh indicator */}
          {refreshing && (
            <div
              role="status"
              className="mb-5 flex items-center gap-2 text-sm font-bold text-secondaryColor dark:text-fourthColor"
            >
              <FaSpinner className="animate-spin" />
              جارٍ تحديث المواعيد...
            </div>
          )}

          {/* Empty state */}
          {filteredSlots.length === 0 ? (
            <div className="rounded-[28px] border border-mainColor/10 bg-white px-6 py-14 text-center shadow-sm dark:bg-[#1D2939]">
              <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-mainColor/5">
                <FaCalendarAlt
                  size={35}
                  className="text-mainColor dark:text-white"
                />
              </div>

              <h3 className="mb-3 text-xl font-black text-mainColor dark:text-white">
                لا توجد مواعيد مطابقة
              </h3>

              <p className="mx-auto max-w-sm text-sm leading-8 text-secondaryColor dark:text-fourthColor">
                لا توجد مواعيد ضمن التصنيف المحدد حالياً.
                يمكنك تحديث القائمة أو عرض جميع المواعيد.
              </p>

              <button
                type="button"
                onClick={() => setFilter("all")}
                className="mt-6 rounded-xl bg-mainColor px-6 py-3 text-sm font-bold text-white"
              >
                عرض جميع المواعيد
              </button>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredSlots.map((slot, index) => (
                <AppointmentCard
                  key={
                    slot.id ??
                    `${slot.date}-${slot.time}-${index}`
                  }
                  slot={slot}
                  onBook={openBooking}
                />
              ))}
            </div>
          )}
        </section>

        {/* ======================================
            BOOKING GUIDANCE
        ====================================== */}

        <section className="mt-12 rounded-[28px] border border-mainColor/10 bg-white p-6 shadow-sm dark:bg-[#1D2939] sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-mainColor/10 text-mainColor dark:text-white">
              <FaInfoCircle size={21} />
            </span>

            <div>
              <h2 className="text-lg font-extrabold text-mainColor dark:text-white">
                قبل حجز موعدك
              </h2>

              <p className="mt-1 text-xs text-secondaryColor dark:text-fourthColor">
                خطوات بسيطة لتجربة أكثر سهولة
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {[
              {
                title: "اختر الموعد",
                description:
                  "استعرض الأوقات المتاحة واختر الوقت الذي يناسبك.",
                icon: FaCalendarAlt,
              },
              {
                title: "أدخل المعلومات",
                description:
                  "حدد نوع الحيوان وأضف ملاحظات عن حالته إن وجدت.",
                icon: FaPaw,
              },
              {
                title: "انتظر التأكيد",
                description:
                  "بعد إرسال الطلب، تتم مراجعته وتأكيده من الجهة المسؤولة.",
                icon: FaCheckCircle,
              },
            ].map((item, index) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="rounded-2xl bg-mainColor/5 p-5 dark:bg-white/5"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-mainColor dark:bg-[#101828] dark:text-white">
                      <Icon size={19} />
                    </span>

                    <span className="text-sm font-black text-secondaryColor dark:text-fourthColor">
                      0{index + 1}
                    </span>
                  </div>

                  <h3 className="mb-2 font-extrabold text-mainColor dark:text-white">
                    {item.title}
                  </h3>

                  <p className="text-sm leading-7 text-secondaryColor dark:text-fourthColor">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* FINAL NOTE */}
        <div className="mt-8 flex items-start gap-3 rounded-2xl bg-mainColor/10 p-5 text-sm leading-8 text-mainColor dark:bg-white/5 dark:text-fourthColor">
          <FaHeart className="mt-2 shrink-0" />

          <p>
            صحتهم وراحتهم بتهمنا. في الحالات البيطرية
            الطارئة، تواصل مباشرة مع جهة بيطرية مناسبة
            بدلاً من انتظار تأكيد الحجز الإلكتروني.
          </p>
        </div>
      </div>

      {/* ======================================
          EXISTING BOOKING MODAL
      ====================================== */}

      <DynamicFormModal
        isOpen={isModalOpen}
        onClose={closeBooking}
        title={
          selectedSlot
            ? `حجز موعد - ${formatDate(
                selectedSlot.date
              )} - ${formatTime(selectedSlot.time)}`
            : "حجز موعد"
        }
        fields={bookingFields}
        buttonText={
          bookingLoading
            ? "جارٍ إرسال الطلب..."
            : "إرسال طلب الحجز"
        }
        onSubmit={submitBooking}
      />
    </main>
  );
}
