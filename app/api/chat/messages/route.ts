import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

// GET — fetch messages for a room (with polling support via ?after=messageId)
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.employeeId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const employeeId = session.user.employeeId;

  const { searchParams } = new URL(req.url);
  const roomId = searchParams.get("roomId");
  const after = searchParams.get("after"); // ISO timestamp for polling
  const limit = parseInt(searchParams.get("limit") ?? "50", 10);

  if (!roomId) return NextResponse.json({ error: "roomId required" }, { status: 400 });

  // Verify participant
  const participant = await db.chatParticipant.findUnique({
    where: { roomId_employeeId: { roomId, employeeId } },
  });
  if (!participant) return NextResponse.json({ error: "Not a member of this room" }, { status: 403 });

  const messages = await db.chatMessage.findMany({
    where: {
      roomId,
      isDeleted: false,
      ...(after ? { createdAt: { gt: new Date(after) } } : {}),
    },
    include: {
      sender: {
        select: { id: true, firstName: true, lastName: true, designation: true },
      },
    },
    orderBy: { createdAt: after ? "asc" : "desc" },
    take: limit,
  });

  // For initial load, reverse to get chronological order
  const ordered = after ? messages : [...messages].reverse();

  // Update lastReadAt for this participant
  await db.chatParticipant.update({
    where: { roomId_employeeId: { roomId, employeeId } },
    data: { lastReadAt: new Date() },
  });

  return NextResponse.json({ messages: ordered });
}

// POST — send a new message
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.employeeId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const employeeId = session.user.employeeId;

  const { roomId, content, replyToId } = await req.json();
  if (!roomId || !content?.trim()) return NextResponse.json({ error: "roomId and content required" }, { status: 400 });

  // Verify participant
  const participant = await db.chatParticipant.findUnique({
    where: { roomId_employeeId: { roomId, employeeId } },
  });
  if (!participant) return NextResponse.json({ error: "Not a member" }, { status: 403 });

  const message = await db.chatMessage.create({
    data: {
      roomId,
      senderId: employeeId,
      content: content.trim(),
      replyToId: replyToId ?? null,
    },
    include: {
      sender: { select: { id: true, firstName: true, lastName: true, designation: true } },
    },
  });

  // Bump room updatedAt for ordering
  await db.chatRoom.update({ where: { id: roomId }, data: { updatedAt: new Date() } });

  return NextResponse.json({ message }, { status: 201 });
}

// DELETE — soft delete a message
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.employeeId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { messageId } = await req.json();

  const msg = await db.chatMessage.findUnique({ where: { id: messageId } });
  if (!msg || msg.senderId !== session.user.employeeId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await db.chatMessage.update({ where: { id: messageId }, data: { isDeleted: true, content: "This message was deleted." } });
  return NextResponse.json({ ok: true });
}
