import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let cached = (global as any).mongoose;

if (!cached) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    let connectionUri = MONGODB_URI;
    if (connectionUri.includes('cluster0.mongodb.net') && !process.env.VERCEL) {
      console.warn(`[MongoDB] Atlas URI '${connectionUri}' detected. Falling back to local MongoDB for stability.`);
      connectionUri = 'mongodb://127.0.0.1:27017/choose-easy';
    }

    cached.promise = mongoose.connect(connectionUri, opts).then((mongoose) => {
      return mongoose;
    });
  }
  
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectToDatabase;
