// Where the login session is kept.
// "Remember me"  -> localStorage   (survives closing the browser)
// otherwise      -> sessionStorage (cleared when the tab is closed)

const TOKEN_KEY = "token";
const USER_KEY = "user";
const ACCOUNT_TYPE_KEY = "accountType";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
}

export function getStoredUser() {
  const raw = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getAccountType() {
  return localStorage.getItem(ACCOUNT_TYPE_KEY) || sessionStorage.getItem(ACCOUNT_TYPE_KEY) || "student";
}

export function saveSession(token, user, remember, accountType = "student") {
  clearSession();
  const store = remember ? localStorage : sessionStorage;
  store.setItem(TOKEN_KEY, token);
  store.setItem(USER_KEY, JSON.stringify(user));
  store.setItem(ACCOUNT_TYPE_KEY, accountType);
  if (remember) localStorage.setItem("rememberMe", "true");
}

export function saveUser(user) {
  const store = localStorage.getItem(TOKEN_KEY) ? localStorage : sessionStorage;
  store.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  [localStorage, sessionStorage].forEach((s) => {
    s.removeItem(TOKEN_KEY);
    s.removeItem(USER_KEY);
    s.removeItem(ACCOUNT_TYPE_KEY);
  });
  localStorage.removeItem("rememberMe");
}
