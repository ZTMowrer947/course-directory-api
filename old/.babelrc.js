// Babel configuration
module.exports = {
    // Presets
    presets: [
        // Environment
        [
            "@babel/preset-env",
            {
                // Use core-js 3
                corejs: 3,

                // Add builtins based on usage
                useBuiltIns: "usage",

                // Target current node version
                targets: {
                    node: true,
                },
            },
        ],

        // TypeScript
        "@babel/preset-typescript",
    ],

    // Plugins
    plugins: [
        // TypeScript metadata
        "babel-plugin-transform-typescript-metadata",

        // Decorators
        ["@babel/plugin-proposal-decorators", { legacy: true }],

        // Class properties
        ["@babel/plugin-proposal-class-properties", { loose: true }],

        // Require runtime
        "@babel/plugin-transform-runtime",
    ],
};
