// src/app/api/check-users/route.ts
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const userCount = await prisma.user.count()
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true
      },
      take: 5
    })
    
    return NextResponse.json({
      success: true,
      userCount,
      sampleUsers: users,
      databaseConnected: true
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      databaseConnected: false
    })
  }
}