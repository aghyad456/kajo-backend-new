import React, { useState } from "react";
import { Button } from "@heroui/react";
import { useNavigate } from "react-router-dom";
import {
  FaHome,
  FaStethoscope,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaCamera,
} from "react-icons/fa";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import CustomInput from "../../components/CustomInput/CustomInput";
import img3 from "../../assets/Claws.svg";
import { clinicSchema } from "../../schema/clinicSchema";

import { useAuth } from "../../context/AuthContext";
import { api } from "../../api/apiClient";

export default function DoctorSetup() {
  const navigate = useNavigate();
  const { refreshMe } = useAuth();

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  const inputs = [
    {
      name: "name",
      placeholder: "اسم الدكتور/العيادة",
      icon: <FaHome />,
      type: "text",
    },
    {
      name: "specialty",
      placeholder: "التخصص",
      icon: <FaStethoscope />,
      type: "text",
    },
    {
      name: "location",
      placeholder: "العنوان",
      icon: <FaMapMarkerAlt />,
      type: "text",
    },
    {
      name: "phone",
      placeholder: "رقم الهاتف",
      icon: <FaPhoneAlt />,
      type: "text",
    },
  ];

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields },
  } = useForm({
    resolver: zodResolver(clinicSchema),
    mode: "onTouched",
    defaultValues: {
      name: "",
      specialty: "",
      location: "",
      phone: "",
    },
  });

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data) => {
    setServerError("");
    setSubmitting(true);

    try {
      // ✅ جهز FormData
      const formData = new FormData();
      formData.append("name", data.name ?? "");
      formData.append("specialty", data.specialty ?? "");
      formData.append("location", data.location ?? "");
      formData.append("phone", data.phone ?? "");

      if (imageFile) {
        formData.append("avatar", imageFile); // ✅ نفس اسم الباك
      }

      // ✅ Debug: اطبع القيم المرسلة
      for (const [k, v] of formData.entries()) {
        console.log("[FORMDATA]", k, v);
      }

      // ✅ استدعاء endpoint setup
      // لازم يكون عندك api.clinicSetup(formData)
      await api.clinicSetup(formData);

      // ✅ حدث المستخدم
      const updatedUser = await refreshMe();

      // ✅ توجيه ذكي
      const role = Number(updatedUser?.role);
      const hasSetup = !!(updatedUser?.hasSetup ?? updatedUser?.has_setup);

      if (role === 1) {
        navigate("/admin/dashboard", { replace: true });
        return;
      }

      if (role === 5) {
        navigate(hasSetup ? "/app/dashboard" : "/app/setup", { replace: true });
        return;
      }

      navigate("/app/feed", { replace: true });
    } catch (e) {
      console.error(e);
      const msg =
        e?.data?.message ||
        e?.message ||
        "حدث خطأ أثناء تفعيل العيادة";
      setServerError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      className="w-full min-h-screen flex items-center justify-center bg-white dark:bg-[#101828] p-6 transition-colors duration-500"
      dir="rtl"
    >
      <div className="container mx-auto max-w-7xl">
        <p className="text-mainColor dark:text-fourthColor text-center mb-12 text-lg md:text-xl font-medium max-w-4xl mx-auto leading-relaxed">
          شكراً لثقتك في كاجو لبناء عيادتك الاحترافية 🩺
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* يسار */}
          <div className="relative flex flex-col items-center order-1">
            <div className="relative z-10 text-center lg:text-right">
              <h1 className="text-sixColor dark:text-white text-6xl md:text-8xl font-black leading-tight italic">
                إبدأ عيادتك <br />
                الاحترافية <br />
                <span className="text-sixColor dark:text-fourthColor">معنا</span>
              </h1>
            </div>

            <img
              src={img3}
              alt="Claws background"
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md opacity-20 dark:opacity-10 lg:opacity-100 z-0"
            />
          </div>

          {/* يمين */}
          <div className="flex flex-col items-center order-2">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="w-full max-w-md flex flex-col gap-5"
            >
              {serverError && (
                <div className="bg-red-100 text-red-700 p-3 rounded-xl text-sm font-bold">
                  {serverError}
                </div>
              )}

              {/* صورة */}
              <div className="flex flex-col items-center mb-4">
                <label className="relative cursor-pointer group">
                  <div className="w-32 h-32 rounded-full border-4 border-dashed border-sevenColor flex items-center justify-center overflow-hidden bg-gray-50 transition-all group-hover:border-white">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Clinic Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center">
                        <FaCamera className="text-sevenColor text-3xl mx-auto mb-1" />
                        <span className="text-[10px] text-gray-500">
                          صورة العيادة/الطبيب
                        </span>
                      </div>
                    )}
                  </div>

                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              </div>

              {/* Inputs */}
              {inputs.map((input) => (
                <CustomInput
                  key={input.name}
                  name={input.name}
                  placeholder={input.placeholder}
                  type={input.type}
                  register={register}
                  error={errors[input.name]}
                  isTouched={touchedFields[input.name]}
                  style={{ backgroundColor: "#F5A742" }}
                  startContent={React.cloneElement(input.icon, {
                    className: "text-white text-xl ml-3",
                  })}
                />
              ))}

              <Button
                type="submit"
                isDisabled={submitting}
                className="bg-[#FFF1C1] dark:bg-fourthColor text-sevenColor dark:text-mainColor self-center w-56 h-14 rounded-full text-2xl font-black mt-8 shadow-lg hover:scale-105 transition-transform cursor-pointer"
              >
                {submitting ? "جاري التفعيل..." : "تفعيل العيادة ✨"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}