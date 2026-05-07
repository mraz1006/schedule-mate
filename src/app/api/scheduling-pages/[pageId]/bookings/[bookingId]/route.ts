import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendCancellationEmail } from "@/lib/email";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ pageId: string; bookingId: string }> }
) {
  try {
    const { pageId, bookingId } = await params;
    const body = await req.json();
    const { action, token } = body as { action: string; token: string };

    if (action !== "cancel") {
      return NextResponse.json({ error: "不明なアクションです" }, { status: 400 });
    }
    if (!token) {
      return NextResponse.json({ error: "トークンが必要です" }, { status: 400 });
    }

    const page = await prisma.schedulingPage.findUnique({ where: { id: pageId } });
    if (!page) {
      return NextResponse.json({ error: "ページが見つかりません" }, { status: 404 });
    }
    if (page.manageToken !== token) {
      return NextResponse.json({ error: "無効なトークンです" }, { status: 403 });
    }

    const booking = await prisma.booking.findFirst({
      where: { id: bookingId, schedulingPageId: pageId },
    });
    if (!booking) {
      return NextResponse.json({ error: "予約が見つかりません" }, { status: 404 });
    }
    if (booking.status === "CANCELLED") {
      return NextResponse.json({ error: "この予約はすでにキャンセル済みです" }, { status: 409 });
    }

    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "CANCELLED" },
    });

    sendCancellationEmail({
      title: page.title,
      organizerName: page.organizerName,
      attendeeName: booking.attendeeName,
      attendeeEmail: booking.attendeeEmail,
      startTime: booking.startTime,
      timezone: page.timezone,
    }).catch(() => {});

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to cancel booking by organizer:", error);
    return NextResponse.json({ error: "キャンセルに失敗しました" }, { status: 500 });
  }
}
