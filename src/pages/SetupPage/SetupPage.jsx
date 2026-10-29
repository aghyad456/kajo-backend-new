
import React from "react";
import { Link, Navigate } from "react-router-dom";
import {
  FaPaw,
  FaStethoscope,
  FaStore,
  FaHome,
  FaArrowLeft,
  FaCheck,
  FaRegLightbulb,
  FaShieldAlt,
  FaUserCircle,
  FaExclamationCircle,
  FaSpinner,
  FaHeart,
} from "react-icons/fa";

import { useAuth } from "../../context/AuthContext";

import ShelterSetup from "../../components/setup/ShelterSetup";
import DoctorSetup from "../../components/setup/DoctorSetup";
import StoreSetup from "../../components/setup/StoreSetup";

// ------------------------------------------
// ROLE HELPERS
// ------------------------------------------

const ROLE_IDS = {
  admin: 1,
  user: 2,
  store: 3,
  shelter: 4,
  doctor: 5,
};

function normalizeRole(value) {
  const aliases = {
    admin: 1,
    user: 2,
    "shop-owner": 3,
    shop_owner: 3,
    "store-owner": 3,
    store_owner: 3,
    store: 3,
    "shelter-owner": 4,
    shelter_owner: 4,
    shelter: 4,
    doctor: 5,
  };

  if (value === null || value === undefined) return null;

  const raw = String(value).trim().toLowerCase();

  if (/^[1-5]$/.test(raw)) return Number(raw);

  return aliases[raw] ?? null;
}

function isSetupComplete(value) {
  return (
    value === true ||
    value === 1 ||
    (typeof value === "string" &&
      ["true", "1", "yes"].includes(value.trim().toLowerCase()))
  );
}

const SETUP_TYPES = {
  5: {
    eyebrow: "حساب الطبيب البيطري",
    title: "خلّينا نجهّز عيادتك",
    accent: "عيادتك",
    description:
      "عرّف مجتمع كاجو على عيادتك، حتى يقدر أصحاب الحيوانات يتعرفوا على خدماتك ويتواصلوا معك.",
    greeting: "أهلاً دكتور!",
    icon: FaStethoscope,
    component: DoctorSetup,
    redirect: "/app/dashboard",
    steps: [
      {
        title: "معلومات العيادة",
        text: "عرّفنا على عيادتك وخدماتك.",
      },
      {
        title: "بيانات التواصل",
        text: "أضف التفاصيل المطلوبة للتواصل.",
      },
      {
        title: "حفظ الإعداد",
        text: "راجع المعلومات وأكمل عملية الإعداد.",
      },
    ],
  },

  3: {
    eyebrow: "حساب صاحب المتجر",
    title: "متجرك يبدأ من هون",
    accent: "متجرك",
    description:
      "جهّز هويتك التجارية داخل كاجو وعرّف أصحاب الحيوانات على متجرك ومنتجاتك.",
    greeting: "أهلاً بشريكنا!",
    icon: FaStore,
    component: StoreSetup,
    redirect: "/app/store-dashboard",
    steps: [
      {
        title: "معلومات المتجر",
        text: "أضف البيانات الأساسية لمتجرك.",
      },
      {
        title: "بيانات التواصل",
        text: "أكمل المعلومات المطلوبة للتواصل.",
      },
      {
        title: "حفظ الإعداد",
        text: "راجع البيانات وأكمل الإعداد.",
      },
    ],
  },

  4: {
    eyebrow: "حساب صاحب الملجأ",
    title: "خلّينا نعرّف العالم بملجأك",
    accent: "بملجأك",
    description:
      "قدّم ملجأك لمجتمع كاجو وساعد الحيوانات تلاقي الرعاية والعائلة اللي بتستحقها.",
    greeting: "أهلاً بصانع الفرق!",
    icon: FaHome,
    component: ShelterSetup,
    redirect: "/app/shelter-dashboard",
    steps: [
      {
        title: "معلومات الملجأ",
        text: "عرّفنا على الملجأ ونشاطه.",
      },
      {
        title: "بيانات التواصل",
        text: "أكمل التفاصيل المطلوبة.",
      },
      {
        title: "حفظ الإعداد",
        text: "راجع المعلومات وأكمل الإعداد.",
      },
    ],
  },
};

// ------------------------------------------
// SHARED COMPONENTS
// ------------------------------------------

function LoadingScreen() {
  return (
    <main
      dir="rtl"
      role="status"
      className="flex min-h-screen items-center justify-center bg-fivethColor px-5 dark:bg-[#101828]"
    >
      <div className="text-center">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-[28px] bg-mainColor text-white shadow-xl shadow-mainColor/10">
          <FaSpinner className="animate-spin" size={30} />
        </div>
        <p className="text-lg font-black text-mainColor dark:text-white">
          عم نجهّز مساحتك في كاجو...
        </p>
      </div>
    </main>
  );
}

function UnknownRole() {
  return (
    <main
      dir="rtl"
      className="flex min-h-screen items-center justify-center bg-fivethColor px-4 dark:bg-[#101828]"
    >
      <div className="w-full max-w-lg rounded-[32px] border border-mainColor/10 bg-white px-7 py-12 text-center shadow-xl dark:border-white/10 dark:bg-[#1D2939]">
        <span className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-mainColor/10 text-mainColor dark:text-white">
          <FaExclamationCircle size={32} />
        </span>
        <h1 className="mb-3 text-2xl font-black text-mainColor dark:text-white">
          ما قدرنا نحدد نوع حسابك
        </h1>
        <p className="mb-7 text-sm leading-8 text-secondaryColor dark:text-gray-300">
          هذا الحساب ما عنده نموذج إعداد معروف حالياً.
          يرجى مراجعة بيانات الحساب أو التواصل مع إدارة كاجو.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-3 rounded-2xl bg-mainColor px-7 py-4 text-sm font-black text-white transition hover:opacity-90"
        >
          العودة للرئيسية
          <FaArrowLeft />
        </Link>
      </div>
    </main>
  );
}

function StepItem({ item, index, isLast }) {
  return (
    <li className="relative flex gap-4">
      {!isLast && (
        <span
          aria-hidden="true"
          className="absolute right-[22px] top-12 bottom-0 w-px bg-mainColor/15 dark:bg-white/15"
        />
      )}

      <div className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-mainColor/15 bg-mainColor/5 text-sm font-black text-mainColor dark:border-white/15 dark:bg-white/10 dark:text-white">
        {String(index + 1).padStart(2, "0")}
      </div>

      <div className={isLast ? "" : "pb-8"}>
        <h3 className="mb-1 text-sm font-black text-mainColor dark:text-white">
          {item.title}
        </h3>
        <p className="text-xs leading-7 text-secondaryColor dark:text-gray-400">
          {item.text}
        </p>
      </div>
    </li>
  );
}

// ------------------------------------------
// PAGE
// ------------------------------------------

export default function SetupPage() {
  const { user, loading } = useAuth();

  if (loading === true) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const role = normalizeRole(user.role);
  const hasSetup = isSetupComplete(
    user.hasSetup ?? user.has_setup
  );

  if (role === ROLE_IDS.admin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (role === ROLE_IDS.user) {
    return <Navigate to="/app/feed" replace />;
  }

  const config = SETUP_TYPES[role];

  if (!config) {
    return <UnknownRole />;
  }

  if (hasSetup) {
    return <Navigate to={config.redirect} replace />;
  }

  const SetupComponent = config.component;
  const TypeIcon = config.icon;
  const displayName = user.name?.trim() || "صديق كاجو";

  return (
    <main
      dir="rtl"
      className="min-h-screen overflow-x-hidden bg-fivethColor text-mainColor transition-colors duration-300 dark:bg-[#101828]"
    >
      {/* ======================================
          COMPACT TOP NAVIGATION
      ====================================== */}
      <nav className="relative z-10 border-b border-mainColor/10 bg-white/90 dark:border-white/10 dark:bg-[#101828]">
        <div className="mx-auto flex max-w-[1380px] items-center justify-between gap-4 px-5 py-4 sm:px-8 lg:px-12">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xl font-black text-mainColor dark:text-white"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-mainColor text-white">
              <FaPaw size={18} />
            </span>
            كاجو
          </Link>

          <div className="hidden items-center gap-2 rounded-full border border-mainColor/10 bg-mainColor/5 px-4 py-2 text-xs font-bold text-mainColor dark:border-white/10 dark:bg-white/5 dark:text-white sm:flex">
            <FaShieldAlt />
            إعداد حسابك المهني
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-secondaryColor dark:text-gray-300">
            <FaUserCircle size={21} />
            <span className="max-w-32 truncate sm:max-w-48">
              {displayName}
            </span>
          </div>
        </div>
      </nav>

      {/* ======================================
          PREMIUM HERO
      ====================================== */}
      <header className="relative isolate overflow-hidden bg-mainColor text-white">
        {/* Abstract shapes */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <div className="absolute -left-24 -top-44 h-[500px] w-[500px] rounded-full border-[70px] border-white/5" />

          <div className="absolute -bottom-56 right-1/4 h-[400px] w-[400px] rounded-full border-[60px] border-white/5" />

          <div className="absolute left-[32%] top-12 h-3 w-3 rounded-full bg-secondaryColor" />

          <div className="absolute bottom-12 right-[14%] h-4 w-4 rounded-full bg-white/30" />

          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-white/[0.035] to-transparent" />
        </div>

        <div className="relative mx-auto grid max-w-[1380px] items-center gap-10 px-5 pb-20 pt-12 sm:px-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:px-12 lg:pb-24 lg:pt-20">
          <div className="max-w-3xl">
            <div className="mb-7 inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-bold backdrop-blur-sm sm:text-sm">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-mainColor">
                <FaPaw size={12} />
              </span>
              رحلتك المهنية مع كاجو تبدأ من هون
            </div>

            <p className="mb-3 text-sm font-bold text-white/75 sm:text-base">
              {config.greeting}
            </p>

            <h1 className="max-w-2xl text-3xl font-black leading-[1.5] tracking-tight sm:text-4xl lg:text-5xl">
              {config.title}
              <span className="text-secondaryColor">.</span>
            </h1>

            <p className="mt-6 max-w-xl text-sm leading-9 text-white/85 sm:text-base">
              {config.description}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4 text-xs font-bold text-white/85">
              <span className="flex items-center gap-2">
                <FaCheck className="text-secondaryColor" />
                معلومات واضحة
              </span>

              <span className="h-1 w-1 rounded-full bg-white/40" />

              <span className="flex items-center gap-2">
                <FaCheck className="text-secondaryColor" />
                تجربة سهلة
              </span>

              <span className="h-1 w-1 rounded-full bg-white/40" />

              <span className="flex items-center gap-2">
                <FaCheck className="text-secondaryColor" />
                جاهز للانطلاق
              </span>
            </div>
          </div>

          {/* Big visual icon */}
          <div className="relative hidden justify-center lg:flex">
            <div className="relative flex h-64 w-64 items-center justify-center rounded-[72px] border border-white/20 bg-white/10 shadow-2xl shadow-black/10 backdrop-blur-sm">
              <div className="absolute -inset-5 rounded-[90px] border border-white/10" />

              <div className="absolute -right-7 -top-7 flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-mainColor shadow-xl">
                <FaPaw size={27} />
              </div>

              <TypeIcon size={112} className="text-white" />

              <div className="absolute -bottom-6 -left-8 flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-xs font-black text-mainColor shadow-xl">
                <FaHeart className="text-secondaryColor" />
                لأنهم من عائلتنا
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ======================================
          SETUP CONTENT
      ====================================== */}
      <div className="relative z-10 mx-auto -mt-9 max-w-[1380px] px-4 pb-24 sm:px-8 lg:px-12">
        <div className="overflow-hidden rounded-[28px] border border-mainColor/10 bg-white shadow-[0_25px_85px_rgba(0,0,0,0.06)] dark:border-white/10 dark:bg-[#1D2939] sm:rounded-[36px]">
          {/* Card top section */}
          <div className="flex flex-wrap items-center justify-between gap-5 border-b border-mainColor/10 px-6 py-7 dark:border-white/10 sm:px-9">
            <div className="flex min-w-0 items-center gap-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] bg-mainColor/10 text-mainColor dark:bg-white/10 dark:text-white">
                <TypeIcon size={24} />
              </span>

              <div className="min-w-0">
                <p className="mb-1 text-xs font-bold text-secondaryColor dark:text-gray-400">
                  {config.eyebrow}
                </p>
                <h2 className="text-xl font-black text-mainColor dark:text-white sm:text-2xl">
                  معلومات حسابك
                </h2>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-mainColor/10 bg-mainColor/5 px-4 py-2 text-xs font-bold text-mainColor dark:border-white/10 dark:bg-white/5 dark:text-white">
              <span className="h-2 w-2 rounded-full bg-secondaryColor" />
              الإعداد الأولي
            </div>
          </div>

          {/* FORM + SIDEBAR */}
          <div className="grid lg:grid-cols-[minmax(0,1fr)_290px]">
            {/* Main form - no extra nested card */}
            <div className="min-w-0 px-4 py-8 sm:px-9 sm:py-10 lg:px-11">
              <div className="mb-8">
                <div className="mb-3 flex items-center gap-3">
                  <span className="h-1 w-9 rounded-full bg-secondaryColor" />
                  <span className="text-xs font-black tracking-wide text-secondaryColor">
                    أكمل بياناتك
                  </span>
                </div>

                <h3 className="mb-3 text-xl font-black text-mainColor dark:text-white sm:text-2xl">
                  جاهز نبلّش؟
                </h3>

                <p className="max-w-2xl text-sm leading-8 text-secondaryColor dark:text-gray-300">
                  عبّي المعلومات المطلوبة بالأسفل،
                  وتأكد منها قبل الحفظ. كل نوع حساب
                  إله نموذج الإعداد الخاص فيه.
                </p>
              </div>

              {/* Original setup form and APIs preserved */}
              <div className="min-w-0">
                <SetupComponent />
              </div>
            </div>

            {/* Guide sidebar */}
            <aside className="border-t border-mainColor/10 bg-mainColor/[0.035] px-6 py-9 dark:border-white/10 dark:bg-white/[0.025] sm:px-9 lg:border-r lg:border-t-0 lg:px-7">
              <div className="mb-9">
                <span className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-mainColor text-white">
                  <FaRegLightbulb size={21} />
                </span>

                <h3 className="mb-2 text-lg font-black text-mainColor dark:text-white">
                  خطوات بسيطة
                </h3>

                <p className="text-xs leading-7 text-secondaryColor dark:text-gray-400">
                  اتبع التعليمات بالنموذج حتى تجهّز
                  حسابك وتبدأ باستخدام كاجو.
                </p>
              </div>

              <ol>
                {config.steps.map((step, index) => (
                  <StepItem
                    key={index}
                    item={step}
                    index={index}
                    isLast={index === config.steps.length - 1}
                  />
                ))}
              </ol>

              <div className="mt-9 rounded-[24px] bg-mainColor p-6 text-white">
                <FaPaw size={24} className="mb-4 text-secondaryColor" />

                <h4 className="mb-2 text-base font-black">
                  نصيحة من كاجو
                </h4>

                <p className="text-xs leading-8 text-white/85">
                  كل ما كانت بياناتك واضحة ودقيقة،
                  صار أسهل على الآخرين التعرّف
                  على خدماتك والتواصل معك.
                </p>
              </div>

              <p className="mt-6 flex items-start gap-2 text-xs leading-7 text-secondaryColor dark:text-gray-400">
                <FaShieldAlt className="mt-1 shrink-0 text-mainColor dark:text-white" />
                استخدام الحسابات المهنية يخضع لصلاحيات
                وسياسات المنصة.
              </p>
            </aside>
          </div>
        </div>

        {/* ======================================
            BOTTOM
        ====================================== */}
        <footer className="mt-8 flex flex-wrap items-center justify-between gap-4 px-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-secondaryColor transition-colors hover:text-mainColor dark:text-gray-300"
          >
            <FaArrowLeft size={13} />
            العودة للرئيسية
          </Link>

          <p className="flex items-center gap-2 text-xs font-bold text-secondaryColor dark:text-gray-400">
            <FaPaw className="text-mainColor dark:text-white" />
            كاجو — لأنهم من عائلتنا
          </p>
        </footer>
      </div>
    </main>
  );
}
