import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Shield, Clock, AlertCircle, Smartphone, Loader2 } from 'lucide-react';

const schema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Invalid phone number'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  education: z.string().min(1, 'Education level is required'),
  employment: z.string().min(1, 'Employment status is required'),
  monthlyIncome: z.string().min(1, 'Monthly income is required'),
});

type FormData = z.infer<typeof schema>;

interface PersonalDetailsProps {
  onNext: (data?: FormData) => void;
}

const PersonalDetails: React.FC<PersonalDetailsProps> = ({ onNext }) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
  });

  const applicationTips = [
    {
      icon: <Shield className="w-5 h-5" />,
      title: "Provide accurate income details",
      description: "For better loan offers"
    },
    {
      icon: <Clock className="w-5 h-5" />,
      title: "Quick processing",
      description: "2-minute approval"
    },
    {
      icon: <Smartphone className="w-5 h-5" />,
      title: "M-PESA Ready",
      description: "Instant disbursement"
    },
    {
      icon: <AlertCircle className="w-5 h-5" />,
      title: "Need help?",
      description: "24/7 support available"
    }
  ];

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log('Form data:', data);
      onNext(data);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Application Tips */}
      <div className="card bg-gradient-to-br from-[#1CAA53]/5 to-[#1CAA53]/10 backdrop-blur-sm">
        <h3 className="text-lg font-semibold mb-4 text-[#1CAA53]">Application Tips</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {applicationTips.map((tip, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/80 rounded-xl p-4 flex items-start gap-3 shadow-sm hover:shadow-md transition-all duration-300 hover:bg-gradient-to-br hover:from-[#1CAA53]/10 hover:to-[#1CAA53]/5 group"
            >
              <div className="mt-1 text-[#1CAA53] transition-colors duration-300">
                {tip.icon}
              </div>
              <div>
                <h4 className="font-medium text-gray-900 group-hover:text-[#1CAA53] transition-colors duration-300">
                  {tip.title}
                </h4>
                <p className="text-sm text-gray-600">
                  {tip.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Application Form */}
      <div className="card">
        <h2 className="text-2xl font-semibold mb-6">Complete Your Application</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="form-group">
              <label className="form-label">First Name</label>
              <input
                {...register('firstName')}
                className={`input-field ${errors.firstName ? 'border-red-300' : ''}`}
                placeholder="John"
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input
                {...register('lastName')}
                className={`input-field ${errors.lastName ? 'border-red-300' : ''}`}
                placeholder="Doe"
              />
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              {...register('email')}
              type="email"
              className={`input-field ${errors.email ? 'border-red-300' : ''}`}
              placeholder="john@example.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              {...register('phone')}
              type="tel"
              className={`input-field ${errors.phone ? 'border-red-300' : ''}`}
              placeholder="07XX XXX XXX"
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Date of Birth</label>
            <input
              {...register('dateOfBirth')}
              type="date"
              className={`input-field ${errors.dateOfBirth ? 'border-red-300' : ''}`}
            />
            {errors.dateOfBirth && (
              <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth.message}</p>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Level of Education</label>
            <select 
              {...register('education')}
              className={`input-field ${errors.education ? 'border-red-300' : ''}`}
            >
              <option value="">Select education level</option>
              <option value="primary">Primary</option>
              <option value="secondary">Secondary</option>
              <option value="diploma">Diploma</option>
              <option value="degree">Bachelor's Degree</option>
              <option value="masters">Master's Degree</option>
            </select>
            {errors.education && (
              <p className="mt-1 text-sm text-red-600">{errors.education.message}</p>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Employment Status</label>
            <select 
              {...register('employment')}
              className={`input-field ${errors.employment ? 'border-red-300' : ''}`}
            >
              <option value="">Select status</option>
              <option value="employed">Employed</option>
              <option value="self-employed">Self Employed</option>
              <option value="business">Business Owner</option>
              <option value="student">Student</option>
            </select>
            {errors.employment && (
              <p className="mt-1 text-sm text-red-600">{errors.employment.message}</p>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Monthly Income (KES)</label>
            <select 
              {...register('monthlyIncome')}
              className={`input-field ${errors.monthlyIncome ? 'border-red-300' : ''}`}
            >
              <option value="">Select income range</option>
              <option value="0-30000">0 - 30,000</option>
              <option value="30001-50000">30,001 - 50,000</option>
              <option value="50001-100000">50,001 - 100,000</option>
              <option value="100001+">Above 100,000</option>
            </select>
            {errors.monthlyIncome && (
              <p className="mt-1 text-sm text-red-600">{errors.monthlyIncome.message}</p>
            )}
          </div>

          <motion.button
            type="submit"
            disabled={isLoading}
            className={`btn btn-primary w-full flex items-center justify-center gap-2 ${
              isLoading ? 'opacity-80 cursor-not-allowed' : ''
            }`}
            whileHover={{ scale: isLoading ? 1 : 1.02 }}
            whileTap={{ scale: isLoading ? 1 : 0.98 }}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              'Continue'
            )}
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
};

export default PersonalDetails;