import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createNotification } from '@/lib/notifications'
import { formatStatusChanged } from '@/lib/whatsapp'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; issueId: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { issueId } = await params

  const issue = await prisma.issue.findUnique({
    where: { id: issueId },
    include: {
      createdBy: { select: { id: true, name: true, avatar: true } },
      assignedTo: { select: { id: true, name: true, avatar: true } },
      comments: {
        include: { author: { select: { id: true, name: true, avatar: true } } },
        orderBy: { createdAt: 'asc' },
      },
      activities: {
        include: { user: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'asc' },
      },
      project: { select: { id: true, name: true } },
    },
  })

  if (!issue) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json(issue)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; issueId: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, issueId } = await params
  const body = await req.json()

  const oldIssue = await prisma.issue.findUnique({
    where: { id: issueId },
    include: { project: { select: { name: true } }, createdBy: true },
  })
  if (!oldIssue) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const data: Record<string, any> = {}
  if (body.status !== undefined) data.status = body.status
  if (body.priority !== undefined) data.priority = body.priority
  if (body.title !== undefined) data.title = body.title
  if (body.description !== undefined) data.description = body.description
  if (body.assignedToId !== undefined) data.assignedToId = body.assignedToId

  const issue = await prisma.issue.update({
    where: { id: issueId },
    data,
    include: {
      createdBy: { select: { id: true, name: true } },
      assignedTo: { select: { id: true, name: true } },
      project: { select: { id: true, name: true } },
    },
  })

  // Track status change
  if (body.status && body.status !== oldIssue.status) {
    await prisma.issueActivity.create({
      data: {
        issueId,
        userId: session.user.id,
        action: 'STATUS_CHANGED',
        metadata: { oldStatus: oldIssue.status, newStatus: body.status },
      },
    })

    // Notify issue creator about status change
    if (oldIssue.createdById !== session.user.id) {
      await createNotification({
        userId: oldIssue.createdById,
        type: 'ISSUE_UPDATED',
        title: 'Issue Updated',
        message: `Issue #${issueId} status: ${oldIssue.status} → ${body.status}`,
        referenceId: issueId,
        referenceType: 'issue',
        waMessage: formatStatusChanged({
          projectName: oldIssue.project.name,
          issueId,
          issueTitle: oldIssue.title,
          oldStatus: oldIssue.status,
          newStatus: body.status,
          projectId: id,
          appUrl: process.env.APP_URL!,
        }),
      })
    }
  }

  // Track assignment
  if (body.assignedToId && body.assignedToId !== oldIssue.assignedToId) {
    await prisma.issueActivity.create({
      data: {
        issueId,
        userId: session.user.id,
        action: 'ASSIGNED',
        metadata: { assignedToId: body.assignedToId },
      },
    })

    const { formatIssueAssigned } = await import('@/lib/whatsapp')
    await createNotification({
      userId: body.assignedToId,
      type: 'ISSUE_ASSIGNED',
      title: 'New Issue Assigned',
      message: `You've been assigned issue: ${oldIssue.title}`,
      referenceId: issueId,
      referenceType: 'issue',
      waMessage: formatIssueAssigned({
        projectName: oldIssue.project.name,
        issueId,
        issueTitle: oldIssue.title,
        priority: issue.priority,
        projectId: id,
        appUrl: process.env.APP_URL!,
      }),
    })
  }

  return NextResponse.json(issue)
}
