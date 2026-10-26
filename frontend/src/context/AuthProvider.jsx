import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../api/client";
import { AuthContext } from "./authContext";
import { clearSession, getAccountType, getStoredUser, getToken, saveSession, saveUser } from "../utils/storage";

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(() => (getToken() ? getStoredUser() : null));
  const [accountType, setAccountType] = useState(() => getAccountType());

  // Refresh the user from the server on page load (role may have changed)
  useEffect(() => {
    if (!getToken()) return;
    api
      .get("/auth/me")
      .then((res) => {
        setUser(res.data.user);
        saveUser(res.data.user);
      })
      .catch(() => {
        /* 401 is handled by the axios interceptor */
      });
  }, []);

  const login = useCallback(async (email, password, rememberMe, selectedAccountType = "student") => {
    const res = await api.post("/auth/login", { email, password, rememberMe, accountType: selectedAccountType });
    saveSession(res.data.token, res.data.user, rememberMe, res.data.accountType);
    setUser(res.data.user);
    setAccountType(res.data.accountType);
    return res.data;
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
    setAccountType("student");
  }, []);

  const updateUser = useCallback((next) => {
    setUser(next);
    saveUser(next);
  }, []);

  const value = useMemo(
    () => ({ user, login, logout, updateUser, accountType, isAdmin: user?.role === "admin" }),
    [user, login, logout, updateUser, accountType]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
