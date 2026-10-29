
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaUsers,
  FaClock,
  FaCheckCircle,
  FaArrowLeft,
  FaSyncAlt,
  FaClipboardList,
  FaUserCog,
  FaPaw,
  FaExclamationTriangle,
  FaChartBar,
  FaShieldAlt,
} from "react-icons/fa";

import { api } from "../../api/apiClient";

const actions = [
  {
    title: "طلبات الانضمام",
    description: "مراجعة طلبات العيادات والمتاجر والملاجئ",
    path: "/admin/users-requests",
    icon: FaClipboardList,
  },
  {
    title: "إدارة المستخدمين",
    description: "عرض الحسابات وتعديل الأدوار والصلاحيات",
    path: "/admin/users",
    icon: FaUserCog,
  },
  {
    title: "مجتمع كاجو",
    description: "الانتقال إلى المنشورات والمجتمع",
    path: "/app/feed",
    icon: FaPaw,
  },
];

function StatCard({ title, value, icon: Icon, subtitle }) {
  return (
    <article className="group relative overflow-hidden rounded-[26px] border border-mainColor/10 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-[#1D2939]">
      <div className="absolute -left-12 -top-12 h-32 w-32 rounded-full bg-mainColor/5 transition-transform group-hover:scale-125" />

      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-secondaryColor dark:text-fourthColor">
            {title}
          </p>

          <p className="mt-4 text-4xl font-black tabular-nums text-mainColor dark:text-white">
            {Number(value).toLocaleString("ar")}
          </p>
        </div>

        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-mainColor/10 text-mainColor dark:text-white">
          <Icon size={23} />
        </span>
      </div>

      <div className="relative mt-6 border-t border-mainColor/10 pt-4 text-xs font-medium text-secondaryColor dark:text-fourthColor">
        {subtitle}
      </div>
    </article>
  );
}

function DashboardSkeleton() {
  return (
    <div
      role="status"
      aria-label="جارٍ تحميل الإحصائيات"
      className="grid animate-pulse gap-5 md:grid-cols-3"
    >
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="h-48 rounded-[26px] border border-mainColor/10 bg-white p-6 dark:bg-[#1D2939]"
        >
          <div className="mb-8 h-4 w-1/2 rounded bg-mainColor/10" />
          <div className="mb-7 h-10 w-24 rounded bg-mainColor/10" />
          <div className="h-3 w-2/3 rounded bg-mainColor/10" />
        </div>
      ))}
      <span className="sr-only">جارٍ تحميل الإحصائيات...</span>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const requestRef = useRef(0);

  const loadStats = useCallback(async () => {
    const requestId = ++requestRef.current;

    setLoading(true);
    setError("");

    try {
      const data = await api.adminStats();

      if (requestId !== requestRef.current) return;

      setStats(data);
    } catch (err) {
      if (requestId !== requestRef.current) return;

      setError(err?.message || "فشل تحميل الإحصائيات");
    } finally {
      if (requestId === requestRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadStats();

    return () => {
      requestRef.current += 1;
    };
  }, [loadStats]);

  const usersCount = stats?.users ?? 0;
  const pending = stats?.join_requests?.pending ?? 0;
  const approved = stats?.join_requests?.approved ?? 0;

  return (
    <main
      dir="rtl"
      className="relative min-h-screen overflow-hidden bg-fivethColor text-mainColor transition-colors duration-500 dark:bg-[#101828]"
    >
      <div className="pointer-events-none absolute -right-40 -top-40 h-96 w-96 rounded-full bg-mainColor/5 blur-[100px]" />

      <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-7 lg:px-10">

        {/* Page header */}
        <header className="mb-9 flex flex-wrap items-center justify-between gap-5">
          <div>
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-mainColor/15 bg-mainColor/5 px-4 py-2 text-xs font-bold text-mainColor dark:text-white">
              <FaShieldAlt />
              مركز إدارة كاجو
            </span>

            <h1 className="text-3xl font-black text-mainColor dark:text-white sm:text-4xl">
              لوحة التحكم
            </h1>

            <p className="mt-3 text-sm leading-7 text-secondaryColor dark:text-fourthColor">
              أهلاً بك في مركز الإدارة، تابع نشاط المنصة
              وأدر حسابات المستخدمين وطلبات الانضمام.
            </p>
          </div>

          <button
            type="button"
            onClick={loadStats}
            disabled={loading}
            className="inline-flex h-12 items-center gap-3 rounded-2xl border border-mainColor/15 bg-white px-5 text-sm font-extrabold text-mainColor shadow-sm transition-all hover:-translate-y-0.5 hover:bg-mainColor/5 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#1D2939] dark:text-white"
          >
            <FaSyncAlt className={loading ? "animate-spin" : ""} />
            تحديث البيانات
          </button>
        </header>

        {/* Welcome banner */}
        <section className="relative mb-8 overflow-hidden rounded-[30px] bg-mainColor p-7 text-white shadow-xl sm:p-9">
          <div className="pointer-events-none absolute -left-16 -top-20 h-64 w-64 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-24 right-1/4 h-56 w-56 rounded-full bg-secondaryColor/20 blur-3xl" />

          <div className="relative flex flex-wrap items-center justify-between gap-5">
            <div className="max-w-2xl">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
                <FaChartBar size={22} />
              </div>

              <h2 className="mb-3 text-2xl font-black sm:text-3xl">
                إدارة أذكى، وتجربة أفضل
              </h2>

              <p className="text-sm leading-8 text-white/85">
                تابع إحصائيات كاجو، وراجع طلبات
                الانضمام، وتحكّم بالحسابات من مكان واحد.
              </p>
            </div>

            <Link
              to="/admin/users-requests"
              className="inline-flex items-center gap-3 rounded-2xl bg-white px-6 py-3.5 text-sm font-extrabold text-mainColor shadow-md transition-transform hover:-translate-y-1"
            >
              مراجعة الطلبات
              <FaArrowLeft size={14} />
            </Link>
          </div>
        </section>

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="mb-7 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700 dark:border-red-900 dark:bg-red-950/20 dark:text-red-300"
          >
            <div className="flex items-center gap-3">
              <FaExclamationTriangle />
              <p className="text-sm font-bold">{error}</p>
            </div>

            <button
              onClick={loadStats}
              className="rounded-xl bg-mainColor px-5 py-2 text-sm font-bold text-white"
            >
              إعادة المحاولة
            </button>
          </div>
        )}

        {/* Statistics */}
        <section aria-label="إحصائيات المنصة">
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-mainColor/10 text-mainColor dark:text-white">
              <FaChartBar />
            </span>
            <h2 className="text-xl font-extrabold text-mainColor dark:text-white">
              نظرة عامة
            </h2>
          </div>

          {loading ? (
            <DashboardSkeleton />
          ) : !error && stats ? (
            <div className="grid gap-5 md:grid-cols-3">
              <StatCard
                title="إجمالي المستخدمين"
                value={usersCount}
                icon={FaUsers}
                subtitle="الحسابات المسجلة في كاجو"
              />

              <StatCard
                title="طلبات بانتظار المراجعة"
                value={pending}
                icon={FaClock}
                subtitle="طلبات تحتاج إلى قرار إداري"
              />

              <StatCard
                title="طلبات تمت الموافقة عليها"
                value={approved}
                icon={FaCheckCircle}
                subtitle="طلبات الانضمام المقبولة"
              />
            </div>
          ) : null}
        </section>

        {/* Pending alert */}
        {!loading && !error && pending > 0 && (
          <section
            aria-label="طلبات معلقة"
            className="mt-8 flex flex-wrap items-center justify-between gap-5 rounded-[24px] border border-mainColor/20 bg-mainColor/10 p-5 dark:bg-white/5 sm:p-6"
          >
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-mainColor text-white">
                <FaClock size={20} />
              </span>

              <div>
                <h3 className="font-extrabold text-mainColor dark:text-white">
                  لديك {pending} طلبات بانتظار المراجعة
                </h3>

                <p className="mt-1 text-sm text-secondaryColor dark:text-fourthColor">
                  راجع طلبات الانضمام واتخذ القرار المناسب.
                </p>
              </div>
            </div>

            <Link
              to="/admin/users-requests"
              className="inline-flex items-center gap-2 rounded-xl bg-mainColor px-5 py-3 text-sm font-bold text-white"
            >
              عرض الطلبات
              <FaArrowLeft size={13} />
            </Link>
          </section>
        )}

        {/* Quick actions */}
        <section className="mt-12">
          <div className="mb-6">
            <h2 className="text-2xl font-extrabold text-mainColor dark:text-white">
              إدارة المنصة
            </h2>
            <p className="mt-2 text-sm text-secondaryColor dark:text-fourthColor">
              وصول سريع إلى أهم أقسام الإدارة
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {actions.map((action) => {
              const Icon = action.icon;

              return (
                <Link
                  key={action.path}
                  to={action.path}
                  className="group rounded-[26px] border border-mainColor/10 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-mainColor/25 hover:shadow-lg dark:border-white/10 dark:bg-[#1D2939]"
                >
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-mainColor/10 text-mainColor transition-transform group-hover:scale-110 dark:text-white">
                    <Icon size={24} />
                  </div>

                  <h3 className="text-lg font-extrabold text-mainColor dark:text-white">
                    {action.title}
                  </h3>

                  <p className="mt-3 min-h-14 text-sm leading-7 text-secondaryColor dark:text-fourthColor">
                    {action.description}
                  </p>

                  <div className="mt-5 flex items-center gap-2 text-sm font-extrabold text-mainColor dark:text-white">
                    الانتقال للقسم
                    <FaArrowLeft className="transition-transform group-hover:-translate-x-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
