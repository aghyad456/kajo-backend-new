import React, { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaHeart, FaComment, FaBookmark, FaPaperPlane } from "react-icons/fa";
import Comment from "./Comment";
import ActionMenu from "../ActionMenu/ActionMenu";
import { api } from "../../api/apiClient";
import { useAuth } from "../../context/AuthContext";

const DEFAULT_AVATAR = "/default-avatar.png";

export default function PostCard({ post, comments, refreshFeed }) {
  const location = useLocation();
  const { user } = useAuth();

  const detailsPath = `/app/posts/${post.id}`;
  const isPostDetails = location.pathname.startsWith("/app/posts/");

  const commentList = Array.isArray(comments)
    ? comments
    : Array.isArray(post?.comments)
    ? post.comments
    : [];

  const displayedComments = isPostDetails ? commentList : commentList.slice(0, 2);

  const userName = post?.user?.name || post?.userName || "user";
  const caption = post?.text ?? post?.caption ?? "";
  const type = post?.type || (post?.image ? "image" : "text");
  const mediaUrl = post?.media_url || post?.image || null;

  const rawAvatarUrl = post?.user?.avatar_url || "";
  const cacheKey = post?.user?.avatar_path || post?.user?.updated_at || post?.updated_at || "";

  const avatarSrc = rawAvatarUrl
    ? `${rawAvatarUrl}${rawAvatarUrl.includes("?") ? "&" : "?"}v=${encodeURIComponent(cacheKey)}`
    : DEFAULT_AVATAR;

  const [liked, setLiked] = useState(!!post?.liked_by_me);
  const [saved, setSaved] = useState(!!post?.saved_by_me);
  const [likesCount, setLikesCount] = useState(Number(post?.likes_count ?? 0));
  const commentsCount = Number(post?.comments_count ?? commentList.length ?? 0);

  const [commentText, setCommentText] = useState("");
  const [addingComment, setAddingComment] = useState(false);

  const isAdmin = Number(user?.role) === 1;

  const mediaNode = useMemo(() => {
    if (!mediaUrl) return null;

    if (type === "image") {
      return (
        <img
          src={mediaUrl}
          className={`w-full h-full ${isPostDetails ? "object-contain" : "object-cover"}`}
          alt="post"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      );
    }

    if (type === "video") {
      return (
        <video
          src={mediaUrl}
          controls
          className="w-full h-full object-contain bg-black"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      );
    }

    if (type === "audio") {
      return (
        <div className="w-full h-full flex items-center justify-center bg-[#FFF4C7] p-6">
          <audio src={mediaUrl} controls className="w-full" />
        </div>
      );
    }

    return null;
  }, [mediaUrl, type, isPostDetails]);

  const handleToggleLike = async () => {
    const prevLiked = liked;
    const prevCount = likesCount;

    try {
      setLiked(!prevLiked);
      setLikesCount(prevLiked ? Math.max(0, prevCount - 1) : prevCount + 1);

      const res = await api.toggleLike(post.id);
      const payload = res?.data ?? res;

      if (typeof payload?.liked === "boolean") setLiked(payload.liked);
      if (typeof payload?.likes_count === "number") setLikesCount(payload.likes_count);
    } catch (e) {
      setLiked(prevLiked);
      setLikesCount(prevCount);
      alert(e?.message || "فشل تنفيذ اللايك");
    }
  };

  const handleToggleSave = async () => {
    const prevSaved = saved;

    try {
      setSaved(!prevSaved);

      const res = await api.toggleSavePost(post.id);
      const payload = res?.data ?? res;

      if (typeof payload?.saved === "boolean") {
        setSaved(payload.saved);
      }

      refreshFeed?.();
    } catch (e) {
      setSaved(prevSaved);
      alert(e?.message || "فشل حفظ المنشور");
    }
  };

  const handleAddComment = async () => {
    const txt = commentText.trim();
    if (!txt || addingComment) return;

    try {
      setAddingComment(true);
      await api.addComment(post.id, { text: txt });
      setCommentText("");
      refreshFeed?.();
    } catch (e) {
      alert(e?.message || e?.response?.data?.message || "فشل إضافة التعليق");
    } finally {
      setAddingComment(false);
    }
  };

  const handleDeletePost = async () => {
    if (!isAdmin) return;

    const ok = window.confirm("هل أنت متأكد من حذف المنشور؟");
    if (!ok) return;

    try {
      await api.adminDeletePost(post.id);
      refreshFeed?.();
    } catch (e) {
      alert(e?.message || e?.response?.data?.message || "فشل حذف المنشور");
    }
  };

  return (
    <div className={`bg-mainColor rounded-[45px] p-6 mb-8 mx-auto shadow-2xl ${isPostDetails ? "max-w-6xl" : "max-w-120"}`}>
      <div className="flex items-center justify-between mb-5 px-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-white border-4 border-white overflow-hidden shadow-md">
            <img
              src={avatarSrc}
              className="w-full h-full object-cover"
              alt="user"
              onError={(e) => {
                e.currentTarget.src = DEFAULT_AVATAR;
              }}
            />
          </div>

          <span className="text-white font-black text-xl tracking-tight">
            @{userName}
          </span>
        </div>

        {isAdmin ? (
          <ActionMenu dotsColor="text-white" onDelete={handleDeletePost} />
        ) : (
          <div />
        )}
      </div>

      {!!caption && (
        <Link to={detailsPath} className="block mt-5 px-6">
          <p className="text-white font-bold text-md text-right py-2 leading-snug">
            {caption}
          </p>
        </Link>
      )}

      {type !== "text" && (
        <div className="bg-[#FFF4C7] rounded-[40px] p-4 shadow-inner">
          <div className={`rounded-[30px] overflow-hidden shadow-lg ${isPostDetails ? "h-112" : "h-87.5"}`}>
            <Link to={detailsPath} className="block w-full h-full">
              {mediaNode}
            </Link>
          </div>
        </div>
      )}

      <div className="mt-5 px-6">
        <div className="flex justify-between items-center mt-6 px-4 pb-2">
          <FaBookmark
            onClick={handleToggleSave}
            className={`text-2xl cursor-pointer hover:scale-110 transition ${
              saved ? "text-yellow-300" : "text-sixColor"
            }`}
          />

          <div className="flex gap-6">
            <FaPaperPlane className="text-sixColor text-2xl cursor-pointer hover:scale-110 transition" />

            <Link to={detailsPath} className="relative cursor-pointer hover:scale-110 transition">
              <FaComment className="text-sixColor text-2xl" />
              <span className="absolute -top-2 -right-2 bg-white text-mainColor text-[10px] font-bold px-1.5 rounded-full border border-mainColor">
                {commentsCount}
              </span>
            </Link>

            <div onClick={handleToggleLike} className="relative cursor-pointer hover:scale-110 transition">
              <FaHeart className={`text-2xl ${liked ? "text-red-500" : "text-sixColor"}`} />
              <span className="absolute -top-2 -right-2 bg-white text-mainColor text-[10px] font-bold px-1.5 rounded-full border border-mainColor">
                {likesCount}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <hr className="border-sixColor/30" />
          <p className="text-sixColor font-bold text-sm py-2 text-right">إضافة تعليق</p>
          <hr className="border-sixColor/30" />

          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddComment();
            }}
            placeholder="اكتب شيئاً... 🐾 (اضغط Enter للإرسال)"
            className="w-full mt-3 p-3 rounded-2xl bg-[#FFF4C7] text-sixColor placeholder-sixColor/60 outline-none text-right shadow-inner text-sm"
            disabled={addingComment}
          />
        </div>

        <div className="mt-6 space-y-4">
          {displayedComments.map((comment) => (
            <Comment
              key={comment?.id ?? `${comment?.created_at}-${Math.random()}`}
              comment={comment}
              refreshFeed={refreshFeed}
            />
          ))}
        </div>

        {!isPostDetails && (
          <Link
            to={detailsPath}
            className="text-[#FFF4C7] text-sm mt-4 opacity-90 cursor-pointer italic text-center block"
          >
            عرض كل التعليقات...
          </Link>
        )}
      </div>
    </div>
  );
}