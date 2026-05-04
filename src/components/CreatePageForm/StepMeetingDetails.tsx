"use client";

type MeetingDetails = {
  title: string;
  description: string;
  organizerName: string;
  organizerEmail: string;
  durationMinutes: number;
  meetingUrl: string;
  timezone: string;
};

type Props = {
  values: MeetingDetails;
  onChange: (values: MeetingDetails) => void;
};

const TIMEZONES = [
  "Asia/Tokyo",
  "Asia/Seoul",
  "Asia/Shanghai",
  "America/New_York",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
];

const inputClass =
  "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent";

export default function StepMeetingDetails({ values, onChange }: Props) {
  const set = (key: keyof MeetingDetails) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      onChange({ ...values, [key]: e.target.value });

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">ミーティングの詳細</h2>

      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-800 mb-1">
            ミーティングタイトル <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={values.title}
            onChange={set("title")}
            placeholder="例: 採用面接、打ち合わせ"
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-800 mb-1">説明（任意）</label>
          <textarea
            value={values.description}
            onChange={set("description")}
            placeholder="ミーティングの目的や注意事項など"
            rows={3}
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              お名前 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={values.organizerName}
              onChange={set("organizerName")}
              placeholder="山田 太郎"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              メールアドレス <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={values.organizerEmail}
              onChange={set("organizerEmail")}
              placeholder="you@example.com"
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">所要時間</label>
            <select value={values.durationMinutes} onChange={set("durationMinutes")} className={inputClass}>
              <option value={15}>15分</option>
              <option value={30}>30分</option>
              <option value={45}>45分</option>
              <option value={60}>60分</option>
              <option value={90}>90分</option>
              <option value={120}>120分</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">タイムゾーン</label>
            <select value={values.timezone} onChange={set("timezone")} className={inputClass}>
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-800 mb-1">
            ウェブ会議URL（任意）
          </label>
          <input
            type="url"
            value={values.meetingUrl}
            onChange={set("meetingUrl")}
            placeholder="https://zoom.us/j/..."
            className={inputClass}
          />
          <p className="text-xs text-gray-600 mt-1">Zoom、Google Meet などのURLを入力するとインビテーションメールに含まれます</p>
        </div>
      </div>
    </div>
  );
}
