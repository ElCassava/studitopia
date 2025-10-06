import { sql } from '@vercel/postgres'
import { NextResponse } from 'next/server'

export async function PUT(request: Request) {
  try {
    const { userId, styleId } = await request.json()

    await sql`
      UPDATE users 
      SET learning_style_id = ${styleId}
      WHERE id = ${userId}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Database error:', error)
    return new NextResponse('Database error', { status: 500 })
  }
}
