const Department = require("../../model/Department");
const appConstant = require("../../config/appConstants");
const AcitivityHistory = require("../../model/ActivityHistory");
const Task = require("../../model/Task");
const User = require("../../model/User");
const Team = require("../../model/Team");

//add department

exports.team_member = async (req, res) => {
  try {
    const team = await Team.findOne({
      user: req.params.id,
      status: appConstant.TEAM_STATUS.ACTIVE,
    });
    const user = await User.findOne({ _id: req.params.id });
    const department = await Department.findOne({ _id: team.department });
    let activity;
    if (req.body.department) {
      if (!team) {
        const new_team = new Team({
          department: req.params.did,
          user: req.params.user,
        });
        await new_team.save();
        activity = new AcitivityHistory({
          action: `${req.user.name} add ${user.name} department to ${department.department}.`,
          user: req.user._id,
          approved: req.user._id,
          type: "staff_management",
        });
      } else {
        team.department = req.params.did;
        activity = new AcitivityHistory({
          action: `${req.user.name} changed ${user.name} department to ${department.department}.`,
          user: req.user._id,
          approved: req.user._id,
          type: "staff_management",
        });
      }
    }
    if (req.body.manager) {
      if (!team) {
        const new_team = new Team({
          department: req.body.department,
          user: req.params.user,
          manager: req.params.mid,
        });
        await new_team.save();
        activity = new AcitivityHistory({
          action: `${req.user.name} will be new manager for ${user.name}.`,
          user: req.user._id,
          approved: req.user._id,
          type: "staff_management",
        });
      } else {
        team.manager = req.params.mid;
        activity = new AcitivityHistory({
          action: `${req.user.name} updated manager for ${user.name}.`,
          user: req.user._id,
          approved: req.user._id,
          type: "staff_management",
        });
      }
    }
    if (req.body.teamLeader) {
      if (!team) {
        const new_team = new Team({
          department: req.body.department,
          user: req.params.user,
          teamLeader: req.params.tid,
        });
        activity = new AcitivityHistory({
          action: `${req.user.name} will be new team leader for ${user.name}.`,
          user: req.user._id,
          approved: req.user._id,
          type: "staff_management",
        });
        await new_team.save();
      } else {
        team.teamLeader = req.params.tid;
        activity = new AcitivityHistory({
          action: `${req.user.name} updated team leader for ${user.name}.`,
          user: req.user._id,
          approved: req.user._id,
          type: "staff_management",
        });
      }
    }
    if (req.body.position) {
      if (!team) {
        const new_team = new Team({
          department: req.body.department,
          user: req.params.user,
          position: req.body.position,
        });
        activity = new AcitivityHistory({
          action: `${req.user.name} gave promotion to ${user.name}.`,
          user: req.user._id,
          approved: req.user._id,
          type: "staff_management",
        });
        await new_team.save();
      } else {
        team.teamLeader = req.params.tid;
        team.position = req.body.position;
        activity = new AcitivityHistory({
          action: `${req.user.name} gave promotion to ${user.name}.`,
          user: req.user._id,
          approved: req.user._id,
          type: "staff_management",
        });
      }
    }
    await activity.save();
    await team.save();
    res.send(team);
  } catch (error) {
    res.status(500).send(error);
  }
};

//add task

exports.team_add_task = async (req, res) => {
  try {
    const team = await Team.findOne({ user: req.params.id });
    team.tasks.usnhift(req.params.tid);
    const task = await Task.findOne({ _id: req.params.tid });
    const department = await Department.findOne({ _id: team.department });
    const user = await User.findOne({ _id: req.params.id });
    const activity = new AcitivityHistory({
      action: `${req.user.name} gave ${task.task} access to ${user.user}.`,
      user: req.user._id,
      approved: req.user._id,
      type: "staff_management",
    });
    await activity.save();
    await department.save();
    res.send(department);
  } catch (error) {
    res.status(500).send(error);
  }
};

//remove task from team
exports.team_remove_task = async (req, res) => {
  try {
    const team = await Team.findOne({ user: req.params.id });

    const index = team.tasks.findIndex(
      (de) => de.toString() === req.params.tid.toString()
    );
    team.tasks.splice(index, 1);
    const user = await User.findOne({ _id: req.params.id });
    const department = await Department.findOne({ _id: team.department });

    const activity = new AcitivityHistory({
      action: `${req.user.name} removed ${user.name} from ${department.department}.`,
      user: req.user._id,
      approved: req.user._id,
      type: "staff_management",
    });
    await activity.save();
    await department.save();
    res.send(department);
  } catch (error) {
    res.status(500).send(error);
  }
};

// block team user
exports.team_member_remove = async (req, res) => {
  try {
    const team = await Team.findOne({ user: req.params.id });
    const user = await User.findOne({ _id: req.params.id });

    team.status = appConstant.TEAM_STATUS.BLOCKED;
    const activity = new AcitivityHistory({
      action: `${req.user.name} removed ${user.name} `,
      user: req.user._id,
      approved: req.user._id,
      type: "staff_management",
    });
    await activity.save();
    await team.save();
    res.send(team);
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.team_members_list = async (req, res) => {
  try {
    const team = await Team.find({});
    const teamCount = await Team.find({}).countDocuments();
    res.send({ team, teamCount });
  } catch (error) {
    res.status(500).send(error);
  }
};
//staff list by department
exports.team_members_list_by_department = async (req, res) => {
  try {
    const team = await Team.find({ department: req.params.id });
    const teamCount = await Team.find({
      department: req.params.id,
    }).countDocuments();
    res.send({ team, teamCount });
  } catch (error) {
    res.status(500).send(error);
  }
};
// team by manager
exports.team_members_list_by_manager = async (req, res) => {
  try {
    const team = await Team.find({ manager: req.params.id });
    const teamCount = await Team.find({
      manager: req.params.id,
    }).countDocuments();
    res.send({ team, teamCount });
  } catch (error) {
    res.status(500).send(error);
  }
};
//team by team leader
exports.team_members_list_by_teamLeader = async (req, res) => {
  try {
    const team = await Team.find({ teamLeader: req.params.id });
    const teamCount = await Team.find({
      teamLeader: req.params.id,
    }).countDocuments();
    res.send({ team, teamCount });
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.team_member_by_user = async (req, res) => {
  try {
    const team = await Team.find({ user: req.user._id });
    const activity = await AcitivityHistory({ user: req.user._id });
    res.send({ team, activity });
  } catch (error) {
    res.status(500).send(error);
  }
};
