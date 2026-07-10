import { useNavigate } from "react-router-dom";
import { useState } from "react";
import OnboardingSidebar from "../components/onboarding/OnboardingSidebar";
import OnboardingForm from "../components/onboarding/OnboardingForm";
import { useOwnerStore } from "../store/ownerStore";

export default function OwnerOnboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const { isLoading, submitOnboarding } = useOwnerStore();

  const handleSubmit = async (data: any) => {
    // Construct FormData for multipart upload
    const formData = new FormData();
    formData.append("fullName", data.fullName);
    formData.append("phone", data.phone);
    formData.append("whatsapp", data.whatsapp || "");
    formData.append("businessName", data.businessName);
    formData.append("businessType", data.businessType);
    formData.append("gstNumber", data.gstNumber || "");
    formData.append("idProofType", data.idProofType);
    
    // Bank details
    formData.append("accountHolderName", data.accountHolderName);
    formData.append("bankName", data.bankName);
    formData.append("accountNumber", data.accountNumber);
    formData.append("ifscCode", data.ifscCode);
    formData.append("accountType", data.accountType || "Savings Account");

    if (data.idProofFile) {
      formData.append("idProofFile", data.idProofFile);
    }
    if (data.businessLicenseFile) {
      formData.append("businessLicenseFile", data.businessLicenseFile);
    }
    if (data.gstCertificateFile) {
      formData.append("gstCertificateFile", data.gstCertificateFile);
    }
    if (data.bankProofFile) {
      formData.append("bankProofFile", data.bankProofFile);
    }

    // Submit via state store action
    const success = await submitOnboarding(formData);
    if (success) {
      navigate("/owner/dashboard");
    }
  };

  const handleCancel = () => {
    navigate("/setup-account");
  };

  return (
    <div className="w-full max-w-[1650px] mx-auto flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-16 px-4 py-8 sm:px-8">
      {/* Left Column: Sidebar Stepper (visible on desktop, centered vertically) */}
      <div className="hidden lg:block lg:w-[360px] lg:shrink-0">
        <OnboardingSidebar currentStep={step} />
      </div>

      {/* Right Column: Main Form Card Wrapper (scrollable to fit fields on desktop, native on mobile) */}
      <div className="flex-grow max-w-[1150px] bg-transparent sm:bg-card border-0 sm:border border-slate-800/80 rounded-none sm:rounded-3xl p-4 sm:p-8 md:p-10 shadow-none sm:shadow-2xl relative z-10 w-full max-h-none sm:max-h-[840px] overflow-y-visible sm:overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800/60 scrollbar-track-transparent">
        <OnboardingForm 
          step={step}
          setStep={setStep}
          onSubmit={handleSubmit} 
          onCancel={handleCancel} 
          isLoading={isLoading} 
        />
      </div>
    </div>
  );
}