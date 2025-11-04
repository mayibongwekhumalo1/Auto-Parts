import { logout } from '../../../../controllers/userController';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  return logout(request);
}