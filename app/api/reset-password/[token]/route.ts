import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  const user = await prisma.user.findUnique({
    where: { inviteToken: token },
    select: { id: true, name: true, email: true, inviteExpiry: true },
  })

  if (!user) {
    return NextResponse.json({ error: 'Link reset password tidak valid atau sudah digunakan' }, { status: 404 })
  }

  if (user.inviteExpiry && user.inviteExpiry < new Date()) {
    return NextResponse.json({ error: 'Link reset password sudah kedaluwarsa' }, { status: 410 })
  }

  return NextResponse.json({ name: user.name, email: user.email })
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const { password } = await req.json()

  if (!password || password.length < 6) {
    return NextResponse.json({ error: 'Password minimal 6 karakter' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where: { inviteToken: token },
  })

  if (!user) {
    return NextResponse.json({ error: 'Link reset password tidak valid' }, { status: 404 })
  }

  if (user.inviteExpiry && user.inviteExpiry < new Date()) {
    return NextResponse.json({ error: 'Link reset password sudah kedaluwarsa' }, { status: 410 })
  }

  const hashedPassword = await hash(password, 12)

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      inviteToken: null,
      inviteExpiry: null,
      isActive: true,
    },
  })

  return NextResponse.json({ success: true })
}
