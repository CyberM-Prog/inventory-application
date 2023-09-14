const Category = require("../models/category");
const Item = require("../models/item");
const { body, validationResult } = require("express-validator");

const asyncHandler = require("express-async-handler");

exports.item_list = asyncHandler(async (req, res, next) => {
    const allItems = await Item.find().exec();

    res.render("item_list", {
        title: "Items",
        items: allItems,
    });
});

exports.item_detail = asyncHandler(async (req, res, next) => {
    const item = await Item.findById(req.params.id).populate("category").exec();

    if (item === null) {
        const err = new Error("Item not found");
        err.status = 404;
        return next(err);
    }

    res.render("item_detail", {
        title: item.name,
        item: item,
    });
});

exports.item_create_get = asyncHandler(async (req, res, next) => {
    const allCategories = await Category.find().exec();

    res.render("item_form", {
        title: "Create Item",
        name: undefined,
        description: undefined,
        errors: undefined,
        categories: allCategories,
        price: undefined,
        stock: undefined,
    });
});

exports.item_create_post = [
    body("name", "Name must not be empty.")
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body("description", "Description must not be empty.")
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body("price", "Price must not be empty.")
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body("stock", "Stock must not be empty.")
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body("category", "Category must not be empty.")
        .trim()
        .isLength({ min: 1 })
        .escape(),

    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);

        const item = new Item({
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            stock: req.body.stock,
            category: req.body.category,
        });

        if (!errors.isEmpty()) {
            res.render("item_form", {
                title: "Create Item",
                name,
                description,
                price,
                stock,
                category,
                errors: errors.array(),
            });
        } else {
            await item.save();
            res.redirect(item.url);
        }
    }),
];

exports.item_delete_get = asyncHandler(async (req, res, next) => {
    const item = await Item.findById(req.params.id).exec();

    if (item === null) {
        res.redirect("/items");
    }

    res.render("item_delete", {
        item,
    });
});

exports.item_delete_post = asyncHandler(async (req, res, next) => {
    await Item.findByIdAndRemove(req.body.itemid);
    res.redirect("/items");
});

exports.item_update_get = asyncHandler(async (req, res, next) => {
    const [item, allCategories] = await Promise.all([
        Item.findById(req.params.id).populate("category").exec(),
        Category.find().exec(),
    ]);

    if (item === null) {
        const err = new Error("Item not found");
        err.status = 404;
        return next(err);
    }

    res.render("item_form", {
        title: "Update Item",
        name: item.name,
        description: item.description,
        price: item.price,
        stock: item.stock,
        itemCategory: item.category,
        categories: allCategories,
        errors: undefined,
    });
});

exports.item_update_post = [
    body("name", "Name must not be empty.")
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body("description", "Description must not be empty.")
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body("price", "Price must not be empty.")
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body("stock", "Stock must not be empty.")
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body("category", "Category must not be empty.")
        .trim()
        .isLength({ min: 1 })
        .escape(),

    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);

        const item = new Item({
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            stock: req.body.stock,
            category: req.body.category,
            _id: req.params.id,
        });

        if (!errors.isEmpty()) {
            res.render("item_form", {
                title: "Create Item",
                name,
                description,
                price,
                stock,
                category,
                errors: errors.array(),
            });
            return;
        } else {
            const updatedItem = await Item.findByIdAndUpdate(
                req.params.id,
                item,
                {}
            );
            res.redirect(updatedItem.url);
        }
    }),
];
