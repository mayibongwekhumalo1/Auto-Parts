import mongoose, { Document, Schema } from 'mongoose';

export interface ICart extends Document {
  user: mongoose.Types.ObjectId;
  items: {
    product: mongoose.Types.ObjectId;
    name: string;
    price: number;
    quantity: number;
    image?: string;
  }[];
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

const CartSchema: Schema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [{
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      max: 99
    },
    image: {
      type: String
    }
  }],
  totalAmount: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  }
}, {
  timestamps: true
});

// Calculate total amount before saving
CartSchema.pre('save', function(this: ICart, next: (error?: Error) => void) {
  const total = this.items.reduce((sum: number, item: { price: number; quantity: number }) => {
    return sum + (item.price * item.quantity);
  }, 0);
  this.totalAmount = total;
  next();
});


// Index for efficient queries
CartSchema.index({ user: 1 });

export default mongoose.models.Cart || mongoose.model<ICart>('Cart', CartSchema);