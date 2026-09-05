const SowValidator = require("./sow-validator");

/**
 * Backward compatibility alias for Google PSF/DAF Validator
 */
class PsfValidator extends SowValidator {
  validate(rawText, metadata = {}) {
    return super.validate(rawText, { ...metadata, provider: "google" });
  }
}

module.exports = PsfValidator;
