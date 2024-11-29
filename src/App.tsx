import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { useAuthStore } from './store/useAuthStore';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import InteractiveDemo from './components/InteractiveDemo';
import LoginForm from './components/auth/LoginForm';
import Dashboard from './components/dashboard/Dashboard';
import CourseModule from './components/learning/CourseModule';
import ResearchHub from './components/research/ResearchHub';
import PricingTiers from './components/pricing/PricingTiers';
import CheckoutPage from './components/checkout/CheckoutPage';
import NotFound from './components/error/NotFound';
import Toast from './components/common/Toast';

function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
        <pre className="text-sm text-gray-500 bg-gray-100 p-4 rounded-lg overflow-auto">
          {error.message}
        </pre>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  return user ? <>{children}</> : <Navigate to="/login" />;
}

export default function App() {
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen bg-white">
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Header />
        <main className="pt-16">
          <Routes>
            <Route path="/login" element={
              user ? <Navigate to="/dashboard" /> : <LoginForm />
            } />
            <Route path="/dashboard/*" element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } />
            <Route path="/modules" element={
              <PrivateRoute>
                <CourseModule />
              </PrivateRoute>
            } />
            <Route path="/research" element={
              <PrivateRoute>
                <ResearchHub />
              </PrivateRoute>
            } />
            <Route path="/pricing" element={<PricingTiers />} />
            <Route path="/checkout" element={
              <PrivateRoute>
                <CheckoutPage />
              </PrivateRoute>
            } />
            <Route path="/" element={
              <>
                <Hero />
                <InteractiveDemo />
                <Features />
              </>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Toast />
      </ErrorBoundary>
    </div>
  );
}