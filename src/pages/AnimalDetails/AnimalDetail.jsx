
import React from "react";

import { Button, useDisclosure } from "@heroui/react";
import { Link, useNavigate } from "react-router-dom";

import {
  FaPaw,
  FaHeart,
  FaSyringe,
  FaHeartbeat,
  FaCalendarAlt,
  FaArrowRight,
  FaCheckCircle,
  FaInfoCircle,
  FaShieldAlt,
  FaCat,
  FaHome,
  FaClipboardList,
  FaArrowLeft,
} from "react-icons/fa";

import DynamicFormModal from "../../components/modals/DynamicFormModal";
import img1 from "../../assets/cat2.svg";

// ==========================================
// ANIMAL DATA
// ==========================================
// بيانات تجريبية حالياً.
// لاحقاً يمكن استبدالها ببيانات Laravel API.

const animal = {
  name: "لوسي",
  type: "قط شيرازي",
  age: "سنة",
  vaccines: "ملقحة بالكامل",
  health: "ممتازة",
  image: img1,
};

// ==========================================
// INFORMATION CARDS
// ==========================================

const getAnimalDetails = (animal) => [
  {
    label: "نوع الحيوان",
    value: animal.type,
    icon: FaCat,
  },
  {
    label: "العمر",
    value: animal.age,
    icon: FaCalendarAlt,
  },
  {
    label: "اللقاحات",
    value: animal.vaccines,
    icon: FaSyringe,
  },
  {
    label: "الحالة الصحية",
    value: animal.health,
    icon: FaHeartbeat,
  },
];

function DetailCard({ label, value, icon: Icon }) {
  return (
    <div className="group flex items-center gap-4 rounded-2xl border border-mainColor/10 bg-white p-4 transition-all duration-300 hover:-translate-y-1 hover:border-mainColor/25 hover:shadow-md dark:border-white/10 dark:bg-[#1D2939] sm:p-5">
      <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-mainColor/10 p-3 text-mainColor transition-transform group-hover:scale-110 dark:text-white">
        <Icon size={22} />
      </div>

      <div className="min-w-0">
        <p className="mb-1 text-xs font-bold text-secondaryColor dark:text-fourthColor">
          {label}
        </p>

        <p className="break-words text-base font-extrabold text-mainColor dark:text-white">
          {value}
        </p>
      </div>
    </div>
  );
}

// ==========================================
// ANIMAL DETAILS PAGE
// ==========================================

export default function AnimalDetails() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();

  const details = getAnimalDetails(animal);

  return (
    <main
      dir="rtl"
      className="relative isolate min-h-screen overflow-hidden bg-fivethColor text-mainColor transition-colors duration-500 dark:bg-[#101828]"
    >
      {/* Background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -right-48 -top-48 h-[500px] w-[500px] rounded-full bg-mainColor/5 blur-[110px]" />

        <div className="absolute -bottom-48 -left-40 h-[500px] w-[500px] rounded-full bg-secondaryColor/10 blur-[110px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-7 lg:px-10">

        {/* ======================================
            BREADCRUMB
        ====================================== */}

        <nav
          aria-label="مسار التنقل"
          className="mb-8 flex flex-wrap items-center gap-2 text-sm font-bold"
        >
          <Link
            to="/app/feed"
            className="text-secondaryColor transition-colors hover:text-mainColor dark:text-fourthColor"
          >
            الرئيسية
          </Link>

          <FaArrowLeft
            size={11}
            className="text-secondaryColor/60"
          />

          <Link
            to="/app/shelters"
            className="text-secondaryColor transition-colors hover:text-mainColor dark:text-fourthColor"
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
            {animal.name}
          </span>
        </nav>

        {/* ======================================
            PAGE HEADER
        ====================================== */}

        <header className="mb-9 flex flex-wrap items-end justify-between gap-5">
          <div>
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-mainColor/15 bg-mainColor/5 px-4 py-2 text-xs font-extrabold text-mainColor dark:bg-white/10 dark:text-white">
              <FaPaw size={14} />
              تعرّف على صديقك الجديد
            </span>

            <h1 className="text-3xl font-black text-mainColor dark:text-white sm:text-4xl">
              تفاصيل الحيوان
            </h1>

            <p className="mt-3 text-sm leading-8 text-secondaryColor dark:text-fourthColor sm:text-base">
              تعرّف على المعلومات المتوفرة عن الحيوان
              قبل تقديم طلب التبنّي.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-3 rounded-2xl border border-mainColor/15 bg-white px-5 py-3 text-sm font-bold text-mainColor transition-all hover:bg-mainColor/5 dark:border-white/10 dark:bg-[#1D2939] dark:text-white"
          >
            <FaArrowRight size={14} />
            العودة للخلف
          </button>
        </header>

        {/* ======================================
            MAIN ANIMAL CARD
        ====================================== */}

        <section className="grid items-stretch gap-6 lg:grid-cols-[1.1fr_0.9fr]">

          {/* ANIMAL IMAGE */}
          <div className="relative flex min-h-[320px] items-center justify-center overflow-hidden rounded-[30px] border border-mainColor/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#1D2939] sm:min-h-[440px] sm:p-10">

            {/* Decorative circles */}
            <div className="absolute inset-[12%] rounded-full border border-mainColor/10 bg-gradient-to-br from-mainColor/10 via-white to-secondaryColor/10 dark:via-[#101828]" />

            <div className="absolute inset-[6%] rounded-full border border-dashed border-mainColor/15" />

            <div className="absolute left-[10%] top-[15%] h-4 w-4 rounded-full bg-secondaryColor" />

            <div className="absolute bottom-[14%] right-[12%] h-3 w-3 rounded-full bg-mainColor" />

            <img
              src={animal.image}
              alt={`صورة الحيوان ${animal.name}`}
              className="relative z-10 max-h-[450px] w-full object-contain drop-shadow-xl transition-transform duration-500 hover:scale-105"
            />

            <div className="absolute bottom-5 right-5 z-20 flex items-center gap-2 rounded-2xl border border-mainColor/10 bg-white/95 px-4 py-3 text-xs font-extrabold text-mainColor shadow-lg dark:bg-[#101828] dark:text-white">
              <FaHeart className="text-secondaryColor" />
              صديق يستحق الحب والرعاية
            </div>
          </div>

          {/* ANIMAL INFORMATION */}
          <div className="flex flex-col rounded-[30px] border border-mainColor/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1D2939] sm:p-8">

            {/* Name */}
            <div className="mb-7 border-b border-mainColor/10 pb-6">
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full bg-mainColor/10 px-4 py-2 text-xs font-extrabold text-mainColor dark:bg-white/10 dark:text-white">
                  <FaPaw size={13} />
                  تبنّي الحيوانات
                </span>
              </div>

              <h2 className="text-4xl font-black text-mainColor dark:text-white sm:text-5xl">
                {animal.name}
              </h2>

              <p className="mt-3 text-base font-medium text-secondaryColor dark:text-fourthColor">
                {animal.type}
              </p>
            </div>

            {/* Details */}
            <div className="grid gap-4 sm:grid-cols-2">
              {details.map((detail) => (
                <DetailCard
                  key={detail.label}
                  {...detail}
                />
              ))}
            </div>

            {/* Adoption CTA */}
            <div className="mt-auto pt-8">
              <Button
                onPress={onOpen}
                className="flex h-15 w-full items-center justify-center gap-3 rounded-2xl bg-mainColor text-base font-extrabold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:opacity-90 hover:shadow-xl sm:text-lg"
                startContent={<FaHeart size={19} />}
                endContent={<FaArrowLeft size={15} />}
              >
                تقديم طلب تبنّي
              </Button>

              <p className="mt-4 flex items-center justify-center gap-2 text-center text-xs leading-6 text-secondaryColor dark:text-fourthColor">
                <FaInfoCircle className="shrink-0" />
                تقديم الطلب لا يعني الموافقة عليه مباشرة.
              </p>
            </div>
          </div>
        </section>

        {/* ======================================
            MORE INFORMATION
        ====================================== */}

        <section className="mt-9 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">

          {/* ABOUT ANIMAL */}
          <article className="rounded-[28px] border border-mainColor/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#1D2939] sm:p-8">
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-mainColor/10 text-mainColor dark:text-white">
                <FaPaw size={21} />
              </span>

              <h2 className="text-xl font-extrabold text-mainColor dark:text-white">
                تعرّف على {animal.name}
              </h2>
            </div>

            <p className="text-sm leading-[2.1] text-secondaryColor dark:text-fourthColor sm:text-base">
              {animal.name} من نوع {animal.type}،
              ويبلغ عمرها {animal.age}.
              وفقاً للمعلومات المتوفرة، حالة اللقاحات:
              {" "}
              {animal.vaccines}، والحالة الصحية:
              {" "}
              {animal.health}.
            </p>

            <div className="mt-6 flex items-start gap-3 rounded-2xl bg-mainColor/5 p-4 dark:bg-white/5">
              <FaInfoCircle className="mt-1 shrink-0 text-mainColor dark:text-white" />

              <p className="text-xs leading-7 text-secondaryColor dark:text-fourthColor">
                يُنصح بالتواصل مع الجهة المسؤولة عن
                الحيوان للتحقق من معلوماته الصحية
                ومتطلبات التبنّي قبل اتخاذ القرار.
              </p>
            </div>
          </article>

          {/* ADOPTION GUIDE */}
          <article className="rounded-[28px] border border-mainColor/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#1D2939] sm:p-8">
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-mainColor/10 text-mainColor dark:text-white">
                <FaClipboardList size={21} />
              </span>

              <h2 className="text-xl font-extrabold text-mainColor dark:text-white">
                قبل تقديم طلب التبنّي
              </h2>
            </div>

            <div className="space-y-5">
              {[
                "تأكد من قدرتك على توفير الرعاية اليومية.",
                "جهّز بيئة آمنة ومناسبة للحيوان.",
                "استفسر عن الاحتياجات الصحية والغذائية.",
                "التبنّي مسؤولية طويلة الأمد.",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3"
                >
                  <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-mainColor/10 text-mainColor dark:text-white">
                    <FaCheckCircle size={14} />
                  </span>

                  <p className="text-sm leading-7 text-secondaryColor dark:text-fourthColor">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </article>
        </section>

        {/* ======================================
            FINAL CTA
        ====================================== */}

        <section className="relative mt-10 overflow-hidden rounded-[30px] bg-mainColor p-7 text-white shadow-xl sm:p-10">
          <div className="pointer-events-none absolute -left-12 -top-12 h-44 w-44 rounded-full bg-white/10" />

          <div className="relative flex flex-wrap items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="mb-4 flex items-center gap-2 text-sm font-bold text-white/85">
                <FaHeart />
                التبنّي بداية حكاية جميلة
              </div>

              <h2 className="mb-3 text-2xl font-black sm:text-3xl">
                مستعد تمنح {animal.name} بيتاً دافئاً؟
              </h2>

              <p className="text-sm leading-8 text-white/85">
                ابدأ بتقديم طلب التبنّي،
                وتعرّف على الإجراءات المطلوبة من الجهة
                المسؤولة.
              </p>
            </div>

            <Button
              onPress={onOpen}
              className="h-13 rounded-2xl bg-white px-7 text-sm font-extrabold text-mainColor shadow-md transition-all hover:-translate-y-1"
              endContent={<FaArrowLeft size={13} />}
            >
              قدّم طلب التبنّي
            </Button>
          </div>
        </section>
      </div>

      {/* ======================================
          EXISTING ADOPTION MODAL
      ====================================== */}

      <DynamicFormModal
        isOpen={isOpen}
        onClose={onClose}
        title={`طلب تبنّي ${animal.name}`}
        fields={[
          {
            name: "name",
            placeholder: "اسمك الكامل",
          },
          {
            name: "animal",
            placeholder: "الحيوان المراد تبنّيه",
          },
          {
            name: "phone",
            placeholder: "رقم الهاتف",
          },
          {
            name: "previousAdoption",
            placeholder: "هل سبق لك التبنّي؟",
          },
          {
            name: "deliveryDate",
            placeholder: "تاريخ التسليم المقترح",
          },
          {
            name: "note",
            placeholder: "ملاحظات إضافية",
          },
        ]}
        buttonText="إرسال الطلب"
      />
    </main>
  );
}
