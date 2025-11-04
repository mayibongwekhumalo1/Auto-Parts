import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/utils/database';
import Comment from '@/models/Comment';
import User from '@/models/User';
import { getAdminUserFromRequest } from '@/utils/auth';

// GET /api/admin/comments/[id] - Get a specific comment (Admin only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();

    const userId = await getAdminUserFromRequest(request);

    // Check if user is admin
    const adminUser = await User.findById(userId);
    if (!adminUser || adminUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const comment = await Comment.findById(params.id)
      .populate('author', 'name email')
      .populate('blog', 'title slug')
      .populate('parentComment', 'content')
      .populate('replies', 'content approved');

    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(comment);
  } catch (error) {
    console.error('Error fetching comment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/comments/[id] - Update a comment (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();

    const userId = await getAdminUserFromRequest(request);

    // Check if user is admin
    const adminUser = await User.findById(userId);
    if (!adminUser || adminUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { content, approved } = await request.json();

    const updateData: Partial<{
      content: string;
      approved: boolean;
      updatedAt: Date;
    }> = {
      updatedAt: new Date()
    };

    if (content !== undefined) {
      updateData.content = content;
    }

    if (approved !== undefined) {
      updateData.approved = approved;
    }

    const comment = await Comment.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true }
    )
      .populate('author', 'name email')
      .populate('blog', 'title slug')
      .populate('parentComment', 'content')
      .populate('replies', 'content approved');

    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(comment);
  } catch (error) {
    console.error('Error updating comment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/comments/[id] - Delete a comment (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();

    const userId = await getAdminUserFromRequest(request);

    // Check if user is admin
    const adminUser = await User.findById(userId);
    if (!adminUser || adminUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const comment = await Comment.findByIdAndDelete(params.id);

    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }

    // Remove this comment from parent comment's replies array if it exists
    if (comment.parentComment) {
      await Comment.findByIdAndUpdate(
        comment.parentComment,
        { $pull: { replies: comment._id } }
      );
    }

    return NextResponse.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}