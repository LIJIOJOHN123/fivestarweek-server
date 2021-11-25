const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const AppConstant = require("../config/appConstants");

const departmentSchema = new Schema(
  {
    department: {
      type: String,
    },
    description: {
      type: String,
    },
    status: {
      type: Number,
    },
    tasks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task",
      },
    ],
    status: {
      type: Number,
      default: AppConstant.DEPARTMENT_STATUS.ACTIVE,
      enum: [
        AppConstant.DEPARTMENT_STATUS.ACTIVE,
        AppConstant.DEPARTMENT_STATUS.BLOCKED,
      ],
    },
  },

  { timestamps: true }
);

const Department = mongoose.model("Department", departmentSchema);
module.exports = Department;

//Tasks
//master admin
//Department
//
//Team
