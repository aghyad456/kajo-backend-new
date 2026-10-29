
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Link } from "react-router-dom";
import {
  FaHistory,
  FaClinicMedical,
  FaStore,
  FaPaw,
  FaSearch,
  FaFilter,
  FaSyncAlt,
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaBox,
  FaHeart,
  FaCheckCircle,
  FaHourglassHalf,
  FaTimesCircle,
  FaExclamationTriangle,
  FaArrowLeft,
  FaStickyNote,
  FaClipboardList,
  FaSpinner,
  FaTimes,
} from "react-icons/fa";

import { api } from "../../api/apiClient";

// ==========================================
// CONFIGURATION
// ==========================================

const EMPTY_ACTIVITIES = {
  all: [],
  clinics: [],
  stores: [],
  shelters: [],
};

const TABS = [
  { key: "all", label: "كل النشاطات", icon: FaHistory },
  { key: "clinics", label: "العيادات", icon: FaClinicMedical },
  { key: "stores", label: "المتاجر", icon: FaStore },
  { key: "shelters", label: "الملاجئ", icon: FaPaw },
];

const STATUS_OPTIONS = [
  { value: "all", label: "جميع الحالات" },
  { value: "pending", label: "قيد الانتظار" },
  { value: "approved", label: "تم القبول" },
  { value: "confirmed", label: "تم التأكيد" },
  { value: "rejected", label: "مرفوض" },
  { value: "cancelled", label: "ملغي" },
  { value: "processing", label: "قيد المعالجة" },
  { value: "shipped", label: "تم الشحن" },
  { value: "delivered", label: "تم التوصيل" },
];

const STATUS_CONFIG = {
  pending: {
    label: "قيد الانتظار",
    icon: FaHourglassHalf,
    className:
      "border-secondaryColor/20 bg-secondaryColor/10 text-secondaryColor",
  },
  approved: {
    label: "تم القبول",
    icon: FaCheckCircle,
    className:
      "border-mainColor/20 bg-mainColor/10 text-mainColor dark:text-white",
  },
  confirmed: {
    label: "تم التأكيد",
    icon: FaCheckCircle,
    className:
      "border-mainColor/20 bg-mainColor/10 text-mainColor dark:text-white",
  },
  rejected: {
    label: "مرفوض",
    icon: FaTimesCircle,
    className:
      "border-red-200 bg-red-50 text-red-600 dark:border-red-900 dark:bg-red-950/20 dark:text-red-300",
  },
  cancelled: {
    label: "ملغي",
    icon: FaTimesCircle,
    className:
      "border-gray-200 bg-gray-100 text-gray-600 dark:border-white/10 dark:bg-white/10 dark:text-gray-300",
  },
  processing: {
    label: "قيد المعالجة",
    icon: FaHourglassHalf,
    className:
      "border-secondaryColor/20 bg-secondaryColor/10 text-secondaryColor",
  },
  shipped: {
    label: "تم الشحن",
    icon: FaBox,
    className:
      "border-mainColor/20 bg-mainColor/10 text-mainColor dark:text-white",
  },
  delivered: {
    label: "تم التوصيل",
    icon: FaCheckCircle,
    className:
      "border-mainColor/20 bg-mainColor/10 text-mainColor dark:text-white",
  },
};

function getStatus(status) {
  return (
    STATUS_CONFIG[String(status || "").toLowerCase()] || {
      label: status || "غير محدد",
      icon: FaHistory,
      className:
        "border-gray-200 bg-gray-100 text-gray-600 dark:border-white/10 dark:bg-white/10 dark:text-gray-300",
    }
  );
}

function getActivityType(item) {
  if (item.type === "clinic") {
    return {
      label: "موعد عيادة",
      icon: FaClinicMedical,
    };
  }

  if (item.type === "store") {
    return {
      label: "طلب متجر",
      icon: FaStore,
    };
  }

  if (item.type === "shelter") {
    return {
      label:
        item.subtype === "adoption"
          ? "طلب تبنّي"
          : item.subtype === "donation"
          ? "طلب تبرع"
          : "نشاط ملجأ",
      icon: item.subtype === "donation" ? FaHeart : FaPaw,
    };
  }

  return { label: "نشاط", icon: FaHistory };
}

function normalizeActivities(response) {
  const source =
    response?.activities ||
    response?.data?.activities ||
    response?.data ||
    response;

  if (!source || typeof source !== "object") {
    return EMPTY_ACTIVITIES;
  }

  const result = {};

  for (const key of Object.keys(EMPTY_ACTIVITIES)) {
    result[key] = Array.isArray(source[key])
      ? source[key]
      : [];
  }

  return result;
}

function formatDate(value) {
  if (!value) return "—";

  const text = String(value);
  const match = text.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (!match) return text;

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
    return text;
  }

  return new Intl.DateTimeFormat("ar", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatTime(value) {
  if (!value) return "—";

  const match = String(value).match(/^(\d{1,2}):(\d{2})/);

  if (!match) return String(value);

  const hour = Number(match[1]);
  const minute = Number(match[2]);

  if (hour > 23 || minute > 59) {
    return String(value);
  }

  return `${hour % 12 || 12}:${String(minute).padStart(2, "0")} ${
    hour >= 12 ? "مساءً" : "صباحاً"
  }`;
}

// ==========================================
// COMPONENTS
// ==========================================

function SummaryCard({ label, value, icon: Icon }) {
  return (
    <div className="group rounded-[24px] border border-mainColor/10 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-white/10 dark:bg-[#1D2939]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold text-secondaryColor dark:text-fourthColor sm:text-sm">
            {label}
          </p>

          <p className="mt-4 text-3xl font-black tabular-nums text-mainColor dark:text-white">
            {value.toLocaleString("ar")}
          </p>
        </div>

        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-mainColor/10 text-mainColor dark:text-white">
          <Icon size={21} />
        </span>
      </div>
    </div>
  );
}

function Detail({ icon: Icon, label, value }) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  return (
    <div className="flex min-w-0 items-start gap-3 rounded-2xl bg-mainColor/5 p-4 dark:bg-white/5">
      <span className="mt-0.5 text-mainColor dark:text-white">
        <Icon size={16} />
      </span>

      <div className="min-w-0">
        <p className="mb-1 text-xs font-medium text-secondaryColor dark:text-fourthColor">
          {label}
        </p>

        <p className="break-words text-sm font-extrabold text-mainColor dark:text-white">
          {value}
        </p>
      </div>
    </div>
  );
}

function ActivityCard({ item }) {
  const type = getActivityType(item);
  const status = getStatus(item.status);

  const TypeIcon = type.icon;
  const StatusIcon = status.icon;

  const details = [
    {
      label: "الموقع",
      value: item.location,
      icon: FaMapMarkerAlt,
    },
    {
      label: "رقم الهاتف",
      value: item.phone,
      icon: FaPhoneAlt,
    },
    {
      label: "تاريخ الموعد",
      value: item.date ? formatDate(item.date) : null,
      icon: FaCalendarAlt,
    },
    {
      label: "الوقت",
      value: item.time ? formatTime(item.time) : null,
      icon: FaClock,
    },
    {
      label: "الكمية",
      value: item.quantity,
      icon: FaBox,
    },
    {
      label: "نوع الحيوان",
      value: item.animal_type,
      icon: FaPaw,
    },
    {
      label: "تاريخ التسليم",
      value: item.delivery_date
        ? formatDate(item.delivery_date)
        : null,
      icon: FaCalendarAlt,
    },
    {
      label: "سبق لك التبنّي",
      value:
        typeof item.has_adopted_before === "boolean"
          ? item.has_adopted_before
            ? "نعم"
            : "لا"
          : null,
      icon: FaHeart,
    },
    {
      label: "نوع التبرع",
      value: item.donation_type,
      icon: FaHeart,
    },
    {
      label: "التبرع",
      value: item.amount_or_item,
      icon: FaHeart,
    },
    {
      label: "تاريخ تقديم الطلب",
      value: item.created_at
        ? formatDate(item.created_at)
        : null,
      icon: FaHistory,
    },
  ];

  return (
    <article className="group overflow-hidden rounded-[28px] border border-mainColor/10 bg-white shadow-sm transition-all duration-300 hover:border-mainColor/25 hover:shadow-lg dark:border-white/10 dark:bg-[#1D2939]">

      <div className="h-1 bg-mainColor" />

      <div className="p-5 sm:p-7">
        {/* HEADER */}
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-4">
            <span className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-mainColor/10 p-3 text-mainColor dark:text-white">
              <TypeIcon size={22} />
            </span>

            <div className="min-w-0">
              <span className="mb-2 inline-block text-xs font-bold text-secondaryColor dark:text-fourthColor">
                {type.label}
              </span>

              <h3 className="break-words text-xl font-black text-mainColor dark:text-white sm:text-2xl">
                {item.title || type.label}
              </h3>

              {item.subtitle && (
                <p className="mt-2 break-words text-sm leading-7 text-secondaryColor dark:text-fourthColor">
                  {item.subtitle}
                </p>
              )}
            </div>
          </div>

          <span
            className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-xs font-extrabold ${status.className}`}
          >
            <StatusIcon size={13} />
            {status.label}
          </span>
        </div>

        {/* DETAILS */}
        {details.some(
          (detail) =>
            detail.value !== null &&
            detail.value !== undefined &&
            detail.value !== ""
        ) && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {details.map((detail) => (
              <Detail key={detail.label} {...detail} />
            ))}
          </div>
        )}

        {/* NOTES */}
        {item.notes && (
          <div className="mt-5 rounded-2xl border border-mainColor/10 p-5 dark:border-white/10">
            <div className="mb-3 flex items-center gap-2 font-extrabold text-mainColor dark:text-white">
              <FaStickyNote />
              <h4>ملاحظات الطلب</h4>
            </div>

            <p className="whitespace-pre-wrap break-words text-sm leading-8 text-secondaryColor dark:text-fourthColor">
              {item.notes}
            </p>
          </div>
        )}

        {/* FOOTER */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-mainColor/10 pt-5 dark:border-white/10">
          <p className="flex items-center gap-2 text-xs font-medium text-secondaryColor dark:text-fourthColor">
            <FaClipboardList />
            رقم النشاط: {item.id ?? "—"}
          </p>

          <span className="text-xs font-bold text-secondaryColor dark:text-fourthColor">
            {type.label}
          </span>
        </div>
      </div>
    </article>
  );
}

function ActivitySkeleton() {
  return (
    <div
      aria-hidden="true"
      className="animate-pulse rounded-[28px] border border-mainColor/10 bg-white p-6 dark:bg-[#1D2939]"
    >
      <div className="mb-6 flex items-center gap-4">
        <div className="h-14 w-14 rounded-2xl bg-mainColor/10" />
        <div className="flex-1 space-y-3">
          <div className="h-4 w-1/3 rounded bg-mainColor/10" />
          <div className="h-3 w-1/2 rounded bg-mainColor/10" />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className="h-20 rounded-2xl bg-mainColor/5"
          />
        ))}
      </div>
    </div>
  );
}

// ==========================================
// MAIN PAGE
// ==========================================

export default function MyActivities() {
  const [activities, setActivities] = useState(EMPTY_ACTIVITIES);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const requestRef = useRef(0);

  // ======================================
  // FETCH
  // ======================================

  const loadActivities = useCallback(async (silent = false) => {
    const requestId = ++requestRef.current;

    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const response = await api.myActivities();

      if (requestId !== requestRef.current) return;

      setActivities(normalizeActivities(response));
    } catch (err) {
      if (requestId !== requestRef.current) return;

      setError(
        err?.data?.message ||
          err?.message ||
          "تعذر تحميل النشاطات."
      );
    } finally {
      if (requestId === requestRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    loadActivities();

    return () => {
      requestRef.current += 1;
    };
  }, [loadActivities]);

  // ======================================
  // COUNTS & FILTERING
  // ======================================

  const counts = useMemo(
    () => ({
      all: activities.all.length,
      clinics: activities.clinics.length,
      stores: activities.stores.length,
      shelters: activities.shelters.length,
    }),
    [activities]
  );

  const currentItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    return (activities[activeTab] || []).filter((item) => {
      const matchesStatus =
        statusFilter === "all" ||
        String(item.status || "").toLowerCase() ===
          statusFilter;

      const searchable = [
        item.title,
        item.subtitle,
        item.location,
        item.phone,
        item.animal_type,
        item.notes,
        item.id,
        getActivityType(item).label,
      ]
        .filter((value) => value != null)
        .join(" ")
        .toLowerCase();

      return (
        matchesStatus &&
        (!query || searchable.includes(query))
      );
    });
  }, [activities, activeTab, search, statusFilter]);

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("all");
  };

  // ======================================
  // RENDER
  // ======================================

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
        <div className="absolute -right-48 -top-48 h-96 w-96 rounded-full bg-mainColor/5 blur-[100px]" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-secondaryColor/10 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-7 lg:px-10">

        {/* HEADER */}
        <header className="relative mb-8 overflow-hidden rounded-[30px] bg-mainColor px-6 py-10 text-white shadow-xl sm:px-9 sm:py-12">
          <div className="pointer-events-none absolute -left-16 -top-20 h-60 w-60 rounded-full bg-white/10" />

          <div className="relative flex flex-wrap items-center justify-between gap-6">
            <div className="max-w-2xl">
              <span className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-extrabold">
                <FaPaw />
                حسابي في كاجو
              </span>

              <h1 className="mb-4 text-3xl font-black sm:text-4xl">
                نشاطاتي وطلباتي
              </h1>

              <p className="text-sm leading-8 text-white/85 sm:text-base">
                تابع مواعيد العيادات وطلبات المتاجر
                والتبنّي والتبرعات، واطّلع على حالة
                كل نشاط من مكان واحد.
              </p>
            </div>

            <span className="flex h-24 w-24 items-center justify-center rounded-[26px] border border-white/20 bg-white/10">
              <FaHistory size={39} />
            </span>
          </div>
        </header>

        {/* SUMMARY */}
        {!loading && (
          <section
            aria-label="ملخص النشاطات"
            className="mb-9 grid grid-cols-2 gap-4 lg:grid-cols-4"
          >
            {[
              {
                label: "كل النشاطات",
                value: counts.all,
                icon: FaHistory,
              },
              {
                label: "حجوزات العيادات",
                value: counts.clinics,
                icon: FaClinicMedical,
              },
              {
                label: "طلبات المتاجر",
                value: counts.stores,
                icon: FaStore,
              },
              {
                label: "نشاطات الملاجئ",
                value: counts.shelters,
                icon: FaPaw,
              },
            ].map((stat) => (
              <SummaryCard key={stat.label} {...stat} />
            ))}
          </section>
        )}

        {/* CONTENT CONTAINER */}
        <section className="rounded-[28px] border border-mainColor/10 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#1D2939] sm:p-7">

          <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-mainColor dark:text-white">
                سجل النشاطات
              </h2>

              <p className="mt-2 text-sm text-secondaryColor dark:text-fourthColor">
                جميع الطلبات والنشاطات المرتبطة بحسابك.
              </p>
            </div>

            <button
              type="button"
              onClick={() => loadActivities(true)}
              disabled={loading || refreshing}
              className="inline-flex h-12 items-center gap-2 rounded-xl border border-mainColor/15 px-5 text-sm font-bold text-mainColor transition-colors hover:bg-mainColor/5 disabled:opacity-50 dark:text-white"
            >
              <FaSyncAlt
                className={
                  loading || refreshing ? "animate-spin" : ""
                }
              />
              تحديث النشاطات
            </button>
          </div>

          {/* TABS */}
          <div
            aria-label="أنواع النشاطات"
            className="mb-7 flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.key;

              return (
                <button
                  key={tab.key}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    setActiveTab(tab.key);
                    resetFilters();
                  }}
                  className={[
                    "flex shrink-0 items-center gap-3 rounded-2xl",
                    "px-5 py-3 text-sm font-extrabold",
                    "transition-all duration-200",
                    active
                      ? "bg-mainColor text-white shadow-md"
                      : "border border-mainColor/10 bg-mainColor/5 text-mainColor hover:bg-mainColor/10 dark:bg-white/5 dark:text-white",
                  ].join(" ")}
                >
                  <Icon size={16} />
                  {tab.label}

                  <span
                    className={
                      active
                        ? "rounded-lg bg-white/20 px-2 py-1 text-xs"
                        : "rounded-lg bg-mainColor/10 px-2 py-1 text-xs"
                    }
                  >
                    {counts[tab.key]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* SEARCH AND FILTERS */}
          <div className="mb-7 grid gap-4 md:grid-cols-[1fr_220px]">
            <div className="relative">
              <FaSearch
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-mainColor/60 dark:text-white/60"
              />

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                aria-label="البحث في النشاطات"
                placeholder="ابحث عن نشاط أو طلب..."
                className="h-13 w-full rounded-2xl border border-mainColor/15 bg-fivethColor py-3 pl-4 pr-12 text-sm font-medium text-mainColor outline-none focus:border-mainColor dark:border-white/10 dark:bg-[#101828] dark:text-white"
              />
            </div>

            <div className="relative">
              <FaFilter className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-mainColor/60 dark:text-white/60" />

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
                aria-label="تصفية حسب حالة النشاط"
                className="h-13 w-full rounded-2xl border border-mainColor/15 bg-fivethColor py-3 pl-4 pr-11 text-sm font-bold text-mainColor outline-none focus:border-mainColor dark:border-white/10 dark:bg-[#101828] dark:text-white"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ERROR */}
          {error && (
            <div
              role="alert"
              className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700 dark:border-red-900 dark:bg-red-950/20 dark:text-red-300"
            >
              <div className="flex items-center gap-3">
                <FaExclamationTriangle />
                <span className="text-sm font-bold">{error}</span>
              </div>

              <button
                onClick={() => loadActivities(true)}
                className="rounded-xl bg-mainColor px-5 py-2.5 text-xs font-bold text-white"
              >
                إعادة المحاولة
              </button>
            </div>
          )}

          {/* LOADING */}
          {loading ? (
            <div
              role="status"
              aria-label="جارٍ تحميل النشاطات"
              className="space-y-5"
            >
              <ActivitySkeleton />
              <ActivitySkeleton />
              <ActivitySkeleton />
              <span className="sr-only">
                جارٍ تحميل النشاطات...
              </span>
            </div>
          ) : (
            <>
              {/* RESULTS COUNT */}
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-bold text-secondaryColor dark:text-fourthColor">
                  عرض {currentItems.length} نشاط
                </p>

                {(search || statusFilter !== "all") && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="inline-flex items-center gap-2 text-xs font-bold text-mainColor hover:underline dark:text-white"
                  >
                    <FaTimes />
                    مسح الفلاتر
                  </button>
                )}
              </div>

              {/* ACTIVITIES */}
              {currentItems.length > 0 ? (
                <div className="space-y-5">
                  {currentItems.map((item, index) => (
                    <ActivityCard
                      key={`${item.type}-${item.subtype || "main"}-${item.id ?? index}`}
                      item={item}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-[24px] border border-mainColor/10 bg-mainColor/5 px-6 py-14 text-center dark:bg-white/5">
                  <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-white text-mainColor dark:bg-[#101828] dark:text-white">
                    <FaClipboardList size={35} />
                  </div>

                  <h3 className="mb-3 text-xl font-black text-mainColor dark:text-white">
                    {search || statusFilter !== "all"
                      ? "لا توجد نتائج مطابقة"
                      : "لا توجد نشاطات حالياً"}
                  </h3>

                  <p className="mx-auto max-w-md text-sm leading-8 text-secondaryColor dark:text-fourthColor">
                    {search || statusFilter !== "all"
                      ? "جرّب تعديل كلمة البحث أو اختيار حالة أخرى."
                      : "عندما تقوم بحجز موعد أو طلب منتج أو تقديم طلب تبنّي أو تبرع، سيظهر النشاط هنا."}
                  </p>

                  {search || statusFilter !== "all" ? (
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="mt-6 rounded-xl bg-mainColor px-6 py-3 text-sm font-bold text-white"
                    >
                      عرض جميع النتائج
                    </button>
                  ) : (
                    <Link
                      to="/app/feed"
                      className="mt-6 inline-flex items-center gap-2 rounded-xl bg-mainColor px-6 py-3 text-sm font-bold text-white"
                    >
                      استكشف كاجو
                      <FaArrowLeft size={13} />
                    </Link>
                  )}
                </div>
              )}
            </>
          )}
        </section>

        {/* BOTTOM MESSAGE */}
        <section className="mt-9 flex flex-wrap items-center justify-between gap-5 rounded-[28px] bg-mainColor p-7 text-white shadow-lg sm:p-9">
          <div className="max-w-2xl">
            <div className="mb-3 flex items-center gap-2 text-sm font-bold text-white/80">
              <FaHeart />
              كل ما يخص أليفك في مكان واحد
            </div>

            <h2 className="mb-3 text-xl font-black sm:text-2xl">
              تابع طلباتك بكل سهولة
            </h2>

            <p className="text-sm leading-8 text-white/85">
              يمكنك العودة إلى هذه الصفحة في أي وقت
              للاطلاع على آخر حالات الطلبات المسجلة في حسابك.
            </p>
          </div>

          <Link
            to="/app/feed"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-extrabold text-mainColor transition-transform hover:-translate-y-1"
          >
            العودة للمجتمع
            <FaArrowLeft size={13} />
          </Link>
        </section>
      </div>
    </main>
  );
}
