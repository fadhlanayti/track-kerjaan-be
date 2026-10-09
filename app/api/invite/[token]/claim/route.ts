import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const { password, name } = await req.json()

  if (!password || password.length < 6) {
    return NextResponse.json({ error: 'Password min 6 chars' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where: { inviteToken: token },
  })

  if (!user || user.isActive) {
    return NextResponse.json({ error: 'Invalid or used invite' }, { status: 404 })
  }

  if (user.inviteExpiry && user.inviteExpiry < new Date()) {
    return NextResponse.json({ error: 'Invite expired' }, { status: 410 })
  }

  const hashed = await hash(password, 12)

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashed,
      name: name || user.name,
      isActive: true,
      inviteToken: null,
      inviteExpiry: null,
    },
  })

  return NextResponse.json({ success: true })
}
