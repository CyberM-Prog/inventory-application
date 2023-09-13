const Category = require("../models/category");
const Item = require("../models/item");
const { body, validationResult } = require("express-validator");

const asyncHandler = require("express-async-handler");

exports.index = asyncHandler(async (req, res, next) => {
    const [numCategories, numItems] = await Promise.all([
        Category.countDocuments({}).exec(),
        Item.countDocuments({}).exec(),
    ]);

    res.render("index", {
        title: "Computer Components Inventory",
        category_count: numCategories,
        item_count: numItems,
    });
});

exports.category_list = asyncHandler(async (req, res, next) => {
    const allCategories = await Category.find().exec()

    res.render("category_list", {
        title: "Categories",
        categories: allCategories
    })
})

exports.category_detail = asyncHandler(async (req, res, next) => {
    const [category, items] = await Promise.all([
      Category.findById(req.params.id).exec(),
      Item.find({ category: req.params.id }).exec(),
    ]);
  
    if (category === null) {
      // No results.
      const err = new Error("Category not found");
      err.status = 404;
      return next(err);
    }
  
    res.render("category_detail", {
      title: category.name,
      category: category,
      items: items,
    });
  });
