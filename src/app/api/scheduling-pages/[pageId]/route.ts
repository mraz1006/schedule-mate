import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateAvailableSlots } from "@/lib/slot-calculator";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ pageId: string }> }
) {
  try {
    const { pageId } = await params;

    const page = await prisma.schedulingPage.findUnique({
      where: { id: pageId },
      include: {
        bookings: {
          where: { status: "CONFIRMED" },
          select: { startTime: true, endTime: true },
        },
      },
    });

    if (!page) {
      return NextResponse.json({ error: "ページが見つかりません" }, { status: 404 });
    }

    // Fetch ICS data fresh from URL
    let icsData: string;
    try {
      const icsRes = await fetch(page.icsUrl, { signal: AbortSignal.timeout(10000) });
      if (!icsRes.ok) throw new Error();
      icsData = await icsRes.text();
    } catch {
      return NextResponse.json(
        { error: "カレンダーデータの取得に失敗しました" },
        { status: 502 }
      );
    }

    const slots = calculateAvailableSlots({
      icsData,
      availableFrom: page.availableFrom,
      availableTo: page.availableTo,
      workingHoursStart: page.workingHoursStart,
      workingHoursEnd: page.workingHoursEnd,
      durationMinutes: page.durationMinutes,
      timezone: page.timezone,
      existingBookings: page.bookings.map((b) => ({
        start: b.startTime,
        end: b.endTime,
      })),
      weeklySchedule: page.weeklySchedule as import("@/lib/slot-calculator").DaySchedule[] | null,
    });

    return NextResponse.json({
      id: page.id,
      title: page.title,
      description: page.description,
      organizerName: page.organizerName,
      durationMinutes: page.durationMinutes,
      meetingUrl: page.meetingUrl,
      availableFrom: page.availableFrom.toISOString(),
      availableTo: page.availableTo.toISOString(),
      timezone: page.timezone,
      slots: slots.map((s) => ({
        start: s.start.toISOString(),
        end: s.end.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Failed to fetch scheduling page:", error);
    return NextResponse.json({ error: "取得に失敗しました" }, { status: 500 });
  }
}
