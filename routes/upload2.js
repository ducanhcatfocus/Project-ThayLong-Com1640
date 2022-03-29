const router = require('express').Router()
const cloudinary = require('cloudinary')
const auth = require('../../middleware/auth')
const authAdmin = require('../../middleware/authAdmin')
const fs = require('fs')


//upload to cloudinary

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
})

router.post('/upload', (req, res) =>{
    try {
        // console.log(req.files)
        if(!req.files || Object.keys(req.files).length === 0)
            return res.status(400).json({msg: 'No file were uploaded'})

        const file = req.files.file
        if(file.size > 1024*1024*5){
            removeTmp(file.tempFilePath)
            return res.status(400).json({msg: 'File is too big'})
        }

        // if(file.mimetype != "image/jpge")

        cloudinary.v2.uploader.upload(file.tempFilePath, {folder: "test",  resource_type: "auto"},  async(err, result) =>{
            if(err) throw err;
            removeTmp(file.tempFilePath)
            console.log(result)
            res.json({public_id: result.public_id, url: result.secure_url})
        })
        // res.json('test upload')

    } catch (error) {
            return res.status(500).json({msg: error.message})
    }
})

router.post('/destroy', (req, res) =>{
    try {
        const {public_id} = req.body
        if(!public_id) return res.status(400).json({msg: 'No file selected'})

        cloudinary.v2.uploader.destroy(public_id, async(err, result) =>{
            if(err) throw err;
            res.json({msg:'Deleted file'})
        })

    } catch (error) {
        return res.status(500).json({msg: error.message})
        
    }
})

const removeTmp = (path) =>{
    fs.unlink(path, err =>{
        if(err) throw err
    })
}

module.exports = router
