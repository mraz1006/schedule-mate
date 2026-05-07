export type TimeSlot = {
  start: Date;
  end: Date;
};

export type SchedulingPageData = {
  id: string;
  title: string;
  description: string | null;
  organizerName: string;
  durationMinutes: number;
  meetingUrl: string | null;
  availableFrom: string;
  availableTo: string;
  timezone: string;
  slots: TimeSlot[];
};

export type CreatePageInput = {
  title: string;
  description?: string;
  organizerName: string;
  organizerEmail: string;
  durationMinutes: number;
  meetingUrl?: string;
  icsUrl: string;
  availableFrom: string;
  availableTo: string;
  workingHoursStart: number;
  workingHoursEnd: number;
  timezone: string;
  weeklySchedule?: unknown;
  bufferBefore?: number;
  bufferAfter?: number;
};

export type CreateBookingInput = {
  schedulingPageId: string;
  attendeeName: string;
  attendeeEmail: string;
  startTime: string;
  endTime: string;
};
