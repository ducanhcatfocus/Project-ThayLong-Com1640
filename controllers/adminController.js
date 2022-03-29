const User = require("../models/user.model");
const Campaign = require("../models/campaign.model");
const Department = require("../models/department.model");
const Category = require("../models/category.model");
const bcrypt = require("bcrypt");
const backup = require("../config/backup");
// const jwt = require("jsonwebtoken");

const adminController = {
  adminHome: async (req, res) => {
    res.send("admin area");
  },

  createAccount: async (req, res) => {
    try {
      const { email, password, role, confirmedPassword, department } = req.body;
      console.log(department);
      const user = await User.findOne({ email });
      if (user) req.flash("danger", "Email is already existed");

      if (password.length < 6)
        req.flash("danger", "Password is at least 6 characters long");

      if (password != confirmedPassword)
        req.flash("danger", "Confirm Password is not match");

      //password encryption
      const passwordHash = await bcrypt.hash(password, 10);
      const newUser = new User({
        email,
        role,
        password: passwordHash,
        department,
      });

      //save mongoDB
      await newUser.save();

      //create token

      // const accesstoken = createAccessToken({
      //     id: newUser._id
      // })
      // const refreshtoken = createRefreshToken({
      //     id: newUser._id
      // })

      // res.cookie('refreshtoken', refreshtoken, {
      //     httpOnly: true,
      //     path: '/user/refresh_token'
      // })
      req.flash("success", "Account Created");
      res.redirect("/admin/accounts");

      // res.render("admin/create-account", {
      //   msg: "add account success",
      //   title: "Create Account",
      // });
    } catch (error) {
      return res.status(500).send({ msg: error.message });
    }
  },
  getCreateAccount: async (req, res) => {
    try {
      const departments = await Department.find({});

      if (!departments)
        return res.status(400).send({ msg: "Department does not exist" });
      res.render("admin/create-account", {
        title: "Create Account",
        departments,
      });
    } catch (error) {
      return res.status(500).send({ msg: error.message });
    }
  },

  viewAllAccounts: async (req, res) => {
    try {
      const user = await User.find({});
      if (!user) return res.status(400).send({ msg: "User does not exist" });
      res.render("admin/view-accounts", { user });
    } catch (error) {
      return res.status(500).send({ msg: error.message });
    }
  },
  getAccountById: async (req, res) => {
    try {
      const departments = await Department.find({});

      if (!departments)
        return res.status(400).send({ msg: "Department does not exist" });
      const user = await User.findById(req.params.id);
      if (!user) return res.status(400).json({ msg: "User does not exist" });
      res.render("admin/update-account", { user, departments });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },

  updateAccount: async (req, res) => {
    try {
      const { email, role, department } = req.body;
      const user = await User.findOne({
        email,
        _id: { $ne: req.params.id },
      });
      if (user) {
        req.flash("danger", "Email is already existed");
        res.redirect("/admin/edit_account/" + req.params.id);
      }

      await User.findOneAndUpdate(
        { _id: req.params.id },
        { email, role, department }
      );

      req.flash("success", "Account updated");
      res.redirect("/admin/accounts");
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },

  deleteAccount: async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        req.flash("danger", "Account invalid");
        res.redirect("/admin/accounts");
      }

      await user.delete();
      req.flash("success", "Account deleted");
      res.redirect("/admin/accounts");
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },

  //Department

  viewAllDepartments: async (req, res) => {
    try {
      const departments = await Department.find({});
      if (!departments)
        return res.status(400).send({ msg: "User does not exist" });
      res.render("admin/create-department", { departments });
    } catch (error) {
      return res.status(500).send({ msg: error.message });
    }
  },

  createDepartment: async (req, res) => {
    try {
      const { name } = req.body;
      const department = await Department.findOne({ department_name: name });
      if (department)
        return res.status(400).send({ msg: "User does not exist" });
      const newDepartment = new Department({
        department_name: name,
      });
      await newDepartment.save();
      res.redirect("/admin/create_department");
    } catch (error) {
      return res.status(500).send({ msg: error.message });
    }
  },

  ///Campaign

  viewAllCampaigns: async (req, res) => {
    try {
      const current = new Date();
      const campaigns = await Campaign.find({});
      if (!campaigns)
        return res.status(400).send({ msg: "User does not exist" });
      res.render("admin/view-campaigns", { campaigns, current });
    } catch (error) {
      return res.status(500).send({ msg: error.message });
    }
  },
  getCreateCampaign: async (req, res) => {
    try {
      const categories = await Category.find({});
      res.render("admin/create-campaign", { categories });
    } catch (error) {
      return res.status(500).send({ msg: error.message });
    }
  },

  createCampaign: async (req, res) => {
    try {
      //only qam can create, delete category
      const { title, category, content, first_closure, final_closure } =
        req.body;

      if (final_closure <= first_closure) {
        req.flash(
          "danger",
          "Final closure date must be set after first closure date"
        );
        return res.redirect("/admin/create_campaign");
      }

      const newCampaign = new Campaign({
        title,
        category,
        name: content,
        first_closure,
        final_closure,
      });
      await Category.updateOne(
        { _id: category },
        { $push: { campaign: { campaign_id: newCampaign._id } } }
      );
      await newCampaign.save();
      req.flash("success", "Campaign created");
      return res.redirect("/admin/campaigns");
    } catch (error) {
      return res.status(500).send({ msg: error.message });
    }
  },

  updateCampaign: async (req, res) => {
    try {
      const { title, category, content, first_closure, final_closure } =
        req.body;
      if (final_closure <= first_closure) {
        req.flash(
          "danger",
          "Final closure date must be set after first closure date"
        );
        return res.redirect("/admin/campaign/" + req.params.id);
      }
      const campaign = await Campaign.findById(req.params.id);
      if (category != campaign.category) {
        await Category.updateOne(
          { _id: category },
          { $push: { campaign: { campaign_id: req.params.id } } }
        );
        await Category.updateOne(
          { _id: campaign.category },
          { $pull: { campaign: { campaign_id: req.params.id } } }
        );
      }

      await Campaign.findOneAndUpdate(
        { _id: req.params.id },
        { title, category, name: content, first_closure, final_closure }
      );
      req.flash("success", "Campaigns updated");
      res.redirect("/admin/campaigns");
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  getCampaignById: async (req, res) => {
    try {
      const categories = await Category.find({});
      const campaign = await Campaign.findById(req.params.id);
      date1st = campaign.first_closure.toISOString().slice(0, -5);
      date2rd = campaign.final_closure.toISOString().slice(0, -5);
      if (!campaign) {
        return res.redirect("admin/campaigns");
      }
      return res.render("admin/update-campaign", {
        campaign,
        categories,
        date1st,
        date2rd,
      });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },

  deleteCampaign: async (req, res) => {
    try {
      const campaign = await Campaign.findById(req.params.id);
      if (!campaign) {
        req.flash("danger", "Campaign invalid");
        res.redirect("/admin/campaigns");
      }

      await Category.updateOne(
        { _id: campaign.category },
        { $pull: { campaign: { campaign_id: req.params.id } } }
      );
      await campaign.delete();
      req.flash("success", "Campaign deleted");
      res.redirect("/admin/campaigns");
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },

  //getBackup
  getMaintain: async (req, res) => {
    res.render("admin/maintain");
  },

  getBackup: async (req, res) => {
    backup();
    res.render("admin/maintain");
  },
};

module.exports = adminController;
