// Imports
const Sequelize = require("sequelize");
const sequelize = require("../dbConnection");
const Course = require("./Course");

// Model
class User extends Sequelize.Model {}
User.init({
    id: {
        // Data Type
        type: Sequelize.INTEGER,

        // Auto-increment ID
        autoIncrement: true,

        // Primary key (unique and non-null)
        primaryKey: true,
    },
    firstName: {
        type: Sequelize.STRING(96),
        
        // Do not allow null values
        allowNull: false,
    },
    lastName: {
        type: Sequelize.STRING(96),
        allowNull: false,
    },
    emailAddress: {
        type: Sequelize.STRING(127),
        allowNull: false,
        // Ensure that each email is unique
        unique: true,
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false,
    },
}, {
    sequelize,
    modelName: "user",
});

// Export
module.exports = User;
