/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// Interface
interface JSONSerializable {
  toJSON(): unknown;
}

// Type check
function isJSONSerializable(object: any): object is JSONSerializable {
  return 'toJSON' in object && typeof object.toJSON === 'function';
}

// Exports
export { isJSONSerializable };
export default JSONSerializable;
