
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../api/apiClient";

import DynamicFormModal from "../modals/DynamicFormModal";

import {
  FaStethoscope,
  FaCalendarCheck,
  FaCalendarAlt,
  FaUsers,
  FaClock,
  FaPlus,
  FaTrashAlt,
  FaCheck,
  FaTimes,
  FaPaw,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaSyncAlt,
  FaArrowLeft,
  FaExclamationTriangle,
  FaCheckCircle,
  FaSpinner,
  FaUserMd,
  FaInfoCircle,
  FaRegCalendarTimes,
  FaShieldAlt,
} from "react-icons/fa";

// ==========================================
// HELPERS
// ==========================================

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

function to24h(value) {
  if (!value) return null;

  const input = String(value).trim();

  const fullTime = input.match(
    /^([01]?\d|2[0-3]):([0-5]\d)(?::[0-5]\d)?$/
  );

  if (fullTime) {
    return (
      String(Number(fullTime[1])).padStart(2, "0") +
      ":" +
      fullTime[2]
    );
  }

  const match = input.match(
    /^(0?[1-9]|1[0-2]):([0-5]\d)\s*(AM|PM)$/i
  );

  if (!match) return null;

  let hours = Number(match[1]);
  const minutes = match[2];
  const period = match[3].toUpperCase();

  if (period === "PM" && hours < 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;

  return `${String(hours).padStart(2, "0")}:${minutes}`;
}

function getStatus(status) {
  switch (status) {
    case "pending":
      return {
        label: "قيد الانتظار",
        className:
          "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300",
        icon: FaClock,
      };

    case "approved":
    case "confirmed":
      return {
        label: "مؤكد",
        className:
          "bg-mainColor/10 text-mainColor dark:bg-white/10 dark:text-white",
        icon: FaCheckCircle,
      };

    case "rejected":
      return {
        label: "مرفوض",
        className:
          "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-300",
        icon: FaTimes,
      };

    default:
      return {
        label: status || "غير محدد",
        className:
          "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300",
        icon: FaInfoCircle,
      };
  }
}

function StatusBadge({ status }) {
  const config = getStatus(status);
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${config.className}`}
    >
      <Icon size={12} />
      {config.label}
    </span>
  );
}

function normalizeArray(response, key) {
  const values = [
    response?.[key],
    response?.data?.[key],
    response?.data,
    response,
  ];

  for (const value of values) {
    if (Array.isArray(value)) return value;
    if (Array.isArray(value?.data)) return value.data;
  }

  return [];
}

function getErrorMessage(error, fallback) {
  const firstValidationError = error?.data?.errors
    ? Object.values(error.data.errors).flat().find(Boolean)
    : null;

  return (
    firstValidationError ||
    error?.data?.message ||
    error?.message ||
    fallback
  );
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(`${String(value).slice(0, 10)}T12:00:00`);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat("ar-SY", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

// ==========================================
// UI COMPONENTS
// ==========================================

function StatCard({ icon: Icon, label, value, description }) {
  return (
    <article className="flex items-start gap-4 rounded-[24px] border border-mainColor/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#1D2939]">
      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-mainColor/10 text-mainColor dark:bg-white/10 dark:text-white">
        <Icon size={23} />
      </span>

      <div className="min-w-0">
        <p className="text-sm font-bold text-secondaryColor dark:text-gray-300">
          {label}
        </p>

        <p className="mt-2 text-3xl font-black text-mainColor dark:text-white">
          {value}
        </p>

        <p className="mt-2 text-xs text-secondaryColor dark:text-gray-400">
          {description}
        </p>
      </div>
    </article>
  );
}

function SectionTitle({ icon: Icon, title, description, action }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-start gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-mainColor/10 text-mainColor dark:text-white">
          <Icon size={20} />
        </span>

        <div>
          <h2 className="text-xl font-black text-mainColor dark:text-white sm:text-2xl">
            {title}
          </h2>

          <p className="mt-2 text-sm leading-7 text-secondaryColor dark:text-gray-400">
            {description}
          </p>
        </div>
      </div>

      {action}
    </div>
  );
}

function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="rounded-[24px] border border-dashed border-mainColor/20 bg-mainColor/[0.025] px-6 py-12 text-center dark:border-white/15 dark:bg-white/[0.025]">
      <span className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-mainColor/10 text-mainColor dark:bg-white/10 dark:text-white">
        <Icon size={29} />
      </span>

      <h3 className="text-lg font-black text-mainColor dark:text-white">
        {title}
      </h3>

      <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-secondaryColor dark:text-gray-400">
        {description}
      </p>

      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div role="status" className="animate-pulse space-y-7">
      <div className="grid gap-5 md:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="h-36 rounded-[24px] bg-mainColor/10 dark:bg-white/10"
          />
        ))}
      </div>

      <div className="h-64 rounded-[28px] bg-mainColor/10 dark:bg-white/10" />
      <div className="h-72 rounded-[28px] bg-mainColor/10 dark:bg-white/10" />

      <span className="sr-only">جارٍ تحميل لوحة العيادة...</span>
    </div>
  );
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function DoctorDashboard() {
  const { user, loading: authLoading } = useAuth();

  const addSlotModal = useRef(null);

  const [slotModalOpen, setSlotModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  const [dashboardData, setDashboardData] = useState(null);
  const [slots, setSlots] = useState([]);

  const [fetching, setFetching] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [modalError, setModalError] = useState("");

  const [actionLoading, setActionLoading] = useState(false);

  const requestRef = useRef(0);
  const actionRef = useRef(false);

  const isDoctor = Number(user?.role) === 5;

  const hasSetup = isSetupComplete(
    user?.hasSetup ?? user?.has_setup
  );

  // ======================================
  // LOAD DATA
  // ======================================

  const loadAll = useCallback(async (silent = false) => {
    const requestId = ++requestRef.current;

    setError("");

    if (silent) {
      setRefreshing(true);
    } else {
      setFetching(true);
    }

    try {
      const [dashboardResponse, slotsResponse] =
        await Promise.all([
          api.getDoctorDashboard(),
          api.doctorSlots(),
        ]);

      if (requestId !== requestRef.current) return;

      const data =
        dashboardResponse?.dashboard ??
        dashboardResponse?.data?.dashboard ??
        dashboardResponse?.data ??
        dashboardResponse;

      setDashboardData(data || null);
      setSlots(normalizeArray(slotsResponse, "slots"));
    } catch (err) {
      if (requestId !== requestRef.current) return;

      setError(
        getErrorMessage(
          err,
          "تعذر تحميل لوحة العيادة. يرجى المحاولة مجدداً."
        )
      );
    } finally {
      if (requestId === requestRef.current) {
        setFetching(false);
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    if (authLoading || !user || !isDoctor || !hasSetup) {
      return;
    }

    loadAll();

    return () => {
      requestRef.current += 1;
    };
  }, [authLoading, user?.id, isDoctor, hasSetup, loadAll]);

  // ======================================
  // DATA
  // ======================================

  const profile = dashboardData?.profile || {};

  const statistics = dashboardData?.statistics || {};

  const appointments = normalizeArray(
    dashboardData,
    "appointments"
  );

  const avatarSrc =
    profile.avatar_url ||
    profile.avatar ||
    user?.avatar_url ||
    user?.avatar ||
    null;

  const [avatarFailed, setAvatarFailed] = useState(false);

  useEffect(() => {
    setAvatarFailed(false);
  }, [avatarSrc]);

  // ======================================
  // ADD SLOT
  // ======================================

  const handleAddSlot = async (data) => {
    if (actionRef.current) return;

    const date = String(data?.date || "").trim();
    const time = to24h(data?.time);

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      setModalError("يرجى اختيار تاريخ صحيح.");
      return;
    }

    if (!time) {
      setModalError("يرجى اختيار وقت صحيح.");
      return;
    }

    const dateTime = new Date(`${date}T${time}:00`);

    if (
      Number.isNaN(dateTime.getTime()) ||
      dateTime.getTime() < Date.now()
    ) {
      setModalError("يرجى اختيار موعد مستقبلي.");
      return;
    }

    actionRef.current = true;
    setActionLoading(true);
    setModalError("");
    setError("");
    setSuccess("");

    try {
      await api.createDoctorSlot({
        date,
        time,
        notes: data.notes || null,
      });

      setSlotModalOpen(false);
      setSuccess("تمت إضافة الوقت المتاح بنجاح.");

      await loadAll(true);
    } catch (err) {
      setModalError(
        getErrorMessage(
          err,
          "تعذر إضافة الوقت. يرجى المحاولة مجدداً."
        )
      );
    } finally {
      actionRef.current = false;
      setActionLoading(false);
    }
  };

  // ======================================
  // CONFIRM ACTIONS
  // ======================================

  const handleConfirmAction = async () => {
    if (!confirmAction || actionRef.current) return;

    const { type, item } = confirmAction;

    actionRef.current = true;
    setActionLoading(true);
    setError("");
    setSuccess("");

    try {
      if (type === "delete-slot") {
        await api.deleteDoctorSlot(item.id);

        setSlots((prev) =>
          prev.filter((slot) => slot.id !== item.id)
        );

        setSuccess("تم حذف الوقت المتاح بنجاح.");
      } else if (type === "approve") {
        await api.updateAppointmentStatus(
          item.id,
          "approved"
        );

        setSuccess("تم تأكيد الحجز بنجاح.");
      } else if (type === "reject") {
        await api.updateAppointmentStatus(
          item.id,
          "rejected"
        );

        setSuccess("تم رفض الحجز.");
      }

      setConfirmAction(null);

      await loadAll(true);
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "تعذر تنفيذ العملية. يرجى المحاولة مجدداً."
        )
      );
    } finally {
      actionRef.current = false;
      setActionLoading(false);
    }
  };

  // ======================================
  // AUTH GUARDS
  // ======================================

  if (authLoading) {
    return (
      <div
        dir="rtl"
        className="flex min-h-[70vh] items-center justify-center bg-fivethColor dark:bg-[#101828]"
      >
        <FaSpinner
          className="animate-spin text-mainColor dark:text-white"
          size={34}
        />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isDoctor) {
    return <Navigate to="/app/feed" replace />;
  }

  if (!hasSetup) {
    return <Navigate to="/app/setup" replace />;
  }

  // ======================================
  // RENDER
  // ======================================

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-fivethColor pb-20 pt-8 text-mainColor transition-colors duration-300 dark:bg-[#101828]"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* ====================================
            HEADER
        ==================================== */}

        <header className="relative mb-8 overflow-hidden rounded-[30px] bg-mainColor p-6 text-white shadow-xl sm:p-9">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full border-[50px] border-white/10"
          />

          <div className="relative flex flex-wrap items-center justify-between gap-7">
            <div className="flex min-w-0 items-center gap-5">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-3xl border border-white/20 bg-white/10 sm:h-24 sm:w-24">
                {avatarSrc && !avatarFailed ? (
                  <img
                    src={avatarSrc}
                    alt={profile.name || "صورة العيادة"}
                    onError={() => setAvatarFailed(true)}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <FaStethoscope size={37} />
                )}
              </div>

              <div className="min-w-0">
                <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold">
                  <FaShieldAlt size={12} />
                  لوحة الطبيب البيطري
                </span>

                <h1 className="break-words text-2xl font-black leading-snug sm:text-3xl">
                  {profile.name || "لوحة إدارة العيادة"}
                </h1>

                {profile.specialty && (
                  <p className="mt-2 text-sm font-bold text-fourthColor">
                    {profile.specialty}
                  </p>
                )}

                <div className="mt-4 flex flex-wrap gap-4 text-xs text-white/85">
                  {profile.location && (
                    <span className="inline-flex items-center gap-2">
                      <FaMapMarkerAlt />
                      {profile.location}
                    </span>
                  )}

                  {profile.phone && (
                    <span className="inline-flex items-center gap-2">
                      <FaPhoneAlt />
                      {profile.phone}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex w-full flex-wrap gap-3 sm:w-auto">
              <button
                type="button"
                onClick={() => loadAll(true)}
                disabled={fetching || refreshing}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-5 text-sm font-bold text-white hover:bg-white/20 disabled:opacity-50"
              >
                {fetching || refreshing ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <FaSyncAlt />
                )}
                تحديث
              </button>

              <Link
                to="/app/dashboard/appointments"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-extrabold text-mainColor"
              >
                <FaCalendarCheck />
                جميع الحجوزات
                <FaArrowLeft size={12} />
              </Link>
            </div>
          </div>
        </header>

        {/* ====================================
            ALERTS
        ==================================== */}

        {error && (
          <div
            role="alert"
            className="mb-6 flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-300"
          >
            <div className="flex items-start gap-3">
              <FaExclamationTriangle className="mt-1 shrink-0" />
              <p className="text-sm font-bold leading-7">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={() => loadAll(true)}
              disabled={refreshing}
              className="rounded-xl bg-mainColor px-4 py-2 text-xs font-bold text-white disabled:opacity-50"
            >
              إعادة المحاولة
            </button>
          </div>
        )}

        {success && (
          <div
            role="status"
            className="mb-6 flex items-center gap-3 rounded-2xl border border-mainColor/15 bg-mainColor/10 p-5 text-sm font-bold text-mainColor dark:border-white/15 dark:bg-white/10 dark:text-white"
          >
            <FaCheckCircle className="shrink-0" />
            {success}
          </div>
        )}

        {/* ====================================
            DASHBOARD CONTENT
        ==================================== */}

        {fetching && !dashboardData ? (
          <LoadingSkeleton />
        ) : (
          <>
            {/* STATS */}
            <section className="mb-12">
              <div className="mb-6">
                <h2 className="text-xl font-black text-mainColor dark:text-white sm:text-2xl">
                  نظرة عامة على عيادتك
                </h2>

                <p className="mt-2 text-sm text-secondaryColor dark:text-gray-400">
                  ملخص الحجوزات والمرضى من بيانات لوحة العيادة.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-3">
                <StatCard
                  icon={FaCalendarAlt}
                  label="مواعيد اليوم"
                  value={statistics.today ?? 0}
                  description="الحجوزات المجدولة اليوم"
                />

                <StatCard
                  icon={FaCalendarCheck}
                  label="المواعيد القادمة"
                  value={statistics.upcoming ?? 0}
                  description="الحجوزات القادمة"
                />

                <StatCard
                  icon={FaUsers}
                  label="عدد المرضى"
                  value={statistics.patients ?? 0}
                  description="المرضى المسجلون"
                />
              </div>
            </section>

            {/* ====================================
                AVAILABLE SLOTS
            ==================================== */}

            <section
              id="doctor-slots"
              className="mb-10 rounded-[28px] border border-mainColor/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1D2939] sm:p-8"
            >
              <SectionTitle
                icon={FaClock}
                title="الأوقات المتاحة للحجز"
                description="أضف المواعيد التي يمكن للمستخدمين الحجز خلالها، وتابعها من هنا."
                action={
                  <button
                    type="button"
                    onClick={() => {
                      setModalError("");
                      setSlotModalOpen(true);
                    }}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-mainColor px-5 py-3 text-sm font-extrabold text-white shadow-sm hover:opacity-90"
                  >
                    <FaPlus size={13} />
                    إضافة وقت
                  </button>
                }
              />

              {slots.length === 0 ? (
                <EmptyState
                  icon={FaRegCalendarTimes}
                  title="ما في أوقات متاحة حالياً"
                  description="أضف أول وقت متاح حتى يتمكن أصحاب الحيوانات من حجز موعد في العيادة."
                  action={
                    <button
                      type="button"
                      onClick={() => setSlotModalOpen(true)}
                      className="rounded-xl bg-mainColor px-6 py-3 text-sm font-bold text-white"
                    >
                      إضافة أول وقت
                    </button>
                  }
                />
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-mainColor/10 dark:border-white/10">
                  <table className="w-full min-w-[600px] text-right text-sm">
                    <thead className="bg-mainColor/5 dark:bg-white/5">
                      <tr className="text-mainColor dark:text-white">
                        <th className="px-5 py-4 font-black">التاريخ</th>
                        <th className="px-5 py-4 font-black">الوقت</th>
                        <th className="px-5 py-4 font-black">الحالة</th>
                        <th className="px-5 py-4 text-center font-black">
                          إجراء
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {slots.map((slot) => (
                        <tr
                          key={slot.id}
                          className="border-t border-mainColor/10 transition-colors hover:bg-mainColor/[0.025] dark:border-white/10"
                        >
                          <td className="px-5 py-4 font-bold text-mainColor dark:text-white">
                            {formatDate(slot.date)}
                          </td>

                          <td className="px-5 py-4 text-secondaryColor dark:text-gray-300">
                            <span dir="ltr">{slot.time || "—"}</span>
                          </td>

                          <td className="px-5 py-4">
                            <StatusBadge status={slot.status} />
                          </td>

                          <td className="px-5 py-4 text-center">
                            <button
                              type="button"
                              title="حذف الوقت"
                              aria-label="حذف الوقت"
                              onClick={() =>
                                setConfirmAction({
                                  type: "delete-slot",
                                  item: slot,
                                })
                              }
                              className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600 transition hover:bg-red-100 dark:bg-red-950/20 dark:text-red-400"
                            >
                              <FaTrashAlt size={15} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* ====================================
                APPOINTMENTS
            ==================================== */}

            <section className="rounded-[28px] border border-mainColor/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1D2939] sm:p-8">
              <SectionTitle
                icon={FaCalendarCheck}
                title="آخر حجوزات العيادة"
                description="راجع طلبات الحجز وأكّد أو ارفض الحجوزات التي ما زالت قيد المراجعة."
                action={
                  <Link
                    to="/app/dashboard/appointments"
                    className="inline-flex items-center gap-2 rounded-xl border border-mainColor/15 px-4 py-3 text-xs font-bold text-mainColor dark:border-white/15 dark:text-white"
                  >
                    عرض الكل
                    <FaArrowLeft size={12} />
                  </Link>
                }
              />

              {appointments.length === 0 ? (
                <EmptyState
                  icon={FaCalendarAlt}
                  title="لا توجد حجوزات حالياً"
                  description="عندما يبدأ أصحاب الحيوانات بحجز المواعيد، ستظهر طلباتهم هنا."
                />
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-mainColor/10 dark:border-white/10">
                  <table className="w-full min-w-[850px] text-right text-sm">
                    <thead className="bg-mainColor/5 dark:bg-white/5">
                      <tr className="text-mainColor dark:text-white">
                        <th className="px-5 py-4 font-black">العميل</th>
                        <th className="px-5 py-4 font-black">الحيوان</th>
                        <th className="px-5 py-4 font-black">التاريخ</th>
                        <th className="px-5 py-4 font-black">الوقت</th>
                        <th className="px-5 py-4 font-black">الحالة</th>
                        <th className="px-5 py-4 text-center font-black">
                          الإجراءات
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {appointments.map((appointment) => (
                        <tr
                          key={appointment.id}
                          className="border-t border-mainColor/10 transition-colors hover:bg-mainColor/[0.025] dark:border-white/10"
                        >
                          <td className="px-5 py-4 font-bold text-mainColor dark:text-white">
                            {appointment.owner_name || "—"}
                          </td>

                          <td className="px-5 py-4 text-secondaryColor dark:text-gray-300">
                            {appointment.animal_type || "—"}
                          </td>

                          <td className="px-5 py-4 text-secondaryColor dark:text-gray-300">
                            {formatDate(appointment.date)}
                          </td>

                          <td className="px-5 py-4 text-secondaryColor dark:text-gray-300">
                            <span dir="ltr">
                              {appointment.time || "—"}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <StatusBadge status={appointment.status} />
                          </td>

                          <td className="px-5 py-4">
                            {appointment.status === "pending" ? (
                              <div className="flex justify-center gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setConfirmAction({
                                      type: "approve",
                                      item: appointment,
                                    })
                                  }
                                  className="inline-flex items-center gap-2 rounded-xl bg-mainColor px-4 py-2.5 text-xs font-bold text-white"
                                >
                                  <FaCheck size={12} />
                                  تأكيد
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    setConfirmAction({
                                      type: "reject",
                                      item: appointment,
                                    })
                                  }
                                  className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2.5 text-xs font-bold text-red-600 dark:bg-red-950/20 dark:text-red-300"
                                >
                                  <FaTimes size={12} />
                                  رفض
                                </button>
                              </div>
                            ) : (
                              <p className="text-center text-xs font-bold text-secondaryColor dark:text-gray-400">
                                تمت المعالجة
                              </p>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </div>

      {/* ======================================
          ADD SLOT MODAL
      ====================================== */}

      <DynamicFormModal
        isOpen={slotModalOpen}
        onClose={() => {
          if (!actionLoading) {
            setSlotModalOpen(false);
            setModalError("");
          }
        }}
        title="إضافة وقت متاح للعيادة"
        fields={[
          {
            name: "date",
            placeholder: "التاريخ",
            type: "date",
          },
          {
            name: "time",
            placeholder: "الوقت",
            type: "time",
          },
          {
            name: "notes",
            placeholder: "ملاحظة (اختياري)",
          },
        ]}
        buttonText={
          actionLoading ? "جارٍ الإضافة..." : "إضافة الوقت"
        }
        onSubmit={handleAddSlot}
      />

      {slotModalOpen && modalError && (
        <div
          role="alert"
          className="fixed bottom-5 left-4 right-4 z-[10000] mx-auto max-w-lg rounded-2xl border border-red-200 bg-red-50 p-4 text-center text-sm font-bold text-red-700 shadow-xl dark:border-red-900/30 dark:bg-[#1D2939] dark:text-red-300"
        >
          {modalError}
        </div>
      )}

      {/* ======================================
          CONFIRMATION DIALOG
      ====================================== */}

      {confirmAction && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
          dir="rtl"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="doctor-confirm-title"
            className="w-full max-w-md rounded-[28px] bg-white p-7 text-center shadow-2xl dark:bg-[#1D2939]"
          >
            <span className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-mainColor/10 text-mainColor dark:bg-white/10 dark:text-white">
              {confirmAction.type === "delete-slot" ? (
                <FaTrashAlt size={27} />
              ) : confirmAction.type === "approve" ? (
                <FaCheckCircle size={29} />
              ) : (
                <FaExclamationTriangle
                  size={29}
                  className="text-red-500"
                />
              )}
            </span>

            <h2
              id="doctor-confirm-title"
              className="mb-4 text-xl font-black text-mainColor dark:text-white"
            >
              {confirmAction.type === "delete-slot"
                ? "تأكيد حذف الوقت"
                : confirmAction.type === "approve"
                ? "تأكيد الحجز"
                : "رفض الحجز"}
            </h2>

            <p className="mb-7 text-sm leading-8 text-secondaryColor dark:text-gray-300">
              {confirmAction.type === "delete-slot"
                ? "هل أنت متأكد من حذف هذا الوقت المتاح من جدول العيادة؟"
                : confirmAction.type === "approve"
                ? `هل تريد تأكيد حجز ${confirmAction.item.owner_name || "العميل"}؟`
                : `هل تريد رفض حجز ${confirmAction.item.owner_name || "العميل"}؟`}
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleConfirmAction}
                disabled={actionLoading}
                className={`flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl px-5 text-sm font-extrabold text-white disabled:opacity-50 ${
                  confirmAction.type === "approve"
                    ? "bg-mainColor"
                    : "bg-red-600"
                }`}
              >
                {actionLoading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    جارٍ التنفيذ...
                  </>
                ) : (
                  "تأكيد الإجراء"
                )}
              </button>

              <button
                type="button"
                onClick={() => setConfirmAction(null)}
                disabled={actionLoading}
                className="min-h-12 flex-1 rounded-xl border border-mainColor/15 px-5 text-sm font-bold text-mainColor disabled:opacity-50 dark:border-white/15 dark:text-white"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
