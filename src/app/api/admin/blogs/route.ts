import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/utils/database';
import Blog from '@/models/Blog';
import User from '@/models/User';
import { getAdminUserFromRequest } from '@/utils/auth';

// GET /api/admin/blogs - Get all blogs (Admin only)
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

    const blogs = await Blog.find({})
      .populate('author', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json(blogs);
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/admin/blogs - Create a new blog (Admin only)
export async function POST(request: NextRequest) {
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

    // Generate slug if not provided
    let finalSlug = slug;
    if (!finalSlug) {
      finalSlug = title
        .toLowerCase()
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .trim();
    }

    // Check if slug already exists
    const existingBlog = await Blog.findOne({ slug: finalSlug });
    if (existingBlog) {
      return NextResponse.json(
        { error: 'Blog with this slug already exists' },
        { status: 400 }
      );
    }

    const blog = await Blog.create({
      title,
      content,
      excerpt,
      author: userId,
      slug: finalSlug,
      tags: tags || [],
      featuredImage,
      published: published || false
    });

    const populatedBlog = await Blog.findById(blog._id).populate('author', 'name email');

    return NextResponse.json(populatedBlog, { status: 201 });
  } catch (error) {
    console.error('Error creating blog:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}