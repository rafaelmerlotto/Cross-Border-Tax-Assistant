import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { AlertCircle, Briefcase, Globe, Home, DollarSign, Building, } from 'lucide-react';
import { createConsultation } from '../services/api';
import type { ConsultationAnswers, CountryCode } from '../types/answers';
import { useNavigate } from 'react-router';
import Loading from './Loading';



export default function ConsultationForm() {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ConsultationAnswers>({
    defaultValues: {
      taxYear: new Date().getFullYear(),
      answers: {
        residence_country: "SI",
        tax_residence_country: "SI",
        employer_country: "SI",
        employment_type: "EMPLOYEE",
        work_locations: ["SI"],
        remote_work: false,
        other_income: false,
        other_employer: false,
        property_abroad: false,
      }
    }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const navigate = useNavigate()
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [acceptedPolicy, setAcceptedPolicy] = useState(false);


  const onSubmit = async (data: ConsultationAnswers) => {
    if (!acceptedPolicy) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await createConsultation(data);

      const id = response.consultation.id;
      setSubmitted(true);

      setTimeout(() => {
        navigate(`/result/${id}`);
      }, 3000);

    } catch (error: any) {
      console.error('Error submitting form:', error);
      setSubmitError(error?.message || 'Failed to create consultation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Loading />
    );
  }

  const countries: { code: CountryCode; name: string, disabled: boolean }[] = [
    { code: 'SI', name: 'Slovenia', disabled: false },
    { code: 'IT', name: 'Italy', disabled: false },
    { code: 'AT', name: 'Austria', disabled: true },
    { code: 'HR', name: 'Croatia', disabled: true },
    { code: 'OTHER', name: 'Other', disabled: true },
  ];

  const inputBase =
    "w-full px-4 py-3 bg-white border-2 border-black font-medium text-neutral-900 outline-none transition-colors focus:bg-yellow-50";

  const labelBase =
    "block font-sans text-xs uppercase tracking-widest text-neutral-500 mb-2";

  const sectionTitle =
    "text-xl font-black tracking-tight uppercase mb-6 flex items-center gap-3 pb-3 border-b-2 border-black";

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-10">
          <span className="font-sans text-xs uppercase tracking-widest text-neutral-500 block mb-3">
            [ Consultation / Form ]
          </span>
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-3">
            Start Your Free Analysis
          </h2>
          <p className="text-neutral-600 max-w-2xl">
            Answer a few questions to get your personalized tax consultation.
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white border-2 border-black p-8 md:p-10 space-y-10"
        >

          {/* Tax Year */}
          <section>
            <h2 className={sectionTitle}>
              <DollarSign className="w-5 h-5" />
              Tax Year
            </h2>
            <div>
              <label className={labelBase}>
                Tax Year *
              </label>
              <select
                {...register('taxYear', {
                  required: 'Tax year is required',
                  valueAsNumber: true
                })}
                className={`${inputBase} ${errors.taxYear ? 'border-red-600' : ''}`}
              >
                <option value="">Select tax year</option>
                {[2025, 2024, 2023].map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              {errors.taxYear && (
                <p className="mt-2 font-sans text-xs uppercase tracking-widest text-red-600 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {errors.taxYear.message}
                </p>
              )}
            </div>
          </section>

          {/* Residence Information */}
          <section>
            <h2 className={sectionTitle}>
              <Home className="w-5 h-5" />
              Residence Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelBase}>
                  Country of Residence *
                </label>
                <select
                  {...register('answers.residence_country', { required: 'Country of residence is required' })}
                  className={`${inputBase} ${errors.answers?.residence_country ? 'border-red-600' : ''}`}
                >
                  {countries.map(c => (
                    <option key={c.code} value={c.code} disabled={c.disabled}>{c.name}</option>
                  ))}
                </select>
                {errors.answers?.residence_country && (
                  <p className="mt-2 font-sans text-xs uppercase tracking-widest text-red-600 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {errors.answers.residence_country.message}
                  </p>
                )}
              </div>

              <div>
                <label className={labelBase}>
                  Tax Residence Country *
                </label>
                <select
                  {...register('answers.tax_residence_country', { required: 'Tax residence is required' })}
                  className={`${inputBase} ${errors.answers?.tax_residence_country ? 'border-red-600' : ''}`}
                >
                  {countries.map(c => (
                    <option key={c.code} value={c.code} disabled={c.disabled}>{c.name}</option>
                  ))}
                </select>
                {errors.answers?.tax_residence_country && (
                  <p className="mt-2 font-sans text-xs uppercase tracking-widest text-red-600 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {errors.answers.tax_residence_country.message}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Employment Information */}
          <section>
            <h2 className={sectionTitle}>
              <Briefcase className="w-5 h-5" />
              Employment Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelBase}>
                  Employer Country *
                </label>
                <select
                  {...register('answers.employer_country', { required: 'Employer country is required' })}
                  className={`${inputBase} ${errors.answers?.employer_country ? 'border-red-600' : ''}`}
                >
                  {countries.map(c => (
                    <option key={c.code} value={c.code} disabled={c.disabled}>{c.name}</option>
                  ))}
                </select>
                {errors.answers?.employer_country && (
                  <p className="mt-2 font-sans text-xs uppercase tracking-widest text-red-600 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {errors.answers.employer_country.message}
                  </p>
                )}
              </div>

              <div>
                <label className={labelBase}>
                  Employment Type *
                </label>
                <select
                  {...register('answers.employment_type')}
                  className={inputBase}
                >
                  <option value="EMPLOYEE">Employee</option>
                </select>
              </div>
            </div>
          </section>

          {/* Work Locations */}
          <section>
            <h2 className={sectionTitle}>
              <Globe className="w-5 h-5" />
              Work Locations
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {countries.map(c => (
                <label
                  key={c.code}
                  className={`flex items-center gap-3 px-4 py-3 border-2 border-black bg-white ${c.disabled && "opacity-30"} cursor-pointer hover:bg-yellow-300 transition-colors`}
                >
                  <input
                    disabled={c.disabled}
                    type="checkbox"
                    value={c.code}
                    {...register('answers.work_locations')}
                    className="w-4 h-4 accent-black"
                  />
                  <span className="text-sm font-semibold uppercase tracking-wide">{c.name}</span>
                </label>
              ))}
            </div>
          </section>

          {/* Other Information */}
          <section>
            <h2 className={sectionTitle}>
              <Building className="w-5 h-5" />
              Other Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex items-center gap-3 px-4 py-3 border-2 border-black bg-white cursor-pointer hover:bg-yellow-300 transition-colors">
                <input
                  type="checkbox"
                  {...register('answers.remote_work')}
                  className="w-4 h-4 accent-black"
                />
                <span className="text-sm font-semibold uppercase tracking-wide">Remote work</span>
              </label>

              <label className="flex items-center gap-3 px-4 py-3 border-2 border-black bg-white cursor-pointer hover:bg-yellow-300 transition-colors">
                <input
                  type="checkbox"
                  {...register('answers.other_income')}
                  className="w-4 h-4 accent-black"
                />
                <span className="text-sm font-semibold uppercase tracking-wide">Other income</span>
              </label>

              <label className="flex items-center gap-3 px-4 py-3 border-2 border-black bg-white cursor-pointer hover:bg-yellow-300 transition-colors">
                <input
                  type="checkbox"
                  {...register('answers.other_employer')}
                  className="w-4 h-4 accent-black"
                />
                <span className="text-sm font-semibold uppercase tracking-wide">Other employer</span>
              </label>

              <label className="flex items-center gap-3 px-4 py-3 border-2 border-black bg-white cursor-pointer hover:bg-yellow-300 transition-colors">
                <input
                  type="checkbox"
                  {...register('answers.property_abroad')}
                  className="w-4 h-4 accent-black"
                />
                <span className="text-sm font-semibold uppercase tracking-wide">Property abroad</span>
              </label>
            </div>
          </section>

          {submitError && (
            <div className="mt-4 p-4 bg-red-600 text-white border-2 border-black">
              <div className="font-sans text-[10px] uppercase tracking-widest mb-1">
                [ Error ]
              </div>
              <p className="text-sm font-bold">{submitError}</p>
            </div>
          )}

          <div className="pt-4 border-t-2 border-dashed border-neutral-300">
            <label className="flex items-start gap-3 cursor-pointer mb-4">
              <input
                type="checkbox"
                checked={acceptedPolicy}
                onChange={(e) => setAcceptedPolicy(e.target.checked)}
                className="mt-1 w-4 h-4 accent-black cursor-pointer shrink-0"
              />
              <span className="text-xs text-neutral-600 leading-relaxed">
                I have read and agree to the{" "}
                <a
                  href="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-black underline hover:text-yellow-600"
                >
                  Privacy Policy
                </a>
                . I understand this is an autonomous consultation tool and not tax advice.
              </span>
            </label>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting || !acceptedPolicy}
                className="group px-8 py-4 bg-black text-yellow-300 font-black uppercase tracking-wider text-lg flex items-center gap-3 border-2 border-black hover:bg-yellow-300 hover:text-black transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-yellow-300 border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Consultation
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}