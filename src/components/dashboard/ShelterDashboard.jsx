
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { useAuth } from "../../context/AuthContext";
import { Navigate, Link } from "react-router-dom";

import DynamicFormModal from "../modals/DynamicFormModal";
import { api } from "../../api/apiClient";

import {
  FaPaw,
  FaHome,
  FaHeart,
  FaHandHoldingHeart,
  FaBoxOpen,
  FaUsers,
  FaPlus,
  FaTrashAlt,
  FaCheck,
  FaTimes,
  FaClock,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaSyncAlt,
  FaSpinner,
  FaExclamationTriangle,
  FaCheckCircle,
  FaInfoCircle,
  FaCalendarAlt,
  FaArrowLeft,
  FaShieldAlt,
} from "react-icons/fa";

// ========================================
// HELPERS
// ========================================

function getErrorMessage(error, fallback) {
  const validationError = error?.data?.errors
    ? Object.values(error.data.errors).flat().find(Boolean)
    : null;

  return (
    validationError ||
    error?.data?.message ||
    error?.message ||
    fallback
  );
}

function normalizeArray(value) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  return [];
}

function normalizeDashboard(response) {
  return (
    response?.dashboard ??
    response?.data?.dashboard ??
    response?.data ??
    response ??
    {}
  );
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

function formatDate(value) {
  if (!value) return "—";

  const dateString = String(value).slice(0, 10);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return String(value);
  }

  const date = new Date(`${dateString}T12:00:00`);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat("ar-SY", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

function statusInfo(status) {
  switch (status) {
    case "pending":
      return {
        label: "قيد المراجعة",
        icon: FaClock,
        className:
          "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300",
      };

    case "approved":
      return {
        label: "مقبول",
        icon: FaCheckCircle,
        className:
          "bg-mainColor/10 text-mainColor dark:bg-white/10 dark:text-white",
      };

    case "rejected":
      return {
        label: "مرفوض",
        icon: FaTimes,
        className:
          "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-300",
      };

    case "active":
      return {
        label: "نشط",
        icon: FaCheckCircle,
        className:
          "bg-mainColor/10 text-mainColor dark:bg-white/10 dark:text-white",
      };

    default:
      return {
        label: status || "غير محدد",
        icon: FaInfoCircle,
        className:
          "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300",
      };
  }
}

function StatusBadge({ status }) {
  const info = statusInfo(status);
  const Icon = info.icon;

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${info.className}`}
    >
      <Icon size={12} />
      {info.label}
    </span>
  );
}

function InfoCell({ label, value }) {
  return (
    <div className="min-w-0">
      <p className="mb-1 text-xs text-secondaryColor dark:text-gray-400">
        {label}
      </p>

      <p className="break-words text-sm font-bold text-mainColor dark:text-white">
        {value === null || value === undefined || value === ""
          ? "—"
          : String(value)}
      </p>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, description }) {
  return (
    <article className="flex items-start gap-4 rounded-[24px] border border-mainColor/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1D2939] sm:p-6">
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

        <p className="mt-2 text-xs leading-6 text-secondaryColor dark:text-gray-400">
          {description}
        </p>
      </div>
    </article>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  description,
  action,
}) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-start gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-mainColor/10 text-mainColor dark:bg-white/10 dark:text-white">
          <Icon size={21} />
        </span>

        <div>
          <h2 className="text-xl font-black text-mainColor dark:text-white sm:text-2xl">
            {title}
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-7 text-secondaryColor dark:text-gray-400">
            {description}
          </p>
        </div>
      </div>

      {action}
    </div>
  );
}

function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="rounded-[24px] border border-dashed border-mainColor/20 bg-mainColor/[0.025] px-5 py-12 text-center dark:border-white/15 dark:bg-white/[0.025]">
      <span className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-mainColor/10 text-mainColor dark:bg-white/10 dark:text-white">
        <Icon size={31} />
      </span>

      <h3 className="text-lg font-black text-mainColor dark:text-white">
        {title}
      </h3>

      <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-secondaryColor dark:text-gray-400">
        {description}
      </p>
    </div>
  );
}

function TableCell({ children, className = "" }) {
  return (
    <td className={`px-5 py-4 align-middle ${className}`}>
      {children}
    </td>
  );
}

function LoadingSkeleton() {
  return (
    <div
      role="status"
      className="animate-pulse space-y-8"
    >
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="h-36 rounded-[24px] bg-mainColor/10 dark:bg-white/10"
          />
        ))}
      </div>

      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="h-64 rounded-[28px] bg-mainColor/10 dark:bg-white/10"
        />
      ))}

      <span className="sr-only">
        جارٍ تحميل لوحة الملجأ...
      </span>
    </div>
  );
}

// ========================================
// MAIN DASHBOARD
// ========================================

export default function ShelterDashboard() {
  const { user, loading: authLoading } = useAuth();

  const [dashboardData, setDashboardData] = useState(null);

  const [animals, setAnimals] = useState([]);
  const [adoptions, setAdoptions] = useState([]);
  const [donationRequests, setDonationRequests] = useState([]);
  const [donationSubmissions, setDonationSubmissions] =
    useState([]);

  const [fetching, setFetching] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [modalError, setModalError] = useState("");

  const [animalModalOpen, setAnimalModalOpen] = useState(false);
  const [donationModalOpen, setDonationModalOpen] = useState(false);

  const [confirmation, setConfirmation] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const requestRef = useRef(0);
  const actionRef = useRef(false);

  const isShelter = Number(user?.role) === 4;

  const hasSetup = isSetupComplete(
    user?.hasSetup ?? user?.has_setup
  );

  // ========================================
  // LOAD DATA
  // ========================================

  const loadAll = useCallback(async (silent = false) => {
    const requestId = ++requestRef.current;

    setError("");

    if (silent) {
      setRefreshing(true);
    } else {
      setFetching(true);
    }

    try {
      const response = await api.getShelterDashboard();

      if (requestId !== requestRef.current) return;

      const data = normalizeDashboard(response);

      setDashboardData(data);

      setAnimals(normalizeArray(data?.animals));
      setAdoptions(normalizeArray(data?.adoptions));

      setDonationRequests(
        normalizeArray(data?.donation_requests)
      );

      setDonationSubmissions(
        normalizeArray(data?.donation_submissions)
      );
    } catch (err) {
      if (requestId !== requestRef.current) return;

      setError(
        getErrorMessage(
          err,
          "تعذر تحميل لوحة الملجأ. يرجى المحاولة مجدداً."
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
    if (
      authLoading ||
      !user ||
      !isShelter ||
      !hasSetup
    ) {
      return;
    }

    loadAll();

    return () => {
      requestRef.current += 1;
    };
  }, [
    authLoading,
    user?.id,
    isShelter,
    hasSetup,
    loadAll,
  ]);

  const profile = dashboardData?.profile || {};

  const statistics = dashboardData?.statistics || {};

  // ========================================
  // OPEN MODALS
  // ========================================

  const openAnimalModal = () => {
    setModalError("");
    setAnimalModalOpen(true);
  };

  const openDonationModal = () => {
    setModalError("");
    setDonationModalOpen(true);
  };

  const closeAnimalModal = () => {
    if (actionRef.current) return;
    setAnimalModalOpen(false);
    setModalError("");
  };

  const closeDonationModal = () => {
    if (actionRef.current) return;
    setDonationModalOpen(false);
    setModalError("");
  };

  // ========================================
  // CREATE ANIMAL
  // ========================================

  const handleCreateAnimal = async (data) => {
    if (actionRef.current) return;

    actionRef.current = true;
    setActionLoading(true);
    setModalError("");
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();

      formData.append("name", data.name || "");
      formData.append("type", data.type || "");
      formData.append("age", data.age || "");
      formData.append(
        "health_status",
        data.health_status || ""
      );
      formData.append("gender", data.gender || "");
      formData.append("vaccines", data.vaccines || "");
      formData.append("note", data.note || "");

      // Support FileList, File, and arrays.
      const imageValue = data.image;

      const image =
        imageValue instanceof File
          ? imageValue
          : imageValue?.[0];

      if (image instanceof File) {
        formData.append("image", image);
      }

      await api.createShelterAnimal(formData);

      setAnimalModalOpen(false);
      setSuccess("تمت إضافة الحيوان إلى الملجأ بنجاح.");

      await loadAll(true);
    } catch (err) {
      setModalError(
        getErrorMessage(
          err,
          "تعذر إضافة الحيوان. يرجى المحاولة مجدداً."
        )
      );
    } finally {
      actionRef.current = false;
      setActionLoading(false);
    }
  };

  // ========================================
  // CREATE DONATION REQUEST
  // ========================================

  const handleCreateDonation = async (data) => {
    if (actionRef.current) return;

    actionRef.current = true;
    setActionLoading(true);
    setModalError("");
    setError("");
    setSuccess("");

    try {
      await api.createShelterDonationRequest({
        item: data.item || "",
        priority: data.priority || "",
        quantity: data.quantity || "",
        date: data.date || null,
        status: data.status || "active",
      });

      setDonationModalOpen(false);
      setSuccess("تم نشر طلب التبرع بنجاح.");

      await loadAll(true);
    } catch (err) {
      setModalError(
        getErrorMessage(
          err,
          "تعذر إنشاء طلب التبرع."
        )
      );
    } finally {
      actionRef.current = false;
      setActionLoading(false);
    }
  };

  // ========================================
  // CONFIRM ACTION
  // ========================================

  const handleConfirmAction = async () => {
    if (!confirmation || actionRef.current) return;

    const { type, item } = confirmation;

    actionRef.current = true;
    setActionLoading(true);
    setError("");
    setSuccess("");

    try {
      if (type === "delete-donation") {
        await api.deleteShelterDonationRequest(item.id);

        setDonationRequests((previous) =>
          previous.filter((request) => request.id !== item.id)
        );

        setSuccess("تم حذف طلب التبرع بنجاح.");
      }

      if (type === "approve-adoption") {
        await api.updateShelterAdoptionRequestStatus(
          item.id,
          "approved"
        );

        setAdoptions((previous) =>
          previous.map((request) =>
            request.id === item.id
              ? { ...request, status: "approved" }
              : request
          )
        );

        setSuccess("تم قبول طلب التبنّي بنجاح.");
      }

      if (type === "reject-adoption") {
        await api.updateShelterAdoptionRequestStatus(
          item.id,
          "rejected"
        );

        setAdoptions((previous) =>
          previous.map((request) =>
            request.id === item.id
              ? { ...request, status: "rejected" }
              : request
          )
        );

        setSuccess("تم رفض طلب التبنّي.");
      }

      if (type === "approve-donation") {
        await api.updateShelterDonationSubmissionStatus(
          item.id,
          "approved"
        );

        setDonationSubmissions((previous) =>
          previous.map((request) =>
            request.id === item.id
              ? { ...request, status: "approved" }
              : request
          )
        );

        setSuccess("تم قبول التبرع بنجاح.");
      }

      if (type === "reject-donation") {
        await api.updateShelterDonationSubmissionStatus(
          item.id,
          "rejected"
        );

        setDonationSubmissions((previous) =>
          previous.map((request) =>
            request.id === item.id
              ? { ...request, status: "rejected" }
              : request
          )
        );

        setSuccess("تم رفض التبرع.");
      }

      setConfirmation(null);
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

  // ========================================
  // AUTH GUARDS
  // ========================================

  if (authLoading) {
    return (
      <div
        dir="rtl"
        role="status"
        className="flex min-h-[70vh] items-center justify-center bg-fivethColor dark:bg-[#101828]"
      >
        <FaSpinner
          size={34}
          className="animate-spin text-mainColor dark:text-white"
        />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isShelter) {
    return <Navigate to="/app/feed" replace />;
  }

  if (!hasSetup) {
    return <Navigate to="/app/setup" replace />;
  }

  // ========================================
  // RENDER
  // ========================================

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
              <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl border border-white/20 bg-white/10 sm:h-24 sm:w-24">
                <FaHome size={37} />
              </span>

              <div className="min-w-0">
                <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold">
                  <FaShieldAlt size={12} />
                  لوحة إدارة الملجأ
                </span>

                <h1 className="break-words text-2xl font-black leading-snug sm:text-3xl">
                  {profile.name || "مرحباً بك في ملجأ كاجو"}
                </h1>

                <p className="mt-3 text-sm leading-7 text-white/80">
                  أدِر الحيوانات وطلبات التبنّي والتبرعات
                  من مكان واحد.
                </p>

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

            <button
              type="button"
              onClick={() => loadAll(true)}
              disabled={fetching || refreshing}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-5 text-sm font-bold text-white transition hover:bg-white/20 disabled:opacity-50"
            >
              {fetching || refreshing ? (
                <FaSpinner className="animate-spin" />
              ) : (
                <FaSyncAlt />
              )}
              تحديث البيانات
            </button>
          </div>
        </header>

        {/* ====================================
            MESSAGES
        ==================================== */}

        {error && (
          <div
            role="alert"
            className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-300"
          >
            <div className="flex items-start gap-3">
              <FaExclamationTriangle className="mt-1 shrink-0" />
              <p className="text-sm font-bold leading-7">{error}</p>
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
            className="mb-6 flex items-center gap-3 rounded-2xl border border-mainColor/15 bg-mainColor/10 p-5 text-sm font-bold text-mainColor dark:bg-white/10 dark:text-white"
          >
            <FaCheckCircle className="shrink-0" />
            {success}
          </div>
        )}

        {/* ====================================
            CONTENT
        ==================================== */}

        {fetching && !dashboardData ? (
          <LoadingSkeleton />
        ) : (
          <>
            {/* STATISTICS */}
            <section className="mb-12">
              <h2 className="text-xl font-black text-mainColor dark:text-white sm:text-2xl">
                نظرة عامة على الملجأ
              </h2>

              <p className="mb-6 mt-2 text-sm leading-7 text-secondaryColor dark:text-gray-400">
                ملخص النشاط الحالي حسب بيانات الملجأ.
              </p>

              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  icon={FaPaw}
                  label="الحيوانات"
                  value={statistics.animals ?? animals.length}
                  description="الحيوانات المسجلة"
                />

                <StatCard
                  icon={FaHeart}
                  label="طلبات تبنّي بانتظارك"
                  value={
                    statistics.pending_adoptions ??
                    adoptions.filter(
                      (item) => item.status === "pending"
                    ).length
                  }
                  description="طلبات تحتاج إلى مراجعة"
                />

                <StatCard
                  icon={FaBoxOpen}
                  label="احتياجات الملجأ"
                  value={
                    statistics.donation_requests ??
                    donationRequests.length
                  }
                  description="طلبات التبرع المنشورة"
                />

                <StatCard
                  icon={FaHandHoldingHeart}
                  label="تبرعات بانتظارك"
                  value={
                    statistics.pending_donations ??
                    donationSubmissions.filter(
                      (item) => item.status === "pending"
                    ).length
                  }
                  description="مساهمات تحتاج إلى قرار"
                />
              </div>
            </section>

            {/* ====================================
                ANIMALS
            ==================================== */}

            <section
              id="shelter-animals"
              className="mb-9 rounded-[28px] border border-mainColor/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1D2939] sm:p-8"
            >
              <SectionHeader
                icon={FaPaw}
                title="حيوانات الملجأ"
                description="تابع معلومات الحيوانات الموجودة في الملجأ وأضف حيوانات جديدة للتبنّي."
                action={
                  <button
                    type="button"
                    onClick={openAnimalModal}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-mainColor px-5 py-3 text-sm font-extrabold text-white"
                  >
                    <FaPlus size={13} />
                    إضافة حيوان
                  </button>
                }
              />

              {animals.length === 0 ? (
                <EmptyState
                  icon={FaPaw}
                  title="لا توجد حيوانات مسجلة"
                  description="أضف أول حيوان مع معلوماته وصورته حتى يظهر في الملجأ."
                />
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {animals.map((animal) => (
                    <article
                      key={animal.id}
                      className="rounded-[22px] border border-mainColor/10 bg-mainColor/[0.025] p-5 dark:border-white/10 dark:bg-white/[0.025]"
                    >
                      <div className="mb-4 flex items-center gap-3">
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-mainColor/10 text-mainColor dark:text-white">
                          <FaPaw size={20} />
                        </span>

                        <div className="min-w-0">
                          <h3 className="break-words text-lg font-black text-mainColor dark:text-white">
                            {animal.name || "حيوان"}
                          </h3>

                          <p className="mt-1 text-xs text-secondaryColor dark:text-gray-400">
                            {animal.type || "النوع غير محدد"}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 border-t border-mainColor/10 pt-4 dark:border-white/10">
                        <InfoCell label="العمر" value={animal.age} />
                        <InfoCell label="الجنس" value={animal.gender} />

                        <InfoCell
                          label="الحالة الصحية"
                          value={animal.health_status}
                        />

                        <InfoCell
                          label="اللقاحات"
                          value={animal.vaccines}
                        />
                      </div>

                      {animal.note && (
                        <p className="mt-4 break-words rounded-xl bg-white p-3 text-xs leading-7 text-secondaryColor dark:bg-[#1D2939] dark:text-gray-300">
                          {animal.note}
                        </p>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </section>

            {/* ====================================
                ADOPTIONS
            ==================================== */}

            <section className="mb-9 rounded-[28px] border border-mainColor/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1D2939] sm:p-8">
              <SectionHeader
                icon={FaHeart}
                title="طلبات التبنّي"
                description="راجع بيانات المتقدمين واتخذ القرار المناسب بشأن طلبات التبنّي."
              />

              {adoptions.length === 0 ? (
                <EmptyState
                  icon={FaHeart}
                  title="لا توجد طلبات تبنّي"
                  description="طلبات التبنّي الجديدة ستظهر هنا عندما يرسلها المستخدمون."
                />
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-mainColor/10 dark:border-white/10">
                  <table className="w-full min-w-[950px] text-right text-sm">
                    <thead className="bg-mainColor/5 dark:bg-white/5">
                      <tr>
                        {[
                          "المتبنّي",
                          "الحيوان",
                          "الهاتف",
                          "تبنّى سابقاً",
                          "تاريخ التسليم",
                          "الحالة",
                          "الإجراء",
                        ].map((heading) => (
                          <th
                            key={heading}
                            className="px-5 py-4 font-black text-mainColor dark:text-white"
                          >
                            {heading}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {adoptions.map((item) => (
                        <tr
                          key={item.id}
                          className="border-t border-mainColor/10 hover:bg-mainColor/[0.025] dark:border-white/10"
                        >
                          <TableCell className="font-bold text-mainColor dark:text-white">
                            {item.customer_name || "—"}
                          </TableCell>

                          <TableCell>{item.animal_name || "—"}</TableCell>

                          <TableCell>
                            <span dir="ltr">
                              {item.phone || "—"}
                            </span>
                          </TableCell>

                          <TableCell>
                            {item.has_adopted_before
                              ? "نعم"
                              : "لا"}
                          </TableCell>

                          <TableCell>
                            {formatDate(item.delivery_date)}
                          </TableCell>

                          <TableCell>
                            <StatusBadge status={item.status} />
                          </TableCell>

                          <TableCell>
                            {item.status === "pending" ? (
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  disabled={actionLoading}
                                  onClick={() =>
                                    setConfirmation({
                                      type: "approve-adoption",
                                      item,
                                    })
                                  }
                                  className="inline-flex items-center gap-2 rounded-xl bg-mainColor px-4 py-2 text-xs font-bold text-white disabled:opacity-50"
                                >
                                  <FaCheck />
                                  قبول
                                </button>

                                <button
                                  type="button"
                                  disabled={actionLoading}
                                  onClick={() =>
                                    setConfirmation({
                                      type: "reject-adoption",
                                      item,
                                    })
                                  }
                                  className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2 text-xs font-bold text-red-600 disabled:opacity-50 dark:bg-red-950/20 dark:text-red-300"
                                >
                                  <FaTimes />
                                  رفض
                                </button>
                              </div>
                            ) : (
                              <span className="text-xs text-secondaryColor dark:text-gray-400">
                                تمت المعالجة
                              </span>
                            )}
                          </TableCell>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* ====================================
                DONATION REQUESTS
            ==================================== */}

            <section className="mb-9 rounded-[28px] border border-mainColor/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1D2939] sm:p-8">
              <SectionHeader
                icon={FaBoxOpen}
                title="احتياجات الملجأ المنشورة"
                description="أضف المستلزمات المطلوبة وتابع طلبات التبرع التي نشرها الملجأ."
                action={
                  <button
                    type="button"
                    onClick={openDonationModal}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-mainColor px-5 py-3 text-sm font-extrabold text-white"
                  >
                    <FaPlus size={13} />
                    إضافة احتياج
                  </button>
                }
              />

              {donationRequests.length === 0 ? (
                <EmptyState
                  icon={FaBoxOpen}
                  title="لا توجد احتياجات منشورة"
                  description="أضف مستلزماً يحتاجه الملجأ ليظهر ضمن طلبات التبرع."
                />
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {donationRequests.map((item) => (
                    <article
                      key={item.id}
                      className="flex flex-col rounded-[22px] border border-mainColor/10 bg-mainColor/[0.025] p-5 dark:border-white/10 dark:bg-white/[0.025]"
                    >
                      <div className="mb-5 flex items-start justify-between gap-3">
                        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-mainColor/10 text-mainColor dark:text-white">
                          <FaBoxOpen size={21} />
                        </span>

                        <StatusBadge status={item.status} />
                      </div>

                      <h3 className="mb-5 break-words text-lg font-black text-mainColor dark:text-white">
                        {item.item || "مستلزم"}
                      </h3>

                      <div className="grid grid-cols-2 gap-4">
                        <InfoCell
                          label="الأولوية"
                          value={item.priority}
                        />

                        <InfoCell
                          label="الكمية"
                          value={item.quantity}
                        />

                        <div className="col-span-2">
                          <InfoCell
                            label="التاريخ"
                            value={formatDate(item.date)}
                          />
                        </div>
                      </div>

                      <div className="mt-auto pt-6">
                        <button
                          type="button"
                          disabled={actionLoading}
                          onClick={() =>
                            setConfirmation({
                              type: "delete-donation",
                              item,
                            })
                          }
                          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-600 hover:bg-red-100 disabled:opacity-50 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-300"
                        >
                          <FaTrashAlt size={13} />
                          حذف طلب التبرع
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            {/* ====================================
                DONATION SUBMISSIONS
            ==================================== */}

            <section className="rounded-[28px] border border-mainColor/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1D2939] sm:p-8">
              <SectionHeader
                icon={FaHandHoldingHeart}
                title="التبرعات الواردة"
                description="اطلع على مساهمات المتبرعين وقم بقبول أو رفض الطلبات الجديدة."
              />

              {donationSubmissions.length === 0 ? (
                <EmptyState
                  icon={FaHandHoldingHeart}
                  title="لا توجد تبرعات واردة"
                  description="ستظهر طلبات المتبرعين هنا بمجرد إرسالها عبر صفحة الملجأ."
                />
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-mainColor/10 dark:border-white/10">
                  <table className="w-full min-w-[1050px] text-right text-sm">
                    <thead className="bg-mainColor/5 dark:bg-white/5">
                      <tr>
                        {[
                          "المتبرع",
                          "البريد",
                          "المستلزم",
                          "الهاتف",
                          "نوع التبرع",
                          "المبلغ / المستلزم",
                          "الحالة",
                          "الإجراء",
                        ].map((heading) => (
                          <th
                            key={heading}
                            className="px-5 py-4 font-black text-mainColor dark:text-white"
                          >
                            {heading}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {donationSubmissions.map((item) => (
                        <tr
                          key={item.id}
                          className="border-t border-mainColor/10 hover:bg-mainColor/[0.025] dark:border-white/10"
                        >
                          <TableCell className="font-bold text-mainColor dark:text-white">
                            {item.customer_name ||
                              item.donor_name ||
                              "—"}
                          </TableCell>

                          <TableCell>
                            <span className="break-all">
                              {item.customer_email || "—"}
                            </span>
                          </TableCell>

                          <TableCell>
                            {item.request_item || "—"}
                          </TableCell>

                          <TableCell>
                            <span dir="ltr">
                              {item.phone || "—"}
                            </span>
                          </TableCell>

                          <TableCell>
                            {item.donation_type || "—"}
                          </TableCell>

                          <TableCell>
                            {item.amount_or_item || "—"}
                          </TableCell>

                          <TableCell>
                            <StatusBadge status={item.status} />
                          </TableCell>

                          <TableCell>
                            {item.status === "pending" ? (
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  disabled={actionLoading}
                                  onClick={() =>
                                    setConfirmation({
                                      type: "approve-donation",
                                      item,
                                    })
                                  }
                                  className="inline-flex items-center gap-2 rounded-xl bg-mainColor px-4 py-2 text-xs font-bold text-white disabled:opacity-50"
                                >
                                  <FaCheck />
                                  قبول
                                </button>

                                <button
                                  type="button"
                                  disabled={actionLoading}
                                  onClick={() =>
                                    setConfirmation({
                                      type: "reject-donation",
                                      item,
                                    })
                                  }
                                  className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2 text-xs font-bold text-red-600 disabled:opacity-50 dark:bg-red-950/20 dark:text-red-300"
                                >
                                  <FaTimes />
                                  رفض
                                </button>
                              </div>
                            ) : (
                              <span className="text-xs text-secondaryColor dark:text-gray-400">
                                تمت المعالجة
                              </span>
                            )}
                          </TableCell>
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

      {/* ========================================
          ADD ANIMAL MODAL
      ======================================== */}

      <DynamicFormModal
        isOpen={animalModalOpen}
        onClose={closeAnimalModal}
        title="إضافة حيوان للملجأ"
        fields={[
          { name: "name", placeholder: "اسم الحيوان" },
          { name: "type", placeholder: "نوع الحيوان" },
          { name: "age", placeholder: "عمر الحيوان" },
          {
            name: "health_status",
            placeholder: "الحالة الصحية",
          },
          { name: "gender", placeholder: "الجنس" },
          { name: "vaccines", placeholder: "اللقاحات" },
          { name: "note", placeholder: "ملاحظة" },
          {
            name: "image",
            placeholder: "صورة الحيوان",
            type: "file",
            accept: "image/*",
          },
        ]}
        buttonText={
          actionLoading ? "جارٍ الإضافة..." : "إضافة الحيوان"
        }
        onSubmit={handleCreateAnimal}
      />

      {/* ========================================
          ADD DONATION REQUEST MODAL
      ======================================== */}

      <DynamicFormModal
        isOpen={donationModalOpen}
        onClose={closeDonationModal}
        title="إضافة طلب تبرع"
        fields={[
          {
            name: "item",
            placeholder: "اسم المستلزم",
          },
          {
            name: "priority",
            placeholder: "الأولوية",
          },
          {
            name: "quantity",
            placeholder: "الكمية",
          },
          {
            name: "date",
            placeholder: "التاريخ",
            type: "date",
          },
          {
            name: "status",
            placeholder: "حالة الطلب",
          },
        ]}
        buttonText={
          actionLoading ? "جارٍ النشر..." : "نشر الطلب"
        }
        onSubmit={handleCreateDonation}
      />

      {/* MODAL VALIDATION ERRORS */}
      {(animalModalOpen || donationModalOpen) &&
        modalError && (
          <div
            role="alert"
            className="fixed bottom-5 left-4 right-4 z-[10000] mx-auto max-w-lg rounded-2xl border border-red-200 bg-red-50 p-4 text-center text-sm font-bold text-red-700 shadow-2xl dark:border-red-900/30 dark:bg-[#1D2939] dark:text-red-300"
          >
            {modalError}
          </div>
        )}

      {/* ========================================
          CONFIRMATION MODAL
      ======================================== */}

      {confirmation && (
        <div
          dir="rtl"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="shelter-confirm-title"
            className="w-full max-w-md rounded-[28px] bg-white p-7 text-center shadow-2xl dark:bg-[#1D2939]"
          >
            <span className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-mainColor/10 text-mainColor dark:bg-white/10 dark:text-white">
              {confirmation.type === "delete-donation" ? (
                <FaTrashAlt size={28} />
              ) : confirmation.type.startsWith("approve") ? (
                <FaCheckCircle size={29} />
              ) : (
                <FaExclamationTriangle
                  size={29}
                  className="text-red-500"
                />
              )}
            </span>

            <h2
              id="shelter-confirm-title"
              className="mb-4 text-xl font-black text-mainColor dark:text-white"
            >
              {confirmation.type === "delete-donation"
                ? "تأكيد حذف الاحتياج"
                : confirmation.type.startsWith("approve")
                ? "تأكيد القبول"
                : "تأكيد الرفض"}
            </h2>

            <p className="mb-7 text-sm leading-8 text-secondaryColor dark:text-gray-300">
              {confirmation.type === "delete-donation"
                ? `هل أنت متأكد من حذف طلب "${confirmation.item.item || "المستلزم"}"؟`
                : confirmation.type.includes("adoption")
                ? `هل تريد ${confirmation.type.startsWith("approve") ? "قبول" : "رفض"} طلب التبنّي الخاص بـ "${confirmation.item.animal_name || "الحيوان"}"؟`
                : `هل تريد ${confirmation.type.startsWith("approve") ? "قبول" : "رفض"} طلب التبرع المحدد؟`}
            </p>

            {error && (
              <p
                role="alert"
                className="mb-5 rounded-xl bg-red-50 p-3 text-sm font-bold text-red-600 dark:bg-red-950/20 dark:text-red-300"
              >
                {error}
              </p>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleConfirmAction}
                disabled={actionLoading}
                className={`flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl px-5 text-sm font-extrabold text-white disabled:opacity-50 ${
                  confirmation.type.startsWith("approve")
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
                disabled={actionLoading}
                onClick={() => {
                  setConfirmation(null);
                  setError("");
                }}
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
