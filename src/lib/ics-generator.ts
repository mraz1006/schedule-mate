import ical, { ICalCalendarMethod } from "ical-generator";

export function generateInviteIcs(params: {
  title: string;
  description: string | null;
  startTime: Date;
  endTime: Date;
  organizerName: string;
  organizerEmail: string;
  attendeeName: string;
  attendeeEmail: string;
  meetingUrl: string | null;
  timezone: string;
}): string {
  const calendar = ical({
    name: params.title,
    method: ICalCalendarMethod.REQUEST,
  });

  calendar.createEvent({
    start: params.startTime,
    end: params.endTime,
    summary: params.title,
    description: [
      params.description,
      params.meetingUrl ? `会議URL: ${params.meetingUrl}` : null,
    ]
      .filter(Boolean)
      .join("\n\n") || undefined,
    location: params.meetingUrl || undefined,
    organizer: {
      name: params.organizerName,
      email: params.organizerEmail,
    },
    attendees: [
      { name: params.organizerName, email: params.organizerEmail },
      { name: params.attendeeName, email: params.attendeeEmail },
    ],
    timezone: params.timezone,
  });

  return calendar.toString();
}
