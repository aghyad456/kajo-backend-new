
import React, { useState } from "react";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar,
} from "@heroui/react";

import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/logo.svg";
import {
  FaBookmark,
  FaSignOutAlt,
  FaUserCircle,
  FaChevronDown,
  FaHome,
  FaStore,
  FaPaw,
  FaClinicMedical,
  FaShieldAlt,
  FaUsers,
  FaClipboardList,
  FaTachometerAlt,
} from "react-icons/fa";

import ThemeToggle from "../ThemeToggle/ThemeToggle";

const navIcons = {
  "/app/feed": FaHome,
  "/app/stores": FaStore,
  "/app/shelters": FaPaw,
  "/app/clinics": FaClinicMedical,
  "/app/dashboard": FaTachometerAlt,
  "/app/store-dashboard": FaTachometerAlt,
  "/app/shelter-dashboard": FaTachometerAlt,
  "/app/setup": FaTachometerAlt,
  "/admin/dashboard": FaShieldAlt,
  "/admin/users-requests": FaClipboardList,
  "/admin/users": FaUsers,
};

export default function MainNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const { user, isAdmin, logout, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => {
    const current = location.pathname;
    return current === path || current.startsWith(path + "/");
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      await logout();
      setIsMenuOpen(false);
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getLinks = () => {
    if (loading || !user) return [];

    const role = Number(user?.role);
    const hasSetup = !!(user?.hasSetup ?? user?.has_setup);

    const baseLinks = [
      { name: "الرئيسية", path: "/app/feed" },
      { name: "المتاجر", path: "/app/stores" },
      { name: "الملاجئ", path: "/app/shelters" },
      { name: "العيادات", path: "/app/clinics" },
    ];

    const roleLinks = [];

    if (role === 5) {
      roleLinks.push({
        name: "لوحة العيادة",
        path: hasSetup ? "/app/dashboard" : "/app/setup",
      });
    }

    if (role === 3) {
      roleLinks.push({
        name: "لوحة المتجر",
        path: hasSetup ? "/app/store-dashboard" : "/app/setup",
      });
    }

    if (role === 4) {
      roleLinks.push({
        name: "لوحة الملجأ",
        path: hasSetup ? "/app/shelter-dashboard" : "/app/setup",
      });
    }

    const adminLinks = isAdmin
      ? [
          { name: "لوحة الأدمن", path: "/admin/dashboard" },
          { name: "طلبات الانضمام", path: "/admin/users-requests" },
          { name: "إدارة المستخدمين", path: "/admin/users" },
        ]
      : [];

    return [...baseLinks, ...roleLinks, ...adminLinks];
  };

  const menuItems = getLinks();

  const logoHref = user
    ? isAdmin
      ? "/admin/dashboard"
      : "/app/feed"
    : "/login";

  const userName =
    user?.name ||
    user?.full_name ||
    user?.username ||
    "مستخدم كاجو";

  const userInitial = String(userName).trim().charAt(0) || "ك";

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <Navbar
      dir="rtl"
      maxWidth="full"
      height="84px"
      isMenuOpen={isMenuOpen}
      onMenuOpenChange={setIsMenuOpen}
      classNames={{
        base: [
          "z-50",
          "border-b border-mainColor/10",
          "bg-white/90",
          "dark:bg-[#101828]/95",
          "backdrop-blur-xl",
          "shadow-[0_8px_30px_rgba(0,0,0,0.04)]",
          "transition-colors duration-300",
        ].join(" "),
        wrapper:
          "max-w-[1500px] px-4 sm:px-6 lg:px-10 gap-3",
        menu: [
          "bg-white dark:bg-[#101828]",
          "pt-5 pb-10 px-5",
          "border-t border-mainColor/10",
          "overflow-y-auto",
        ].join(" "),
      }}
    >
      {/* BRAND */}
      <NavbarContent
        justify="start"
        className="grow-0 shrink-0"
      >
        <NavbarBrand>
          <Link
            to={logoHref}
            onClick={closeMenu}
            aria-label="كاجو - الرئيسية"
            className="group flex shrink-0 items-center"
          >
            <img
              src={logo}
              alt="Kajo"
              className="h-14 w-auto max-w-[125px] object-contain transition-transform duration-300 group-hover:scale-105 sm:h-16"
            />
          </Link>
        </NavbarBrand>
      </NavbarContent>

      {/* DESKTOP NAVIGATION */}
      <NavbarContent
        justify="center"
        className="hidden min-w-0 flex-1 lg:flex"
      >
        <nav
          aria-label="التنقل الرئيسي"
          className="flex max-w-full items-center gap-1 overflow-x-auto py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {menuItems.map((item) => {
            const Icon = navIcons[item.path] || FaHome;
            const active = isActive(item.path);

            return (
              <NavbarItem key={`${item.path}-${item.name}`}>
                <Link
                  to={item.path}
                  aria-current={active ? "page" : undefined}
                  className={[
                    "group relative flex items-center gap-2",
                    "whitespace-nowrap rounded-xl",
                    "px-3.5 py-3",
                    "text-[13px] font-bold xl:text-sm",
                    "transition-all duration-300",
                    active
                      ? "bg-mainColor text-white shadow-md"
                      : "text-mainColor hover:bg-mainColor/10",
                  ].join(" ")}
                >
                  <Icon
                    size={15}
                    className={
                      active
                        ? "text-white"
                        : "text-secondaryColor transition-transform group-hover:scale-110"
                    }
                  />

                  <span>{item.name}</span>

                  {active && (
                    <span
                      aria-hidden="true"
                      className="absolute -bottom-2 left-1/2 h-1 w-5 -translate-x-1/2 rounded-full bg-secondaryColor"
                    />
                  )}
                </Link>
              </NavbarItem>
            );
          })}
        </nav>
      </NavbarContent>

      {/* RIGHT ACTIONS */}
      <NavbarContent
        justify="end"
        className="grow-0 shrink-0 gap-2 sm:gap-3"
      >
        {/* Saved */}
        {user && (
          <NavbarItem className="hidden sm:flex">
            <Link
              to="/app/saved"
              title="المحفوظات"
              aria-label="المحفوظات"
              className={[
                "relative flex h-11 w-11 items-center justify-center",
                "rounded-2xl text-mainColor",
                "transition-all duration-300",
                "hover:bg-mainColor/10 hover:-translate-y-0.5",
                isActive("/app/saved")
                  ? "bg-mainColor/10"
                  : "",
              ].join(" ")}
            >
              <FaBookmark size={18} />

              {isActive("/app/saved") && (
                <span className="absolute bottom-1 h-1 w-1 rounded-full bg-secondaryColor" />
              )}
            </Link>
          </NavbarItem>
        )}

        {/* Theme */}
        <NavbarItem>
          <div className="flex items-center justify-center rounded-2xl p-1 transition-colors hover:bg-mainColor/5">
            <ThemeToggle />
          </div>
        </NavbarItem>

        {/* User dropdown */}
        {user && (
          <NavbarItem className="hidden lg:flex">
            <Dropdown
              placement="bottom-end"
              classNames={{
                content:
                  "min-w-[220px] rounded-2xl border border-mainColor/10 bg-white p-2 shadow-xl dark:bg-[#1D2939]",
              }}
            >
              <DropdownTrigger>
                <button
                  type="button"
                  className="flex items-center gap-2.5 rounded-2xl border border-mainColor/10 bg-mainColor/5 px-3 py-2 text-mainColor transition-all duration-300 hover:border-mainColor/30 hover:bg-mainColor/10 dark:bg-white/5 dark:text-white"
                >
                  <Avatar
                    size="sm"
                    name={userInitial}
                    classNames={{
                      base: "bg-mainColor text-white",
                      name: "text-sm font-bold",
                    }}
                  />

                  <span className="max-w-[120px] truncate text-sm font-bold">
                    {userName}
                  </span>

                  <FaChevronDown
                    size={11}
                    className="opacity-60"
                  />
                </button>
              </DropdownTrigger>

              <DropdownMenu
                aria-label="قائمة الحساب"
                disabledKeys={
                  isLoggingOut ? ["logout"] : []
                }
                onAction={(key) => {
                  if (key === "profile") {
                    navigate("/app/profile");
                  }

                  if (key === "saved") {
                    navigate("/app/saved");
                  }

                  if (key === "logout") {
                    handleLogout();
                  }
                }}
              >
                <DropdownItem
                  key="profile"
                  startContent={
                    <FaUserCircle className="text-mainColor" />
                  }
                >
                  الملف الشخصي
                </DropdownItem>

                <DropdownItem
                  key="saved"
                  startContent={
                    <FaBookmark className="text-mainColor" />
                  }
                >
                  المحفوظات
                </DropdownItem>

                <DropdownItem
                  key="logout"
                  color="danger"
                  className="text-danger"
                  startContent={<FaSignOutAlt />}
                >
                  {isLoggingOut
                    ? "جارٍ تسجيل الخروج..."
                    : "تسجيل الخروج"}
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </NavbarItem>
        )}

        {/* Mobile toggle */}
        {user && menuItems.length > 0 && (
          <NavbarItem className="flex lg:hidden">
            <NavbarMenuToggle
              aria-label={
                isMenuOpen ? "إغلاق القائمة" : "فتح القائمة"
              }
              className="text-mainColor dark:text-white"
            />
          </NavbarItem>
        )}
      </NavbarContent>

      {/* MOBILE MENU */}
      <NavbarMenu>
        {user && (
          <div className="mb-5 flex items-center gap-3 rounded-2xl border border-mainColor/10 bg-mainColor/5 p-4 dark:bg-white/5">
            <Avatar
              name={userInitial}
              size="md"
              classNames={{
                base: "bg-mainColor text-white",
              }}
            />

            <div className="min-w-0">
              <p className="truncate font-extrabold text-mainColor dark:text-white">
                {userName}
              </p>
              <p className="mt-1 text-xs text-secondaryColor">
                أهلاً بك في كاجو
              </p>
            </div>
          </div>
        )}

        <p className="mb-3 px-2 text-xs font-bold text-secondaryColor">
          القائمة الرئيسية
        </p>

        {menuItems.map((item) => {
          const Icon = navIcons[item.path] || FaHome;
          const active = isActive(item.path);

          return (
            <NavbarMenuItem
              key={`${item.path}-${item.name}`}
            >
              <Link
                to={item.path}
                onClick={closeMenu}
                aria-current={active ? "page" : undefined}
                className={[
                  "mb-1 flex items-center gap-3 rounded-2xl",
                  "px-4 py-4 text-base font-bold",
                  "transition-all duration-300",
                  active
                    ? "bg-mainColor text-white shadow-md"
                    : "text-mainColor hover:bg-mainColor/10 dark:text-white",
                ].join(" ")}
              >
                <Icon
                  size={18}
                  className={
                    active
                      ? "text-white"
                      : "text-secondaryColor"
                  }
                />
                {item.name}
              </Link>
            </NavbarMenuItem>
          );
        })}

        {user && (
          <>
            <div className="my-4 border-t border-mainColor/10" />

            <p className="mb-3 px-2 text-xs font-bold text-secondaryColor">
              حسابي
            </p>

            <NavbarMenuItem>
              <Link
                to="/app/profile"
                onClick={closeMenu}
                className={[
                  "mb-1 flex items-center gap-3 rounded-2xl",
                  "px-4 py-4 font-bold transition-colors",
                  isActive("/app/profile")
                    ? "bg-mainColor text-white"
                    : "text-mainColor hover:bg-mainColor/10 dark:text-white",
                ].join(" ")}
              >
                <FaUserCircle size={18} />
                الملف الشخصي
              </Link>
            </NavbarMenuItem>

            <NavbarMenuItem>
              <Link
                to="/app/saved"
                onClick={closeMenu}
                className={[
                  "mb-1 flex items-center gap-3 rounded-2xl",
                  "px-4 py-4 font-bold transition-colors",
                  isActive("/app/saved")
                    ? "bg-mainColor text-white"
                    : "text-mainColor hover:bg-mainColor/10 dark:text-white",
                ].join(" ")}
              >
                <FaBookmark size={17} />
                المحفوظات
              </Link>
            </NavbarMenuItem>

            <NavbarMenuItem>
              <button
                type="button"
                disabled={isLoggingOut}
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-2xl px-4 py-4 text-right font-bold text-red-500 transition-colors hover:bg-red-50 disabled:opacity-50 dark:hover:bg-red-950/20"
              >
                <FaSignOutAlt size={18} />
                {isLoggingOut
                  ? "جارٍ تسجيل الخروج..."
                  : "تسجيل الخروج"}
              </button>
            </NavbarMenuItem>
          </>
        )}
      </NavbarMenu>
    </Navbar>
  );
}
