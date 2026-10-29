
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Link, useParams } from "react-router-dom";

import {
  FaArrowRight,
  FaArrowLeft,
  FaPaw,
  FaRegNewspaper,
  FaRegComments,
  FaHeart,
  FaSyncAlt,
  FaExclamationTriangle,
  FaSearch,
  FaHome,
  FaInfoCircle,
  FaSpinner,
} from "react-icons/fa";

import PostCard from "../../components/Posts/PostCard";
import { api } from "../../api/apiClient";

// ==========================================
// NORMALIZE API RESPONSES
// ==========================================

function normalizePostResponse(response) {
  return (
    response?.post ??
    response?.data?.post ??
    response?.data ??
    response ??
    null
  );
}

function normalizeCommentsResponse(response) {
  const candidates = [
    response?.comments,
    response?.data?.comments,
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
// POST SKELETON
// ==========================================

function PostDetailsSkeleton() {
  return (
    <div
      role="status"
      aria-label="جارٍ تحميل المنشور"
      className="animate-pulse rounded-[28px] border border-mainColor/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1D2939] sm:p-7"
    >
      {/* Author */}
      <div className="mb-7 flex items-center gap-4">
        <div className="h-14 w-14 shrink-0 rounded-full bg-mainColor/10 dark:bg-white/10" />

        <div className="flex-1 space-y-3">
          <div className="h-4 w-36 rounded-full bg-mainColor/10 dark:bg-white/10" />
          <div className="h-3 w-24 rounded-full bg-mainColor/10 dark:bg-white/10" />
        </div>
      </div>

      {/* Content */}
      <div className="mb-7 space-y-3">
        <div className="h-3 w-full rounded-full bg-mainColor/10 dark:bg-white/10" />
        <div className="h-3 w-5/6 rounded-full bg-mainColor/10 dark:bg-white/10" />
        <div className="h-3 w-2/3 rounded-full bg-mainColor/10 dark:bg-white/10" />
      </div>

      {/* Image */}
      <div className="mb-6 aspect-[16/10] rounded-2xl bg-mainColor/5 dark:bg-white/5" />

      {/* Actions */}
      <div className="flex items-center justify-between border-t border-mainColor/10 pt-5 dark:border-white/10">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="h-9 w-20 rounded-xl bg-mainColor/10 dark:bg-white/10"
          />
        ))}
      </div>

      <span className="sr-only">
        جارٍ تحميل المنشور والتعليقات...
      </span>
    </div>
  );
}

// ==========================================
// ERROR / NOT FOUND STATE
// ==========================================

function PostMessage({
  title,
  description,
  icon: Icon,
  onRetry,
}) {
  return (
    <div className="rounded-[28px] border border-mainColor/10 bg-white px-6 py-14 text-center shadow-sm dark:border-white/10 dark:bg-[#1D2939]">
      <div className="relative mx-auto mb-7 flex h-28 w-28 items-center justify-center rounded-full bg-mainColor/5 dark:bg-white/5">
        <div className="absolute inset-3 rounded-full border border-dashed border-mainColor/20" />

        <Icon
          size={39}
          className="relative text-mainColor dark:text-white"
        />
      </div>

      <h2 className="mb-3 text-2xl font-black text-mainColor dark:text-white">
        {title}
      </h2>

      <p className="mx-auto mb-8 max-w-md text-sm leading-8 text-secondaryColor dark:text-fourthColor">
        {description}
      </p>

      <div className="flex flex-wrap justify-center gap-3">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-mainColor px-6 py-3 text-sm font-extrabold text-white transition-all hover:-translate-y-0.5 hover:opacity-90"
          >
            <FaSyncAlt size={13} />
            إعادة المحاولة
          </button>
        )}

        <Link
          to="/app/feed"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-mainColor/15 bg-white px-6 py-3 text-sm font-bold text-mainColor transition-colors hover:bg-mainColor/5 dark:bg-[#101828] dark:text-white"
        >
          <FaHome size={15} />
          العودة للمجتمع
        </Link>
      </div>
    </div>
  );
}

// ==========================================
// SIDE CARD
// ==========================================

function CommunitySidebar() {
  return (
    <aside className="hidden space-y-5 lg:sticky lg:top-28 lg:block">
      {/* Community Banner */}
      <div className="relative overflow-hidden rounded-[26px] bg-mainColor p-6 text-white shadow-lg">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full bg-white/10"
        />

        <div className="relative">
          <div className="mb-6 flex h-13 w-13 items-center justify-center rounded-2xl bg-white/15 p-3">
            <FaPaw size={24} />
          </div>

          <h2 className="mb-3 text-xl font-black leading-snug">
            مجتمع يجمعنا
            <br />
            بحب الحيوانات
          </h2>

          <p className="mb-6 text-sm leading-8 text-white/85">
            شارك قصصك وتجاربك مع أليفك،
            وتفاعل مع محبّي الحيوانات في كاجو.
          </p>

          <Link
            to="/app/feed"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-xs font-extrabold text-mainColor transition-transform hover:-translate-y-0.5"
          >
            استكشف المنشورات
            <FaArrowLeft size={12} />
          </Link>
        </div>
      </div>

      {/* Community Tips */}
      <div className="rounded-[26px] border border-mainColor/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#1D2939]">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-mainColor/10 text-mainColor dark:text-white">
            <FaHeart size={19} />
          </div>

          <h3 className="text-base font-extrabold text-mainColor dark:text-white">
            تواصل بمحبة
          </h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <FaRegComments className="mt-1 shrink-0 text-mainColor dark:text-white" />

            <p className="text-xs leading-7 text-secondaryColor dark:text-fourthColor">
              شارك رأيك من خلال التعليقات بطريقة لطيفة ومحترمة.
            </p>
          </div>

          <div className="flex items-start gap-3">
            <FaPaw className="mt-1 shrink-0 text-mainColor dark:text-white" />

            <p className="text-xs leading-7 text-secondaryColor dark:text-fourthColor">
              استفد من تجارب الآخرين وشارك خبراتك مع الحيوانات.
            </p>
          </div>

          <div className="flex items-start gap-3">
            <FaInfoCircle className="mt-1 shrink-0 text-mainColor dark:text-white" />

            <p className="text-xs leading-7 text-secondaryColor dark:text-fourthColor">
              لا تعتمد على المنشورات بديلاً عن استشارة الطبيب البيطري عند الحاجة.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="rounded-[26px] border border-mainColor/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1D2939]">
        <h3 className="mb-4 text-sm font-extrabold text-mainColor dark:text-white">
          روابط سريعة
        </h3>

        <Link
          to="/app/feed"
          className="flex items-center gap-3 rounded-xl bg-mainColor/5 p-4 text-sm font-bold text-mainColor transition-colors hover:bg-mainColor/10 dark:bg-white/5 dark:text-white"
        >
          <FaRegNewspaper />
          جميع المنشورات
          <FaArrowLeft className="mr-auto" size={12} />
        </Link>
      </div>
    </aside>
  );
}

// ==========================================
// MAIN POST DETAILS PAGE
// ==========================================

export default function PostDetails() {
  const { id } = useParams();

  const postId = useMemo(() => {
    const value = Number(id);

    if (
      !id ||
      !Number.isSafeInteger(value) ||
      value <= 0
    ) {
      return null;
    }

    return value;
  }, [id]);

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");
  const [commentsError, setCommentsError] = useState("");

  const requestRef = useRef(0);

  // ========================================
  // FETCH POST AND COMMENTS
  // ========================================

  const fetchAll = useCallback(
    async (silent = false) => {
      const requestId = ++requestRef.current;

      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
        setPost(null);
        setComments([]);
      }

      setError("");
      setCommentsError("");

      if (!postId) {
        setError("رابط المنشور غير صالح.");
        setLoading(false);
        setRefreshing(false);
        return;
      }

      try {
        // Load post first; comments failure should
        // not prevent viewing the post.
        const postResponse = await api.getPost(postId);

        if (requestId !== requestRef.current) return;

        const postData =
          normalizePostResponse(postResponse);

        if (
          !postData ||
          typeof postData !== "object" ||
          Array.isArray(postData)
        ) {
          setPost(null);
          setError("المنشور غير موجود أو لم يعد متاحاً.");
          return;
        }

        setPost(postData);

        try {
          const commentsResponse =
            await api.postComments(postId);

          if (requestId !== requestRef.current) return;

          setComments(
            normalizeCommentsResponse(commentsResponse)
          );
        } catch (commentError) {
          if (requestId !== requestRef.current) return;

          setCommentsError(
            commentError?.data?.message ||
              commentError?.message ||
              "تعذر تحميل التعليقات."
          );
        }
      } catch (err) {
        if (requestId !== requestRef.current) return;

        const status = Number(err?.status);

        const message =
          status === 404
            ? "المنشور غير موجود أو تم حذفه."
            : err?.data?.message ||
              err?.message ||
              "تعذر تحميل تفاصيل المنشور.";

        setError(message);
        setPost(null);
        setComments([]);
      } finally {
        if (requestId === requestRef.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [postId]
  );

  useEffect(() => {
    fetchAll();

    return () => {
      requestRef.current += 1;
    };
  }, [fetchAll]);

  const refreshPost = () => fetchAll(true);

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
            تفاصيل المنشور
          </span>
        </nav>

        {/* =====================================
            HEADER
        ===================================== */}

        <header className="mb-8 flex flex-wrap items-center justify-between gap-5">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-mainColor/15 bg-mainColor/5 px-4 py-2 text-xs font-extrabold text-mainColor dark:bg-white/10 dark:text-white">
              <FaPaw size={13} />
              مجتمع كاجو
            </div>

            <h1 className="text-3xl font-black text-mainColor dark:text-white sm:text-4xl">
              تفاصيل المنشور
            </h1>

            <p className="mt-3 text-sm leading-7 text-secondaryColor dark:text-fourthColor">
              اقرأ المنشور وتفاعل مع التعليقات
              وشارك رأيك مع مجتمع كاجو.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={refreshPost}
              disabled={loading || refreshing || !postId}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-mainColor/15 bg-white px-5 text-sm font-bold text-mainColor shadow-sm transition-colors hover:bg-mainColor/5 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-[#1D2939] dark:text-white"
            >
              {refreshing ? (
                <FaSpinner className="animate-spin" />
              ) : (
                <FaSyncAlt />
              )}
              تحديث
            </button>

            <Link
              to="/app/feed"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-mainColor px-5 text-sm font-extrabold text-white shadow-md transition-all hover:-translate-y-0.5 hover:opacity-90"
            >
              <FaArrowRight size={13} />
              العودة للمنشورات
            </Link>
          </div>
        </header>

        {/* =====================================
            CONTENT LAYOUT
        ===================================== */}

        <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_285px]">

          {/* MAIN CONTENT */}
          <div className="min-w-0 space-y-5">

            {/* Loading */}
            {loading && <PostDetailsSkeleton />}

            {/* Error */}
            {!loading && error && (
              <PostMessage
                title={
                  Number(postId) > 0
                    ? "تعذر عرض المنشور"
                    : "رابط غير صالح"
                }
                description={error}
                icon={
                  postId
                    ? FaExclamationTriangle
                    : FaSearch
                }
                onRetry={
                  postId ? () => fetchAll() : undefined
                }
              />
            )}

            {/* Not Found */}
            {!loading && !error && !post && (
              <PostMessage
                title="المنشور غير موجود"
                description="قد يكون هذا المنشور قد حُذف أو لم يعد متاحاً. يمكنك العودة إلى مجتمع كاجو لاستكشاف المزيد."
                icon={FaRegNewspaper}
              />
            )}

            {/* Actual Post */}
            {!loading && !error && post && (
              <>
                {/* Small context header */}
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-mainColor/10 bg-white px-5 py-4 shadow-sm dark:border-white/10 dark:bg-[#1D2939]">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-mainColor/10 text-mainColor dark:text-white">
                      <FaRegNewspaper size={17} />
                    </span>

                    <div>
                      <h2 className="text-sm font-extrabold text-mainColor dark:text-white">
                        منشور من مجتمع كاجو
                      </h2>

                      <p className="mt-1 text-xs text-secondaryColor dark:text-fourthColor">
                        يمكنك التفاعل معه من البطاقة أدناه
                      </p>
                    </div>
                  </div>

                  <span className="rounded-xl bg-mainColor/5 px-3 py-2 text-xs font-bold text-mainColor dark:bg-white/10 dark:text-white">
                    #{post.id ?? postId}
                  </span>
                </div>

                {/* Refresh Feedback */}
                {refreshing && (
                  <div
                    role="status"
                    className="flex items-center gap-2 text-xs font-bold text-secondaryColor dark:text-fourthColor"
                  >
                    <FaSpinner className="animate-spin" />
                    جارٍ تحديث المنشور...
                  </div>
                )}

                {/* Comments Warning */}
                {commentsError && (
                  <div
                    role="alert"
                    className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-mainColor/15 bg-white p-5 dark:border-white/10 dark:bg-[#1D2939]"
                  >
                    <div className="flex items-center gap-3">
                      <FaExclamationTriangle
                        size={17}
                        className="text-secondaryColor"
                      />

                      <p className="text-sm font-bold text-mainColor dark:text-white">
                        {commentsError}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={refreshPost}
                      disabled={refreshing}
                      className="rounded-xl bg-mainColor px-4 py-2 text-xs font-bold text-white disabled:opacity-50"
                    >
                      إعادة المحاولة
                    </button>
                  </div>
                )}

                {/* Existing PostCard */}
                <div className="min-w-0">
                  <PostCard
                    post={post}
                    comments={comments}
                    refreshFeed={refreshPost}
                  />
                </div>
              </>
            )}
          </div>

          {/* SIDEBAR */}
          <CommunitySidebar />
        </div>

        {/* =====================================
            BOTTOM NAVIGATION
        ===================================== */}

        {!loading && post && !error && (
          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-[24px] border border-mainColor/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1D2939] sm:p-6">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-mainColor/10 text-mainColor dark:text-white">
                <FaHeart size={19} />
              </span>

              <div>
                <p className="text-sm font-extrabold text-mainColor dark:text-white">
                  اكتشف المزيد من مجتمع كاجو
                </p>

                <p className="mt-1 text-xs text-secondaryColor dark:text-fourthColor">
                  قصص وتجارب ومشاركات محبّي الحيوانات
                </p>
              </div>
            </div>

            <Link
              to="/app/feed"
              className="inline-flex items-center gap-2 rounded-xl bg-mainColor px-5 py-3 text-sm font-bold text-white"
            >
              جميع المنشورات
              <FaArrowLeft size={13} />
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
