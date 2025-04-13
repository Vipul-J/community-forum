import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/auth";
import prisma from "@/app/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const forumId = params.id;

    const forum = await prisma.forum.findUnique({
      where: { id: forumId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        _count: {
          select: {
            likes: true,
          },
        },
      },
    });

    if (!forum) {
      return NextResponse.json(
        { success: false, error: "Forum not found" },
        { status: 404 }
      );
    }

    // if current user has liked this forum
    const session = await getServerSession(authOptions);
    let userHasLiked = false;

    if (session?.user?.id) {
      const like = await prisma.like.findUnique({
        where: {
          forumId_userId: {
            forumId: forum.id,
            userId: session.user.id,
          },
        },
      });
      userHasLiked = !!like;
    }

    return NextResponse.json({
      success: true,
      data: {
        ...forum,
        userHasLiked,
      },
    });
  } catch (error) {
    console.error("Error fetching forum:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch forum" },
      { status: 500 }
    );
  }
}

export async function PATCH(
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
    const { title, description, tags } = await request.json();

    // if forum exists and user is the owner
    const forum = await prisma.forum.findUnique({
      where: { id: forumId },
    });

    if (!forum) {
      return NextResponse.json(
        { success: false, error: "Forum not found" },
        { status: 404 }
      );
    }

    if (forum.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "You can only edit your own forums" },
        { status: 403 }
      );
    }

    const updatedForum = await prisma.forum.update({
      where: { id: forumId },
      data: {
        title: title || forum.title,
        description: description || forum.description,
        tags: tags || forum.tags,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: updatedForum });
  } catch (error) {
    console.error("Error updating forum:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update forum" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // if forum exists and user is the owner
    const forum = await prisma.forum.findUnique({
      where: { id: forumId },
    });

    if (!forum) {
      return NextResponse.json(
        { success: false, error: "Forum not found" },
        { status: 404 }
      );
    }

    if (forum.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "You can only delete your own forums" },
        { status: 403 }
      );
    }

    await prisma.forum.delete({
      where: { id: forumId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting forum:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete forum" },
      { status: 500 }
    );
  }
}