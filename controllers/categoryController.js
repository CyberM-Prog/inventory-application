const Category = require("../models/category");
const Item = require("../models/item");
const { body, validationResult } = require("express-validator");

const asyncHandler = require("express-async-handler");

exports.index = asyncHandler(async (req, res, next) => {
    // Get details of books, book instances, authors and genre counts (in parallel)
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
