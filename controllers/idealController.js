const Idea = require("../models/ideal.model");

const ideaController = {
  getList: async (req, res, next) => {
    try {
      let perPage = 5; // số lượng sản phẩm xuất hiện trên 1 page
      let page = req.params.page || 1;
      const sort = req.query.sort;
      console.log(sort);
      var a = { title: -1 };
      if (sort == 1) {
        a = { numberOfViews: -1 };
      }
      console.log(a);
      Idea.find() // find tất cả các data
        .skip(perPage * page - perPage)
        .sort(a) // Trong page đầu tiên sẽ bỏ qua giá trị là 0
        .limit(perPage)
        .exec((err, ideas) => {
          Idea.countDocuments((err, count) => {
            if (err) return next(err);
            res.render("list-ideas", {
              ideas,
              current: page,
              pages: Math.ceil(count / perPage),
              title: "List of Ideas",
            }); // Trả về dữ liệu các sản phẩm theo định dạng như JSON, XML,...
          });
        });
    } catch (error) {}
  },
};

module.exports = ideaController;
