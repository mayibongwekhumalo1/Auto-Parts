import mongoose, { Document, Schema } from 'mongoose';

export interface IComment extends Document {
  content: string;
  author: mongoose.Types.ObjectId;
  authorName: string;
  authorEmail: string;
  blog: mongoose.Types.ObjectId;
  parentComment?: mongoose.Types.ObjectId;
  replies: mongoose.Types.ObjectId[];
  approved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema: Schema = new Schema({
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  authorName: {
    type: String,
    required: true,
    trim: true
  },
  authorEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  blog: {
    type: Schema.Types.ObjectId,
    ref: 'Blog',
    required: true
  },
  parentComment: {
    type: Schema.Types.ObjectId,
    ref: 'Comment'
  },
  replies: [{
    type: Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  approved: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient queries
CommentSchema.index({ blog: 1, approved: 1, createdAt: -1 });
CommentSchema.index({ parentComment: 1 });

export default mongoose.models.Comment || mongoose.model<IComment>('Comment', CommentSchema);