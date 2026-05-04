"use client";

type Props = {
  availableDates: string[];
  selectedDate: string | null;
  onSelect: (date: string) => void;
};

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export default function DatePicker({ availableDates, selectedDate, onSelect }: Props) {
  const today = new Date();
  const [viewYear, setViewYear] = [
    parseInt(availableDates[0]?.split("-")[0] ?? String(today.getFullYear())),
    parseInt(availableDates[0]?.split("-")[1] ?? String(today.getMonth() + 1)) - 1,
  ];

  const availableSet = new Set(availableDates);
  const daysInMonth = getDaysInMonth(viewYear, viewYear < today.getFullYear() ? viewYear : viewYear);
  const firstDay = getFirstDayOfMonth(viewYear, viewYear < today.getFullYear() ? viewYear : viewYear);

  const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

  const allDates = new Set(availableDates.map((d) => d.substring(0, 10)));
  const months = [...new Set(availableDates.map((d) => d.substring(0, 7)))].sort();

  if (allDates.size === 0) {
    return <p className="text-gray-400 text-sm">空き日程がありません</p>;
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-gray-700 mb-3">日付を選択</h3>
      <div className="space-y-4">
        {months.map((ym) => {
          const [y, m] = ym.split("-").map(Number);
          const daysInM = getDaysInMonth(y, m - 1);
          const firstDayOfM = getFirstDayOfMonth(y, m - 1);

          return (
            <div key={ym}>
              <p className="text-xs font-medium text-gray-500 mb-2">
                {y}年{m}月
              </p>
              <div className="grid grid-cols-7 gap-1 text-center">
                {WEEKDAYS.map((w) => (
                  <div key={w} className="text-xs text-gray-400 py-1">
                    {w}
                  </div>
                ))}
                {Array.from({ length: firstDayOfM }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {Array.from({ length: daysInM }, (_, i) => i + 1).map((day) => {
                  const dateStr = `${y}-${String(m).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                  const hasSlots = allDates.has(dateStr);
                  const isSelected = selectedDate === dateStr;
                  const isPast = new Date(dateStr) < new Date(today.toDateString());

                  return (
                    <button
                      key={day}
                      type="button"
                      disabled={!hasSlots || isPast}
                      onClick={() => onSelect(dateStr)}
                      className={`text-xs py-1.5 rounded-md font-medium transition-colors ${
                        isSelected
                          ? "bg-blue-600 text-white"
                          : hasSlots && !isPast
                          ? "bg-blue-50 text-blue-700 hover:bg-blue-100"
                          : "text-gray-300 cursor-not-allowed"
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
