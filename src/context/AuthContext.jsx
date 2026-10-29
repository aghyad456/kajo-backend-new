
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";

import {
  api,
  clearAuth,
  getStoredUser,
  setAuth,
} from "../api/apiClient";

// ==========================================
// AUTH CONTEXT
// ==========================================

const AuthContext = createContext(null);

// ==========================================
// API BASE URL
// Local development + Production
// ==========================================

const API_BASE = (
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000"
)
  .replace(/\/api\/?$/, "")
  .replace(/\/+$/, "");

// ==========================================
// REDIRECT AFTER APPROVAL / ROLE UPDATE
// ==========================================

const getPostApprovalPath = (u) => {
  if (!u) return "/login";

  const role = Number(u.role);
  const hasSetup = !!(u.hasSetup ?? u.has_setup);

  // Admin
  if (role === 1) {
    return "/admin/dashboard";
  }

  // Doctor
  if (role === 5) {
    return hasSetup ? "/app/dashboard" : "/app/setup";
  }

  // Other roles use the default feed.
  return "/app/feed";
};

// ==========================================
// AUTH PROVIDER
// ==========================================

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());

  const [token, setToken] = useState(() =>
    localStorage.getItem("token")
  );

  const [loading, setLoading] = useState(true);

  // ========================================
  // UPDATE USER LOCALLY
  // ========================================

  const updateUserLocal = useCallback((patch) => {
    setUser((prev) => {
      const next = {
        ...(prev || {}),
        ...(patch || {}),
      };

      setAuth({ user: next });

      return next;
    });
  }, []);

  // ========================================
  // REFRESH AUTHENTICATED USER
  // ========================================

  const refreshMe = useCallback(async () => {
    const storedToken = localStorage.getItem("token");

    if (!storedToken) {
      return null;
    }

    try {
      // Primary API request
      const data = await api.me();

      const meUser = data?.user ?? data;

      if (!meUser) {
        throw new Error("User data is missing");
      }

      setUser(meUser);
      setToken(storedToken);
      setAuth({ user: meUser });

      return meUser;
    } catch  {
      // Fallback uses configured API URL,
      // never a hardcoded localhost address.
      try {
        const response = await fetch(
          `${API_BASE}/api/auth/me`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${storedToken}`,
              Accept: "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(
            `Authentication failed: ${response.status}`
          );
        }

        const data = await response.json();
        const meUser = data?.user ?? data;

        if (!meUser) {
          throw new Error("User data is missing");
        }

        setUser(meUser);
        setToken(storedToken);
        setAuth({ user: meUser });

        return meUser;
      } catch {
        // Clear invalid session if both requests fail.
        clearAuth();

        setUser(null);
        setToken(null);

        return null;
      }
    }
  }, []);

  // ========================================
  // CONTINUE AFTER ACCOUNT APPROVAL
  // ========================================

  const continueAfterApproval = useCallback(async () => {
    const meUser = await refreshMe();

    const currentUser = meUser || getStoredUser();

    return getPostApprovalPath(currentUser);
  }, [refreshMe]);

  // ========================================
  // INITIAL AUTHENTICATION CHECK
  // ========================================

  useEffect(() => {
    let mounted = true;

    const boot = async () => {
      try {
        const storedToken = localStorage.getItem("token");

        if (!storedToken) {
          return;
        }

        await refreshMe();
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    boot();

    return () => {
      mounted = false;
    };
  }, [refreshMe]);

  // ========================================
  // LOGIN
  // ========================================

  const login = async (email, password) => {
    const data = await api.login({
      email,
      password,
    });

    if (!data?.token || !data?.user) {
      throw new Error("Invalid login response");
    }

    setAuth({
      token: data.token,
      user: data.user,
    });

    setUser(data.user);
    setToken(data.token);

    return data.user;
  };

  // ========================================
  // LOGOUT
  // ========================================

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      // Clear locally even if server logout fails.
    }

    clearAuth();

    setUser(null);
    setToken(null);
  };

  // ========================================
  // ADMIN CHECK
  // ========================================

  const isAdmin =
    !!user && Number(user.role) === 1;

  // ========================================
  // PROVIDER VALUE
  // ========================================

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

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ==========================================
// CUSTOM AUTH HOOK
// ==========================================

export const useAuth = () => useContext(AuthContext);
