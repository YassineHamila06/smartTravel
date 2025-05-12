import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  useLoginAdminMutation,
  useForgotPasswordMutation,
  useVerifyOtpMutation,
  useResetPasswordMutation,
} from "../../services/ADMIN-API";
import { useAuth } from "../contexts/AuthContext";

// Define error response type
interface ErrorResponse {
  data: {
    message?: string;
  };
  status?: number;
}

// Create a component for the global styles
const GlobalStyle = () => {
  const styles = `
    @keyframes blink {
      0%, 90%, 100% {
        transform: scaleY(0);
      }
      95% {
        transform: scaleY(1);
      }
    }
    .eye-blink {
      animation: blink 2.5s infinite;
    }
  `;

  return <style dangerouslySetInnerHTML={{ __html: styles }} />;
};

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [otpEmail, setOtpEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [resetStep, setResetStep] = useState(1); // 1: email entry, 2: OTP verification, 3: new password
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isResetSuccess, setIsResetSuccess] = useState(false);
  const [eyeBlink, setEyeBlink] = useState(false);
  const navigate = useNavigate();
  const { login, isAuthenticated, checkAuth, devModeLogin } = useAuth();

  // Use the loginAdmin mutation from the API
  const [
    loginAdmin,
    { isLoading, isError, error: loginError, isSuccess, data },
  ] = useLoginAdminMutation();

  // Use the forgot password mutations
  const [
    forgotPassword,
    {
      isLoading: isForgotLoading,
      isSuccess: isForgotSuccess,
      error: forgotError,
    },
  ] = useForgotPasswordMutation();

  const [
    verifyOtp,
    {
      isLoading: isVerifyLoading,
      isSuccess: isVerifySuccess,
      error: verifyError,
    },
  ] = useVerifyOtpMutation();

  const [
    resetPassword,
    {
      isLoading: isResetLoading,
      isSuccess: isResetPasswordSuccess,
      error: resetError,
    },
  ] = useResetPasswordMutation();

  // Set up a timer for the eye blink effect
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setEyeBlink(true);
      setTimeout(() => setEyeBlink(false), 200);
    }, 3000);

    return () => clearInterval(blinkInterval);
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated || checkAuth()) {
      console.log("Already authenticated, redirecting to dashboard");
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate, checkAuth]);

  // Add initialization for mount
  useEffect(() => {
    console.log("Login component mounted");
    // Check backend connection
    fetch("http://localhost:5001/admin", { method: "HEAD" })
      .then(() => {
        console.log("Backend server is reachable");
      })
      .catch((err) => {
        console.error("Backend server is not reachable:", err);
      });
  }, []);

  // Handle successful login
  useEffect(() => {
    if (isSuccess && data) {
      console.log("Login successful, received data:", data);

      // Use the login function from AuthContext instead of direct localStorage manipulation
      login(data.token, data.admin);

      // Redirect to dashboard
      navigate("/dashboard");
    }
  }, [isSuccess, data, navigate, login]);

  // Handle successful forgot password request
  useEffect(() => {
    if (isForgotSuccess) {
      setResetStep(2);
    }
  }, [isForgotSuccess]);

  // Handle successful OTP verification
  useEffect(() => {
    if (isVerifySuccess) {
      setResetStep(3);
    }
  }, [isVerifySuccess]);

  // Handle successful password reset
  useEffect(() => {
    if (isResetPasswordSuccess) {
      setIsResetSuccess(true);
      setShowForgotPassword(false);
      setResetStep(1);

      // Reset all form fields
      setOtpEmail("");
      setOtp(["", "", "", "", "", ""]);
      setNewPassword("");
      setConfirmPassword("");
    }
  }, [isResetPasswordSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    console.log(
      "Attempting login with:",
      email,
      password.length > 0 ? "[REDACTED]" : "[EMPTY]"
    );

    try {
      // Clear previous errors
      setError("");
      // Send login request to the backend
      await loginAdmin({ email, password });
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  // Handle forgot password submission
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpEmail) {
      setError("Email is required");
      return;
    }

    setError("");
    try {
      // Call the forgot password API endpoint to send OTP
      await forgotPassword({ email: otpEmail });
    } catch (err) {
      console.error("Forgot password error:", err);
    }
  };

  // Handle OTP verification
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join("");
    if (!otpString || otpString.length !== 6) {
      setError("Please enter the complete OTP");
      return;
    }

    console.log("Submitting OTP verification with:", {
      email: otpEmail,
      otp: otpString,
      otpLength: otpString.length,
    });

    setError("");
    try {
      // Call the verify OTP API endpoint
      await verifyOtp({ email: otpEmail, otp: otpString });
    } catch (err) {
      console.error("OTP verification error:", err);
    }
  };

  // Handle new password submission
  const handleNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      setError("Both password fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setError("");
    try {
      // Call the reset password API endpoint
      await resetPassword({
        email: otpEmail,
        otp: otp.join(""),
        newPassword: newPassword,
      });
    } catch (err) {
      console.error("Password reset error:", err);
    }
  };

  // Display API error message if available
  useEffect(() => {
    if (isError && loginError) {
      console.error("Login error from API:", loginError);

      if ("data" in loginError) {
        const errorMsg =
          (loginError as ErrorResponse).data?.message ||
          "Authentication failed";
        setError(errorMsg);
      } else {
        setError("Network error. Please try again later.");
      }
    }

    // Handle forgot password errors
    if (forgotError && "data" in forgotError) {
      const errorMsg =
        (forgotError as ErrorResponse).data?.message || "Failed to send OTP";
      setError(errorMsg);
    }

    // Handle OTP verification errors
    if (verifyError && "data" in verifyError) {
      const errorMsg =
        (verifyError as ErrorResponse).data?.message || "Invalid OTP";
      setError(errorMsg);
    }

    // Handle password reset errors
    if (resetError && "data" in resetError) {
      const errorMsg =
        (resetError as ErrorResponse).data?.message ||
        "Failed to reset password";
      setError(errorMsg);
    }
  }, [isError, loginError, forgotError, verifyError, resetError]);

  // Handle development mode activation
  const handleDevModeLogin = () => {
    devModeLogin();
  };

  // Add this function before the renderForgotPasswordForm
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(-1); // Only take the last character
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input if value is entered
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      // Move to previous input on backspace if current input is empty
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) {
        prevInput.focus();
      }
    }
  };

  // Add this function to toggle password visibility
  const togglePasswordVisibility = (
    field: "password" | "newPassword" | "confirmPassword"
  ) => {
    if (field === "password") {
      setShowPassword(!showPassword);
    } else if (field === "newPassword") {
      setShowNewPassword(!showNewPassword);
    } else if (field === "confirmPassword") {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  // Eye icon component with blinking effect
  const EyeIcon = ({ isVisible }: { isVisible: boolean }) => {
    // When password is visible (eye icon is open)
    if (isVisible) {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className={`w-5 h-5 text-gray-500 transition-all duration-200 ${
            eyeBlink ? "opacity-20" : "opacity-100"
          }`}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      );
    }

    // When password is hidden (eye icon with slash)
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-5 h-5 text-gray-500"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
        />
      </svg>
    );
  };

  // Render forgot password form based on current step
  const renderForgotPasswordForm = () => {
    switch (resetStep) {
      case 1:
        return (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div>
              <label
                className="block text-gray-700 text-sm font-semibold mb-2"
                htmlFor="otpEmail"
              >
                Email Address
              </label>
              <input
                type="email"
                id="otpEmail"
                value={otpEmail}
                onChange={(e) => setOtpEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter your email"
                required
                disabled={isForgotLoading}
              />
            </div>
            <button
              type="submit"
              className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={isForgotLoading}
            >
              {isForgotLoading ? "Sending..." : "Send OTP"}
            </button>
            <button
              type="button"
              onClick={() => setShowForgotPassword(false)}
              className="w-full text-primary py-2 px-4 rounded-md hover:bg-gray-100 transition duration-300 ease-in-out"
              disabled={isForgotLoading}
            >
              Back to Login
            </button>
          </form>
        );
      case 2:
        return (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label
                className="block text-gray-700 text-sm font-semibold mb-2"
                htmlFor="otp"
              >
                Enter OTP
              </label>
              <div className="flex justify-center space-x-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-12 h-12 text-center text-xl font-semibold border-2 border-secondary rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                    disabled={isVerifyLoading}
                  />
                ))}
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={isVerifyLoading}
            >
              {isVerifyLoading ? "Verifying..." : "Verify OTP"}
            </button>
            <button
              type="button"
              onClick={() => setResetStep(1)}
              className="w-full text-primary py-2 px-4 rounded-md hover:bg-gray-100 transition duration-300 ease-in-out"
              disabled={isVerifyLoading}
            >
              Back
            </button>
          </form>
        );
      case 3:
        return (
          <form onSubmit={handleNewPassword} className="space-y-4">
            <div>
              <label
                className="block text-gray-700 text-sm font-semibold mb-2"
                htmlFor="newPassword"
              >
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter new password"
                  required
                  disabled={isResetLoading}
                  minLength={6}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => togglePasswordVisibility("newPassword")}
                >
                  <EyeIcon isVisible={showNewPassword} />
                </button>
              </div>
            </div>
            <div>
              <label
                className="block text-gray-700 text-sm font-semibold mb-2"
                htmlFor="confirmPassword"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Confirm new password"
                  required
                  disabled={isResetLoading}
                  minLength={6}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => togglePasswordVisibility("confirmPassword")}
                >
                  <EyeIcon isVisible={showConfirmPassword} />
                </button>
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={isResetLoading}
            >
              {isResetLoading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/20">
      {/* Add global styles for animation */}
      <GlobalStyle />

      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl overflow-hidden mx-auto">
        <div className="bg-gradient-to-r from-primary to-primary/80 py-6">
          <h2 className="text-center text-3xl font-extrabold text-white">
            Admin Panel
          </h2>
          <p className="mt-2 text-center text-sm text-white/80">
            Access the administrator dashboard
          </p>
        </div>

        <div className="p-8">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-500"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Success message after password reset */}
          {isResetSuccess && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-green-500"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">
                    Password has been reset successfully! You can now login with
                    your new password.
                  </p>
                </div>
              </div>
            </div>
          )}

          {showForgotPassword ? (
            <>
              <h3 className="text-xl font-bold text-gray-700 mb-4">
                {resetStep === 1
                  ? "Forgot Password"
                  : resetStep === 2
                  ? "Verify OTP"
                  : "Reset Password"}
              </h3>
              {renderForgotPasswordForm()}
            </>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email address
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                      />
                    </svg>
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="focus:ring-primary focus:border-primary block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
                    placeholder="admin@example.com"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="focus:ring-primary focus:border-primary block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md"
                    disabled={isLoading}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility("password")}
                      className="focus:outline-none"
                    >
                      <EyeIcon isVisible={showPassword} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(true);
                      setError("");
                      setIsResetSuccess(false);
                    }}
                    className="font-medium text-primary hover:text-primary/80 focus:outline-none"
                  >
                    Forgot your password?
                  </button>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition duration-300 ease-in-out transform hover:scale-105"
                >
                  <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                    <svg
                      className="h-5 w-5 text-primary/70 group-hover:text-primary/60"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                  {isLoading ? "Logging in..." : "Login"}
                </button>
              </div>

              {/* Development mode login button - only visible in development */}
              {process.env.NODE_ENV !== "production" && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleDevModeLogin}
                    className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Development Mode Login
                  </button>
                  <p className="mt-1 text-xs text-gray-500 text-center">
                    This button bypasses authentication for development purposes
                    only.
                  </p>
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
