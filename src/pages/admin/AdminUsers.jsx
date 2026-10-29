
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  FaUsers,
  FaSearch,
  FaSyncAlt,
  FaTrashAlt,
  FaUserShield,
  FaUser,
  FaStore,
  FaHome,
  FaUserMd,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimes,
  FaFilter,
} from "react-icons/fa";

import { api } from "../../api/apiClient";
import { useAuth } from "../../context/AuthContext";

// ======================================
// ROLES
// ======================================

const ROLE_OPTIONS = [
  { value: 1, label: "مدير النظام", icon: FaUserShield },
  { value: 2, label: "مستخدم عادي", icon: FaUser },
  { value: 3, label: "صاحب متجر", icon: FaStore },
  { value: 4, label: "صاحب ملجأ", icon: FaHome },
  { value: 5, label: "طبيب بيطري", icon: FaUserMd },
];

const getRole = (role) =>
  ROLE_OPTIONS.find((item) => item.value === Number(role));

function UserAvatar({ user }) {
  const initial =
    String(user?.name || "ك").trim().charAt(0) || "ك";

  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-mainColor/10 text-lg font-black text-mainColor dark:text-white">
      {initial}
    </div>
  );
}

// ======================================
// MAIN PAGE
// ======================================

export default function UsersAdmin() {
  const { user: authUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const [busyIds, setBusyIds] = useState([]);
  const [notification, setNotification] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);

  const requestRef = useRef(0);
  const mountedRef = useRef(false);

  const currentUserId = authUser?.id;

  // ======================================
  // DATA LOADING
  // ======================================

  const loadUsers = useCallback(async () => {
    const requestId = ++requestRef.current;

    setLoading(true);
    setError("");

    try {
      const response = await api.adminUsers();

      if (!mountedRef.current ||
          requestId !== requestRef.current) {
        return;
      }

      const list = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
        ? response.data
        : [];

      setUsers(list);
    } catch (err) {
      if (!mountedRef.current ||
          requestId !== requestRef.current) {
        return;
      }

      setError(err?.message || "تعذر جلب المستخدمين");
    } finally {
      if (mountedRef.current &&
          requestId === requestRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    loadUsers();

    return () => {
      mountedRef.current = false;
      requestRef.current += 1;
    };
  }, [loadUsers]);

  // ======================================
  // HELPERS
  // ======================================

  const isSelf = (id) =>
    currentUserId != null &&
    String(currentUserId) === String(id);

  const isBusy = (id) =>
    busyIds.some((busyId) => String(busyId) === String(id));

  const setBusy = (id, value) => {
    setBusyIds((prev) =>
      value
        ? [...prev, id]
        : prev.filter((item) => String(item) !== String(id))
    );
  };

  const showMessage = (type, message) => {
    setNotification({ type, message });
  };

  // ======================================
  // FILTERING
  // ======================================

  const filteredUsers = useMemo(() => {
    const search = query.trim().toLowerCase();

    return users.filter((user) => {
      const name = String(user.name || "").toLowerCase();
      const email = String(user.email || "").toLowerCase();
      const id = String(user.id);
      const roleLabel = String(
        getRole(user.role)?.label || ""
      ).toLowerCase();

      const matchesSearch =
        !search ||
        name.includes(search) ||
        email.includes(search) ||
        id.includes(search) ||
        roleLabel.includes(search);

      const matchesRole =
        roleFilter === "all" ||
        Number(user.role) === Number(roleFilter);

      return matchesSearch && matchesRole;
    });
  }, [users, query, roleFilter]);

  const totalUsers = users.length;

  const adminCount = users.filter(
    (user) => Number(user.role) === 1
  ).length;

  const regularCount = users.filter(
    (user) => Number(user.role) === 2 ||
      Number(user.role) === 0
  ).length;

  // ======================================
  // UPDATE ROLE
  // ======================================

  const updateRole = async (id, newRole) => {
    if (isBusy(id)) return;

    if (isSelf(id)) {
      showMessage(
        "error",
        "لا يمكنك تغيير دور حسابك الحالي."
      );
      return;
    }

    const roleNum = Number(newRole);

    const target = users.find(
      (user) => String(user.id) === String(id)
    );

    if (!target) return;

    if (Number(target.role) === roleNum) return;

    if (!ROLE_OPTIONS.some((r) => r.value === roleNum)) {
      showMessage("error", "الدور المحدد غير صالح.");
      return;
    }

    setBusy(id, true);
    setNotification(null);

    try {
      await api.adminUpdateUserRole(id, roleNum);

      if (!mountedRef.current) return;

      setUsers((prev) =>
        prev.map((user) =>
          String(user.id) === String(id)
            ? { ...user, role: roleNum }
            : user
        )
      );

      showMessage(
        "success",
        `تم تحديث دور ${target.name || "المستخدم"} بنجاح.`
      );
    } catch (err) {
      if (mountedRef.current) {
        showMessage(
          "error",
          err?.message || "فشل تحديث دور المستخدم."
        );
      }
    } finally {
      if (mountedRef.current) setBusy(id, false);
    }
  };

  // ======================================
  // DELETE USER
  // ======================================

  const deleteUser = async () => {
    if (!deleteTarget) return;

    const target = deleteTarget;
    const id = target.id;

    if (isBusy(id)) return;

    if (isSelf(id)) {
      setDeleteTarget(null);
      showMessage("error", "لا يمكنك حذف حسابك الحالي.");
      return;
    }

    setBusy(id, true);
    setNotification(null);

    try {
      await api.adminDeleteUser(id);

      if (!mountedRef.current) return;

      setUsers((prev) =>
        prev.filter(
          (user) => String(user.id) !== String(id)
        )
      );

      setDeleteTarget(null);

      showMessage(
        "success",
        `تم حذف حساب ${target.name || "المستخدم"} بنجاح.`
      );
    } catch (err) {
      if (mountedRef.current) {
        showMessage(
          "error",
          err?.message || "فشل حذف المستخدم."
        );
      }
    } finally {
      if (mountedRef.current) setBusy(id, false);
    }
  };

  // ======================================
  // USER ROW CONTENT
  // ======================================

  const renderUserActions = (user, mobile = false) => {
    const current = isSelf(user.id);
    const busy = isBusy(user.id);
    const roleValue = Number(user.role);

    return (
      <div
        className={[
          "flex items-center gap-3",
          mobile ? "w-full flex-wrap" : "",
        ].join(" ")}
      >
        <select
          aria-label={`تغيير دور ${user.name || "المستخدم"}`}
          value={roleValue}
          disabled={
            current ||
            busy ||
            loading ||
            !getRole(roleValue)
          }
          onChange={(event) =>
            updateRole(user.id, event.target.value)
          }
          className="min-w-0 max-w-full flex-1 rounded-xl border border-mainColor/15 bg-white px-3 py-2.5 text-xs font-bold text-mainColor outline-none transition-colors focus:border-mainColor disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-[#101828] dark:text-white"
        >
          {!getRole(roleValue) && (
            <option value={roleValue}>
              دور غير معروف ({roleValue})
            </option>
          )}

          {ROLE_OPTIONS.map((role) => (
            <option key={role.value} value={role.value}>
              {role.label}
            </option>
          ))}
        </select>

        <button
          type="button"
          title={
            current
              ? "لا يمكنك حذف حسابك"
              : "حذف المستخدم"
          }
          aria-label={`حذف ${user.name || "المستخدم"}`}
          disabled={current || busy || loading}
          onClick={() => setDeleteTarget(user)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-600 transition-all hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-red-900/40 dark:bg-red-950/20"
        >
          <FaTrashAlt size={15} />
        </button>

        {busy && (
          <FaSyncAlt
            className="animate-spin text-mainColor dark:text-white"
            size={15}
          />
        )}
      </div>
    );
  };

  // ======================================
  // RENDER
  // ======================================

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-fivethColor px-4 py-10 text-mainColor transition-colors duration-500 dark:bg-[#101828] sm:px-6"
    >
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <header className="mb-9 flex flex-wrap items-center justify-between gap-5">
          <div>
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-mainColor/15 bg-mainColor/5 px-4 py-2 text-xs font-bold text-mainColor dark:text-white">
              <FaUserShield />
              إدارة الحسابات
            </span>

            <h1 className="text-3xl font-black text-mainColor dark:text-white sm:text-4xl">
              إدارة المستخدمين
            </h1>

            <p className="mt-3 text-sm leading-7 text-secondaryColor dark:text-fourthColor">
              عرض حسابات كاجو والبحث عنها وإدارة أدوارها.
            </p>
          </div>

          <button
            type="button"
            disabled={loading || busyIds.length > 0}
            onClick={loadUsers}
            className="inline-flex h-12 items-center gap-3 rounded-2xl border border-mainColor/15 bg-white px-5 text-sm font-extrabold text-mainColor shadow-sm transition-all hover:bg-mainColor/5 disabled:opacity-50 dark:bg-[#1D2939] dark:text-white"
          >
            <FaSyncAlt
              className={loading ? "animate-spin" : ""}
            />
            تحديث المستخدمين
          </button>
        </header>

        {/* SUMMARY */}
        <section className="mb-8 grid gap-4 sm:grid-cols-3">
          {[
            {
              label: "إجمالي المستخدمين المحمّلين",
              value: totalUsers,
              icon: FaUsers,
            },
            {
              label: "حسابات الإدارة",
              value: adminCount,
              icon: FaUserShield,
            },
            {
              label: "الحسابات العادية",
              value: regularCount,
              icon: FaUser,
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className="flex items-center gap-4 rounded-[24px] border border-mainColor/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1D2939]"
              >
                <span className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-mainColor/10 p-4 text-mainColor dark:text-white">
                  <Icon size={21} />
                </span>

                <div>
                  <p className="text-xs font-bold text-secondaryColor dark:text-fourthColor">
                    {item.label}
                  </p>

                  <p className="mt-2 text-2xl font-black text-mainColor dark:text-white">
                    {loading ? "—" : item.value}
                  </p>
                </div>
              </div>
            );
          })}
        </section>

        {/* NOTIFICATION */}
        {notification && (
          <div
            role="status"
            aria-live="polite"
            className={[
              "mb-6 flex items-center justify-between gap-3 rounded-2xl border p-4",
              notification.type === "success"
                ? "border-mainColor/20 bg-mainColor/10 text-mainColor dark:text-white"
                : "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/20 dark:text-red-300",
            ].join(" ")}
          >
            <div className="flex items-center gap-3 text-sm font-bold">
              {notification.type === "success" ? (
                <FaCheckCircle />
              ) : (
                <FaExclamationTriangle />
              )}

              <span>{notification.message}</span>
            </div>

            <button
              type="button"
              onClick={() => setNotification(null)}
              aria-label="إغلاق الرسالة"
            >
              <FaTimes />
            </button>
          </div>
        )}

        {/* MAIN CARD */}
        <section className="overflow-hidden rounded-[28px] border border-mainColor/10 bg-white shadow-sm dark:border-white/10 dark:bg-[#1D2939]">

          {/* SEARCH AND FILTER */}
          <div className="border-b border-mainColor/10 p-5 sm:p-7">
            <div className="mb-5">
              <h2 className="text-xl font-extrabold text-mainColor dark:text-white">
                قائمة المستخدمين
              </h2>

              <p className="mt-2 text-sm text-secondaryColor dark:text-fourthColor">
                يمكنك البحث وتصفية الحسابات حسب نوع الدور.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-[1fr_230px]">
              <div className="relative">
                <FaSearch
                  size={17}
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-mainColor/50 dark:text-white/50"
                />

                <input
                  type="search"
                  value={query}
                  onChange={(event) =>
                    setQuery(event.target.value)
                  }
                  placeholder="ابحث بالاسم أو البريد أو الرقم..."
                  className="h-13 w-full rounded-2xl border border-mainColor/15 bg-fivethColor py-3 pl-4 pr-12 text-sm font-medium text-mainColor outline-none focus:border-mainColor dark:border-white/10 dark:bg-[#101828] dark:text-white"
                />
              </div>

              <div className="relative">
                <FaFilter className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-mainColor/60 dark:text-white" />

                <select
                  value={roleFilter}
                  onChange={(event) =>
                    setRoleFilter(event.target.value)
                  }
                  aria-label="تصفية حسب الدور"
                  className="h-13 w-full rounded-2xl border border-mainColor/15 bg-fivethColor py-3 pl-4 pr-11 text-sm font-bold text-mainColor outline-none focus:border-mainColor dark:border-white/10 dark:bg-[#101828] dark:text-white"
                >
                  <option value="all">جميع الأدوار</option>
                  {ROLE_OPTIONS.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <p className="mt-4 text-xs font-bold text-secondaryColor dark:text-fourthColor">
              النتائج: {filteredUsers.length} حساب
            </p>
          </div>

          {/* LOADING */}
          {loading && (
            <div
              role="status"
              className="flex flex-col items-center justify-center gap-4 py-20 text-secondaryColor"
            >
              <FaSyncAlt
                size={26}
                className="animate-spin text-mainColor dark:text-white"
              />
              جارٍ تحميل المستخدمين...
            </div>
          )}

          {/* ERROR */}
          {!loading && error && (
            <div
              role="alert"
              className="p-10 text-center"
            >
              <FaExclamationTriangle
                size={30}
                className="mx-auto mb-4 text-red-500"
              />

              <p className="mb-5 font-bold text-red-600">
                {error}
              </p>

              <button
                type="button"
                onClick={loadUsers}
                className="rounded-xl bg-mainColor px-6 py-3 text-sm font-bold text-white"
              >
                إعادة المحاولة
              </button>
            </div>
          )}

          {/* DESKTOP TABLE */}
          {!loading && !error && (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[760px] text-right">
                  <thead className="bg-mainColor/5 dark:bg-white/5">
                    <tr className="text-sm text-mainColor dark:text-white">
                      <th className="px-6 py-5 font-extrabold">
                        المستخدم
                      </th>
                      <th className="px-6 py-5 font-extrabold">
                        رقم الحساب
                      </th>
                      <th className="px-6 py-5 font-extrabold">
                        الدور الحالي
                      </th>
                      <th className="px-6 py-5 font-extrabold">
                        إدارة الحساب
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredUsers.map((user) => {
                      const role = getRole(user.role);
                      const current = isSelf(user.id);

                      return (
                        <tr
                          key={user.id}
                          className="border-t border-mainColor/10 transition-colors hover:bg-mainColor/[0.03] dark:border-white/10"
                        >
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <UserAvatar user={user} />

                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="font-extrabold text-mainColor dark:text-white">
                                    {user.name || "بدون اسم"}
                                  </p>

                                  {current && (
                                    <span className="rounded-lg bg-mainColor/10 px-2 py-1 text-[10px] font-bold text-mainColor dark:text-white">
                                      حسابك
                                    </span>
                                  )}
                                </div>

                                <p
                                  dir="ltr"
                                  className="mt-1 break-all text-right text-xs text-secondaryColor dark:text-fourthColor"
                                >
                                  {user.email || "—"}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-5 text-sm font-bold text-secondaryColor dark:text-fourthColor">
                            #{user.id}
                          </td>

                          <td className="px-6 py-5">
                            <span className="inline-flex rounded-xl border border-mainColor/10 bg-mainColor/5 px-3 py-2 text-xs font-extrabold text-mainColor dark:text-white">
                              {role?.label ||
                                `دور غير معروف (${user.role})`}
                            </span>
                          </td>

                          <td className="px-6 py-5">
                            {renderUserActions(user)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* MOBILE CARDS */}
              <div className="space-y-4 p-4 md:hidden">
                {filteredUsers.map((user) => {
                  const role = getRole(user.role);

                  return (
                    <article
                      key={user.id}
                      className="rounded-2xl border border-mainColor/10 bg-fivethColor p-4 dark:border-white/10 dark:bg-[#101828]"
                    >
                      <div className="mb-4 flex items-center gap-3">
                        <UserAvatar user={user} />

                        <div className="min-w-0 flex-1">
                          <p className="break-words text-sm font-extrabold text-mainColor dark:text-white">
                            {user.name || "بدون اسم"}
                            {isSelf(user.id) && " (حسابك)"}
                          </p>

                          <p
                            dir="ltr"
                            className="mt-1 break-all text-right text-xs text-secondaryColor dark:text-fourthColor"
                          >
                            {user.email || "—"}
                          </p>
                        </div>
                      </div>

                      <div className="mb-4 flex items-center justify-between gap-3">
                        <span className="text-xs text-secondaryColor dark:text-fourthColor">
                          #{user.id}
                        </span>

                        <span className="rounded-lg bg-mainColor/10 px-3 py-1.5 text-xs font-bold text-mainColor dark:text-white">
                          {role?.label ||
                            `دور غير معروف (${user.role})`}
                        </span>
                      </div>

                      {renderUserActions(user, true)}
                    </article>
                  );
                })}
              </div>

              {/* EMPTY */}
              {filteredUsers.length === 0 && (
                <div className="px-6 py-14 text-center">
                  <FaUsers
                    size={34}
                    className="mx-auto mb-4 text-mainColor/40"
                  />

                  <h3 className="font-extrabold text-mainColor dark:text-white">
                    لا توجد نتائج مطابقة
                  </h3>

                  <p className="mt-2 text-sm text-secondaryColor dark:text-fourthColor">
                    جرّب تغيير البحث أو نوع الحساب.
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      setRoleFilter("all");
                    }}
                    className="mt-5 rounded-xl bg-mainColor px-5 py-2.5 text-sm font-bold text-white"
                  >
                    إظهار جميع المستخدمين
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>

      {/* ======================================
          DELETE CONFIRMATION MODAL
      ====================================== */}

      {deleteTarget && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !isBusy(deleteTarget.id)
            ) {
              setDeleteTarget(null);
            }
          }}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-user-title"
            aria-describedby="delete-user-description"
            className="w-full max-w-md rounded-[28px] bg-white p-7 text-right shadow-2xl dark:bg-[#1D2939]"
          >
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500 dark:bg-red-950/30">
              <FaTrashAlt size={25} />
            </div>

            <h2
              id="delete-user-title"
              className="mb-3 text-2xl font-black text-mainColor dark:text-white"
            >
              تأكيد حذف المستخدم
            </h2>

            <p
              id="delete-user-description"
              className="text-sm leading-8 text-secondaryColor dark:text-fourthColor"
            >
              هل أنت متأكد من حذف حساب
              <strong className="mx-1 text-mainColor dark:text-white">
                {deleteTarget.name || "المستخدم"}
              </strong>
              ؟ قد تكون لهذه العملية آثار على بيانات
              الحساب المرتبطة به.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                autoFocus
                disabled={isBusy(deleteTarget.id)}
                onClick={() => setDeleteTarget(null)}
                className="flex-1 rounded-xl border border-mainColor/15 px-5 py-3 font-bold text-mainColor disabled:opacity-50 dark:text-white"
              >
                إلغاء
              </button>

              <button
                type="button"
                disabled={isBusy(deleteTarget.id)}
                onClick={deleteUser}
                className="flex-1 rounded-xl bg-red-600 px-5 py-3 font-bold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
              >
                {isBusy(deleteTarget.id)
                  ? "جارٍ الحذف..."
                  : "تأكيد الحذف"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
