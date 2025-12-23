const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get user's inbox (messages received)
router.get('/inbox', auth, async (req, res) => {
  try {
    const messages = await Message.find({
      recipients: req.user.id
    })
      .populate('sender', 'name email')
      .populate('replies.sender', 'name email')
      .sort({ createdAt: -1 });

    // Mark if user has read each message
    const messagesWithReadStatus = messages.map(msg => ({
      ...msg.toObject(),
      isRead: msg.isReadBy.some(id => id.toString() === req.user.id)
    }));

    res.json(messagesWithReadStatus);
  } catch (error) {
    console.error('Error fetching inbox:', error);
    res.status(500).json({ message: 'Error fetching messages' });
  }
});

// Get admin's sent messages and replies (admin dashboard)
router.get('/admin/messages', auth, async (req, res) => {
  try {
    // Only Super Admin can access
    const user = await User.findById(req.user.id);
    if (user.role !== 'Super Admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const messages = await Message.find({
      sender: req.user.id
    })
      .populate('recipients', 'name email')
      .populate('replies.sender', 'name email')
      .sort({ createdAt: -1 });

    // Count unread replies
    const messagesWithStats = messages.map(msg => {
      const hasUnreadReplies = msg.replies.length > 0;
      return {
        ...msg.toObject(),
        replyCount: msg.replies.length,
        hasUnreadReplies
      };
    });

    res.json(messagesWithStats);
  } catch (error) {
    console.error('Error fetching admin messages:', error);
    res.status(500).json({ message: 'Error fetching messages' });
  }
});

// Send message to specific user(s)
router.post('/send', auth, async (req, res) => {
  try {
    const { recipients, subject, content } = req.body;

    // Only Super Admin can send messages
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.role !== 'Super Admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const message = new Message({
      sender: req.user.id,
      recipients,
      subject,
      content,
      isBroadcast: false
    });

    await message.save();
    await message.populate('recipients', 'name email');

    res.status(201).json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Error sending message' });
  }
});

// Broadcast message to all users
router.post('/broadcast', auth, async (req, res) => {
  try {
    const { subject, content } = req.body;

    console.log('🔍 Broadcast request - userId:', req.user.id);
    console.log('🔍 Broadcast request - full user object:', req.user);

    // Only Super Admin can send messages
    const user = await User.findById(req.user.id);
    console.log('🔍 Found user:', user ? `${user.name} (${user.role})` : 'NULL');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.role !== 'Super Admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get all users except the sender
    const allUsers = await User.find({ 
      _id: { $ne: req.user.id },
      active: true 
    }).select('_id');

    const message = new Message({
      sender: req.user.id,
      recipients: allUsers.map(u => u._id),
      subject,
      content,
      isBroadcast: true
    });

    await message.save();

    res.status(201).json({
      message: 'Broadcast sent successfully',
      recipientCount: allUsers.length
    });
  } catch (error) {
    console.error('Error broadcasting message:', error);
    res.status(500).json({ message: 'Error broadcasting message' });
  }
});

// Mark message as read
router.put('/:id/read', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if user is a recipient
    if (!message.recipients.some(id => id.toString() === req.user.id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Add user to isReadBy if not already there
    if (!message.isReadBy.some(id => id.toString() === req.user.id)) {
      message.isReadBy.push(req.user.id);
      await message.save();
    }

    res.json({ message: 'Message marked as read' });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({ message: 'Error marking message as read' });
  }
});

// Reply to a message (user or admin)
router.post('/:id/reply', auth, async (req, res) => {
  try {
    const { content } = req.body;
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    const user = await User.findById(req.user.id);
    
    // Allow admin to reply to any message, or user to reply if they're a recipient
    const isAdmin = user.role === 'Super Admin' || user.role === 'admin';
    const isRecipient = message.recipients.some(id => id.toString() === req.user.id);
    
    if (!isAdmin && !isRecipient) {
      return res.status(403).json({ message: 'Access denied' });
    }

    message.replies.push({
      sender: req.user.id,
      content
    });

    await message.save();
    
    // Populate all necessary fields for the response
    await message.populate([
      { path: 'sender', select: 'name email role' },
      { path: 'recipients', select: 'name email role' },
      { path: 'replies.sender', select: 'name email role' }
    ]);

    res.json(message);
  } catch (error) {
    console.error('Error replying to message:', error);
    res.status(500).json({ message: 'Error replying to message' });
  }
});

// Get unread message count
router.get('/unread-count', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    let count = 0;

    if (user.role === 'Super Admin' || user.role === 'admin') {
      // For admins, count messages with new replies they haven't seen
      const messages = await Message.find({
        sender: req.user.id,
        'replies.0': { $exists: true } // Has at least one reply
      });

      // Count messages where the last reply is not from the admin
      count = messages.filter(msg => {
        const lastReply = msg.replies[msg.replies.length - 1];
        return lastReply.sender.toString() !== req.user.id;
      }).length;
    } else {
      // For regular users, count unread messages
      count = await Message.countDocuments({
        recipients: req.user.id,
        isReadBy: { $ne: req.user.id }
      });
    }

    res.json({ count });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ message: 'Error getting unread count' });
  }
});

// Delete message (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.role !== 'Super Admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Message.findByIdAndDelete(req.params.id);
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ message: 'Error deleting message' });
  }
});

module.exports = router;
