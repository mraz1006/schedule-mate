"use client";

type Props = {
  attendeeName: string;
  attendeeEmail: string;
  onChange: (name: string, email: string) => void;
  onSubmit: () => void;
  loading: boolean;
  error: string | null;
};

export default function AttendeeForm({
  attendeeName,
  attendeeEmail,
  onChange,
  onSubmit,
  loading,
  error,
}: Props) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-gray-700">お客様情報を入力</h3>
      <div className="space-y-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">
            お名前 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={attendeeName}
            onChange={(e) => onChange(e.target.value, attendeeEmail)}
            placeholder="山田 花子"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">
            メールアドレス <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={attendeeEmail}
            onChange={(e) => onChange(attendeeName, e.target.value)}
            placeholder="you@example.com"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {error && (
        <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded p-3">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={onSubmit}
        disabled={!attendeeName || !attendeeEmail || loading}
        className="w-full bg-blue-600 text-white rounded-lg py-3 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? "予約中..." : "この時間で予約する"}
      </button>
    </div>
  );
}
