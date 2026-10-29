
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Link } from "react-router-dom";
import { useDisclosure, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@heroui/react";

import DynamicFormModal from "../modals/DynamicFormModal";
import { api } from "../../api/apiClient";
import fallbackProduct from "../../assets/product1.svg";

import {
  FaStore,
  FaShoppingBag,
  FaShoppingCart,
  FaBoxOpen,
  FaBoxes,
  FaPlus,
  FaTrashAlt,
  FaCheck,
  FaTimes,
  FaClock,
  FaMapMarkerAlt,
  FaSyncAlt,
  FaSpinner,
  FaExclamationTriangle,
  FaCheckCircle,
  FaInfoCircle,
  FaCalendarAlt,
  FaArrowLeft,
  FaShieldAlt,
  FaSearch,
  FaFilter,
  FaPaw,
  FaEye,
} from "react-icons/fa";

// ==========================================
// HELPERS
// ==========================================

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

function normalizeDashboard(response) {
  return (
    response?.dashboard ??
    response?.data?.dashboard ??
    response?.data ??
    response ??
    {}
  );
}

function normalizeArray(value) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  return [];
}

function getQuantity(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) return 0;
  return Math.max(0, Math.floor(number));
}

function formatPrice(value) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  const price = Number(value);

  if (!Number.isFinite(price)) return "—";

  return (
    new Intl.NumberFormat("ar-SY", {
      maximumFractionDigits: 2,
    }).format(price) + " ل.س"
  );
}

function formatDate(value) {
  if (!value) return "—";

  const raw = String(value);
  const date = new Date(raw);

  if (Number.isNaN(date.getTime())) {
    return raw;
  }

  return new Intl.DateTimeFormat("ar-SY", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

function getStatusInfo(status) {
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
        label: "تم القبول",
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

    default:
      return {
        label: status || "غير محدد",
        icon: FaInfoCircle,
        className:
          "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300",
      };
  }
}

// ==========================================
// SHARED UI
// ==========================================

function StatusBadge({ status }) {
  const info = getStatusInfo(status);
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
        <Icon size={31} />
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
    <div role="status" className="animate-pulse space-y-8">
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="h-36 rounded-[24px] bg-mainColor/10 dark:bg-white/10"
          />
        ))}
      </div>

      <div className="h-72 rounded-[28px] bg-mainColor/10 dark:bg-white/10" />
      <div className="h-80 rounded-[28px] bg-mainColor/10 dark:bg-white/10" />

      <span className="sr-only">
        جارٍ تحميل لوحة المتجر...
      </span>
    </div>
  );
}

function ProductCard({ product, onDelete, disabled }) {
  const [imageFailed, setImageFailed] = useState(false);

  const quantity = getQuantity(product.quantity);
  const available = quantity > 0;

  const imageSrc =
    product.image_url && !imageFailed
      ? product.image_url
      : fallbackProduct;

  return (
    <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-[24px] border border-mainColor/10 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-white/10 dark:bg-[#1D2939]">
      <div className="relative aspect-[5/3] overflow-hidden bg-mainColor/5 dark:bg-white/5">
        <img
          src={imageSrc}
          alt={product.name || "صورة المنتج"}
          onError={() => setImageFailed(true)}
          loading="lazy"
          className="h-full w-full object-contain p-5 transition-transform duration-500 group-hover:scale-105"
        />

        <span
          className={`absolute right-4 top-4 rounded-full px-3 py-1.5 text-xs font-extrabold shadow-sm ${
            available
              ? "bg-white text-mainColor"
              : "bg-red-50 text-red-600"
          }`}
        >
          {available ? "متوفر" : "نفدت الكمية"}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="mb-2 text-xs font-bold text-secondaryColor dark:text-gray-400">
          {product.category || "غير مصنف"}
        </p>

        <h3 className="mb-5 break-words text-lg font-black text-mainColor dark:text-white">
          {product.name || "منتج"}
        </h3>

        <div className="grid grid-cols-2 gap-4 border-y border-mainColor/10 py-4 dark:border-white/10">
          <div>
            <p className="text-xs text-secondaryColor dark:text-gray-400">
              المخزون
            </p>
            <p className="mt-1 text-sm font-black text-mainColor dark:text-white">
              {quantity}
            </p>
          </div>

          <div>
            <p className="text-xs text-secondaryColor dark:text-gray-400">
              سعر المستهلك
            </p>
            <p className="mt-1 text-sm font-black text-mainColor dark:text-white">
              {formatPrice(product.user_price)}
            </p>
          </div>

          <div>
            <p className="text-xs text-secondaryColor dark:text-gray-400">
              سعر التكلفة
            </p>
            <p className="mt-1 text-sm font-bold text-mainColor dark:text-white">
              {formatPrice(product.store_price)}
            </p>
          </div>

          <div>
            <p className="text-xs text-secondaryColor dark:text-gray-400">
              تاريخ الصلاحية
            </p>
            <p className="mt-1 text-sm font-bold text-mainColor dark:text-white">
              {formatDate(product.expiry)}
            </p>
          </div>
        </div>

        <button
          type="button"
          disabled={disabled || product.id == null}
          onClick={() => onDelete(product)}
          className="mt-auto flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-extrabold text-red-600 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-300"
        >
          <FaTrashAlt size={13} />
          حذف المنتج
        </button>
      </div>
    </article>
  );
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function StoreDashboard() {
  const addProductModal = useDisclosure();

  const [dashboardData, setDashboardData] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  const [fetching, setFetching] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formError, setFormError] = useState("");
  const [formSubmitting, setFormSubmitting] = useState(false);

  const [confirmation, setConfirmation] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  const [productSearch, setProductSearch] = useState("");
  const [stockFilter, setStockFilter] = useState("all");
  const [orderFilter, setOrderFilter] = useState("all");

  const requestRef = useRef(0);
  const submittingRef = useRef(false);

  // ======================================
  // LOAD ALL
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
      const response = await api.getStoreDashboard();

      if (requestId !== requestRef.current) return;

      const data = normalizeDashboard(response);

      setDashboardData(data);
      setProducts(normalizeArray(data?.products));
      setOrders(normalizeArray(data?.orders));
    } catch (err) {
      if (requestId !== requestRef.current) return;

      setError(
        getErrorMessage(
          err,
          "تعذر تحميل بيانات المتجر. يرجى المحاولة مجدداً."
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
    loadAll();

    return () => {
      requestRef.current += 1;
    };
  }, [loadAll]);

  // ======================================
  // DATA
  // ======================================

  const profile = dashboardData?.profile || {};
  const statistics = dashboardData?.statistics || {};

  const filteredProducts = useMemo(() => {
    const query = productSearch.trim().toLowerCase();

    return products.filter((product) => {
      const searchMatches =
        !query ||
        [
          product.name,
          product.category,
          product.description,
        ].some((value) =>
          String(value ?? "").toLowerCase().includes(query)
        );

      const quantity = getQuantity(product.quantity);

      const stockMatches =
        stockFilter === "all" ||
        (stockFilter === "available"
          ? quantity > 0
          : quantity === 0);

      return searchMatches && stockMatches;
    });
  }, [products, productSearch, stockFilter]);

  const filteredOrders = useMemo(() => {
    return orders.filter(
      (order) =>
        orderFilter === "all" ||
        order.status === orderFilter
    );
  }, [orders, orderFilter]);

  const availableProducts = products.filter(
    (product) => getQuantity(product.quantity) > 0
  ).length;

  const pendingOrders = orders.filter(
    (order) => order.status === "pending"
  ).length;

  // ======================================
  // MODAL HELPERS
  // ======================================

  const openConfirmation = (type, item) => {
    if (submittingRef.current) return;

    setActionError("");
    setConfirmation({ type, item });
  };

  const closeConfirmation = () => {
    if (submittingRef.current) return;

    setConfirmation(null);
    setActionError("");
  };

  // ======================================
  // CREATE PRODUCT
  // ======================================

  const handleCreateProduct = async (data) => {
    if (submittingRef.current) return;

    const name = String(data.name || "").trim();
    const price = Number(data.user_price);
    const costPrice =
      data.store_price == null ||
      String(data.store_price).trim() === ""
        ? 0
        : Number(data.store_price);
    const quantity = Number(data.quantity);

    if (!name) {
      setFormError("يرجى إدخال اسم المنتج.");
      return;
    }

    if (
      String(data.user_price ?? "").trim() === "" ||
      !Number.isFinite(price) ||
      price < 0
    ) {
      setFormError("يرجى إدخال سعر بيع صحيح.");
      return;
    }

    if (!Number.isFinite(costPrice) || costPrice < 0) {
      setFormError("يرجى إدخال سعر تكلفة صحيح.");
      return;
    }

    if (
      String(data.quantity ?? "").trim() === "" ||
      !Number.isSafeInteger(quantity) ||
      quantity < 0
    ) {
      setFormError("الكمية يجب أن تكون عدداً صحيحاً غير سالب.");
      return;
    }

    submittingRef.current = true;
    setFormSubmitting(true);
    setFormError("");
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();

      formData.append("name", name);
      formData.append("category", data.category || "");
      formData.append("user_price", String(price));
      formData.append("store_price", String(costPrice));
      formData.append("quantity", String(quantity));
      formData.append("expiry", data.expiry || "");
      formData.append("description", data.description || "");

      const imageValue = data.image;

      const image =
        imageValue instanceof File
          ? imageValue
          : imageValue?.[0];

      if (image instanceof File) {
        formData.append("image", image);
      }

      await api.createStoreProduct(formData);

      addProductModal.onClose();

      setSuccess("تمت إضافة المنتج إلى المتجر بنجاح.");

      // Refresh without hiding the whole dashboard.
      await loadAll(true);
    } catch (err) {
      setFormError(
        getErrorMessage(
          err,
          "تعذر إضافة المنتج. يرجى مراجعة البيانات."
        )
      );
    } finally {
      submittingRef.current = false;
      setFormSubmitting(false);
    }
  };

  // ======================================
  // DELETE / APPROVE / REJECT
  // ======================================

  const handleConfirmAction = async () => {
    if (!confirmation || submittingRef.current) return;

    const { type, item } = confirmation;

    submittingRef.current = true;
    setActionLoading(true);
    setActionError("");
    setError("");
    setSuccess("");

    try {
      if (type === "delete-product") {
        await api.deleteStoreProduct(item.id);

        setProducts((previous) =>
          previous.filter((product) => product.id !== item.id)
        );

        setSuccess("تم حذف المنتج بنجاح.");
      }

      if (type === "approve-order") {
        await api.updateStoreOrderStatus(
          item.id,
          "approved"
        );

        setOrders((previous) =>
          previous.map((order) =>
            order.id === item.id
              ? { ...order, status: "approved" }
              : order
          )
        );

        setSuccess("تم قبول طلب الزبون بنجاح.");
      }

      if (type === "reject-order") {
        await api.updateStoreOrderStatus(
          item.id,
          "rejected"
        );

        setOrders((previous) =>
          previous.map((order) =>
            order.id === item.id
              ? { ...order, status: "rejected" }
              : order
          )
        );

        setSuccess("تم رفض طلب الزبون.");
      }

      setConfirmation(null);

      await loadAll(true);
    } catch (err) {
      setActionError(
        getErrorMessage(
          err,
          "تعذر تنفيذ العملية. يرجى المحاولة مجدداً."
        )
      );
    } finally {
      submittingRef.current = false;
      setActionLoading(false);
    }
  };

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
              <span className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-3xl border border-white/20 bg-white/10 sm:h-24 sm:w-24">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.name || "صورة المتجر"}
                    className="h-full w-full object-cover"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <FaStore size={37} />
                )}
              </span>

              <div className="min-w-0">
                <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold">
                  <FaShieldAlt size={12} />
                  لوحة إدارة المتجر
                </span>

                <h1 className="break-words text-2xl font-black leading-snug sm:text-3xl">
                  {profile.name || "مرحباً بك في متجر كاجو"}
                </h1>

                {profile.specialty && (
                  <p className="mt-2 text-sm font-bold text-fourthColor">
                    {profile.specialty}
                  </p>
                )}

                {profile.location && (
                  <p className="mt-3 flex items-center gap-2 text-xs text-white/85">
                    <FaMapMarkerAlt size={13} />
                    {profile.location}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
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

              <button
                type="button"
                onClick={() => {
                  setFormError("");
                  addProductModal.onOpen();
                }}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-extrabold text-mainColor"
              >
                <FaPlus />
                إضافة منتج
              </button>
            </div>
          </div>
        </header>

        {/* ====================================
            ALERTS
        ==================================== */}

        {error && (
          <div
            role="alert"
            className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-300"
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
            className="mb-6 flex items-center gap-3 rounded-2xl border border-mainColor/15 bg-mainColor/10 p-5 text-sm font-bold text-mainColor dark:bg-white/10 dark:text-white"
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
            {/* ==================================
                STATISTICS
            ================================== */}

            <section className="mb-12">
              <h2 className="text-xl font-black text-mainColor dark:text-white sm:text-2xl">
                نظرة عامة على متجرك
              </h2>

              <p className="mb-6 mt-2 text-sm text-secondaryColor dark:text-gray-400">
                تابع مخزونك والطلبات الواردة من مكان واحد.
              </p>

              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  icon={FaBoxes}
                  label="كل المنتجات"
                  value={statistics.products ?? products.length}
                  description="إجمالي المنتجات المسجلة"
                />

                <StatCard
                  icon={FaCheckCircle}
                  label="المنتجات النشطة"
                  value={
                    statistics.active_products ??
                    availableProducts
                  }
                  description="وفق بيانات المتجر"
                />

                <StatCard
                  icon={FaBoxOpen}
                  label="نفدت الكمية"
                  value={
                    statistics.out_of_stock ??
                    products.filter(
                      (product) =>
                        getQuantity(product.quantity) === 0
                    ).length
                  }
                  description="منتجات تحتاج إلى إعادة توفير"
                />

                <StatCard
                  icon={FaShoppingCart}
                  label="طلبات بانتظارك"
                  value={
                    statistics.pending_orders ??
                    pendingOrders
                  }
                  description="طلبات تحتاج إلى مراجعة"
                />
              </div>
            </section>

            {/* ==================================
                ORDERS
            ================================== */}

            <section className="mb-9 rounded-[28px] border border-mainColor/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1D2939] sm:p-8">
              <SectionHeader
                icon={FaShoppingCart}
                title="إدارة طلبات الزبائن"
                description="راجع الطلبات الجديدة، وتابع حالتها، واتخذ القرار المناسب."
                action={
                  <span className="rounded-full bg-mainColor/10 px-4 py-2 text-xs font-extrabold text-mainColor dark:bg-white/10 dark:text-white">
                    {pendingOrders} بانتظار المراجعة
                  </span>
                }
              />

              {/* ORDER FILTER */}
              <div className="mb-6 flex flex-wrap gap-2">
                {[
                  { value: "all", label: "جميع الطلبات" },
                  { value: "pending", label: "قيد المراجعة" },
                  { value: "approved", label: "المقبولة" },
                  { value: "rejected", label: "المرفوضة" },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      setOrderFilter(option.value)
                    }
                    aria-pressed={
                      orderFilter === option.value
                    }
                    className={`rounded-xl px-4 py-2.5 text-xs font-bold transition ${
                      orderFilter === option.value
                        ? "bg-mainColor text-white"
                        : "border border-mainColor/10 bg-mainColor/5 text-mainColor dark:border-white/10 dark:bg-white/5 dark:text-white"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              {filteredOrders.length === 0 ? (
                <EmptyState
                  icon={FaShoppingBag}
                  title={
                    orders.length === 0
                      ? "لا توجد طلبات حالياً"
                      : "لا توجد طلبات بهذه الحالة"
                  }
                  description={
                    orders.length === 0
                      ? "عندما يقوم الزبائن بطلب المنتجات ستظهر طلباتهم هنا."
                      : "جرّب اختيار فلتر مختلف لعرض الطلبات."
                  }
                />
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-mainColor/10 dark:border-white/10">
                  <table className="w-full min-w-[850px] text-right text-sm">
                    <thead className="bg-mainColor/5 dark:bg-white/5">
                      <tr>
                        {[
                          "الزبون",
                          "المنتج",
                          "الكمية",
                          "تاريخ الطلب",
                          "الحالة",
                          "الإجراءات",
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
                      {filteredOrders.map((order) => (
                        <tr
                          key={order.id}
                          className="border-t border-mainColor/10 transition-colors hover:bg-mainColor/[0.025] dark:border-white/10"
                        >
                          <td className="px-5 py-4">
                            <p className="font-bold text-mainColor dark:text-white">
                              {order.customer_name || "—"}
                            </p>
                            <p className="mt-1 max-w-48 break-all text-xs text-secondaryColor dark:text-gray-400">
                              {order.customer_email || "—"}
                            </p>
                          </td>

                          <td className="px-5 py-4 font-bold text-mainColor dark:text-white">
                            {order.product_name || "—"}
                          </td>

                          <td className="px-5 py-4 text-secondaryColor dark:text-gray-300">
                            {order.quantity ?? "—"}
                          </td>

                          <td className="px-5 py-4 text-secondaryColor dark:text-gray-300">
                            {formatDate(order.created_at)}
                          </td>

                          <td className="px-5 py-4">
                            <StatusBadge status={order.status} />
                          </td>

                          <td className="px-5 py-4">
                            {order.status === "pending" ? (
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  disabled={actionLoading}
                                  onClick={() =>
                                    openConfirmation(
                                      "approve-order",
                                      order
                                    )
                                  }
                                  className="inline-flex items-center gap-2 rounded-xl bg-mainColor px-4 py-2.5 text-xs font-bold text-white disabled:opacity-50"
                                >
                                  <FaCheck size={12} />
                                  قبول
                                </button>

                                <button
                                  type="button"
                                  disabled={actionLoading}
                                  onClick={() =>
                                    openConfirmation(
                                      "reject-order",
                                      order
                                    )
                                  }
                                  className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2.5 text-xs font-bold text-red-600 disabled:opacity-50 dark:bg-red-950/20 dark:text-red-300"
                                >
                                  <FaTimes size={12} />
                                  رفض
                                </button>
                              </div>
                            ) : (
                              <span className="text-xs font-bold text-secondaryColor dark:text-gray-400">
                                تمت المعالجة
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* ==================================
                PRODUCTS AND STOCK
            ================================== */}

            <section className="rounded-[28px] border border-mainColor/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1D2939] sm:p-8">
              <SectionHeader
                icon={FaBoxOpen}
                title="إدارة المنتجات والمخزون"
                description="تصفح منتجاتك، تابع الكميات والأسعار، وأضف منتجات جديدة."
                action={
                  <button
                    type="button"
                    onClick={() => {
                      setFormError("");
                      addProductModal.onOpen();
                    }}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-mainColor px-5 py-3 text-sm font-extrabold text-white"
                  >
                    <FaPlus size={13} />
                    منتج جديد
                  </button>
                }
              />

              {/* PRODUCT FILTERS */}
              <div className="mb-7 grid gap-4 md:grid-cols-[minmax(0,1fr)_210px]">
                <div className="relative">
                  <FaSearch className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-mainColor/55 dark:text-white/60" />

                  <input
                    type="search"
                    value={productSearch}
                    onChange={(event) =>
                      setProductSearch(event.target.value)
                    }
                    placeholder="ابحث باسم المنتج أو التصنيف..."
                    aria-label="البحث في المنتجات"
                    className="h-13 w-full rounded-2xl border border-mainColor/15 bg-fivethColor py-3 pl-4 pr-12 text-sm font-bold text-mainColor outline-none focus:border-mainColor dark:border-white/10 dark:bg-[#101828] dark:text-white"
                  />
                </div>

                <div className="relative">
                  <FaFilter className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-mainColor/55 dark:text-white/60" />

                  <select
                    value={stockFilter}
                    onChange={(event) =>
                      setStockFilter(event.target.value)
                    }
                    aria-label="تصفية المنتجات حسب المخزون"
                    className="h-13 w-full rounded-2xl border border-mainColor/15 bg-fivethColor py-3 pl-3 pr-11 text-sm font-bold text-mainColor outline-none focus:border-mainColor dark:border-white/10 dark:bg-[#101828] dark:text-white"
                  >
                    <option value="all">جميع المنتجات</option>
                    <option value="available">المتوفرة</option>
                    <option value="unavailable">نافدة الكمية</option>
                  </select>
                </div>
              </div>

              <p className="mb-5 text-xs font-bold text-secondaryColor dark:text-gray-400">
                عرض {filteredProducts.length} من {products.length} منتج
              </p>

              {filteredProducts.length === 0 ? (
                <EmptyState
                  icon={FaBoxOpen}
                  title={
                    products.length === 0
                      ? "لا توجد منتجات حالياً"
                      : "لا توجد منتجات مطابقة"
                  }
                  description={
                    products.length === 0
                      ? "أضف أول منتج لمتجرك حتى يصبح متاحاً للعرض."
                      : "جرّب تغيير البحث أو فلتر المخزون."
                  }
                  action={
                    products.length === 0 ? (
                      <button
                        type="button"
                        onClick={addProductModal.onOpen}
                        className="inline-flex items-center gap-2 rounded-xl bg-mainColor px-5 py-3 text-sm font-bold text-white"
                      >
                        <FaPlus />
                        إضافة أول منتج
                      </button>
                    ) : null
                  }
                />
              ) : (
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      disabled={actionLoading}
                      onDelete={(item) =>
                        openConfirmation(
                          "delete-product",
                          item
                        )
                      }
                    />
                  ))}
                </div>
              )}
            </section>

            {/* BOTTOM LINK */}
            <div className="mt-10 flex flex-wrap items-center justify-between gap-5 rounded-[26px] bg-mainColor p-7 text-white">
              <div>
                <p className="mb-2 flex items-center gap-2 text-xs font-bold text-white/80">
                  <FaPaw />
                  كاجو — لأنهم من عائلتنا
                </p>

                <h2 className="text-lg font-black">
                  إدارة أسهل لمتجرك
                </h2>

                <p className="mt-2 text-sm text-white/80">
                  أضف منتجاتك وتابع طلبات عملائك من لوحة واحدة.
                </p>
              </div>

              <Link
                to="/app/stores"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-xs font-extrabold text-mainColor"
              >
                <FaEye />
                عرض المتاجر
                <FaArrowLeft size={12} />
              </Link>
            </div>
          </>
        )}
      </div>

      {/* ====================================
          ADD PRODUCT MODAL
      ==================================== */}

      <DynamicFormModal
        isOpen={addProductModal.isOpen}
        onClose={() => {
          if (!formSubmitting) {
            setFormError("");
            addProductModal.onClose();
          }
        }}
        title="إضافة منتج للمتجر"
        fields={[
          {
            name: "name",
            placeholder: "اسم المنتج",
          },
          {
            name: "category",
            placeholder: "التصنيف",
          },
          {
            name: "user_price",
            placeholder: "سعر المنتج للمستهلك",
          },
          {
            name: "store_price",
            placeholder: "سعر التكلفة",
          },
          {
            name: "quantity",
            placeholder: "الكمية",
          },
          {
            name: "expiry",
            placeholder: "تاريخ الصلاحية",
            type: "date",
          },
          {
            name: "description",
            placeholder: "وصف المنتج",
          },
          {
            name: "image",
            placeholder: "صورة المنتج",
            type: "file",
            accept: "image/*",
          },
        ]}
        buttonText={
          formSubmitting
            ? "جارٍ إضافة المنتج..."
            : "إضافة المنتج"
        }
        onSubmit={handleCreateProduct}
      />

      {/* FORM ERROR */}
      {addProductModal.isOpen && formError && (
        <div
          role="alert"
          className="fixed bottom-5 left-4 right-4 z-[10000] mx-auto max-w-lg rounded-2xl border border-red-200 bg-red-50 p-4 text-center text-sm font-bold text-red-700 shadow-xl dark:border-red-900/30 dark:bg-[#1D2939] dark:text-red-300"
        >
          {formError}
        </div>
      )}

      {/* ====================================
          CONFIRMATION MODAL
      ==================================== */}

      <Modal
        isOpen={Boolean(confirmation)}
        onClose={closeConfirmation}
        isDismissable={!actionLoading}
        isKeyboardDismissDisabled={actionLoading}
        backdrop="blur"
        placement="center"
        size="md"
        classNames={{
          base:
            "rounded-[28px] border border-mainColor/10 bg-white dark:border-white/10 dark:bg-[#1D2939]",
          closeButton: "text-mainColor dark:text-white",
        }}
      >
        <ModalContent>
          {() => (
            <div dir="rtl">
              <ModalHeader className="flex flex-col items-center gap-4 px-6 pb-0 pt-8 text-center">
                <span
                  className={`flex h-20 w-20 items-center justify-center rounded-3xl ${
                    confirmation?.type === "approve-order"
                      ? "bg-mainColor/10 text-mainColor dark:text-white"
                      : "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-300"
                  }`}
                >
                  {confirmation?.type === "approve-order" ? (
                    <FaCheckCircle size={30} />
                  ) : (
                    <FaExclamationTriangle size={30} />
                  )}
                </span>

                <h2 className="text-xl font-black text-mainColor dark:text-white">
                  {confirmation?.type === "delete-product"
                    ? "تأكيد حذف المنتج"
                    : confirmation?.type === "approve-order"
                    ? "تأكيد قبول الطلب"
                    : "تأكيد رفض الطلب"}
                </h2>
              </ModalHeader>

              <ModalBody className="px-6 pt-5 text-center">
                <p className="text-sm leading-8 text-secondaryColor dark:text-gray-300">
                  {confirmation?.type === "delete-product"
                    ? `هل أنت متأكد من حذف المنتج "${confirmation.item.name || "المنتج"}"؟`
                    : confirmation?.type === "approve-order"
                    ? `هل تريد قبول طلب "${confirmation.item.customer_name || "الزبون"}"؟`
                    : `هل تريد رفض طلب "${confirmation?.item?.customer_name || "الزبون"}"؟`}
                </p>

                {actionError && (
                  <div
                    role="alert"
                    className="rounded-xl border border-red-200 bg-red-50 p-4 text-right text-sm font-bold text-red-700 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-300"
                  >
                    {actionError}
                  </div>
                )}
              </ModalBody>

              <ModalFooter className="flex gap-3 px-6 pb-8 pt-5">
                <Button
                  variant="bordered"
                  onPress={closeConfirmation}
                  isDisabled={actionLoading}
                  className="h-12 flex-1 rounded-xl border-mainColor/15 font-bold text-mainColor dark:border-white/15 dark:text-white"
                >
                  إلغاء
                </Button>

                <Button
                  onPress={handleConfirmAction}
                  isDisabled={actionLoading}
                  className={`h-12 flex-1 rounded-xl font-extrabold text-white ${
                    confirmation?.type === "approve-order"
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
                </Button>
              </ModalFooter>
            </div>
          )}
        </ModalContent>
      </Modal>
    </main>
  );
}
