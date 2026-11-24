import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    message: 'API 𝔊𝔲𝔩𝔩𝔞𝔯𝔱 𝔏𝔢𝔱𝔱𝔢𝔯𝔦𝔫𝔤 / 𝔓𝔯𝔢𝔱𝔬 𝔢 𝔠𝔦𝔫𝔷𝔞 🇧🇷 online!',
    status: 'ONLINE',
    version: '1.0.0',
  });
}
