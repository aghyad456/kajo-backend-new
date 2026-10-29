
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { Button, useDisclosure } from "@heroui/react";
import { Link, useParams } from "react-router-dom";

import {
  FaPaw,
  FaHeart,
  FaMapMarkerAlt,
  FaArrowLeft,
  FaPhoneAlt,
  FaCat,
  FaVenusMars,
  FaBirthdayCake,
  FaHeartbeat,
  FaSyringe,
  FaInfoCircle,
  FaHandHoldingHeart,
  FaBoxOpen,
  FaCalendarAlt,
  FaExclamationTriangle,
  FaSyncAlt,
  FaSpinner,
  FaCheckCircle,
  FaHome,
} from "react-icons/fa";

import DynamicFormModal from "../../components/modals/DynamicFormModal";
import { api } from "../../api/apiClient";
import fallbackAnimal from "../../assets/cat2.svg";

// ==========================================
// HELPERS
// ==========================================

function unwrapArray(response, key) {
  const candidates = [
    response?.[key],
    response?.data?.[key],
    response?.data,
    response,
  ];

  for (const item of candidates) {
    if (Array.isArray(item)) return item;
    if (Array.isArray(item?.data)) return item.data;
  }

  return [];
}

function extractShelter(response) {
  return (
    response?.shelter ??
    response?.data?.shelter ??
    response?.data ??
    response ??
    null
  );
}

function getErrorMessage(error, fallback) {
  return (
    error?.data?.errors &&
    Object.values(error.data.errors).flat()[0]
  ) || error?.data?.message || error?.message || fallback;
}

function DetailRow({ icon: Icon, label, value }) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  return (
    <div className="flex min-w-0 items-start gap-3">
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-mainColor/10 text-mainColor dark:text-white">
        <Icon size={15} />
      </span>

      <div className="min-w-0">
        <p className="text-xs text-secondaryColor dark:text-gray-400">
          {label}
        </p>
        <p className="mt-1 break-words text-sm font-bold text-mainColor dark:text-white">
          {value}
        </p>
      </div>
    </div>
  );
}

function SectionHeading({ icon: Icon, eyebrow, title, description, count }) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div>
        <div className="mb-3 inline-flex items-center gap-2 text-xs font-extrabold text-secondaryColor">
          <Icon size={14} />
          {eyebrow}
        </div>

        <h2 className="text-2xl font-black text-mainColor dark:text-white sm:text-3xl">
          {title}
        </h2>

        <p className="mt-3 max-w-xl text-sm leading-7 text-secondaryColor dark:text-gray-400">
          {description}
        </p>
      </div>

      {count !== undefined && (
        <span className="rounded-full border border-mainColor/10 bg-mainColor/5 px-4 py-2 text-xs font-extrabold text-mainColor dark:border-white/10 dark:bg-white/10 dark:text-white">
          {count} متاح
        </span>
      )}
    </div>
  );
}

function AnimalCard({ animal, onAdopt }) {
  const [imageFailed, setImageFailed] = useState(false);

  const imageUrl =
    !imageFailed && animal.image_url
      ? animal.image_url
      : fallbackAnimal;

  return (
    <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-[28px] border border-mainColor/10 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-mainColor/20 hover:shadow-xl dark:border-white/10 dark:bg-[#1D2939]">
      {/* IMAGE */}
      <div className="relative aspect-[5/4] overflow-hidden bg-mainColor/5">
        <img
          src={imageUrl}
          alt={animal.name || "حيوان للتبنّي"}
          loading="lazy"
          onError={() => setImageFailed(true)}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <span className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-xs font-black text-mainColor shadow-md">
          <FaPaw size={12} />
          للتبنّي
        </span>
      </div>

      {/* CONTENT */}
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="mb-5">
          <h3 className="text-2xl font-black text-mainColor dark:text-white">
            {animal.name || "صديق جديد"}
          </h3>

          {animal.type && (
            <p className="mt-2 text-sm font-bold text-secondaryColor dark:text-gray-300">
              {animal.type}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 border-y border-mainColor/10 py-5 dark:border-white/10">
          <DetailRow
            icon={FaBirthdayCake}
            label="العمر"
            value={animal.age}
          />

          <DetailRow
            icon={FaVenusMars}
            label="الجنس"
            value={animal.gender}
          />

          <DetailRow
            icon={FaHeartbeat}
            label="الحالة الصحية"
            value={animal.health_status}
          />

          <DetailRow
            icon={FaSyringe}
            label="اللقاحات"
            value={animal.vaccines}
          />
        </div>

        {animal.note && (
          <div className="mt-5 rounded-2xl bg-mainColor/5 p-4 dark:bg-white/5">
            <p className="mb-2 flex items-center gap-2 text-xs font-extrabold text-mainColor dark:text-white">
              <FaInfoCircle />
              معلومات إضافية
            </p>

            <p className="whitespace-pre-wrap break-words text-sm leading-7 text-secondaryColor dark:text-gray-300">
              {animal.note}
            </p>
          </div>
        )}

        <div className="mt-auto pt-6">
          <Button
            onPress={() => onAdopt(animal)}
            className="h-13 w-full rounded-2xl bg-mainColor text-sm font-black text-white shadow-md transition-transform hover:-translate-y-0.5"
            startContent={<FaHeart size={16} />}
          >
            طلب تبنّي {animal.name || ""}
          </Button>
        </div>
      </div>
    </article>
  );
}

function DonationCard({ request, onDonate }) {
  const priority = String(request.priority || "").toLowerCase();

  const isHighPriority = [
    "high",
    "urgent",
    "عالية",
    "عاجل",
    "مرتفعة",
  ].includes(priority);

  return (
    <article className="flex h-full flex-col rounded-[26px] border border-mainColor/10 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-white/10 dark:bg-[#1D2939] sm:p-6">
      <div className="mb-5 flex items-start justify-between gap-3">
        <span className="flex h-13 w-13 items-center justify-center rounded-2xl bg-mainColor/10 p-3 text-mainColor dark:text-white">
          <FaBoxOpen size={23} />
        </span>

        {request.priority && (
          <span
            className={[
              "rounded-full px-3 py-2 text-xs font-extrabold",
              isHighPriority
                ? "bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-300"
                : "bg-secondaryColor/10 text-secondaryColor",
            ].join(" ")}
          >
            الأولوية: {request.priority}
          </span>
        )}
      </div>

      <h3 className="mb-5 break-words text-lg font-black text-mainColor dark:text-white">
        {request.item || "مستلزم للملجأ"}
      </h3>

      <div className="mb-6 space-y-4">
        <DetailRow
          icon={FaBoxOpen}
          label="الكمية المطلوبة"
          value={request.quantity}
        />

        <DetailRow
          icon={FaCalendarAlt}
          label="التاريخ"
          value={request.date}
        />
      </div>

      <div className="mt-auto border-t border-mainColor/10 pt-5 dark:border-white/10">
        <Button
          onPress={() => onDonate(request)}
          className="h-12 w-full rounded-xl bg-mainColor text-sm font-extrabold text-white"
          startContent={<FaHandHoldingHeart size={17} />}
        >
          المساهمة بالتبرع
        </Button>
      </div>
    </article>
  );
}

function PageSkeleton() {
  return (
    <div
      role="status"
      className="animate-pulse space-y-8"
      aria-label="جارٍ تحميل الملجأ"
    >
      <div className="h-64 rounded-[30px] bg-mainColor/10 dark:bg-white/10" />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="overflow-hidden rounded-[26px] bg-white dark:bg-[#1D2939]"
          >
            <div className="h-52 bg-mainColor/10 dark:bg-white/10" />
            <div className="space-y-4 p-6">
              <div className="h-5 w-1/2 rounded bg-mainColor/10 dark:bg-white/10" />
              <div className="h-4 w-4/5 rounded bg-mainColor/10 dark:bg-white/10" />
              <div className="h-12 rounded-xl bg-mainColor/10 dark:bg-white/10" />
            </div>
          </div>
        ))}
      </div>
      <span className="sr-only">جارٍ تحميل البيانات...</span>
    </div>
  );
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function ShelterDetails() {
  const { id } = useParams();

  const adoptModal = useDisclosure();
  const donateModal = useDisclosure();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState(null);

  const [shelter, setShelter] = useState(null);
  const [animals, setAnimals] = useState([]);
  const [donationRequests, setDonationRequests] = useState([]);

  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [selectedDonationRequest, setSelectedDonationRequest] =
    useState(null);

  const requestRef = useRef(0);
  const submittingRef = useRef(false);

  const loadData = useCallback(
    async (silent = false) => {
      const requestId = ++requestRef.current;

      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
        setShelter(null);
        setAnimals([]);
        setDonationRequests([]);
      }

      setError("");

      if (!id) {
        setError("رابط الملجأ غير صالح.");
        setLoading(false);
        setRefreshing(false);
        return;
      }

      try {
        const [shelterRes, animalsRes, donationsRes] =
          await Promise.all([
            api.shelterDetails(id),
            api.shelterAnimalsPublic(id),
            api.shelterDonationRequestsPublic(id),
          ]);

        if (requestId !== requestRef.current) return;

        const shelterData = extractShelter(shelterRes);

        if (
          !shelterData ||
          typeof shelterData !== "object" ||
          Array.isArray(shelterData)
        ) {
          throw new Error("بيانات الملجأ غير متاحة.");
        }

        setShelter(shelterData);
        setAnimals(unwrapArray(animalsRes, "animals"));
        setDonationRequests(
          unwrapArray(donationsRes, "donation_requests")
        );
      } catch (err) {
        if (requestId !== requestRef.current) return;

        setError(
          getErrorMessage(err, "تعذر تحميل بيانات الملجأ.")
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
    loadData();

    return () => {
      requestRef.current += 1;
    };
  }, [loadData]);

  const openAdoption = (animal) => {
    setFeedback(null);
    setSelectedAnimal(animal);
    adoptModal.onOpen();
  };

  const openDonation = (request) => {
    setFeedback(null);
    setSelectedDonationRequest(request);
    donateModal.onOpen();
  };

  const closeAdoption = () => {
    adoptModal.onClose();
    setSelectedAnimal(null);
  };

  const closeDonation = () => {
    donateModal.onClose();
    setSelectedDonationRequest(null);
  };

  // ======================================
  // ADOPTION REQUEST
  // ======================================

  const submitAdoption = async (data) => {
    if (submittingRef.current) return;

    if (!selectedAnimal?.id) {
      setFeedback({
        type: "error",
        message: "يرجى اختيار حيوان صالح للتبنّي.",
      });
      return;
    }

    submittingRef.current = true;
    setFeedback(null);

    try {
      const adoptedBefore = [
        "نعم",
        "yes",
        "true",
        "1",
      ].includes(
        String(data.has_adopted_before || "")
          .trim()
          .toLowerCase()
      );

      await api.createShelterAdoptionRequest(
        selectedAnimal.id,
        {
          phone: data.phone || "",
          has_adopted_before: adoptedBefore,
          delivery_date: data.delivery_date || null,
          note: data.note || null,
        }
      );

      closeAdoption();

      setFeedback({
        type: "success",
        message:
          "تم إرسال طلب التبنّي بنجاح. يمكنك متابعة حالته من صفحة نشاطاتي.",
      });

      await loadData(true);
    } catch (err) {
      setFeedback({
        type: "error",
        message: getErrorMessage(
          err,
          "تعذر إرسال طلب التبنّي."
        ),
      });
    } finally {
      submittingRef.current = false;
    }
  };

  // ======================================
  // DONATION REQUEST
  // ======================================

  const submitDonation = async (data) => {
    if (submittingRef.current) return;

    if (!selectedDonationRequest?.id) {
      setFeedback({
        type: "error",
        message: "يرجى اختيار طلب تبرع صالح.",
      });
      return;
    }

    submittingRef.current = true;
    setFeedback(null);

    try {
      await api.createShelterDonationSubmission(
        selectedDonationRequest.id,
        {
          donor_name: data.donor_name || "",
          phone: data.phone || "",
          donation_type: data.donation_type || "",
          amount_or_item: data.amount_or_item || "",
          note: data.note || "",
        }
      );

      closeDonation();

      setFeedback({
        type: "success",
        message:
          "تم إرسال طلب التبرع بنجاح. شكراً لمساهمتك في رعاية الحيوانات!",
      });

      await loadData(true);
    } catch (err) {
      setFeedback({
        type: "error",
        message: getErrorMessage(
          err,
          "تعذر إرسال طلب التبرع."
        ),
      });
    } finally {
      submittingRef.current = false;
    }
  };

  const animalCount = animals.length;
  const donationCount = donationRequests.length;

  return (
    <main
      dir="rtl"
      className="relative min-h-screen overflow-hidden bg-fivethColor text-mainColor transition-colors duration-500 dark:bg-[#101828]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -right-44 -top-44 h-[480px] w-[480px] rounded-full bg-mainColor/5 blur-[110px]" />
        <div className="absolute -bottom-40 -left-40 h-[450px] w-[450px] rounded-full bg-secondaryColor/10 blur-[110px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
        {/* BREADCRUMB */}
        <nav
          aria-label="مسار التنقل"
          className="mb-7 flex flex-wrap items-center gap-2 text-sm font-bold"
        >
          <Link
            to="/app/shelters"
            className="text-secondaryColor hover:text-mainColor dark:text-gray-300"
          >
            الملاجئ
          </Link>

          <FaArrowLeft
            size={11}
            className="text-secondaryColor/60"
          />

          <span
            aria-current="page"
            className="text-mainColor dark:text-white"
          >
            تفاصيل الملجأ
          </span>
        </nav>

        {loading ? (
          <PageSkeleton />
        ) : (
          <>
            {/* HERO */}
            <header className="relative mb-9 overflow-hidden rounded-[32px] bg-mainColor px-6 py-10 text-white shadow-xl sm:px-9 sm:py-12 lg:px-12">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 overflow-hidden"
              >
                <div className="absolute -left-20 -top-24 h-72 w-72 rounded-full border-[48px] border-white/10" />
                <div className="absolute -bottom-28 right-1/3 h-60 w-60 rounded-full bg-secondaryColor/10 blur-3xl" />
              </div>

              <div className="relative flex flex-wrap items-center justify-between gap-7">
                <div className="max-w-2xl">
                  <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-extrabold">
                    <FaPaw size={14} />
                    مجتمع الرعاية والتبنّي
                  </span>

                  <h1 className="mb-4 text-3xl font-black leading-snug sm:text-4xl lg:text-5xl">
                    {shelter?.name || "تفاصيل الملجأ"}
                  </h1>

                  {shelter?.location && (
                    <p className="mb-4 flex items-center gap-2 text-sm font-bold text-white/90 sm:text-base">
                      <FaMapMarkerAlt />
                      {shelter.location}
                    </p>
                  )}

                  <p className="max-w-xl text-sm leading-8 text-white/85 sm:text-base">
                    تعرّف على الحيوانات الموجودة في الملجأ،
                    واكتشف فرص التبنّي وطرق المساهمة
                    في احتياجاته.
                  </p>

                  <div className="mt-7 flex flex-wrap gap-3">
                    <a
                      href="#animals"
                      className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-extrabold text-mainColor"
                    >
                      <FaHeart size={15} />
                      الحيوانات للتبنّي
                    </a>

                    <a
                      href="#donations"
                      className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-extrabold text-white"
                    >
                      <FaHandHoldingHeart size={16} />
                      احتياجات الملجأ
                    </a>
                  </div>
                </div>

                <div className="hidden h-48 w-48 items-center justify-center rounded-[48px] border border-white/20 bg-white/10 lg:flex">
                  <FaPaw size={88} />
                </div>
              </div>
            </header>

            {/* ALERT */}
            {(error || feedback) && (
              <div
                role="status"
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
                    onClick={() => loadData(true)}
                    disabled={refreshing}
                    className="rounded-xl bg-mainColor px-5 py-2.5 text-xs font-bold text-white disabled:opacity-60"
                  >
                    إعادة المحاولة
                  </button>
                )}
              </div>
            )}

            {/* QUICK SUMMARY */}
            {shelter && (
              <div className="mb-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="flex items-center gap-4 rounded-[24px] border border-mainColor/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1D2939]">
                  <span className="flex h-13 w-13 items-center justify-center rounded-2xl bg-mainColor/10 p-3 text-mainColor dark:text-white">
                    <FaCat size={23} />
                  </span>
                  <div>
                    <p className="text-xs text-secondaryColor dark:text-gray-400">
                      الحيوانات المعروضة
                    </p>
                    <p className="mt-1 text-2xl font-black text-mainColor dark:text-white">
                      {animalCount}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-[24px] border border-mainColor/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1D2939]">
                  <span className="flex h-13 w-13 items-center justify-center rounded-2xl bg-mainColor/10 p-3 text-mainColor dark:text-white">
                    <FaHandHoldingHeart size={23} />
                  </span>
                  <div>
                    <p className="text-xs text-secondaryColor dark:text-gray-400">
                      احتياجات الملجأ
                    </p>
                    <p className="mt-1 text-2xl font-black text-mainColor dark:text-white">
                      {donationCount}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-[24px] border border-mainColor/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1D2939] sm:col-span-2 lg:col-span-1">
                  <span className="flex h-13 w-13 items-center justify-center rounded-2xl bg-mainColor/10 p-3 text-mainColor dark:text-white">
                    <FaHome size={23} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs text-secondaryColor dark:text-gray-400">
                      الملجأ
                    </p>
                    <p className="mt-1 truncate text-sm font-black text-mainColor dark:text-white">
                      {shelter.name || "—"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ANIMALS SECTION */}
            <section id="animals" className="mb-20 scroll-mt-28">
              <SectionHeading
                icon={FaPaw}
                eyebrow="فرصة لعائلة جديدة"
                title="أصدقاؤنا بانتظار بيت دافئ"
                description="تعرّف على الحيوانات الموجودة في الملجأ، وقدّم طلب تبنّي للحيوان الذي ترغب في رعايته."
                count={animalCount}
              />

              {animals.length === 0 ? (
                <div className="rounded-[28px] border border-mainColor/10 bg-white px-6 py-14 text-center dark:border-white/10 dark:bg-[#1D2939]">
                  <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-mainColor/10 text-mainColor dark:text-white">
                    <FaPaw size={34} />
                  </div>

                  <h3 className="mb-3 text-xl font-black text-mainColor dark:text-white">
                    لا توجد حيوانات معروضة حالياً
                  </h3>

                  <p className="text-sm leading-7 text-secondaryColor dark:text-gray-400">
                    يمكنك زيارة هذه الصفحة لاحقاً للاطلاع
                    على الحيوانات التي يضيفها الملجأ.
                  </p>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {animals.map((animal) => (
                    <AnimalCard
                      key={animal.id}
                      animal={animal}
                      onAdopt={openAdoption}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* DONATIONS SECTION */}
            <section
              id="donations"
              className="scroll-mt-28 rounded-[32px] bg-mainColor/5 px-5 py-10 dark:bg-white/5 sm:px-8 sm:py-12"
            >
              <SectionHeading
                icon={FaHandHoldingHeart}
                eyebrow="معاً نصنع فرقاً"
                title="احتياجات الملجأ الحالية"
                description="المستلزمات التي يطلبها الملجأ حالياً. يمكنك اختيار الاحتياج الذي ترغب بالمساهمة فيه."
                count={donationCount}
              />

              {donationRequests.length === 0 ? (
                <div className="rounded-[25px] border border-mainColor/10 bg-white px-6 py-12 text-center dark:border-white/10 dark:bg-[#1D2939]">
                  <FaHandHoldingHeart
                    size={34}
                    className="mx-auto mb-5 text-mainColor dark:text-white"
                  />

                  <h3 className="mb-3 text-xl font-black text-mainColor dark:text-white">
                    لا توجد طلبات تبرع حالياً
                  </h3>

                  <p className="text-sm leading-7 text-secondaryColor dark:text-gray-400">
                    عندما ينشر الملجأ احتياجات جديدة،
                    ستظهر في هذا القسم.
                  </p>
                </div>
              ) : (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {donationRequests.map((request) => (
                    <DonationCard
                      key={request.id}
                      request={request}
                      onDonate={openDonation}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* FOOTER CTA */}
            <div className="mt-12 flex flex-wrap items-center justify-between gap-5 rounded-[28px] bg-mainColor p-7 text-white shadow-lg sm:p-9">
              <div>
                <div className="mb-3 flex items-center gap-2 text-sm font-bold text-white/80">
                  <FaHeart />
                  لأنهم من عائلتنا
                </div>

                <h2 className="mb-2 text-xl font-black sm:text-2xl">
                  كل مساعدة بتصنع فرقاً
                </h2>

                <p className="text-sm leading-7 text-white/85">
                  اكتشف الملاجئ الأخرى وفرص التبنّي
                  والمساعدة في مجتمع كاجو.
                </p>
              </div>

              <Link
                to="/app/shelters"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-extrabold text-mainColor"
              >
                استكشف الملاجئ
                <FaArrowLeft size={13} />
              </Link>
            </div>
          </>
        )}
      </div>

      {/* ======================================
          ADOPTION MODAL
      ====================================== */}

      <DynamicFormModal
        isOpen={adoptModal.isOpen}
        onClose={closeAdoption}
        title={`طلب تبنّي ${selectedAnimal?.name || ""}`}
        fields={[
          {
            name: "phone",
            placeholder: "رقم الهاتف",
          },
          {
            name: "has_adopted_before",
            placeholder: "هل سبق لك التبنّي؟ (نعم/لا)",
          },
          {
            name: "delivery_date",
            placeholder: "تاريخ التسليم",
            type: "date",
          },
          {
            name: "note",
            placeholder: "ملاحظات إضافية",
          },
        ]}
        buttonText="إرسال طلب التبنّي"
        onSubmit={submitAdoption}
      />

      {/* ======================================
          DONATION MODAL
      ====================================== */}

      <DynamicFormModal
        isOpen={donateModal.isOpen}
        onClose={closeDonation}
        title={`التبرّع بـ ${selectedDonationRequest?.item || ""}`}
        fields={[
          {
            name: "donor_name",
            placeholder: "اسم المتبرع",
          },
          {
            name: "phone",
            placeholder: "رقم الهاتف",
          },
          {
            name: "donation_type",
            placeholder: "نوع التبرع (نقدي / عيني)",
          },
          {
            name: "amount_or_item",
            placeholder: "المبلغ أو نوع المستلزم",
          },
          {
            name: "note",
            placeholder: "ملاحظات إضافية",
          },
        ]}
        buttonText="إرسال طلب التبرع"
        onSubmit={submitDonation}
      />
    </main>
  );
}
