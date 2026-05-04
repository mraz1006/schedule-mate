"use client";

import type { TimeSlot } from "@/types";

type Props = {
  slots: TimeSlot[];
  selectedSlot: TimeSlot | null;
  onSelect: (slot: TimeSlot) => void;
  timezone: string;
};

function formatTime(date: Date | string, timezone: string): string {
  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export default function TimeSlotList({ slots, selectedSlot, onSelect, timezone }: Props) {
  if (slots.length === 0) {
    return <p className="text-gray-400 text-sm py-4">この日は空きがありません</p>;
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-gray-700 mb-3">時間を選択</h3>
      <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
        {slots.map((slot, i) => {
          const isSelected =
            selectedSlot?.start.toString() === slot.start.toString();
          return (
            <button
              key={i}
              type="button"
              onClick={() => onSelect(slot)}
              className={`w-full text-left px-4 py-3 rounded-lg border text-sm font-medium transition-colors ${
                isSelected
                  ? "bg-blue-600 text-white border-blue-600"
                  : "border-gray-200 text-gray-700 hover:border-blue-400 hover:bg-blue-50"
              }`}
            >
              {formatTime(slot.start, timezone)} – {formatTime(slot.end, timezone)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
