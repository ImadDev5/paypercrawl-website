import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
	if (!isAdminAuthenticated(req)) {
		return NextResponse.json({ authenticated: false }, { status: 401 });
	}
	return NextResponse.json({ authenticated: true });
}
