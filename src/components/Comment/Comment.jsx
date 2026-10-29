
import React, { useEffect, useState } from "react";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";

import {
  FaUser,
  FaEllipsisH,
  FaTrashAlt,
  FaExclamationTriangle,
  FaTimes,
  FaSpinner,
} from "react-icons/fa";

import { api } from "../../api/apiClient";
import { useAuth } from "../../context/AuthContext";

const DEFAULT_AVATAR = "/default-avatar.png";

// ==========================================
// AVATAR
// ==========================================

function CommentAvatar({ src, name }) {
  const [failed, setFailed] = useState(false);
  const [fallbackFailed, setFallbackFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
    setFallbackFailed(false);
  }, [src]);

  const imageSrc = failed ? DEFAULT_AVATAR : src || DEFAULT_AVATAR;
  const showIcon = fallbackFailed;

  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-mainColor/10 shadow-sm dark:border-white/10 dark:bg-white/10 sm:h-11 sm:w-11">
      {showIcon ? (
        <FaUser
          size={17}
          className="text-mainColor dark:text-white"
        />
      ) : (
        <img
          key={imageSrc}
          src={imageSrc}
          alt={`صورة ${name}`}
          loading="lazy"
          className="h-full w-full object-cover"
          onError={() => {
            if (!failed && src && src !== DEFAULT_AVATAR) {
              setFailed(true);
            } else {
              setFallbackFailed(true);
            }
          }}
        />
      )}
    </div>
  );
}

// ==========================================
// MAIN COMMENT
// ==========================================

export default function Comment({ comment, refreshFeed }) {
  const { user } = useAuth();

  const [busy, setBusy] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [error, setError] = useState("");

  const commentId = comment?.id;

  const authorName =
    comment?.user?.name ||
    comment?.author?.name ||
    comment?.userName ||
    "مستخدم كاجو";

  const content =
    comment?.text ??
    comment?.content ??
    "";

  const avatarSrc =
    comment?.user?.avatar_url ||
    comment?.author?.avatar_url ||
    "";

  const isAdmin = Number(user?.role) === 1;

  // ======================================
  // DELETE COMMENT
  // ======================================

  const handleDelete = async () => {
    if (!isAdmin || commentId == null || busy) {
      return;
    }

    setBusy(true);
    setError("");

    try {
      await api.adminDeleteComment(commentId);

      setIsDeleteOpen(false);

      if (typeof refreshFeed === "function") {
        await refreshFeed();
      }
    } catch (err) {
      setError(
        err?.data?.message ||
          err?.message ||
          "تعذر حذف التعليق. يرجى المحاولة مجدداً."
      );
    } finally {
      setBusy(false);
    }
  };

  // ======================================
  // RENDER
  // ======================================

  return (
    <>
      <article
        dir="rtl"
        className="group flex min-w-0 items-start gap-3 py-3"
      >
        {/* AVATAR */}
        <CommentAvatar
          src={avatarSrc}
          name={authorName}
        />

        {/* COMMENT BUBBLE */}
        <div className="min-w-0 flex-1">
          <div className="rounded-[20px] rounded-tr-md bg-mainColor/5 px-4 py-3.5 transition-colors duration-300 group-hover:bg-mainColor/[0.07] dark:bg-white/[0.06] dark:group-hover:bg-white/[0.09]">
            <div className="mb-2 flex min-w-0 items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="break-words text-sm font-black text-mainColor dark:text-white">
                  {authorName}
                </p>
              </div>

              {/* ADMIN ACTION */}
              {isAdmin && commentId != null && (
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setIsDeleteOpen(true);
                  }}
                  aria-label={`حذف تعليق ${authorName}`}
                  title="خيارات التعليق"
                  disabled={busy}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-mainColor/60 transition-colors hover:bg-mainColor/10 hover:text-mainColor disabled:opacity-50 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white"
                >
                  <FaEllipsisH size={16} />
                </button>
              )}
            </div>

            <p className="whitespace-pre-wrap break-words text-sm leading-7 text-secondaryColor dark:text-gray-300">
              {content || "—"}
            </p>
          </div>
        </div>
      </article>

      {/* ======================================
          DELETE CONFIRMATION MODAL
      ====================================== */}

      <Modal
        isOpen={isDeleteOpen}
        onClose={() => {
          if (!busy) {
            setIsDeleteOpen(false);
            setError("");
          }
        }}
        isDismissable={!busy}
        isKeyboardDismissDisabled={busy}
        backdrop="blur"
        placement="center"
        size="md"
        classNames={{
          base:
            "rounded-[28px] border border-mainColor/10 bg-white dark:border-white/10 dark:bg-[#1D2939]",
          closeButton: "text-mainColor dark:text-white",
        }}
      >
        <ModalContent>
          {() => (
            <div dir="rtl">
              <ModalHeader className="flex flex-col items-center gap-4 px-6 pb-0 pt-8 text-center">
                <span className="flex h-18 w-18 items-center justify-center rounded-2xl bg-red-50 p-5 text-red-600 dark:bg-red-950/30 dark:text-red-400">
                  <FaExclamationTriangle size={28} />
                </span>

                <h2 className="text-xl font-black text-mainColor dark:text-white">
                  حذف التعليق؟
                </h2>
              </ModalHeader>

              <ModalBody className="px-6 pt-4 text-center">
                <p className="text-sm leading-8 text-secondaryColor dark:text-gray-300">
                  هل أنت متأكد أنك تريد حذف تعليق
                  <strong className="mx-1 text-mainColor dark:text-white">
                    {authorName}
                  </strong>
                  ؟
                </p>

                <div className="max-h-32 overflow-y-auto rounded-xl bg-mainColor/5 p-4 text-right dark:bg-white/5">
                  <p className="whitespace-pre-wrap break-words text-sm leading-7 text-secondaryColor dark:text-gray-300">
                    {content}
                  </p>
                </div>

                {error && (
                  <div
                    role="alert"
                    className="rounded-xl border border-red-200 bg-red-50 p-4 text-right text-sm font-bold text-red-700 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-300"
                  >
                    {error}
                  </div>
                )}

                <p className="text-xs leading-7 text-red-600 dark:text-red-400">
                  قد لا تتمكن من استعادة التعليق بعد حذفه.
                </p>
              </ModalBody>

              <ModalFooter className="flex flex-wrap justify-center gap-3 px-6 pb-7 pt-4">
                <Button
                  variant="bordered"
                  onPress={() => {
                    setIsDeleteOpen(false);
                    setError("");
                  }}
                  isDisabled={busy}
                  startContent={<FaTimes size={13} />}
                  className="h-12 flex-1 rounded-xl border-mainColor/15 font-bold text-mainColor dark:border-white/20 dark:text-white"
                >
                  إلغاء
                </Button>

                <Button
                  color="danger"
                  onPress={handleDelete}
                  isDisabled={busy}
                  startContent={
                    busy ? (
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
                  {busy ? "جارٍ الحذف..." : "حذف التعليق"}
                </Button>
              </ModalFooter>
            </div>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
