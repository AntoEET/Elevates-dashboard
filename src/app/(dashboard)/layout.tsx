import { DashboardShell } from '@/presentation/components/layout/DashboardShell';
import { DrillDownModal } from '@/presentation/components/alerts/DrillDownModal';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <DashboardShell>{children}</DashboardShell>
      <DrillDownModal />
    </>
  );
}
