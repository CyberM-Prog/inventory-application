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
    const allCategories = await Category.find().exec();

    res.render("category_list", {
        title: "Categories",
        categories: allCategories,
    });
});

exports.category_detail = asyncHandler(async (req, res, next) => {
    const [category, items] = await Promise.all([
        Category.findById(req.params.id).exec(),
        Item.find({ category: req.params.id }).exec(),
    ]);

    if (category === null) {
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

exports.category_create_get = asyncHandler(async (req, res, next) => {
    res.render("category_form", {
        title: "Create Category",
        name: undefined,
        description: undefined,
        errors: undefined,
    });
});

exports.category_create_post = [
    body("name", "Name must not be empty.")
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body("description", "Description must not be empty.")
        .trim()
        .isLength({ min: 1 })
        .escape(),

    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);

        const category = new Category({
            name: req.body.name,
            description: req.body.description,
        });

        if (!errors.isEmpty()) {
            res.render("category_form", {
                title: "Create Category",
                name,
                description,
                errors: errors.array(),
            });
        } else {
            await category.save();
            res.redirect(category.url);
        }
    }),
];

exports.category_delete_get = asyncHandler(async (req, res, next) => {
    const [category, allItemsOfCategory] = await Promise.all([
        Category.findById(req.params.id).exec(),
        Item.find({ category: req.params.id }).exec(),
    ]);

    if (category === null) {
        res.redirect("/categories");
    }

    res.render("category_delete", {
        category,
        items: allItemsOfCategory,
    });
});

exports.category_delete_post = asyncHandler(async (req, res, next) => {
    const [category, allItemsOfCategory] = await Promise.all([
        Category.findById(req.params.id).exec(),
        Item.find({ category: req.params.id }).exec(),
    ]);

    if (allItemsOfCategory.length > 0) {
        res.render("category_delete", {
            category,
            items: allItemsOfCategory,
        });
        return;
    } else {
        await Category.findByIdAndRemove(req.body.categoryid);
        res.redirect("/categories");
    }
});

exports.category_update_get = asyncHandler(async (req, res, next) => {
    const category = await Category.findById(req.params.id).exec();

    if (category === null) {
        const err = new Error("Category not found");
        err.status = 404;
        return next(err);
    }

    res.render("category_form", {
        title: "Update Category",
        name: category.name,
        description: category.description,
        errors: undefined,
    });
});

exports.category_update_post = [
    body("name", "Name must not be empty.")
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body("description", "Description must not be empty.")
        .trim()
        .isLength({ min: 1 })
        .escape(),

    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);

        const category = new Category({
            name: req.body.name,
            description: req.body.description,
            _id: req.params.id,
        });

        if (!errors.isEmpty()) {
            res.render("category_form", {
                title: "Update Category",
                name,
                description,
                errors: errors.array(),
            });
            return;
        } else {
            const updatedCategory = await Category.findByIdAndUpdate(
                req.params.id,
                category,
                {}
            );
            res.redirect(updatedCategory.url);
        }
    }),
];
