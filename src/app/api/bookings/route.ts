import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateInviteIcs } from "@/lib/ics-generator";
import { sendBookingEmails } from "@/lib/email";
import type { CreateBookingInput } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body: CreateBookingInput = await req.json();
    const { schedulingPageId, attendeeName, attendeeEmail, startTime, endTime } = body;

    if (!schedulingPageId || !attendeeName || !attendeeEmail || !startTime || !endTime) {
      return NextResponse.json({ error: "必須項目が不足しています" }, { status: 400 });
    }

    const page = await prisma.schedulingPage.findUnique({
      where: { id: schedulingPageId },
    });

    if (!page) {
      return NextResponse.json({ error: "ページが見つかりません" }, { status: 404 });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    // Check for conflicting bookings
    const conflict = await prisma.booking.findFirst({
      where: {
        schedulingPageId,
        status: "CONFIRMED",
        OR: [
          { startTime: { lt: end }, endTime: { gt: start } },
        ],
      },
    });

    if (conflict) {
      return NextResponse.json({ error: "その時間はすでに予約済みです" }, { status: 409 });
    }

    const booking = await prisma.booking.create({
      data: {
        schedulingPageId,
        attendeeName,
        attendeeEmail,
        startTime: start,
        endTime: end,
      },
    });

    const icsContent = generateInviteIcs({
      title: page.title,
      description: page.description,
      startTime: start,
      endTime: end,
      organizerName: page.organizerName,
      organizerEmail: page.organizerEmail,
      attendeeName,
      attendeeEmail,
      meetingUrl: page.meetingUrl,
      timezone: page.timezone,
    });

    try {
      await sendBookingEmails({
        title: page.title,
        organizerName: page.organizerName,
        organizerEmail: page.organizerEmail,
        attendeeName,
        attendeeEmail,
        startTime: start,
        endTime: end,
        meetingUrl: page.meetingUrl,
        timezone: page.timezone,
        icsContent,
        bookingId: booking.id,
        cancelToken: booking.cancelToken,
      });
    } catch (emailError) {
      console.error("Email sending failed (booking still created):", emailError);
    }

    return NextResponse.json({ id: booking.id, schedulingPageId });
  } catch (error) {
    console.error("Failed to create booking:", error);
    return NextResponse.json({ error: "予約に失敗しました" }, { status: 500 });
  }
}
