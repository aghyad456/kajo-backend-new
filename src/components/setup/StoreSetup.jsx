import React, { useState } from "react";
import { Button } from "@heroui/react";
import { useNavigate } from "react-router-dom";
import { FaHome, FaStethoscope, FaMapMarkerAlt, FaPhoneAlt, FaCamera } from "react-icons/fa";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import CustomInput from "../CustomInput/CustomInput";
import img3 from "../../assets/Claws.svg";
import { storesSchema } from "../../schema/storeSchema";

import { api } from "../../api/apiClient";
import { useAuth } from "../../context/AuthContext";

export default function StoreSetup() {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const inputs = [
    { name: "name", placeholder: "اسم المتجر", icon: <FaHome />, type: "text" },
    { name: "specialty", placeholder: "التخصص", icon: <FaStethoscope />, type: "text" },
    { name: "location", placeholder: "العنوان", icon: <FaMapMarkerAlt />, type: "text" },
    { name: "phone", placeholder: "رقم الهاتف", icon: <FaPhoneAlt />, type: "text" },
  ];

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields },
  } = useForm({
    resolver: zodResolver(storesSchema),
    mode: "onTouched",
  });

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const onSubmit = async (data) => {
    try {
      setSaving(true);
      setError("");

      const formData = new FormData();

      formData.append("name", data.name);
      formData.append("specialty", data.specialty);
      formData.append("location", data.location);
      formData.append("phone", data.phone);
      formData.append("description", data.description || "");

      if (imageFile) {
        formData.append("avatar", imageFile);
      }

      await api.storeSetup(formData);

      // تحديث حالة المستخدم ليصبح has_setup = true
      setUser((prev) => ({
        ...prev,
        has_setup: true,
        hasSetup: true,
      }));

      // الانتقال إلى لوحة المتجر
      navigate("/app/store-dashboard", { replace: true });

    } catch (err) {
      console.error(err);
      setError(err?.data?.message || err?.message || "فشل إعداد المتجر");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="w-full min-h-screen flex items-center justify-center bg-white dark:bg-[#101828] p-6 transition-colors duration-500" dir="rtl">
      <div className="container mx-auto max-w-7xl">

        <p className="text-mainColor dark:text-fourthColor text-center mb-12 text-lg md:text-xl font-medium max-w-4xl mx-auto leading-relaxed">
          شكراً لثقتك في كاجو لبناء متجرك الاحترافي
        </p>

        {error && (
          <div className="max-w-2xl mx-auto mb-6 bg-red-100 text-red-700 p-4 rounded-2xl font-bold text-center">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* النص */}
          <div className="relative flex flex-col items-center order-1 md:order-2">
            <div className="relative z-10 text-center lg:text-right">
              <h1 className="text-sixColor dark:text-white text-7xl md:text-8xl font-black leading-tight">
                ابدأ
                <br />
                متجرك
                <br />
                الآن
              </h1>
            </div>

            <img
              src={img3}
              alt="Claws background"
              className="absolute top-45 left-1/2 -translate-x-1/3 -translate-y-1/2 w-full max-w-md opacity-20 dark:opacity-10 lg:opacity-100 z-0"
            />
          </div>

          {/* الفورم */}
          <div className="flex flex-col items-center order-2 md:order-1">

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="w-full max-w-md flex flex-col gap-5"
            >

              {/* صورة المتجر */}
              <div className="flex flex-col items-center mb-4">
                <label className="relative cursor-pointer group">
                  <div className="w-32 h-32 rounded-full border-4 border-dashed border-sevenColor flex items-center justify-center overflow-hidden bg-gray-50">

                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center">
                        <FaCamera className="text-sevenColor text-3xl mx-auto mb-1" />
                        <span className="text-xs text-gray-500">
                          لوغو المتجر
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

              <CustomInput
                name="description"
                placeholder="وصف المتجر"
                type="text"
                register={register}
                error={errors.description}
                isTouched={touchedFields.description}
                style={{ backgroundColor: "#F5A742" }}
                startContent={<FaHome className="text-white text-xl ml-3" />}
              />

              <Button
                type="submit"
                isDisabled={saving}
                className="bg-[#FFF1C1] dark:bg-fourthColor text-mainColor self-center w-48 h-14 rounded-full text-2xl font-bold mt-8 shadow-sm hover:scale-105 transition-transform cursor-pointer"
              >
                {saving ? "جاري الحفظ..." : "تسجيل"}
              </Button>

            </form>
          </div>
        </div>
      </div>
    </section>
  );
}