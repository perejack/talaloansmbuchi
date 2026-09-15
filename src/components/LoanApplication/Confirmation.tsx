import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

const Confirmation = () => {
  useEffect(() => {
    // Simulate confetti effect
    const confetti = () => {
      // Implementation would go here if we had a confetti library
      console.log('Confetti!');
    };
    confetti();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto p-6"
    >
      {/* Approval/Disbursement Notice */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6 p-4 rounded-xl bg-gradient-to-r from-yellow-100 via-yellow-50 to-green-50 border border-yellow-300 text-yellow-800 text-center font-semibold shadow-sm"
      >
        <span className="inline-block align-middle mr-2">⏳</span>
        Wait for approval and disbursement. <span className="font-bold">Maximum 24hrs</span>.
      </motion.div>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 20,
          delay: 0.2
        }}
        className="w-20 h-20 bg-[#1a8d46]/10 rounded-full flex items-center justify-center mx-auto mb-6"
      >
        <CheckCircle className="w-12 h-12 text-[#1a8d46]" />
      </motion.div>

      <h2 className="text-2xl font-bold text-center mb-2">Application Submitted!</h2>
      <p className="text-gray-600 text-center mb-8">
        Your loan application has been successfully submitted. We'll process your loan within the next few minutes.
      </p>

      <div className="bg-[#1a8d46]/5 rounded-xl p-6 mb-8">
        <h3 className="font-semibold mb-4">Next Steps</h3>
        <ol className="space-y-4">
          <motion.li
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-start gap-3"
          >
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#1a8d46] text-white flex items-center justify-center text-sm">
              1
            </div>
            <div>
              <p className="font-medium">Wait for SMS Confirmation</p>
              <p className="text-sm text-gray-600">You'll receive an SMS with your loan details</p>
            </div>
          </motion.li>
          <motion.li
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="flex items-start gap-3"
          >
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#1a8d46] text-white flex items-center justify-center text-sm">
              2
            </div>
            <div>
              <p className="font-medium">Check Your M-PESA</p>
              <p className="text-sm text-gray-600">Funds will be sent to your M-PESA account</p>
            </div>
          </motion.li>
          <motion.li
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="flex items-start gap-3"
          >
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#1a8d46] text-white flex items-center justify-center text-sm">
              3
            </div>
            <div>
              <p className="font-medium">Repayment Schedule</p>
              <p className="text-sm text-gray-600">We'll send you repayment reminders via SMS</p>
            </div>
          </motion.li>
        </ol>
      </div>
    </motion.div>
  );
};

export default Confirmation;