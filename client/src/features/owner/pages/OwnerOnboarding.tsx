import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { OnboardingStepper } from "@/shared/components/onboarding-stepper";
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

        {/* Stepper — mobile compact indicator + desktop sidebar (single component) */}
        <OnboardingStepper currentStep={onboardingStep} />

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