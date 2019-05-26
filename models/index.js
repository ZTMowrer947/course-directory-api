// Imports
const User = require("./User");
const Course = require("./Course");

// Associations
User.hasMany(Course);
Course.belongsTo(User);

// Exports
module.exports = {
    User,
    Course,
};
