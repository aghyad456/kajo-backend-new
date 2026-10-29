import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import { api, clearAuth, getStoredUser, setAuth } from "../api/apiClient";

const AuthContext = createContext(null);

// ✅ helper: أين نروح بعد الموافقة/تحديث الدور؟
const getPostApprovalPath = (u) => {
  if (!u) return "/login";

  const role = Number(u.role);
  const hasSetup = !!(u.hasSetup ?? u.has_setup); // ✅ يدعم الاسمين

  // ✅ الأدمن
  if (role === 1) return "/admin/dashboard";

  // ✅ العيادات/الأطباء = 5
  if (role === 5) {
    return hasSetup ? "/app/dashboard" : "/app/setup";
  }

  // (اختياري) أدوار ثانية لاحقاً
  // if (role === 4) return hasSetup ? "/app/store/dashboard" : "/app/setup";
  // if (role === 3) return hasSetup ? "/app/shelter/dashboard" : "/app/setup";

  return "/app/feed";
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser());
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  // ✅ تحديث المستخدم محلياً + localStorage (مفيد بعد تحديث البروفايل)
  const updateUserLocal = useCallback((patch) => {
    setUser((prev) => {
      const next = { ...(prev || {}), ...(patch || {}) };
      setAuth({ user: next });
      return next;
    });
  }, []);

  // ✅ إعادة جلب بياناتي من السيرفر (بعد حفظ البروفايل أو بعد الموافقة أو بأي وقت)
  const refreshMe = useCallback(async () => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) return null;

    try {
      // ✅ الأساسي: api.me() => /api/auth/me
      const data = await api.me();
      const meUser = data?.user ?? data;

      setUser(meUser);
      setToken(storedToken);
      setAuth({ user: meUser }); // ✅ حدّث localStorage دائماً

      return meUser;
    } catch (e) {
      // ✅ fallback صريح (لو صار مشكلة بapiClient)
      try {
        const res = await fetch("http://127.0.0.1:8000/api/auth/me", {
          headers: {
            Authorization: `Bearer ${storedToken}`,
            Accept: "application/json",
          },
        });

        if (!res.ok) throw new Error("auth/me endpoint failed");
        const data = await res.json();
        const meUser = data?.user ?? data;

        setUser(meUser);
        setToken(storedToken);
        setAuth({ user: meUser });

        return meUser;
      } catch {
        // إذا فشل كل شيء، نظّف
        clearAuth();
        setUser(null);
        setToken(null);
        return null;
      }
    }
  }, []);

  // ✅ دالة جاهزة لزر "متابعة بالدور الجديد"
  const continueAfterApproval = useCallback(async () => {
    const meUser = await refreshMe();
    const u = meUser || getStoredUser(); // ✅ fallback مهم
    return getPostApprovalPath(u);
  }, [refreshMe]);

  // ✅ عند تشغيل التطبيق → تحقق من التوكن + حمّل user
  useEffect(() => {
    const boot = async () => {
      try {
        const storedToken = localStorage.getItem("token");

        if (!storedToken) {
          setLoading(false);
          return;
        }

        await refreshMe();
      } finally {
        setLoading(false);
      }
    };

    boot();
  }, [refreshMe]);

  // ✅ LOGIN
  const login = async (email, password) => {
    const data = await api.login({ email, password });

    setAuth({ token: data.token, user: data.user });

    setUser(data.user);
    setToken(data.token);

    return data.user;
  };

  // ✅ LOGOUT
  const logout = async () => {
    try {
      await api.logout();
    } catch {
      // حتى لو فشل الطلب، نمسح محلياً
    }

    clearAuth();
    setUser(null);
    setToken(null);
  };

  const isAdmin = !!user && Number(user.role) === 1;

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAdmin,
      login,
      logout,
      setUser,
      refreshMe,
      updateUserLocal,
      continueAfterApproval,
      getPostApprovalPath,
    }),
    [
      user,
      token,
      loading,
      isAdmin,
      refreshMe,
      updateUserLocal,
      continueAfterApproval,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);