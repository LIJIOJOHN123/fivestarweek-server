const Channel = require("../../model/Channel");
const AppConstant = require("../../config/appConstants");
const exportIdGenerator = require("../../config/IDGenerator");
const Article = require("../../model/Article");
const Notification = require("../../model/Notification");
const ChannelViewAuth = require("../../model/ChannelViewAuth");
const ChannelViewIP = require("../../model/ChannelViewIP");
const ChannelVisitAuth = require("../../model/ChannelVisitorAuth");
const ChannelVisitIP = require("../../model/ChannelVisitorIP");
const ChannelSponsor = require("../../model/SponsorChannel");
const Preference = require("../../model/Preference");

/******************************** Private  ******************************/

/*** Channel owners  *********/

//name:Channel create
//desc: create channel
exports.channel_create = async (req, res) => {
  const channelsName = req.body.channelName
    .toLowerCase()
    .trim()
    .replace(/\s/g, "");
  const channels = await Channel.findOne({ channelName: channelsName });
  if (channels) {
    return res.status(404).send({
      message:
        "Sorry. This channelname is already in use. Please choose another channelname",
    });
  }
  const newChannel = {
    user: req.user._id,
    channel: req.body.channel,
    channelName: channelsName,
    introduction: req.body.introduction,
    language: req.body.language,
    keywords: req.body.keywords,
    avatar: req.body.avatar,
    avatars: { image: process.env.CHANNEL_AVATAR, zoom: "100%" },
    slur: channelsName,
  };

  const channelName = await Channel.findOne({
    channelName: channelsName,
  });

  if (channelName) {
    if (channelName.channelName === req.body.channelName)
      return res.status(400).json({
        errors: [
          { msg: "Username already exists. Please choose another username." },
        ],
      });
  }

  try {
    const channel = new Channel(newChannel);
    channel.channelId = exportIdGenerator(25);
    if (
      req.user.premiumType == AppConstant.PREMIUM_TYPE.DIAMOND ||
      req.user.premiumType == AppConstant.PREMIUM_TYPE.GOLD
    ) {
      channel.verifiedStatus = AppConstant.CHANNEL_VERIFICATION.VERIFIED;
    }
    await channel.save();
    res.send(channel);
  } catch (error) {
    res.status(500).send(error);
  }
};

//name:channel list by created user
//desc: get all channels created by the user
exports.channel_list_by_created_user = async (req, res) => {
  try {
    const channelCount = await Channel.find({
      user: req.user._id,
      status: AppConstant.CHANNEL_STATUS.ACTIVE,
    }).countDocuments();
    const channel = await Channel.find({
      user: req.user._id,
      status: AppConstant.CHANNEL_STATUS.ACTIVE,
    })
      .sort({ createdAt: -1 })
      .limit(parseInt(req.query.limit));
    res.send({ channelCount, channel });
  } catch (error) {
    res.status(500).send(error);
  }
};

//name:Edit  Single Channel
//desc: edit single authorized user channel
exports.channel_edit = async (req, res) => {
  try {
    const udpates = Object.keys(req.body);
    const channel = await Channel.findOne({
      user: req.user._id,
      _id: req.params.id,
      status: AppConstant.CHANNEL_STATUS.ACTIVE,
    });
    if (req.body.channelName !== channel.channelName) {
      const channelNames = req.body.channelName
        .toLowerCase()
        .trim()
        .replace(/\s/g, "");
      const channelName = await Channel.findOne({ channelName: channelNames });
      if (channelName) {
        return res.status(404).send({
          message:
            "Sorry. This channelname is already in use. Please choose another channelname.",
        });
      }
    }
    udpates.map((update) => (channel[update] = req.body[update]));
    if (req.body.channelName) {
      channel.slur = req.body.channelName;
    }
    channel.channelName = channel.channelName
      .toLowerCase()
      .trim()
      .replace(/\s/g, "");
    await channel.save();
    res.send(channel);
  } catch (error) {
    res.status(500).send(error);
  }
};

//name:Channel Avatar
//desc: channel avatar image change
exports.channel_add_image = async (req, res) => {
  try {
    const channel = await Channel.findOne({
      user: req.user._id,
      _id: req.params.id,
    });
    const channelAvatart = {
      image: req.file.location,
      zoom: req.body.zoom || "100%",
    };
    channel.avatar.image = req.file.location;
    channel.avatar.zoom = req.file.zoom;

    channel.avatars.unshift(channelAvatart);
    await channel.save();
    res.send(channel);
  } catch (error) {
    res.status(500).send(error);
  }
};

//name:Channel Delete
//desc: delete channel
exports.channel_delete = async (req, res) => {
  try {
    const channel = await Channel.findOne({
      user: req.user._id,
      _id: req.params.id,
    });
    channel.status = AppConstant.CHANNEL_STATUS.BLOCKED;
    await channel.save();
    res.send(channel);
  } catch (error) {
    res.status(500).send(error);
  }
};

/*** Channel auth users  *********/

//name:Channel Follow
//desc: allowing users to follow channels
exports.channel_follow = async (req, res) => {
  try {
    const channel = await Channel.findOne({
      _id: req.params.id,
      status: AppConstant.CHANNEL_STATUS.ACTIVE,
    });
    if (
      channel.follows.filter(
        (follow) => follow.user.toString() === req.user._id.toString()
      ).length > 0
    ) {
      return res.status(404).send("You have already followed this channel");
    }
    await channel.follows.unshift({
      user: req.user._id,
      channel: req.params.id,
    });
    const newNotification = new Notification({
      receiveUser: channel.user,
      message: `${req.user.name} started following your channel @${channel.channelName}.`,
      type: "channel",
    });
    newNotification.who.push({
      user: req.user._id,
      avatar: req.user.avatar,
      name: req.user.name,
    });
    newNotification.what.push(channel);
    await newNotification.save();
    await channel.save();
    res.send(channel);
  } catch (error) {
    res.status(500).send(error);
  }
};

//name:Channel Unfollow
//desc: allowing users to unfollow channels
exports.channel_unfollow = async (req, res) => {
  try {
    const channel = await Channel.findOne({
      _id: req.params.id,
      status: AppConstant.CHANNEL_STATUS.ACTIVE,
    });
    if (
      channel.follows.filter(
        (follow) => follow.user.toString() === req.user._id.toString()
      ).length === 0
    ) {
      return res.status(404).send("You have not followed this channel");
    }
    const index = channel.follows.findIndex(
      (follow) => follow.user.toString() === req.user._id.toString()
    );
    channel.follows.splice(index, 1);
    await channel.save();
    res.send(channel);
  } catch (error) {
    res.status(500).send(error);
  }
};

//name:Channels Followed
//desc: get all channels user followed
exports.channel_filter_followed_by_user = async (req, res) => {
  try {
    const channel = await Channel.find({
      status: AppConstant.CHANNEL_STATUS.ACTIVE,
    });
    const followChann = [];
    channel
      .map((single) => single.follows)
      .map((single) =>
        single.filter((double) => {
          if (double.user.toString() === req.user._id.toString())
            followChann.push(double.channel);
        })
      );
    const channelCount = await Channel.find({
      _id: followChann,
    }).countDocuments();
    const channels = await Channel.find({ _id: followChann })
      .sort({ createdAt: -1 })
      .limit(parseInt(req.query.limit));

    res.send({ channelCount, channels });
  } catch (error) {
    res.status(500).send(error);
  }
};

//name:Channels Unfollowed
//desc: get all unfollowed channels
exports.channel_filter_unfollowed_by_user = async (req, res) => {
  try {
    const channel = await Channel.find({
      status: AppConstant.CHANNEL_STATUS.ACTIVE,
    });
    const followChann = [];
    channel
      .map((single) => single.follows)
      .map((single) =>
        single.filter((double) => {
          if (double.user.toString() === req.user._id.toString())
            followChann.push(double.channel.toString());
        })
      );
    const chan = channel.map((chans) => chans._id.toString());
    const myArray = chan.filter((i) => followChann.indexOf(i) === -1);
    const channelCount = await Channel.find({ _id: myArray }).countDocuments();
    const channels = await Channel.find({ _id: myArray }).limit(
      parseInt(req.query.limit)
    );
    res.send({ channelCount, channels });
  } catch (error) {
    res.status(500).send(error);
  }
};
//Channels Suggestion
//channel suggestion filtered by qualification
exports.channel_list_suggestion_auth_user_by_qualification = async (
  req,
  res
) => {
  try {
    const preference = await Preference.findOne({ user: req.user._id })
      .select(["-keyword", "-intersted", "-visited"])
      .populate(["language"]);
    const channel = await Channel.find({
      language: preference.language._id,
    }).limit(parseInt(req.query.limit));
    const followChann = [];
    channel
      .map((single) => single.follows)
      .map((single) =>
        single.filter((double) => {
          if (double.user.toString() === req.user._id.toString())
            followChann.push(double.channel.toString());
        })
      );
    const chan = channel.map((chans) => chans._id.toString());
    const myArray = chan.filter((i) => followChann.indexOf(i) === -1);
    const channels = await Channel.find({ _id: myArray }).limit(
      parseInt(req.query.limit)
    );
    res.send({ channels });
  } catch (error) {
    res.status(500).send(error);
  }
};

//name:Channel visit
exports.channel_visit_auth = async (req, res) => {
  try {
    const channel = await Channel.findOne({
      _id: req.params.id,
    });
    const newView = {
      user: req.user._id,
      ip: req.body.ip,
      channel: req.params.id,
      country: req.body.country,
      state: req.body.region,
      keywords: channel.keywords.toString(),
    };
    const visitedChannel = new ChannelVisitAuth(newView);
    await visitedChannel.save();
    if (channel.sponsor == AppConstant.SPONSOR.SPONSORED) {
      const channelSponsore = await ChannelSponsor.findOne({
        channelId: channel._id,
      }).sort({ createdAt: -1 });
      await channelSponsore.authVisit.unshift(visitedChannel._id);
      await channelSponsore.save();
    }
    await channel.save();
    res.send({});
  } catch (error) {
    res.status(500).send(error);
  }
};

//name:channel view auth

exports.channel_view_auth = async (req, res) => {
  try {
    const channel = await Channel.findOne({
      _id: req.params.id,
    });
    const newView = {
      user: req.user._id,
      ip: req.body.ip,
      channel: req.params.id,
      country: req.body.country,
      state: req.body.region,
      keywords: channel.keywords.toString(),
    };
    const visitedChannel = new ChannelViewAuth(newView);
    await visitedChannel.save();
    if (channel.sponsor == AppConstant.SPONSOR.SPONSORED) {
      const channelSponsore = await ChannelSponsor.findOne({
        channelId: channel._id,
      }).sort({ createdAt: -1 });
      channelSponsore.authViews.unshift(visitedChannel._id);
      await channelSponsore.save();
    }
    await channel.save();
    res.send(channel);
  } catch (error) {
    res.status(500).send(error);
  }
};
/*** public  *********/

//name:Channels All
//desc: get all channels
exports.channel_list_public = async (req, res) => {
  try {
    const channelCount = await Channel.find({
      status: AppConstant.CHANNEL_STATUS.ACTIVE,
      verifiedStatus: AppConstant.CHANNEL_VERIFICATION.VERIFIED,
    }).countDocuments();
    const channels = await Channel.find({
      status: AppConstant.CHANNEL_STATUS.ACTIVE,
    })
      .sort({ createdAt: -1 })
      .limit(parseInt(req.query.limit));
    res.send({ channelCount, channels });
  } catch (error) {
    res.status(500).send(error);
  }
};

//name:Channels Single
//desc: get single channel
exports.channel_by_id = async (req, res) => {
  try {
    const channel = await Channel.findOne({
      _id: req.params.id,
      status: AppConstant.CHANNEL_STATUS.ACTIVE,
    });
    if (!channel) {
      return res.status(404).send({ message: "This channel is avaialble" });
    }
    const articleCount = await Article.find({
      channel: channel._id,
      status: AppConstant.ARTICLE_STATUS.ACTIVE,
    }).countDocuments();
    const articles = await Article.find({
      channel: channel._id,
      status: AppConstant.ARTICLE_STATUS.ACTIVE,
    })
      .limit(parseInt(req.query.limit))
      .sort({ createdAt: -1 })
      .populate("channel");

    res.send({ channel, articleCount, articles });
  } catch (error) {
    res.status(500).send(error);
  }
};

//checking channel name exist
//channel name exists

exports.channel_name_exists_check = async (req, res) => {
  try {
    let channel = await Channel.findOne({ channelName: req.body.channelName });
    if (channel) {
      return res.status(404).send({ message: "channelName already exists" });
    }
    res.send({ message: "channelName is unique" });
  } catch (error) {
    res.status(500).send(error);
  }
};

//name:channel view public
exports.channel_view_public = async (req, res) => {
  try {
    const channel = await Channel.findOne({
      _id: req.params.id,
    });
    const newView = {
      ip: req.body.ip,
      channel: req.params.id,
      country: req.body.country,
      state: req.body.region,
      keywords: channel.keywords.toString(),
    };
    const views = await ChannelViewIP(newView);
    await views.save();
    if (channel.sponsor == AppConstant.SPONSOR.SPONSORED) {
      const channelSponsore = await ChannelSponsor.findOne({
        channelId: channel._id,
      }).sort({ createdAt: -1 });
      channelSponsore.guestViews.unshift(views._id);
      await channelSponsore.save();
    }
    await channel.save();
    res.send(views);
  } catch (error) {
    res.status(500).send(error);
  }
};

//name: Channel visit public
exports.channel_visit_public = async (req, res) => {
  try {
    const channel = await Channel.findOne({
      _id: req.params.id,
    });
    const newView = {
      ip: req.body.ip,
      channel: req.params.id,
      country: req.body.country,
      state: req.body.region,
      keywords: channel.keywords.toString(),
    };
    const views = await ChannelVisitIP(newView);
    await views.save();
    if (channel.sponsor === AppConstant.SPONSOR.SPONSORED) {
      const channelSponsore = await ChannelSponsor.findOne({
        channelId: channel._id,
      }).sort({ createdAt: -1 });
      await channelSponsore.guestVisit.unshift(views._id);
      await channelSponsore.save();
    }
    await channel.save();
    res.send({});
  } catch (error) {
    res.status(500).send(error);
  }
};
