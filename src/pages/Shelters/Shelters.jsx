
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Link } from "react-router-dom";

import {
  FaPaw,
  FaSearch,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaArrowLeft,
  FaHeart,
  FaHome,
  FaHandHoldingHeart,
  FaSyncAlt,
  FaSpinner,
  FaExclamationTriangle,
  FaTimes,
  FaRegCompass,
} from "react-icons/fa";

import { api } from "../../api/apiClient";
import fallbackShelter from "../../assets/cat2.svg";

// ==========================================
// HELPERS
// ==========================================

function normalizeShelters(response) {
  const candidates = [
    response?.shelters,
    response?.data?.shelters,
    response?.data,
    response,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate;
    }

    if (Array.isArray(candidate?.data)) {
      return candidate.data;
    }
  }

  return [];
}

function getErrorMessage(error) {
  return (
    error?.data?.message ||
    error?.message ||
    "تعذر تحميل الملاجئ، يرجى المحاولة مجدداً."
  );
}

// ==========================================
// SHELTER CARD
// ==========================================

function ShelterCard({ shelter }) {
  const [imageError, setImageError] = useState(false);

  const imageSrc =
    shelter.avatar_url && !imageError
      ? shelter.avatar_url
      : fallbackShelter;

  return (
    <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-[28px] border border-mainColor/10 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-mainColor/25 hover:shadow-xl dark:border-white/10 dark:bg-[#1D2939]">
      {/* IMAGE */}
      <div className="relative aspect-[16/10] overflow-hidden bg-mainColor/5">
        <img
          src={imageSrc}
          alt={shelter.name || "صورة الملجأ"}
          loading="lazy"
          onError={(event) => {
            if (event.currentTarget.src !== fallbackShelter) {
              setImageError(true);
            }
          }}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />

        <span className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/95 px-4 py-2 text-xs font-extrabold text-mainColor shadow-sm">
          <FaPaw size={12} />
          ملجأ حيوانات
        </span>

        <div className="absolute bottom-4 right-5 flex items-center gap-2 text-sm font-bold text-white">
          <FaHeart size={13} />
          لأنهم يستحقون الرعاية
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="mb-5">
          <h2 className="mb-3 break-words text-xl font-black leading-snug text-mainColor dark:text-white sm:text-2xl">
            {shelter.name || "ملجأ حيوانات"}
          </h2>

          <p className="text-sm leading-7 text-secondaryColor dark:text-gray-300">
            تعرّف على الملجأ، والحيوانات المعروضة للتبنّي،
            واحتياجاته الحالية.
          </p>
        </div>

        {/* DETAILS */}
        <div className="mb-6 space-y-3 border-t border-mainColor/10 pt-5 dark:border-white/10">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-mainColor/10 text-mainColor dark:text-white">
              <FaMapMarkerAlt size={15} />
            </span>

            <div className="min-w-0">
              <p className="mb-1 text-xs text-secondaryColor dark:text-gray-400">
                الموقع
              </p>

              <p className="break-words text-sm font-bold text-mainColor dark:text-white">
                {shelter.location || "لم يُحدَّد الموقع"}
              </p>
            </div>
          </div>

          <div className="flex min-w-0 items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-mainColor/10 text-mainColor dark:text-white">
              <FaPhoneAlt size={14} />
            </span>

            <div className="min-w-0">
              <p className="mb-1 text-xs text-secondaryColor dark:text-gray-400">
                رقم التواصل
              </p>

              {shelter.phone ? (
                <a
                  href={`tel:${String(shelter.phone).replace(/[^\d+]/g, "")}`}
                  dir="ltr"
                  className="block w-fit break-all text-sm font-bold text-mainColor hover:underline dark:text-white"
                >
                  {shelter.phone}
                </a>
              ) : (
                <p className="text-sm font-bold text-mainColor dark:text-white">
                  غير متوفر
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ACTION */}
        <div className="mt-auto">
          <Link
            to={`/app/shelters/${shelter.id}`}
            className="group/button flex min-h-13 w-full items-center justify-center gap-3 rounded-2xl bg-mainColor px-5 py-3.5 text-sm font-extrabold text-white shadow-md transition-all duration-300 hover:opacity-90 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mainColor"
          >
            زيارة الملجأ واستكشافه
            <FaArrowLeft
              size={13}
              className="transition-transform group-hover/button:-translate-x-1"
            />
          </Link>
        </div>
      </div>
    </article>
  );
}

// ==========================================
// SKELETON
// ==========================================

function ShelterSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="animate-pulse overflow-hidden rounded-[28px] border border-mainColor/10 bg-white dark:border-white/10 dark:bg-[#1D2939]"
    >
      <div className="aspect-[16/10] bg-mainColor/10 dark:bg-white/10" />

      <div className="space-y-5 p-6">
        <div className="h-5 w-2/3 rounded-full bg-mainColor/10 dark:bg-white/10" />

        <div className="h-3 w-full rounded-full bg-mainColor/10 dark:bg-white/10" />

        <div className="h-3 w-4/5 rounded-full bg-mainColor/10 dark:bg-white/10" />

        <div className="space-y-3 py-4">
          <div className="h-9 w-3/4 rounded-xl bg-mainColor/5 dark:bg-white/5" />
          <div className="h-9 w-2/3 rounded-xl bg-mainColor/5 dark:bg-white/5" />
        </div>

        <div className="h-13 rounded-2xl bg-mainColor/10 dark:bg-white/10" />
      </div>
    </div>
  );
}

// ==========================================
// MAIN PAGE
// ==========================================

export default function Shelters() {
  const [shelters, setShelters] = useState([]);
  const [query, setQuery] = useState("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const requestRef = useRef(0);

  // ========================================
  // LOAD SHELTERS
  // ========================================

  const loadShelters = useCallback(async (silent = false) => {
    const requestId = ++requestRef.current;

    setError("");

    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await api.shelters();

      if (requestId !== requestRef.current) return;

      const data = normalizeShelters(response);

      setShelters(data);
    } catch (err) {
      if (requestId !== requestRef.current) return;

      setError(getErrorMessage(err));
    } finally {
      if (requestId === requestRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    loadShelters();

    return () => {
      requestRef.current += 1;
    };
  }, [loadShelters]);

  // ========================================
  // SEARCH
  // ========================================

  const filteredShelters = useMemo(() => {
    const search = query.trim().toLowerCase();

    if (!search) return shelters;

    return shelters.filter((shelter) =>
      [
        shelter.name,
        shelter.location,
        shelter.phone,
        shelter.specialty,
      ].some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(search)
      )
    );
  }, [query, shelters]);

  const hasSearch = query.trim().length > 0;

  // ========================================
  // RENDER
  // ========================================

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
        <div className="absolute -right-48 -top-48 h-[500px] w-[500px] rounded-full bg-mainColor/5 blur-[110px]" />

        <div className="absolute -bottom-48 -left-40 h-[460px] w-[460px] rounded-full bg-secondaryColor/10 blur-[110px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
        {/* BREADCRUMB */}
        <nav
          aria-label="مسار التنقل"
          className="mb-7 flex flex-wrap items-center gap-2 text-sm font-bold"
        >
          <Link
            to="/app/feed"
            className="text-secondaryColor transition-colors hover:text-mainColor dark:text-gray-300"
          >
            المجتمع
          </Link>

          <FaArrowLeft
            size={11}
            className="text-secondaryColor/60"
          />

          <span
            aria-current="page"
            className="text-mainColor dark:text-white"
          >
            الملاجئ
          </span>
        </nav>

        {/* HERO */}
        <header className="relative mb-9 overflow-hidden rounded-[32px] bg-mainColor px-6 py-10 text-white shadow-xl sm:px-10 sm:py-12 lg:px-12">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 overflow-hidden"
          >
            <div className="absolute -left-24 -top-28 h-80 w-80 rounded-full border-[55px] border-white/10" />

            <div className="absolute -bottom-28 right-1/3 h-64 w-64 rounded-full bg-secondaryColor/15 blur-3xl" />

            <div className="absolute right-[10%] top-10 h-3 w-3 rounded-full bg-white/30" />
          </div>

          <div className="relative grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_190px]">
            <div className="max-w-2xl">
              <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-extrabold">
                <FaPaw size={14} />
                عالم الملاجئ في كاجو
              </span>

              <h1 className="mb-5 text-3xl font-black leading-snug sm:text-4xl lg:text-5xl">
                كل حيوان يستحق
                <span className="block text-fourthColor">
                  بيتاً مليئاً بالحب
                </span>
              </h1>

              <p className="max-w-xl text-sm leading-8 text-white/85 sm:text-base">
                استكشف الملاجئ الموجودة في كاجو،
                وتعرّف على الحيوانات التي تبحث عن عائلة،
                واكتشف كيف يمكنك المساهمة في رعايتها.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold">
                  <FaHeart />
                  فرص للتبنّي
                </span>

                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold">
                  <FaHandHoldingHeart />
                  فرص للمساعدة
                </span>
              </div>
            </div>

            <div className="hidden items-center justify-center lg:flex">
              <div className="relative flex h-44 w-44 items-center justify-center rounded-[48px] border border-white/20 bg-white/10">
                <div className="absolute -inset-4 rounded-[60px] border border-white/10" />

                <FaHome size={76} />

                <span className="absolute -bottom-4 -left-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-mainColor shadow-lg">
                  <FaPaw size={24} />
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* SEARCH AND SECTION TITLE */}
        <section className="mb-8 rounded-[28px] border border-mainColor/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1D2939] sm:p-7">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-extrabold text-secondaryColor">
                <FaRegCompass />
                اكتشف الملاجئ
              </div>

              <h2 className="text-xl font-black text-mainColor dark:text-white sm:text-2xl">
                الملاجئ الشريكة
              </h2>

              <p className="mt-2 text-xs leading-7 text-secondaryColor dark:text-gray-400">
                ابحث عن ملجأ حسب اسمه أو موقعه أو رقم التواصل.
              </p>
            </div>

            <button
              type="button"
              onClick={() => loadShelters(true)}
              disabled={loading || refreshing}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-mainColor/15 px-5 text-sm font-bold text-mainColor transition-colors hover:bg-mainColor/5 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:text-white"
            >
              {loading || refreshing ? (
                <FaSpinner className="animate-spin" />
              ) : (
                <FaSyncAlt />
              )}
              تحديث
            </button>
          </div>

          <div className="relative">
            <FaSearch className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-mainColor/55 dark:text-white/60" />

            <input
              type="search"
              value={query}
              onChange={(event) =>
                setQuery(event.target.value)
              }
              placeholder="ابحث عن ملجأ أو منطقة..."
              aria-label="البحث في الملاجئ"
              className="h-[58px] w-full rounded-2xl border border-mainColor/15 bg-fivethColor py-3 pl-12 pr-13 text-sm font-bold text-mainColor outline-none transition-colors placeholder:text-mainColor/40 focus:border-mainColor focus:ring-4 focus:ring-mainColor/10 dark:border-white/10 dark:bg-[#101828] dark:text-white dark:placeholder:text-white/40"
            />

            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="مسح البحث"
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-lg p-2 text-mainColor/60 hover:bg-mainColor/10 dark:text-white/70"
              >
                <FaTimes />
              </button>
            )}
          </div>

          {!loading && (
            <div className="mt-5 flex items-center justify-between gap-3">
              <p
                role="status"
                className="text-sm font-bold text-secondaryColor dark:text-gray-300"
              >
                {hasSearch
                  ? `${filteredShelters.length} نتيجة مطابقة`
                  : `${shelters.length} ملجأ معروض`}
              </p>

              {hasSearch && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="text-xs font-bold text-mainColor hover:underline dark:text-white"
                >
                  عرض جميع الملاجئ
                </button>
              )}
            </div>
          )}
        </section>

        {/* ERROR */}
        {error && (
          <div
            role="alert"
            className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-[24px] border border-red-200 bg-red-50 p-5 text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300"
          >
            <div className="flex items-start gap-3">
              <FaExclamationTriangle className="mt-1 shrink-0" />
              <p className="text-sm font-bold leading-7">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={() => loadShelters(shelters.length > 0)}
              disabled={loading || refreshing}
              className="rounded-xl bg-mainColor px-5 py-2.5 text-xs font-bold text-white disabled:opacity-50"
            >
              إعادة المحاولة
            </button>
          </div>
        )}

        {/* LOADING */}
        {loading ? (
          <div
            role="status"
            aria-label="جارٍ تحميل الملاجئ"
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            <ShelterSkeleton />
            <ShelterSkeleton />
            <ShelterSkeleton />

            <span className="sr-only">
              جارٍ تحميل قائمة الملاجئ...
            </span>
          </div>
        ) : filteredShelters.length > 0 ? (
          /* SHELTERS GRID */
          <section
            aria-label="قائمة الملاجئ"
            className="grid items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {filteredShelters.map((shelter) => (
              <ShelterCard
                key={shelter.id}
                shelter={shelter}
              />
            ))}
          </section>
        ) : (
          /* EMPTY STATE */
          !error && (
            <section className="rounded-[30px] border border-mainColor/10 bg-white px-6 py-16 text-center shadow-sm dark:border-white/10 dark:bg-[#1D2939]">
              <div className="relative mx-auto mb-7 flex h-28 w-28 items-center justify-center rounded-full bg-mainColor/5 dark:bg-white/5">
                <span className="absolute inset-3 rounded-full border border-dashed border-mainColor/20" />

                {hasSearch ? (
                  <FaSearch
                    size={37}
                    className="relative text-mainColor dark:text-white"
                  />
                ) : (
                  <FaPaw
                    size={39}
                    className="relative text-mainColor dark:text-white"
                  />
                )}
              </div>

              <h3 className="mb-3 text-2xl font-black text-mainColor dark:text-white">
                {hasSearch
                  ? "ما لقينا ملاجئ مطابقة"
                  : "لا توجد ملاجئ حالياً"}
              </h3>

              <p className="mx-auto max-w-md text-sm leading-8 text-secondaryColor dark:text-gray-400">
                {hasSearch
                  ? "جرّب البحث باسم مختلف أو منطقة أخرى."
                  : "ستظهر الملاجئ هنا عندما تصبح متاحة ضمن المنصة."}
              </p>

              {hasSearch && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="mt-6 rounded-xl bg-mainColor px-6 py-3 text-sm font-bold text-white"
                >
                  مسح البحث
                </button>
              )}
            </section>
          )
        )}

        {/* BOTTOM CTA */}
        <section className="mt-14 flex flex-wrap items-center justify-between gap-6 rounded-[30px] bg-mainColor p-7 text-white shadow-lg sm:p-10">
          <div className="max-w-2xl">
            <span className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-white/80">
              <FaHeart />
              لأنهم من عائلتنا
            </span>

            <h2 className="mb-3 text-xl font-black sm:text-2xl">
              الحب والرعاية بيبدؤوا بخطوة
            </h2>

            <p className="text-sm leading-8 text-white/85">
              تعرف على الملاجئ والحيوانات الموجودة فيها،
              واكتشف فرص التبنّي والمساعدة المتاحة.
            </p>
          </div>

          <Link
            to="/app/feed"
            className="inline-flex items-center justify-center gap-3 rounded-xl bg-white px-6 py-3.5 text-sm font-extrabold text-mainColor transition-transform hover:-translate-y-0.5"
          >
            العودة للمجتمع
            <FaArrowLeft size={13} />
          </Link>
        </section>
      </div>
    </main>
  );
}
