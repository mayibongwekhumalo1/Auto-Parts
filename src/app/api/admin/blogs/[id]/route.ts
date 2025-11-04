import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/utils/database';
import Blog from '@/models/Blog';
import User from '@/models/User';
import { getAdminUserFromRequest } from '@/utils/auth';

// GET /api/admin/blogs/[id] - Get a specific blog (Admin only)
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

    const blog = await Blog.findById(params.id).populate('author', 'name email');

    if (!blog) {
      return NextResponse.json(
        { error: 'Blog not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(blog);
  } catch (error) {
    console.error('Error fetching blog:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/blogs/[id] - Update a blog (Admin only)
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

    const { title, content, excerpt, slug, tags, featuredImage, published } = await request.json();

    // Validate input
    if (!title || !content || !excerpt) {
      return NextResponse.json(
        { error: 'Please provide title, content, and excerpt' },
        { status: 400 }
      );
    }

    // Check if slug already exists (excluding current blog)
    if (slug) {
      const existingBlog = await Blog.findOne({ slug, _id: { $ne: params.id } });
      if (existingBlog) {
        return NextResponse.json(
          { error: 'Blog with this slug already exists' },
          { status: 400 }
        );
      }
    }

    const updateData: Partial<{
      title: string;
      content: string;
      excerpt: string;
      slug: string;
      tags: string[];
      featuredImage: string;
      published: boolean;
    }> = {
      title,
      content,
      excerpt,
      tags: tags || [],
      featuredImage,
      published: published || false
    };

    if (slug) {
      updateData.slug = slug;
    }

    const blog = await Blog.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true }
    ).populate('author', 'name email');

    if (!blog) {
      return NextResponse.json(
        { error: 'Blog not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(blog);
  } catch (error) {
    console.error('Error updating blog:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/blogs/[id] - Delete a blog (Admin only)
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

    const blog = await Blog.findByIdAndDelete(params.id);

    if (!blog) {
      return NextResponse.json(
        { error: 'Blog not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}