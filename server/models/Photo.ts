import mongoose from 'mongoose';

const photoSchema = new mongoose.Schema({
  url: { type: String, required: true },
  public_id: { type: String, required: true },
  caption: { type: String, default: '' },
  category: { type: String, default: 'Uncategorized' },
  created_at: { type: Date, default: Date.now }
});

// Transform _id to id for frontend compatibility
photoSchema.set('toJSON', {
  transform: (document, returnedObject: any) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

export default mongoose.model('Photo', photoSchema);
