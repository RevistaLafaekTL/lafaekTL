import type { Metadata } from "next";
import ComingSoon from "@/components/ComingSoon";

// Placeholder while the Careers page is on hold.
// Remove `robots` once the real page goes live so search engines can index it.
export const metadata: Metadata = {
  title: "Careers | Lafaek",
  robots: { index: false, follow: true },
};

export default function CareersPage() {
  return <ComingSoon section={{ en: "Careers", tet: "Karreira" }} />;
}