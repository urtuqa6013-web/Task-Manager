import Task from "../models/taskModel.js";

// ===============================
// Create Task
// ===============================
export const createTaskController = async (req, res) => {
  try {
    const { title, description, status} = req.body;

    if (!title || !description) {
      return res.status(400).send({
        success: false,
        message: "Please provide title and description",
      });
    }

    const task = await Task.create({
      title,
      description,
      status,
      attachment: req.file ? req.file.filename : "",
      user: req.user.id,
    });

    res.status(201).send({
      success: true,
      message: "Task created successfully",
      task,
    });
  } catch (error) {
    console.log(error);

    res.status(500).send({
      success: false,
      message: "Error creating task",
      error: error.message,
    });
  }
};

// ===============================
// Get All Tasks
// ===============================
export const getTasksController = async (req, res) => {
  try {
    const { keyword } = req.query;

    const page = Number(req.query.page) || 1;
    const limit = 5;
    const skip = (page - 1) * limit;

    let query = {};

    if (req.user.role === "user") {
      query.user = req.user.id;
    }

    if (keyword) {
      query.$or = [
        {
          title: {
            $regex: keyword,
            $options: "i",
          },
        },
        {
          description: {
            $regex: keyword,
            $options: "i",
          },
        },
      ];
    }

    let tasks;

    if (req.user.role === "admin" || req.user.role === "manager") {
      tasks = await Task.find(query)
        .populate("user", "name email role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
    } else {
      tasks = await Task.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
    }

    const total = await Task.countDocuments(query);

    res.status(200).send({
      success: true,
      tasks,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalTasks: total,
    });

  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
};
// ===============================
// Update Task
// ===============================
export const updateTaskController = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status } = req.body;

    let task;

    if (req.user.role === "admin") {
      task = await Task.findById(id);
    } else {
      task = await Task.findOne({
        _id: id,
        user: req.user.id,
      });
    }

    if (!task) {
      return res.status(404).send({
        success: false,
        message: "Task not found",
      });
    }

    task.title = title || task.title;
    task.description = description || task.description;
    task.status = status || task.status;

    await task.save();

    res.status(200).send({
      success: true,
      message: "Task updated successfully",
      task,
    });
  } catch (error) {
    console.log(error);

    res.status(500).send({
      success: false,
      message: "Error updating task",
      error: error.message,
    });
  }
};


export const deleteTaskController = async (req, res) => {
  try {
    let task;

    if (req.user.role === "admin") {
      task = await Task.findByIdAndDelete(req.params.id);
    } else {
      task = await Task.findOneAndDelete({
        _id: req.params.id,
        user: req.user.id,
      });
    }

    if (!task) {
      return res.status(404).send({
        success: false,
        message: "Task not found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.log(error);

    res.status(500).send({
      success: false,
      message: "Error deleting task",
      error: error.message,
    });
  }
};

export const dashboardStatsController = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === "user") {
      query.user = req.user.id;
    }

    const total = await Task.countDocuments(query);

    const pending = await Task.countDocuments({
      ...query,
      status: "Pending",
    });

    const progress = await Task.countDocuments({
      ...query,
      status: "In Progress",
    });

    const completed = await Task.countDocuments({
      ...query,
      status: "Completed",
    });

    res.status(200).send({
      success: true,
      stats: {
        total,
        pending,
        progress,
        completed,
      },
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
};