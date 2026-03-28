import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">

        {/* Big 404 */}
        <div className="relative mb-8 select-none">
          <p className="font-display font-bold text-[120px] leading-none text-border/40 tracking-tighter">
            404
          </p>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 18 18" fill="none">
                <path d="M9 2L14.5 5.5V12.5L9 16L3.5 12.5V5.5L9 2Z" stroke="#818CF8" strokeWidth="1.5" strokeLinejoin="round"/>
                <circle cx="9" cy="9" r="2" fill="#818CF8"/>
              </svg>
            </div>
          </div>
        </div>

        <h1 className="font-display font-bold text-2xl text-text-primary mb-2 tracking-tight">
          Page not found
        </h1>
        <p className="text-sm text-text-secondary font-body leading-relaxed mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-500 text-white text-sm font-medium font-body hover:bg-primary-600 transition-colors shadow-glow-sm"
        >
          <ArrowLeft size={15} />
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}