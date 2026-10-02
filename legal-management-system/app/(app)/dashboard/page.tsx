"use client";

import { AdminDashboard } from "@/components/dashboard/admin-dashboard";
import { StaffDashboard } from "@/components/dashboard/staff-dashboard";
import { useAuth } from "@/lib/auth-context";

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) return null;

  return user.role === "LEGAL_ADMIN" ? <AdminDashboard /> : <StaffDashboard />;
}
