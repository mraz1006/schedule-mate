"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";

type Status = "idle" | "loading" | "success" | "error";

export default function CancelBookingPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (confirmed) {
      setStatus("loading");
      fetch(`/api/bookings/${bookingId}/cancel?token=${token}`, { method: "PATCH" })
        .then(async (res) => {
          if (res.ok) {
            setStatus("success");
          } else {
            const data = await res.json().catch(() => ({}));
            setErrorMsg(data.error ?? "キャンセルに失敗しました");
            setStatus("error");
          }
        })
        .catch(() => {
          setErrorMsg("ネットワークエラーが発生しました");
          setStatus("error");
        });
    }
  }, [confirmed, bookingId, token]);

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <p className="text-gray-500 text-sm">無効なキャンセルリンクです。</p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md text-center space-y-4">
          <p className="text-4xl">✅</p>
          <h1 className="text-xl font-bold text-gray-900">予約をキャンセルしました</h1>
          <p className="text-gray-500 text-sm">
            ご予約のキャンセルが完了しました。またのご利用をお待ちしております。
          </p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md text-center space-y-4">
          <p className="text-4xl">⚠️</p>
          <h1 className="text-xl font-bold text-gray-900">エラーが発生しました</h1>
          <p className="text-gray-500 text-sm">{errorMsg}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <p className="text-4xl">🗓️</p>
          <h1 className="text-xl font-bold text-gray-900">予約のキャンセル</h1>
          <p className="text-gray-500 text-sm">この予約をキャンセルしますか？</p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
          キャンセルは取り消せません。本当によろしいですか？
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => setConfirmed(true)}
            disabled={status === "loading"}
            className="w-full bg-red-600 text-white rounded-lg py-3 text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {status === "loading" ? "処理中..." : "予約をキャンセルする"}
          </button>
          <Link
            href="/"
            className="text-center text-gray-500 text-sm hover:underline"
          >
            キャンセルせずに戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
