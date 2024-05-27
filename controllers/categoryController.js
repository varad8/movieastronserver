const Category = require("../models/Category");

const addCategory = async (req, res) => {
  const { name } = req.body;
  try {
    const category = new Category({ name });
    await category.save();
    res
      .status(201)
      .send({ message: "Category created successfully.", category });
  } catch (error) {
    res.status(400).send({ error: "Error creating category." + error });
  }
};

const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    const category = await Category.findByIdAndUpdate(
      id,
      { name },
      { new: true, runValidators: true }
    );
    if (!category) {
      return res.status(404).send({ error: "Category not found." });
    }
    res.send({ message: "Category updated successfully.", category });
  } catch (error) {
    res.status(400).send({ error: "Error updating category." });
  }
};

const deleteCategory = async (req, res) => {
  const { id } = req.params;
  try {
    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      return res.status(404).send({ error: "Category not found." });
    }
    res.send({ message: "Category deleted successfully." });
  } catch (error) {
    res.status(400).send({ error: "Error deleting category." });
  }
};

const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.send(categories);
  } catch (error) {
    res.status(400).send({ error: "Error fetching categories." });
  }
};

const getCategoryById = async (req, res) => {
  const { id } = req.params;
  try {
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).send({ error: "Category not found." });
    }
    res.send(category);
  } catch (error) {
    res.status(400).send({ error: "Error fetching category." });
  }
};

module.exports = {
  addCategory,
  updateCategory,
  deleteCategory,
  getAllCategories,
  getCategoryById,
};
