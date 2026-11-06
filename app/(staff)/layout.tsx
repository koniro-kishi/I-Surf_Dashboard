import type { ReactNode } from "react";
import RoleShell from "../../components/role-shell";

export default function StaffLayout({ children }: { children: ReactNode }) {
  return <RoleShell role="staff">{children}</RoleShell>;
}
