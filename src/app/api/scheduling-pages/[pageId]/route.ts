import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateAvailableSlots } from "@/lib/slot-calculator";

const ICS_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

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

    // Use cache if it's fresh
    const cacheAge = page.icsCacheUpdatedAt
      ? Date.now() - page.icsCacheUpdatedAt.getTime()
      : Infinity;
    const isCacheFresh = page.icsCache && cacheAge < ICS_CACHE_TTL_MS;

    let icsData: string;
    let cacheWarning = false;

    if (isCacheFresh) {
      icsData = page.icsCache!;
    } else {
      try {
        const icsRes = await fetch(page.icsUrl, { signal: AbortSignal.timeout(10000) });
        if (!icsRes.ok) throw new Error("ICS fetch failed");
        icsData = await icsRes.text();

        // Update cache asynchronously (don't block response)
        prisma.schedulingPage
          .update({
            where: { id: pageId },
            data: { icsCache: icsData, icsCacheUpdatedAt: new Date() },
          })
          .catch(() => {});
      } catch {
        if (page.icsCache) {
          // Serve stale cache
          icsData = page.icsCache;
          cacheWarning = true;
        } else {
          return NextResponse.json(
            { error: "カレンダーデータの取得に失敗しました", calendarUnavailable: true },
            { status: 502 }
          );
        }
      }
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
      ...(cacheWarning ? { cacheWarning: true } : {}),
    });
  } catch (error) {
    console.error("Failed to fetch scheduling page:", error);
    return NextResponse.json({ error: "取得に失敗しました" }, { status: 500 });
  }
}
