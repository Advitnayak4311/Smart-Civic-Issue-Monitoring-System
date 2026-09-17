import Department from "../models/Department.js";

export const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find().sort({ name: 1 });

    res.json({
      success: true,
      departments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const createDepartment = async (req, res) => {
  try {
    const { name } = req.body;

    const exists = await Department.findOne({ name });

    if (exists) {
      return res.json({
        success: false,
        message: "Department already exists",
      });
    }

    const department = await Department.create({ name });

    res.json({
      success: true,
      department,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};