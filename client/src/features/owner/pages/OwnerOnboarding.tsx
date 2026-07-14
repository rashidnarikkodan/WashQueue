import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import OnboardingSidebar from "../components/onboarding/OnboardingSidebar";
import OnboardingForm from "../components/onboarding/OnboardingForm";
import { useOwnerStore } from "../store/ownerStore";
import Loading from "../../../shared/components/ui/Loading";

export default function OwnerOnboarding() {
  const navigate = useNavigate();
  const {
    isLoading,
    isFetchingStatus,
    onboardingStep,
    onboardingDetails,
    isSubmitted,
    fetchOnboardingStatus,
    saveStepAndContinue,
    submitOnboarding,
  } = useOwnerStore();

  // On mount: load server-side draft to resume where user left off
  useEffect(() => {
    fetchOnboardingStatus();
  }, []);

  // If already submitted, redirect away
  useEffect(() => {
    if (isSubmitted) {
      navigate("/owner/dashboard");
    }
  }, [isSubmitted, navigate]);

  const handleSubmit = async () => {
    const success = await submitOnboarding();
    if (success) {
      navigate("/owner/dashboard");
    }
  };

  const handleCancel = () => {
    navigate("/setup-account");
  };

  if (isFetchingStatus) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loading size="lg" />
        <p className="text-sm text-slate-400 font-medium animate-pulse">
          Loading your progress…
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1650px] mx-auto flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-16 px-4 py-8 sm:px-8">
      {/* Left Column: Sidebar Stepper */}
      <div className="hidden lg:block lg:w-[360px] lg:shrink-0">
        <OnboardingSidebar currentStep={onboardingStep} />
      </div>

      {/* Right Column: Main Form Card */}
      <div className="grow max-w-287 bg-transparent sm:bg-card border-0 sm:border border-slate-800/80 rounded-none sm:rounded-3xl p-4 sm:p-8 md:p-10 shadow-none sm:shadow-2xl relative z-10 w-full max-h-none sm:max-h-[840px] overflow-y-visible sm:overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800/60 scrollbar-track-transparent">
        <OnboardingForm
          step={onboardingStep}
          savedDetails={onboardingDetails}
          onSaveStep={saveStepAndContinue}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}