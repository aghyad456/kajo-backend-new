
import React from "react";

import img2 from "../../assets/cat.svg";
import img3 from "../../assets/Claws.svg";
import notebook from "../../assets/notebook.svg";

const Icon = ({ name, size = 24, className = "" }) => {
  const icons = {
    heart: (
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />
    ),
    paw: (
      <>
        <ellipse cx="7" cy="6.5" rx="1.2" ry="2" />
        <ellipse cx="12" cy="4.5" rx="1.2" ry="2" />
        <ellipse cx="17" cy="6.5" rx="1.2" ry="2" />
        <path d="M12 11c-2 0-3 2-5 4-2.5 2.5-.5 5 2 4.4 2-.5 4-.5 6 0 2.5.6 4.5-1.9 2-4.4-2-2-3-4-5-4Z" />
      </>
    ),
    store: (
      <>
        <path d="M3 10h18l-2 11H5L3 10Z" />
        <path d="M5 10V5h14v5M9 21v-7h6v7" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M7 3v4M17 3v4M3 10h18m-12 5 2 2 4-4" />
      </>
    ),
    arrow: <path d="M19 12H5m7 7-7-7 7-7" />,
    check: <path d="m5 12 4 4L19 6" />,
    sparkle: (
      <path d="m12 2 2.3 7.7L22 12l-7.7 2.3L12 22l-2.3-7.7L2 12l7.7-2.3L12 2Z" />
    ),
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {icons[name]}
    </svg>
  );
};

const services = [
  {
    icon: "heart",
    title: "الرعاية البيطرية",
    description:
      "تواصل مع العيادات والأطباء البيطريين، واستفد من خيارات الحجز الإلكتروني بكل سهولة.",
  },
  {
    icon: "paw",
    title: "التبنّي والملاجئ",
    description:
      "تعرّف على الملاجئ والحيوانات المتاحة للتبنّي، وساهم في منحها فرصة لحياة أفضل.",
  },
  {
    icon: "store",
    title: "متاجر المستلزمات",
    description:
      "اكتشف المتاجر والمنتجات الخاصة بالحيوانات الأليفة، وكل ما يحتاجه صديقك الصغير.",
  },
  {
    icon: "calendar",
    title: "حجز المواعيد",
    description:
      "استكشف خدمات العيادات واحجز موعدك إلكترونياً دون إجراءات معقدة.",
  },
];

export default function InformationPage() {
  return (
    <main
      dir="rtl"
      className="relative isolate min-h-screen overflow-hidden bg-white text-mainColor transition-colors duration-500 dark:bg-[#101828]"
    >
      {/* Decorative background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -right-48 -top-48 h-[500px] w-[500px] rounded-full bg-mainColor/5 blur-[110px]" />
        <div className="absolute -left-48 top-48 h-[450px] w-[450px] rounded-full bg-secondaryColor/10 blur-[110px]" />
        <div className="absolute bottom-0 right-1/3 h-72 w-72 rounded-full bg-mainColor/5 blur-[100px]" />
      </div>

      {/* ================= HERO ================= */}
      <section className="relative mx-auto max-w-7xl px-5 pb-16 pt-20 sm:px-8 lg:px-12 lg:pb-24 lg:pt-28">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">

          {/* Text */}
          <div className="order-2 text-center lg:order-1 lg:text-right">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-mainColor/15 bg-mainColor/5 px-5 py-2.5 text-sm font-bold text-mainColor dark:bg-white/10 dark:text-white">
              <Icon name="sparkle" size={17} />
              تعرّف على عالم كاجو
            </div>

            <h1 className="mb-6 text-[clamp(2.5rem,5vw,4.5rem)] font-extrabold leading-[1.3] text-mainColor dark:text-white">
              لأن رعايتهم
              <br />
              <span className="relative inline-block">
                مسؤوليتنا جميعاً
                <svg
                  viewBox="0 0 350 20"
                  preserveAspectRatio="none"
                  className="absolute -bottom-2 right-0 h-3 w-full text-secondaryColor"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M3 14C100 2 220 3 347 10"
                    stroke="currentColor"
                    strokeWidth="7"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>

            <h2 className="mb-5 text-xl font-bold text-mainColor dark:text-fourthColor sm:text-2xl">
              كاجو... مكان واحد لكل ما يخص أليفك
            </h2>

            <p className="mx-auto mb-5 max-w-[570px] text-base leading-[2.1] text-secondaryColor lg:mx-0 sm:text-lg dark:text-fourthColor">
              كاجو منصة إلكترونية تجمع خدمات الرعاية البيطرية
              والتبنّي والتسوّق في تجربة واحدة، لتسهّل عليك
              الوصول إلى العيادات البيطرية والملاجئ والمتاجر
              التي تهتم بالحيوانات الأليفة.
            </p>

            <p className="mx-auto mb-8 max-w-[570px] text-base leading-[2.1] text-secondaryColor lg:mx-0 dark:text-fourthColor">
              نطمح إلى بناء مجتمع يهتم برفاهية الحيوانات،
              ويساعد أصحابها على العثور على الخدمات والمعلومات
              التي يحتاجون إليها بوضوح وسهولة.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 lg:justify-start">
              <a
                href="/login"
                className="group inline-flex min-h-14 items-center justify-center gap-3 rounded-2xl bg-mainColor px-8 py-3.5 text-base font-extrabold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:opacity-90 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-mainColor"
              >
                انضم إلى كاجو
                <Icon
                  name="arrow"
                  size={19}
                  className="transition-transform group-hover:-translate-x-1"
                />
              </a>

              <a
                href="/register"
                className="inline-flex min-h-14 items-center justify-center rounded-2xl border-2 border-secondaryColor bg-white px-8 py-3.5 text-base font-bold text-mainColor transition-all duration-300 hover:-translate-y-1 hover:bg-mainColor/5 dark:bg-[#101828] dark:text-white"
              >
                إنشاء حساب جديد
              </a>
            </div>
          </div>

          {/* Illustration */}
          <div className="relative order-1 mx-auto flex w-full max-w-[540px] items-center justify-center lg:order-2">
            <div className="relative flex aspect-square w-full items-center justify-center">

              <div className="absolute inset-[8%] rounded-full border border-mainColor/10 bg-gradient-to-br from-mainColor/10 via-white to-secondaryColor/10 dark:via-[#101828]" />

              <img
                src={img3}
                alt=""
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 h-full w-full object-contain opacity-15 dark:opacity-10"
              />

              <img
                src={img2}
                alt="رسم توضيحي لقطة من عالم كاجو"
                className="relative z-10 h-[82%] w-[82%] object-contain drop-shadow-xl transition-transform duration-500 hover:scale-105"
              />

              {/* Floating badge */}
              <div className="absolute bottom-[10%] right-0 z-20 flex items-center gap-3 rounded-2xl border border-mainColor/10 bg-white/95 px-4 py-3 shadow-xl dark:bg-[#1D2939] sm:right-[2%]">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-mainColor/10 text-mainColor dark:text-white">
                  <Icon name="heart" size={23} />
                </span>

                <div className="text-right">
                  <p className="text-sm font-extrabold text-mainColor dark:text-white">
                    رعاية تبدأ بالحب
                  </p>
                  <p className="mt-1 text-xs text-secondaryColor dark:text-fourthColor">
                    لأصدقاء يستحقون الأفضل
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SERVICES ================= */}
      <section className="relative border-y border-mainColor/10 bg-mainColor/5 py-20 dark:bg-white/5">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">

          <div className="mx-auto mb-12 max-w-2xl text-center">
            <span className="mb-3 inline-block text-sm font-extrabold text-secondaryColor dark:text-fourthColor">
              خدمات كاجو
            </span>

            <h2 className="mb-5 text-3xl font-extrabold text-mainColor dark:text-white sm:text-4xl">
              كل ما يحتاجه أليفك في مكان واحد
            </h2>

            <p className="text-base leading-8 text-secondaryColor dark:text-fourthColor">
              صممنا كاجو لتكون تجربتك أسهل، ولتتمكن من
              استكشاف خدمات متنوعة تهتم بصحة الحيوانات وراحتها.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((service) => (
              <article
                key={service.title}
                className="group rounded-[28px] border border-mainColor/10 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-mainColor/25 hover:shadow-xl dark:bg-[#1D2939]"
              >
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-mainColor/10 text-mainColor transition-transform duration-300 group-hover:scale-110 dark:text-fourthColor">
                  <Icon name={service.icon} size={30} />
                </div>

                <h3 className="mb-3 text-lg font-extrabold text-mainColor dark:text-white">
                  {service.title}
                </h3>

                <p className="text-sm leading-8 text-secondaryColor dark:text-fourthColor">
                  {service.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ================= OUR VISION ================= */}
      <section className="relative py-20 lg:py-28">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:gap-20 lg:px-12">

          <div className="flex justify-center">
            <div className="relative flex w-full max-w-[430px] items-center justify-center rounded-[40px] border border-mainColor/10 bg-mainColor/5 p-8 dark:bg-white/5">
              <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-secondaryColor/10 blur-xl" />

              <img
                src={notebook}
                alt="رسم توضيحي من كاجو"
                loading="lazy"
                className="relative z-10 max-h-[360px] w-full object-contain drop-shadow-xl"
              />
            </div>
          </div>

          <div className="text-center lg:text-right">
            <span className="mb-4 inline-block rounded-full bg-mainColor/10 px-5 py-2 text-sm font-bold text-mainColor dark:text-white">
              رؤيتنا
            </span>

            <h2 className="mb-6 text-3xl font-extrabold leading-snug text-mainColor dark:text-white sm:text-4xl">
              عالم أكثر لطفاً
              <br />
              مع الحيوانات
            </h2>

            <p className="mb-7 text-base leading-[2.1] text-secondaryColor dark:text-fourthColor sm:text-lg">
              نؤمن أن الحيوانات الأليفة تستحق رعاية جيدة
              وحياة مليئة بالاهتمام. لذلك نسعى إلى تسهيل
              التواصل بين أصحاب الحيوانات والجهات التي
              تقدم الخدمات البيطرية والتبنّي والمستلزمات.
            </p>

            <div className="flex flex-col gap-4">
              {[
                "تسهيل الوصول إلى الخدمات البيطرية",
                "دعم ثقافة التبنّي المسؤول",
                "توفير تجربة رقمية واضحة ومريحة",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 text-right"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-mainColor/10 text-mainColor dark:text-white">
                    <Icon name="check" size={19} />
                  </span>
                  <span className="font-semibold text-mainColor dark:text-fourthColor">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================= FINAL CTA ================= */}
      <section className="relative px-5 pb-20 sm:px-8 lg:px-12">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[36px] bg-mainColor px-6 py-14 text-center shadow-xl sm:px-12 lg:py-20">

          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-28 -right-20 h-72 w-72 rounded-full bg-secondaryColor/20 blur-3xl"
          />

          <div className="relative z-10 mx-auto max-w-3xl">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 text-white">
              <Icon name="paw" size={32} />
            </div>

            <h2 className="mb-5 text-3xl font-extrabold text-white sm:text-4xl">
              كن جزءاً من عائلة كاجو
            </h2>

            <p className="mb-9 text-base leading-8 text-white/85 sm:text-lg">
              ابدأ رحلتك معنا، واستكشف عالماً يجمع
              الرعاية والاهتمام والخدمات التي يحتاجها أليفك.
            </p>

            <a
              href="/register"
              className="group inline-flex min-h-14 items-center justify-center gap-3 rounded-2xl bg-white px-9 py-3.5 text-base font-extrabold text-mainColor shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              أنشئ حسابك الآن
              <Icon
                name="arrow"
                size={18}
                className="transition-transform group-hover:-translate-x-1"
              />
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
