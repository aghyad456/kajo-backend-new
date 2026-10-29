
import React from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  FaHome,
  FaArrowRight,
  FaPaw,
  FaCompass,
} from "react-icons/fa";

import notfoundImg from "../../assets/not-found.svg";

export default function NotFound() {
  const navigate = useNavigate();

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/", { replace: true });
    }
  };

  return (
    <main
      dir="rtl"
      className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-fivethColor px-4 py-12 text-mainColor transition-colors duration-500 dark:bg-[#101828] sm:px-8"
    >
      {/* Background decorations */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -right-40 -top-40 h-[450px] w-[450px] rounded-full bg-mainColor/10 blur-[110px]" />
        <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-secondaryColor/10 blur-[110px]" />

        <div className="absolute right-[12%] top-[20%] h-3 w-3 rounded-full bg-secondaryColor/40" />
        <div className="absolute bottom-[18%] left-[15%] h-4 w-4 rounded-full bg-mainColor/20" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center text-center">

        {/* Top badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-mainColor/15 bg-mainColor/5 px-5 py-2.5 text-xs font-extrabold text-mainColor dark:border-white/10 dark:bg-white/10 dark:text-white">
          <FaPaw size={14} />
          يبدو أننا ضللنا الطريق!
        </div>

        {/* Illustration */}
        <div className="relative mb-5 flex w-full max-w-[660px] items-center justify-center">
          <div className="absolute inset-[12%] rounded-full bg-mainColor/5 blur-3xl" />

          <img
            src={notfoundImg}
            alt="رسم توضيحي لصفحة غير موجودة"
            className="relative z-10 h-auto max-h-[410px] w-full object-contain drop-shadow-xl"
          />
        </div>

        {/* Content */}
        <div className="max-w-2xl">
          <p className="mb-3 text-base font-black tracking-[0.25em] text-secondaryColor dark:text-fourthColor">
            ERROR 404
          </p>

          <h1 className="mb-5 text-3xl font-black leading-snug text-mainColor dark:text-white sm:text-4xl md:text-5xl">
            عذراً، هذه الصفحة
            <span className="text-secondaryColor"> غير موجودة!</span>
          </h1>

          <p className="mx-auto max-w-xl text-sm leading-8 text-secondaryColor dark:text-fourthColor sm:text-base">
            يبدو أن الصفحة التي تبحث عنها تم نقلها أو
            حذفها، أو أن الرابط غير صحيح.
            لا تقلق، يمكنك العودة واستكمال رحلتك
            في عالم كاجو.
          </p>
        </div>

        {/* Actions */}
        <div className="mt-9 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">

          <Link
            to="/"
            className="group flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl bg-mainColor px-8 py-4 text-sm font-extrabold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:opacity-90 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-mainColor sm:w-auto"
          >
            <FaHome size={18} />
            العودة للرئيسية
            <FaArrowRight
              size={13}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>

          <button
            type="button"
            onClick={handleGoBack}
            className="flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl border border-mainColor/15 bg-white px-8 py-4 text-sm font-extrabold text-mainColor shadow-sm transition-all duration-300 hover:-translate-y-1 hover:bg-mainColor/5 dark:border-white/10 dark:bg-[#1D2939] dark:text-white sm:w-auto"
          >
            <FaCompass size={17} />
            الرجوع للصفحة السابقة
          </button>
        </div>

        {/* Footer */}
        <div className="mt-12 flex items-center justify-center gap-2 text-xs font-medium text-secondaryColor dark:text-fourthColor">
          <FaPaw className="text-mainColor dark:text-white" />
          كاجو — لأنهم من عائلتنا
        </div>
      </div>
    </main>
  );
}
