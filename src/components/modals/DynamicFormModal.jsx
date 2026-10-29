import React from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, Button } from "@heroui/react";
import CustomInput from "../CustomInput/CustomInput";
import { useForm } from "react-hook-form";

export default function DynamicFormModal({
  isOpen,
  onClose,
  title,
  fields,
  buttonText,
  onSubmit
}) {
  const { register, handleSubmit, reset } = useForm();

  const handleFormSubmit = (data) => {
    console.log(`Sending data for ${title}:`, data);

    if (onSubmit) {
      onSubmit(data);
    }

    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl">
      <ModalContent className="p-8 bg-white dark:bg-[#101828] transition-colors duration-500">
        <ModalHeader className="text-sevenColor dark:text-fourthColor text-4xl font-black justify-center mb-8">
          {title}
        </ModalHeader>

        <ModalBody dir="rtl">
          <form
            onSubmit={handleSubmit(handleFormSubmit)}
            className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6"
          >

            {fields.map((field, index) => (
              <CustomInput
                key={index}
                name={field.name}
                placeholder={field.placeholder}
                type={field.type || "text"} // ✅ يسمح date / time
                disabled={field.disabled || false}
                defaultValue={field.defaultValue || ""}
                register={register}
                style={{ backgroundColor: "var(--color-sevenColor)" }}
              />
            ))}

            <div className="col-span-full flex justify-center mt-8">
              <Button
                type="submit"
                className="bg-[#FFF1C1] dark:bg-fourthColor text-sevenColor px-16 py-7 rounded-full text-2xl font-bold shadow-sm hover:scale-105 transition-transform cursor-pointer"
              >
                {buttonText}
              </Button>
            </div>

          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}