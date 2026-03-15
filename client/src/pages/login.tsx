import { useEffect } from "react";
import { ManusDialog } from "@/components/ManusDialog";

export default function LoginPage() {
  useEffect(() => {
    // Show login dialog immediately when page loads
    // The dialog is controlled by parent component state
  }, []);

  return (
    <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <ManusDialog
        title="Sign In to ApexAI"
        logo="https://apexai-production-d567.up.railway.app/logo.svg"
        open={true}
        onLogin={() => {
          // Login handled by ManusDialog component
          // It will set the session cookie and redirect
        }}
        onOpenChange={() => {
          // If user closes dialog, redirect home
          window.location.href = "/";
        }}
      />
    </div>
  );
}
