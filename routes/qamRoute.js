const router = require("express").Router();
// const auth = require('../../middleware/auth')
// const authAdmin = require('../../middleware/authAdmin')
const qamController = require("../controllers/qamController");

router.route("/").get(qamController.viewAllCategories);
router.route("/create_category").post(qamController.createCategory);
router.route("/delete_category/:id").get(qamController.deleteCategory);
// router.post('/category', auth, authAdmin, categoryController.getCategory)

router.route("/edit_category/:id").post(qamController.updateCategory);

module.exports = router;
