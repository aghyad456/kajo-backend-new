import React from "react";
import { FaTrash } from "react-icons/fa";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Button,
} from "@heroui/react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../api/apiClient";

export default function Comment({ comment, refreshFeed }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user } = useAuth();

  const isAdmin = Number(user?.role) === 1;

  // شكل بيانات Laravel المتوقع:
  // comment.user = { id, name, role }
  const userName = comment?.user?.name || comment?.user || "user";
  const avatar = comment?.photo || `https://i.pravatar.cc/150?u=${encodeURIComponent(userName)}`;

  const handleDelete = async () => {
    try {
      await api.adminDeleteComment(comment.id);
      onClose();
      refreshFeed?.();
    } catch (e) {
      alert(e?.message || e?.response?.data?.message || "فشل حذف التعليق");
    }
  };

  return (
    <>
      <div className="bg-[#FFF4C7]/60 rounded-[25px] p-4 shadow-sm border border-sixColor/5">
        <div className="flex items-center justify-between flex-row-reverse">
          {/* User Info */}
          <div className="flex items-center gap-3 flex-row-reverse">
            <img
              src={avatar}
              className="w-9 h-9 rounded-full border-2 border-white shadow-sm object-cover"
              alt="avatar"
            />
            <span className="text-sixColor font-black text-sm">@{userName}</span>
          </div>

          {/* Delete (admin only) */}
          {isAdmin && (
            <div className="flex gap-3 text-sixColor/60">
              <FaTrash
                className="cursor-pointer hover:text-red-500 transition text-sm"
                onClick={onOpen}
                title="حذف التعليق"
              />
            </div>
          )}
        </div>

        {/* Comment Content */}
        <div className="mt-2 pr-12">
          <p className="text-sixColor text-right text-sm leading-relaxed font-medium">
            {comment.text}
          </p>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isOpen} onClose={onClose} backdrop="blur" className="rounded-[30px]">
        <ModalContent className="bg-fivethColor">
          {() => (
            <>
              <ModalHeader className="text-sixColor font-black">حذف التعليق</ModalHeader>
              <ModalBody className="text-sixColor/80 text-right">
                هل أنت متأكد أنك تريد حذف هذا التعليق؟ لا يمكن التراجع عن هذه الخطوة 🐾
              </ModalBody>
              <ModalFooter className="flex justify-start gap-3">
                <Button
                  color="danger"
                  variant="flat"
                  className="rounded-full font-bold"
                  onPress={handleDelete}
                >
                  حذف نهائي
                </Button>
                <Button
                  variant="light"
                  className="rounded-full font-bold text-sixColor"
                  onPress={onClose}
                >
                  تراجع
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}