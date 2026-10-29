
import React from "react";
import { Link, Navigate } from "react-router-dom";

import {
  FaPaw,
  FaExclamationTriangle,
  FaHome,
  FaSpinner,
  FaShieldAlt,
} from "react-icons/fa";

import { useAuth } from "../../context/AuthContext";

import FeedPage from "../FeedPage/FeedPage";
import SetupPage from "../SetupPage/SetupPage";

import ShelterDashboard from "../../components/dashboard/ShelterDashboard";
import DoctorDashboard from "../../components/dashboard/DoctorDashboard";
import StoreDashboard from "../../components/dashboard/StoreDashboard";

// ==========================================
// ROLE CONFIGURATION
// ==========================================

const ROLES = {
  ADMIN: 1,
  USER: 2,
  STORE_OWNER: 3,
  SHELTER_OWNER: 4,
  DOCTOR: 5,
};

// Supports Laravel numeric roles and
// legacy frontend string role values.
function normalizeRole(role) {
  if (role === null || role === undefined) {
    return null;
  }

  const numericRole = Number(role);

  if (
    String(role).trim() !== "" &&
    Number.isInteger(numericRole) &&
    numericRole >= 1 &&
    numericRole <= 5
  ) {
    return numericRole;
  }

  const text = String(role).trim().toLowerCase();

  const roleMap = {
    admin: ROLES.ADMIN,
    user: ROLES.USER,
    "shop-owner": ROLES.STORE_OWNER,
    shop_owner: ROLES.STORE_OWNER,
    "store-owner": ROLES.STORE_OWNER,
    store_owner: ROLES.STORE_OWNER,
    "shelter-owner": ROLES.SHELTER_OWNER,
    shelter_owner: ROLES.SHELTER_OWNER,
    doctor: ROLES.DOCTOR,
  };

  return roleMap[text] ?? null;
}

// Prevent "false" or "0" strings
// from incorrectly becoming true.
function normalizeSetup(value) {
  if (value === true || value === 1) return true;

  if (typeof value === "string") {
    return ["true", "1", "yes"].includes(
      value.trim().toLowerCase()
    );
  }

  return false;
}

// ==========================================
// LOADING SCREEN
// ==========================================

function DashboardLoading() {
  return (
    <main
      dir="rtl"
      role="status"
      className="relative flex min-h-[70vh] items-center justify-center bg-fivethColor px-4 dark:bg-[#101828]"
    >
      <div className="flex w-full max-w-md flex-col items-center rounded-[30px] border border-mainColor/10 bg-white px-7 py-14 text-center shadow-lg dark:border-white/10 dark:bg-[#1D2939]">
        <div className="relative mb-7 flex h-24 w-24 items-center justify-center rounded-full bg-mainColor/10">
          <span className="absolute inset-2 animate-pulse rounded-full border-2 border-dashed border-mainColor/30" />

          <FaPaw
            size={38}
            className="relative text-mainColor dark:text-white"
          />
        </div>

        <h1 className="mb-3 text-xl font-black text-mainColor dark:text-white">
          أهلاً بك في كاجو
        </h1>

        <p className="mb-6 text-sm leading-7 text-secondaryColor dark:text-fourthColor">
          جارٍ تجهيز لوحة التحكم المناسبة لحسابك...
        </p>

        <FaSpinner
          size={23}
          className="animate-spin text-mainColor dark:text-white"
        />

        <span className="sr-only">
          جارٍ تحميل لوحة التحكم...
        </span>
      </div>
    </main>
  );
}

// ==========================================
// UNKNOWN ROLE SCREEN
// ==========================================

function UnknownRole({ role }) {
  return (
    <main
      dir="rtl"
      className="flex min-h-[70vh] items-center justify-center bg-fivethColor px-4 py-12 dark:bg-[#101828]"
    >
      <div className="w-full max-w-lg rounded-[30px] border border-mainColor/10 bg-white p-8 text-center shadow-lg dark:border-white/10 dark:bg-[#1D2939]">
        <span className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-mainColor/10 text-mainColor dark:text-white">
          <FaExclamationTriangle size={31} />
        </span>

        <h1 className="mb-4 text-2xl font-black text-mainColor dark:text-white">
          تعذر تحديد لوحة التحكم
        </h1>

        <p className="mb-5 text-sm leading-8 text-secondaryColor dark:text-fourthColor">
          لم نتمكن من تحديد نوع الحساب الحالي.
          يرجى التواصل مع إدارة كاجو إذا استمرت المشكلة.
        </p>

        <p className="mb-7 rounded-xl bg-mainColor/5 px-4 py-3 text-xs font-bold text-secondaryColor dark:bg-white/5 dark:text-fourthColor">
          الدور الحالي: {String(role ?? "غير محدد")}
        </p>

        <Link
          to="/"
          className="inline-flex items-center justify-center gap-3 rounded-2xl bg-mainColor px-7 py-3.5 text-sm font-extrabold text-white shadow-md transition-all hover:-translate-y-0.5 hover:opacity-90"
        >
          <FaHome size={16} />
          العودة للرئيسية
        </Link>
      </div>
    </main>
  );
}

// ==========================================
// MAIN DASHBOARD
// ==========================================

export default function DashboardPage() {
  const { user, loading } = useAuth();

  // Wait until AuthContext restores the session.
  if (loading) {
    return <DashboardLoading />;
  }

  // Not authenticated
  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  const role = normalizeRole(user.role);

  const hasSetup = normalizeSetup(
    user.hasSetup ?? user.has_setup
  );

  // ======================================
  // ADMIN
  // ======================================

  if (role === ROLES.ADMIN) {
    return (
      <Navigate
        to="/admin/dashboard"
        replace
      />
    );
  }

  // ======================================
  // REGULAR USER
  // ======================================

  if (role === ROLES.USER) {
    return <FeedPage />;
  }

  // ======================================
  // BUSINESS SETUP
  // ======================================

  const businessRoles = [
    ROLES.STORE_OWNER,
    ROLES.SHELTER_OWNER,
    ROLES.DOCTOR,
  ];

  if (businessRoles.includes(role) && !hasSetup) {
    return <SetupPage />;
  }

  // ======================================
  // STORE OWNER
  // ======================================

  if (role === ROLES.STORE_OWNER) {
    return <StoreDashboard />;
  }

  // ======================================
  // SHELTER OWNER
  // ======================================

  if (role === ROLES.SHELTER_OWNER) {
    return <ShelterDashboard />;
  }

  // ======================================
  // DOCTOR
  // ======================================

  if (role === ROLES.DOCTOR) {
    return <DoctorDashboard />;
  }

  // ======================================
  // FALLBACK
  // ======================================

  return <UnknownRole role={user.role} />;
}
