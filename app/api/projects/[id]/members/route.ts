import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { id } = await params
  const { userId, role } = await req.json()

  const member = await prisma.projectMember.create({
    data: { projectId: id, userId, role },
    include: { user: { select: { id: true, name: true, email: true, role: true } } },
  })

  return NextResponse.json(member, { status: 201 })
}
