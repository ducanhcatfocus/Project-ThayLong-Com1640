const Category = require("../models/category.model");
const Campaign = require("../models/campaign.model");

const qamController = {
  viewAllCategories: async (req, res) => {
    try {
      const categories = await Category.find({});
      if (!categories)
        return res.status(400).send({ msg: "User does not exist" });
      res.render("qam/view-categories", { categories });
    } catch (error) {
      return res.status(500).send({ msg: error.message });
    }
  },
  createCategory: async (req, res) => {
    try {
      //only qam can create, delete category
      const { name } = req.body;
      const category = await Category.findOne({ category: name });
      if (category)
        return res.status(400).send({ msg: "this category is already exists" });
      const newCategory = new Category({ category: name });
      await newCategory.save();
      return res.redirect("/qam/");
    } catch (error) {
      return res.status(500).send({ msg: error.message });
    }
  },

  deleteCategory: async (req, res) => {
    try {
      const category = await Category.findById(req.params.id);
      if (!category) {
        req.flash("danger", "Category invalid");
        return res.redirect("/qam/");
      }
      if (category.campaign.length != 0) {
        req.flash("danger", "Cannot delete category");
        return res.redirect("/qam/");
      }
      await category.delete();
      req.flash("success", "Category deleted");
      res.redirect("/qam/");
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },

  updateCategory: async (req, res) => {
    try {
      const { name } = req.body;
      const category = await Category.findOne({
        category: name,
        _id: { $ne: req.params.id },
      });
      if (category) {
        req.flash("danger", "Category is already existed");
        return res.redirect("/qam/");
      }

      await Category.findOneAndUpdate(
        { _id: req.params.id },
        { category: name }
      );

      req.flash("success", "Account updated");
      res.redirect("/qam/");
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
};

module.exports = qamController;
