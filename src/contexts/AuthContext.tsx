import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";

// Define admin type
interface Admin {
  id: string;
  name: string;
  email: string;
  profileImage: string | null;
}

// Define context type
interface AuthContextType {
  isAuthenticated: boolean;
  admin: Admin | null;
  logout: () => void;
  login: (token: string, adminData: Admin) => void;
  checkAuth: () => boolean;
  devModeLogin: () => void; // New development mode login function
}

// Create mock admin data for development
const mockAdminData: Admin = {
  id: "dev-admin-id",
  name: "Salma Test",
  email: "salmatest@gmail.com",
  profileImage: null,
};

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  admin: null,
  logout: () => {},
  login: () => {},
  checkAuth: () => false,
  devModeLogin: () => {}, // Add to default context
});

// Hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Props for the provider
interface AuthProviderProps {
  children: ReactNode;
}

// Provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [admin, setAdmin] = useState<Admin | null>(null);
  const navigate = useNavigate();

  // Function to check token validity
  const isTokenValid = (token: string): boolean => {
    try {
      // Basic check - If there's a JWT token, check if it's expired
      // This is a simple check and doesn't validate the signature
      if (!token) return false;

      // JWT tokens have 3 parts separated by dots
      const parts = token.split(".");
      if (parts.length !== 3) return false;

      // The middle part contains the payload with expiration time
      const payload = JSON.parse(atob(parts[1]));
      if (!payload.exp) return true; // If no expiration, assume valid

      // Check if token is expired
      const now = Math.floor(Date.now() / 1000);
      return payload.exp > now;
    } catch (error) {
      console.error("Error validating token:", error);
      return false;
    }
  };

  // Check if there's a token on mount or if dev mode is active
  useEffect(() => {
    const checkAuthentication = () => {
      // First check if dev mode is enabled
      const devMode = localStorage.getItem("dev-mode-enabled");

      if (devMode === "true") {
        console.log("Development mode authentication active");
        setIsAuthenticated(true);
        setAdmin(mockAdminData);
        return;
      }

      // Normal authentication flow
      const token = localStorage.getItem("admin-token");
      const adminInfo = localStorage.getItem("admin-info");

      console.log("Checking authentication on mount", {
        tokenExists: !!token,
        adminInfoExists: !!adminInfo,
      });

      if (token && adminInfo) {
        // Check if token is still valid
        if (isTokenValid(token)) {
          try {
            const parsedAdmin = JSON.parse(adminInfo);
            setIsAuthenticated(true);
            setAdmin(parsedAdmin);
            console.log("Successfully authenticated from stored token");
          } catch (error) {
            console.error("Error parsing admin info:", error);
            logout();
          }
        } else {
          console.warn("Stored token is invalid or expired");
          logout();
        }
      } else {
        console.log("No authentication found");
        setIsAuthenticated(false);
        setAdmin(null);
      }
    };

    checkAuthentication();
  }, []);

  // Development mode login - bypasses actual authentication
  const devModeLogin = () => {
    console.log("Development mode login activated");
    localStorage.setItem("dev-mode-enabled", "true");
    setIsAuthenticated(true);
    setAdmin(mockAdminData);
    navigate("/dashboard");
  };

  // Login function
  const login = (token: string, adminData: Admin) => {
    console.log("Login called with token and admin data");
    localStorage.setItem("admin-token", token);
    localStorage.setItem("admin-info", JSON.stringify(adminData));
    setIsAuthenticated(true);
    setAdmin(adminData);
  };

  // Check auth function - for components to verify auth status
  const checkAuth = (): boolean => {
    // First check for dev mode
    const devMode = localStorage.getItem("dev-mode-enabled");
    if (devMode === "true") {
      return true;
    }

    // Normal auth check
    const token = localStorage.getItem("admin-token");
    return !!token && isTokenValid(token);
  };

  // Logout function
  const logout = () => {
    console.log("Logout called");
    localStorage.removeItem("admin-token");
    localStorage.removeItem("admin-info");
    localStorage.removeItem("dev-mode-enabled"); // Also clear dev mode
    setIsAuthenticated(false);
    setAdmin(null);
    navigate("/login");
  };

  // Context value
  const value = {
    isAuthenticated,
    admin,
    logout,
    login,
    checkAuth,
    devModeLogin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Protected route component
interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, checkAuth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Double-check authentication status when route is accessed
    if (!isAuthenticated && !checkAuth()) {
      console.log(
        "Protected route accessed without authentication, redirecting to login"
      );
      navigate("/login");
    }
  }, [isAuthenticated, navigate, checkAuth]);

  return isAuthenticated || checkAuth() ? <>{children}</> : null;
};

export default AuthContext;
