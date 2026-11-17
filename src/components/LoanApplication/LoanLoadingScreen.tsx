import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const loadingMessages = [
  'Contacting servers...',
  'Checking loan limits...',
  'Submitting...'
];

const TOTAL_DURATION = 15000; // 15 seconds
const STEP_DURATION = TOTAL_DURATION / loadingMessages.length;

const LoanLoadingScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (step < loadingMessages.length) {
      const timeout = setTimeout(() => setStep(step + 1), STEP_DURATION);
      return () => clearTimeout(timeout);
    } else {
      const doneTimeout = setTimeout(onComplete, 600); // slight delay for polish
      return () => clearTimeout(doneTimeout);
    }
  }, [step, onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-[#e0f7fa] to-[#f3e8ff]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="bg-white/80 p-8 rounded-2xl shadow-2xl flex flex-col items-center"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="mb-6"
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        >
          <span className="block w-14 h-14 border-8 border-t-[#1a8d46] border-[#cfd8dc] rounded-full animate-spin"></span>
        </motion.div>
        <motion.div
          className="text-2xl font-semibold text-[#1a8d46] mb-2"
          key={step}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {loadingMessages[step]}
        </motion.div>
        <div className="mt-3 text-gray-500 text-base animate-pulse">Please wait while we process your request...</div>
      </motion.div>
    </motion.div>
  );
};

export default LoanLoadingScreen;
