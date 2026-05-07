"use client";

import type { DaySchedule } from "@/lib/slot-calculator";

type AvailabilityConfig = {
  availableFrom: string;
  availableTo: string;
  workingHoursStart: number;
  workingHoursEnd: number;
  weeklySchedule: DaySchedule[];
  bufferBefore: number;
  bufferAfter: number;
};

type Props = {
  values: AvailabilityConfig;
  onChange: (values: AvailabilityConfig) => void;
};

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const BUFFER_OPTIONS = [0, 5, 10, 15, 30];

const DAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];
// Mon-Sun order for Japanese business context (Mon first)
const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

const DEFAULT_WEEKLY_SCHEDULE: DaySchedule[] = [
  { dow: 0, enabled: false, start: 9, end: 18 }, // Sun
  { dow: 1, enabled: true,  start: 9, end: 18 }, // Mon
  { dow: 2, enabled: true,  start: 9, end: 18 }, // Tue
  { dow: 3, enabled: true,  start: 9, end: 18 }, // Wed
  { dow: 4, enabled: true,  start: 9, end: 18 }, // Thu
  { dow: 5, enabled: true,  start: 9, end: 18 }, // Fri
  { dow: 6, enabled: false, start: 9, end: 18 }, // Sat
];

export { DEFAULT_WEEKLY_SCHEDULE };

export default function StepAvailability({ values, onChange }: Props) {
  const today = new Date().toISOString().split("T")[0];

  const updateDay = (dow: number, patch: Partial<DaySchedule>) => {
    const updated = values.weeklySchedule.map((d) =>
      d.dow === dow ? { ...d, ...patch } : d
    );
    onChange({ ...values, weeklySchedule: updated });
  };

  const selectClass =
    "border border-gray-300 rounded-lg px-2 py-1 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent";

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-semibold text-gray-900">受付期間と稼働時間</h2>

      {/* Date range */}
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

      {/* Buffer time */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">前バッファ</label>
          <select
            value={values.bufferBefore}
            onChange={(e) => onChange({ ...values, bufferBefore: Number(e.target.value) })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {BUFFER_OPTIONS.map((m) => (
              <option key={m} value={m}>{m === 0 ? "なし" : `${m}分`}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">後バッファ</label>
          <select
            value={values.bufferAfter}
            onChange={(e) => onChange({ ...values, bufferAfter: Number(e.target.value) })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {BUFFER_OPTIONS.map((m) => (
              <option key={m} value={m}>{m === 0 ? "なし" : `${m}分`}</option>
            ))}
          </select>
        </div>
      </div>
      <p className="text-xs text-gray-500 -mt-3">
        会議前後に確保する準備・移動時間です
      </p>

      {/* Per-weekday schedule */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">曜日ごとの稼働時間</label>
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          {DAY_ORDER.map((dow) => {
            const day = values.weeklySchedule.find((d) => d.dow === dow) ?? {
              dow,
              enabled: dow !== 0 && dow !== 6,
              start: 9,
              end: 18,
            };
            return (
              <div
                key={dow}
                className={`flex items-center gap-3 px-4 py-2.5 border-b last:border-b-0 ${
                  day.enabled ? "bg-white" : "bg-gray-50"
                }`}
              >
                <label className="flex items-center gap-2 w-14 shrink-0 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={day.enabled}
                    onChange={(e) => updateDay(dow, { enabled: e.target.checked })}
                    className="rounded"
                  />
                  <span
                    className={`text-sm font-medium ${
                      day.enabled ? "text-gray-900" : "text-gray-400"
                    }`}
                  >
                    {DAY_LABELS[dow]}
                  </span>
                </label>

                {day.enabled ? (
                  <div className="flex items-center gap-2 text-sm">
                    <select
                      value={day.start}
                      onChange={(e) => updateDay(dow, { start: Number(e.target.value) })}
                      className={selectClass}
                    >
                      {HOURS.map((h) => (
                        <option key={h} value={h}>
                          {String(h).padStart(2, "0")}:00
                        </option>
                      ))}
                    </select>
                    <span className="text-gray-400">〜</span>
                    <select
                      value={day.end}
                      onChange={(e) => updateDay(dow, { end: Number(e.target.value) })}
                      className={selectClass}
                    >
                      {HOURS.filter((h) => h > day.start).map((h) => (
                        <option key={h} value={h}>
                          {String(h).padStart(2, "0")}:00
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <span className="text-sm text-gray-400">休み</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
