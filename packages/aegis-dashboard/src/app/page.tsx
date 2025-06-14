// packages/aegis-dashboard/src/app/page.tsx

import { DashboardClient } from "@/components/DashboardClient"; // Import our new main component

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-8 md:p-12 bg-black">
      <div className="w-full max-w-7xl">
        <h1 className="text-4xl font-bold text-white mb-8">Aegis Dashboard</h1>
        <DashboardClient />
      </div>
    </main>
  );
}