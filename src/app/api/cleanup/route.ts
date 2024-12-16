import { readdir, unlink } from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    const directory = path.join(process.cwd(), 'public');
    const files = await readdir(directory);
    const now = Date.now();
    const timeout = 5 * 60 * 1000;

    for (const file of files) {
      if (file.startsWith('aggregated_') && file.endsWith('.csv')) {
        const filePath = path.join(directory, file);
        const fileTimestamp = parseInt(file.split('_')[1]);
        
        if (now - fileTimestamp > timeout) {
          await unlink(filePath);
        }
      }
    }
    
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ success: false, error: error });
  }
}