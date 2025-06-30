import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    // Clear the token cookie
    cookies().delete('token');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error clearing cookie:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 