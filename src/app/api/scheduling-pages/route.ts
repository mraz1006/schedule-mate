import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { CreatePageInput } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body: CreatePageInput = await req.json();

    const {
      title,
      description,
      organizerName,
      organizerEmail,
      durationMinutes,
      meetingUrl,
      icsUrl,
      availableFrom,
      availableTo,
      workingHoursStart,
      workingHoursEnd,
      timezone,
      weeklySchedule,
    } = body;

    if (!title || !organizerName || !organizerEmail || !icsUrl || !availableFrom || !availableTo) {
      return NextResponse.json({ error: "必須項目が不足しています" }, { status: 400 });
    }

    // Validate ICS URL by fetching it
    try {
      const icsRes = await fetch(icsUrl, { signal: AbortSignal.timeout(10000) });
      if (!icsRes.ok) throw new Error();
      const text = await icsRes.text();
      if (!text.includes("BEGIN:VCALENDAR")) throw new Error();
    } catch {
      return NextResponse.json(
        { error: "ICS URLが無効か、アクセスできませんでした。URLを確認してください。" },
        { status: 400 }
      );
    }

    const page = await prisma.schedulingPage.create({
      data: {
        title,
        description: description || null,
        organizerName,
        organizerEmail,
        durationMinutes,
        meetingUrl: meetingUrl || null,
        icsUrl,
        availableFrom: new Date(availableFrom),
        availableTo: new Date(availableTo),
        workingHoursStart,
        workingHoursEnd,
        timezone,
        weeklySchedule: weeklySchedule !== undefined
          ? (weeklySchedule as Prisma.InputJsonValue)
          : Prisma.JsonNull,
      },
    });

    return NextResponse.json({ id: page.id, manageToken: page.manageToken });
  } catch (error) {
    console.error("Failed to create scheduling page:", error);
    return NextResponse.json({ error: "作成に失敗しました" }, { status: 500 });
  }
}
