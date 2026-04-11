import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, UserRole, AuthContextType } from '../types';
import { loginUser, registerUser, forgotPasswordApi, resetPasswordApi, getCurrentUser, updateUser, changePasswordApi } from '../services/api';
import toast from 'react-hot-toast';

// Create Auth Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Local storage keys
const USER_STORAGE_KEY = 'business_nexus_user';
const TOKEN_STORAGE_KEY = 'business_nexus_token';

// Auth Provider Component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for stored token on initial load and restore session
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (token) {
        try {
          const response = await getCurrentUser();
          const userData = response.data.user;
          setUser(userData);
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
        } catch {
          // Token is invalid or expired — clean up
          localStorage.removeItem(TOKEN_STORAGE_KEY);
          localStorage.removeItem(USER_STORAGE_KEY);
        }
      }
      setIsLoading(false);
    };

    restoreSession();
  }, []);

  // Login function — calls backend API
  const login = async (email: string, password: string, role: UserRole): Promise<{ requires2FA: boolean; email?: string } | void> => {
    setIsLoading(true);

    try {
      const response = await loginUser(email, password, role);
      
      // Handle 2FA requirement
      if (response.data.requires2FA) {
        setIsLoading(false);
        return { requires2FA: true, email: response.data.email };
      }

      const { token, user: userData } = response.data;

      localStorage.setItem(TOKEN_STORAGE_KEY, token);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
      setUser(userData);
      toast.success('Successfully logged in!');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Verify 2FA function
  const verify2FACode = async (email: string, code: string): Promise<void> => {
    setIsLoading(true);

    try {
      const { verify2FA } = await import('../services/api');
      const response = await verify2FA(email, code);
      const { token, user: userData } = response.data;

      localStorage.setItem(TOKEN_STORAGE_KEY, token);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
      setUser(userData);
      toast.success('Successfully logged in!');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Invalid verification code';
      toast.error(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Register function — calls backend API
  const register = async (name: string, email: string, password: string, role: UserRole): Promise<void> => {
    setIsLoading(true);

    try {
      const response = await registerUser(name, email, password, role);
      const { token, user: userData } = response.data;

      localStorage.setItem(TOKEN_STORAGE_KEY, token);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
      setUser(userData);
      toast.success('Account created successfully!');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Forgot password — calls backend API
  const forgotPassword = async (email: string): Promise<void> => {
    try {
      await forgotPasswordApi(email);
      toast.success('Password reset instructions sent to your email');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to send reset email';
      toast.error(message);
      throw new Error(message);
    }
  };

  // Reset password — calls backend API
  const resetPassword = async (token: string, newPassword: string): Promise<void> => {
    try {
      await resetPasswordApi(token, newPassword);
      toast.success('Password reset successfully');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to reset password';
      toast.error(message);
      throw new Error(message);
    }
  };

  // Logout function
  const logout = (): void => {
    setUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    toast.success('Logged out successfully');
  };

  // Update user profile — calls backend API
  const updateProfile = async (userId: string, updates: Partial<User>): Promise<void> => {
    try {
      const response = await updateUser(userId, updates);
      const updatedUser = response.data;

      // Update current user if it's the same user
      if (user && (user.id === userId || (user as any)._id === userId)) {
        setUser(updatedUser);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
      }

      toast.success('Profile updated successfully');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update profile';
      toast.error(message);
      throw new Error(message);
    }
  };

  // Change password — calls backend API
  const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    try {
      await changePasswordApi(currentPassword, newPassword);
      toast.success('Password updated successfully');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update password';
      toast.error(message);
      throw new Error(message);
    }
  };

  const value = {
    user,
    login,
    verify2FACode,
    register,
    logout,
    forgotPassword,
    resetPassword,
    changePassword,
    updateProfile,
    isAuthenticated: !!user,
    isLoading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook for using auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};