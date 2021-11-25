const { countryList } = require("../../data/country");
const { languageLists } = require("../../data/language");
const { states } = require("../../data/state");
const Country = require("../../model/Country");
const State = require("../../model/State");
const Language = require("../../model/Language");
const Task = require("../../model/Task");
const Department = require("../../model/Department");
const Team = require("../../model/Team");
exports.add_language_list = async (req, res) => {
  try {
    const language = await Language.findOne({ language: "English" });
    if (language) {
      res.status(404).send({ message: "Language already exists" });
    }
    await languageLists.map(async (item) => {
      const languages = new Language({
        language: item.language,
        languageLoc: item.languageLoc,
      });
      await languages.save();
    });
    res.send("added successfully");
  } catch (error) {
    res.send(error);
  }
};

exports.add_country_list = async (req, res) => {
  const country = await Counry.findOne({ country: "India" });
  if (country) {
    res.status(404).send({ message: "Country already exists" });
  }
  try {
    await countryList.map(async (item) => {
      const one = new Country({
        code: item.iso2,
        country: item.name,
        ids: item.id,
        phoneCode: item.phone_code,
      });
      await one.save();
    });
    await states.map(async (item) => {
      let countries = await Country.findOne({ ids: item.country_id });
      let newState = {
        country: countries._id,
        state: item.name,
      };
      let newStates = await new State(newState);
      await newStates.save();
    });

    res.send("added successfully");
  } catch (error) {
    res.send(error);
  }
};

//name: create langauge
//desc: create langauge

exports.add_language = async (req, res) => {
  const newLanguage = {
    language: req.body.language,
    languageLoc: req.body.languageLoc,
  };
  try {
    const language = new Language(newLanguage);
    await language.save();
    res.send(language);
  } catch (error) {
    res.status(500).send(error);
  }
};
exports.team_managment_add = async (req, res) => {
  try {
    const task1 = new Task({
      task: "Team memeber add",
      description: "Adding memeber to Fivestarweek",
    });
    const task2 = new Task({
      task: "Team memeber remove",
      description: "Removing memeber to Fivestarweek",
    });
    const task3 = new Task({
      task: "Team memebers list",
      description: "List of all staff",
    });
    const task4 = new Task({
      task: "Team memebers list by department",
      description: "List of all staff by department",
    });
    const task5 = new Task({
      task: "Team memebers list by team leader",
      description: "List of all staff by team leader",
    });
    const task6 = new Task({
      task: "Team memebers list by manager",
      description: "List of all staff by manager",
    });
    const task7 = new Task({
      task: "Team memeber add task",
      description: "Assign task to team member",
    });
    const task8 = new Task({
      task: "Team memeber remove task",
      description: "Remove task from team memeber",
    });
    await task1.save();
    await task2.save();
    await task3.save();
    await task4.save();
    await task5.save();
    await task6.save();
    await task7.save();
    await task8.save();
    const department = new Department({
      department: "Staff managment",
      description: "Managing staff",
    });
    department.tasks.push(
      task1._id,
      task2._id,
      task3._id,
      task4._id,
      task5._id,
      task6._id,
      task7._id,
      task8._id
    );
    await department.save();
    const team = new Team({
      department: department._id,
      user: req.user._id,
      manager: req.user._id,
      teamLeader: req.user._id,
    });
    team.tasks.push(
      task1._id,
      task2._id,
      task3._id,
      task4._id,
      task5._id,
      task6._id,
      task7._id,
      task8._id
    );
    await team.save();
    res.send({ department, team });
  } catch (error) {
    res.status(500).send(error);
  }
};
exports.department_managment_add = async (req, res) => {
  try {
    const task1 = new Task({
      task: "Department create",
      description: "Add new department",
    });
    const task2 = new Task({
      task: "Department block",
      description: "Block department",
    });
    const task3 = new Task({
      task: "Department unblock",
      description: "Unblock department",
    });
    const task4 = new Task({
      task: "Department list",
      description: "Department list",
    });
    const task5 = new Task({
      task: "Department by id",
      description: "Department by id",
    });
    const task6 = new Task({
      task: "Department task add",
      description: "Department task add",
    });
    const task7 = new Task({
      task: "Department task remove",
      description: "Department task remove",
    });
    const task8 = new Task({
      task: "Department edit",
      description: "Department edit",
    });

    await task1.save();
    await task2.save();
    await task3.save();
    await task4.save();
    await task5.save();
    await task6.save();
    await task7.save();
    await task8.save();
    const department = new Department({
      department: "Department management",
      description: "Department management",
    });
    department.tasks.push(
      task1._id,
      task2._id,
      task3._id,
      task4._id,
      task5._id,
      task6._id,
      task7._id,
      task8._id
    );
    await department.save();
    const teams = await Team.findOne({ user: req.user._id });
    teams.tasks.push(
      task1._id,
      task2._id,
      task3._id,
      task4._id,
      task5._id,
      task6._id,
      task7._id,
      task8._id
    );
    await teams.save();
    res.send({ department, teams });
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.task_managment_add = async (req, res) => {
  try {
    const task1 = new Task({
      task: "Task create",
      description: "create new task",
    });
    const task2 = new Task({
      task: "Task block",
      description: "Block task",
    });
    const task3 = new Task({
      task: "Task unblock",
      description: "Unblock task",
    });
    const task4 = new Task({
      task: "Task list",
      description: "Task list",
    });
    const task5 = new Task({
      task: "Task by id",
      description: "Task by id",
    });
    const task6 = new Task({
      task: "Task edit",
      description: "Task edit",
    });

    await task1.save();
    await task2.save();
    await task3.save();
    await task4.save();
    await task5.save();
    await task6.save();
    const department = new Department({
      department: "Task management",
      description: "Task management",
    });
    department.tasks.push(
      task1._id,
      task2._id,
      task3._id,
      task4._id,
      task5._id,
      task6._id
    );
    await department.save();
    const teams = await Team.findOne({ user: req.user._id });
    teams.tasks.push(
      task1._id,
      task2._id,
      task3._id,
      task4._id,
      task5._id,
      task6._id
    );
    await teams.save();
    res.send({ department, teams });
  } catch (error) {
    res.status(500).send(error);
  }
};
