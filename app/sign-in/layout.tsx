import { AuthFrontDoor } from "@/components/auth/front-door";

export default function SignInLayout({ children }: { children: React.ReactNode }) {
  return <AuthFrontDoor>{children}</AuthFrontDoor>;
}
