import mongoose, { Document, Schema } from "mongoose";

export interface IApplicationComment extends Document {
  applicationId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  userRole: 'user' | 'admin' | 'agent';
  userName: string;
  message: string;
  isInternal: boolean; // admin/agent only comments
  attachments?: [{
    url: string;
    name: string;
  }];
  createdAt: Date;
  updatedAt: Date;
}

const ApplicationCommentSchema = new Schema<IApplicationComment>(
  {
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'VisaApplication',
      required: true,
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    userRole: {
      type: String,
      enum: ['user', 'admin', 'agent'],
      required: true
    },
    userName: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    isInternal: {
      type: Boolean,
      default: false
    },
    attachments: [{
      url: { type: String, required: true },
      name: { type: String, required: true }
    }]
  },
  {
    timestamps: true
  }
);

// Prevent model overwrite issue in dev
const ApplicationComment = mongoose.models.ApplicationComment || mongoose.model<IApplicationComment>('ApplicationComment', ApplicationCommentSchema);
export default ApplicationComment;
