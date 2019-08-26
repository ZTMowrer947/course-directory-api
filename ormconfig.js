/* eslint-disable @typescript-eslint/no-var-requires */
require("@babel/register")({
    extensions: [".ts"],
});

module.exports = require("./ormconfig.ts").default;
