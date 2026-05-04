import Link from "next/link";
import CreatePageForm from "@/components/CreatePageForm";

export default function CreatePage() {
  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-xl mx-auto mb-8">
        <Link href="/" className="text-sm text-blue-600 hover:underline">
          ← トップに戻る
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-4">スケジュールページを作成</h1>
        <p className="text-gray-500 text-sm mt-1">
          3ステップで日程調整ページを作成できます
        </p>
      </div>
      <CreatePageForm />
    </div>
  );
}
