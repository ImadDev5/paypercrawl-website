import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
	try {
		const { key } = await req.json();
		if (key !== process.env.ADMIN_API_KEY) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}
		return NextResponse.json({ ok: true });
	} catch {
		return NextResponse.json({ error: "Bad request" }, { status: 400 });
	}
}
