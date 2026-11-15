/**
 * Contact Model (Mongoose Schema)
 * Fields: name, email, subject, message, createdAt, ip
 */
const { mongoose } = require('../config/db');

let ContactModel = null;

if (mongoose) {
  const contactSchema = new mongoose.Schema(
    {
      name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters']
      },
      email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        lowercase: true,
        match: [
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          'Please provide a valid email address'
        ]
      },
      subject: {
        type: String,
        required: [true, 'Subject is required'],
        trim: true,
        maxlength: [150, 'Subject cannot exceed 150 characters']
      },
      message: {
        type: String,
        required: [true, 'Message content is required'],
        trim: true,
        maxlength: [3000, 'Message cannot exceed 3000 characters']
      },
      ip: {
        type: String,
        default: 'unknown'
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    },
    {
      timestamps: true
    }
  );

  ContactModel = mongoose.models.Contact || mongoose.model('Contact', contactSchema);
}

module.exports = ContactModel;
