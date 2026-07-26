import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    const adminUser = process.env.ADMIN_USERNAME || 'kanha';
    const adminPassHash = process.env.ADMIN_PASSWORD_HASH;
    const fallbackPlainPass = process.env.ADMIN_PASSWORD || 'Krishna@987';

    // Verify username
    if (username !== adminUser) {
      return NextResponse.json({ authenticated: false, message: 'Invalid credentials' }, { status: 401 });
    }

    // Verify password (using secure PBKDF2 hash comparison or fallback plain text)
    if (adminPassHash) {
      const [salt, iterationsStr, hash] = adminPassHash.split(':');
      const iterations = parseInt(iterationsStr, 10);
      const verifyHash = crypto.pbkdf2Sync(password, salt, iterations, 64, 'sha512').toString('hex');
      if (verifyHash === hash) {
        return NextResponse.json({ authenticated: true });
      }
    } else {
      if (password === fallbackPlainPass) {
        return NextResponse.json({ authenticated: true });
      }
    }

    return NextResponse.json({ authenticated: false, message: 'Invalid credentials' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ authenticated: false, message: 'Server error' }, { status: 500 });
  }
}
