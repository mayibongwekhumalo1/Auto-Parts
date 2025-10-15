import { getProfile } from '../../../../controllers/userController';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  return getProfile(request);
}