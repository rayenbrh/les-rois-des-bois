import User from '../models/User.js';

// Get all users (Admin only)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .populate('assignedClients', 'name email')
      .populate('assignedCommercial', 'name email')
      .select('-password');

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get users by role
export const getUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;
    const users = await User.find({ role }).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single user (Admin/Commercial)
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('assignedClients', 'name email')
      .populate('assignedCommercial', 'name email')
      .select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update user (Admin only)
export const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.role = req.body.role || user.role;
    user.phone = req.body.phone || user.phone;
    user.address = req.body.address || user.address;
    user.isActive = req.body.isActive !== undefined ? req.body.isActive : user.isActive;
    user.assignedCommercial = req.body.assignedCommercial || user.assignedCommercial;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete user (Admin only)
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.deleteOne();
    res.json({ message: 'User removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Assign clients to commercial (Admin only)
export const assignClientsToCommercial = async (req, res) => {
  try {
    const { commercialId, clientIds } = req.body;

    const commercial = await User.findById(commercialId);
    if (!commercial || commercial.role !== 'commercial') {
      return res.status(400).json({ message: 'Invalid commercial user' });
    }

    // Update commercial's assigned clients
    commercial.assignedClients = clientIds;
    await commercial.save();

    // Update each client's assignedCommercial field
    await User.updateMany(
      { _id: { $in: clientIds } },
      { assignedCommercial: commercialId }
    );

    res.json({ message: 'Clients assigned successfully', commercial });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get clients for a commercial
export const getCommercialClients = async (req, res) => {
  try {
    const commercial = await User.findById(req.user._id).populate('assignedClients');

    if (!commercial || commercial.role !== 'commercial') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(commercial.assignedClients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
