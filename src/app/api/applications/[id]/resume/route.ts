import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export async function GET(
	_req: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const sb = getSupabaseAdmin()
		const { data: app } = await sb
			.from('beta_applications')
			.select('resumeData, resumeMimeType, resumeFilename')
			.eq('id', params.id)
			.maybeSingle()

		if (!app || !app.resumeData) {
			return new NextResponse('Not found', { status: 404 })
		}
		const mime = app.resumeMimeType || 'application/pdf'
		const filename = app.resumeFilename || 'resume.pdf'
		// resumeData may be stored as base64 string via Supabase
		const buf = typeof app.resumeData === 'string'
			? Buffer.from(app.resumeData, 'base64')
			: Buffer.from(app.resumeData as any)
		return new NextResponse(buf, {
			status: 200,
			headers: {
				'Content-Type': mime,
				'Content-Disposition': `inline; filename="${filename}"`,
				'Cache-Control': 'private, max-age=0, must-revalidate',
			},
		})
	} catch (e) {
		console.error('Resume fetch error:', e)
		return new NextResponse('Internal server error', { status: 500 })
	}
}
