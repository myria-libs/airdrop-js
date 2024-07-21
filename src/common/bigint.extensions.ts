/* eslint-disable */
/**
 * Common module.
 * @module Common
 */

/**
 * Extension for BigInt
 * @interface BigInt
 */
interface BigInt {
    toJSON(): string;
}
/**
 * Serialize BigInt to JSON
 * @function
 * @name toJSON
 */
BigInt.prototype.toJSON = function () {
    return this.toString();
};
