"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import DatePicker from "./DatePicker";
import TimeSlotList from "./TimeSlotList";
import AttendeeForm from "./AttendeeForm";
import type { TimeSlot } from "@/types";

type PageData = {
  id: string;
  title: string;
  description: string | null;
  organizerName: string;
  durationMinutes: number;
  meetingUrl: string | null;
  timezone: string;
  slots: { start: string; end: string }[];
};

type Props = { pageData: PageData };

export default function BookingPage({ pageData }: Props) {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [attendeeName, setAttendeeName] = useState("");
  const [attendeeEmail, setAttendeeEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parsedSlots: TimeSlot[] = useMemo(
    () => pageData.slots.map((s) => ({ start: new Date(s.start), end: new Date(s.end) })),
    [pageData.slots]
  );

  const availableDates = useMemo(() => {
    const dates = parsedSlots.map((s) => {
      return new Intl.DateTimeFormat("sv-SE", {
        timeZone: pageData.timezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(s.start);
    });
    return [...new Set(dates)].sort();
  }, [parsedSlots, pageData.timezone]);

  const slotsForDate = useMemo(() => {
    if (!selectedDate) return [];
    return parsedSlots.filter((s) => {
      const dateStr = new Intl.DateTimeFormat("sv-SE", {
        timeZone: pageData.timezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(s.start);
      return dateStr === selectedDate;
    });
  }, [selectedDate, parsedSlots, pageData.timezone]);

  const handleBook = async () => {
    if (!selectedSlot) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schedulingPageId: pageData.id,
          attendeeName,
          attendeeEmail,
          startTime: selectedSlot.start.toISOString(),
          endTime: selectedSlot.end.toISOString(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "予約に失敗しました");
      const params = new URLSearchParams({
        title: pageData.title,
        organizer: pageData.organizerName,
        start: selectedSlot.start.toISOString(),
        end: selectedSlot.end.toISOString(),
        tz: pageData.timezone,
        ...(pageData.meetingUrl ? { meetingUrl: pageData.meetingUrl } : {}),
      });
      router.push(`/${pageData.id}/booked?${params.toString()}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{pageData.title}</h1>
        <p className="text-gray-500 mt-1">
          {pageData.organizerName} ・ {pageData.durationMinutes}分
        </p>
        {pageData.description && (
          <p className="text-gray-600 mt-2 text-sm">{pageData.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <DatePicker
            availableDates={availableDates}
            selectedDate={selectedDate}
            onSelect={(d) => {
              setSelectedDate(d);
              setSelectedSlot(null);
            }}
          />
        </div>

        <div className="md:col-span-1 bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          {selectedDate ? (
            <TimeSlotList
              slots={slotsForDate}
              selectedSlot={selectedSlot}
              onSelect={setSelectedSlot}
              timezone={pageData.timezone}
            />
          ) : (
            <p className="text-gray-400 text-sm py-4">日付を選択してください</p>
          )}
        </div>

        <div className="md:col-span-1 bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          {selectedSlot ? (
            <AttendeeForm
              attendeeName={attendeeName}
              attendeeEmail={attendeeEmail}
              onChange={(name, email) => {
                setAttendeeName(name);
                setAttendeeEmail(email);
              }}
              onSubmit={handleBook}
              loading={loading}
              error={error}
            />
          ) : (
            <p className="text-gray-400 text-sm py-4">時間を選択してください</p>
          )}
        </div>
      </div>
    </div>
  );
}
