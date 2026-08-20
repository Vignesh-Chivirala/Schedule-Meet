import mongoose from 'mongoose';

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
    };

    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/tasktracker';

    cached.promise = mongoose.connect(uri, opts).then((m) => {
      console.log(`MongoDB Connected: ${m.connection.host}`);
      return m;
    }).catch(async (error) => {
      cached.promise = null;
      console.error(`MongoDB Connection Error: ${error.message}`);
      
      // Memory server fallback for local development if local mongo daemon is off
      if (!process.env.VERCEL && process.env.NODE_ENV !== 'production') {
        try {
          const { MongoMemoryServer } = await import('mongodb-memory-server');
          const mongod = await MongoMemoryServer.create();
          const memUri = mongod.getUri();
          return await mongoose.connect(memUri);
        } catch (memErr) {
          console.error("Memory server fallback failed:", memErr.message);
        }
      }
      throw error;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
};

export default connectDB;