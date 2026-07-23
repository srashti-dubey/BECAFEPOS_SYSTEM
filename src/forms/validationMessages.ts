/**
 * Central, frontend-owned catalog of validation error messages. A field references an entry by
 * `messageKey` instead of hardcoding text inline — rewording a message here updates every field
 * (across every module/form) that points at that key, with no schema/API change needed.
 *
 * `customErrorMessage` still exists on `DynamicValidationConfig` as a literal-string escape
 * hatch for a genuinely one-off message; prefer `messageKey` whenever the same rule (an email
 * format, a required-field convention, ...) shows up in more than one form.
 */
export const VALIDATION_MESSAGES: Record<string, string> = {
  emailFormat: 'Please enter a valid email address',
  phoneFormat: 'Contact number must be exactly 10 digits',
  mobileFormat: 'Please enter a valid mobile number',
  gstinFormat: 'Please enter a valid 15-character GSTIN',
  panFormat: 'Please enter a valid PAN',
  skuFormat: 'SKU must match the SKU-1234 format',

  // Basic Formats
  numbersOnly: 'Only numbers are allowed',
  lettersOnly: 'Only letters and spaces are allowed',
  alphanumeric: 'Only letters, numbers, and spaces are allowed',
  passwordStrong: 'Password must be 8+ characters with at least one uppercase, lowercase, number, and special character',

  // India Specific Enterprise
  pincodeFormat: 'Enter a valid 6-digit Pincode',
  priceFormat: 'Enter a valid amount (e.g., 99 or 99.50)',
  upiIdFormat: 'Enter a valid UPI ID (e.g., username@bank)',
  creditCardFormat: 'Enter a valid 15 or 16-digit credit card number',

  // Character Sets
  lowercaseOnly: 'Only lowercase letters are allowed',
  uppercaseOnly: 'Only uppercase letters are allowed',
  lettersWithHyphen: 'Only letters, spaces, apostrophes and hyphens are allowed',
  alphaNumericNoSpaces: 'Only letters and numbers are allowed',
  alphaNumericWithUnderscore: 'Only letters, numbers and underscores are allowed',
  noWhitespace: 'Spaces are not allowed',
  whitespaceOnly: 'Only whitespace is allowed',
  printableAscii: 'Contains invalid characters',
  noSpecialCharacters: 'Special characters are not allowed',

  // Numeric
  integer: 'Please enter a valid integer',
  positiveInteger: 'Please enter a positive integer',
  decimal: 'Please enter a valid decimal number',
  percentage: 'Please enter a percentage between 0 and 100',

  // Internet
  url: 'Please enter a valid URL',
  domain: 'Please enter a valid domain name',
  slug: 'Please enter a valid slug',

  // Color
  hexColor: 'Please enter a valid hex color',

  // Network
  ipv4: 'Please enter a valid IPv4 address',
  macAddress: 'Please enter a valid MAC address',

  // Date & Time
  dateYYYYMMDD: 'Date must be in YYYY-MM-DD format',
  time24Hour: 'Time must be in 24-hour format',
  monthYear: 'Expiry must be in MM/YY format',

  // Documents
  aadhaar: 'Please enter a valid 12-digit Aadhaar number',
  passportIndia: 'Please enter a valid passport number',
  ifsc: 'Please enter a valid IFSC code',

  // Finance
  cvv: 'Please enter a valid CVV',

  // UUID
  uuid: 'Please enter a valid UUID',

  // Coordinates
  latitude: 'Please enter a valid latitude',
  longitude: 'Please enter a valid longitude',

  // Files
  imageFile: 'Only image files are allowed',
  pdfFile: 'Only PDF files are allowed',
  excelFile: 'Only Excel files are allowed',

  // HTML
  noHtml: 'HTML tags are not allowed',

  // Length
  length0To10: 'Must be between 0 and 10 characters',
  length0To20: 'Must be between 0 and 20 characters',
  length0To50: 'Must be between 0 and 50 characters',
  length0To100: 'Must be between 0 and 100 characters',
  length0To255: 'Must be between 0 and 255 characters',
  length0To500: 'Must be between 0 and 500 characters',
  length0To1000: 'Must be between 0 and 1000 characters',

  length1To10: 'Must be between 1 and 10 characters',
  length1To20: 'Must be between 1 and 20 characters',
  length1To50: 'Must be between 1 and 50 characters',
  length1To100: 'Must be between 1 and 100 characters',
  length1To255: 'Must be between 1 and 255 characters',

  length2To3: 'Must be between 2 and 3 characters',
  length2To5: 'Must be between 2 and 5 characters',
  length2To10: 'Must be between 2 and 10 characters',
  length2To20: 'Must be between 2 and 20 characters',
  length2To50: 'Must be between 2 and 50 characters',

  length3To10: 'Must be between 3 and 10 characters',
  length3To20: 'Must be between 3 and 20 characters',
  length3To50: 'Must be between 3 and 50 characters',

  length5To10: 'Must be between 5 and 10 characters',
  length5To20: 'Must be between 5 and 20 characters',
  length5To50: 'Must be between 5 and 50 characters',

  minLength2: 'Must contain at least 2 characters',
  minLength3: 'Must contain at least 3 characters',
  minLength5: 'Must contain at least 5 characters',
  minLength8: 'Must contain at least 8 characters',
  minLength10: 'Must contain at least 10 characters',

  maxLength10: 'Must not exceed 10 characters',
  maxLength20: 'Must not exceed 20 characters',
  maxLength50: 'Must not exceed 50 characters',
  maxLength100: 'Must not exceed 100 characters',
  maxLength255: 'Must not exceed 255 characters',
}