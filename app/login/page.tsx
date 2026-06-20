import { AuthForm } from "@/components/AuthForm";

export default function LoginPage() {
  return (
    <main className="app-shell">
      <AuthForm mode="login" />
    </main>
  );
}
