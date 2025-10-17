import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
	_req: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
			const app = (await db.betaApplication.findUnique({
				where: { id: params.id },
			})) as any
			if (!app || !app.resumeData) {
			return new NextResponse('Not found', { status: 404 })
		}
			const mime = app.resumeMimeType || app.resumeFileType || 'application/pdf'
			const filename = app.resumeFilename || app.resumeFileName || 'resume.pdf'
			return new NextResponse(Buffer.from(app.resumeData as any), {
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
