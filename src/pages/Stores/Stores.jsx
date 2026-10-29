
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Link } from "react-router-dom";

import {
  FaStore,
  FaMapMarkerAlt,
  FaStar,
  FaSearch,
  FaShoppingBag,
  FaPaw,
  FaHeart,
  FaArrowLeft,
  FaSyncAlt,
  FaSpinner,
  FaExclamationTriangle,
  FaTimes,
  FaRegCompass,
  FaBoxOpen,
} from "react-icons/fa";

import { api } from "../../api/apiClient";
import fallbackImg from "../../assets/kajo.svg";

// ==========================================
// HELPERS
// ==========================================

function normalizeStores(response) {
  const candidates = [
    response?.stores,
    response?.data?.stores,
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
    "تعذر تحميل المتاجر. يرجى المحاولة مجدداً."
  );
}

function getRating(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const number = Number(value);

  if (!Number.isFinite(number) || number < 0 || number > 5) {
    return null;
  }

  return number.toFixed(1);
}

// ==========================================
// STORE CARD
// ==========================================

function StoreCard({ store }) {
  const [imageFailed, setImageFailed] = useState(false);

  const imageSrc =
    store.avatar_url && !imageFailed
      ? store.avatar_url
      : fallbackImg;

  const rating = getRating(store.rating);

  return (
    <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-[28px] border border-mainColor/10 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-mainColor/25 hover:shadow-xl dark:border-white/10 dark:bg-[#1D2939]">

      {/* STORE IMAGE */}
      <div className="relative aspect-[16/10] overflow-hidden bg-mainColor/5 dark:bg-white/5">
        <img
          src={imageSrc}
          alt={store.name || "صورة المتجر"}
          loading="lazy"
          onError={() => setImageFailed(true)}
          className={[
            "h-full w-full transition-transform duration-500",
            "group-hover:scale-105",
            imageSrc === fallbackImg
              ? "object-contain p-10"
              : "object-cover",
          ].join(" ")}
        />

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* STORE LABEL */}
        <span className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-xs font-extrabold text-mainColor shadow-sm">
          <FaStore size={12} />
          متجر كاجو
        </span>

        {/* REAL RATING ONLY */}
        {rating !== null && (
          <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/95 px-3 py-2 text-xs font-black text-mainColor shadow-sm">
            <FaStar className="text-secondaryColor" />
            <span dir="ltr">{rating}</span>
          </div>
        )}

        {store.specialty && (
          <div className="absolute bottom-4 right-5 left-5">
            <span className="inline-block max-w-full truncate rounded-xl bg-white/95 px-3 py-2 text-xs font-bold text-mainColor">
              {store.specialty}
            </span>
          </div>
        )}
      </div>

      {/* STORE CONTENT */}
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="mb-2 flex items-center gap-2 text-xs font-bold text-secondaryColor dark:text-gray-400">
              <FaShoppingBag />
              عالم مستلزمات الحيوانات
            </p>

            <h2 className="break-words text-xl font-black leading-snug text-mainColor dark:text-white sm:text-2xl">
              {store.name || "متجر حيوانات"}
            </h2>
          </div>

          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-mainColor/10 text-mainColor dark:text-white">
            <FaStore size={18} />
          </span>
        </div>

        {/* DESCRIPTION */}
        <p className="mb-6 line-clamp-3 min-h-[72px] text-sm leading-8 text-secondaryColor dark:text-gray-300">
          {store.description ||
            "اكتشف المنتجات والمستلزمات التي يقدمها هذا المتجر لأليفك."}
        </p>

        {/* DETAILS */}
        <div className="mt-auto">
          <div className="mb-5 border-t border-mainColor/10 pt-5 dark:border-white/10">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-mainColor/10 text-mainColor dark:text-white">
                <FaMapMarkerAlt size={16} />
              </span>

              <div className="min-w-0">
                <p className="mb-1 text-xs text-secondaryColor dark:text-gray-400">
                  موقع المتجر
                </p>

                <p className="break-words text-sm font-bold text-mainColor dark:text-white">
                  {store.location || "الموقع غير محدد"}
                </p>
              </div>
            </div>
          </div>

          {/* STORE LINK */}
          <Link
            to={`/app/stores/${store.id}`}
            className="group/button flex min-h-[52px] w-full items-center justify-center gap-3 rounded-2xl bg-mainColor px-5 py-3 text-sm font-extrabold text-white shadow-md transition-all duration-300 hover:opacity-90 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mainColor"
          >
            <FaShoppingBag size={16} />
            زيارة المتجر
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
// LOADING CARD
// ==========================================

function StoreSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="animate-pulse overflow-hidden rounded-[28px] border border-mainColor/10 bg-white dark:border-white/10 dark:bg-[#1D2939]"
    >
      <div className="aspect-[16/10] bg-mainColor/10 dark:bg-white/10" />

      <div className="space-y-5 p-6">
        <div className="flex items-center justify-between">
          <div className="h-5 w-2/3 rounded-xl bg-mainColor/10 dark:bg-white/10" />
          <div className="h-11 w-11 rounded-2xl bg-mainColor/10 dark:bg-white/10" />
        </div>

        <div className="space-y-3">
          <div className="h-3 w-full rounded bg-mainColor/10 dark:bg-white/10" />
          <div className="h-3 w-4/5 rounded bg-mainColor/10 dark:bg-white/10" />
          <div className="h-3 w-1/2 rounded bg-mainColor/10 dark:bg-white/10" />
        </div>

        <div className="h-14 rounded-xl bg-mainColor/5 dark:bg-white/5" />

        <div className="h-[52px] rounded-2xl bg-mainColor/10 dark:bg-white/10" />
      </div>
    </div>
  );
}

// ==========================================
// MAIN PAGE
// ==========================================

export default function Stores() {
  const [stores, setStores] = useState([]);
  const [query, setQuery] = useState("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const requestRef = useRef(0);

  // ========================================
  // LOAD STORES
  // ========================================

  const loadStores = useCallback(async (silent = false) => {
    const requestId = ++requestRef.current;

    setError("");

    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await api.stores();

      if (requestId !== requestRef.current) return;

      setStores(normalizeStores(response));
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
    loadStores();

    return () => {
      requestRef.current += 1;
    };
  }, [loadStores]);

  // ========================================
  // SEARCH
  // ========================================

  const filteredStores = useMemo(() => {
    const search = query.trim().toLowerCase();

    if (!search) return stores;

    return stores.filter((store) =>
      [
        store.name,
        store.location,
        store.specialty,
        store.description,
      ].some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(search)
      )
    );
  }, [stores, query]);

  const hasSearch = query.trim().length > 0;

  // ========================================
  // RENDER
  // ========================================

  return (
    <main
      dir="rtl"
      className="relative min-h-screen overflow-hidden bg-fivethColor text-mainColor transition-colors duration-500 dark:bg-[#101828]"
    >
      {/* BACKGROUND DECORATIONS */}
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
            المتاجر
          </span>
        </nav>

        {/* =====================================
            HERO
        ===================================== */}

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
                عالم التسوّق في كاجو
              </span>

              <h1 className="mb-5 text-3xl font-black leading-snug sm:text-4xl lg:text-5xl">
                كل ما يحتاجه أليفك
                <span className="mt-2 block text-fourthColor">
                  بمكان واحد
                </span>
              </h1>

              <p className="max-w-xl text-sm leading-8 text-white/85 sm:text-base">
                تصفّح المتاجر الموجودة في كاجو،
                واكتشف المنتجات والمستلزمات
                التي تناسب احتياجات حيوانك الأليف.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold">
                  <FaShoppingBag />
                  مستلزمات الحيوانات
                </span>

                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold">
                  <FaHeart />
                  لأنهم من عائلتنا
                </span>
              </div>
            </div>

            {/* DECORATIVE ICON */}
            <div className="hidden items-center justify-center lg:flex">
              <div className="relative flex h-44 w-44 items-center justify-center rounded-[48px] border border-white/20 bg-white/10">
                <div className="absolute -inset-4 rounded-[60px] border border-white/10" />

                <FaStore size={76} />

                <span className="absolute -bottom-4 -left-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-mainColor shadow-lg">
                  <FaPaw size={24} />
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* =====================================
            SEARCH
        ===================================== */}

        <section className="mb-8 rounded-[28px] border border-mainColor/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1D2939] sm:p-7">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-extrabold text-secondaryColor">
                <FaRegCompass />
                اكتشف متاجر كاجو
              </div>

              <h2 className="text-xl font-black text-mainColor dark:text-white sm:text-2xl">
                استكشف المتاجر
              </h2>

              <p className="mt-2 text-xs leading-7 text-secondaryColor dark:text-gray-400">
                ابحث باسم المتجر أو موقعه أو نوع المنتجات التي يقدمها.
              </p>
            </div>

            <button
              type="button"
              onClick={() => loadStores(true)}
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

          {/* SEARCH INPUT */}
          <div className="relative">
            <FaSearch className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-mainColor/55 dark:text-white/60" />

            <input
              type="search"
              value={query}
              onChange={(event) =>
                setQuery(event.target.value)
              }
              placeholder="ابحث عن متجر أو منطقة أو تخصص..."
              aria-label="البحث في المتاجر"
              className="h-[58px] w-full rounded-2xl border border-mainColor/15 bg-fivethColor py-3 pl-12 pr-12 text-sm font-bold text-mainColor outline-none transition-colors placeholder:text-mainColor/40 focus:border-mainColor focus:ring-4 focus:ring-mainColor/10 dark:border-white/10 dark:bg-[#101828] dark:text-white dark:placeholder:text-white/40"
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

          {/* RESULT COUNT */}
          {!loading && (
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <p
                role="status"
                className="text-sm font-bold text-secondaryColor dark:text-gray-300"
              >
                {hasSearch
                  ? `${filteredStores.length} نتيجة مطابقة`
                  : `${stores.length} متجر معروض`}
              </p>

              {hasSearch && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="text-xs font-bold text-mainColor hover:underline dark:text-white"
                >
                  عرض جميع المتاجر
                </button>
              )}
            </div>
          )}
        </section>

        {/* =====================================
            ERROR
        ===================================== */}

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
              onClick={() => loadStores(stores.length > 0)}
              disabled={loading || refreshing}
              className="rounded-xl bg-mainColor px-5 py-2.5 text-xs font-bold text-white disabled:opacity-50"
            >
              إعادة المحاولة
            </button>
          </div>
        )}

        {/* =====================================
            STORE LIST
        ===================================== */}

        {loading ? (
          <div
            role="status"
            aria-label="جارٍ تحميل المتاجر"
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            <StoreSkeleton />
            <StoreSkeleton />
            <StoreSkeleton />

            <span className="sr-only">
              جارٍ تحميل قائمة المتاجر...
            </span>
          </div>
        ) : filteredStores.length > 0 ? (
          <section
            aria-label="قائمة المتاجر"
            className="grid items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {filteredStores.map((store) => (
              <StoreCard
                key={store.id}
                store={store}
              />
            ))}
          </section>
        ) : (
          !error && (
            <section className="rounded-[30px] border border-mainColor/10 bg-white px-6 py-16 text-center shadow-sm dark:border-white/10 dark:bg-[#1D2939]">

              <div className="relative mx-auto mb-7 flex h-28 w-28 items-center justify-center rounded-full bg-mainColor/5 dark:bg-white/5">
                <span className="absolute inset-3 rounded-full border border-dashed border-mainColor/20" />

                {hasSearch ? (
                  <FaSearch
                    size={38}
                    className="relative text-mainColor dark:text-white"
                  />
                ) : (
                  <FaStore
                    size={38}
                    className="relative text-mainColor dark:text-white"
                  />
                )}
              </div>

              <h3 className="mb-3 text-2xl font-black text-mainColor dark:text-white">
                {hasSearch
                  ? "ما لقينا متاجر مطابقة"
                  : "لا توجد متاجر حالياً"}
              </h3>

              <p className="mx-auto max-w-md text-sm leading-8 text-secondaryColor dark:text-gray-400">
                {hasSearch
                  ? "جرّب البحث باسم آخر أو غيّر المنطقة أو التخصص."
                  : "ستظهر المتاجر هنا عندما تصبح متاحة ضمن المنصة."}
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

        {/* =====================================
            BOTTOM BANNER
        ===================================== */}

        <section className="mt-14 flex flex-wrap items-center justify-between gap-6 rounded-[30px] bg-mainColor p-7 text-white shadow-lg sm:p-10">
          <div className="max-w-2xl">
            <span className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-white/80">
              <FaHeart />
              لأنهم من عائلتنا
            </span>

            <h2 className="mb-3 text-xl font-black sm:text-2xl">
              عالم كامل من المنتجات لأليفك
            </h2>

            <p className="text-sm leading-8 text-white/85">
              اكتشف المزيد من المتاجر والمنتجات،
              وقدّم طلباتك من خلال منصة كاجو.
            </p>
          </div>

          <Link
            to="/app/my-activities"
            className="inline-flex items-center justify-center gap-3 rounded-xl bg-white px-6 py-3.5 text-sm font-extrabold text-mainColor transition-transform hover:-translate-y-0.5"
          >
            <FaBoxOpen size={16} />
            متابعة طلباتي
            <FaArrowLeft size={13} />
          </Link>
        </section>
      </div>
    </main>
  );
}
