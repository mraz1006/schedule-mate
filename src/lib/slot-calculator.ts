import ICAL from "ical.js";
import type { TimeSlot } from "@/types";

type BusyPeriod = { start: Date; end: Date };

export function parseBusyPeriods(icsData: string): BusyPeriod[] {
  const jcal = ICAL.parse(icsData);
  const comp = new ICAL.Component(jcal);
  const vevents = comp.getAllSubcomponents("vevent");

  const busy: BusyPeriod[] = [];

  for (const vevent of vevents) {
    const event = new ICAL.Event(vevent);

    if (event.isRecurring()) {
      const start = event.startDate.toJSDate();
      const rangeEnd = new Date(start);
      rangeEnd.setMonth(rangeEnd.getMonth() + 6);

      const iter = event.iterator();
      let next = iter.next();
      while (next) {
        const occStart = next.toJSDate();
        if (occStart > rangeEnd) break;
        const duration = event.duration;
        const occEnd = new Date(occStart.getTime() + duration.toSeconds() * 1000);
        busy.push({ start: occStart, end: occEnd });
        next = iter.next();
      }
    } else {
      const start = event.startDate.toJSDate();
      const end = event.endDate.toJSDate();
      if (start < end) {
        busy.push({ start, end });
      }
    }
  }

  return busy;
}

function slotsOverlap(slotStart: Date, slotEnd: Date, busyStart: Date, busyEnd: Date): boolean {
  return slotStart < busyEnd && slotEnd > busyStart;
}

export function calculateAvailableSlots(params: {
  icsData: string;
  availableFrom: Date;
  availableTo: Date;
  workingHoursStart: number;
  workingHoursEnd: number;
  durationMinutes: number;
  timezone: string;
  existingBookings: BusyPeriod[];
}): TimeSlot[] {
  const {
    icsData,
    availableFrom,
    availableTo,
    workingHoursStart,
    workingHoursEnd,
    durationMinutes,
    existingBookings,
  } = params;

  const busyPeriods = [...parseBusyPeriods(icsData), ...existingBookings];
  const slots: TimeSlot[] = [];
  const durationMs = durationMinutes * 60 * 1000;

  const current = new Date(availableFrom);
  current.setHours(0, 0, 0, 0);

  const end = new Date(availableTo);
  end.setHours(23, 59, 59, 999);

  while (current <= end) {
    const dayStart = new Date(current);
    dayStart.setHours(workingHoursStart, 0, 0, 0);
    const dayEnd = new Date(current);
    dayEnd.setHours(workingHoursEnd, 0, 0, 0);

    let slotStart = new Date(dayStart);

    while (slotStart.getTime() + durationMs <= dayEnd.getTime()) {
      const slotEnd = new Date(slotStart.getTime() + durationMs);
      const now = new Date();

      const isBusy = busyPeriods.some((b) =>
        slotsOverlap(slotStart, slotEnd, b.start, b.end)
      );

      if (!isBusy && slotStart > now) {
        slots.push({ start: new Date(slotStart), end: new Date(slotEnd) });
      }

      slotStart = new Date(slotStart.getTime() + durationMs);
    }

    current.setDate(current.getDate() + 1);
  }

  return slots;
}
