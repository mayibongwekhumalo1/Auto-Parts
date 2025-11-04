import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/utils/database';
import Comment from '@/models/Comment';
import User from '@/models/User';
import { getAdminUserFromRequest } from '@/utils/auth';

// GET /api/admin/comments - Get all comments (Admin only)
export async function GET(request: NextRequest) {
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

    const comments = await Comment.find({})
      .populate('author', 'name email')
      .populate('blog', 'title slug')
      .populate('parentComment', 'content')
      .sort({ createdAt: -1 });

    return NextResponse.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/comments/bulk-approve - Bulk approve comments (Admin only)
export async function PUT(request: NextRequest) {
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

    const { commentIds, approved } = await request.json();

    // Validate input
    if (!commentIds || !Array.isArray(commentIds) || commentIds.length === 0) {
      return NextResponse.json(
        { error: 'Please provide commentIds array' },
        { status: 400 }
      );
    }

    const result = await Comment.updateMany(
      { _id: { $in: commentIds } },
      { approved: approved || false, updatedAt: new Date() }
    );

    return NextResponse.json({
      message: `Updated ${result.modifiedCount} comments`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error updating comments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}