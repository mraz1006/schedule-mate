import { NextRequest, NextResponse } from "next/server";
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
      slug,
    } = body;

    if (!title || !organizerName || !organizerEmail || !icsUrl || !availableFrom || !availableTo) {
      return NextResponse.json({ error: "必須項目が不足しています" }, { status: 400 });
    }

    // Validate slug if provided
    const cleanSlug = slug?.trim() || null;
    if (cleanSlug) {
      if (!/^[a-z0-9-]{3,50}$/.test(cleanSlug)) {
        return NextResponse.json(
          { error: "URLスラグは英小文字・数字・ハイフンのみ、3〜50文字で入力してください" },
          { status: 400 }
        );
      }
      const existing = await prisma.schedulingPage.findUnique({ where: { slug: cleanSlug } });
      if (existing) {
        return NextResponse.json({ error: "そのURLはすでに使用されています" }, { status: 409 });
      }
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
        slug: cleanSlug,
      },
    });

    return NextResponse.json({ id: page.id, manageToken: page.manageToken });
  } catch (error) {
    console.error("Failed to create scheduling page:", error);
    return NextResponse.json({ error: "作成に失敗しました" }, { status: 500 });
  }
}
