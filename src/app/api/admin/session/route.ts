import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/admin-auth'

// POST: create session if key matches; DELETE: clear session; GET: check
export async function POST(req: NextRequest) {
	try {
		const { key } = await req.json();
		if (!key || key !== process.env.ADMIN_API_KEY) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}
		const res = NextResponse.json({ ok: true });
		res.cookies.set('admin_session', '1', {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			path: '/',
			maxAge: 60 * 60 * 12, // 12h
		});
		return res;
	} catch (e) {
		return NextResponse.json({ error: 'Bad request' }, { status: 400 });
	}
}

export async function DELETE() {
	const res = NextResponse.json({ ok: true });
	res.cookies.set('admin_session', '', { path: '/', maxAge: 0 });
	return res;
}

export async function GET(req: NextRequest) {
	return NextResponse.json({ authenticated: isAdminAuthenticated(req) })
}
