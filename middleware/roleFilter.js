// Middleware to filter data based on user role
const filterByRole = (req, res, next) => {
  // Add user ID to request for filtering
  if (req.user) {
    req.userId = req.user.id;
    req.userRole = req.user.role;
  }
  next();
};

// Helper function to add role-based filter to queries
const addRoleFilter = (query, req, modelType) => {
  // Super Admin can see everything
  if (req.userRole === 'Super Admin') {
    return query;
  }
  
  // Group Leader can only see their own data
  if (req.userRole === 'Group Leader') {
    // For groups, filter by createdBy
    if (modelType === 'Group') {
      return query.where('createdBy').equals(req.userId);
    }
    
    // For other models, filter by createdBy
    if (['Passenger', 'Flight', 'Operation', 'Activity'].includes(modelType)) {
      return query.where('createdBy').equals(req.userId);
    }
  }
  
  return query;
};

module.exports = { filterByRole, addRoleFilter };
