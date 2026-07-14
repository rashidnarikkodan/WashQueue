import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import OnboardingSidebar from "../components/onboarding/OnboardingSidebar";
import OnboardingForm from "../components/onboarding/OnboardingForm";
import { useAuthStore } from "../../auth/store/authStore";
import { useOwnerStore } from "../store/ownerStore";
import Loading from "../../../shared/components/ui/Loading";
import { APP_ROUTES } from "@/shared/constants/appRoutes.const";
import { VIEW_MODE } from "../../../shared/constants/role.const";
import ConfirmationModal from "../../../shared/components/ui/ConfirmationModal";

export default function OwnerOnboarding() {
  const navigate = useNavigate();
  const { setActiveViewMode } = useAuthStore();
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

  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);

  // On mount: load server-side draft to resume where user left off
  useEffect(() => {
    fetchOnboardingStatus();
  }, []);

  // If already submitted, redirect away
  useEffect(() => {
    if (isSubmitted) {
      navigate(APP_ROUTES.OWNER.DASHBOARD);
    }
  }, [isSubmitted, navigate]);

  const handleSubmit = async () => {
    const success = await submitOnboarding();
    if (success) {
      navigate(APP_ROUTES.OWNER.DASHBOARD);
    }
  };

  const handleCancel = () => {
    setIsCancelConfirmOpen(true);
  };

  const handleConfirmCancel = () => {
    setIsCancelConfirmOpen(false);
    setActiveViewMode(VIEW_MODE.CUSTOMER);
    navigate("/");
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
    <>
      <div className="w-full max-w-[1650px] mx-auto flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-16 px-4 py-8 sm:px-8">
        
        {/* Mobile Sleek Step Progress Indicator */}
        <div className="block lg:hidden w-full max-w-2xl px-4 sm:px-0 mb-2">
          <div className="bg-slate-950/40 border border-slate-900 rounded-2xl p-4 space-y-3">
            {/* Header info */}
            <div className="flex items-center justify-between text-[11px] font-bold">
              <div className="flex items-center gap-1.5">
                <span className="text-primary font-black uppercase tracking-wider">Step {onboardingStep} of 3</span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-200">
                  {onboardingStep === 1 
                    ? "Owner & KYC Details" 
                    : onboardingStep === 2 
                    ? "Payout Setup" 
                    : "Review & Submit"}
                </span>
              </div>
              {onboardingStep < 3 && (
                <span className="text-slate-500 text-[10px] hidden sm:inline">
                  Next: {onboardingStep === 1 ? "Payout" : "Review"}
                </span>
              )}
            </div>

            {/* Premium progress bar */}
            <div className="relative w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-blue-500 rounded-full transition-all duration-500 ease-out shadow-[0_0_8px_rgba(59,130,246,0.3)]"
                style={{ width: `${(onboardingStep / 3) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Left Column: Sidebar Stepper */}
        <div className="hidden lg:block lg:w-[360px] lg:shrink-0">
          <OnboardingSidebar currentStep={onboardingStep} />
        </div>

        {/* Right Column: Main Form Card */}
        <div className="grow max-w-2xl bg-transparent sm:bg-card border-0 sm:border border-slate-800/80 rounded-none sm:rounded-3xl p-4 sm:p-8 md:p-10 shadow-none sm:shadow-2xl relative z-10 w-full max-h-none sm:max-h-[840px] overflow-y-visible sm:overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800/60 scrollbar-track-transparent">
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

      <ConfirmationModal
        isOpen={isCancelConfirmOpen}
        onClose={() => setIsCancelConfirmOpen(false)}
        onConfirm={handleConfirmCancel}
        title="Exit Owner Onboarding?"
        message="Are you sure you want to cancel setup? Any unsaved progress on this step will be lost."
        confirmText="Exit Setup"
        cancelText="Stay Here"
        confirmVariant="danger"
      />
    </>
  );
}