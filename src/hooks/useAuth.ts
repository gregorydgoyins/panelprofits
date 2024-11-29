import { useCallback } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { showToast } from '../components/common/Toast';

export function useAuth() {
  const { user, login, logout, register, isLoading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleLogin = useCallback(async (email: string, password: string) => {
    try {
      await login(email, password);
      showToast.success('Successfully logged in!');
      navigate('/dashboard');
    } catch (err) {
      showToast.error(err instanceof Error ? err.message : 'Login failed');
    }
  }, [login, navigate]);

  const handleLogout = useCallback(() => {
    logout();
    showToast.info('Successfully logged out');
    navigate('/');
  }, [logout, navigate]);

  const handleRegister = useCallback(async (email: string, password: string, name: string) => {
    try {
      await register(email, password, name);
      showToast.success('Registration successful!');
      navigate('/dashboard');
    } catch (err) {
      showToast.error(err instanceof Error ? err.message : 'Registration failed');
    }
  }, [register, navigate]);

  return {
    user,
    isLoading,
    error,
    login: handleLogin,
    logout: handleLogout,
    register: handleRegister,
    isAuthenticated: !!user
  };
}