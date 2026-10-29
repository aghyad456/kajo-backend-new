
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { Link, useLocation } from "react-router-dom";

import {
  FaHome,
  FaStore,
  FaPaw,
  FaClinicMedical,
  FaBookmark,
  FaUserCircle,
  FaHeart,
  FaPlus,
  FaSyncAlt,
  FaArrowLeft,
  FaExclamationTriangle,
  FaRegNewspaper,
  FaCheckCircle,
  FaSpinner,
  FaInfoCircle,
} from "react-icons/fa";

import PostCard from "../../components/Posts/PostCard";
import CreatePost from "../../components/Posts/CreatePost";
import { api } from "../../api/apiClient";
import { useAuth } from "../../context/AuthContext";

// ==========================================
// RESPONSE NORMALIZATION
// ==========================================

function normalizePaginatedResponse(response) {
  const fallback = {
    data: [],
    current_page: 1,
    last_page: 1,
  };

  if (!response) return fallback;

  const candidates = [
    response?.posts,
    response?.data,
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
        current_page:
          Number(
            candidate.current_page ??
              meta.current_page ??
              1
          ) || 1,
        last_page:
          Number(
            candidate.last_page ??
              meta.last_page ??
              1
          ) || 1,
      };
    }
  }

  return fallback;
}

// ==========================================
// NAVIGATION DATA
// ==========================================

const navigationLinks = [
  {
    label: "الرئيسية",
    path: "/app/feed",
    icon: FaHome,
  },
  {
    label: "المتاجر",
    path: "/app/stores",
    icon: FaStore,
  },
  {
    label: "الملاجئ",
    path: "/app/shelters",
    icon: FaPaw,
  },
  {
    label: "العيادات",
    path: "/app/clinics",
    icon: FaClinicMedical,
  },
  {
    label: "المحفوظات",
    path: "/app/saved",
    icon: FaBookmark,
  },
  {
    label: "الملف الشخصي",
    path: "/app/profile",
    icon: FaUserCircle,
  },
];

const quickServices = [
  {
    title: "العيادات البيطرية",
    description: "استكشف خدمات العيادات",
    path: "/app/clinics",
    icon: FaClinicMedical,
  },
  {
    title: "ملاجئ الحيوانات",
    description: "اكتشف فرص التبنّي",
    path: "/app/shelters",
    icon: FaPaw,
  },
  {
    title: "متاجر الحيوانات",
    description: "تصفح مستلزمات أليفك",
    path: "/app/stores",
    icon: FaStore,
  },
];

// ==========================================
// SKELETON COMPONENT
// ==========================================

function PostSkeleton() {
  return (
    <div
      className="animate-pulse rounded-[24px] border border-mainColor/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1D2939] sm:p-6"
      aria-hidden="true"
    >
      <div className="mb-6 flex items-center gap-3">
        <div className="h-12 w-12 shrink-0 rounded-full bg-mainColor/10 dark:bg-white/10" />

        <div className="flex-1 space-y-3">
          <div className="h-3 w-32 rounded-full bg-mainColor/10 dark:bg-white/10" />
          <div className="h-2.5 w-20 rounded-full bg-mainColor/10 dark:bg-white/10" />
        </div>
      </div>

      <div className="mb-6 space-y-3">
        <div className="h-3 w-full rounded-full bg-mainColor/10 dark:bg-white/10" />
        <div className="h-3 w-4/5 rounded-full bg-mainColor/10 dark:bg-white/10" />
        <div className="h-3 w-3/5 rounded-full bg-mainColor/10 dark:bg-white/10" />
      </div>

      <div className="mb-5 aspect-[16/9] rounded-2xl bg-mainColor/5 dark:bg-white/5" />

      <div className="flex items-center justify-between border-t border-mainColor/10 pt-4 dark:border-white/10">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="h-7 w-20 rounded-lg bg-mainColor/10 dark:bg-white/10"
          />
        ))}
      </div>
    </div>
  );
}

// ==========================================
// SECTION HEADER
// ==========================================

function SectionHeader({
  title,
  subtitle,
  icon: Icon,
  action,
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-mainColor/10 text-mainColor dark:text-white">
          <Icon size={19} />
        </div>

        <div>
          <h2 className="text-lg font-extrabold text-mainColor dark:text-white">
            {title}
          </h2>

          {subtitle && (
            <p className="mt-1 text-xs text-secondaryColor dark:text-fourthColor">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {action}
    </div>
  );
}

// ==========================================
// EMPTY STATE
// ==========================================

function EmptyFeed({ onRefresh, onCreate }) {
  return (
    <div className="rounded-[28px] border border-mainColor/10 bg-white px-6 py-14 text-center shadow-sm dark:border-white/10 dark:bg-[#1D2939]">
      <div className="relative mx-auto mb-7 flex h-28 w-28 items-center justify-center rounded-full bg-mainColor/5">
        <div className="absolute inset-3 rounded-full border border-dashed border-mainColor/20" />

        <FaPaw
          size={43}
          className="relative text-mainColor dark:text-white"
        />
      </div>

      <h3 className="mb-3 text-xl font-extrabold text-mainColor dark:text-white">
        لسه ما في منشورات! 🐾
      </h3>

      <p className="mx-auto mb-7 max-w-sm text-sm leading-8 text-secondaryColor dark:text-fourthColor">
        مجتمع كاجو بانتظار أول مشاركة.
        شاركنا قصة أليفك أو صورة جميلة له،
        وخلينا نبدأ الحكاية سوا.
      </p>

      <div className="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={onCreate}
          className="inline-flex items-center gap-2 rounded-2xl bg-mainColor px-6 py-3 text-sm font-extrabold text-white transition-all hover:-translate-y-0.5 hover:opacity-90"
        >
          <FaPlus size={13} />
          إنشاء منشور
        </button>

        <button
          type="button"
          onClick={onRefresh}
          className="inline-flex items-center gap-2 rounded-2xl border border-mainColor/20 px-6 py-3 text-sm font-bold text-mainColor transition-colors hover:bg-mainColor/5 dark:text-white"
        >
          <FaSyncAlt size={13} />
          تحديث
        </button>
      </div>
    </div>
  );
}

// ==========================================
// MAIN FEED PAGE
// ==========================================

export default function FeedPage() {
  const { user } = useAuth();
  const location = useLocation();

  const createPostRef = useRef(null);
  const requestIdRef = useRef(0);
  const mountedRef = useRef(false);
  const busyRef = useRef(false);

  const [posts, setPosts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [error, setError] = useState("");
  const [moreError, setMoreError] = useState("");

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // ========================================
  // USER INFORMATION
  // ========================================

  const userName =
    user?.name ||
    user?.full_name ||
    user?.username ||
    "صديق كاجو";

  const firstName =
    String(userName).trim().split(/\s+/)[0] ||
    "صديقنا";

  const userInitial =
    String(userName).trim().charAt(0) || "ك";

  // ========================================
  // FETCH POSTS
  // ========================================

  const loadPosts = useCallback(
    async (pageToLoad = 1, mode = "replace") => {
      if (mode === "append" && busyRef.current) {
        return;
      }

      // كل طلب جديد يلغي نتائج الطلبات السابقة منطقياً
      const requestId = ++requestIdRef.current;
      busyRef.current = true;

      if (mode === "replace") {
        setLoading(true);
        setError("");
        setMoreError("");
      } else {
        setLoadingMore(true);
        setMoreError("");
      }

      try {
        const response = await api.feedPosts(pageToLoad);

        if (
          !mountedRef.current ||
          requestId !== requestIdRef.current
        ) {
          return;
        }

        const paginated =
          normalizePaginatedResponse(response);

        const data = Array.isArray(paginated.data)
          ? paginated.data
          : [];

        const currentPage =
          Number(paginated.current_page) || pageToLoad;

        const lastPage =
          Number(paginated.last_page) || currentPage;

        if (mode === "replace") {
          setPosts(data);
        } else {
          setPosts((previous) => {
            const existingIds = new Set(
              previous.map((post) => String(post.id))
            );

            const merged = [...previous];

            for (const post of data) {
              const id = String(post.id);

              if (!existingIds.has(id)) {
                existingIds.add(id);
                merged.push(post);
              }
            }

            return merged;
          });
        }

        setPage(currentPage);
        setHasMore(currentPage < lastPage);
      } catch (err) {
        if (
          !mountedRef.current ||
          requestId !== requestIdRef.current
        ) {
          return;
        }

        const message =
          err?.message || "تعذر تحميل المنشورات";

        if (mode === "append") {
          setMoreError(message);
        } else {
          setError(message);
        }
      } finally {
        if (
          mountedRef.current &&
          requestId === requestIdRef.current
        ) {
          setLoading(false);
          setLoadingMore(false);
          busyRef.current = false;
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

    loadPosts(1, "replace");

    return () => {
      mountedRef.current = false;
      requestIdRef.current += 1;
      busyRef.current = false;
    };
  }, [loadPosts]);

  // ========================================
  // POST CREATED
  // ========================================

  const handleCreated = (created) => {
    const createdPost = created?.post || created;

    if (!createdPost || createdPost.id == null) {
      // إذا CreatePost لا يرجع منشوراً كاملاً
      // نعيد جلب الصفحة الأولى من السيرفر
      loadPosts(1, "replace");
      return;
    }

    setPosts((previous) => {
      const exists = previous.some(
        (post) =>
          String(post.id) === String(createdPost.id)
      );

      if (exists) {
        return previous;
      }

      return [createdPost, ...previous];
    });

    setError("");
  };

  // ========================================
  // ACTIONS
  // ========================================

  const refreshFeed = () => {
    loadPosts(1, "replace");
  };

  const loadMore = () => {
    if (
      !hasMore ||
      loading ||
      loadingMore ||
      busyRef.current
    ) {
      return;
    }

    loadPosts(page + 1, "append");
  };

  const scrollToCreate = () => {
    createPostRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const isLinkActive = (path) =>
    location.pathname === path ||
    location.pathname.startsWith(path + "/");

  // ========================================
  // RENDER
  // ========================================

  return (
    <main
      dir="rtl"
      className="relative min-h-screen overflow-x-hidden bg-fivethColor text-mainColor transition-colors duration-500 dark:bg-[#101828]"
    >
      {/* Background Decorations */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -right-48 -top-48 h-[550px] w-[550px] rounded-full bg-mainColor/5 blur-[110px]" />

        <div className="absolute -left-48 top-64 h-[450px] w-[450px] rounded-full bg-secondaryColor/10 blur-[110px]" />
      </div>

      <div className="relative mx-auto max-w-[1450px] px-4 pb-20 pt-8 sm:px-6 lg:px-8">

        {/* ======================================
            WELCOME HEADER
        ====================================== */}

        <section className="relative mb-8 overflow-hidden rounded-[28px] border border-mainColor/10 bg-white px-5 py-7 shadow-sm dark:border-white/10 dark:bg-[#1D2939] sm:px-8 sm:py-9">
          <div className="pointer-events-none absolute -left-14 -top-20 h-60 w-60 rounded-full bg-mainColor/5" />

          <div className="pointer-events-none absolute -bottom-16 left-24 h-40 w-40 rounded-full bg-secondaryColor/10 blur-2xl" />

          <div className="relative flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">

            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-mainColor/5 px-4 py-2 text-xs font-extrabold text-mainColor dark:bg-white/10 dark:text-white">
                <FaPaw size={13} />
                مجتمع كاجو
              </div>

              <h1 className="mb-3 text-2xl font-black leading-snug text-mainColor dark:text-white sm:text-3xl">
                أهلاً بعودتك، {firstName}
                <span className="mr-2">🐾</span>
              </h1>

              <p className="max-w-xl text-sm leading-8 text-secondaryColor dark:text-fourthColor sm:text-base">
                اكتشف جديد مجتمع كاجو، شارك لحظاتك
                مع أليفك، وتواصل مع أشخاص يشاركونك
                حب الحيوانات.
              </p>
            </div>

            <button
              type="button"
              onClick={scrollToCreate}
              className="group inline-flex shrink-0 items-center gap-3 rounded-2xl bg-mainColor px-6 py-4 text-sm font-extrabold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:opacity-90 hover:shadow-xl"
            >
              <FaPlus size={15} />
              مشاركة جديدة
              <FaArrowLeft
                size={13}
                className="transition-transform group-hover:-translate-x-1"
              />
            </button>
          </div>
        </section>

        {/* ======================================
            MAIN THREE-COLUMN LAYOUT
        ====================================== */}

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[220px_minmax(0,1fr)] xl:grid-cols-[220px_minmax(0,1fr)_270px]">

          {/* ====================================
              RIGHT SIDEBAR
          ==================================== */}

          <aside
            className="sticky top-28 hidden space-y-5 lg:block"
            aria-label="القائمة الجانبية"
          >
            {/* Profile Card */}
            <div className="overflow-hidden rounded-[24px] border border-mainColor/10 bg-white shadow-sm dark:border-white/10 dark:bg-[#1D2939]">

              <div className="h-16 bg-mainColor/10" />

              <div className="px-5 pb-5 text-center">
                <div className="relative mx-auto -mt-8 mb-3 flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-mainColor text-2xl font-black text-white shadow-md dark:border-[#1D2939]">
                  {userInitial}
                </div>

                <p className="break-words text-base font-extrabold text-mainColor dark:text-white">
                  {userName}
                </p>

                <p className="mt-1 text-xs text-secondaryColor dark:text-fourthColor">
                  عضو في مجتمع كاجو
                </p>

                <Link
                  to="/app/profile"
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-mainColor/15 px-3 py-2.5 text-xs font-bold text-mainColor transition-colors hover:bg-mainColor/5 dark:text-white"
                >
                  <FaUserCircle size={14} />
                  عرض الملف الشخصي
                </Link>
              </div>
            </div>

            {/* Navigation Card */}
            <nav
              aria-label="أقسام كاجو"
              className="rounded-[24px] border border-mainColor/10 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-[#1D2939]"
            >
              <p className="mb-3 px-3 pt-2 text-xs font-extrabold text-secondaryColor dark:text-fourthColor">
                استكشف كاجو
              </p>

              <div className="space-y-1">
                {navigationLinks.map((item) => {
                  const Icon = item.icon;
                  const active = isLinkActive(item.path);

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      aria-current={
                        active ? "page" : undefined
                      }
                      className={[
                        "group flex items-center gap-3",
                        "rounded-xl px-4 py-3",
                        "text-sm font-bold",
                        "transition-all duration-200",
                        active
                          ? "bg-mainColor text-white shadow-sm"
                          : "text-mainColor hover:bg-mainColor/5 dark:text-white",
                      ].join(" ")}
                    >
                      <Icon
                        size={16}
                        className={
                          active
                            ? "text-white"
                            : "text-secondaryColor transition-transform group-hover:scale-110"
                        }
                      />

                      <span>{item.label}</span>

                      {active && (
                        <span className="mr-auto h-1.5 w-1.5 rounded-full bg-white" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </nav>
          </aside>

          {/* ====================================
              CENTER - MAIN FEED
          ==================================== */}

          <div className="min-w-0 space-y-6">

            {/* Mobile quick navigation */}
            <nav
              aria-label="التنقل السريع"
              className="flex gap-2 overflow-x-auto pb-1 lg:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {navigationLinks.slice(0, 5).map((item) => {
                const Icon = item.icon;
                const active = isLinkActive(item.path);

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    aria-current={
                      active ? "page" : undefined
                    }
                    className={[
                      "flex shrink-0 items-center gap-2",
                      "rounded-xl border px-4 py-3",
                      "text-xs font-bold transition-colors",
                      active
                        ? "border-mainColor bg-mainColor text-white"
                        : "border-mainColor/10 bg-white text-mainColor dark:border-white/10 dark:bg-[#1D2939] dark:text-white",
                    ].join(" ")}
                  >
                    <Icon size={14} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Create Post */}
            <section
              ref={createPostRef}
              className="scroll-mt-28 space-y-4"
              aria-label="إنشاء منشور"
            >
              <div className="rounded-[24px] border border-mainColor/10 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#1D2939] sm:p-5">
                <SectionHeader
                  title="شارك مجتمع كاجو"
                  subtitle="عندك صورة أو قصة حلوة عن أليفك؟"
                  icon={FaPlus}
                />

                <div className="mt-5">
                  <CreatePost onCreated={handleCreated} />
                </div>
              </div>
            </section>

            {/* Feed Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-1 pt-2">
              <SectionHeader
                title="آخر المنشورات"
                subtitle="جديد مجتمع محبّي الحيوانات"
                icon={FaRegNewspaper}
              />

              <button
                type="button"
                onClick={refreshFeed}
                disabled={loading}
                aria-label="تحديث المنشورات"
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-mainColor/10 bg-white text-mainColor shadow-sm transition-all hover:bg-mainColor/5 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-[#1D2939] dark:text-white"
                title="تحديث المنشورات"
              >
                <FaSyncAlt
                  size={16}
                  className={loading ? "animate-spin" : ""}
                />
              </button>
            </div>

            {/* =================================
                LOADING
            ================================= */}

            {loading && (
              <div
                className="space-y-5"
                role="status"
                aria-label="جارٍ تحميل المنشورات"
              >
                <PostSkeleton />
                <PostSkeleton />
                <PostSkeleton />

                <span className="sr-only">
                  جارٍ تحميل المنشورات...
                </span>
              </div>
            )}

            {/* =================================
                ERROR
            ================================= */}

            {!loading && error && (
              <div
                role="alert"
                className="rounded-[24px] border border-red-200 bg-white px-6 py-10 text-center shadow-sm dark:border-red-900/30 dark:bg-[#1D2939]"
              >
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500 dark:bg-red-950/30">
                  <FaExclamationTriangle size={26} />
                </div>

                <h3 className="mb-2 text-lg font-extrabold text-mainColor dark:text-white">
                  تعذر تحديث المنشورات
                </h3>

                <p className="mb-6 text-sm leading-7 text-secondaryColor dark:text-fourthColor">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={refreshFeed}
                  className="inline-flex items-center gap-2 rounded-xl bg-mainColor px-6 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
                >
                  <FaSyncAlt size={13} />
                  إعادة المحاولة
                </button>
              </div>
            )}

            {/* =================================
                EMPTY STATE
            ================================= */}

            {!loading && !error && posts.length === 0 && (
              <EmptyFeed
                onRefresh={refreshFeed}
                onCreate={scrollToCreate}
              />
            )}

            {/* =================================
                POSTS
            ================================= */}

            {!loading && posts.length > 0 && (
              <div
                className="space-y-6"
                aria-label="منشورات المجتمع"
              >
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="min-w-0"
                  >
                    <PostCard
                      post={post}
                      comments={post.comments || []}
                      refreshFeed={refreshFeed}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* =================================
                LOAD MORE ERROR
            ================================= */}

            {!loading && moreError && (
              <div
                role="alert"
                className="rounded-2xl border border-red-200 bg-white p-5 text-center dark:border-red-900/30 dark:bg-[#1D2939]"
              >
                <p className="mb-3 text-sm font-bold text-red-500">
                  {moreError}
                </p>

                <button
                  type="button"
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="rounded-xl bg-mainColor px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50"
                >
                  إعادة المحاولة
                </button>
              </div>
            )}

            {/* =================================
                LOAD MORE
            ================================= */}

            {!loading &&
              !error &&
              hasMore &&
              !moreError && (
                <div className="flex flex-col items-center gap-3 pb-6 pt-3">

                  <button
                    type="button"
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="group inline-flex min-h-14 items-center justify-center gap-3 rounded-2xl border border-mainColor/15 bg-white px-9 py-3 text-sm font-extrabold text-mainColor shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-mainColor/30 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-[#1D2939] dark:text-white"
                  >
                    {loadingMore ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        جارٍ تحميل المزيد...
                      </>
                    ) : (
                      <>
                        عرض المزيد من المنشورات
                        <FaArrowLeft
                          size={14}
                          className="transition-transform group-hover:-translate-x-1"
                        />
                      </>
                    )}
                  </button>

                  <p className="text-xs text-secondaryColor dark:text-fourthColor">
                    اكتشف المزيد من مشاركات المجتمع
                  </p>
                </div>
              )}

            {/* End of Feed */}
            {!loading &&
              !error &&
              posts.length > 0 &&
              !hasMore && (
                <div className="flex items-center justify-center gap-2 py-7 text-center text-xs font-bold text-secondaryColor dark:text-fourthColor">
                  <FaCheckCircle className="text-mainColor dark:text-white" />
                  وصلت لنهاية المنشورات الحالية
                </div>
              )}
          </div>

          {/* ====================================
              LEFT SIDEBAR
          ==================================== */}

          <aside className="hidden space-y-5 xl:sticky xl:top-28 xl:block">

            {/* Welcome Card */}
            <div className="relative overflow-hidden rounded-[24px] bg-mainColor p-6 text-white shadow-lg">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -left-12 -top-12 h-40 w-40 rounded-full bg-white/10"
              />

              <div className="relative">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
                  <FaHeart size={22} />
                </div>

                <h3 className="mb-3 text-xl font-extrabold leading-snug">
                  عالم يجمعنا
                  <br />
                  بحب الحيوانات
                </h3>

                <p className="mb-5 text-sm leading-8 text-white/85">
                  في كاجو، كل مشاركة ممكن تكون
                  بداية قصة جميلة مع صديق أليف.
                </p>

                <button
                  type="button"
                  onClick={scrollToCreate}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-xs font-extrabold text-mainColor transition-all hover:-translate-y-0.5"
                >
                  <FaPlus size={12} />
                  شارك قصتك
                </button>
              </div>
            </div>

            {/* Quick Services */}
            <div className="rounded-[24px] border border-mainColor/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1D2939]">
              <h3 className="mb-5 text-base font-extrabold text-mainColor dark:text-white">
                خدمات تهمّك
              </h3>

              <div className="space-y-2">
                {quickServices.map((service) => {
                  const Icon = service.icon;

                  return (
                    <Link
                      key={service.path}
                      to={service.path}
                      className="group flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-mainColor/5 dark:hover:bg-white/5"
                    >
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-mainColor/10 text-mainColor dark:text-white">
                        <Icon size={19} />
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-extrabold text-mainColor dark:text-white">
                          {service.title}
                        </span>

                        <span className="mt-1 block text-xs leading-5 text-secondaryColor dark:text-fourthColor">
                          {service.description}
                        </span>
                      </span>

                      <FaArrowLeft
                        size={12}
                        className="text-secondaryColor transition-transform group-hover:-translate-x-1"
                      />
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Community Note */}
            <div className="rounded-[24px] border border-mainColor/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1D2939]">
              <div className="mb-3 flex items-center gap-2 text-mainColor dark:text-white">
                <FaInfoCircle size={17} />

                <h3 className="text-sm font-extrabold">
                  مجتمع أفضل للجميع
                </h3>
              </div>

              <p className="text-xs leading-7 text-secondaryColor dark:text-fourthColor">
                شارك تجاربك باحترام، واهتم
                بمصداقية المعلومات، وخلّي
                مجتمع كاجو مكاناً آمناً ولطيفاً
                لمحبي الحيوانات.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
