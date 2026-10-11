import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { id } = await params
  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const token = crypto.randomUUID()
  const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 jam

  await prisma.user.update({
    where: { id },
    data: {
      inviteToken: token,
      inviteExpiry: expiry,
    },
  })

  const baseUrl = process.env.APP_URL || 'http://localhost:3000'
  const resetUrl = `${baseUrl}/reset-password/${token}`

  // Kirim WhatsApp jika ada nomor HP
  if (user.phone) {
    try {
      const { sendWhatsApp } = await import('@/lib/whatsapp')
      const msg = `Halo ${user.name},\n\nBerikut adalah link untuk mengatur ulang password akun Anda di WeballCreative Project Tracker:\n${resetUrl}\n\nLink ini berlaku selama 24 jam. Abaikan jika Anda tidak meminta reset password.`
      await sendWhatsApp(user.phone, msg)
    } catch (err) {
      console.error('Failed to send WhatsApp reset link:', err)
    }
  }

  return NextResponse.json({
    success: true,
    resetUrl,
    phone: user.phone,
  })
}
