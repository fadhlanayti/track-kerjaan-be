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
  const url = new URL(req.url)
  const status = url.searchParams.get('status')
  const priority = url.searchParams.get('priority')
  const assignedToId = url.searchParams.get('assignedToId')

  const where: any = { projectId: id }
  if (status) where.status = status
  if (priority) where.priority = priority
  if (assignedToId) where.assignedToId = assignedToId

  // Developer only sees assigned issues
  if (session.user.role === 'DEVELOPER') {
    where.assignedToId = session.user.id
  }

  const issues = await prisma.issue.findMany({
    where,
    include: {
      createdBy: { select: { id: true, name: true, avatar: true } },
      assignedTo: { select: { id: true, name: true, avatar: true } },
      _count: { select: { comments: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(issues)
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { title, description, priority, attachments } = await req.json()
  if (!title) return NextResponse.json({ error: 'Title required' }, { status: 400 })

  const issue = await prisma.issue.create({
    data: {
      projectId: id,
      title,
      description: description || null,
      priority: priority || 'MEDIUM',
      attachments: attachments || [],
      createdById: session.user.id,
    },
    include: {
      createdBy: { select: { id: true, name: true } },
    },
  })

  // Create activity
  await prisma.issueActivity.create({
    data: {
      issueId: issue.id,
      userId: session.user.id,
      action: 'CREATED',
    },
  })

  return NextResponse.json(issue, { status: 201 })
}
