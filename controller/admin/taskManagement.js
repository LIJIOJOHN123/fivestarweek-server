const Task = require("../../model/Task");
const appConstant = require("../../config/appConstants");

//new task
exports.task_create = async (req, res) => {
  try {
    const task = new Task({
      task: req.body.task,
      description: req.body.description,
    });
    await task.save();
    res.send(task);
  } catch (error) {
    res.status(500).send(error);
  }
};

//task status changes

exports.task_block = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
    });
    task.status = appConstant.TASK_STATUS.BLOCKED;
    await task.save();
    res.send(task);
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.task_unblock = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
    });
    task.status = appConstant.TASK_STATUS.ACTIVE;
    await task.save();
    res.send(task);
  } catch (error) {
    res.status(500).send(error);
  }
};

//task edit
exports.task_edit = async (req, res) => {
  try {
    const udpates = Object.keys(req.body);
    const task = await Task.findOne({
      _id: req.params.id,
    });
    udpates.map((update) => (task[update] = req.body[update]));
    await task.save();
    res.send(task);
  } catch (error) {
    res.status(500).send(error);
  }
};

//taks view (master admin)
exports.task_lists_master_admin = async (req, res) => {
  try {
    const tasks = await Task.find();
    res.send(tasks);
  } catch (error) {
    res.status(500).send(error);
  }
};

////taks view (task management)
exports.task_lists_all = async (req, res) => {
  try {
    const tasks = await Task.find();
    res.send(tasks);
  } catch (error) {
    res.status(500).send(error);
  }
};

////taks view (task management)
exports.task_list = async (req, res) => {
  try {
    const tasks = await Task.find({ status: appConstant.TASK_STATUS.ACTIVE });
    res.send(tasks);
  } catch (error) {
    res.status(500).send(error);
  }
};
