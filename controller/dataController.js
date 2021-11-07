const { countryList } = require("../data/country");
const { languageLists } = require("../data/language");
const { states } = require("../data/state");
const Country = require("../model/Country");
const Language = require("../model/Language");
const State = require("../model/State");

exports.languageCreates = async (req, res) => {
  try {
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

exports.countryListAdd = async (req, res) => {
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
