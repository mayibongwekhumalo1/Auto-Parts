import { login } from '../../../../controllers/userController';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  return login(request);
}