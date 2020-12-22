// Interface
interface JSONSerializable {
    toJSON(): object;
}

// Type check
function isJSONSerializable(object: any): object is JSONSerializable {
    return "toJSON" in object && typeof object.toJSON === "function";
}

// Exports
export { isJSONSerializable };
export default JSONSerializable;
