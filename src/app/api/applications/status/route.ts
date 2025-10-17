import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Public endpoint to check application status by email (lightweight)
export async function GET(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url)
		const email = searchParams.get('email')
		if (!email) {
			return NextResponse.json({ error: 'Email is required' }, { status: 400 })
		}
		const app = await db.betaApplication.findFirst({
			where: { email },
			select: { id: true, status: true, position: true, createdAt: true }
		})
		if (!app) return NextResponse.json({ found: false })
		return NextResponse.json({ found: true, ...app })
	} catch (e) {
		console.error('Status check error:', e)
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
	}
}
