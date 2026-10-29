
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { Link, useNavigate } from "react-router-dom";
import {
  FaPaw,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaUserMd,
  FaStore,
  FaHome,
  FaClipboardCheck,
  FaArrowLeft,
  FaSyncAlt,
  FaSpinner,
  FaShieldAlt,
  FaHeart,
  FaInfoCircle,
  FaRegCalendarAlt,
  FaUserCheck,
} from "react-icons/fa";

import { api } from "../../api/apiClient";
import { useAuth } from "../../context/AuthContext";
import waitingBg from "../../assets/waiting.svg";

// ==========================================
// HELPERS
// ==========================================

function getRoleInfo(value) {
  const role = String(value ?? "")
    .trim()
    .toLowerCase();

  if (role === "doctor" || role === "5") {
    return {
      name: "طبيب بيطري",
      icon: FaUserMd,
    };
  }

  if (
    [
      "shop_owner",
      "shop-owner",
      "store_owner",
      "store-owner",
      "store",
      "3",
    ].includes(role)
  ) {
    return {
      name: "صاحب متجر",
      icon: FaStore,
    };
  }

  if (
    [
      "shelter_owner",
      "shelter-owner",
      "shelter",
      "4",
    ].includes(role)
  ) {
    return {
      name: "صاحب ملجأ",
      icon: FaHome,
    };
  }

  return {
    name: value || "حساب مهني",
    icon: FaUserCheck,
  };
}

function isSetupComplete(value) {
  return (
    value === true ||
    value === 1 ||
    (typeof value === "string" &&
      ["true", "1", "yes"].includes(
        value.trim().toLowerCase()
      ))
  );
}

function getDestination(user) {
  const role = Number(user?.role);
  const hasSetup = isSetupComplete(
    user?.hasSetup ?? user?.has_setup
  );

  if (role === 1) {
    return "/admin/dashboard";
  }

  if ([3, 4, 5].includes(role)) {
    if (!hasSetup) return "/app/setup";

    if (role === 3) return "/app/store-dashboard";
    if (role === 4) return "/app/shelter-dashboard";

    return "/app/dashboard";
  }

  return "/app/feed";
}

function getStatusInfo(status) {
  switch (status) {
    case "approved":
      return {
        title: "تمت الموافقة على طلبك!",
        subtitle:
          "مبروك! تمت الموافقة على طلب انضمامك. يمكنك الآن متابعة إعداد حسابك المهني.",
        label: "تمت الموافقة",
        icon: FaCheckCircle,
        iconBg: "bg-mainColor/10",
        iconColor: "text-mainColor dark:text-white",
        badge:
          "bg-mainColor/10 text-mainColor dark:bg-white/10 dark:text-white",
      };

    case "rejected":
      return {
        title: "تم رفض طلب الانضمام",
        subtitle:
          "لم تتم الموافقة على طلبك الحالي. لا يزال بإمكانك استخدام مجتمع كاجو وخدماته المتاحة لحسابك.",
        label: "طلب مرفوض",
        icon: FaTimesCircle,
        iconBg: "bg-red-50 dark:bg-red-950/20",
        iconColor: "text-red-600 dark:text-red-400",
        badge:
          "bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400",
      };

    default:
      return {
        title: "طلبك قيد المراجعة",
        subtitle:
          "وصلنا طلب انضمامك إلى كاجو. يمكنك متابعة حالته من هنا، وعندما تتخذ الإدارة قراراً سيظهر بعد تحديث الحالة.",
        label: "بانتظار مراجعة الإدارة",
        icon: FaClock,
        iconBg: "bg-secondaryColor/15",
        iconColor: "text-secondaryColor",
        badge: "bg-secondaryColor/15 text-secondaryColor",
      };
  }
}

function formatDate(value) {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat("ar-SY", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

function extractRequest(response) {
  return (
    response?.request ??
    response?.data?.request ??
    null
  );
}

// ==========================================
// STATUS STEPS
// ==========================================

function StatusSteps({ status }) {
  const isPending = status === "pending";
  const isApproved = status === "approved";
  const isRejected = status === "rejected";

  const steps = [
    {
      title: "تم إرسال الطلب",
      description: "تم تسجيل طلب الانضمام",
      complete: true,
    },
    {
      title: "مراجعة الإدارة",
      description: isPending
        ? "الطلب بانتظار قرار الإدارة"
        : "انتهت مراجعة الطلب",
      complete: !isPending,
    },
    {
      title: isApproved
        ? "الموافقة على الطلب"
        : isRejected
        ? "تم رفض الطلب"
        : "القرار النهائي",
      description: isApproved
        ? "يمكنك متابعة إعداد حسابك"
        : isRejected
        ? "لم تتم الموافقة على الطلب"
        : "بانتظار نتيجة المراجعة",
      complete: isApproved || isRejected,
    },
  ];

  return (
    <ol className="space-y-0">
      {steps.map((step, index) => {
        const last = index === steps.length - 1;
        const isRejectedStep = last && isRejected;

        return (
          <li
            key={step.title}
            className="relative flex gap-4"
          >
            {!last && (
              <span
                aria-hidden="true"
                className="absolute right-[19px] top-11 bottom-0 w-px bg-mainColor/15 dark:bg-white/15"
              />
            )}

            <span
              className={[
                "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-sm font-black",
                isRejectedStep
                  ? "border-red-200 bg-red-50 text-red-600"
                  : step.complete
                  ? "border-mainColor bg-mainColor text-white"
                  : "border-mainColor/15 bg-mainColor/5 text-mainColor/50 dark:border-white/20 dark:bg-white/5 dark:text-white/50",
              ].join(" ")}
            >
              {isRejectedStep ? (
                <FaTimesCircle size={17} />
              ) : step.complete ? (
                <FaCheckCircle size={17} />
              ) : (
                index + 1
              )}
            </span>

            <div className={last ? "" : "pb-8"}>
              <h3 className="text-sm font-extrabold text-mainColor dark:text-white">
                {step.title}
              </h3>

              <p className="mt-1 text-xs leading-7 text-secondaryColor dark:text-gray-400">
                {step.description}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function WaitingApproval() {
  const navigate = useNavigate();

  const {
    user,
    refreshMe,
    continueAfterApproval,
  } = useAuth();

  const [request, setRequest] = useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [continuing, setContinuing] = useState(false);

  const [error, setError] = useState("");

  const requestIdRef = useRef(0);
  const continuingRef = useRef(false);

  // ======================================
  // FETCH STATUS
  // ======================================

  const fetchRequest = useCallback(
    async (isRefresh = false) => {
      const requestId = ++requestIdRef.current;

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/login", { replace: true });
          return;
        }

        const response = await api.joinRequestMe();

        if (requestId !== requestIdRef.current) return;

        setRequest(extractRequest(response));
      } catch (err) {
        if (requestId !== requestIdRef.current) return;

        if (Number(err?.status) === 401) {
          navigate("/login", { replace: true });
          return;
        }

        setError(
          err?.data?.message ||
          err?.message ||
          "تعذر التحقق من حالة طلبك. حاول مجدداً."
        );
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [navigate]
  );

  useEffect(() => {
    fetchRequest();

    return () => {
      requestIdRef.current += 1;
    };
  }, [fetchRequest]);

  // ======================================
  // CONTINUE AFTER APPROVAL
  // ======================================

  const handleContinueNewRole = async () => {
    if (continuingRef.current) return;
    if (request?.status !== "approved") return;

    continuingRef.current = true;
    setContinuing(true);
    setError("");

    try {
      // Preserve the application's existing
      // post-approval flow if it is available.
      if (typeof continueAfterApproval === "function") {
        const path = await continueAfterApproval();

        if (
          typeof path === "string" &&
          path.startsWith("/") &&
          !path.startsWith("//")
        ) {
          navigate(path, { replace: true });
          return;
        }
      }

      // Fallback: load the updated user data.
      if (typeof refreshMe !== "function") {
        throw new Error(
          "تعذر تحديث بيانات حسابك حالياً."
        );
      }

      const refreshed = await refreshMe();
      const updatedUser =
        refreshed?.user ??
        refreshed?.data?.user ??
        refreshed;

      // Do not assume that an older user object
      // contains the newly approved role.
      if (
        !updatedUser ||
        typeof updatedUser !== "object" ||
        !("role" in updatedUser)
      ) {
        throw new Error(
          "لم نتمكن من قراءة الدور الجديد. أعد تحديث الحالة وحاول مجدداً."
        );
      }

      const newRole = Number(updatedUser.role);

      if (![1, 3, 4, 5].includes(newRole)) {
        throw new Error(
          "لم يظهر الدور المهني الجديد في حسابك بعد. حاول تحديث بيانات الحساب."
        );
      }

      navigate(getDestination(updatedUser), {
        replace: true,
      });
    } catch (err) {
      setError(
        err?.message ||
          "تعذر الانتقال إلى الحساب الجديد. حاول مرة أخرى."
      );
    } finally {
      continuingRef.current = false;
      setContinuing(false);
    }
  };

  // ======================================
  // DATA
  // ======================================

  const status = request?.status || "pending";
  const statusInfo = getStatusInfo(status);
  const StatusIcon = statusInfo.icon;

  const roleInfo = getRoleInfo(
    request?.requested_role
  );

  const RoleIcon = roleInfo.icon;

  const isApproved = request?.status === "approved";
  const isPending = request?.status === "pending";

  const requestDate = formatDate(
    request?.created_at
  );

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
        <div className="absolute -right-40 -top-40 h-[480px] w-[480px] rounded-full bg-mainColor/5 blur-[110px]" />

        <div className="absolute -bottom-40 -left-40 h-[480px] w-[480px] rounded-full bg-secondaryColor/10 blur-[110px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">

        {/* =====================================
            TOP HEADER
        ===================================== */}

        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-mainColor/15 bg-mainColor/5 px-4 py-2 text-xs font-extrabold text-mainColor dark:bg-white/10 dark:text-white">
              <FaPaw size={13} />
              حسابي في كاجو
            </span>

            <h1 className="text-3xl font-black text-mainColor dark:text-white sm:text-4xl">
              متابعة طلب الانضمام
            </h1>

            <p className="mt-3 text-sm leading-7 text-secondaryColor dark:text-gray-400">
              كل التفاصيل المتعلقة بطلب حسابك المهني في مكان واحد.
            </p>
          </div>

          <Link
            to="/app/feed"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-mainColor/15 bg-white px-5 text-sm font-bold text-mainColor transition hover:bg-mainColor/5 dark:border-white/10 dark:bg-[#1D2939] dark:text-white"
          >
            <FaArrowLeft size={13} />
            العودة للمجتمع
          </Link>
        </header>

        {/* =====================================
            ERROR MESSAGE
        ===================================== */}

        {error && (
          <div
            role="alert"
            className="mb-7 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-300"
          >
            <div className="flex items-start gap-3">
              <FaExclamationTriangle className="mt-1 shrink-0" />

              <p className="text-sm font-bold leading-7">
                {error}
              </p>
            </div>

            <button
              type="button"
              disabled={refreshing || loading}
              onClick={() => fetchRequest(true)}
              className="rounded-xl bg-mainColor px-5 py-3 text-xs font-extrabold text-white disabled:opacity-50"
            >
              إعادة المحاولة
            </button>
          </div>
        )}

        {/* =====================================
            INITIAL LOADING
        ===================================== */}

        {loading ? (
          <div
            role="status"
            className="rounded-[32px] border border-mainColor/10 bg-white px-6 py-20 text-center shadow-sm dark:border-white/10 dark:bg-[#1D2939]"
          >
            <span className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-mainColor/10 text-mainColor dark:text-white">
              <FaSpinner size={29} className="animate-spin" />
            </span>

            <h2 className="mb-3 text-xl font-black text-mainColor dark:text-white">
              جارٍ التحقق من طلبك
            </h2>

            <p className="text-sm text-secondaryColor dark:text-gray-400">
              يتم جلب أحدث حالة متاحة من كاجو.
            </p>
          </div>
        ) : !request ? (
          /* =====================================
              NO REQUEST
          ===================================== */

          <div className="relative overflow-hidden rounded-[32px] border border-mainColor/10 bg-white px-6 py-14 text-center shadow-sm dark:border-white/10 dark:bg-[#1D2939]">
            <img
              src={waitingBg}
              alt=""
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 h-full w-full object-contain opacity-[0.06]"
            />

            <div className="relative">
              <span className="mx-auto mb-7 flex h-24 w-24 items-center justify-center rounded-full bg-mainColor/10 text-mainColor dark:text-white">
                <FaInfoCircle size={36} />
              </span>

              <h2 className="mb-4 text-2xl font-black text-mainColor dark:text-white">
                لا يوجد طلب انضمام حالياً
              </h2>

              <p className="mx-auto mb-8 max-w-lg text-sm leading-8 text-secondaryColor dark:text-gray-400">
                لم نعثر على طلب انضمام مرتبط بحسابك.
                يمكنك متابعة استخدام مجتمع كاجو
                وخدماته المتاحة.
              </p>

              <div className="flex flex-wrap justify-center gap-3">
                <Link
                  to="/app/feed"
                  className="inline-flex min-h-13 items-center justify-center gap-2 rounded-xl bg-mainColor px-6 py-3 text-sm font-extrabold text-white"
                >
                  <FaPaw />
                  متابعة بالموقع
                </Link>

                <button
                  type="button"
                  onClick={() => fetchRequest(true)}
                  disabled={refreshing}
                  className="inline-flex min-h-13 items-center justify-center gap-2 rounded-xl border border-mainColor/15 px-6 py-3 text-sm font-bold text-mainColor disabled:opacity-50 dark:text-white"
                >
                  <FaSyncAlt
                    className={refreshing ? "animate-spin" : ""}
                  />
                  تحديث الحالة
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* =====================================
              REQUEST EXISTS
          ===================================== */

          <div className="space-y-7">
            {/* MAIN STATUS HERO */}
            <section className="relative overflow-hidden rounded-[32px] bg-mainColor px-6 py-10 text-white shadow-xl sm:px-10 sm:py-12">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 overflow-hidden"
              >
                <div className="absolute -left-20 -top-24 h-72 w-72 rounded-full border-[55px] border-white/10" />

                <div className="absolute -bottom-24 right-1/3 h-56 w-56 rounded-full bg-secondaryColor/15 blur-3xl" />
              </div>

              <div className="relative flex flex-wrap items-center justify-between gap-8">
                <div className="max-w-2xl">
                  <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold">
                    <FaShieldAlt />
                    متابعة الحساب المهني
                  </span>

                  <h2 className="mb-5 text-3xl font-black leading-snug sm:text-4xl">
                    {statusInfo.title}
                  </h2>

                  <p className="max-w-xl text-sm leading-9 text-white/85 sm:text-base">
                    {statusInfo.subtitle}
                  </p>
                </div>

                <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-[32px] border border-white/20 bg-white/10 sm:h-36 sm:w-36">
                  <StatusIcon size={57} />
                </div>
              </div>
            </section>

            {/* CONTENT */}
            <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_310px]">

              {/* RIGHT COLUMN */}
              <div className="space-y-7">
                {/* REQUEST INFO */}
                <section className="rounded-[28px] border border-mainColor/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#1D2939] sm:p-8">
                  <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-black text-mainColor dark:text-white">
                        تفاصيل طلبك
                      </h2>

                      <p className="mt-2 text-xs leading-7 text-secondaryColor dark:text-gray-400">
                        البيانات الأساسية الخاصة بطلب الانضمام.
                      </p>
                    </div>

                    <span
                      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-extrabold ${statusInfo.badge}`}
                    >
                      <StatusIcon size={13} />
                      {statusInfo.label}
                    </span>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex items-start gap-3 rounded-2xl bg-mainColor/5 p-5 dark:bg-white/5">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-mainColor/10 text-mainColor dark:text-white">
                        <RoleIcon size={20} />
                      </span>

                      <div>
                        <p className="mb-2 text-xs text-secondaryColor dark:text-gray-400">
                          نوع الحساب المطلوب
                        </p>

                        <p className="text-base font-black text-mainColor dark:text-white">
                          {roleInfo.name}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 rounded-2xl bg-mainColor/5 p-5 dark:bg-white/5">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-mainColor/10 text-mainColor dark:text-white">
                        <FaClipboardCheck size={20} />
                      </span>

                      <div>
                        <p className="mb-2 text-xs text-secondaryColor dark:text-gray-400">
                          حالة الطلب
                        </p>

                        <p className="text-base font-black text-mainColor dark:text-white">
                          {statusInfo.label}
                        </p>
                      </div>
                    </div>

                    {requestDate && (
                      <div className="flex items-start gap-3 rounded-2xl bg-mainColor/5 p-5 dark:bg-white/5 sm:col-span-2">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-mainColor/10 text-mainColor dark:text-white">
                          <FaRegCalendarAlt size={20} />
                        </span>

                        <div>
                          <p className="mb-2 text-xs text-secondaryColor dark:text-gray-400">
                            تاريخ تقديم الطلب
                          </p>

                          <p className="text-base font-black text-mainColor dark:text-white">
                            {requestDate}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </section>

                {/* ACTIONS */}
                <section className="rounded-[28px] border border-mainColor/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#1D2939] sm:p-8">
                  <h2 className="mb-5 text-lg font-black text-mainColor dark:text-white">
                    الخطوة التالية
                  </h2>

                  <p className="mb-7 text-sm leading-8 text-secondaryColor dark:text-gray-400">
                    {isApproved
                      ? "تم قبول طلبك. استخدم الزر التالي لتحديث صلاحيات حسابك والانتقال إلى الإعداد المهني أو لوحة التحكم."
                      : isPending
                      ? "يمكنك متابعة استخدام الموقع ريثما تتم مراجعة طلبك، أو تحديث الصفحة للتحقق من وجود قرار جديد."
                      : "يمكنك الاستمرار في تصفح كاجو بالحساب الحالي."}
                  </p>

                  <div className="flex flex-wrap gap-3">
                    {isApproved && (
                      <button
                        type="button"
                        onClick={handleContinueNewRole}
                        disabled={continuing || refreshing}
                        className="inline-flex min-h-13 flex-1 items-center justify-center gap-3 rounded-2xl bg-mainColor px-6 py-3 text-sm font-extrabold text-white shadow-md transition-all hover:opacity-90 disabled:opacity-50"
                      >
                        {continuing ? (
                          <>
                            <FaSpinner className="animate-spin" />
                            جارٍ تجهيز حسابك...
                          </>
                        ) : (
                          <>
                            <FaCheckCircle />
                            متابعة بالدور الجديد
                            <FaArrowLeft size={13} />
                          </>
                        )}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => fetchRequest(true)}
                      disabled={refreshing || continuing}
                      className="inline-flex min-h-13 flex-1 items-center justify-center gap-3 rounded-2xl border border-mainColor/15 bg-mainColor/5 px-6 py-3 text-sm font-extrabold text-mainColor transition-colors hover:bg-mainColor/10 disabled:opacity-50 dark:bg-white/5 dark:text-white"
                    >
                      {refreshing ? (
                        <FaSpinner className="animate-spin" />
                      ) : (
                        <FaSyncAlt />
                      )}
                      {refreshing
                        ? "جارٍ التحديث..."
                        : "تحديث الحالة"}
                    </button>

                    <Link
                      to="/app/feed"
                      className="inline-flex min-h-13 flex-1 items-center justify-center gap-2 rounded-2xl border border-mainColor/15 px-6 py-3 text-sm font-bold text-mainColor dark:border-white/10 dark:text-white"
                    >
                      <FaPaw />
                      متابعة بالموقع
                    </Link>
                  </div>
                </section>
              </div>

              {/* LEFT SIDEBAR */}
              <aside className="space-y-6">
                {/* PROGRESS */}
                <section className="rounded-[28px] border border-mainColor/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#1D2939]">
                  <h2 className="mb-2 text-lg font-black text-mainColor dark:text-white">
                    مراحل الطلب
                  </h2>

                  <p className="mb-8 text-xs leading-7 text-secondaryColor dark:text-gray-400">
                    توضيح مبسّط للحالة الحالية لطلبك.
                  </p>

                  <StatusSteps status={status} />
                </section>

                {/* SUPPORT MESSAGE */}
                <section className="relative overflow-hidden rounded-[28px] bg-mainColor p-7 text-white shadow-lg">
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -left-12 -top-12 h-40 w-40 rounded-full bg-white/10"
                  />

                  <div className="relative">
                    <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
                      <FaHeart size={21} />
                    </span>

                    <h3 className="mb-3 text-lg font-black">
                      أنت جزء من مجتمع كاجو
                    </h3>

                    <p className="text-sm leading-8 text-white/85">
                      مهما كانت حالة طلبك المهني،
                      يمكنك الاستفادة من الميزات
                      المتاحة لحسابك في مجتمع كاجو.
                    </p>

                    <Link
                      to="/app/feed"
                      className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-xs font-extrabold text-mainColor"
                    >
                      استكشف المجتمع
                      <FaArrowLeft size={12} />
                    </Link>
                  </div>
                </section>
              </aside>
            </div>
          </div>
        )}

        {/* FOOTER */}
        <footer className="mt-10 flex items-center justify-center gap-2 text-center text-xs font-bold text-secondaryColor dark:text-gray-400">
          <FaPaw className="text-mainColor dark:text-white" />
          كاجو — لأنهم من عائلتنا
        </footer>
      </div>
    </main>
  );
}
