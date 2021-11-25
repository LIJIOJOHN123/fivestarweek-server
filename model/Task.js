const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const AppConstant = require("../config/appConstants");

const taskSchema = new Schema(
  {
    task: {
      type: String,
    },
    description: {
      type: String,
    },

    status: {
      type: Number,
      default: AppConstant.TASK_STATUS.ACTIVE,
      enum: [AppConstant.TASK_STATUS.ACTIVE, AppConstant.TASK_STATUS.BLOCKED],
    },
  },

  { timestamps: true }
);

const Task = mongoose.model("Task", taskSchema);
module.exports = Task;
