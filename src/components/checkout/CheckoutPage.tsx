import React from 'react';
import { motion } from 'framer-motion';
import { useLocation, Navigate } from 'react-router-dom';
import { Lock, CreditCard } from 'lucide-react';

export default function CheckoutPage() {
  const location = useLocation();
  const { tier, price } = location.state || {};

  if (!tier || !price) {
    return <Navigate to="/pricing" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-xl overflow-hidden"
        >
          <div className="px-6 py-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Complete Your Subscription
            </h2>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-6">
              <div>
                <h3 className="font-semibold">{tier}</h3>
                <p className="text-gray-600">{price}/month</p>
              </div>
              <Lock className="w-5 h-5 text-green-500" />
            </div>

            {/* Payment form would go here */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Card Information
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Card number"
                    className="pl-10 w-full p-3 border rounded-lg"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    className="w-full p-3 border rounded-lg"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="CVC"
                    className="w-full p-3 border rounded-lg"
                  />
                </div>
              </div>

              <button className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                Subscribe Now
              </button>
            </div>

            <p className="mt-4 text-sm text-gray-500 text-center">
              Your subscription will begin after your free trial ends
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}