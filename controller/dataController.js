const { countryList } = require("../data/country");
const { languageLists } = require("../data/language");
const City = require("../model/City");
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
        code: item.code,
        country: item.country,
        phoneCode: item.phoneCode,
      });
      await one.save();
    });
    const all = await Country.findOne({ country: "All" });
    let newcountry = {
      state: "All",
      country: all._id,
    };
    let state = await new State(newcountry);
    await state.save();
    const alls = await State.findOne({ state: "All" });
    let newcountrys = {
      city: "All",
      country: alls.country,
      state: alls._id,
    };
    let city = await new City(newcountrys);
    await city.save();
    res.send("added successfully");
  } catch (error) {
    res.send(error);
  }
};
