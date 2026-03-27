import { AuthGuard } from "@/components/auth/auth-guard";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-canvas">
        <Sidebar />

        {/* lg: offset by sidebar width; mobile: full width */}
        <div className="flex-1 flex flex-col min-h-screen lg:ml-64">
          <Header />
          <main className="flex-1 p-4 lg:p-6 pt-16 lg:pt-6">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}