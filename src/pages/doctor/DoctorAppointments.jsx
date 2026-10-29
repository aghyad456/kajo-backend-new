import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FaCalendarAlt, FaClock, FaCheckCircle, FaTimesCircle,
  FaHourglassHalf, FaSearch, FaSyncAlt, FaPaw,
  FaEnvelope, FaUser, FaNotesMedical, FaExclamationTriangle,
  FaTimes, FaStethoscope, FaFilter,
} from "react-icons/fa";
import { api } from "../../api/apiClient";

const STATUS = {
  pending: { label: "قيد المراجعة", icon: FaHourglassHalf, style: "bg-secondaryColor/10 text-secondaryColor dark:text-fourthColor" },
  approved: { label: "تم التأكيد", icon: FaCheckCircle, style: "bg-mainColor/10 text-mainColor dark:text-white" },
  rejected: { label: "مرفوض", icon: FaTimesCircle, style: "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-300" },
};

const FILTERS = [
  { value: "", label: "جميع الحجوزات" },
  { value: "pending", label: "قيد المراجعة" },
  { value: "approved", label: "المؤكدة" },
  { value: "rejected", label: "المرفوضة" },
];

function normalizeAppointments(response) {
  const candidates = [response?.appointments, response?.data?.appointments, response?.data, response];
  for (const item of candidates) {
    if (Array.isArray(item)) return item;
    if (Array.isArray(item?.data)) return item.data;
  }
  return [];
}

function formatDate(value) {
  if (!value) return "—";
  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return String(value);
  const [, y, m, d] = match;
  const dt = new Date(Number(y), Number(m) - 1, Number(d));
  if (dt.getFullYear() !== Number(y) || dt.getMonth() !== Number(m) - 1 || dt.getDate() !== Number(d)) return String(value);
  return new Intl.DateTimeFormat("ar", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(dt);
}

function formatTime(value) {
  if (!value) return "—";
  const match = String(value).match(/^(\d{1,2}):(\d{2})/);
  if (!match) return String(value);
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 23 || minute > 59) return String(value);
  return `${hour % 12 || 12}:${String(minute).padStart(2, "0")} ${hour >= 12 ? "مساءً" : "صباحاً"}`;
}

function SummaryCard({ label, value, icon: Icon }) {
  return (
    <article className="rounded-[24px] border border-mainColor/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1D2939] sm:p-6">
      <div className="mb-5 flex items-start justify-between gap-3">
        <span className="text-sm font-bold text-secondaryColor dark:text-fourthColor">{label}</span>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-mainColor/10 text-mainColor dark:text-white"><Icon size={19} /></span>
      </div>
      <p className="text-3xl font-black tabular-nums text-mainColor dark:text-white">{value}</p>
    </article>
  );
}

function Detail({ icon: Icon, label, children, ltr = false }) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-mainColor/5 text-mainColor dark:bg-white/10 dark:text-white"><Icon size={15} /></span>
      <div className="min-w-0 flex-1">
        <p className="mb-1 text-xs font-medium text-secondaryColor dark:text-fourthColor">{label}</p>
        <p dir={ltr ? "ltr" : undefined} className={`break-words text-sm font-bold leading-7 text-mainColor dark:text-white ${ltr ? "text-right" : ""}`}>{children || "—"}</p>
      </div>
    </div>
  );
}

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const requestSeq = useRef(0);
  const mutationBusy = useRef(false);

  const loadAppointments = useCallback(async (status = "", silent = false) => {
    const seq = ++requestSeq.current;
    if (silent) setRefreshing(true);
    else setLoading(true);
    setError("");
    try {
      const response = await api.doctorAppointments(status || undefined);
      if (seq !== requestSeq.current) return;
      setAppointments(normalizeAppointments(response));
    } catch (err) {
      if (seq === requestSeq.current) {
        setError(err?.data?.message || err?.message || "تعذّر تحميل الحجوزات.");
      }
    } finally {
      if (seq === requestSeq.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    loadAppointments(statusFilter);
    return () => { requestSeq.current += 1; };
  }, [statusFilter, loadAppointments]);

  const visibleAppointments = useMemo(() => {
    const needle = search.trim().toLocaleLowerCase("ar");
    return appointments.filter((a) => {
      if (!needle) return true;
      return [a.owner_name, a.owner_email, a.animal_type, a.notes, a.date, a.time, a.id]
        .some((value) => String(value ?? "").toLocaleLowerCase("ar").includes(needle));
    }).sort((a, b) => `${a.date || ""} ${a.time || ""}`.localeCompare(`${b.date || ""} ${b.time || ""}`));
  }, [appointments, search]);

  const counts = useMemo(() => ({
    all: appointments.length,
    pending: appointments.filter((a) => a.status === "pending").length,
    approved: appointments.filter((a) => a.status === "approved").length,
    rejected: appointments.filter((a) => a.status === "rejected").length,
  }), [appointments]);

  const handleUpdateStatus = async (appointmentId, newStatus) => {
    if (mutationBusy.current) return;
    const target = appointments.find((a) => String(a.id) === String(appointmentId));
    if (!target || target.status !== "pending" || !["approved", "rejected"].includes(newStatus)) return;
    mutationBusy.current = true;
    setBusyId(appointmentId);
    setError("");
    setNotice(null);
    try {
      await api.updateAppointmentStatus(appointmentId, newStatus);
      setAppointments((prev) => prev.map((a) => String(a.id) === String(appointmentId) ? { ...a, status: newStatus } : a)
        .filter((a) => !statusFilter || a.status === statusFilter));
      setRejectTarget(null);
      setNotice({ type: "success", message: newStatus === "approved" ? "تم تأكيد الحجز بنجاح." : "تم رفض الحجز بنجاح." });
    } catch (err) {
      setNotice({ type: "error", message: err?.data?.message || err?.message || "تعذّر تحديث حالة الحجز." });
    } finally {
      mutationBusy.current = false;
      setBusyId(null);
    }
  };

  return (
    <main dir="rtl" className="relative min-h-screen bg-fivethColor px-4 py-9 text-mainColor transition-colors duration-500 dark:bg-[#101828] sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="relative mb-8 overflow-hidden rounded-[30px] bg-mainColor px-6 py-9 text-white shadow-lg sm:px-9">
          <div aria-hidden="true" className="pointer-events-none absolute -left-16 -top-24 h-64 w-64 rounded-full bg-white/10" />
          <div className="relative flex flex-wrap items-center justify-between gap-5">
            <div>
              <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-extrabold"><FaStethoscope /> لوحة الطبيب البيطري</span>
              <h1 className="text-3xl font-black sm:text-4xl">إدارة المواعيد والحجوزات</h1>
              <p className="mt-3 max-w-2xl text-sm leading-8 text-white/85">راجع طلبات الحجز، وتعرّف على تفاصيل الحيوان وصاحبه، ثم أكّد الموعد أو ارفضه عند الحاجة.</p>
            </div>
            <span className="flex h-20 w-20 items-center justify-center rounded-[24px] border border-white/20 bg-white/10"><FaCalendarAlt size={34} /></span>
          </div>
        </header>

        {notice && (
          <div role="status" aria-live="polite" className={`mb-6 flex items-start justify-between gap-3 rounded-2xl border p-4 text-sm font-bold ${notice.type === "success" ? "border-mainColor/20 bg-mainColor/10 text-mainColor dark:text-white" : "border-red-200 bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-300"}`}>
            <span className="flex items-center gap-2">{notice.type === "success" ? <FaCheckCircle /> : <FaExclamationTriangle />}{notice.message}</span>
            <button type="button" aria-label="إغلاق الرسالة" onClick={() => setNotice(null)}><FaTimes /></button>
          </div>
        )}

        <section aria-label="ملخص الحجوزات" className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <SummaryCard label={statusFilter ? "الحجوزات المعروضة في التصنيف" : "الحجوزات المحمّلة"} value={loading ? "—" : counts.all} icon={FaCalendarAlt} />
          <SummaryCard label="قيد المراجعة" value={loading ? "—" : counts.pending} icon={FaHourglassHalf} />
          <SummaryCard label="تم تأكيدها" value={loading ? "—" : counts.approved} icon={FaCheckCircle} />
          <SummaryCard label="مرفوضة" value={loading ? "—" : counts.rejected} icon={FaTimesCircle} />
        </section>
        <p className="-mt-5 mb-8 text-xs leading-6 text-secondaryColor dark:text-fourthColor">الإحصائيات تخص نتائج التصنيف المحمّلة من الخادم، وقد لا تشمل جميع الحجوزات إذا كان الـ API يستخدم صفحات.</p>

        <section className="mb-7 rounded-[26px] border border-mainColor/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1D2939] sm:p-7">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <div><h2 className="text-lg font-extrabold text-mainColor dark:text-white">استعراض الحجوزات</h2><p className="mt-1 text-sm text-secondaryColor dark:text-fourthColor">ابحث وتابع حالة طلبات المرضى.</p></div>
            <button type="button" onClick={() => loadAppointments(statusFilter, true)} disabled={loading || refreshing || busyId != null} className="inline-flex items-center gap-2 rounded-xl border border-mainColor/20 px-4 py-2.5 text-sm font-bold text-mainColor disabled:opacity-50 dark:text-white"><FaSyncAlt className={refreshing ? "animate-spin" : ""} /> تحديث</button>
          </div>
          <div className="relative mb-5">
            <FaSearch className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-mainColor/60 dark:text-white/60" />
            <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ابحث باسم المريض أو البريد أو نوع الحيوان..." aria-label="البحث في الحجوزات" className="h-13 w-full rounded-2xl border border-mainColor/15 bg-fivethColor py-3 pl-4 pr-12 text-sm font-medium text-mainColor outline-none focus:border-mainColor dark:border-white/10 dark:bg-[#101828] dark:text-white" />
          </div>
          <div className="flex flex-wrap items-center gap-2" aria-label="تصفية الحجوزات">
            <FaFilter className="ml-2 text-secondaryColor" />
            {FILTERS.map((f) => (
              <button type="button" key={f.value} onClick={() => { setStatusFilter(f.value); setNotice(null); }} aria-pressed={statusFilter === f.value} className={`rounded-xl px-4 py-2.5 text-xs font-extrabold transition-all sm:text-sm ${statusFilter === f.value ? "bg-mainColor text-white shadow-sm" : "border border-mainColor/10 bg-mainColor/5 text-mainColor hover:bg-mainColor/10 dark:bg-white/5 dark:text-white"}`}>{f.label}</button>
            ))}
          </div>
        </section>

        {error && <div role="alert" className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-bold text-red-700 dark:bg-red-950/20 dark:text-red-300"><span className="flex items-center gap-2"><FaExclamationTriangle /> {error}</span><button type="button" onClick={() => loadAppointments(statusFilter)} className="rounded-xl bg-mainColor px-4 py-2 text-white">إعادة المحاولة</button></div>}

        {loading ? (
          <div role="status" className="grid gap-5" aria-label="جارٍ تحميل الحجوزات">
            {[1, 2, 3].map((n) => <div key={n} className="h-52 animate-pulse rounded-[26px] border border-mainColor/10 bg-white p-6 dark:bg-[#1D2939]"><div className="mb-8 h-5 w-40 rounded-full bg-mainColor/10" /><div className="mb-4 h-3 w-3/4 rounded-full bg-mainColor/10" /><div className="h-3 w-1/2 rounded-full bg-mainColor/10" /></div>)}
          </div>
        ) : !error && visibleAppointments.length === 0 ? (
          <div className="rounded-[28px] border border-mainColor/10 bg-white px-6 py-14 text-center shadow-sm dark:bg-[#1D2939]">
            <FaPaw size={37} className="mx-auto mb-5 text-mainColor dark:text-white" />
            <h3 className="text-xl font-black text-mainColor dark:text-white">لا توجد حجوزات مطابقة</h3>
            <p className="mt-3 text-sm leading-7 text-secondaryColor dark:text-fourthColor">{search ? "جرّب كلمة بحث مختلفة." : "لم تُعرض حجوزات ضمن هذا التصنيف حالياً."}</p>
          </div>
        ) : !error && (
          <div className="space-y-5">
            <p className="text-sm font-bold text-secondaryColor dark:text-fourthColor">عدد النتائج المعروضة: {visibleAppointments.length}</p>
            {visibleAppointments.map((a) => {
              const status = STATUS[a.status] || { label: String(a.status || "غير معروف"), icon: FaClock, style: "bg-mainColor/5 text-mainColor dark:text-white" };
              const StatusIcon = status.icon;
              const busy = busyId != null;
              return (
                <article key={a.id} className="overflow-hidden rounded-[27px] border border-mainColor/10 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-white/10 dark:bg-[#1D2939]">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-mainColor/10 px-5 py-5 sm:px-7">
                    <div className="flex items-center gap-3"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-mainColor/10 text-mainColor dark:text-white"><FaPaw size={19} /></span><div><h3 className="font-extrabold text-mainColor dark:text-white">حجز بيطري #{a.id}</h3><p className="mt-1 text-xs text-secondaryColor dark:text-fourthColor">{a.owner_name || "اسم المريض غير متوفر"}</p></div></div>
                    <span className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-extrabold ${status.style}`}><StatusIcon />{status.label}</span>
                  </div>
                  <div className="grid gap-6 p-5 sm:grid-cols-2 sm:p-7 lg:grid-cols-3">
                    <Detail icon={FaUser} label="اسم صاحب الحيوان">{a.owner_name}</Detail>
                    <Detail icon={FaEnvelope} label="البريد الإلكتروني" ltr>{a.owner_email}</Detail>
                    <Detail icon={FaPaw} label="نوع الحيوان">{a.animal_type}</Detail>
                    <Detail icon={FaCalendarAlt} label="تاريخ الموعد">{formatDate(a.date)}</Detail>
                    <Detail icon={FaClock} label="وقت الموعد">{formatTime(a.time)}</Detail>
                    <Detail icon={FaNotesMedical} label="ملاحظات الحالة">{a.notes || "لا توجد ملاحظات"}</Detail>
                  </div>
                  {a.status === "pending" && (
                    <div className="flex flex-wrap gap-3 border-t border-mainColor/10 px-5 py-5 sm:px-7">
                      <button type="button" disabled={busy} onClick={() => handleUpdateStatus(a.id, "approved")} className="inline-flex items-center justify-center gap-2 rounded-xl bg-mainColor px-6 py-3 text-sm font-extrabold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"><FaCheckCircle />{busyId === a.id ? "جارٍ المعالجة..." : "تأكيد الحجز"}</button>
                      <button type="button" disabled={busy} onClick={() => setRejectTarget(a)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-6 py-3 text-sm font-extrabold text-red-700 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900 dark:bg-red-950/20 dark:text-red-300"><FaTimesCircle />رفض الحجز</button>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>

      {rejectTarget && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onMouseDown={(e) => { if (e.target === e.currentTarget && !mutationBusy.current) setRejectTarget(null); }}>
          <div role="alertdialog" aria-modal="true" aria-labelledby="reject-title" aria-describedby="reject-description" className="w-full max-w-md rounded-[28px] bg-white p-7 shadow-2xl dark:bg-[#1D2939]">
            <FaExclamationTriangle size={30} className="mb-5 text-red-600" />
            <h2 id="reject-title" className="mb-3 text-xl font-black text-mainColor dark:text-white">تأكيد رفض الحجز</h2>
            <p id="reject-description" className="text-sm leading-8 text-secondaryColor dark:text-fourthColor">هل تريد رفض حجز {rejectTarget.owner_name || "المستخدم"}؟ تأكد من القرار قبل المتابعة.</p>
            <div className="mt-7 flex gap-3">
              <button type="button" autoFocus disabled={busyId != null} onClick={() => setRejectTarget(null)} className="flex-1 rounded-xl border border-mainColor/15 px-4 py-3 font-bold text-mainColor disabled:opacity-50 dark:text-white">إلغاء</button>
              <button type="button" disabled={busyId != null} onClick={() => handleUpdateStatus(rejectTarget.id, "rejected")} className="flex-1 rounded-xl bg-red-600 px-4 py-3 font-bold text-white disabled:opacity-50">{busyId === rejectTarget.id ? "جارٍ الرفض..." : "تأكيد الرفض"}</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
