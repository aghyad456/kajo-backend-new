
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  FaUsers,
  FaUserMd,
  FaStore,
  FaHome,
  FaSearch,
  FaSyncAlt,
  FaCheck,
  FaTimes,
  FaClock,
  FaEnvelope,
  FaCalendarAlt,
  FaEye,
  FaExclamationTriangle,
  FaCheckCircle,
  FaInfoCircle,
  FaPaw,
  FaSpinner,
  FaShieldAlt,
} from "react-icons/fa";

import { api } from "../../api/apiClient";

// ==========================================
// CONFIGURATION
// ==========================================

const STATUS_OPTIONS = [
  { value: "pending", label: "قيد المراجعة" },
  { value: "approved", label: "المقبولة" },
  { value: "rejected", label: "المرفوضة" },
];

const ROLE_LABELS = {
  doctor: "طبيب بيطري",
  shop_owner: "صاحب متجر",
  "shop-owner": "صاحب متجر",
  store_owner: "صاحب متجر",
  "store-owner": "صاحب متجر",
  shelter_owner: "صاحب ملجأ",
  "shelter-owner": "صاحب ملجأ",
  3: "صاحب متجر",
  4: "صاحب ملجأ",
  5: "طبيب بيطري",
};

const STATUS_CONFIG = {
  pending: {
    label: "قيد المراجعة",
    icon: FaClock,
    className:
      "bg-secondaryColor/10 text-secondaryColor border-secondaryColor/20",
  },
  approved: {
    label: "مقبول",
    icon: FaCheckCircle,
    className:
      "bg-mainColor/10 text-mainColor border-mainColor/20 dark:text-white",
  },
  rejected: {
    label: "مرفوض",
    icon: FaTimes,
    className:
      "bg-red-50 text-red-600 border-red-200 dark:bg-red-950/20 dark:text-red-300 dark:border-red-900/30",
  },
};

function getRoleLabel(role) {
  return ROLE_LABELS[String(role ?? "").toLowerCase()] ||
    String(role || "غير محدد");
}

function getRoleIcon(role) {
  const value = String(role ?? "").toLowerCase();

  if (value === "doctor" || value === "5") {
    return FaUserMd;
  }

  if (
    ["shop_owner", "shop-owner", "store_owner", "store-owner", "3"].includes(value)
  ) {
    return FaStore;
  }

  if (
    ["shelter_owner", "shelter-owner", "4"].includes(value)
  ) {
    return FaHome;
  }

  return FaUsers;
}

function getStatus(status) {
  return STATUS_CONFIG[status] || {
    label: status || "غير محدد",
    icon: FaInfoCircle,
    className:
      "bg-gray-100 text-gray-600 border-gray-200 dark:bg-white/10 dark:text-white dark:border-white/10",
  };
}

function normalizeRequests(response) {
  const candidates = [
    response?.data?.data,
    response?.data,
    response?.requests?.data,
    response?.requests,
    response,
  ];

  for (const value of candidates) {
    if (Array.isArray(value)) {
      return value;
    }
  }

  return [];
}

function getErrorMessage(error, fallback) {
  return (
    error?.data?.message ||
    error?.message ||
    fallback
  );
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat("ar-SY", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

// ==========================================
// SMALL COMPONENTS
// ==========================================

function StatusBadge({ status }) {
  const config = getStatus(status);
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-extrabold ${config.className}`}
    >
      <Icon size={12} />
      {config.label}
    </span>
  );
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex min-w-0 items-start gap-3 rounded-2xl bg-mainColor/5 p-4 dark:bg-white/5">
      <span className="mt-0.5 text-mainColor dark:text-white">
        <Icon size={16} />
      </span>

      <div className="min-w-0">
        <p className="mb-1 text-xs text-secondaryColor dark:text-gray-400">
          {label}
        </p>

        <p className="break-all text-sm font-extrabold text-mainColor dark:text-white">
          {value || "—"}
        </p>
      </div>
    </div>
  );
}

function RequestSkeleton() {
  return (
    <div className="animate-pulse rounded-[26px] border border-mainColor/10 bg-white p-6 dark:border-white/10 dark:bg-[#1D2939]">
      <div className="flex items-center gap-4">
        <div className="h-14 w-14 rounded-2xl bg-mainColor/10" />

        <div className="flex-1 space-y-3">
          <div className="h-5 w-1/3 rounded bg-mainColor/10" />
          <div className="h-3 w-1/2 rounded bg-mainColor/10" />
        </div>
      </div>

      <div className="mt-6 h-12 rounded-xl bg-mainColor/5" />
    </div>
  );
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function UsersRequests() {
  const [statusFilter, setStatusFilter] =
    useState("pending");

  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [selectedReq, setSelectedReq] = useState(null);
  const [confirmation, setConfirmation] = useState(null);

  const requestRef = useRef(0);
  const actionRef = useRef(false);

  // ======================================
  // FETCH REQUESTS
  // ======================================

  const fetchData = useCallback(
    async (silent = false) => {
      const requestId = ++requestRef.current;

      setError("");

      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const response =
          await api.adminJoinRequests(statusFilter);

        if (requestId !== requestRef.current) {
          return;
        }

        setItems(normalizeRequests(response));
      } catch (err) {
        if (requestId !== requestRef.current) {
          return;
        }

        setError(
          getErrorMessage(
            err,
            "تعذر تحميل طلبات الانضمام."
          )
        );
      } finally {
        if (requestId === requestRef.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [statusFilter]
  );

  useEffect(() => {
    fetchData();

    return () => {
      requestRef.current += 1;
    };
  }, [fetchData]);

  // ======================================
  // SEARCH
  // ======================================

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return items;

    return items.filter((req) => {
      const searchable = [
        req.id,
        req.user?.name,
        req.user?.email,
        req.requested_role,
        getRoleLabel(req.requested_role),
      ]
        .filter((value) => value != null)
        .join(" ")
        .toLowerCase();

      return searchable.includes(query);
    });
  }, [items, search]);

  // ======================================
  // APPROVE / REJECT
  // ======================================

  const handleAction = async () => {
    if (!confirmation || actionRef.current) return;

    const { request, action } = confirmation;

    actionRef.current = true;
    setActionLoadingId(request.id);
    setError("");
    setSuccess("");

    try {
      if (action === "approve") {
        await api.adminApproveJoinRequest(request.id);
      } else {
        await api.adminRejectJoinRequest(request.id);
      }

      const updatedStatus =
        action === "approve" ? "approved" : "rejected";

      // Remove request from the current filter if
      // its new status does not match it.
      setItems((previous) =>
        previous
          .map((item) =>
            item.id === request.id
              ? { ...item, status: updatedStatus }
              : item
          )
          .filter((item) => item.status === statusFilter)
      );

      setSelectedReq(null);
      setConfirmation(null);

      setSuccess(
        action === "approve"
          ? "تم قبول طلب الانضمام بنجاح."
          : "تم رفض طلب الانضمام بنجاح."
      );

      // Refresh current filter after success.
      // If refreshing fails, keep the updated list.
      await fetchData(true);
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          action === "approve"
            ? "فشل قبول الطلب."
            : "فشل رفض الطلب."
        )
      );
    } finally {
      actionRef.current = false;
      setActionLoadingId(null);
    }
  };

  // ======================================
  // RENDER
  // ======================================

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-fivethColor px-4 pb-20 pt-8 text-mainColor transition-colors duration-500 dark:bg-[#101828] sm:px-6"
    >
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <header className="relative mb-8 overflow-hidden rounded-[30px] bg-mainColor px-6 py-10 text-white shadow-xl sm:px-9">
          <div className="pointer-events-none absolute -left-16 -top-16 h-52 w-52 rounded-full bg-white/10" />

          <div className="relative flex flex-wrap items-center justify-between gap-6">
            <div>
              <span className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-bold">
                <FaShieldAlt />
                إدارة كاجو
              </span>

              <h1 className="mb-3 text-3xl font-black sm:text-4xl">
                طلبات الانضمام
              </h1>

              <p className="max-w-xl text-sm leading-8 text-white/85">
                راجع طلبات الحسابات المهنية
                واطّلع على بيانات المتقدمين قبل
                اتخاذ قرار القبول أو الرفض.
              </p>
            </div>

            <span className="flex h-20 w-20 items-center justify-center rounded-[26px] border border-white/20 bg-white/10">
              <FaUsers size={35} />
            </span>
          </div>
        </header>

        {/* FILTERS */}
        <section className="mb-8 rounded-[26px] border border-mainColor/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1D2939] sm:p-7">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-mainColor dark:text-white">
                مراجعة الطلبات
              </h2>

              <p className="mt-2 text-xs leading-7 text-secondaryColor dark:text-gray-400">
                اختر الحالة المطلوبة أو ابحث
                بين الطلبات المعروضة.
              </p>
            </div>

            <button
              type="button"
              onClick={() => fetchData(true)}
              disabled={loading || refreshing}
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-mainColor/15 px-5 text-sm font-bold text-mainColor hover:bg-mainColor/5 disabled:opacity-50 dark:text-white"
            >
              {loading || refreshing ? (
                <FaSpinner className="animate-spin" />
              ) : (
                <FaSyncAlt />
              )}
              تحديث
            </button>
          </div>

          {/* STATUS FILTER */}
          <div className="mb-6 flex flex-wrap gap-3">
            {STATUS_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setStatusFilter(option.value);
                  setSearch("");
                  setSelectedReq(null);
                  setConfirmation(null);
                  setSuccess("");
                }}
                aria-pressed={
                  statusFilter === option.value
                }
                className={[
                  "rounded-xl px-5 py-3 text-sm font-extrabold transition-all",
                  statusFilter === option.value
                    ? "bg-mainColor text-white shadow-md"
                    : "border border-mainColor/10 bg-mainColor/5 text-mainColor hover:bg-mainColor/10 dark:bg-white/5 dark:text-white",
                ].join(" ")}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* SEARCH */}
          <div className="relative">
            <FaSearch className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-mainColor/60 dark:text-white/60" />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="ابحث بالاسم أو البريد أو نوع الحساب..."
              aria-label="البحث في طلبات الانضمام"
              className="h-14 w-full rounded-2xl border border-mainColor/15 bg-fivethColor py-3 pl-12 pr-12 text-sm font-medium text-mainColor outline-none focus:border-mainColor dark:border-white/10 dark:bg-[#101828] dark:text-white"
            />

            {search && (
              <button
                type="button"
                aria-label="مسح البحث"
                onClick={() => setSearch("")}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-mainColor dark:text-white"
              >
                <FaTimes />
              </button>
            )}
          </div>
        </section>

        {/* FEEDBACK */}
        {error && (
          <div
            role="alert"
            className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-bold text-red-700 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-300"
          >
            <FaExclamationTriangle className="mt-1 shrink-0" />
            {error}
          </div>
        )}

        {success && (
          <div
            role="status"
            className="mb-6 flex items-start gap-3 rounded-2xl border border-mainColor/20 bg-mainColor/10 p-5 text-sm font-bold text-mainColor dark:text-white"
          >
            <FaCheckCircle className="mt-1 shrink-0" />
            {success}
          </div>
        )}

        {/* RESULTS TITLE */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-black text-mainColor dark:text-white">
            {STATUS_OPTIONS.find(
              (item) => item.value === statusFilter
            )?.label}
          </h2>

          <span className="rounded-full bg-mainColor/10 px-4 py-2 text-xs font-extrabold text-mainColor dark:text-white">
            {loading
              ? "..."
              : `${filteredItems.length} طلب`}
          </span>
        </div>

        {/* LOADING */}
        {loading ? (
          <div className="grid gap-5 md:grid-cols-2">
            <RequestSkeleton />
            <RequestSkeleton />
            <RequestSkeleton />
            <RequestSkeleton />
          </div>
        ) : filteredItems.length === 0 ? (
          /* EMPTY */
          <div className="rounded-[28px] border border-mainColor/10 bg-white px-6 py-14 text-center dark:border-white/10 dark:bg-[#1D2939]">
            <span className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-mainColor/10 text-mainColor dark:text-white">
              <FaUsers size={30} />
            </span>

            <h3 className="mb-3 text-xl font-black text-mainColor dark:text-white">
              {search
                ? "لا توجد نتائج مطابقة"
                : "لا توجد طلبات بهذه الحالة"}
            </h3>

            <p className="text-sm leading-8 text-secondaryColor dark:text-gray-400">
              {search
                ? "جرّب البحث باسم مختلف أو امسح كلمة البحث."
                : "ستظهر الطلبات هنا عند توفرها."}
            </p>
          </div>
        ) : (
          /* REQUESTS */
          <div className="grid items-start gap-5 md:grid-cols-2">
            {filteredItems.map((req) => {
              const RoleIcon = getRoleIcon(
                req.requested_role
              );

              return (
                <article
                  key={req.id}
                  className="rounded-[26px] border border-mainColor/10 bg-white p-5 shadow-sm transition-all hover:shadow-lg dark:border-white/10 dark:bg-[#1D2939] sm:p-6"
                >
                  <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-mainColor/10 text-mainColor dark:text-white">
                        <RoleIcon size={21} />
                      </span>

                      <div className="min-w-0">
                        <h3 className="break-words text-lg font-black text-mainColor dark:text-white">
                          {req.user?.name || "مستخدم"}
                        </h3>

                        <p className="mt-1 text-xs font-bold text-secondaryColor dark:text-gray-400">
                          {getRoleLabel(req.requested_role)}
                        </p>
                      </div>
                    </div>

                    <StatusBadge status={req.status} />
                  </div>

                  <div className="space-y-3 border-t border-mainColor/10 pt-5 dark:border-white/10">
                    <div className="flex items-center gap-2 text-sm text-secondaryColor dark:text-gray-300">
                      <FaEnvelope className="shrink-0 text-mainColor dark:text-white" />
                      <span className="break-all">
                        {req.user?.email || "—"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-secondaryColor dark:text-gray-400">
                      <FaCalendarAlt className="text-mainColor dark:text-white" />
                      {formatDate(req.created_at)}
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedReq(req)}
                      className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-mainColor/15 px-4 py-2 text-sm font-bold text-mainColor hover:bg-mainColor/5 dark:text-white"
                    >
                      <FaEye />
                      التفاصيل
                    </button>

                    {req.status === "pending" && (
                      <>
                        <button
                          type="button"
                          disabled={Boolean(actionLoadingId)}
                          onClick={() =>
                            setConfirmation({
                              request: req,
                              action: "approve",
                            })
                          }
                          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-mainColor px-5 py-2 text-sm font-extrabold text-white disabled:opacity-50"
                        >
                          <FaCheck />
                          قبول
                        </button>

                        <button
                          type="button"
                          disabled={Boolean(actionLoadingId)}
                          onClick={() =>
                            setConfirmation({
                              request: req,
                              action: "reject",
                            })
                          }
                          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 py-2 text-sm font-extrabold text-red-600 hover:bg-red-100 disabled:opacity-50"
                        >
                          <FaTimes />
                          رفض
                        </button>
                      </>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* ======================================
          REQUEST DETAILS MODAL
      ====================================== */}

      {selectedReq && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedReq(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="request-details-title"
            dir="rtl"
            className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-[28px] bg-white p-6 shadow-2xl dark:bg-[#1D2939] sm:p-8"
          >
            <div className="mb-7 flex items-center justify-between gap-4">
              <div>
                <p className="mb-2 text-xs font-bold text-secondaryColor dark:text-gray-400">
                  مراجعة طلب انضمام
                </p>

                <h2
                  id="request-details-title"
                  className="text-2xl font-black text-mainColor dark:text-white"
                >
                  تفاصيل المتقدم
                </h2>
              </div>

              <button
                type="button"
                aria-label="إغلاق التفاصيل"
                onClick={() => setSelectedReq(null)}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-mainColor/5 text-mainColor hover:bg-mainColor/10 dark:text-white"
              >
                <FaTimes />
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <InfoItem
                icon={FaUsers}
                label="اسم المتقدم"
                value={selectedReq.user?.name}
              />

              <InfoItem
                icon={FaEnvelope}
                label="البريد الإلكتروني"
                value={selectedReq.user?.email}
              />

              <InfoItem
                icon={getRoleIcon(selectedReq.requested_role)}
                label="نوع الحساب المطلوب"
                value={getRoleLabel(selectedReq.requested_role)}
              />

              <InfoItem
                icon={FaCalendarAlt}
                label="تاريخ تقديم الطلب"
                value={formatDate(selectedReq.created_at)}
              />
            </div>

            <div className="mt-5 rounded-2xl border border-mainColor/10 p-4 dark:border-white/10">
              <p className="mb-3 text-xs font-bold text-secondaryColor dark:text-gray-400">
                حالة الطلب
              </p>
              <StatusBadge status={selectedReq.status} />
            </div>

            {selectedReq.status === "pending" && (
              <div className="mt-7 flex flex-wrap gap-3 border-t border-mainColor/10 pt-6 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setConfirmation({
                      request: selectedReq,
                      action: "approve",
                    });
                    setSelectedReq(null);
                  }}
                  className="flex-1 rounded-xl bg-mainColor px-5 py-3 text-sm font-extrabold text-white"
                >
                  قبول الطلب
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setConfirmation({
                      request: selectedReq,
                      action: "reject",
                    });
                    setSelectedReq(null);
                  }}
                  className="flex-1 rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-extrabold text-red-600"
                >
                  رفض الطلب
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================
          CONFIRM ACTION MODAL
      ====================================== */}

      {confirmation && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-request-title"
            dir="rtl"
            className="w-full max-w-md rounded-[28px] bg-white p-7 text-center shadow-2xl dark:bg-[#1D2939]"
          >
            <span
              className={[
                "mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full",
                confirmation.action === "approve"
                  ? "bg-mainColor/10 text-mainColor dark:text-white"
                  : "bg-red-50 text-red-600 dark:bg-red-950/20",
              ].join(" ")}
            >
              {confirmation.action === "approve" ? (
                <FaCheck size={31} />
              ) : (
                <FaExclamationTriangle size={31} />
              )}
            </span>

            <h2
              id="confirm-request-title"
              className="mb-3 text-xl font-black text-mainColor dark:text-white"
            >
              {confirmation.action === "approve"
                ? "تأكيد قبول الطلب"
                : "تأكيد رفض الطلب"}
            </h2>

            <p className="mb-7 text-sm leading-8 text-secondaryColor dark:text-gray-300">
              هل أنت متأكد من{" "}
              {confirmation.action === "approve"
                ? "قبول"
                : "رفض"}{" "}
              طلب انضمام{" "}
              <strong>
                {confirmation.request.user?.name || "المستخدم"}
              </strong>
              ؟
            </p>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleAction}
                disabled={Boolean(actionLoadingId)}
                className={[
                  "flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl px-5 text-sm font-extrabold text-white disabled:opacity-60",
                  confirmation.action === "approve"
                    ? "bg-mainColor"
                    : "bg-red-600",
                ].join(" ")}
              >
                {actionLoadingId ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    جارٍ التنفيذ...
                  </>
                ) : confirmation.action === "approve" ? (
                  "نعم، قبول"
                ) : (
                  "نعم، رفض"
                )}
              </button>

              <button
                type="button"
                onClick={() => setConfirmation(null)}
                disabled={Boolean(actionLoadingId)}
                className="min-h-12 flex-1 rounded-xl border border-mainColor/15 px-5 text-sm font-bold text-mainColor disabled:opacity-50 dark:text-white"
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
