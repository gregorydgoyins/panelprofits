import { AuthFrontDoor } from "@/components/auth/front-door";

export default function SignUpLayout({ children }: { children: React.ReactNode }) {
  return <AuthFrontDoor>{children}</AuthFrontDoor>;
}
