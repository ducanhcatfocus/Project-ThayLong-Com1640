const router = require('express').Router()
const idealController = require('../controllers/idealController')
const auth = require('../../middleware/auth')
const authAdmin = require('../../middleware/authAdmin')
const { route } = require('./upload')

router.route('/ideals')
    .get(idealController.getIdeals)
    .post(idealController.createIdeals)
// router.get('/category', categoryController.getCategory)
// router.post('/category', auth, authAdmin, categoryController.getCategory)

router.route('/ideal/:id')
    .delete(idealController.deleteIdeals)
    .put(idealController.updateIdeals)



module.exports = router