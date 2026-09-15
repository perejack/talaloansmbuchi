import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, CheckCircle, AlertCircle, RefreshCw, ArrowLeft, ShieldCheck, Clock, Info, Check } from 'lucide-react';
import { PayHeroService } from '../../lib/payhero';

interface MpesaPaymentProps {
  onNext: () => void;
  onBack: () => void;
  amount: number;
  loanAmount: number;
  initialPhone?: string;
  applicantName?: string;
}

type PaymentState = 'input' | 'initiating' | 'pending' | 'success' | 'failed';

const MpesaPayment: React.FC<MpesaPaymentProps> = ({
  onNext,
  onBack,
  amount: _originalAmount,
  loanAmount,
  initialPhone = '',
  applicantName = '',
}) => {
  // Target loan amount (defaults to 3000 as requested)
  const displayLoanAmount = loanAmount > 0 ? loanAmount : 3000;
  
  // STK Push amount set to KES 10 for testing as requested
  const stkAmount = 10;

  const [phoneNumber, setPhoneNumber] = useState(initialPhone);
  const [paymentState, setPaymentState] = useState<PaymentState>('input');
  const [checkoutId, setCheckoutId] = useState<string | null>(null);
  const [receiptNumber, setReceiptNumber] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (initialPhone && !phoneNumber) {
      setPhoneNumber(initialPhone);
    }
  }, [initialPhone]);

  // Clean up polling & timer on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(e.target.value);
    if (errorMessage) setErrorMessage('');
  };

  const startPolling = (id: string) => {
    setSecondsElapsed(0);

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);

    let pollCount = 0;
    const maxPolls = 15; // 15 * 4s = 60s

    if (pollingRef.current) clearInterval(pollingRef.current);

    const check = async () => {
      pollCount++;
      try {
        const result = await PayHeroService.checkPaymentStatus(id);

        if (result.status === 'paid') {
          if (pollingRef.current) clearInterval(pollingRef.current);
          if (timerRef.current) clearInterval(timerRef.current);
          setPaymentState('success');
          setReceiptNumber(result.receiptNumber || 'CONFIRMED');
          setStatusMessage('Payment verified successfully!');
          return;
        }

        if (result.status === 'failed') {
          if (pollingRef.current) clearInterval(pollingRef.current);
          if (timerRef.current) clearInterval(timerRef.current);
          setPaymentState('failed');
          setErrorMessage(result.resultDesc || 'Payment was cancelled or failed.');
          return;
        }

        if (pollCount >= maxPolls) {
          if (pollingRef.current) clearInterval(pollingRef.current);
          if (timerRef.current) clearInterval(timerRef.current);
          setStatusMessage('Payment is taking longer than usual.');
        }
      } catch (err) {
        console.error('Error during payment polling:', err);
      }
    };

    pollingRef.current = setInterval(check, 4000);
    setTimeout(check, 3000);
  };

  const handleInitiateSTK = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const cleanPhone = phoneNumber.trim();
    if (!PayHeroService.isValidKenyanPhone(cleanPhone)) {
      setErrorMessage('Please enter a valid Kenyan phone number (e.g. 0712345678 or 0112345678)');
      return;
    }

    setErrorMessage('');
    setPaymentState('initiating');
    setStatusMessage('Initiating STK Push for your Savings Fee...');

    // Initiate STK Push with test amount of KES 10
    const res = await PayHeroService.initiateSTKPush(
      cleanPhone,
      stkAmount,
      `AFRI-${Date.now()}`,
      applicantName,
      `Savings Fee for KES ${displayLoanAmount} Loan`
    );

    if (!res.success || !res.checkoutId) {
      setPaymentState('failed');
      setErrorMessage(res.error || 'Failed to send STK push. Please try again.');
      return;
    }

    setCheckoutId(res.checkoutId);
    setPaymentState('pending');
    setStatusMessage(`STK prompt for KES ${stkAmount} sent to ${cleanPhone}. Enter your M-PESA PIN to complete your savings fee.`);
    startPolling(res.checkoutId);
  };

  const handleManualCheck = async () => {
    if (!checkoutId) return;
    setStatusMessage('Re-checking transaction status...');
    try {
      const result = await PayHeroService.checkPaymentStatus(checkoutId);
      if (result.status === 'paid') {
        if (pollingRef.current) clearInterval(pollingRef.current);
        if (timerRef.current) clearInterval(timerRef.current);
        setPaymentState('success');
        setReceiptNumber(result.receiptNumber || 'CONFIRMED');
      } else if (result.status === 'failed') {
        setPaymentState('failed');
        setErrorMessage(result.resultDesc || 'Payment failed or was cancelled.');
      } else {
        setStatusMessage('Payment has not been completed yet. Please enter your PIN on your handset.');
      }
    } catch {
      setStatusMessage('Unable to check status. Please try again.');
    }
  };

  const handleRetry = () => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    setPaymentState('input');
    setErrorMessage('');
    setStatusMessage('');
    setCheckoutId(null);
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-green-100">
      <div className="text-center mb-5">
        <div className="w-14 h-14 bg-[#1a8d46]/10 text-[#1a8d46] rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
          <Smartphone className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Savings Fee Deposit</h2>
        <p className="text-sm text-gray-600 mt-1">
          Required for approval and instant disbursement of your loan.
        </p>
      </div>

      {/* Clear upfront messaging before prompting */}
      <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-4 mb-5 text-left shadow-sm">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-[#1a8d46] flex-shrink-0 mt-0.5" />
          <div className="text-xs text-gray-700 space-y-1.5">
            <p className="font-semibold text-sm text-gray-900">
              Savings Fee for KES {displayLoanAmount.toLocaleString()} Loan
            </p>
            <p className="leading-relaxed text-gray-600">
              The upcoming M-PESA STK prompt on your phone is your <strong>mandatory Savings Security Fee</strong>. 
              Once deposited, your <strong>KES {displayLoanAmount.toLocaleString()}</strong> loan is approved and immediately released to your M-PESA.
            </p>
            <div className="pt-1 flex items-center gap-1.5 text-[#1a8d46] font-medium">
              <span className="w-2 h-2 rounded-full bg-[#1a8d46] animate-pulse"></span>
              <span>Test Mode: STK prompt set to <strong>KES {stkAmount}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Loan & Savings Fee Cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100 text-center">
          <div className="text-xs text-gray-500 mb-1">Approved Loan</div>
          <div className="text-lg font-bold text-gray-900">
            KES {displayLoanAmount.toLocaleString()}
          </div>
          <div className="text-[10px] text-gray-400 mt-0.5">Disbursement Amount</div>
        </div>
        <div className="bg-[#1a8d46]/10 p-3.5 rounded-xl border border-[#1a8d46]/20 text-center">
          <div className="text-xs text-[#1a8d46] font-medium mb-1">Savings STK Fee</div>
          <div className="text-2xl font-bold text-[#1a8d46]">
            KES {stkAmount}
          </div>
          <div className="text-[10px] text-[#1a8d46] font-medium mt-0.5">Test STK Prompt</div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* INPUT FORM STATE */}
        {paymentState === 'input' && (
          <motion.form
            key="input-form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onSubmit={handleInitiateSTK}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                M-PESA Phone Number
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  placeholder="e.g. 0712345678"
                  className={`w-full px-4 py-3 pl-11 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a8d46] text-gray-900 font-medium ${
                    errorMessage ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                <Smartphone className="w-5 h-5 text-gray-400 absolute left-3.5 top-3.5" />
              </div>
              {errorMessage ? (
                <p className="mt-2 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {errorMessage}
                </p>
              ) : (
                <p className="mt-1.5 text-xs text-gray-500">
                  Keep your phone unlocked. You will see a prompt to enter your PIN.
                </p>
              )}
            </div>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full bg-[#1a8d46] hover:bg-[#15773a] text-white py-3.5 px-4 rounded-xl font-semibold shadow-lg shadow-green-600/20 transition-all flex items-center justify-center gap-2"
            >
              <span>Pay KES {stkAmount} Savings Fee via STK</span>
            </motion.button>

            <button
              type="button"
              onClick={onBack}
              className="w-full text-sm text-gray-500 hover:text-gray-700 flex items-center justify-center gap-1.5 pt-1"
            >
              <ArrowLeft className="w-4 h-4" /> Go Back
            </button>
          </motion.form>
        )}

        {/* INITIATING STATE */}
        {paymentState === 'initiating' && (
          <motion.div
            key="initiating"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-10 text-center space-y-4"
          >
            <div className="w-16 h-16 border-4 border-[#1a8d46]/20 border-t-[#1a8d46] rounded-full animate-spin mx-auto" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Sending STK Push...</h3>
              <p className="text-sm text-gray-500 mt-1">
                Prompting for KES {stkAmount} savings fee on {phoneNumber}
              </p>
            </div>
          </motion.div>
        )}

        {/* PENDING / WAITING FOR PIN ENTRY */}
        {paymentState === 'pending' && (
          <motion.div
            key="pending"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="py-6 space-y-5 text-center"
          >
            {/* Animated Pulsing Phone */}
            <div className="relative w-20 h-20 mx-auto">
              <div className="absolute inset-0 rounded-full bg-[#1a8d46]/20 animate-ping opacity-75" />
              <div className="relative w-20 h-20 bg-[#1a8d46] text-white rounded-full flex items-center justify-center shadow-xl shadow-green-600/30">
                <Smartphone className="w-10 h-10 animate-bounce" />
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900">Enter M-PESA PIN on Phone</h3>
              <p className="text-sm text-gray-600 mt-2 max-w-xs mx-auto">
                An STK prompt for <strong className="text-gray-900">KES {stkAmount}</strong> (Savings Fee for your <strong className="text-gray-900">KES {displayLoanAmount.toLocaleString()}</strong> loan) has been sent to{' '}
                <span className="font-semibold text-[#1a8d46]">{phoneNumber}</span>.
              </p>
            </div>

            {/* Waiting timer indicator */}
            <div className="inline-flex items-center gap-2 bg-gray-100 px-3.5 py-1.5 rounded-full text-xs font-medium text-gray-600">
              <Clock className="w-3.5 h-3.5 animate-spin" />
              <span>Waiting for PIN ({secondsElapsed}s)</span>
            </div>

            {statusMessage && (
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-700">
                {statusMessage}
              </div>
            )}

            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={handleManualCheck}
                className="w-full bg-[#1a8d46] hover:bg-[#15773a] text-white py-3 px-4 rounded-xl font-medium text-sm flex items-center justify-center gap-2 shadow-md transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                I've Entered PIN - Confirm Status
              </button>

              <button
                type="button"
                onClick={handleRetry}
                className="w-full text-xs text-gray-500 hover:text-gray-700 py-1"
              >
                Didn't receive prompt? Resend or change number
              </button>
            </div>
          </motion.div>
        )}

        {/* SUCCESS STATE */}
        {paymentState === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-6 text-center space-y-5"
          >
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle className="w-10 h-10" />
            </div>

            <div>
              <h3 className="text-2xl font-bold text-gray-900">Savings Fee Paid!</h3>
              <p className="text-sm text-gray-600 mt-1">
                Your deposit of KES {stkAmount} has been confirmed. Your KES {displayLoanAmount.toLocaleString()} loan is being released.
              </p>
            </div>

            {receiptNumber && (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs">
                <span className="text-gray-500">M-PESA Receipt / Ref: </span>
                <span className="font-mono font-bold text-gray-900">{receiptNumber}</span>
              </div>
            )}

            <motion.button
              type="button"
              onClick={onNext}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-[#1a8d46] hover:bg-[#15773a] text-white py-3.5 px-4 rounded-xl font-semibold shadow-lg shadow-green-600/20"
            >
              Continue to Loan Disbursement
            </motion.button>
          </motion.div>
        )}

        {/* FAILED STATE */}
        {paymentState === 'failed' && (
          <motion.div
            key="failed"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-6 text-center space-y-5"
          >
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <AlertCircle className="w-10 h-10" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900">Payment Incomplete</h3>
              <p className="text-sm text-red-600 mt-1 max-w-xs mx-auto">
                {errorMessage || 'The payment request failed or was cancelled on your phone.'}
              </p>
            </div>

            <div className="space-y-2.5">
              <motion.button
                type="button"
                onClick={handleRetry}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full bg-[#1a8d46] hover:bg-[#15773a] text-white py-3.5 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg shadow-green-600/20"
              >
                <RefreshCw className="w-4 h-4" />
                Retry STK Push
              </motion.button>

              <button
                type="button"
                onClick={onBack}
                className="w-full text-sm text-gray-500 hover:text-gray-700 py-2"
              >
                Go Back
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MpesaPayment;
