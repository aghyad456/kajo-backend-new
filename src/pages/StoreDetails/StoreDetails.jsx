
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Link, useParams } from "react-router-dom";

import {
  FaStore,
  FaPaw,
  FaShoppingBag,
  FaShoppingCart,
  FaSearch,
  FaArrowLeft,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaBoxOpen,
  FaCheckCircle,
  FaExclamationTriangle,
  FaSyncAlt,
  FaSpinner,
  FaTimes,
  FaHeart,
  FaFilter,
} from "react-icons/fa";

import DynamicFormModal from "../../components/modals/DynamicFormModal";
import { api } from "../../api/apiClient";
import fallbackProduct from "../../assets/product1.svg";

// ==========================================
// HELPERS
// ==========================================

function normalizeStore(response) {
  return (
    response?.store ??
    response?.data?.store ??
    response?.data ??
    response ??
    null
  );
}

function normalizeProducts(response) {
  const candidates = [
    response?.products,
    response?.data?.products,
    response?.data,
    response,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;
    if (Array.isArray(candidate?.data)) return candidate.data;
  }

  return [];
}

function getErrorMessage(error, fallback) {
  const validationErrors = error?.data?.errors;

  if (validationErrors) {
    const first = Object.values(validationErrors)
      .flat()
      .find(Boolean);

    if (first) return String(first);
  }

  return error?.data?.message || error?.message || fallback;
}

function getStock(product) {
  const quantity = Number(product?.quantity);

  if (!Number.isFinite(quantity)) return 0;

  return Math.max(0, Math.floor(quantity));
}

function formatPrice(value) {
  if (value === null || value === undefined || value === "") {
    return "السعر غير محدد";
  }

  const number = Number(value);

  if (!Number.isFinite(number) || number < 0) {
    return "السعر غير محدد";
  }

  return `${new Intl.NumberFormat("ar-SY", {
    maximumFractionDigits: 2,
  }).format(number)} ل.س`;
}

// ==========================================
// PRODUCT CARD
// ==========================================

function ProductCard({ product, onOrder }) {
  const [imageFailed, setImageFailed] = useState(false);

  const stock = getStock(product);
  const available = stock > 0;

  const imageSrc =
    product.image_url && !imageFailed
      ? product.image_url
      : fallbackProduct;

  return (
    <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-[28px] border border-mainColor/10 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-mainColor/25 hover:shadow-xl dark:border-white/10 dark:bg-[#1D2939]">
      {/* PRODUCT IMAGE */}
      <div className="relative aspect-[4/3] overflow-hidden bg-mainColor/5 dark:bg-white/5">
        <img
          src={imageSrc}
          alt={product.name || "صورة المنتج"}
          loading="lazy"
          onError={() => setImageFailed(true)}
          className="h-full w-full object-contain p-5 transition-transform duration-500 group-hover:scale-105"
        />

        <span
          className={[
            "absolute right-4 top-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-extrabold shadow-sm",
            available
              ? "bg-white/95 text-mainColor"
              : "bg-red-50 text-red-600",
          ].join(" ")}
        >
          {available ? (
            <FaCheckCircle size={12} />
          ) : (
            <FaTimes size={12} />
          )}
          {available ? "متوفر" : "غير متوفر"}
        </span>
      </div>

      {/* PRODUCT INFO */}
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="mb-5">
          <span className="mb-3 inline-flex items-center gap-2 text-xs font-bold text-secondaryColor dark:text-gray-400">
            <FaPaw size={12} />
            منتجات الحيوانات الأليفة
          </span>

          <h3 className="break-words text-xl font-black leading-snug text-mainColor dark:text-white">
            {product.name || "منتج"}
          </h3>
        </div>

        {/* STOCK */}
        <div className="mb-5 flex items-center justify-between gap-3 rounded-2xl bg-mainColor/5 px-4 py-3 dark:bg-white/5">
          <div className="flex items-center gap-2 text-sm font-bold text-mainColor dark:text-white">
            <FaBoxOpen className="text-secondaryColor" />
            الكمية المتوفرة
          </div>

          <span className="text-sm font-black text-mainColor dark:text-white">
            {stock}
          </span>
        </div>

        {/* PRICE AND ORDER */}
        <div className="mt-auto border-t border-mainColor/10 pt-5 dark:border-white/10">
          <p className="mb-2 text-xs font-bold text-secondaryColor dark:text-gray-400">
            سعر المنتج
          </p>

          <p className="mb-5 text-2xl font-black text-mainColor dark:text-white">
            {formatPrice(product.user_price)}
          </p>

          <button
            type="button"
            onClick={() => onOrder(product)}
            disabled={!available || product.id == null}
            className="flex min-h-13 w-full items-center justify-center gap-3 rounded-2xl bg-mainColor px-5 py-3.5 text-sm font-extrabold text-white shadow-md transition-all hover:-translate-y-0.5 hover:opacity-90 disabled:cursor-not-allowed disabled:bg-mainColor/35 disabled:shadow-none disabled:hover:translate-y-0"
          >
            <FaShoppingCart size={16} />
            {available ? "اطلب المنتج الآن" : "نفدت الكمية"}
            {available && <FaArrowLeft size={12} />}
          </button>
        </div>
      </div>
    </article>
  );
}

// ==========================================
// LOADING SKELETON
// ==========================================

function ProductSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="animate-pulse overflow-hidden rounded-[28px] border border-mainColor/10 bg-white dark:border-white/10 dark:bg-[#1D2939]"
    >
      <div className="aspect-[4/3] bg-mainColor/10 dark:bg-white/10" />

      <div className="space-y-5 p-6">
        <div className="h-5 w-2/3 rounded-lg bg-mainColor/10 dark:bg-white/10" />
        <div className="h-14 rounded-xl bg-mainColor/5 dark:bg-white/5" />
        <div className="h-7 w-1/2 rounded-lg bg-mainColor/10 dark:bg-white/10" />
        <div className="h-13 rounded-2xl bg-mainColor/10 dark:bg-white/10" />
      </div>
    </div>
  );
}

// ==========================================
// STORE DETAILS
// ==========================================

export default function StoreDetails() {
  const { id } = useParams();

  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState(null);

  const [query, setQuery] = useState("");
  const [availabilityFilter, setAvailabilityFilter] =
    useState("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [ordering, setOrdering] = useState(false);
  const [orderError, setOrderError] = useState("");

  const requestRef = useRef(0);
  const submittingRef = useRef(false);

  // ======================================
  // FETCH STORE DATA
  // ======================================

  const loadStore = useCallback(
    async (silent = false) => {
      const requestId = ++requestRef.current;

      setError("");

      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
        setStore(null);
        setProducts([]);
      }

      if (!id) {
        setError("رابط المتجر غير صالح.");
        setLoading(false);
        setRefreshing(false);
        return;
      }

      try {
        const [storeResponse, productsResponse] =
          await Promise.all([
            api.storeDetails(id),
            api.storeProductsPublic(id),
          ]);

        if (requestId !== requestRef.current) return;

        const storeData = normalizeStore(storeResponse);

        if (
          !storeData ||
          typeof storeData !== "object" ||
          Array.isArray(storeData)
        ) {
          throw new Error("تعذر العثور على بيانات المتجر.");
        }

        setStore(storeData);
        setProducts(normalizeProducts(productsResponse));
      } catch (err) {
        if (requestId !== requestRef.current) return;

        setError(
          getErrorMessage(err, "تعذر تحميل بيانات المتجر.")
        );
      } finally {
        if (requestId === requestRef.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [id]
  );

  useEffect(() => {
    loadStore();

    return () => {
      requestRef.current += 1;
    };
  }, [loadStore]);

  // ======================================
  // FILTER PRODUCTS
  // ======================================

  const filteredProducts = useMemo(() => {
    const search = query.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !search ||
        [
          product.name,
          product.description,
          product.category,
        ].some((value) =>
          String(value ?? "").toLowerCase().includes(search)
        );

      const matchesAvailability =
        availabilityFilter === "all" ||
        (availabilityFilter === "available"
          ? getStock(product) > 0
          : getStock(product) === 0);

      return matchesSearch && matchesAvailability;
    });
  }, [products, query, availabilityFilter]);

  const availableCount = useMemo(
    () => products.filter((item) => getStock(item) > 0).length,
    [products]
  );

  // ======================================
  // ORDER MODAL
  // ======================================

  const openOrderModal = (product) => {
    if (!product?.id || getStock(product) <= 0) return;

    setSelectedProduct(product);
    setOrderError("");
    setFeedback(null);
    setIsModalOpen(true);
  };

  const closeOrderModal = () => {
    if (submittingRef.current) return;

    setIsModalOpen(false);
    setSelectedProduct(null);
    setOrderError("");
  };

  const submitOrder = async (data) => {
    if (submittingRef.current) return;

    const product = selectedProduct;

    if (!product?.id) {
      setOrderError("المنتج المختار غير صالح.");
      return;
    }

    const rawQuantity = String(data.quantity ?? "").trim();
    const quantity = Number(rawQuantity);
    const stock = getStock(product);

    if (
      !rawQuantity ||
      !Number.isSafeInteger(quantity) ||
      quantity < 1
    ) {
      setOrderError("يرجى إدخال كمية صحيحة أكبر من صفر.");
      return;
    }

    if (quantity > stock) {
      setOrderError(
        `الكمية المطلوبة تتجاوز المخزون المعروض (${stock}).`
      );
      return;
    }

    submittingRef.current = true;
    setOrdering(true);
    setOrderError("");
    setFeedback(null);

    try {
      await api.createStoreOrder(product.id, {
        quantity,
        notes: data.notes?.trim() || null,
      });

      setIsModalOpen(false);
      setSelectedProduct(null);

      setFeedback({
        type: "success",
        message:
          "تم إرسال طلبك بنجاح! يمكنك متابعة حالته من صفحة نشاطاتي.",
      });

      // Refresh stock without hiding the page.
      await loadStore(true);
    } catch (err) {
      const message = getErrorMessage(
        err,
        "تعذر إرسال الطلب. يرجى المحاولة مجدداً."
      );

      setOrderError(message);
      setFeedback({
        type: "error",
        message,
      });
    } finally {
      submittingRef.current = false;
      setOrdering(false);
    }
  };

  // ======================================
  // RENDER
  // ======================================

  return (
    <main
      dir="rtl"
      className="relative min-h-screen overflow-hidden bg-fivethColor pb-20 text-mainColor transition-colors duration-500 dark:bg-[#101828]"
    >
      {/* BACKGROUND */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -right-48 -top-48 h-[480px] w-[480px] rounded-full bg-mainColor/5 blur-[110px]" />

        <div className="absolute -bottom-48 -left-40 h-[460px] w-[460px] rounded-full bg-secondaryColor/10 blur-[110px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">

        {/* BREADCRUMB */}
        <nav
          aria-label="مسار التنقل"
          className="mb-7 flex flex-wrap items-center gap-2 text-sm font-bold"
        >
          <Link
            to="/app/stores"
            className="text-secondaryColor transition-colors hover:text-mainColor dark:text-gray-300"
          >
            المتاجر
          </Link>

          <FaArrowLeft
            size={11}
            className="text-secondaryColor/60"
          />

          <span
            aria-current="page"
            className="text-mainColor dark:text-white"
          >
            تفاصيل المتجر
          </span>
        </nav>

        {/* ======================================
            STORE HERO
        ====================================== */}

        <header className="relative mb-8 overflow-hidden rounded-[32px] bg-mainColor px-6 py-10 text-white shadow-xl sm:px-9 sm:py-12 lg:px-12">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 overflow-hidden"
          >
            <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full border-[50px] border-white/10" />

            <div className="absolute -bottom-28 right-1/3 h-60 w-60 rounded-full bg-secondaryColor/15 blur-3xl" />
          </div>

          <div className="relative flex flex-wrap items-center justify-between gap-8">
            <div className="max-w-2xl">
              <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-extrabold">
                <FaPaw size={13} />
                متاجر كاجو
              </span>

              <h1 className="mb-4 break-words text-3xl font-black leading-snug sm:text-4xl lg:text-5xl">
                {loading
                  ? "جارٍ تحميل المتجر..."
                  : store?.name || "تفاصيل المتجر"}
              </h1>

              {store?.specialty && (
                <p className="mb-4 text-base font-bold text-fourthColor sm:text-lg">
                  {store.specialty}
                </p>
              )}

              <p className="max-w-xl text-sm leading-8 text-white/85 sm:text-base">
                اكتشف المنتجات المتوفرة في هذا المتجر
                واختر مستلزمات أليفك وقدّم طلبك بكل سهولة.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <a
                  href="#products"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-extrabold text-mainColor"
                >
                  <FaShoppingBag />
                  استكشف المنتجات
                </a>

                <Link
                  to="/app/my-activities"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-extrabold text-white"
                >
                  <FaBoxOpen />
                  طلباتي
                </Link>
              </div>
            </div>

            <div className="hidden h-48 w-48 shrink-0 items-center justify-center rounded-[48px] border border-white/20 bg-white/10 lg:flex">
              <FaStore size={80} />
            </div>
          </div>
        </header>

        {/* ======================================
            ALERTS
        ====================================== */}

        {(error || feedback) && (
          <div
            role="alert"
            aria-live="polite"
            className={[
              "mb-7 flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-5",
              error || feedback?.type === "error"
                ? "border-red-200 bg-red-50 text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300"
                : "border-mainColor/20 bg-mainColor/10 text-mainColor dark:text-white",
            ].join(" ")}
          >
            <div className="flex items-start gap-3">
              {error || feedback?.type === "error" ? (
                <FaExclamationTriangle className="mt-1 shrink-0" />
              ) : (
                <FaCheckCircle className="mt-1 shrink-0" />
              )}

              <p className="text-sm font-bold leading-7">
                {error || feedback?.message}
              </p>
            </div>

            {error && (
              <button
                type="button"
                onClick={() => loadStore(true)}
                disabled={loading || refreshing}
                className="rounded-xl bg-mainColor px-5 py-2 text-xs font-bold text-white disabled:opacity-50"
              >
                إعادة المحاولة
              </button>
            )}
          </div>
        )}

        {/* ======================================
            LOADING
        ====================================== */}

        {loading ? (
          <div
            role="status"
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            aria-label="جارٍ تحميل المنتجات"
          >
            <ProductSkeleton />
            <ProductSkeleton />
            <ProductSkeleton />
            <ProductSkeleton />
          </div>
        ) : (
          <>
            {/* ==================================
                STORE SUMMARY
            ================================== */}

            {store && (
              <div className="mb-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="flex items-center gap-4 rounded-[24px] border border-mainColor/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1D2939]">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-mainColor/10 text-mainColor dark:text-white">
                    <FaShoppingBag size={22} />
                  </span>

                  <div>
                    <p className="text-xs text-secondaryColor dark:text-gray-400">
                      عدد المنتجات المعروضة
                    </p>
                    <p className="mt-1 text-2xl font-black text-mainColor dark:text-white">
                      {products.length}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-[24px] border border-mainColor/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1D2939]">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-mainColor/10 text-mainColor dark:text-white">
                    <FaBoxOpen size={22} />
                  </span>

                  <div>
                    <p className="text-xs text-secondaryColor dark:text-gray-400">
                      المنتجات المتوفرة
                    </p>
                    <p className="mt-1 text-2xl font-black text-mainColor dark:text-white">
                      {availableCount}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-[24px] border border-mainColor/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1D2939] sm:col-span-2 lg:col-span-1">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-mainColor/10 text-mainColor dark:text-white">
                    <FaStore size={21} />
                  </span>

                  <div className="min-w-0">
                    <p className="text-xs text-secondaryColor dark:text-gray-400">
                      اسم المتجر
                    </p>
                    <p className="mt-1 truncate text-sm font-black text-mainColor dark:text-white">
                      {store.name || "—"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ==================================
                PRODUCTS SECTION
            ================================== */}

            <section id="products" className="scroll-mt-24">
              <div className="mb-7 flex flex-wrap items-end justify-between gap-5">
                <div>
                  <span className="mb-3 inline-flex items-center gap-2 text-xs font-extrabold text-secondaryColor">
                    <FaPaw />
                    كل ما يحتاجه أليفك
                  </span>

                  <h2 className="text-2xl font-black text-mainColor dark:text-white sm:text-3xl">
                    منتجات المتجر
                  </h2>

                  <p className="mt-3 text-sm leading-7 text-secondaryColor dark:text-gray-400">
                    تصفّح المنتجات واختر الكمية المناسبة لطلبك.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => loadStore(true)}
                  disabled={refreshing}
                  className="inline-flex h-12 items-center gap-2 rounded-xl border border-mainColor/15 bg-white px-5 text-sm font-bold text-mainColor transition hover:bg-mainColor/5 disabled:opacity-50 dark:border-white/10 dark:bg-[#1D2939] dark:text-white"
                >
                  {refreshing ? (
                    <FaSpinner className="animate-spin" />
                  ) : (
                    <FaSyncAlt />
                  )}
                  تحديث المنتجات
                </button>
              </div>

              {/* SEARCH */}
              <div className="mb-8 rounded-[26px] border border-mainColor/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1D2939] sm:p-6">
                <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
                  <div className="relative">
                    <FaSearch className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-mainColor/60 dark:text-white/60" />

                    <input
                      type="search"
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="ابحث عن منتج..."
                      aria-label="البحث في المنتجات"
                      className="h-14 w-full rounded-2xl border border-mainColor/15 bg-fivethColor py-3 pl-12 pr-12 text-sm font-bold text-mainColor outline-none focus:border-mainColor dark:border-white/10 dark:bg-[#101828] dark:text-white"
                    />

                    {query && (
                      <button
                        type="button"
                        onClick={() => setQuery("")}
                        aria-label="مسح البحث"
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-mainColor/60 dark:text-white/70"
                      >
                        <FaTimes />
                      </button>
                    )}
                  </div>

                  <div className="relative">
                    <FaFilter className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-mainColor/60 dark:text-white/60" />

                    <select
                      value={availabilityFilter}
                      onChange={(event) =>
                        setAvailabilityFilter(event.target.value)
                      }
                      aria-label="تصفية المنتجات حسب التوفر"
                      className="h-14 w-full rounded-2xl border border-mainColor/15 bg-fivethColor py-3 pl-4 pr-11 text-sm font-bold text-mainColor outline-none focus:border-mainColor dark:border-white/10 dark:bg-[#101828] dark:text-white"
                    >
                      <option value="all">جميع المنتجات</option>
                      <option value="available">المتوفرة فقط</option>
                      <option value="unavailable">غير المتوفرة</option>
                    </select>
                  </div>
                </div>

                <p className="mt-4 text-xs font-bold text-secondaryColor dark:text-gray-400">
                  عرض {filteredProducts.length} من {products.length} منتج
                </p>
              </div>

              {/* PRODUCTS */}
              {filteredProducts.length > 0 ? (
                <div className="grid items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onOrder={openOrderModal}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-[28px] border border-mainColor/10 bg-white px-6 py-14 text-center dark:border-white/10 dark:bg-[#1D2939]">
                  <span className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-mainColor/10 text-mainColor dark:text-white">
                    <FaShoppingBag size={35} />
                  </span>

                  <h3 className="mb-3 text-xl font-black text-mainColor dark:text-white">
                    {products.length === 0
                      ? "لا توجد منتجات حالياً"
                      : "لم نجد منتجات مطابقة"}
                  </h3>

                  <p className="mx-auto max-w-md text-sm leading-8 text-secondaryColor dark:text-gray-400">
                    {products.length === 0
                      ? "لم يضف المتجر منتجات للعرض بعد. يمكنك العودة لاحقاً."
                      : "جرّب تغيير كلمة البحث أو فلتر التوفر."}
                  </p>

                  {products.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setQuery("");
                        setAvailabilityFilter("all");
                      }}
                      className="mt-6 rounded-xl bg-mainColor px-6 py-3 text-sm font-bold text-white"
                    >
                      عرض جميع المنتجات
                    </button>
                  )}
                </div>
              )}
            </section>

            {/* ==================================
                BOTTOM BANNER
            ================================== */}

            <section className="mt-14 flex flex-wrap items-center justify-between gap-6 rounded-[28px] bg-mainColor p-7 text-white shadow-xl sm:p-9">
              <div className="max-w-xl">
                <span className="mb-3 inline-flex items-center gap-2 text-sm font-bold text-white/80">
                  <FaHeart />
                  كاجو — لأنهم من عائلتنا
                </span>

                <h2 className="mb-3 text-xl font-black sm:text-2xl">
                  كل مستلزمات أليفك بمكان واحد
                </h2>

                <p className="text-sm leading-8 text-white/85">
                  استكشف المتاجر الأخرى وتعرّف على المزيد من
                  المنتجات المتاحة في كاجو.
                </p>
              </div>

              <Link
                to="/app/stores"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-extrabold text-mainColor"
              >
                استكشف المتاجر
                <FaArrowLeft size={13} />
              </Link>
            </section>
          </>
        )}
      </div>

      {/* ======================================
          ORDER MODAL
      ====================================== */}

      <DynamicFormModal
        isOpen={isModalOpen}
        onClose={closeOrderModal}
        title={`طلب المنتج: ${selectedProduct?.name || ""}`}
        fields={[
          {
            name: "quantity",
            placeholder: "الكمية المطلوبة",
            type: "number",
          },
          {
            name: "notes",
            placeholder: "ملاحظات الطلب (اختياري)",
          },
        ]}
        buttonText={
          ordering ? "جارٍ إرسال الطلب..." : "إرسال الطلب"
        }
        onSubmit={submitOrder}
      />

      {isModalOpen && orderError && (
        <div
          role="alert"
          aria-live="assertive"
          className="fixed bottom-5 left-4 right-4 z-[10000] mx-auto max-w-lg rounded-2xl border border-red-200 bg-red-50 p-4 text-center text-sm font-bold text-red-700 shadow-2xl dark:border-red-900 dark:bg-[#1D2939] dark:text-red-300"
        >
          {orderError}
        </div>
      )}
    </main>
  );
}
