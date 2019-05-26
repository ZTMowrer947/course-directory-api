// Imports
const Sequelize = require("sequelize");
const sequelize = require("../dbConnection");
const User = require("./User");

// Model
class Course extends Sequelize.Model {}
Course.init({
    id: {
        // Data Type
        type: Sequelize.INTEGER,

        // Auto-increment ID
        autoIncrement: true,

        // Primary key (unique and non-null)
        primaryKey: true,
    },
    title: {
        type: Sequelize.STRING(127),
        allowNull: false,
    },
    description: {
        type: Sequelize.TEXT,
        allowNull: false,
    },
    estimatedTime: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    materialsNeeded: {
        type: Sequelize.STRING,
        allowNull: true,
    },
}, {
    sequelize,
    modelName: "course",
});

// Export
module.exports = Course;