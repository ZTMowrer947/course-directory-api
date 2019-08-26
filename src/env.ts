// Module
export default (() => {
    // Consider environment
    switch (process.env.NODE_ENV) {
        case "production":
        case "prod":
            return "production";

        case "staging":
        case "testing":
        case "test":
            return "staging";

        case "development":
        case "dev":
        default:
            return "development";
    }
})();
