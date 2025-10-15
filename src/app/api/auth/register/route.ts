import { register } from '../../../../controllers/userController';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  return register(request);
}