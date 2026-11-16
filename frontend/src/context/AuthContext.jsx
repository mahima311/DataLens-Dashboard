
import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("datalens_user")) || null;
    } catch {
      return null;
    }
  });

  function login(email, password) {
    const key = `datalens_account_${email.toLowerCase().trim()}`;
    let savedUser;

    try {
      savedUser = JSON.parse(localStorage.getItem(key));
    } catch {
      savedUser = null;
    }

    if (!savedUser || savedUser.password !== password) {
      return {
        success: false,
        message: "Invalid email or password."
      };
    }

    localStorage.setItem("datalens_user", JSON.stringify(savedUser));
    setUser(savedUser);

    return { success: true };
  }

  function signup(name, email, password) {
    const normalizedEmail = email.toLowerCase().trim();
    const key = `datalens_account_${normalizedEmail}`;

    if (localStorage.getItem(key)) {
      return {
        success: false,
        message: "An account with this email already exists."
      };
    }

    const newUser = {
      name: name.trim(),
      email: normalizedEmail,
      password
    };

    localStorage.setItem(key, JSON.stringify(newUser));
    localStorage.setItem("datalens_user", JSON.stringify(newUser));
    setUser(newUser);

    return { success: true };
  }

  function logout() {
    localStorage.removeItem("datalens_user");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
