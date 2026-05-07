"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  pageId: string;
  bookingId: string;
  manageToken: string;
};

export default function CancelBookingButton({ pageId, bookingId, manageToken }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleCancel = async () => {
    if (!confirm("この予約をキャンセルしますか？")) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/scheduling-pages/${pageId}/bookings/${bookingId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "cancel", token: manageToken }),
        }
      );
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error ?? "キャンセルに失敗しました");
      }
    } catch {
      alert("エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCancel}
      disabled={loading}
      className="text-xs text-red-600 hover:text-red-800 disabled:opacity-50 underline"
    >
      {loading ? "処理中..." : "キャンセル"}
    </button>
  );
}
