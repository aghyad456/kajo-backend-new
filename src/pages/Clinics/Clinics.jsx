
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Link } from "react-router-dom";
import {
  FaStethoscope,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaStar,
  FaSearch,
  FaEnvelope,
  FaArrowLeft,
  FaClinicMedical,
  FaFilter,
  FaSyncAlt,
  FaExclamationTriangle,
  FaPaw,
  FaTimes,
  FaCheckCircle,
  FaCalendarAlt,
} from "react-icons/fa";

import { api } from "../../api/apiClient";
import fallbackClinicImg from "../../assets/man.svg";

// ==========================================
// HELPERS
// ==========================================

const BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000"
)
  .replace(/\/api\/?$/, "")
  .replace(/\/$/, "");

function resolveClinicAvatar(clinic) {
  const raw =
    clinic?.avatar_url ||
    clinic?.avatar ||
    clinic?.image ||
    clinic?.avatar_path ||
    clinic?.avatarPath;

  if (!raw || typeof raw !== "string") {
    return fallbackClinicImg;
  }

  if (/^https?:\/\//i.test(raw)) return raw;

  const path = raw.replace(/^\/+/, "");

  if (path.startsWith("storage/")) {
    return `${BASE_URL}/${path}`;
  }

  if (path.startsWith("public/")) {
    return `${BASE_URL}/storage/${path.replace(
      /^public\//,
      ""
    )}`;
  }

  return `${BASE_URL}/storage/${path}`;
}

function normalizeClinicsResponse(response) {
  const candidates = [
    response?.clinics,
    response?.data,
    response?.items,
    response,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return {
        data: candidate,
        current_page: 1,
        last_page: 1,
      };
    }

    if (candidate && Array.isArray(candidate.data)) {
      const meta = candidate.meta || {};

      return {
        data: candidate.data,
        current_page: Number(
          candidate.current_page ??
            meta.current_page ??
            1
        ),
        last_page: Number(
          candidate.last_page ??
            meta.last_page ??
            1
        ),
      };
    }
  }

  return {
    data: [],
    current_page: 1,
    last_page: 1,
  };
}

function getClinicRating(clinic) {
  const raw = clinic?.rating;

  if (raw === null || raw === undefined || raw === "") {
    return null;
  }

  const value = Number(raw);

  return Number.isFinite(value) &&
    value >= 0 &&
    value <= 5
    ? value
    : null;
}

function getClinicAvailability(clinic) {
  if (clinic?.is_open === true) return "open";
  if (clinic?.is_open === false) return "closed";
  return "unknown";
}

// ==========================================
// CLINIC CARD
// ==========================================

function ClinicCard({ clinic }) {
  const id = clinic?.id;
  const name = clinic?.name || clinic?.clinic_name || "عيادة بيطرية";
  const specialty = clinic?.specialty || "خدمات بيطرية";
  const location = clinic?.location || clinic?.address || "غير محدد";
  const phone = clinic?.phone || "";
  const email = clinic?.email || clinic?.user?.email || "";

  const image = resolveClinicAvatar(clinic);
  const rating = getClinicRating(clinic);
  const availability = getClinicAvailability(clinic);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[28px] border border-mainColor/10 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-mainColor/25 hover:shadow-xl dark:border-white/10 dark:bg-[#1D2939]">

      {/* IMAGE */}
      <div className="relative h-56 overflow-hidden bg-mainColor/5 sm:h-60">
        <img
          src={image}
          alt={`صورة ${name}`}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = fallbackClinicImg;
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />

        {/* Rating */}
        {rating !== null && (
          <div className="absolute left-4 top-4 flex items-center gap-2 rounded-xl bg-white/95 px-3 py-2 text-sm font-extrabold text-mainColor shadow-sm backdrop-blur-md">
            <FaStar className="text-secondaryColor" />
            {rating.toFixed(1)}
          </div>
        )}

        {/* Category */}
        <div className="absolute bottom-4 right-4 flex items-center gap-2 rounded-xl bg-white/95 px-3 py-2 text-xs font-extrabold text-mainColor shadow-sm backdrop-blur-md">
          <FaStethoscope size={13} />
          عيادة بيطرية
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex flex-1 flex-col p-5 sm:p-6">

        {/* Name + Status */}
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="break-words text-xl font-black text-mainColor dark:text-white">
              {name}
            </h3>

            <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-secondaryColor dark:text-fourthColor">
              <FaStethoscope size={14} />
              <span>{specialty}</span>
            </p>
          </div>

          {availability !== "unknown" && (
            <span
              className={`rounded-full px-3 py-1.5 text-xs font-extrabold ${
                availability === "open"
                  ? "bg-mainColor/10 text-mainColor dark:bg-white/10 dark:text-white"
                  : "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300"
              }`}
            >
              {availability === "open"
                ? "مفتوحة"
                : "مغلقة"}
            </span>
          )}
        </div>

        <div className="mb-6 h-px bg-mainColor/10 dark:bg-white/10" />

        {/* DETAILS */}
        <div className="mb-7 flex-1 space-y-4">
          <div className="flex items-start gap-3 text-sm">
            <FaMapMarkerAlt
              size={16}
              className="mt-1 shrink-0 text-mainColor dark:text-white"
            />

            <span className="break-words leading-7 text-secondaryColor dark:text-fourthColor">
              {location}
            </span>
          </div>

          {phone && (
            <div className="flex items-start gap-3 text-sm">
              <FaPhoneAlt
                size={15}
                className="mt-1 shrink-0 text-mainColor dark:text-white"
              />

              <a
                href={`tel:${phone}`}
                dir="ltr"
                className="break-all text-right leading-7 text-secondaryColor hover:underline dark:text-fourthColor"
              >
                {phone}
              </a>
            </div>
          )}

          {email && (
            <div className="flex items-start gap-3 text-sm">
              <FaEnvelope
                size={16}
                className="mt-1 shrink-0 text-mainColor dark:text-white"
              />

              <a
                href={`mailto:${email}`}
                dir="ltr"
                className="break-all text-right leading-7 text-secondaryColor hover:underline dark:text-fourthColor"
              >
                {email}
              </a>
            </div>
          )}
        </div>

        {/* ACTION */}
        {id != null ? (
          <Link
            to={`/app/clinics/${id}`}
            className="group/button flex min-h-13 w-full items-center justify-center gap-3 rounded-2xl bg-mainColor px-5 py-3.5 text-sm font-extrabold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:opacity-90 hover:shadow-lg"
          >
            عرض التفاصيل والمواعيد
            <FaArrowLeft
              size={14}
              className="transition-transform group-hover/button:-translate-x-1"
            />
          </Link>
        ) : (
          <button
            type="button"
            disabled
            className="min-h-13 w-full cursor-not-allowed rounded-2xl bg-gray-100 px-5 py-3.5 text-sm font-bold text-gray-500 dark:bg-white/10"
          >
            تفاصيل العيادة غير متاحة
          </button>
        )}
      </div>
    </article>
  );
}

// ==========================================
// SKELETON
// ==========================================

function ClinicSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="animate-pulse overflow-hidden rounded-[28px] border border-mainColor/10 bg-white dark:bg-[#1D2939]"
    >
      <div className="h-56 bg-mainColor/10 dark:bg-white/10" />

      <div className="space-y-5 p-6">
        <div className="h-5 w-2/3 rounded-full bg-mainColor/10" />
        <div className="h-3 w-1/2 rounded-full bg-mainColor/10" />
        <div className="my-5 h-px bg-mainColor/10" />
        <div className="h-3 w-4/5 rounded-full bg-mainColor/10" />
        <div className="h-3 w-3/5 rounded-full bg-mainColor/10" />
        <div className="h-12 rounded-2xl bg-mainColor/10" />
      </div>
    </div>
  );
}

// ==========================================
// MAIN PAGE
// ==========================================

export default function Clinics() {
  const [clinics, setClinics] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [error, setError] = useState("");
  const [moreError, setMoreError] = useState("");

  const [query, setQuery] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("all");
  const [sortBy, setSortBy] = useState("default");

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const requestRef = useRef(0);
  const busyRef = useRef(false);
  const mountedRef = useRef(false);

  // ======================================
  // FETCH DATA
  // ======================================

  const loadClinics = useCallback(
    async (pageNumber = 1, append = false) => {
      if (append && busyRef.current) return;

      const requestId = ++requestRef.current;
      busyRef.current = true;

      if (append) {
        setLoadingMore(true);
        setMoreError("");
      } else {
        setLoading(true);
        setError("");
        setMoreError("");
      }

      try {
        const response = await api.clinics(pageNumber);

        if (
          !mountedRef.current ||
          requestId !== requestRef.current
        ) {
          return;
        }

        const result = normalizeClinicsResponse(response);
        const list = Array.isArray(result.data)
          ? result.data
          : [];

        if (append) {
          setClinics((previous) => {
            const existing = new Set(
              previous
                .filter((c) => c?.id != null)
                .map((c) => String(c.id))
            );

            const merged = [...previous];

            for (const clinic of list) {
              if (clinic?.id == null) {
                merged.push(clinic);
                continue;
              }

              const id = String(clinic.id);

              if (!existing.has(id)) {
                existing.add(id);
                merged.push(clinic);
              }
            }

            return merged;
          });
        } else {
          setClinics(list);
        }

        const current =
          Number(result.current_page) || pageNumber;
        const last =
          Number(result.last_page) || current;

        setPage(current);
        setHasMore(current < last);
      } catch (err) {
        if (
          !mountedRef.current ||
          requestId !== requestRef.current
        ) {
          return;
        }

        const message =
          err?.data?.message ||
          err?.message ||
          "تعذر تحميل العيادات.";

        if (append) setMoreError(message);
        else setError(message);
      } finally {
        if (
          mountedRef.current &&
          requestId === requestRef.current
        ) {
          setLoading(false);
          setLoadingMore(false);
          busyRef.current = false;
        }
      }
    },
    []
  );

  useEffect(() => {
    mountedRef.current = true;

    loadClinics(1, false);

    return () => {
      mountedRef.current = false;
      requestRef.current += 1;
      busyRef.current = false;
    };
  }, [loadClinics]);

  // ======================================
  // FILTERS
  // ======================================

  const specialties = useMemo(() => {
    return [
      ...new Set(
        clinics
          .map((c) => String(c?.specialty || "").trim())
          .filter(Boolean)
      ),
    ].sort((a, b) => a.localeCompare(b, "ar"));
  }, [clinics]);

  const filteredClinics = useMemo(() => {
    const search = query.trim().toLowerCase();

    const result = clinics.filter((clinic) => {
      const name = String(
        clinic?.name || clinic?.clinic_name || ""
      ).toLowerCase();

      const specialty = String(
        clinic?.specialty || ""
      ).toLowerCase();

      const location = String(
        clinic?.location || clinic?.address || ""
      ).toLowerCase();

      const matchesSearch =
        !search ||
        name.includes(search) ||
        specialty.includes(search) ||
        location.includes(search);

      const matchesSpecialty =
        specialtyFilter === "all" ||
        clinic?.specialty === specialtyFilter;

      return matchesSearch && matchesSpecialty;
    });

    if (sortBy === "name") {
      result.sort((a, b) =>
        String(a?.name || a?.clinic_name || "")
          .localeCompare(
            String(b?.name || b?.clinic_name || ""),
            "ar"
          )
      );
    }

    if (sortBy === "rating") {
      result.sort((a, b) => {
        const ratingA = getClinicRating(a);
        const ratingB = getClinicRating(b);

        if (ratingA === null) return 1;
        if (ratingB === null) return -1;

        return ratingB - ratingA;
      });
    }

    return result;
  }, [clinics, query, specialtyFilter, sortBy]);

  const resetFilters = () => {
    setQuery("");
    setSpecialtyFilter("all");
    setSortBy("default");
  };

  const loadMore = () => {
    if (!hasMore || loading || loadingMore || busyRef.current) {
      return;
    }

    loadClinics(page + 1, true);
  };

  // ======================================
  // RENDER
  // ======================================

  return (
    <main
      dir="rtl"
      className="relative isolate min-h-screen overflow-hidden bg-fivethColor text-mainColor transition-colors duration-500 dark:bg-[#101828]"
    >
      {/* BACKGROUND */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -right-48 -top-48 h-[520px] w-[520px] rounded-full bg-mainColor/5 blur-[110px]" />
        <div className="absolute -left-48 top-60 h-[460px] w-[460px] rounded-full bg-secondaryColor/10 blur-[110px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-7 lg:px-10">

        {/* ====================================
            HEADER
        ==================================== */}
        <header className="relative mb-8 overflow-hidden rounded-[30px] bg-mainColor px-6 py-12 text-white shadow-xl sm:px-10 lg:py-14">
          <div className="pointer-events-none absolute -left-20 -top-24 h-72 w-72 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-24 right-1/3 h-56 w-56 rounded-full bg-secondaryColor/20 blur-3xl" />

          <div className="relative flex flex-wrap items-center justify-between gap-8">

            <div className="max-w-2xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-extrabold">
                <FaPaw />
                الرعاية البيطرية في كاجو
              </div>

              <h1 className="mb-4 text-3xl font-black leading-snug sm:text-4xl lg:text-5xl">
                اكتشف العيادة
                <br />
                المناسبة لأليفك
              </h1>

              <p className="max-w-xl text-sm leading-8 text-white/85 sm:text-base">
                تعرّف على العيادات البيطرية،
                واستكشف تخصصاتها ومواقعها،
                واطّلع على تفاصيل خدماتها ومواعيد الحجز.
              </p>
            </div>

            <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-[30px] border border-white/20 bg-white/10 text-white sm:h-36 sm:w-36">
              <FaClinicMedical size={62} />
            </div>
          </div>
        </header>

        {/* ====================================
            SEARCH & FILTERS
        ==================================== */}
        <section className="mb-9 rounded-[26px] border border-mainColor/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1D2939] sm:p-7">

          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-extrabold text-mainColor dark:text-white">
                ابحث عن عيادة
              </h2>

              <p className="mt-1 text-xs leading-6 text-secondaryColor dark:text-fourthColor">
                استخدم الاسم أو التخصص أو المنطقة
                للعثور على العيادة المناسبة.
              </p>
            </div>

            <button
              type="button"
              onClick={() => loadClinics(1, false)}
              disabled={loading}
              className="flex items-center gap-2 rounded-xl border border-mainColor/15 px-4 py-2.5 text-sm font-bold text-mainColor transition-colors hover:bg-mainColor/5 disabled:opacity-50 dark:text-white"
            >
              <FaSyncAlt
                size={13}
                className={loading ? "animate-spin" : ""}
              />
              تحديث
            </button>
          </div>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px_180px]">

            {/* Search */}
            <div className="relative">
              <FaSearch
                size={17}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-mainColor/60 dark:text-white/60"
              />

              <input
                type="search"
                value={query}
                onChange={(event) =>
                  setQuery(event.target.value)
                }
                placeholder="ابحث عن اسم عيادة أو تخصص أو مدينة..."
                aria-label="البحث عن عيادة"
                className="h-14 w-full rounded-2xl border border-mainColor/15 bg-fivethColor py-3 pl-4 pr-12 text-sm font-medium text-mainColor outline-none transition-colors focus:border-mainColor focus:ring-4 focus:ring-mainColor/10 dark:border-white/10 dark:bg-[#101828] dark:text-white"
              />
            </div>

            {/* Specialties */}
            <div className="relative">
              <FaFilter className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-mainColor/60 dark:text-white/60" />

              <select
                value={specialtyFilter}
                onChange={(event) =>
                  setSpecialtyFilter(event.target.value)
                }
                aria-label="تصفية حسب التخصص"
                className="h-14 w-full rounded-2xl border border-mainColor/15 bg-fivethColor py-3 pl-4 pr-11 text-sm font-bold text-mainColor outline-none focus:border-mainColor dark:border-white/10 dark:bg-[#101828] dark:text-white"
              >
                <option value="all">جميع التخصصات</option>
                {specialties.map((specialty) => (
                  <option key={specialty} value={specialty}>
                    {specialty}
                  </option>
                ))}
              </select>
            </div>

            {/* Sorting */}
            <select
              value={sortBy}
              onChange={(event) =>
                setSortBy(event.target.value)
              }
              aria-label="ترتيب العيادات"
              className="h-14 w-full rounded-2xl border border-mainColor/15 bg-fivethColor px-4 py-3 text-sm font-bold text-mainColor outline-none focus:border-mainColor dark:border-white/10 dark:bg-[#101828] dark:text-white"
            >
              <option value="default">الترتيب الافتراضي</option>
              <option value="name">حسب الاسم</option>
              <option value="rating">الأعلى تقييماً</option>
            </select>
          </div>

          {(query || specialtyFilter !== "all" ||
            sortBy !== "default") && (
            <button
              type="button"
              onClick={resetFilters}
              className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-mainColor hover:underline dark:text-white"
            >
              <FaTimes />
              مسح الفلاتر
            </button>
          )}
        </section>

        {/* ====================================
            RESULTS HEADER
        ==================================== */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-mainColor dark:text-white">
              العيادات البيطرية
            </h2>

            <p className="mt-2 text-sm text-secondaryColor dark:text-fourthColor">
              {loading
                ? "جارٍ جلب العيادات..."
                : `تم العثور على ${filteredClinics.length} عيادة ضمن النتائج المحمّلة`}
            </p>
          </div>

          {!loading && !error && clinics.length > 0 && (
            <span className="inline-flex items-center gap-2 rounded-xl border border-mainColor/10 bg-white px-4 py-2.5 text-xs font-bold text-mainColor dark:bg-[#1D2939] dark:text-white">
              <FaCheckCircle />
              {clinics.length} عيادة محمّلة
            </span>
          )}
        </div>

        {/* ====================================
            INITIAL LOADING
        ==================================== */}
        {loading && (
          <div
            role="status"
            aria-label="جارٍ تحميل العيادات"
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            <ClinicSkeleton />
            <ClinicSkeleton />
            <ClinicSkeleton />
            <span className="sr-only">
              جارٍ تحميل العيادات...
            </span>
          </div>
        )}

        {/* ====================================
            ERROR
        ==================================== */}
        {!loading && error && (
          <div
            role="alert"
            className="rounded-[28px] border border-red-200 bg-white px-6 py-12 text-center shadow-sm dark:border-red-900/40 dark:bg-[#1D2939]"
          >
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-red-500 dark:bg-red-950/20">
              <FaExclamationTriangle size={29} />
            </div>

            <h3 className="mb-3 text-xl font-extrabold text-mainColor dark:text-white">
              تعذر تحميل العيادات
            </h3>

            <p className="mb-6 text-sm leading-8 text-secondaryColor dark:text-fourthColor">
              {error}
            </p>

            <button
              type="button"
              onClick={() => loadClinics(1, false)}
              className="inline-flex items-center gap-2 rounded-xl bg-mainColor px-6 py-3 text-sm font-bold text-white"
            >
              <FaSyncAlt />
              إعادة المحاولة
            </button>
          </div>
        )}

        {/* ====================================
            EMPTY STATE
        ==================================== */}
        {!loading && !error &&
          filteredClinics.length === 0 && (
          <div className="rounded-[28px] border border-mainColor/10 bg-white px-6 py-14 text-center shadow-sm dark:bg-[#1D2939]">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-mainColor/5">
              <FaClinicMedical
                size={38}
                className="text-mainColor dark:text-white"
              />
            </div>

            <h3 className="mb-3 text-xl font-black text-mainColor dark:text-white">
              {clinics.length === 0
                ? "لا توجد عيادات حالياً"
                : "لم نعثر على نتائج مطابقة"}
            </h3>

            <p className="mx-auto max-w-md text-sm leading-8 text-secondaryColor dark:text-fourthColor">
              {clinics.length === 0
                ? "لم يتم عرض أي عيادات بعد. يمكنك تحديث الصفحة للتحقق من وجود عيادات جديدة."
                : "جرّب تغيير كلمات البحث أو اختيار تخصص آخر للعثور على عيادات مناسبة."}
            </p>

            <button
              type="button"
              onClick={
                clinics.length === 0
                  ? () => loadClinics(1, false)
                  : resetFilters
              }
              className="mt-7 rounded-xl bg-mainColor px-7 py-3 text-sm font-bold text-white"
            >
              {clinics.length === 0
                ? "تحديث القائمة"
                : "عرض جميع النتائج"}
            </button>
          </div>
        )}

        {/* ====================================
            CLINICS GRID
        ==================================== */}
        {!loading && !error &&
          filteredClinics.length > 0 && (
          <div className="grid items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredClinics.map((clinic, index) => (
              <ClinicCard
                key={clinic.id ?? `clinic-${index}`}
                clinic={clinic}
              />
            ))}
          </div>
        )}

        {/* ====================================
            PAGINATION
        ==================================== */}
        {!loading && !error && hasMore && (
          <div className="mt-10 flex flex-col items-center gap-4">
            {moreError && (
              <p role="alert" className="text-sm font-bold text-red-500">
                {moreError}
              </p>
            )}

            <button
              type="button"
              disabled={loadingMore}
              onClick={loadMore}
              className="inline-flex min-h-14 items-center justify-center gap-3 rounded-2xl border border-mainColor/15 bg-white px-9 py-3 text-sm font-extrabold text-mainColor shadow-sm transition-all hover:-translate-y-1 hover:shadow-md disabled:opacity-50 dark:bg-[#1D2939] dark:text-white"
            >
              <FaSyncAlt
                className={
                  loadingMore ? "animate-spin" : ""
                }
                size={14}
              />

              {loadingMore
                ? "جارٍ تحميل العيادات..."
                : moreError
                ? "إعادة المحاولة"
                : "عرض المزيد من العيادات"}
            </button>
          </div>
        )}

        {/* ====================================
            FINAL NOTE
        ==================================== */}
        <section className="mt-14 flex flex-col items-start justify-between gap-5 rounded-[28px] bg-mainColor p-7 text-white shadow-lg sm:flex-row sm:items-center sm:p-9">
          <div className="max-w-2xl">
            <div className="mb-3 flex items-center gap-2 text-sm font-bold text-white/80">
              <FaHeartIcon />
              رعاية تبدأ بالاهتمام
            </div>

            <h2 className="mb-3 text-xl font-black sm:text-2xl">
              صحة أليفك تستحق الاهتمام
            </h2>

            <p className="text-sm leading-8 text-white/85">
              استكشف العيادات المتوفرة على كاجو،
              وتعرّف على التفاصيل والمواعيد قبل
              إرسال طلب الحجز.
            </p>
          </div>

          <Link
            to="/app/feed"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-extrabold text-mainColor transition-transform hover:-translate-y-1"
          >
            مجتمع كاجو
            <FaArrowLeft size={13} />
          </Link>
        </section>
      </div>
    </main>
  );
}

// Icon wrapper
function FaHeartIcon() {
  return <FaPaw size={16} />;
}
