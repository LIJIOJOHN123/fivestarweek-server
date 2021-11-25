const Department = require("../../model/Department");
const appConstant = require("../../config/appConstants");
const AcitivityHistory = require("../../model/ActivityHistory");

//new department
exports.department_create = async (req, res) => {
  try {
    const department = new Department({
      department: req.body.department,
      description: req.body.description,
    });
    await department.save();
    res.send(department);
  } catch (error) {
    res.status(500).send(error);
  }
};

//department status changes

exports.department_block = async (req, res) => {
  try {
    const department = await Department.findOne({
      _id: req.params.id,
    });
    department.status = appConstant.DEPARTMENT_STATUS.BLOCKED;
    await department.save();
    res.send(department);
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.department_unblock = async (req, res) => {
  try {
    const department = await Department.findOne({
      _id: req.params.id,
    });
    department.status = appConstant.DEPARTMENT_STATUS.ACTIVE;
    await department.save();
    res.send(department);
  } catch (error) {
    res.status(500).send(error);
  }
};

//department edit
exports.department_edit = async (req, res) => {
  try {
    const udpates = Object.keys(req.body);
    const department = await Department.findOne({
      _id: req.params.id,
    });
    udpates.map((update) => (department[update] = req.body[update]));
    await department.save();
    res.send(department);
  } catch (error) {
    res.status(500).send(error);
  }
};

//department view (master admin)
exports.department_lists = async (req, res) => {
  try {
    const departments = await Department.find({
      status: AppConstant.DEPARTMENT_STATUS.ACTIVE,
    });
    res.send(departments);
  } catch (error) {
    res.status(500).send(error);
  }
};

//depament id

exports.department_by_id = async (req, res) => {
  try {
    const department = await Department.findOne({
      _id: req.params.id,
    });
    const activities = await AcitivityHistory.find({
      type: "department_management",
    });
    res.send({ department, activities });
  } catch (error) {
    res.status(500).send(error);
  }
};

//deparment add task

exports.department_task_add = async (req, res) => {
  try {
    const department = await Department.findOne({
      _id: req.params.id,
    });
    department.tasks.push(req.params.tid);
    await department.save();
    const activity = new AcitivityHistory({
      action: `${req.user.name} aded task to the deparment.`,
      user: req.user._id,
      approved: req.user._id,
      type: "department_management",
    });
    await activity.save();
    res.send(department);
  } catch (error) {
    res.status(500).send(error);
  }
};

//deparment remove task
exports.department_task_remove = async (req, res) => {
  try {
    const department = await Department.findOne({
      _id: req.params.id,
    });
    const index = department.tasks.findIndex(
      (task) => task.toString() === req.params.tid.toString()
    );
    department.tasks.splice(index, 1);
    const activity = new AcitivityHistory({
      action: `${req.user.name} removed task from the deparment.`,
      user: req.user._id,
      approved: req.user._id,
      type: "department_management",
    });
    await activity.save();
    await department.save();
    res.send(department);
  } catch (error) {
    res.status(500).send(error);
  }
};
