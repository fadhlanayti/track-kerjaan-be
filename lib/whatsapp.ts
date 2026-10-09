const WA_API_URL = process.env.WA_API_URL!
const WA_API_KEY = process.env.WA_API_KEY!

export async function sendWhatsApp(to: string, message: string): Promise<boolean> {
  try {
    const res = await fetch(`${WA_API_URL}/api/send/text`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${WA_API_KEY}`,
      },
      body: JSON.stringify({ to, message }),
    })
    return res.ok
  } catch {
    console.error('WA send failed to', to)
    return false
  }
}

export function formatIssueAssigned(data: {
  projectName: string
  issueId: string
  issueTitle: string
  priority: string
  projectId: string
  appUrl: string
}): string {
  return `[WeballCreative] Kamu di-assign issue baru:
Proyek: ${data.projectName}
Issue: #${data.issueId} ${data.issueTitle}
Priority: ${data.priority}
Buka: ${data.appUrl}/projects/${data.projectId}/issues/${data.issueId}`
}

export function formatStatusChanged(data: {
  projectName: string
  issueId: string
  issueTitle: string
  oldStatus: string
  newStatus: string
  projectId: string
  appUrl: string
}): string {
  return `[WeballCreative] Update proyek kamu:
Proyek: ${data.projectName}
Issue: #${data.issueId} ${data.issueTitle}
Status: ${data.oldStatus} → ${data.newStatus}
Buka: ${data.appUrl}/projects/${data.projectId}/issues/${data.issueId}`
}

export function formatNewComment(data: {
  authorName: string
  issueId: string
  issueTitle: string
  commentPreview: string
  projectId: string
  appUrl: string
}): string {
  return `[WeballCreative] Comment baru dari ${data.authorName}:
Issue: #${data.issueId} ${data.issueTitle}
"${data.commentPreview}"
Buka: ${data.appUrl}/projects/${data.projectId}/issues/${data.issueId}`
}

export function formatInvite(inviteUrl: string): string {
  return `[WeballCreative] Kamu diundang ke platform project management kami.
Klik link berikut untuk bergabung:
${inviteUrl}
Link berlaku 48 jam.`
}
