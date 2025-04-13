import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from '@/app/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const forums = await prisma.forum.findMany({
      where: {
        userId: session.user.id, 
      },
      include: {
        user: { 
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    const transformedForums = forums.map(forum => ({
      ...forum,
      author: forum.user, 
    }));
    
    return NextResponse.json(transformedForums);
  } catch (error) {
    console.error('Error fetching user forums:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user forums' },
      { status: 500 }
    );
  }
}