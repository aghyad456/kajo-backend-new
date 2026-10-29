
import React from "react";
import img1 from "../../assets/kajo.svg";

const Icon = ({ name, size = 22, className = "" }) => {
  const icons = {
    arrow: <path d="M19 12H5m7 7-7-7 7-7" />,
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
    bag: (
      <>
        <path d="M4 8h16l-1 13H5L4 8Z" />
        <path d="M9 9V6a3 3 0 0 1 6 0v3" />
      </>
    ),
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
    title: "الرعاية البيطرية",
    description: "اهتمام بصحة أليفك",
    icon: "heart",
  },
  {
    title: "تبنّي الحيوانات",
    description: "امنح أليفاً بيتاً دافئاً",
    icon: "paw",
  },
  {
    title: "مستلزمات الحيوانات",
    description: "كل احتياجات أليفك",
    icon: "bag",
  },
];

export default function LandingPage() {
  return (
    <main
      dir="rtl"
      className="relative isolate min-h-screen overflow-hidden bg-white text-mainColor transition-colors duration-500 dark:bg-[#101828]"
    >
      {/* Background decorations */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -right-48 -top-48 h-[550px] w-[550px] rounded-full bg-mainColor/5 blur-[110px]" />
        <div className="absolute -left-48 top-24 h-[500px] w-[500px] rounded-full bg-secondaryColor/10 blur-[110px]" />
        <div className="absolute bottom-0 right-1/3 h-72 w-72 rounded-full bg-mainColor/5 blur-[100px]" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-5 pb-14 pt-24 sm:px-8 lg:px-12">

        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">

          {/* Text */}
          <div className="order-2 text-center lg:order-1 lg:text-right">

            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-mainColor/20 bg-mainColor/5 px-5 py-2.5 text-sm font-bold text-mainColor dark:bg-white/10 dark:text-white">
              <Icon name="sparkle" size={17} />
              عالم متكامل لأصدقائنا الأليفين
            </div>

            <h1 className="mb-6 text-[clamp(2.4rem,5vw,4.5rem)] font-extrabold leading-[1.3] tracking-tight text-mainColor dark:text-white">
              لأنهم جزء
              <br />
              <span className="relative inline-block text-mainColor dark:text-white">
                من عائلتنا
                <svg
                  viewBox="0 0 310 20"
                  preserveAspectRatio="none"
                  className="absolute -bottom-2 right-0 h-3 w-full text-secondaryColor"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M3 14C75 2 180 3 307 10"
                    stroke="currentColor"
                    strokeWidth="7"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <span className="mr-3 inline-block">🐾</span>
            </h1>

            <h2 className="mb-5 text-xl font-bold text-mainColor dark:text-white sm:text-2xl">
              أهلاً بك في كاجو، عالم أليفك المفضّل!
            </h2>

            <p className="mx-auto mb-8 max-w-[540px] text-base leading-[2.1] text-secondaryColor lg:mx-0 sm:text-lg">
              من الرعاية البيطرية إلى التبنّي والتسوّق،
              جمعنا لك كل ما يحتاجه صديقك الأليف
              في مكان واحد.
              تجربة أسهل، واهتمام أكبر، وحياة أجمل لأليفك.
            </p>

            {/* Buttons */}
            <div className="mb-9 flex flex-wrap items-center justify-center gap-4 lg:justify-start">

              <a
                href="/login"
                className="group inline-flex min-h-14 items-center justify-center gap-3 rounded-2xl bg-mainColor px-8 py-3.5 text-base font-bold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-mainColor"
              >
                انضم إلى كاجو
                <Icon
                  name="arrow"
                  size={19}
                  className="transition-transform group-hover:-translate-x-1"
                />
              </a>

              <a
                href="/information"
                className="inline-flex min-h-14 items-center justify-center rounded-2xl border-2 border-secondaryColor bg-white px-8 py-3.5 text-base font-bold text-mainColor transition-all duration-300 hover:-translate-y-1 hover:bg-mainColor/5 dark:bg-[#101828] dark:text-white"
              >
                اكتشف كاجو
              </a>

            </div>

            {/* Features */}
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm font-medium text-secondaryColor lg:justify-start">
              {[
                "خدمات متنوعة",
                "تجربة سهلة",
                "كل شيء بمكان واحد",
              ].map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-2"
                >
                  <Icon
                    name="check"
                    size={18}
                    className="text-mainColor dark:text-white"
                  />
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Hero illustration */}
          <div className="relative order-1 mx-auto flex w-full max-w-[560px] items-center justify-center lg:order-2">

            <div className="relative flex aspect-square w-full max-w-[520px] items-center justify-center">

              <div className="absolute inset-[9%] rounded-full border border-mainColor/15 bg-gradient-to-br from-mainColor/10 via-white to-secondaryColor/10 shadow-xl dark:via-[#101828]" />

              <div className="absolute inset-[3%] rounded-full border border-dashed border-mainColor/20" />

              <div className="absolute left-[14%] top-[13%] h-4 w-4 rounded-full bg-secondaryColor" />
              <div className="absolute bottom-[19%] right-[7%] h-3 w-3 rounded-full bg-mainColor" />

              <img
                src={img1}
                alt="كاجو - منصة الخدمات البيطرية"
                className="relative z-10 w-[70%] max-h-[72%] object-contain drop-shadow-xl transition-transform duration-500 hover:scale-105"
              />

              {/* Floating card 1 */}
              <div className="absolute -left-1 top-[18%] z-20 flex items-center gap-3 rounded-2xl border border-mainColor/10 bg-white px-4 py-3 shadow-xl dark:bg-[#1D2939] sm:-left-5">

                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-mainColor/10 text-mainColor dark:text-white">
                  <Icon name="heart" size={23} />
                </span>

                <div className="text-right">
                  <p className="text-sm font-extrabold text-mainColor dark:text-white">
                    رعاية واهتمام
                  </p>
                  <p className="mt-1 text-xs text-secondaryColor">
                    لأنهم يستحقون الأفضل
                  </p>
                </div>
              </div>

              {/* Floating card 2 */}
              <div className="absolute -right-1 bottom-[17%] z-20 flex items-center gap-3 rounded-2xl border border-mainColor/10 bg-white px-4 py-3 shadow-xl dark:bg-[#1D2939] sm:-right-5">

                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondaryColor/10 text-secondaryColor">
                  <Icon name="paw" size={23} />
                </span>

                <div className="text-right">
                  <p className="text-sm font-extrabold text-mainColor dark:text-white">
                    عالم مليء بالحب
                  </p>
                  <p className="mt-1 text-xs text-secondaryColor">
                    لكل صديق أليف
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Service cards */}
        <div className="mt-16 grid gap-4 sm:grid-cols-3 lg:mt-20">

          {services.map((service) => (
            <div
              key={service.title}
              className="group flex items-center gap-4 rounded-3xl border border-mainColor/10 bg-white p-5 shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-mainColor/30 hover:shadow-xl dark:bg-[#1D2939]"
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-mainColor/10 text-mainColor transition-transform duration-300 group-hover:scale-110 dark:text-white">
                <Icon name={service.icon} size={26} />
              </div>

              <div>
                <h3 className="text-base font-extrabold text-mainColor dark:text-white">
                  {service.title}
                </h3>

                <p className="mt-1 text-sm text-secondaryColor">
                  {service.description}
                </p>
              </div>
            </div>
          ))}

        </div>
      </div>
    </main>
  );
}
