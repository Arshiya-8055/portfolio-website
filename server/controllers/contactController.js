/**
 * Contact Controller
 * Handles receiving, validating, rate-limiting, and storing contact messages.
 */
const { mongoose } = require('../config/db');
const ContactModel = require('../models/Contact');
let { inMemoryContacts } = require('../models/dataStore');

const isMongoLive = () => {
  return mongoose && mongoose.connection.readyState === 1 && ContactModel !== null;
};

// POST /api/contact
const submitContact = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;
    const clientIp = req.ip || req.headers['x-forwarded-for'] || (req.connection && req.connection.remoteAddress) || 'unknown';

    const contactEntry = {
      name,
      email,
      subject,
      message,
      ip: clientIp,
      createdAt: new Date()
    };

    if (isMongoLive()) {
      const saved = await ContactModel.create(contactEntry);
      return res.status(201).json({
        status: 'success',
        source: 'mongodb',
        message: 'Thank you, Shaik Arshiya Begum will review your message soon!',
        data: {
          id: saved._id,
          name: saved.name,
          createdAt: saved.createdAt
        }
      });
    }

    contactEntry._id = 'msg_' + Date.now();
    inMemoryContacts.unshift(contactEntry);

    return res.status(201).json({
      status: 'success',
      source: 'memory_store',
      message: 'Thank you, Shaik Arshiya Begum will review your message soon!',
      data: {
        id: contactEntry._id,
        name: contactEntry.name,
        createdAt: contactEntry.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/contact (Admin Only)
const getContacts = async (req, res, next) => {
  try {
    if (isMongoLive()) {
      const messages = await ContactModel.find().sort({ createdAt: -1 });
      return res.json({ status: 'success', source: 'mongodb', count: messages.length, data: messages });
    }
    return res.json({ status: 'success', source: 'memory_store', count: inMemoryContacts.length, data: inMemoryContacts });
  } catch (error) {
    next(error);
  }
};

module.exports = { submitContact, getContacts };
