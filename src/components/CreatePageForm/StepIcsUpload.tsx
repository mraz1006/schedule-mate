"use client";

type Props = {
  icsUrl: string;
  onChange: (url: string) => void;
};

export default function StepIcsUrl({ icsUrl, onChange }: Props) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">カレンダーのICS URLを入力</h2>
      <p className="text-sm text-gray-700">
        カレンダーアプリの「公開URL（ICS形式）」を貼り付けてください。
        URLからリアルタイムで空き時間を取得します。
      </p>

      <input
        type="url"
        value={icsUrl}
        onChange={(e) => onChange(e.target.value)}
        placeholder="https://calendar.google.com/calendar/ical/..."
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3 text-sm">
        <p className="font-medium text-gray-800">URLの取得方法</p>
        <div className="space-y-2">
          <div>
            <p className="font-medium text-gray-800">Googleカレンダー</p>
            <p className="text-gray-700">設定 → 対象カレンダー → 「カレンダーの統合」→「秘密のアドレス（ICS形式）」をコピー</p>
          </div>
          <div>
            <p className="font-medium text-gray-800">Apple Calendar（iCloud）</p>
            <p className="text-gray-700">iCloud.com → カレンダー → 共有 → 「一般」をオンにしてURLをコピー</p>
          </div>
          <div>
            <p className="font-medium text-gray-800">Outlook</p>
            <p className="text-gray-700">設定 → カレンダー → 共有カレンダー → ICSリンクをコピー</p>
          </div>
        </div>
      </div>
    </div>
  );
}
