const SystemActivity = require('../models/SystemActivity');

// Helper function to log system activities
const logActivity = async (type, description, user, entityType = null, entityId = null, entityName = null, metadata = {}, agencyId = null) => {
  try {
    // Validate user parameter
    const userId = user._id || user.id;
    if (!userId) {
      console.error('❌ Activity logging failed: user ID is undefined', { user, type, description });
      return;
    }

    await SystemActivity.create({
      type,
      description,
      user: userId,
      userName: user.name || user.email,
      userRole: user.role,
      entityType,
      entityId,
      entityName,
      agency: agencyId,
      metadata
    });
    console.log(`✅ Logged activity: ${type} - ${description}`, agencyId ? `for agency: ${agencyId}` : '');
  } catch (error) {
    console.error('❌ Error logging activity:', error.message);
    // Don't throw error - logging failure shouldn't break the main operation
  }
};

module.exports = { logActivity };
