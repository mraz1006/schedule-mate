import { notFound } from "next/navigation";
import BookingPage from "@/components/BookingPage";

type Props = { params: Promise<{ pageId: string }> };

async function getPageData(pageId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/scheduling-pages/${pageId}`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function BookingPageRoute({ params }: Props) {
  const { pageId } = await params;
  const pageData = await getPageData(pageId);
  if (!pageData) notFound();

  return (
    <div className="min-h-screen py-12 px-4">
      <BookingPage pageData={pageData} />
    </div>
  );
}
