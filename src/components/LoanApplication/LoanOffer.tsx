import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface LoanOfferProps {
  onNext: (amount: number, savingsDeposit: number) => void;
  onBack: () => void;
}

const loanOptions = [
  { amount: 3000, savingsDeposit: 150 },
  { amount: 5000, savingsDeposit: 200 },
  { amount: 7000, savingsDeposit: 250 },
  { amount: 10000, savingsDeposit: 300 },
  { amount: 14000, savingsDeposit: 350 },
  { amount: 16000, savingsDeposit: 400 },
  { amount: 19000, savingsDeposit: 450 },
  { amount: 22000, savingsDeposit: 500 },
  { amount: 25000, savingsDeposit: 550 }
];

const INTEREST_RATE = 0.10; // 10% interest rate

const LoanOffer: React.FC<LoanOfferProps> = ({ onNext, onBack }) => {
  const [selectedAmount, setSelectedAmount] = useState(loanOptions[0].amount);
  const [qualifyingAmount, setQualifyingAmount] = useState(0);
  const selectedOption = loanOptions.find(option => option.amount === selectedAmount) || loanOptions[0];

  // Calculate interest and total repayment
  const interestAmount = selectedAmount * INTEREST_RATE;
  const totalRepayment = selectedAmount + interestAmount;

  // Loading animation states
  const [loadingStep, setLoadingStep] = useState(0);
  const loadingMessages = [
    'Contacting servers...',
    'Checking loan limits...',
    'Submitting...'
  ];
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (loadingStep < loadingMessages.length) {
      timeout = setTimeout(() => setLoadingStep(loadingStep + 1), 1200);
    } else if (loadingStep === loadingMessages.length) {
      // Reveal the qualifying amount after loading
      const randomIndex = Math.floor(Math.random() * loanOptions.length);
      setQualifyingAmount(loanOptions[randomIndex].amount);
    }
    return () => clearTimeout(timeout);
  }, [loadingStep]);

  const handleNext = () => {
    onNext(selectedAmount, selectedOption.savingsDeposit);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-md mx-auto p-6"
    >
      <h2 className="text-2xl font-bold mb-6">Select Loan Amount</h2>
      
      {/* Animated Loading Sequence Before Qualifying Amount */}
      {loadingStep < loadingMessages.length ? (
        <motion.div
          key={loadingStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-[#FF8800]/10 p-6 rounded-xl mb-8 flex flex-col items-center justify-center min-h-[120px]"
        >
          <motion.div
            className="text-lg font-semibold text-[#FF8800] flex items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <span className="animate-spin rounded-full border-4 border-t-[#FF8800] border-gray-300 w-6 h-6 inline-block"></span>
            {loadingMessages[loadingStep]}
          </motion.div>
        </motion.div>
      ) : (
        <motion.div
          key="qualified"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-[#FF8800]/5 p-6 rounded-xl mb-8"
        >
          <div className="flex justify-between items-center mb-4">
            <span className="text-[#FF8800] font-medium">Qualifying Amount</span>
            <motion.span 
              key={qualifyingAmount}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-bold text-[#FF8800]"
            >
              KES {qualifyingAmount.toLocaleString()}
            </motion.span>
          </div>
          <p className="text-sm text-gray-600">
            This is your qualifying loan amount based on our assessment
          </p>
        </motion.div>
      )}

      <div className="space-y-4 mb-8">
        {loanOptions.map((option) => (
          <motion.button
            key={option.amount}
            onClick={() => setSelectedAmount(option.amount)}
            className={`w-full p-4 rounded-xl flex justify-between items-center border-2 transition-colors ${
              selectedAmount === option.amount 
                ? 'border-[#FF8800] bg-[#FF8800]/5' 
                : 'border-gray-200 hover:border-[#FF8800]/50'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div>
              <div className="font-medium">KES {option.amount.toLocaleString()}</div>
              <div className="text-sm text-gray-600">
                Savings Deposit: KES {option.savingsDeposit.toLocaleString()}
              </div>
            </div>
            {selectedAmount === option.amount && (
              <div className="w-4 h-4 rounded-full bg-[#FF8800]" />
            )}
          </motion.button>
        ))}
      </div>

      <div className="bg-[#FF8800]/5 p-6 rounded-xl mb-8">
        <h3 className="font-semibold mb-4">Loan Summary</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Loan Amount</span>
            <span className="font-medium">KES {selectedAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Interest (10%)</span>
            <span className="font-medium">KES {interestAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Savings Deposit</span>
            <span className="font-medium">KES {selectedOption.savingsDeposit.toLocaleString()}</span>
          </div>
          <div className="border-t pt-3">
            <div className="flex justify-between font-semibold">
              <span>Total to Repay</span>
              <span>KES {totalRepayment.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={onBack}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <motion.button
          onClick={handleNext}
          className="flex-1 bg-[#FF8800] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#FF8800]/90 transition-colors flex items-center justify-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Continue
          <ArrowRight className="w-5 h-5" />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default LoanOffer;