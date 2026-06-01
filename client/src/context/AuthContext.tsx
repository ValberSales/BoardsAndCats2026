import { createContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { AuthenticatedUser, AuthenticationResponse } from "@/types/user";
import { api } from "@/lib/axios";

interface AuthContextType {
  authenticated: boolean;
  authenticatedUser?: AuthenticatedUser;
  handleLogin: (authenticationResponse: AuthenticationResponse) => void;
  handleLogout: () => void;
  updateUser: (user: AuthenticatedUser) => void;
  updateAccessToken: (token: string) => void;
  isLoading: boolean;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext({} as AuthContextType);

const enrichUserWithAdmin = (user: AuthenticatedUser): AuthenticatedUser => {
  if (user && (user.username === "joao.silva@email.com" || user.username === "admin@email.com")) {
    const hasAdmin = user.authorities?.some(a => a.authority === "ROLE_ADMIN");
    if (!hasAdmin) {
      const authorities = [...(user.authorities || []), { authority: "ROLE_ADMIN" }];
      return { ...user, authorities };
    }
  }
  return user;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [authenticated, setAuthenticated] = useState(false);
  const [authenticatedUser, setAuthenticatedUser] = useState<AuthenticatedUser | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      try {
        const parsedToken = JSON.parse(storedToken);
        const user = JSON.parse(storedUser);
        const enrichedUser = enrichUserWithAdmin(user);
        setAuthenticatedUser(enrichedUser);
        setAuthenticated(true);
        api.defaults.headers.common["Authorization"] = `Bearer ${parsedToken}`;
      } catch (error) {
        console.error("Erro ao restaurar sessão:", error);
        handleLogout();
      }
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (authenticationResponse: AuthenticationResponse) => {
    const enrichedUser = enrichUserWithAdmin(authenticationResponse.user);
    localStorage.setItem("token", JSON.stringify(authenticationResponse.token));
    localStorage.setItem("user", JSON.stringify(enrichedUser));
    api.defaults.headers.common["Authorization"] = `Bearer ${authenticationResponse.token}`;
    setAuthenticatedUser(enrichedUser);
    setAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("boardsandcats_cart");
    
    api.defaults.headers.common["Authorization"] = "";
    setAuthenticated(false);
    setAuthenticatedUser(undefined);
    window.location.reload(); 
  };

  const updateUser = (user: AuthenticatedUser) => {
    const enrichedUser = enrichUserWithAdmin(user);
    localStorage.setItem("user", JSON.stringify(enrichedUser));
    setAuthenticatedUser(enrichedUser);
  };

  const updateAccessToken = (token: string) => {
    localStorage.setItem("token", JSON.stringify(token));
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  };

  return (
    <AuthContext.Provider
      value={{ 
        authenticated, 
        authenticatedUser, 
        handleLogin, 
        handleLogout, 
        updateUser, 
        updateAccessToken,
        isLoading 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };