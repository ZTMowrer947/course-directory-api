require("@babel/register")({
    extensions: [".ts"],
});

module.exports = require("./ormconfig.ts").default;
