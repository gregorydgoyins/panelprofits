import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, Mail, Lock, UserPlus } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';

export default function LoginForm() {
  const { login, register, isLoading } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { email, password, name } = formData;
    
    if (isRegistering) {
      await register(email, password, name);
    } else {
      await login(email, password);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto bg-white rounded-xl shadow-xl p-8"
    >
      <div className="flex items-center justify-center mb-8">
        <div className="p-3 bg-indigo-100 rounded-full">
          {isRegistering ? (
            <UserPlus className="w-6 h-6 text-indigo-600" />
          ) : (
            <LogIn className="w-6 h-6 text-indigo-600" />
          )}
        </div>
      </div>

      <h2 className="text-2xl font-bold text-center mb-8">
        {isRegistering ? 'Create Account' : 'Welcome Back'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {isRegistering && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name
            </label>
            <div className="relative">
              <UserPlus className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="pl-10 w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter your name"
                required={isRegistering}
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <div className="relative">
            <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="pl-10 w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter your email"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <div className="relative">
            <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="pl-10 w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter your password"
              required
            />
          </div>
        </div>

        <Button
          type="submit"
          isLoading={isLoading}
          className="w-full"
          icon={isRegistering ? <UserPlus className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
        >
          {isRegistering ? 'Create Account' : 'Sign In'}
        </Button>

        <div className="text-center text-sm text-gray-600">
          {isRegistering ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            type="button"
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-indigo-600 hover:text-indigo-700"
          >
            {isRegistering ? 'Sign in' : 'Sign up'}
          </button>
        </div>
      </form>
    </motion.div>
  );
}