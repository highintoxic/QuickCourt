import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

// Create Auth Context
const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state on app load
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const currentUser = authService.getCurrentUser();
        const hasValidToken = authService.isAuthenticated();

        if (currentUser && hasValidToken) {
          setUser(currentUser);
          setIsAuthenticated(true);
        } else {
          // Clear any invalid tokens
          await authService.logout();
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        await authService.logout();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (credentials) => {
    setLoading(true);
    try {
      const result = await authService.login(credentials);
      
      if (result.success) {
        setUser(result.data.user);
        setIsAuthenticated(true);
        return result;
      } else {
        setUser(null);
        setIsAuthenticated(false);
        return result;
      }
    } catch (error) {
      console.error('Login error:', error);
      setUser(null);
      setIsAuthenticated(false);
      return {
        success: false,
        message: 'Login failed. Please try again.'
      };
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    setLoading(true);
    try {
      const result = await authService.register(userData);
      
      if (result.success) {
        // Don't automatically log in after registration
        // User might need to verify email/phone first
        return result;
      } else {
        return result;
      }
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: 'Registration failed. Please try again.'
      };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  // Send Email OTP
  const sendEmailOTP = async (email) => {
    try {
      return await authService.sendEmailOTP(email);
    } catch (error) {
      console.error('Send email OTP error:', error);
      return {
        success: false,
        message: 'Failed to send email OTP. Please try again.'
      };
    }
  };

  // Verify Email OTP
  const verifyEmailOTP = async (email, otp) => {
    try {
      return await authService.verifyEmailOTP(email, otp);
    } catch (error) {
      console.error('Verify email OTP error:', error);
      return {
        success: false,
        message: 'Email OTP verification failed. Please try again.'
      };
    }
  };

  // Send SMS OTP
  const sendSMSOTP = async (phone) => {
    try {
      return await authService.sendSMSOTP(phone);
    } catch (error) {
      console.error('Send SMS OTP error:', error);
      return {
        success: false,
        message: 'Failed to send SMS OTP. Please try again.'
      };
    }
  };

  // Verify SMS OTP
  const verifySMSOTP = async (phone, otp) => {
    try {
      return await authService.verifySMSOTP(phone, otp);
    } catch (error) {
      console.error('Verify SMS OTP error:', error);
      return {
        success: false,
        message: 'SMS OTP verification failed. Please try again.'
      };
    }
  };

  // Send WhatsApp OTP
  const sendWhatsAppOTP = async (phone) => {
    try {
      return await authService.sendWhatsAppOTP(phone);
    } catch (error) {
      console.error('Send WhatsApp OTP error:', error);
      return {
        success: false,
        message: 'Failed to send WhatsApp OTP. Please try again.'
      };
    }
  };

  // Verify WhatsApp OTP
  const verifyWhatsAppOTP = async (phone, otp) => {
    try {
      return await authService.verifyWhatsAppOTP(phone, otp);
    } catch (error) {
      console.error('Verify WhatsApp OTP error:', error);
      return {
        success: false,
        message: 'WhatsApp OTP verification failed. Please try again.'
      };
    }
  };

  // Forgot Password
  const forgotPassword = async (email) => {
    try {
      return await authService.forgotPassword(email);
    } catch (error) {
      console.error('Forgot password error:', error);
      return {
        success: false,
        message: 'Failed to send reset email. Please try again.'
      };
    }
  };

  // Reset Password
  const resetPassword = async (token, newPassword) => {
    try {
      return await authService.resetPassword(token, newPassword);
    } catch (error) {
      console.error('Reset password error:', error);
      return {
        success: false,
        message: 'Password reset failed. Please try again.'
      };
    }
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return user?.role === role;
  };

  // Check if user is admin
  const isAdmin = () => {
    return user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
  };

  // Check if user is facility owner
  const isFacilityOwner = () => {
    return user?.role === 'FACILITY_OWNER' || isAdmin();
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
    sendEmailOTP,
    verifyEmailOTP,
    sendSMSOTP,
    verifySMSOTP,
    sendWhatsAppOTP,
    verifyWhatsAppOTP,
    forgotPassword,
    resetPassword,
    hasRole,
    isAdmin,
    isFacilityOwner,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
