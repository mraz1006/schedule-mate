import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

function formatDateTime(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: timezone,
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export async function sendCancellationEmail(params: {
  title: string;
  organizerName: string;
  attendeeName: string;
  attendeeEmail: string;
  startTime: Date;
  timezone: string;
}) {
  const { title, organizerName, attendeeName, attendeeEmail, startTime, timezone } = params;
  const formattedStart = formatDateTime(startTime, timezone);

  await resend.emails.send({
    from: "Schedule Mate <noreply@schedule-mate.com>",
    to: [attendeeEmail],
    subject: `【予約キャンセル】${title} - ${formattedStart}`,
    html: `
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #1a1a1a;">予約がキャンセルされました</h2>
  <p>${attendeeName} さん、</p>
  <p>${organizerName} さんとのミーティングがキャンセルされました。</p>
  <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
    <p style="margin: 4px 0;"><strong>件名:</strong> ${title}</p>
    <p style="margin: 4px 0;"><strong>日時:</strong> ${formattedStart}</p>
  </div>
  <p style="color: #666; font-size: 12px;">このメールはSchedule Mateから自動送信されています。</p>
</div>
    `.trim(),
  });
}

export async function sendBookingEmails(params: {
  title: string;
  organizerName: string;
  organizerEmail: string;
  attendeeName: string;
  attendeeEmail: string;
  startTime: Date;
  endTime: Date;
  meetingUrl: string | null;
  timezone: string;
  icsContent: string;
  bookingId: string;
  cancelToken: string;
}) {
  const {
    title,
    organizerName,
    organizerEmail,
    attendeeName,
    attendeeEmail,
    startTime,
    endTime,
    meetingUrl,
    timezone,
    icsContent,
    bookingId,
    cancelToken,
  } = params;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const cancelUrl = `${baseUrl}/bookings/${bookingId}/cancel?token=${cancelToken}`;

  const formattedStart = formatDateTime(startTime, timezone);
  const formattedEnd = formatDateTime(endTime, timezone);

  const icsBase64 = Buffer.from(icsContent).toString("base64");

  const emailBody = (recipientName: string, isAttendee: boolean) => `
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #1a1a1a;">ミーティングが確定しました</h2>
  <p>${recipientName} さん、</p>
  <p>${organizerName} さんとのミーティングが予約されました。</p>

  <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
    <p style="margin: 4px 0;"><strong>件名:</strong> ${title}</p>
    <p style="margin: 4px 0;"><strong>開始:</strong> ${formattedStart}</p>
    <p style="margin: 4px 0;"><strong>終了:</strong> ${formattedEnd}</p>
    ${meetingUrl ? `<p style="margin: 4px 0;"><strong>会議URL:</strong> <a href="${meetingUrl}">${meetingUrl}</a></p>` : ""}
  </div>

  <p>添付のカレンダーファイル(.ics)を開いて、カレンダーに追加してください。</p>
  ${isAttendee ? `<p style="margin-top: 16px; font-size: 13px;"><a href="${cancelUrl}" style="color: #666;">予約をキャンセルする場合はこちら</a></p>` : ""}
  <p style="color: #666; font-size: 12px;">このメールはSchedule Mateから自動送信されています。</p>
</div>
  `.trim();

  const attachments = [
    {
      filename: "meeting.ics",
      content: icsBase64,
      type: "text/calendar",
      disposition: "attachment" as const,
    },
  ];

  await Promise.all([
    resend.emails.send({
      from: "Schedule Mate <noreply@schedule-mate.com>",
      to: [organizerEmail],
      subject: `【予約確定】${title} - ${formattedStart}`,
      html: emailBody(organizerName, false),
      attachments,
    }),
    resend.emails.send({
      from: "Schedule Mate <noreply@schedule-mate.com>",
      to: [attendeeEmail],
      subject: `【予約確定】${title} - ${formattedStart}`,
      html: emailBody(attendeeName, true),
      attachments,
    }),
  ]);
}
