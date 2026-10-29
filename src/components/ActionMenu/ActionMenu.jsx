
import React, { useState } from "react";

import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";

import {
  FaEllipsisH,
  FaTrashAlt,
  FaExclamationTriangle,
  FaTimes,
  FaSpinner,
} from "react-icons/fa";

import { useAuth } from "../../context/AuthContext";

export default function ActionMenu({
  onDelete,
  dotsColor = "text-mainColor",
  adminRoleValue = 1,
  itemName = "هذا العنصر",
}) {
  const { user } = useAuth();

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const isAdmin =
    user != null &&
    Number(user.role) === Number(adminRoleValue);

  // Only show controls to admins with a delete action.
  if (!isAdmin || typeof onDelete !== "function") {
    return null;
  }

  const closeModal = () => {
    if (deleting) return;

    setIsConfirmOpen(false);
    setError("");
  };

  const handleDelete = async () => {
    if (deleting) return;

    setDeleting(true);
    setError("");

    try {
      await onDelete();
      setIsConfirmOpen(false);
    } catch (err) {
      setError(
        err?.data?.message ||
          err?.message ||
          "تعذر حذف العنصر. يرجى المحاولة مجدداً."
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      {/* ACTION DROPDOWN */}
      <Dropdown
        placement="bottom-end"
        backdrop="transparent"
        classNames={{
          content:
            "min-w-[180px] rounded-2xl border border-mainColor/10 bg-white p-2 shadow-xl dark:border-white/10 dark:bg-[#1D2939]",
        }}
      >
        <DropdownTrigger>
          <Button
            isIconOnly
            type="button"
            variant="flat"
            aria-label="خيارات الإدارة"
            title="خيارات الإدارة"
            className={[
              "h-10 w-10 min-w-10 rounded-xl",
              "border border-mainColor/10 bg-white/90",
              "shadow-sm transition-all",
              "hover:bg-white hover:shadow-md",
              "dark:border-white/10 dark:bg-[#1D2939]/90",
              dotsColor,
            ].join(" ")}
          >
            <FaEllipsisH size={17} />
          </Button>
        </DropdownTrigger>

        <DropdownMenu
          aria-label="خيارات إدارة العنصر"
          variant="flat"
          onAction={(key) => {
            if (key === "delete") {
              setError("");
              setIsConfirmOpen(true);
            }
          }}
        >
          <DropdownItem
            key="delete"
            color="danger"
            startContent={
              <FaTrashAlt size={14} />
            }
            className="rounded-xl px-3 py-3 text-sm font-bold text-red-600 data-[hover=true]:bg-red-50 dark:text-red-400 dark:data-[hover=true]:bg-red-950/20"
          >
            حذف العنصر
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>

      {/* DELETE CONFIRMATION */}
      <Modal
        isOpen={isConfirmOpen}
        onClose={closeModal}
        isDismissable={!deleting}
        isKeyboardDismissDisabled={deleting}
        placement="center"
        backdrop="blur"
        size="md"
        scrollBehavior="inside"
        classNames={{
          base:
            "rounded-[28px] border border-mainColor/10 bg-white dark:border-white/10 dark:bg-[#1D2939]",
          backdrop: "bg-black/55",
          closeButton:
            "text-mainColor dark:text-white",
        }}
      >
        <ModalContent>
          {() => (
            <div dir="rtl">
              <ModalHeader className="flex flex-col items-center gap-4 px-6 pb-0 pt-8 text-center">
                <span className="flex h-20 w-20 items-center justify-center rounded-[24px] bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400">
                  <FaExclamationTriangle size={30} />
                </span>

                <h2 className="text-2xl font-black text-mainColor dark:text-white">
                  تأكيد الحذف
                </h2>
              </ModalHeader>

              <ModalBody className="px-6 pt-5 text-center">
                <p className="text-sm leading-8 text-secondaryColor dark:text-gray-300">
                  هل أنت متأكد أنك تريد حذف
                  <strong className="mx-1 break-words text-mainColor dark:text-white">
                    {itemName}
                  </strong>
                  ؟
                </p>

                <p className="text-xs leading-7 text-red-600 dark:text-red-400">
                  قد لا تتمكن من استعادة هذا العنصر بعد حذفه.
                </p>

                {error && (
                  <div
                    role="alert"
                    className="rounded-xl border border-red-200 bg-red-50 p-4 text-right text-sm font-bold text-red-700 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-300"
                  >
                    {error}
                  </div>
                )}
              </ModalBody>

              <ModalFooter className="flex flex-wrap justify-center gap-3 px-6 pb-8 pt-5">
                <Button
                  type="button"
                  variant="bordered"
                  onPress={closeModal}
                  isDisabled={deleting}
                  startContent={<FaTimes size={13} />}
                  className="h-12 flex-1 rounded-xl border-mainColor/15 font-bold text-mainColor dark:border-white/20 dark:text-white"
                >
                  إلغاء
                </Button>

                <Button
                  type="button"
                  color="danger"
                  onPress={handleDelete}
                  isDisabled={deleting}
                  startContent={
                    deleting ? (
                      <FaSpinner
                        size={14}
                        className="animate-spin"
                      />
                    ) : (
                      <FaTrashAlt size={14} />
                    )
                  }
                  className="h-12 flex-1 rounded-xl bg-red-600 font-extrabold text-white"
                >
                  {deleting ? "جارٍ الحذف..." : "نعم، احذف"}
                </Button>
              </ModalFooter>
            </div>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
