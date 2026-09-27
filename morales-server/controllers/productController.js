const Product = require("../models/productModel");
const mongoose = require("mongoose");
const Category = require("../models/categoryModel");
const Supplier = require("../models/supplierModel");
const { HttpStatus } = require("../config/constants");
const cloudinary = require("../config/cloudinary");

const response = (success, message, count, data) => ({ success, message, count, data });
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const supplierFilter = (req) => req.user.userRole === "supplier" ? { supplierId: req.user.affiliation } : {};
const canManageProduct = (req, product) => req.user.userRole === "admin" || product.supplierId?.toString() === req.user.affiliation;
const editableProductFields = [
  "productName",
  "productSlug",
  "productDescription",
  "productPrice",
  "categoryId",
  "supplierId",
  "productImage",
  "stockQuantity",
  "stockStatus",
  "isActive",
];

const pickProductFields = (body) => Object.fromEntries(
  editableProductFields
    .filter((field) => Object.hasOwn(body || {}, field))
    .map((field) => [field, body[field]]),
);

const uploadImage = (file) => new Promise((resolve, reject) => {
  const uploadStream = cloudinary.uploader.upload_stream(
    { folder: "bulldogs-exchange/products", resource_type: "image" },
    (error, result) => error ? reject(error) : resolve(result),
  );
  uploadStream.end(file.buffer);
});

const destroyCloudinaryImage = async (publicId) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
  } catch (error) {
    console.error(`Unable to remove Cloudinary image ${publicId}: ${error.message}`);
  }
};

const uploadProductImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: "An image file is required.",
      });
    }

    const product = await Product.findById(req.params.id).select("+productImagePublicId");
    if (!product) {
      return res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        message: "Product not found.",
      });
    }

    const previousPublicId = product.productImagePublicId;
    const result = await uploadImage(req.file);

    try {
      product.productImage = result.secure_url;
      product.productImagePublicId = result.public_id;
      await product.save();
    } catch (error) {
      await destroyCloudinaryImage(result.public_id);
      throw error;
    }

    await destroyCloudinaryImage(previousPublicId);

    res.status(HttpStatus.OK).json({
      success: true,
      message: "Product image uploaded successfully.",
      imageUrl: result.secure_url,
      publicId: result.public_id,
      productId: product._id,
    });
  } catch (error) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

const getProducts = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 10);
    const skip = (page - 1) * limit;
    const filter = { isActive: { $ne: false } };
    const sort = {};
    const sortFields = { price: "productPrice", name: "productName", createdAt: "createdAt" };

    if (req.query.sort) {
      const descending = req.query.sort.startsWith("-");
      const field = sortFields[req.query.sort.replace(/^-/, "")];
      if (field) sort[field] = descending ? -1 : 1;
    }

    if (req.query.category) {
      const category = await Category.findOne({
        categoryName: req.query.category.trim(),
      });

      if (!category) {
        return res.json(response(true, "Products retrieved successfully.", 0, []));
      }
      filter.categoryId = category._id;
    }

    if (req.query.supplier) {
      const supplier = await Supplier.findOne({ supplierName: req.query.supplier.trim() });
      if (!supplier) return res.json(response(true, "Products retrieved successfully.", 0, []));
      filter.supplierId = supplier._id;
    }

    if (req.query.search) {
      const search = new RegExp(escapeRegex(req.query.search.trim()), "i");
      filter.$or = [
        { productName: search },
        { productDescription: search },
        { productSlug: search },
      ];
    }

    const [products, count] = await Promise.all([
      Product.find(filter)
      .populate("categoryId", "categoryName")
      .populate("supplierId", "supplierName supplierEmail supplierPhone supplierAddress")
      .sort(sort)
      .skip(skip)
      .limit(limit),
      Product.countDocuments(filter),
    ]);

    res.json(response(true, "Products retrieved successfully.", count, products));
  } catch (error) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

const getAdminProducts = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 50);
    const filter = supplierFilter(req);
    if (req.query.search) {
      const search = new RegExp(escapeRegex(req.query.search.trim()), "i");
      filter.$or = [{ productName: search }, { productDescription: search }, { productSlug: search }];
    }
    if (req.query.categoryId) filter.categoryId = req.query.categoryId;
    if (req.user.userRole === "admin" && req.query.supplierId) filter.supplierId = req.query.supplierId;
    if (req.query.active === "true" || req.query.active === "false") filter.isActive = req.query.active === "true";
    const [products, count] = await Promise.all([
      Product.find(filter).populate("categoryId", "categoryName").populate("supplierId", "supplierName").sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      Product.countDocuments(filter),
    ]);
    res.json(response(true, "Products retrieved successfully.", count, products));
  } catch (error) { res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message }); }
};


const getProduct = async (req, res) => {
  try {
    const productFilter = mongoose.isValidObjectId(req.params.id)
      ? { _id: req.params.id }
      : { productSlug: req.params.id };
    const product = await Product.findOne({ ...productFilter, isActive: { $ne: false } })
      .populate("categoryId", "categoryName")
      .populate("supplierId", "supplierName supplierEmail supplierPhone supplierAddress");
    if (!product)
      return res.status(HttpStatus.NOT_FOUND).json({ message: "Product not found." });
    res.json(response(true, "Product retrieved successfully.", 1, product));
  } catch (error) {
    res.status(HttpStatus.BAD_REQUEST).json({ message: error.message });
  }
};
const createProduct = async (req, res) => {
  let uploadedImage;
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: "Request body is required. Send the product data as JSON.",
      });
    }

    const productData = pickProductFields(req.body);
    if (req.user.userRole === "supplier") productData.supplierId = req.user.affiliation;
    if (req.file) {
      uploadedImage = await uploadImage(req.file);
      productData.productImage = uploadedImage.secure_url;
      productData.productImagePublicId = uploadedImage.public_id;
    }
    res.status(HttpStatus.CREATED).json(response(true, "Product created successfully.", 1, await Product.create(productData)));
  } catch (error) {
    if (uploadedImage?.public_id) await destroyCloudinaryImage(uploadedImage.public_id);
    res.status(HttpStatus.BAD_REQUEST).json({ message: error.message });
  }
};
const updateProduct = async (req, res) => {
  let uploadedImage;
  try {
    const existingProduct = await Product.findById(req.params.id).select("+productImagePublicId");
    if (!existingProduct)
      return res.status(HttpStatus.NOT_FOUND).json({ message: "Product not found." });
    if (!canManageProduct(req, existingProduct)) {
      return res.status(HttpStatus.FORBIDDEN).json({ message: "You can only edit products affiliated with your supplier." });
    }
    const previousPublicId = existingProduct.productImagePublicId;
    const updates = pickProductFields(req.body);
    if (req.user.userRole === "supplier") delete updates.supplierId;

    if (req.file) {
      uploadedImage = await uploadImage(req.file);
      updates.productImage = uploadedImage.secure_url;
      updates.productImagePublicId = uploadedImage.public_id;
    } else if (Object.hasOwn(updates, "productImage") && updates.productImage !== existingProduct.productImage) {
      updates.productImagePublicId = "";
    }

    Object.assign(existingProduct, updates);
    const product = await existingProduct.save();

    if (previousPublicId && previousPublicId !== product.productImagePublicId) {
      await destroyCloudinaryImage(previousPublicId);
    }
    res.json(response(true, "Product updated successfully.", 1, product));
  } catch (error) {
    if (uploadedImage?.public_id) await destroyCloudinaryImage(uploadedImage.public_id);
    res.status(HttpStatus.BAD_REQUEST).json({ message: error.message });
  }
};
const deleteProduct = async (req, res) => {
  try {
    const existingProduct = await Product.findById(req.params.id).select("+productImagePublicId");
    if (!existingProduct) return res.status(HttpStatus.NOT_FOUND).json({ message: "Product not found." });
    if (!canManageProduct(req, existingProduct)) return res.status(HttpStatus.FORBIDDEN).json({ message: "You can only delete products affiliated with your supplier." });
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product)
      return res.status(HttpStatus.NOT_FOUND).json({ message: "Product not found." });
    await destroyCloudinaryImage(existingProduct.productImagePublicId);
    res.json(response(true, "Product deleted successfully.", 1, product));
  } catch (error) {
    res.status(HttpStatus.BAD_REQUEST).json({ message: error.message });
  }
};
module.exports = {
  uploadProductImage,
  getProducts,
  getAdminProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};
