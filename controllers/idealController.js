const Ideal = require('../models/ideal.model')


//Filter,  sorting nd paginating

class APIfeature {
    constructor(query, queryString){
        this.query = query;
        this.queryString = queryString;
    }

    filtering(){
        const queryObj = {...this.queryString}  // queryString = req.query
        console.log(queryObj)
        const excludedFields = ['page', 'sort', 'limit']
        excludedFields.forEach(el => delete(queryObj[el]))

        let queryStr = JSON.stringify(queryObj)

        queryStr = queryObj.replace(/\b(gte|gt|lt|lte|regex)\b/g, match => '$' + match)


        // gte = greater than or equal
        //lte = less than or equal
        // lt = less than
        //gt = greater than
        this.query.find(JSON.parse(queryStr))

        return this;

    }
    sorting(){
        if(this.queryString.sort){
            const sortBy = this.queryString.sort.split(',').join(' ')
            this.query = this.query.sort(sortBy)
        }else{
            this.query = this.query.sort('-createdAt')
        }

        return this;
    }
    paginating(){
        const page = this.queryString.page * 1 || 1
        const limit = this.queryString.limit * 1 || 3
        const skip = (page - 1) * limit
        this.query = this.query.skip(skip).limit()
        return this;

    }
}


const idealController = {
    getIdeals: async(req, res) =>{
        try {
            console.log(req.query)
            const features = new APIfeature(Ideal.find(), req.query).sorting().paginating()
            const ideals = await features.query
            res.json({
                status: 'success',
                result: ideals.length,
                ideals: ideals
            })
        } catch (error) {
            return res.status(500).json({msg: error.message})
        }
    },

    createIdeals: async(req, res) =>{
        try {
            const { campaign_id, user_id, content, upload_file } = req.body

            const newIdeal = new Ideal({
                campaign_id, user_id, content, upload_file
            })

            await newIdeal.save()
            res.json({msg: "upload ideal"})

        } catch (error) {
            return res.status(500).json({msg: error.message})
        }
    },

    deleteIdeals: async(req, res) =>{
        try {
            await Ideal.findByIdAndDelete(req.params.id)
            res.json({msg: "Delete Ideal"})
        } catch (error) {
            return res.status(500).json({msg: error.message})
        }
    },

    updateIdeals: async(req, res) =>{
        try {
            const { campaign_id, user_id, content, upload_file } = req.body
            await Ideal.findOneAndUpdate({_id: req.params.id},{
                campaign_id, user_id, content, upload_file 
            })

            res.json({msg: "Updated Ideal"})
        } catch (error) {
            return res.status(500).json({msg: error.message})
        }
    }
}

module.exports = idealController