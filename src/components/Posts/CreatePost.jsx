
import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  FaPaw,
  FaPen,
  FaImage,
  FaVideo,
  FaMicrophone,
  FaCloudUploadAlt,
  FaTimes,
  FaPaperPlane,
  FaSpinner,
  FaCheckCircle,
  FaExclamationCircle,
  FaRegFileAudio,
  FaRegFileVideo,
  FaRegImage,
} from "react-icons/fa";

import { api } from "../../api/apiClient";
import { useAuth } from "../../context/AuthContext";

// ==========================================
// CONFIGURATION
// ==========================================

// Limits are frontend safeguards.
// Laravel must enforce its own limits too.
const MAX_FILE_SIZES = {
  image: 10 * 1024 * 1024,
  video: 100 * 1024 * 1024,
  voice: 20 * 1024 * 1024,
};

const POST_TYPES = [
  {
    value: "text",
    label: "نص",
    icon: FaPen,
    description: "شارك أفكارك",
  },
  {
    value: "image",
    label: "صورة",
    icon: FaImage,
    description: "شارك لحظة",
  },
  {
    value: "video",
    label: "فيديو",
    icon: FaVideo,
    description: "شارك فيديو",
  },
  {
    value: "voice",
    label: "صوت",
    icon: FaMicrophone,
    description: "شارك تسجيلاً",
  },
];

function getAcceptedTypes(type) {
  switch (type) {
    case "image":
      return "image/*";
    case "video":
      return "video/*";
    case "voice":
      return "audio/*";
    default:
      return undefined;
  }
}

function getMediaLabel(type) {
  switch (type) {
    case "image":
      return "صورة";
    case "video":
      return "فيديو";
    case "voice":
      return "ملف صوتي";
    default:
      return "ملف";
  }
}

function getMediaIcon(type) {
  switch (type) {
    case "image":
      return FaRegImage;
    case "video":
      return FaRegFileVideo;
    case "voice":
      return FaRegFileAudio;
    default:
      return FaCloudUploadAlt;
  }
}

function formatFileSize(bytes) {
  if (!Number.isFinite(bytes) || bytes < 0) return "—";

  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getErrorMessage(error) {
  const validationError = error?.data?.errors
    ? Object.values(error.data.errors).flat().find(Boolean)
    : null;

  return (
    validationError ||
    error?.data?.message ||
    error?.response?.data?.message ||
    error?.message ||
    "تعذر إنشاء المنشور. يرجى المحاولة مجدداً."
  );
}

// ==========================================
// USER AVATAR
// ==========================================

function UserAvatar({ user }) {
  const [failed, setFailed] = useState(false);

  const src = user?.avatar_url || user?.avatar || "";

  useEffect(() => {
    setFailed(false);
  }, [src]);

  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-mainColor/10 bg-mainColor/10 text-mainColor dark:border-white/10 dark:bg-white/10 dark:text-white">
      {src && !failed ? (
        <img
          src={src}
          alt={user?.name || "صورة المستخدم"}
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <FaPaw size={20} />
      )}
    </div>
  );
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function CreatePost({ onCreated, onError }) {
  const { user } = useAuth();

  const [postType, setPostType] = useState("text");
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fileInputRef = useRef(null);
  const submittingRef = useRef(false);

  // ======================================
  // FILE PREVIEW
  // ======================================

  const previewUrl = useMemo(() => {
    if (!file) return null;

    return URL.createObjectURL(file);
  }, [file]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const accept = getAcceptedTypes(postType);
  const MediaIcon = getMediaIcon(postType);

  // ======================================
  // RESET
  // ======================================

  const resetForm = () => {
    setPostType("text");
    setCaption("");
    setFile(null);
    setIsDragging(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const clearFile = () => {
    setFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ======================================
  // TYPE SELECTION
  // ======================================

  const handleTypeChange = (type) => {
    if (submitting) return;

    setPostType(type);
    setFile(null);
    setError("");
    setSuccess("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ======================================
  // FILE VALIDATION
  // ======================================

  const validateFile = (selectedFile) => {
    if (!selectedFile) {
      return "يرجى اختيار ملف أولاً.";
    }

    const mime = selectedFile.type || "";

    const expectedPrefix =
      postType === "image"
        ? "image/"
        : postType === "video"
        ? "video/"
        : postType === "voice"
        ? "audio/"
        : "";

    if (!expectedPrefix || !mime.startsWith(expectedPrefix)) {
      return `نوع الملف غير مناسب. يرجى اختيار ${getMediaLabel(postType)}.`;
    }

    const maxSize = MAX_FILE_SIZES[postType];

    if (maxSize && selectedFile.size > maxSize) {
      return `الملف كبير جداً. الحد المحدد في الواجهة هو ${formatFileSize(maxSize)}.`;
    }

    if (selectedFile.size === 0) {
      return "الملف المحدد فارغ.";
    }

    return null;
  };

  const handleSelectedFile = (selectedFile) => {
    if (submitting || postType === "text") return;

    const validationError = validateFile(selectedFile);

    if (validationError) {
      clearFile();
      setError(validationError);
      onError?.(validationError);
      return;
    }

    setFile(selectedFile);
    setError("");
    setSuccess("");
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0] || null;

    if (selectedFile) {
      handleSelectedFile(selectedFile);
    }
  };

  // ======================================
  // DRAG AND DROP
  // ======================================

  const handleDragOver = (event) => {
    event.preventDefault();

    if (postType !== "text" && !submitting) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (event) => {
    event.preventDefault();

    if (!event.currentTarget.contains(event.relatedTarget)) {
      setIsDragging(false);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);

    if (postType === "text" || submitting) return;

    const droppedFile = event.dataTransfer.files?.[0];

    if (droppedFile) {
      handleSelectedFile(droppedFile);
    }
  };

  // ======================================
  // VALIDATE POST
  // ======================================

  const validateBeforeSubmit = () => {
    if (!postType) {
      return "يرجى اختيار نوع المنشور.";
    }

    if (postType === "text") {
      if (!caption.trim()) {
        return "يرجى كتابة محتوى المنشور.";
      }

      return null;
    }

    if (!file) {
      return `يرجى اختيار ${getMediaLabel(postType)} قبل النشر.`;
    }

    return validateFile(file);
  };

  const canSubmit =
    !submitting &&
    (postType === "text" ? caption.trim().length > 0 : Boolean(file));

  // ======================================
  // CREATE POST
  // ======================================

  const handleSubmit = async (event) => {
    event?.preventDefault?.();

    if (submittingRef.current) return;

    const validationError = validateBeforeSubmit();

    if (validationError) {
      setError(validationError);
      setSuccess("");
      onError?.(validationError);
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();

      // Keep the existing Laravel contract:
      // voice in the UI becomes audio in the API.
      const backendType =
        postType === "voice" ? "audio" : postType;

      formData.append("type", backendType);

      if (caption.trim()) {
        formData.append("text", caption.trim());
      }

      if (file) {
        formData.append("media", file);
      }

      const response = await api.createPost(formData);

      const createdPost =
        response?.post ??
        response?.data?.post ??
        response?.data ??
        null;

      resetForm();

      setSuccess("تم نشر منشورك بنجاح!");

      if (typeof onCreated === "function") {
        try {
          await onCreated(createdPost);
        } catch (callbackError) {
          console.error(
            "Post created, but feed refresh failed:",
            callbackError
          );
        }
      }
    } catch (err) {
      const message = getErrorMessage(err);

      setError(message);
      onError?.(message);
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  // ======================================
  // RENDER
  // ======================================

  return (
    <section
      dir="rtl"
      aria-label="إنشاء منشور"
      className="mb-7 w-full overflow-hidden rounded-[26px] border border-mainColor/10 bg-white shadow-sm transition-colors duration-300 dark:border-white/10 dark:bg-[#1D2939]"
    >
      {/* ====================================
          HEADER
      ==================================== */}

      <div className="flex items-center gap-3 border-b border-mainColor/10 px-5 py-5 dark:border-white/10 sm:px-6">
        <UserAvatar user={user} />

        <div className="min-w-0 flex-1">
          <h2 className="text-base font-black text-mainColor dark:text-white">
            إنشاء منشور جديد
          </h2>

          <p className="mt-1 text-xs text-secondaryColor dark:text-gray-400">
            شارك مجتمع كاجو لحظاتك وتجاربك مع أليفك
          </p>
        </div>

        <span className="hidden h-10 w-10 items-center justify-center rounded-xl bg-mainColor/10 text-mainColor dark:bg-white/10 dark:text-white sm:flex">
          <FaPaw size={19} />
        </span>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="px-5 pb-5 pt-6 sm:px-6">

          {/* ====================================
              POST TYPES
          ==================================== */}

          <div className="mb-6">
            <p className="mb-3 text-xs font-extrabold text-secondaryColor dark:text-gray-400">
              نوع المنشور
            </p>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {POST_TYPES.map((type) => {
                const Icon = type.icon;
                const active = postType === type.value;

                return (
                  <button
                    key={type.value}
                    type="button"
                    disabled={submitting}
                    onClick={() => handleTypeChange(type.value)}
                    aria-pressed={active}
                    className={[
                      "flex min-h-[68px] flex-col items-center justify-center gap-2 rounded-2xl border px-3 py-3 text-sm font-extrabold transition-all duration-200",
                      active
                        ? "border-mainColor bg-mainColor text-white shadow-md"
                        : "border-mainColor/10 bg-mainColor/[0.035] text-mainColor hover:border-mainColor/25 hover:bg-mainColor/10 dark:border-white/10 dark:bg-white/5 dark:text-white",
                      "disabled:cursor-not-allowed disabled:opacity-50",
                    ].join(" ")}
                  >
                    <Icon size={20} />

                    <span>{type.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ====================================
              TEXT AREA
          ==================================== */}

          <div className="mb-5">
            <label
              htmlFor="kajo-create-post-caption"
              className="mb-3 block text-xs font-extrabold text-secondaryColor dark:text-gray-400"
            >
              {postType === "text"
                ? "محتوى المنشور"
                : "وصف المنشور (اختياري)"}
            </label>

            <textarea
              id="kajo-create-post-caption"
              value={caption}
              onChange={(event) => {
                setCaption(event.target.value);
                setError("");
                setSuccess("");
              }}
              disabled={submitting}
              rows={4}
              placeholder={
                postType === "text"
                  ? "شو حابب تشارك مجتمع كاجو اليوم؟ 🐾"
                  : "اكتب وصفاً للصورة أو الفيديو أو التسجيل..."
              }
              className="min-h-[125px] w-full resize-y rounded-[20px] border border-mainColor/10 bg-fivethColor/60 px-5 py-4 text-sm font-medium leading-8 text-mainColor outline-none transition-all placeholder:text-mainColor/40 focus:border-mainColor focus:ring-4 focus:ring-mainColor/10 disabled:opacity-60 dark:border-white/10 dark:bg-[#101828] dark:text-white dark:placeholder:text-white/40"
            />
          </div>

          {/* ====================================
              MEDIA UPLOAD
          ==================================== */}

          {postType !== "text" && (
            <div className="mb-5">
              <p className="mb-3 text-xs font-extrabold text-secondaryColor dark:text-gray-400">
                إرفاق {getMediaLabel(postType)}
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept={accept}
                onChange={handleFileChange}
                disabled={submitting}
                className="sr-only"
                aria-label={`اختيار ${getMediaLabel(postType)}`}
              />

              {!file ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={[
                    "rounded-[22px] border-2 border-dashed p-6 text-center transition-all duration-200",
                    isDragging
                      ? "border-mainColor bg-mainColor/10"
                      : "border-mainColor/20 bg-mainColor/[0.025] hover:border-mainColor/40 dark:border-white/15 dark:bg-white/[0.025]",
                  ].join(" ")}
                >
                  <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-mainColor/10 text-mainColor dark:bg-white/10 dark:text-white">
                    <FaCloudUploadAlt size={27} />
                  </span>

                  <p className="mb-2 text-sm font-black text-mainColor dark:text-white">
                    اسحب الملف لهون أو اختره من جهازك
                  </p>

                  <p className="mb-5 text-xs leading-6 text-secondaryColor dark:text-gray-400">
                    {`النوع: ${getMediaLabel(postType)} — الحد في الواجهة: ${formatFileSize(MAX_FILE_SIZES[postType])}`}
                  </p>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={submitting}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-mainColor px-5 py-3 text-xs font-extrabold text-white transition hover:opacity-90 disabled:opacity-50"
                  >
                    <MediaIcon size={15} />
                    اختيار الملف
                  </button>
                </div>
              ) : (
                /* MEDIA PREVIEW */
                <div className="overflow-hidden rounded-[22px] border border-mainColor/10 bg-mainColor/[0.025] dark:border-white/10 dark:bg-[#101828]">
                  <div className="flex items-center justify-between gap-3 border-b border-mainColor/10 px-4 py-3 dark:border-white/10">
                    <div className="flex min-w-0 items-center gap-2">
                      <MediaIcon
                        size={16}
                        className="shrink-0 text-mainColor dark:text-white"
                      />

                      <div className="min-w-0">
                        <p className="truncate text-xs font-extrabold text-mainColor dark:text-white">
                          {file.name}
                        </p>

                        <p className="mt-1 text-xs text-secondaryColor dark:text-gray-400">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={clearFile}
                      disabled={submitting}
                      aria-label="إزالة الملف"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600 transition hover:bg-red-100 disabled:opacity-50 dark:bg-red-950/20 dark:text-red-400"
                    >
                      <FaTimes size={14} />
                    </button>
                  </div>

                  {postType === "image" && previewUrl && (
                    <div className="flex max-h-[380px] items-center justify-center bg-black/5 p-3 dark:bg-black/20">
                      <img
                        src={previewUrl}
                        alt="معاينة الصورة قبل النشر"
                        className="max-h-[360px] w-full rounded-xl object-contain"
                      />
                    </div>
                  )}

                  {postType === "video" && previewUrl && (
                    <div className="bg-black">
                      <video
                        src={previewUrl}
                        controls
                        preload="metadata"
                        className="max-h-[380px] w-full"
                      >
                        متصفحك لا يدعم تشغيل الفيديو.
                      </video>
                    </div>
                  )}

                  {postType === "voice" && previewUrl && (
                    <div className="p-5">
                      <audio
                        controls
                        preload="metadata"
                        src={previewUrl}
                        className="w-full"
                      >
                        متصفحك لا يدعم تشغيل الصوت.
                      </audio>
                    </div>
                  )}

                  <div className="p-3 text-center">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={submitting}
                      className="text-xs font-bold text-mainColor underline underline-offset-4 disabled:opacity-50 dark:text-white"
                    >
                      تغيير الملف
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ====================================
              FEEDBACK
          ==================================== */}

          {error && (
            <div
              role="alert"
              className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-300"
            >
              <FaExclamationCircle className="mt-1 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div
              role="status"
              className="mb-5 flex items-start gap-3 rounded-xl border border-mainColor/15 bg-mainColor/10 px-4 py-3 text-sm font-bold text-mainColor dark:bg-white/10 dark:text-white"
            >
              <FaCheckCircle className="mt-1 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* ====================================
              SUBMIT
          ==================================== */}

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-mainColor/10 pt-5 dark:border-white/10">
            <p className="flex items-center gap-2 text-xs font-medium text-secondaryColor dark:text-gray-400">
              <FaPaw className="text-mainColor dark:text-white" />
              شارك لحظات أليفك مع المجتمع
            </p>

            <button
              type="submit"
              disabled={!canSubmit}
              className="inline-flex min-h-[48px] min-w-[150px] items-center justify-center gap-3 rounded-xl bg-mainColor px-6 py-3 text-sm font-extrabold text-white shadow-md transition-all hover:-translate-y-0.5 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
            >
              {submitting ? (
                <>
                  <FaSpinner className="animate-spin" />
                  جارٍ النشر...
                </>
              ) : (
                <>
                  <FaPaperPlane size={15} />
                  نشر المنشور
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}
