import { Suspense } from "react";
import { AuthFrontDoor } from "@/components/auth/front-door";

export default function SignInLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#07080B]" />}>
      <AuthFrontDoor>{children}</AuthFrontDoor>
    </Suspense>
  );
}
