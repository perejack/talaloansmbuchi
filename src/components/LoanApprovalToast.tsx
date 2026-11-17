import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';

const names = [
  'John Kamau',
  'Alice Wanjiru',
  'Peter Ochieng',
  'Mary Akinyi',
  'James Mwangi',
  'Sarah Adhiambo',
  'David Kiprop',
  'Grace Njeri',
  'Michael Omondi',
  'Elizabeth Wambui'
];

const maskPhoneNumber = (phone: string) => {
  return phone.slice(0, 4) + '***' + phone.slice(7);
};

const generateRandomAmount = () => {
  const amounts = [5000, 7000, 10000, 14000, 16000, 19000, 22000, 25000];
  return amounts[Math.floor(Math.random() * amounts.length)];
};

const generateRandomPhoneNumber = () => {
  const prefix = '07';
  const remainingDigits = Math.floor(Math.random() * 90000000 + 10000000);
  return prefix + remainingDigits.toString();
};

const LoanApprovalToast: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentApproval, setCurrentApproval] = useState({
    name: names[0],
    phone: generateRandomPhoneNumber(),
    amount: generateRandomAmount()
  });

  useEffect(() => {
    const showNewApproval = () => {
      const randomName = names[Math.floor(Math.random() * names.length)];
      const randomPhone = generateRandomPhoneNumber();
      const randomAmount = generateRandomAmount();

      setCurrentApproval({
        name: randomName,
        phone: randomPhone,
        amount: randomAmount
      });
      setIsVisible(true);

      setTimeout(() => {
        setIsVisible(false);
      }, 5000);
    };

    showNewApproval();
    const interval = setInterval(showNewApproval, 6000);

    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 100, y: 0 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: 100, y: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
          className="fixed bottom-6 right-6 bg-white rounded-xl shadow-2xl p-4 max-w-sm w-full z-50 border border-green-100"
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="w-7 h-7 text-green-600" />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-base font-semibold text-gray-900">
                {currentApproval.name} ({maskPhoneNumber(currentApproval.phone)})
              </p>
              <p className="mt-1 text-sm text-gray-600">
                Just received <span className="font-medium text-green-600">KES {currentApproval.amount.toLocaleString()}</span>
              </p>
            </div>
          </div>
          
          {/* Progress bar */}
          <motion.div
            initial={{ width: '100%' }}
            animate={{ width: '0%' }}
            transition={{ duration: 5, ease: 'linear' }}
            className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-green-600 rounded-b-xl"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoanApprovalToast;
