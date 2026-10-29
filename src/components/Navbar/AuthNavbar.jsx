
import React, { useEffect, useState } from "react";

import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
} from "@heroui/react";

import { Link, useLocation } from "react-router-dom";

import {
  FaSignInAlt,
  FaUserPlus,
  FaInfoCircle,
  FaArrowLeft,
  FaPaw,
} from "react-icons/fa";

import logo from "../../assets/logo.svg";
import ThemeToggle from "../ThemeToggle/ThemeToggle";

const menuItems = [
  {
    name: "تسجيل الدخول",
    path: "/login",
    icon: FaSignInAlt,
  },
  {
    name: "من نحن",
    path: "/information",
    icon: FaInfoCircle,
  },
  {
    name: "إنشاء حساب",
    path: "/register",
    icon: FaUserPlus,
  },
];

export default function AuthNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const location = useLocation();

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path) => {
    return (
      location.pathname === path ||
      location.pathname.startsWith(path + "/")
    );
  };

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <Navbar
      dir="rtl"
      height="84px"
      maxWidth="full"
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
          "border-t border-mainColor/10",
          "px-5 pt-6 pb-10",
          "overflow-y-auto",
        ].join(" "),
      }}
    >
      {/* ================= BRAND ================= */}
      <NavbarContent
        justify="start"
        className="grow-0 shrink-0"
      >
        <NavbarBrand>
          <Link
            to="/"
            onClick={closeMenu}
            aria-label="كاجو - الصفحة الرئيسية"
            className="group flex items-center gap-3"
          >
            <img
              src={logo}
              alt="شعار كاجو"
              className="
                h-14
                w-auto
                max-w-[125px]
                object-contain
                transition-transform
                duration-300
                group-hover:scale-105
                sm:h-16
              "
            />
          </Link>
        </NavbarBrand>
      </NavbarContent>

      {/* ================= DESKTOP NAV ================= */}
      <NavbarContent
        justify="end"
        className="hidden flex-1 items-center gap-2 md:flex"
      >
        {menuItems.map((item) => {
          const active = isActive(item.path);
          const Icon = item.icon;
          const isRegister = item.path === "/register";

          if (isRegister) {
            return (
              <NavbarItem key={item.path}>
                <Link
                  to={item.path}
                  aria-current={active ? "page" : undefined}
                  className="
                    group
                    relative
                    inline-flex
                    min-h-12
                    items-center
                    justify-center
                    gap-3
                    rounded-2xl
                    bg-mainColor
                    px-6
                    py-3
                    text-sm
                    font-bold
                    text-white
                    shadow-lg
                    transition-all
                    duration-300
                    hover:-translate-y-0.5
                    hover:opacity-90
                    hover:shadow-xl
                    focus-visible:outline
                    focus-visible:outline-2
                    focus-visible:outline-offset-4
                    focus-visible:outline-mainColor
                  "
                >
                  <Icon size={16} />
                  <span>إنشاء حساب</span>

                  <FaArrowLeft
                    size={12}
                    className="
                      transition-transform
                      duration-300
                      group-hover:-translate-x-1
                    "
                  />

                  {active && (
                    <span
                      aria-hidden="true"
                      className="
                        absolute
                        -bottom-2
                        left-1/2
                        h-1
                        w-6
                        -translate-x-1/2
                        rounded-full
                        bg-secondaryColor
                      "
                    />
                  )}
                </Link>
              </NavbarItem>
            );
          }

          return (
            <NavbarItem key={item.path}>
              <Link
                to={item.path}
                aria-current={active ? "page" : undefined}
                className={[
                  "group relative inline-flex",
                  "min-h-12 items-center justify-center gap-2",
                  "rounded-2xl px-5 py-3",
                  "text-sm font-bold",
                  "transition-all duration-300",
                  active
                    ? "bg-mainColor/10 text-mainColor dark:bg-white/10 dark:text-white"
                    : "text-mainColor hover:bg-mainColor/5 dark:text-white",
                ].join(" ")}
              >
                <Icon
                  size={15}
                  className={
                    active
                      ? "text-mainColor dark:text-white"
                      : "text-secondaryColor transition-transform group-hover:scale-110"
                  }
                />

                <span>{item.name}</span>

                {active && (
                  <span
                    aria-hidden="true"
                    className="
                      absolute
                      bottom-1
                      left-1/2
                      h-1
                      w-1
                      -translate-x-1/2
                      rounded-full
                      bg-secondaryColor
                    "
                  />
                )}
              </Link>
            </NavbarItem>
          );
        })}

        {/* Divider */}
        <div
          aria-hidden="true"
          className="mx-2 h-8 w-px bg-mainColor/10"
        />

        {/* Theme toggle */}
        <NavbarItem>
          <div className="flex items-center justify-center rounded-2xl p-1 transition-colors hover:bg-mainColor/5">
            <ThemeToggle />
          </div>
        </NavbarItem>
      </NavbarContent>

      {/* ================= MOBILE ACTIONS ================= */}
      <NavbarContent
        justify="end"
        className="flex grow-0 items-center gap-2 md:hidden"
      >
        <NavbarItem>
          <ThemeToggle />
        </NavbarItem>

        <NavbarItem>
          <NavbarMenuToggle
            aria-label={
              isMenuOpen
                ? "إغلاق القائمة"
                : "فتح القائمة"
            }
            className="text-mainColor dark:text-white"
          />
        </NavbarItem>
      </NavbarContent>

      {/* ================= MOBILE MENU ================= */}
      <NavbarMenu dir="rtl">

        {/* Mobile header */}
        <div className="mb-6 rounded-3xl border border-mainColor/10 bg-mainColor/5 p-5 dark:bg-white/5">
          <div className="mb-3 flex items-center gap-3">
            <span
              className="
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-2xl
                bg-mainColor
                text-white
                shadow-md
              "
            >
              <FaPaw size={22} />
            </span>

            <div>
              <h3 className="text-lg font-extrabold text-mainColor dark:text-white">
                أهلاً بك في كاجو
              </h3>

              <p className="mt-1 text-xs text-secondaryColor">
                عالم متكامل لرعاية أصدقائنا الأليفين
              </p>
            </div>
          </div>
        </div>

        {/* Mobile links */}
        <div className="flex flex-col gap-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            const isRegister = item.path === "/register";

            return (
              <NavbarMenuItem key={item.path}>
                <Link
                  to={item.path}
                  onClick={closeMenu}
                  aria-current={active ? "page" : undefined}
                  className={[
                    "flex w-full items-center gap-4",
                    "rounded-2xl px-5 py-4",
                    "text-base font-bold",
                    "transition-all duration-300",
                    isRegister
                      ? "bg-mainColor text-white shadow-lg"
                      : active
                      ? "bg-mainColor/10 text-mainColor dark:bg-white/10 dark:text-white"
                      : "border border-mainColor/10 bg-white text-mainColor hover:bg-mainColor/5 dark:bg-white/5 dark:text-white",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "flex h-10 w-10 shrink-0",
                      "items-center justify-center rounded-xl",
                      isRegister
                        ? "bg-white/20 text-white"
                        : "bg-mainColor/10 text-mainColor dark:text-white",
                    ].join(" ")}
                  >
                    <Icon size={18} />
                  </span>

                  <span className="flex-1">
                    {item.name}
                  </span>

                  <FaArrowLeft
                    size={13}
                    className={
                      isRegister
                        ? "text-white"
                        : "text-secondaryColor"
                    }
                  />
                </Link>
              </NavbarMenuItem>
            );
          })}
        </div>

        {/* Bottom message */}
        <div className="mt-8 border-t border-mainColor/10 pt-6 text-center">
          <p className="text-sm leading-7 text-secondaryColor">
            لأن كل حيوان أليف يستحق الحب والرعاية
          </p>

          <div className="mt-3 flex justify-center gap-2 text-mainColor/40 dark:text-white/40">
            <FaPaw size={12} />
            <FaPaw size={12} />
            <FaPaw size={12} />
          </div>
        </div>
      </NavbarMenu>
    </Navbar>
  );
}
