import { Suspense } from "react";
import LoginForm from "./login-form";
import { Navbar } from "@/components/navbar";

export default function LoginPage() {
  return (
      <Suspense>
        <LoginForm />
      </Suspense>
  );
}