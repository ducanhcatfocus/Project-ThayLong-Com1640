const Campaign = require("../models/campaign.model");
const Category = require("../models/category.model");
const Idea = require("../models/ideal.model");
const User = require("../models/user.model");
const path = require("path");
const mailer = require("../config/sendMail");

const staffController = {
  home: async (req, res) => {
    try {
      const categories = await Category.find({});
      const campaign = await Campaign.find({});
      //    if (!categories)
      //      return res.status(400).send({ msg: "User does not exist" });

      res.render("index", {
        title: "home",
        categories,
        allCampaigns: campaign.length,
      });
    } catch (error) {
      return res.status(500).send({ msg: error.message });
    }
  },

  getCampaign: async (req, res) => {
    try {
      const categories = await Category.find({});
      const campaigns = await Campaign.find({});
      //    if (!categories)
      //      return res.status(400).send({ msg: "User does not exist" });

      res.render("all-campaigns", {
        title: "List of Campaigns",
        categories,
        allCampaigns: campaigns.length,
        campaigns,
      });
    } catch (error) {
      return res.status(500).send({ msg: error.message });
    }
  },

  getCampaignByCategory: async (req, res) => {
    try {
      const categories = await Category.find({});
      const campaign = await Campaign.find({});

      const campaigns = await Campaign.find({ category: req.params.id });
      //    if (!categories)
      //      return res.status(400).send({ msg: "User does not exist" })
      res.render("all-campaigns", {
        title: "List of Campaigns",
        categories,
        allCampaigns: campaign.length,
        campaigns,
      });
    } catch (error) {
      return res.status(500).send({ msg: error.message });
    }
  },

  getCampaignDetail: async (req, res) => {
    try {
      const categories = await Category.find({});
      const campaigns = await Campaign.find({});
      const campaign = await Campaign.findOne({ _id: req.params.id });
      const ideas = await Idea.find({ campaign_id: req.params.id });
      //    if (!categories)
      //      return res.status(400).send({ msg: "User does not exist" })
      res.render("campaign-detail", {
        title: campaign.title,
        categories,
        allCampaigns: campaigns.length,
        campaign,
        ideas,
      });
    } catch (error) {
      return res.status(500).send({ msg: error.message });
    }
  },
  getCreateIdea: async (req, res) => {
    try {
      const categories = await Category.find({});
      const campaigns = await Campaign.find({});
      res.render("create-ideal", {
        title: "Submit An Idea",
        categories,
        allCampaigns: campaigns.length,
        campaign_id: req.params.id,
      });
    } catch (error) {
      return res.status(500).send({ msg: error.message });
    }
  },

  createIdea: async (req, res) => {
    try {
      const { title, content, campaignId } = req.body;
      if (!title || !content) {
        req.flash("danger", "Title and Content must not be empty");
        return res.redirect("create_ideal");
      }
      if (req.files.length != 0) {
        var upload_file = [];
        req.files.forEach((element) => {
          if (element.mimetype.startsWith("image/"))
            return upload_file.push({
              filename: element.filename,
              mimetype: element.mimetype,
              default_image: element.filename,
            });
          upload_file.push({
            filename: element.filename,
            mimetype: element.mimetype,
            default_image:
              "default_image_" +
              path.extname(element.originalname).substring(1) +
              ".png",
          });
        });
      }
      const newIdea = new Idea({
        user_id: req.user.id,
        title,
        content,
        campaign_id: campaignId.slice(0, -1),
        upload_file,
      });
      await newIdea.save();

      const qamUser = await User.find({ role: "qam" });
      if (qamUser.length != 0) {
        var maillist = [];
        qamUser.forEach((element) => {
          maillist.push(element.email);
        });
        mailer.sendMail(
          maillist,
          req.user.email + " submit an idea at: " + new Date()
        );
      }

      req.flash("success", "Campaign created");
      return res.redirect("/campaign_detail/" + campaignId.slice(0, -1));
    } catch (error) {
      return res.status(500).send({ msg: error.message });
    }
  },
  getIdeaDetail: async (req, res) => {
    try {
      const categories = await Category.find({});
      const campaigns = await Campaign.find({});
      //catch error
      //...........
      const user = await User.find({
        _id: req.user.id,
        likeIdeas: { $in: [req.params.id] },
      });

      var isLike = user.length != 0 ? true : false;
      await Idea.updateOne(
        { _id: req.params.id },
        { $push: { viewBy: req.user.id } }
      );

      const idea = await Idea.findOne({ _id: req.params.id });
      res.render("idea-detail", {
        title: idea.title,
        categories,
        allCampaigns: campaigns.length,
        idea,
        isLike,
      });
    } catch (error) {
      return res.status(500).send({ msg: error.message });
    }
  },
  comment: async (req, res) => {
    try {
      const { comment } = req.body;
      const user = await Idea.findOne({ _id: req.params.id });
      const user2 = await User.findOne({ _id: user.user_id });
      mailer.sendMail(
        user2.email,
        req.user.email + " commented on your idea at: " + new Date()
      );

      await Idea.updateOne(
        { _id: req.params.id },
        {
          $push: {
            comments: [{ user: req.params.id, content: comment }],
          },
        }
      );
      await Idea.updateOne({ _id: req.params.id }, { $pop: { viewBy: 1 } });
      res.redirect("back");
    } catch (error) {
      return res.status(500).send({ msg: error.message });
    }
  },
  like: async (req, res) => {
    try {
      const user = await User.find({
        _id: req.user.id,
        likeIdeas: { $in: [req.params.id] },
      });
      await Idea.updateOne({ _id: req.params.id }, { $pop: { viewBy: 1 } });
      if (user.length != 0) return res.redirect("back");

      await User.updateOne(
        { _id: req.user.id },
        { $push: { likeIdeas: req.params.id } }
      );
      await Idea.updateOne(
        { _id: req.params.id },
        { $push: { likeBy: req.params.id } }
      );
      res.redirect("back");
    } catch (error) {
      return res.status(500).send({ msg: error.message });
    }
  },
  unlike: async (req, res) => {
    try {
      const user = await User.find({
        _id: req.user.id,
        likeIdeas: { $in: [req.params.id] },
      });
      await Idea.updateOne({ _id: req.params.id }, { $pop: { viewBy: 1 } });
      if (user.length == 0) return res.redirect("back");

      await User.updateOne(
        { _id: req.user.id },
        { $pull: { likeIdeas: req.params.id } }
      );
      await Idea.updateOne(
        { _id: req.params.id },
        { $pull: { likeBy: req.params.id } }
      );
      res.redirect("back");
    } catch (error) {
      return res.status(500).send({ msg: error.message });
    }
  },
};

module.exports = staffController;
