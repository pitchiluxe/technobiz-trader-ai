import { NextRequest } from 'next/server'
import { sendSignalEmail } from '@/services/email/EmailService'
import type { TradeSetup } from '@/types/ai'

export async function POST(req: NextRequest) {
  try {
    const { to, setup, analysis, screenshotBase64 } = await req.json() as {
      to: string
      setup: TradeSetup
      analysis: string
      screenshotBase64?: string
    }

    if (!to || !setup || !analysis) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
      return Response.json({ error: 'Invalid email address' }, { status: 400 })
    }

    const result = await sendSignalEmail({ to, setup, analysis, screenshotBase64 })

    if (!result.success) {
      return Response.json({ error: result.error ?? 'Email failed to send' }, { status: 500 })
    }

    return Response.json({ success: true, message: `Signal sent to ${to}` })
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 })
  }
}
