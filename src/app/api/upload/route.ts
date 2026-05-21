import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate type is an image
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save under public/uploads
    const ext = path.extname(file.name) || '.png';
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    
    // Ensure directory exists
    await mkdir(uploadDir, { recursive: true });
    
    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);
    
    const relativePath = `/uploads/${filename}`;
    return NextResponse.json({ success: true, url: relativePath });
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json({ error: 'File upload failed' }, { status: 500 });
  }
}
