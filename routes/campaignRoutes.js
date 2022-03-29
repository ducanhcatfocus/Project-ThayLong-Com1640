const express = require('express')
const router = express.Router()
const campaignController = require('../controllers/campaignController')


// app router


router.get('/', campaignController.getCampaign)

module.exports = router