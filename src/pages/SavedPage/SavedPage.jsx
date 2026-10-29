
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { Link } from "react-router-dom";

import {
  FaBookmark,
  FaRegBookmark,
  FaPaw,
  FaHeart,
  FaArrowLeft,
  FaSyncAlt,
  FaRegNewspaper,
  FaExclamationTriangle,
  FaSpinner,
  FaCheckCircle,
} from "react-icons/fa";

import PostCard from "../../components/Posts/PostCard";
import { api } from "../../api/apiClient";

// ==========================================
// NORMALIZE SAVED POSTS RESPONSE
// ==========================================

function normalizeSavedPosts(response) {
  const candidates = [
    response?.posts,
    response?.data?.posts,
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

// ==========================================
// LOADING SKELETON
// ==========================================

function SavedPostSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="animate-pulse rounded-[26px] border border-mainColor/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1D2939] sm:p-6"
    >
      {/* Author */}
      <div className="mb-6 flex items-center gap-4">
        <div className="h-12 w-12 shrink-0 rounded-full bg-mainColor/10 dark:bg-white/10" />

        <div className="flex-1 space-y-3">
          <div className="h-4 w-36 rounded-full bg-mainColor/10 dark:bg-white/10" />
          <div className="h-3 w-24 rounded-full bg-mainColor/10 dark:bg-white/10" />
        </div>
      </div>

      {/* Content */}
      <div className="mb-6 space-y-3">
        <div className="h-3 w-full rounded-full bg-mainColor/10 dark:bg-white/10" />
        <div className="h-3 w-5/6 rounded-full bg-mainColor/10 dark:bg-white/10" />
        <div className="h-3 w-2/3 rounded-full bg-mainColor/10 dark:bg-white/10" />
      </div>

      {/* Image */}
      <div className="mb-6 aspect-[16/9] rounded-2xl bg-mainColor/5 dark:bg-white/5" />

      {/* Actions */}
      <div className="flex items-center justify-between border-t border-mainColor/10 pt-5 dark:border-white/10">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="h-8 w-20 rounded-xl bg-mainColor/10 dark:bg-white/10"
          />
        ))}
      </div>
    </div>
  );
}

// ==========================================
// EMPTY STATE
// ==========================================

function EmptySavedPosts({ onRefresh }) {
  return (
    <div className="rounded-[30px] border border-mainColor/10 bg-white px-6 py-14 text-center shadow-sm dark:border-white/10 dark:bg-[#1D2939] sm:px-10 sm:py-16">
      {/* Illustration */}
      <div className="relative mx-auto mb-7 flex h-28 w-28 items-center justify-center rounded-full bg-mainColor/5 dark:bg-white/5">
        <span className="absolute inset-3 rounded-full border border-dashed border-mainColor/20" />

        <FaRegBookmark
          size={42}
          className="relative text-mainColor dark:text-white"
        />

        <span className="absolute -bottom-1 -left-1 flex h-10 w-10 items-center justify-center rounded-full bg-mainColor text-white shadow-md">
          <FaPaw size={17} />
        </span>
      </div>

      <h2 className="mb-4 text-2xl font-black text-mainColor dark:text-white">
        ما حفظت أي منشور بعد! 🐾
      </h2>

      <p className="mx-auto mb-8 max-w-md text-sm leading-8 text-secondaryColor dark:text-fourthColor sm:text-base">
        لما يعجبك منشور في مجتمع كاجو،
        احفظه حتى تقدر ترجعله بأي وقت.
        كل منشوراتك المحفوظة رح تظهر هون.
      </p>

      <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link
          to="/app/feed"
          className="inline-flex min-h-13 w-full items-center justify-center gap-3 rounded-2xl bg-mainColor px-7 py-3.5 text-sm font-extrabold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:opacity-90 sm:w-auto"
        >
          <FaRegNewspaper size={16} />
          استكشف المنشورات
          <FaArrowLeft size={13} />
        </Link>

        <button
          type="button"
          onClick={onRefresh}
          className="inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-2xl border border-mainColor/15 bg-white px-7 py-3.5 text-sm font-bold text-mainColor transition-colors hover:bg-mainColor/5 dark:border-white/10 dark:bg-[#101828] dark:text-white sm:w-auto"
        >
          <FaSyncAlt size={14} />
          تحديث المحفوظات
        </button>
      </div>
    </div>
  );
}

// ==========================================
// MAIN SAVED PAGE
// ==========================================

export default function SavedPage() {
  const [savedPosts, setSavedPosts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const mountedRef = useRef(false);
  const requestRef = useRef(0);

  // ========================================
  // LOAD SAVED POSTS
  // ========================================

  const loadSavedPosts = useCallback(
    async (silent = false) => {
      const requestId = ++requestRef.current;

      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {
        const response = await api.savedPosts();

        if (
          !mountedRef.current ||
          requestId !== requestRef.current
        ) {
          return;
        }

        const posts = normalizeSavedPosts(response);

        // Prevent duplicate posts
        const seenIds = new Set();

        const uniquePosts = posts.filter((post) => {
          if (!post || post.id == null) return false;

          const id = String(post.id);

          if (seenIds.has(id)) return false;

          seenIds.add(id);
          return true;
        });

        setSavedPosts(uniquePosts);
      } catch (err) {
        if (
          !mountedRef.current ||
          requestId !== requestRef.current
        ) {
          return;
        }

        setError(
          err?.data?.message ||
            err?.message ||
            "تعذر تحميل المنشورات المحفوظة."
        );
      } finally {
        if (
          mountedRef.current &&
          requestId === requestRef.current
        ) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    []
  );

  // ========================================
  // INITIAL LOAD
  // ========================================

  useEffect(() => {
    mountedRef.current = true;

    loadSavedPosts();

    return () => {
      mountedRef.current = false;
      requestRef.current += 1;
    };
  }, [loadSavedPosts]);

  // ========================================
  // REFRESH AFTER POST INTERACTION
  // ========================================

  const refreshSavedPosts = () => {
    return loadSavedPosts(true);
  };

  const savedCount = savedPosts.length;

  // ========================================
  // RENDER
  // ========================================

  return (
    <main
      dir="rtl"
      className="relative min-h-screen overflow-hidden bg-fivethColor text-mainColor transition-colors duration-500 dark:bg-[#101828]"
    >
      {/* Background Decorations */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -right-48 -top-48 h-[520px] w-[520px] rounded-full bg-mainColor/5 blur-[110px]" />

        <div className="absolute -bottom-40 -left-40 h-[460px] w-[460px] rounded-full bg-secondaryColor/10 blur-[110px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">

        {/* =====================================
            BREADCRUMB
        ===================================== */}

        <nav
          aria-label="مسار التنقل"
          className="mb-7 flex flex-wrap items-center gap-2 text-sm font-bold"
        >
          <Link
            to="/app/feed"
            className="text-secondaryColor transition-colors hover:text-mainColor dark:text-fourthColor"
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
            المحفوظات
          </span>
        </nav>

        {/* =====================================
            PAGE HEADER
        ===================================== */}

        <header className="relative mb-8 overflow-hidden rounded-[30px] bg-mainColor px-6 py-9 text-white shadow-xl sm:px-9 sm:py-11">

          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-20 -top-24 h-72 w-72 rounded-full bg-white/10"
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-24 right-1/3 h-56 w-56 rounded-full bg-secondaryColor/20 blur-3xl"
          />

          <div className="relative flex flex-wrap items-center justify-between gap-6">

            {/* Header Text */}
            <div className="max-w-2xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-extrabold">
                <FaPaw size={13} />
                مكتبتك الشخصية في كاجو
              </div>

              <h1 className="mb-4 text-3xl font-black leading-snug sm:text-4xl">
                المنشورات المحفوظة
              </h1>

              <p className="max-w-xl text-sm leading-8 text-white/85 sm:text-base">
                كل المنشورات اللي أعجبتك واحتفظت
                فيها، موجودة هون حتى ترجع إلها
                وتتابعها بأي وقت.
              </p>
            </div>

            {/* Decorative Icon */}
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-[28px] border border-white/20 bg-white/10 sm:h-32 sm:w-32">
              <FaBookmark size={46} />
            </div>
          </div>
        </header>

        {/* =====================================
            CONTENT GRID
        ===================================== */}

        <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_270px]">

          {/* MAIN POSTS */}
          <div className="min-w-0">

            {/* List Header */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-mainColor/10 text-mainColor dark:text-white">
                  <FaBookmark size={20} />
                </span>

                <div>
                  <h2 className="text-xl font-extrabold text-mainColor dark:text-white">
                    قائمة المحفوظات
                  </h2>

                  <p className="mt-1 text-xs text-secondaryColor dark:text-fourthColor">
                    {loading
                      ? "جارٍ تحميل المحفوظات..."
                      : `${savedCount} منشور محفوظ`}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => loadSavedPosts(true)}
                disabled={loading || refreshing}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-mainColor/15 bg-white px-5 text-sm font-extrabold text-mainColor shadow-sm transition-colors hover:bg-mainColor/5 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-[#1D2939] dark:text-white"
              >
                {loading || refreshing ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <FaSyncAlt />
                )}
                تحديث
              </button>
            </div>

            {/* Refresh Indicator */}
            {refreshing && (
              <div
                role="status"
                className="mb-5 flex items-center gap-2 text-xs font-bold text-secondaryColor dark:text-fourthColor"
              >
                <FaSpinner className="animate-spin" />
                جارٍ تحديث المحفوظات...
              </div>
            )}

            {/* =================================
                LOADING
            ================================= */}

            {loading && (
              <div
                role="status"
                aria-label="جارٍ تحميل المنشورات المحفوظة"
                className="space-y-6"
              >
                <SavedPostSkeleton />
                <SavedPostSkeleton />
                <SavedPostSkeleton />

                <span className="sr-only">
                  جارٍ تحميل المحفوظات...
                </span>
              </div>
            )}

            {/* =================================
                ERROR
            ================================= */}

            {error && (
              <div
                role="alert"
                className="mb-6 rounded-[26px] border border-red-200 bg-white p-7 text-center shadow-sm dark:border-red-900/30 dark:bg-[#1D2939]"
              >
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500 dark:bg-red-950/20">
                  <FaExclamationTriangle size={26} />
                </div>

                <h3 className="mb-3 text-lg font-extrabold text-mainColor dark:text-white">
                  تعذر تحديث المحفوظات
                </h3>

                <p className="mb-6 text-sm leading-8 text-secondaryColor dark:text-fourthColor">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={() => loadSavedPosts(savedCount > 0)}
                  disabled={loading || refreshing}
                  className="inline-flex items-center gap-2 rounded-xl bg-mainColor px-6 py-3 text-sm font-bold text-white disabled:opacity-50"
                >
                  <FaSyncAlt size={13} />
                  إعادة المحاولة
                </button>
              </div>
            )}

            {/* =================================
                POSTS
            ================================= */}

            {!loading && savedPosts.length > 0 && (
              <div
                className="space-y-6"
                aria-label="المنشورات المحفوظة"
              >
                {savedPosts.map((post) => (
                  <div
                    key={post.id}
                    className="min-w-0"
                  >
                    <PostCard
                      post={post}
                      comments={post.comments || []}
                      refreshFeed={refreshSavedPosts}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* =================================
                EMPTY STATE
            ================================= */}

            {!loading &&
              !error &&
              savedPosts.length === 0 && (
                <EmptySavedPosts
                  onRefresh={() => loadSavedPosts(true)}
                />
              )}

            {/* End message */}
            {!loading &&
              !error &&
              savedPosts.length > 0 && (
                <div className="mt-9 flex items-center justify-center gap-2 py-5 text-center text-xs font-bold text-secondaryColor dark:text-fourthColor">
                  <FaCheckCircle className="text-mainColor dark:text-white" />
                  هذه جميع المنشورات المحفوظة المعروضة حالياً
                </div>
              )}
          </div>

          {/* =====================================
              SIDEBAR
          ===================================== */}

          <aside className="hidden space-y-5 lg:sticky lg:top-28 lg:block">

            {/* Summary Card */}
            <div className="rounded-[26px] border border-mainColor/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#1D2939]">
              <div className="mb-5 flex h-13 w-13 items-center justify-center rounded-2xl bg-mainColor/10 p-3 text-mainColor dark:text-white">
                <FaBookmark size={22} />
              </div>

              <h3 className="mb-2 text-base font-extrabold text-mainColor dark:text-white">
                محفوظاتك
              </h3>

              <div className="my-5">
                <span className="text-4xl font-black tabular-nums text-mainColor dark:text-white">
                  {loading ? "—" : savedCount}
                </span>

                <span className="mr-2 text-sm font-bold text-secondaryColor dark:text-fourthColor">
                  منشور
                </span>
              </div>

              <p className="text-xs leading-7 text-secondaryColor dark:text-fourthColor">
                المنشورات التي حفظتها متاحة
                للرجوع إليها من هذه الصفحة.
              </p>
            </div>

            {/* Community Card */}
            <div className="relative overflow-hidden rounded-[26px] bg-mainColor p-6 text-white shadow-lg">
              <div className="pointer-events-none absolute -left-16 -top-16 h-44 w-44 rounded-full bg-white/10" />

              <div className="relative">
                <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
                  <FaHeart size={22} />
                </span>

                <h3 className="mb-3 text-xl font-black">
                  لقيت منشور بيعجبك؟
                </h3>

                <p className="mb-6 text-sm leading-8 text-white/85">
                  تصفّح مجتمع كاجو واحفظ
                  المنشورات اللي بتحب ترجع
                  تقرأها لاحقاً.
                </p>

                <Link
                  to="/app/feed"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-xs font-extrabold text-mainColor transition-transform hover:-translate-y-0.5"
                >
                  تصفّح المجتمع
                  <FaArrowLeft size={13} />
                </Link>
              </div>
            </div>

            {/* Quick tip */}
            <div className="rounded-[26px] border border-mainColor/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#1D2939]">
              <div className="mb-3 flex items-center gap-3">
                <FaPaw className="text-mainColor dark:text-white" />

                <h3 className="text-sm font-extrabold text-mainColor dark:text-white">
                  معلومة صغيرة
                </h3>
              </div>

              <p className="text-xs leading-7 text-secondaryColor dark:text-fourthColor">
                يمكنك إلغاء حفظ أي منشور
                من خلال زر الحفظ الموجود داخل
                بطاقة المنشور نفسها.
              </p>
            </div>
          </aside>
        </div>

        {/* =====================================
            BOTTOM CTA
        ===================================== */}

        {!loading && savedPosts.length > 0 && (
          <section className="mt-10 flex flex-wrap items-center justify-between gap-5 rounded-[26px] bg-mainColor p-7 text-white shadow-lg sm:p-8">
            <div>
              <h2 className="mb-2 text-xl font-black">
                المزيد من القصص بانتظارك 🐾
              </h2>

              <p className="text-sm leading-7 text-white/85">
                اكتشف منشورات جديدة من مجتمع محبّي الحيوانات.
              </p>
            </div>

            <Link
              to="/app/feed"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-extrabold text-mainColor transition-transform hover:-translate-y-0.5"
            >
              العودة للمجتمع
              <FaArrowLeft size={13} />
            </Link>
          </section>
        )}
      </div>
    </main>
  );
}
