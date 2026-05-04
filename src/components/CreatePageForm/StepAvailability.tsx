"use client";

type AvailabilityConfig = {
  availableFrom: string;
  availableTo: string;
  workingHoursStart: number;
  workingHoursEnd: number;
};

type Props = {
  values: AvailabilityConfig;
  onChange: (values: AvailabilityConfig) => void;
};

const HOURS = Array.from({ length: 24 }, (_, i) => i);

export default function StepAvailability({ values, onChange }: Props) {
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">受付期間と稼働時間</h2>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              受付開始日 <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              min={today}
              value={values.availableFrom}
              onChange={(e) => onChange({ ...values, availableFrom: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              受付終了日 <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              min={values.availableFrom || today}
              value={values.availableTo}
              onChange={(e) => onChange({ ...values, availableTo: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">稼働開始時刻</label>
            <select
              value={values.workingHoursStart}
              onChange={(e) =>
                onChange({ ...values, workingHoursStart: Number(e.target.value) })
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {HOURS.map((h) => (
                <option key={h} value={h}>
                  {String(h).padStart(2, "0")}:00
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">稼働終了時刻</label>
            <select
              value={values.workingHoursEnd}
              onChange={(e) =>
                onChange({ ...values, workingHoursEnd: Number(e.target.value) })
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {HOURS.filter((h) => h > values.workingHoursStart).map((h) => (
                <option key={h} value={h}>
                  {String(h).padStart(2, "0")}:00
                </option>
              ))}
            </select>
          </div>
        </div>
        <p className="text-xs text-gray-600">
          稼働時間帯内のスロットのみが予約可能として表示されます
        </p>
      </div>
    </div>
  );
}
