import { LoginForm } from "@/components/auth/LoginForm";
import { Trophy } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4 py-12">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-red-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-orange-500 mb-4">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-black text-2xl text-white">IBPL Admin Portal</h1>
          <p className="text-gray-500 text-sm mt-1">
            IIT Indore Basketball Premier League
          </p>
        </div>

        <LoginForm />

        <p className="text-center text-gray-600 text-xs mt-6">
          This portal is restricted to authorised IBPL administrators only.
        </p>
      </div>
    </div>
  );
}
