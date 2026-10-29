
import React from "react";
import { Input } from "@heroui/react";

export default function CustomInput({
  name,
  register,
  error,
  isTouched,
  startContent,
  endContent,
  type = "text",
  label,
  placeholder,
  className = "",
  classNames = {},
  variant = "bordered",
  ...props
}) {
  // ======================================
  // VALIDATION
  // ======================================

  const isError = Boolean(error && isTouched);

  // Support React Hook Form while allowing
  // the component to be used without register.
  const registration =
    typeof register === "function" && name
      ? register(name)
      : {};

  // ======================================
  // STYLES
  // ======================================

  const defaultClassNames = {
    base: "w-full",

    label: [
      "text-sm font-extrabold",
      "text-mainColor dark:text-white",
      "group-data-[filled-within=true]:text-mainColor",
      "dark:group-data-[filled-within=true]:text-white",
    ].join(" "),

    inputWrapper: [
      "min-h-[54px] sm:min-h-[58px]",
      "rounded-2xl",
      "border",
      "px-4 sm:px-5",
      "bg-white dark:bg-[#1D2939]",
      "shadow-none",
      "transition-all duration-200",

      isError
        ? [
            "!border-red-500",
            "data-[hover=true]:!border-red-500",
            "group-data-[focus=true]:!border-red-500",
            "group-data-[focus=true]:!bg-white",
            "dark:group-data-[focus=true]:!bg-[#1D2939]",
          ].join(" ")
        : [
            "!border-mainColor/15",
            "hover:!border-mainColor/35",
            "group-data-[focus=true]:!border-mainColor",
            "group-data-[focus=true]:!bg-white",
            "dark:!border-white/15",
            "dark:hover:!border-white/30",
            "dark:group-data-[focus=true]:!border-fourthColor",
            "dark:group-data-[focus=true]:!bg-[#1D2939]",
          ].join(" "),

      "group-data-[disabled=true]:opacity-50",
      "group-data-[disabled=true]:cursor-not-allowed",
    ].join(" "),

    input: [
      "text-sm sm:text-base",
      "font-semibold",
      "text-mainColor dark:text-white",
      "placeholder:text-mainColor/40",
      "dark:placeholder:text-white/40",
      "caret-mainColor dark:caret-fourthColor",
      "outline-none",
      "text-right",
    ].join(" "),

    innerWrapper: "gap-2",

    description: [
      "text-xs leading-6",
      "text-secondaryColor dark:text-gray-400",
      "text-right",
    ].join(" "),

    errorMessage: [
      "mt-1",
      "text-xs font-bold",
      "text-red-600 dark:text-red-400",
      "text-right",
    ].join(" "),

    helperWrapper: "px-1",
  };

  const mergedClassNames = Object.fromEntries(
    Object.entries(defaultClassNames).map(([key, value]) => [
      key,
      [value, classNames[key]].filter(Boolean).join(" "),
    ])
  );

  // Preserve any additional HeroUI class slots.
  for (const [key, value] of Object.entries(classNames)) {
    if (!(key in mergedClassNames)) {
      mergedClassNames[key] = value;
    }
  }

  return (
    <Input
      {...registration}
      {...props}
      name={name}
      type={type}
      label={label}
      placeholder={placeholder}
      variant={variant}
      labelPlacement={props.labelPlacement || "outside"}
      isInvalid={isError}
      errorMessage={isError ? error?.message : undefined}
      startContent={
        startContent ? (
          <span className="flex shrink-0 items-center justify-center text-secondaryColor dark:text-gray-300">
            {startContent}
          </span>
        ) : undefined
      }
      endContent={
        endContent ? (
          <span className="flex shrink-0 items-center justify-center text-secondaryColor dark:text-gray-300">
            {endContent}
          </span>
        ) : undefined
      }
      className={className}
      classNames={mergedClassNames}
    />
  );
}
