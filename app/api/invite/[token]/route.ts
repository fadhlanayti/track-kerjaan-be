import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const user = await prisma.user.findUnique({
    where: { inviteToken: token },
    select: { email: true, name: true, inviteExpiry: true, isActive: true },
  })

  if (!user || user.isActive) {
    return NextResponse.json({ error: 'Invalid or used invite' }, { status: 404 })
  }

  if (user.inviteExpiry && user.inviteExpiry < new Date()) {
    return NextResponse.json({ error: 'Invite expired' }, { status: 410 })
  }

  return NextResponse.json({ email: user.email, name: user.name })
}
