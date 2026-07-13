import User from "../models/userModels.js";

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).send({
      success: true,
      users,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
};


export const updateUserRoleController = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Allow only these roles
    if (!["admin", "manager", "user"].includes(role)) {
      return res.status(400).send({
        success: false,
        message: "Invalid role",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    user.role = role;

    await user.save();

    res.status(200).send({
      success: true,
      message: "User role updated successfully",
      user,
    });
  } catch (error) {
    console.log(error);

    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
};


export const deleteUserController = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    await User.findByIdAndDelete(id);

    res.status(200).send({
      success: true,
      message: "User deleted successfully",
    });

  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
};

export const updateUserController = async (req, res) => {
  try {
    const { id } = req.params;
     const { name, email, role } = req.body;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    user.name = name || user.name;
    user.email = email || user.email;

    await user.save();

    res.status(200).send({
      success: true,
      message: "User updated successfully",
      user,
    });

  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
};


export const updateProfileController = async (req, res) => {
  try {

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    await user.save();

    res.status(200).send({
      success: true,
      message: "Profile Updated Successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    });

  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
};