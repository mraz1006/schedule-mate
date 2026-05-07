"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import StepIcsUrl from "./StepIcsUpload";
import StepMeetingDetails from "./StepMeetingDetails";
import StepAvailability from "./StepAvailability";

const STEPS = ["ICS URL", "ミーティング詳細", "受付期間"] as const;

export default function CreatePageForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [icsUrl, setIcsUrl] = useState("");
  const [meetingDetails, setMeetingDetails] = useState({
    title: "",
    description: "",
    organizerName: "",
    organizerEmail: "",
    durationMinutes: 30,
    meetingUrl: "",
    timezone: "Asia/Tokyo",
    slug: "",
  });
  const [availability, setAvailability] = useState({
    availableFrom: "",
    availableTo: "",
    workingHoursStart: 9,
    workingHoursEnd: 18,
  });

  const canProceed = () => {
    if (step === 0) return icsUrl.startsWith("http");
    if (step === 1)
      return (
        !!meetingDetails.title &&
        !!meetingDetails.organizerName &&
        !!meetingDetails.organizerEmail
      );
    if (step === 2)
      return !!availability.availableFrom && !!availability.availableTo;
    return false;
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/scheduling-pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...meetingDetails,
          ...availability,
          icsUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "作成に失敗しました");
      router.push(`/manage/${data.id}?token=${data.manageToken}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center mb-8">
        {STEPS.map((label, i) => (
          <div key={i} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                i <= step ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"
              }`}
            >
              {i < step ? "✓" : i + 1}
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`h-0.5 mx-2 ${i < step ? "bg-blue-600" : "bg-gray-200"}`}
                style={{ width: "4rem" }}
              />
            )}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        {step === 0 && <StepIcsUrl icsUrl={icsUrl} onChange={setIcsUrl} />}
        {step === 1 && (
          <StepMeetingDetails values={meetingDetails} onChange={setMeetingDetails} />
        )}
        {step === 2 && (
          <StepAvailability values={availability} onChange={setAvailability} />
        )}

        {error && (
          <p className="mt-4 text-red-600 text-sm bg-red-50 border border-red-200 rounded p-3">
            {error}
          </p>
        )}

        <div className="flex gap-3 mt-6">
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="flex-1 border border-gray-300 rounded-lg py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              戻る
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              次へ
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canProceed() || loading}
              className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "作成中..." : "ページを作成"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
