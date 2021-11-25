const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const AppConstant = require("../config/appConstants");

const teamSchema = new Schema(
  {
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    teamLeader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    tasks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task",
      },
    ],
    position: {
      type: Number,
      default: AppConstant.TEAM_POSITION.TEAM_MEMEBER,
      enum: [
        AppConstant.TEAM_POSITION.TEAM_MEMEBER,
        AppConstant.TEAM_POSITION.TEAM_LEADER,
        AppConstant.TEAM_POSITION.MANAGER,
      ],
    },
    status: {
      type: Number,
      default: AppConstant.TEAM_STATUS.ACTIVE,
      enum: [AppConstant.TEAM_STATUS.ACTIVE, AppConstant.TEAM_STATUS.BLOCKED],
    },
  },

  { timestamps: true }
);

const Team = mongoose.model("Team", teamSchema);
module.exports = Team;
