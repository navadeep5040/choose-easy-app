import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

mongoose.set('bufferCommands', false);

const MONGODB_URI = process.env.MONGODB_URI;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let cached = (global as any).mongoose;

if (!cached) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cached = (global as any).mongoose = { conn: null, promise: null };
}

let mocksApplied = false;

function setupMongooseMocks() {
  if (mocksApplied) return;
  mocksApplied = true;

  console.warn("[MongoDB Mock] Connection failed or unresolvable. Initializing in-memory mock fallback.");

  const store: Record<string, any[]> = {
    users: [] as any[],
    mentors: [] as any[],
    courses: [] as any[],
    bookings: [] as any[],
    payments: [] as any[],
    notifications: [] as any[],
    pricingplans: [] as any[],
    chatsessions: [] as any[],
    careers: [] as any[],
    reviews: [] as any[],
  };

  // Create seed users
  const adminHash = bcrypt.hashSync('Admin@123', 10);
  const mentorHash = bcrypt.hashSync('Mentor@123', 10);
  const studentHash = bcrypt.hashSync('Student@123', 10);

  const adminUser = {
    _id: new mongoose.Types.ObjectId(),
    email: 'admin@chooseeasy.ai',
    password: adminHash,
    name: 'Alex Morgan',
    role: 'admin',
    createdAt: new Date(),
  };

  const mentorUser = {
    _id: new mongoose.Types.ObjectId(),
    email: 'mentor@chooseeasy.ai',
    password: mentorHash,
    name: 'Sarah Johnson',
    role: 'mentor',
    createdAt: new Date(),
  };

  const studentUser = {
    _id: new mongoose.Types.ObjectId(),
    email: 'student@chooseeasy.ai',
    password: studentHash,
    name: 'Navadeep Kumar',
    role: 'user',
    createdAt: new Date(),
  };

  store.users.push(adminUser, mentorUser, studentUser);

  // Mentor profile
  const mentorProfile = {
    _id: new mongoose.Types.ObjectId(),
    userId: mentorUser._id,
    name: 'Sarah Johnson',
    bio: 'Expert AI and Software Engineering mentor.',
    subjects: ['Technology'],
    domain: 'Software Engineering',
    matchScore: '99%',
    status: 'Available',
    availability: [
      { day: 'Monday', startTime: '09:00', endTime: '11:00' },
      { day: 'Wednesday', startTime: '13:00', endTime: '15:00' },
      { day: 'Friday', startTime: '15:00', endTime: '17:00' }
    ],
    hourlyRate: 50,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCTNqAD1MfR5-BlRFrNni7hp3_hW-BHLKyDrejzDN5mIjK6mid6w7UMmaYLEeHuP45RsqWR53jMe5oZkLaddAzJi0ct1j75xMV2C5JPYAhCDCd1hd2y5eJ0NQqv6781swV3vRpTv0WaY86DQ1BicN58iopEq2EO2NmNAUMwY-mM6L4uvM3nnxX07CtracYYtyjCSwnn0xUow9VH8upaIQAqPV9hkx-ri_sI_7NiXYvc96boLmIF8m3fWaXRYrkT3MQPVStfCuA3WAY',
    createdAt: new Date(),
  };
  store.mentors.push(mentorProfile);

  // Seed courses
  const courseTitles = [
    'Blockchain Fundamentals & Smart Contracts',
    'AI & Machine Learning Masterclass',
    'Cloud Architecture & DevOps Bootcamp',
    'Cybersecurity & Ethical Hacking'
  ];
  courseTitles.forEach((title, idx) => {
    store.courses.push({
      _id: new mongoose.Types.ObjectId(),
      title,
      description: 'Mock course description.',
      subject: 'Technology',
      price: 199 + idx * 50,
      duration: '8 Weeks',
      level: 'Intermediate',
      mentorIds: [mentorProfile._id],
      features: ['1-on-1 mentor review sessions'],
      isActive: true,
      createdAt: new Date(),
    });
  });

  // Dynamically load models to ensure schemas are registered
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const User = require('../models/User').default;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Mentor = require('../models/Mentor').default;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Course = require('../models/Course').default;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Booking = require('../models/Booking').default;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Payment = require('../models/Payment').default;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Notification = require('../models/Notification').default;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const PricingPlan = require('../models/PricingPlan').default;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Career = require('../models/Career').default;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ChatSession = require('../models/ChatSession').default;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Review = require('../models/Review').default;

  function toDoc(model: any, data: any) {
    if (!data) return null;
    const doc = new model(data);
    doc._id = data._id || doc._id;
    return doc;
  }

  function getStoreKey(modelName: string): string {
    const name = modelName.toLowerCase();
    if (name.endsWith('y')) {
      return name.slice(0, -1) + 'ies';
    }
    return name + 's';
  }

  function matchesFilter(item: any, filter: any): boolean {
    if (!filter) return true;
    for (const key of Object.keys(filter)) {
      const val = filter[key];
      const itemVal = item[key];
      
      if (key === '_id' || key === 'id') {
        const filterId = val?.toString();
        const itemId = itemVal?.toString() || item._id?.toString();
        if (val && typeof val === 'object' && '$in' in val) {
          const arr = val['$in'];
          if (Array.isArray(arr)) {
            if (!arr.map(x => x?.toString()).includes(itemId)) return false;
            continue;
          }
        }
        if (filterId !== itemId) return false;
        continue;
      }

      if (val && typeof val === 'object' && '$in' in val) {
        const arr = val['$in'];
        if (!Array.isArray(arr)) return false;
        const strArr = arr.map(x => x?.toString());
        if (!strArr.includes(itemVal?.toString())) return false;
        continue;
      }

      const valStr = val instanceof mongoose.Types.ObjectId ? val.toString() : val;
      const itemValStr = itemVal instanceof mongoose.Types.ObjectId ? itemVal.toString() : itemVal;
      
      if (typeof valStr === 'string' && typeof itemValStr === 'string' && key.toLowerCase() === 'email') {
        if (valStr.toLowerCase() !== itemValStr.toLowerCase()) return false;
      } else if (valStr !== itemValStr) {
        return false;
      }
    }
    return true;
  }

  // Intercept mongoose Query prototype exec
  const originalQueryExec = mongoose.Query.prototype.exec;
  mongoose.Query.prototype.exec = async function(this: any, ...args: any[]) {
    if (mocksApplied) {
      const modelName = this.model.modelName;
      const op = this.op;
      const filter = this.getFilter() || {};
      const update = this.getUpdate();
      
      const collectionName = getStoreKey(modelName);
      let storeList = store[collectionName];
      if (!storeList) {
        storeList = store[collectionName] = [];
      }

      console.warn(`[Mock Query] Intercepted ${modelName}.${op} with filter:`, JSON.stringify(filter));

      const matchedItems = storeList.filter((item: any) => matchesFilter(item, filter));

      if (op === 'find') {
        let result = matchedItems.map((item: any) => toDoc(this.model, item));
        
        const sortOptions = this.options.sort;
        if (sortOptions) {
          const sortKey = Object.keys(sortOptions)[0];
          const sortOrder = sortOptions[sortKey];
          result.sort((a: any, b: any) => {
            const valA = a[sortKey];
            const valB = b[sortKey];
            if (valA < valB) return sortOrder === -1 || sortOrder === 'desc' ? 1 : -1;
            if (valA > valB) return sortOrder === -1 || sortOrder === 'desc' ? -1 : 1;
            return 0;
          });
        }
        
        const limitOption = this.options.limit;
        if (typeof limitOption === 'number') {
          result = result.slice(0, limitOption);
        }

        return result;
      }

      if (op === 'findOne') {
        const item = matchedItems[0];
        return item ? toDoc(this.model, item) : null;
      }

      if (op === 'findById') {
        const targetId = filter._id || filter;
        const item = storeList.find((x: any) => x._id.toString() === targetId.toString());
        return item ? toDoc(this.model, item) : null;
      }

      if (op === 'countDocuments') {
        return matchedItems.length;
      }

      if (op === 'updateMany' || op === 'updateOne') {
        let modifiedCount = 0;
        const updatePayload = update ? (update.$set || update) : {};
        matchedItems.forEach((item: any) => {
          const idx = storeList.findIndex((x: any) => x._id.toString() === item._id.toString());
          if (idx !== -1) {
            storeList[idx] = { ...storeList[idx], ...updatePayload };
            modifiedCount++;
          }
        });
        return { acknowledged: true, modifiedCount, matchedCount: matchedItems.length };
      }

      if (op === 'deleteOne' || op === 'deleteMany') {
        let deletedCount = 0;
        matchedItems.forEach((item: any) => {
          const idx = storeList.findIndex((x: any) => x._id.toString() === item._id.toString());
          if (idx !== -1) {
            storeList.splice(idx, 1);
            deletedCount++;
          }
        });
        return { acknowledged: true, deletedCount };
      }

      if (op === 'findOneAndUpdate') {
        const item = matchedItems[0];
        if (item) {
          const updatePayload = update ? (update.$set || update) : {};
          const idx = storeList.findIndex((x: any) => x._id.toString() === item._id.toString());
          if (idx !== -1) {
            storeList[idx] = { ...storeList[idx], ...updatePayload };
            return toDoc(this.model, storeList[idx]);
          }
        }
        return null;
      }

      return matchedItems.map((item: any) => toDoc(this.model, item));
    }
    return originalQueryExec.apply(this, args as any);
  };

  // Intercept Document prototype save
  const originalModelSave = mongoose.Model.prototype.save;
  mongoose.Model.prototype.save = async function(this: any, ...args: any[]) {
    if (mocksApplied) {
      const modelName = this.constructor.modelName;
      const collectionName = getStoreKey(modelName);
      let storeList = store[collectionName];
      if (!storeList) {
        storeList = store[collectionName] = [];
      }
      
      console.warn(`[Mock Save] Intercepted ${modelName}.save() for ID:`, this._id);
      
      const idx = storeList.findIndex((x: any) => x._id.toString() === this._id.toString());
      if (idx !== -1) {
        storeList[idx] = { ...storeList[idx], ...this.toObject() };
      } else {
        storeList.push(this.toObject());
      }
      return this;
    }
    return originalModelSave.apply(this, args as any);
  };

  // Intercept Model.create
  const originalModelCreate = mongoose.Model.create;
  // @ts-ignore
  mongoose.Model.create = async function(this: any, doc: any, ...args: any[]) {
    if (mocksApplied) {
      const modelName = this.modelName;
      const collectionName = getStoreKey(modelName);
      let storeList = store[collectionName];
      if (!storeList) {
        storeList = store[collectionName] = [];
      }
      
      const processSingle = async (item: any) => {
        const hash = item.password 
          ? (item.password.startsWith('$2a$') ? item.password : bcrypt.hashSync(item.password, 10)) 
          : '';
        const newItem = {
          _id: item._id || new mongoose.Types.ObjectId(),
          ...item,
          password: hash,
          createdAt: new Date(),
        };
        storeList.push(newItem);
        return toDoc(this, newItem);
      };

      if (Array.isArray(doc)) {
        const results = [];
        for (const item of doc) {
          results.push(await processSingle(item));
        }
        return results;
      } else {
        return await processSingle(doc);
      }
    }
    return originalModelCreate.apply(this, [doc, ...args] as any);
  };

  // Intercept Model.insertMany
  const originalModelInsertMany = mongoose.Model.insertMany;
  // @ts-ignore
  mongoose.Model.insertMany = async function(this: any, docs: any[], ...args: any[]) {
    if (mocksApplied) {
      const modelName = this.modelName;
      const collectionName = getStoreKey(modelName);
      let storeList = store[collectionName];
      if (!storeList) {
        storeList = store[collectionName] = [];
      }
      const docsToInsert = Array.isArray(docs) ? docs : [docs];
      const inserted = docsToInsert.map((d: any) => {
        const item = {
          _id: d._id || new mongoose.Types.ObjectId(),
          ...d,
        };
        storeList.push(item);
        return toDoc(this, item);
      });
      return inserted;
    }
    return originalModelInsertMany.apply(this, [docs, ...args] as any);
  };
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

    cached.promise = mongoose.connect(connectionUri, opts).then((mongooseInstance) => {
      return mongooseInstance;
    });
  }
  
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    if (process.env.VERCEL) {
      setupMongooseMocks();
      cached.conn = mongoose.connection;
      return cached.conn;
    }
    throw e;
  }

  return cached.conn;
}

export default connectToDatabase;
