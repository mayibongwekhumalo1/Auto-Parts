 import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '../utils/database';
import User from '../models/User';
import { setAuthCookie, generateToken, clearAuthCookie } from '../utils/auth';
import * as jwt from 'jsonwebtoken';

// POST /api/auth/register - Register a new user
export async function register(request: NextRequest) {
  try {
    await connectToDatabase();

    const { name, email, password, adminSecretCode } = await request.json();

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Please provide name, email, and password' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Determine role
    let role = 'customer';
    if (adminSecretCode) {
      const ADMIN_SECRET_CODE = process.env.ADMIN_SECRET_CODE;
      if (adminSecretCode === ADMIN_SECRET_CODE) {
        role = 'admin';
      } else {
        return NextResponse.json(
          { error: 'Invalid admin secret code' },
          { status: 400 }
        );
      }
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role
    });

    // Generate JWT token and set httpOnly cookie
    const token = generateToken({
      _id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role
    });

    // Remove password from response
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    };

    const response = NextResponse.json({
      user: userResponse
    }, { status: 201 });

    setAuthCookie(response, token);
    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/auth/login - Login user
export async function login(request: NextRequest) {
  try {
    await connectToDatabase();

    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Please provide email and password' },
        { status: 400 }
      );
    }

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate JWT token and set httpOnly cookie
    const token = generateToken({
      _id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role
    });

    // Remove password from response
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    };

    const response = NextResponse.json({
      user: userResponse
    });

    setAuthCookie(response, token);
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/auth/profile - Get user profile (protected route)
export async function getProfile(request: NextRequest) {
  try {
    await connectToDatabase();

    // Get user from httpOnly cookie instead of Authorization header
    const token = request.cookies.get('auth_token')?.value;
    console.log('Profile request - token present:', !!token);

    if (!token) {
      console.log('No auth token found in cookies');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify JWT token to get user ID
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
      console.log('JWT decoded successfully:', decoded);
    } catch (jwtError) {
      console.log('JWT verification failed:', jwtError);
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const user = await User.findById(decoded.userId);
    console.log('User lookup result:', user ? 'found' : 'not found');

    if (!user) {
      console.log('User not found for userId:', decoded.userId);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    };

    console.log('Profile response for user:', user.email, 'role:', user.role);
    return NextResponse.json({ user: userResponse });
  } catch (error) {
    console.error('Profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/auth/logout - Logout user
export async function logout(request: NextRequest) {
  try {
    const response = NextResponse.json({ message: 'Logged out successfully' });
    clearAuthCookie(response);
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}