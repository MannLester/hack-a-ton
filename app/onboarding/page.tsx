import { OnboardingFlow } from "@/components/landing/onboarding-flow";
import { NotFoundView } from "@/components/shared/not-found-view";
import { canRenderOnboardingFlow } from "@/lib/onboarding-runtime";

export default function OnboardingPage() {
  const canRenderFlow = canRenderOnboardingFlow({
    hasConvexUrl: Boolean(process.env.NEXT_PUBLIC_CONVEX_URL),
  });

  if (!canRenderFlow) {
    return (
      <NotFoundView
        title="Onboarding unavailable"
        message="Onboarding needs the Hack-A-Ton backend connection before it can save your profile."
      />
    );
  }

  return <OnboardingFlow />;
}
