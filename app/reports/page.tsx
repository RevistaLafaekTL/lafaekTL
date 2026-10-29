import type { Metadata } from "next";
import ComingSoon from "@/components/ComingSoon";

// Placeholder while the Reports page is on hold.
// Remove `robots` once the real page goes live so search engines can index it.
export const metadata: Metadata = {
  title: "Reports | Lafaek",
  robots: { index: false, follow: true },
};

export default function ReportsPage() {
  return <ComingSoon section={{ en: "Reports", tet: "Relatóriu" }} />;
}