import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const filePath = path.join(process.cwd(), 'data', 'ai-usage.json');
  const raw = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(raw);
  return NextResponse.json(data, {
    headers: { 'Cache-Control': 'no-store' },
  });
}
