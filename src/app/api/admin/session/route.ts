import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminSessionToken, createAdminSessionToken } from '@/lib/admin-session'
import { rateLimit, getClientIP } from '@/lib/rate-limit'

// POST: create session if key matches; DELETE: clear session; GET: check
export async function POST(req: NextRequest) {
	// Rate limit: 5 attempts per minute per IP
	const ip = getClientIP(req.headers);
	const rl = rateLimit(`admin-login:${ip}`, 5, 60_000);
	if (!rl.success) {
		return NextResponse.json(
			{ error: 'Too many login attempts. Try again later.' },
			{ status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
		);
	}
	try {
		const { key } = await req.json();
		if (!key || key !== process.env.ADMIN_API_KEY) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}
		const token = createAdminSessionToken();
		const res = NextResponse.json({ ok: true });
		res.cookies.set('admin_session', token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict',
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
	const token = req.cookies.get('admin_session')?.value;
	const authenticated = token ? verifyAdminSessionToken(token) : false;
	return NextResponse.json({ authenticated });
}
