var Validator = require("multicoin-address-validator");

/**
 * Validates a cryptocurrency address. Supports multiple coins.
 *
 * Based on the npm package: 'multicoin-address-validator'
 */
export default function validateAddress(address: string, crypto: string) {
  return Validator.validate(address, crypto);
}
