import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      members: { include: { user: { select: { id: true, name: true, email: true, avatar: true, role: true } } } },
      _count: { select: { issues: true } },
      createdBy: { select: { id: true, name: true } },
    },
  })

  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Check access
  if (session.user.role !== 'ADMIN') {
    const isMember = project.members.some(m => m.userId === session.user.id)
    if (!isMember) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return NextResponse.json(project)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { id } = await params
  const body = await req.json()
  const data: Record<string, any> = {}
  if (body.name !== undefined) data.name = body.name
  if (body.description !== undefined) data.description = body.description
  if (body.status !== undefined) data.status = body.status

  const project = await prisma.project.update({ where: { id }, data })
  return NextResponse.json(project)
}
