import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/auth";
import prisma from "@/app/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const forumId = params.id;
    const userId = session.user.id;

    const forum = await prisma.forum.findUnique({
      where: { id: forumId },
    });

    if (!forum) {
      return NextResponse.json(
        { success: false, error: "Forum not found" },
        { status: 404 }
      );
    }

    //if like already exists
    const existingLike = await prisma.like.findUnique({
      where: {
        forumId_userId: {
          forumId,
          userId,
        },
      },
    });

    let result;
    if (existingLike) {
      await prisma.like.delete({
        where: {
          forumId_userId: {
            forumId,
            userId,
          },
        },
      });
      result = { liked: false };
    } else {
      await prisma.like.create({
        data: {
          forumId,
          userId,
        },
      });
      result = { liked: true };
    }

    //updated like count
    const likeCount = await prisma.like.count({
      where: { forumId },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...result,
        likeCount,
      },
    });
  } catch (error) {
    console.error("Error toggling like:", error);
    return NextResponse.json(
      { success: false, error: "Failed to toggle like" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const forumId = params.id;
    
    // total like count
    const likeCount = await prisma.like.count({
      where: { forumId },
    });
    
    let userHasLiked = false;
    
    if (session?.user?.id) {
      const existingLike = await prisma.like.findUnique({
        where: {
          forumId_userId: {
            forumId,
            userId: session.user.id,
          },
        },
      });
      
      userHasLiked = !!existingLike;
    }
    
    return NextResponse.json({
      success: true,
      data: {
        liked: userHasLiked,
        likeCount,
      },
    });
  } catch (error) {
    console.error("Error getting like status:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get like status" },
      { status: 500 }
    );
  }
}