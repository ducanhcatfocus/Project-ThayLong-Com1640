const router = require("express").Router();
const campaignController = require("../controllers/campaignController");
// const auth = require('../../middleware/auth')
// const authAdmin = require('../../middleware/authAdmin')

router.route("/").get(campaignController.getCampaign);
//   .post(auth, authAdmin, campaignController.createCampaign);
// router.get('/category', categoryController.getCategory)
// router.post('/category', auth, authAdmin, categoryController.getCategory)

// router
//   .route("/campaign/:id")
//   .delete(auth, authAdmin, campaignController.deleteCampaign)
//   .put(auth, authAdmin, campaignController.updateCampaign);

module.exports = router;
