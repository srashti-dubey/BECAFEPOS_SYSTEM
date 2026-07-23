/**
 * Central, frontend-owned catalog of regexes for `patternKey`. Never sent by the API — a form
 * schema only ever carries the *key* (e.g. `patternKey: 'email'`), and the engine resolves it
 * against this constant. Add an entry here once and every field/module that references its key
 * picks it up; there is nothing to keep in sync on the backend.
 */
export const VALIDATION_REGISTRY: Record<string, string> = {
  email: '^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$',
  phone: '^[0-9]{10}$',
  mobile: '^[6-9][0-9]{9}$',
  gstin: '^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$',
  pan: '^[A-Z]{5}[0-9]{4}[A-Z]{1}$',
  sku: '^SKU-[0-9]{4}$',

  // Basic Formats
  numbersOnly: '^[0-9]+$',
  lettersOnly: '^[A-Za-z\\s]+$',
  alphanumeric: '^[A-Za-z0-9\\s]+$',
  passwordStrong: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$',

  // India Specific Enterprise
  pincode: '^[1-9][0-9]{5}$',
  price: '^\\d+(\\.\\d{1,2})?$',
  upiId: '^[a-zA-Z0-9.\\-_]{2,256}@[a-zA-Z]{2,64}$',
  creditCard: '^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13})$',

  // Character Sets
  lowercaseOnly: '^[a-z]+$',
  uppercaseOnly: '^[A-Z]+$',
  lettersWithHyphen: "^[A-Za-z\\s'-]+$",
  alphaNumericNoSpaces: '^[A-Za-z0-9]+$',
  alphaNumericWithUnderscore: '^\\w+$',
  noWhitespace: '^\\S+$',
  whitespaceOnly: '^\\s+$',
  printableAscii: '^[\\x20-\\x7E]+$',
  noSpecialCharacters: '^[A-Za-z0-9\\s]+$',

  // Numeric
  integer: '^-?\\d+$',
  positiveInteger: '^[1-9]\\d*$',
  decimal: '^-?\\d+(\\.\\d+)?$',
  percentage: '^(100|[1-9]?\\d)(\\.\\d+)?$',

  // URLs & Internet
  url: '^(https?:\\/\\/)?([\\w-]+\\.)+[\\w-]{2,}(\\/\\S*)?$',
  domain: '^(?!-)[A-Za-z0-9-]{1,63}(?<!-)\\.[A-Za-z]{2,}$',
  slug: '^[a-z0-9]+(?:-[a-z0-9]+)*$',

  // Colors
  hexColor: '^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$',

  // Network
  ipv4: '^((25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)\\.){3}(25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)$',
  macAddress: '^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$',

  // Date & Time
  dateYYYYMMDD: '^\\d{4}-\\d{2}-\\d{2}$',
  time24Hour: '^([01]\\d|2[0-3]):([0-5]\\d)$',
  monthYear: '^(0[1-9]|1[0-2])\\/\\d{2}$',

  // Documents
  aadhaar: '^\\d{12}$',
  passportIndia: '^[A-Z][1-9]\\d{6}$',
  ifsc: '^[A-Z]{4}0[A-Z0-9]{6}$',

  // Finance
  cvv: '^\\d{3,4}$',

  // UUID
  uuid: '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$',

  // Coordinates
  latitude: '^-?([1-8]?\\d(\\.\\d+)?|90(\\.0+)?)$',
  longitude: '^-?((1[0-7]\\d)|([1-9]?\\d)|180)(\\.\\d+)?$',

  // File Names
  imageFile: '^.+\\.(jpg|jpeg|png|gif|bmp|webp)$',
  pdfFile: '^.+\\.pdf$',
  excelFile: '^.+\\.(xls|xlsx)$',

  // HTML
  noHtml: '^(?!.*<[^>]+>).*$',

  // Generic Length Validators
  length0To10: '^.{0,10}$',
  length0To20: '^.{0,20}$',
  length0To50: '^.{0,50}$',
  length0To100: '^.{0,100}$',
  length0To255: '^.{0,255}$',
  length0To500: '^.{0,500}$',
  length0To1000: '^.{0,1000}$',

  length1To10: '^.{1,10}$',
  length1To20: '^.{1,20}$',
  length1To50: '^.{1,50}$',
  length1To100: '^.{1,100}$',
  length1To255: '^.{1,255}$',

  length2To3: '^.{2,3}$',
  length2To5: '^.{2,5}$',
  length2To10: '^.{2,10}$',
  length2To20: '^.{2,20}$',
  length2To50: '^.{2,50}$',

  length3To10: '^.{3,10}$',
  length3To20: '^.{3,20}$',
  length3To50: '^.{3,50}$',

  length5To10: '^.{5,10}$',
  length5To20: '^.{5,20}$',
  length5To50: '^.{5,50}$',

  minLength2: '^.{2,}$',
  minLength3: '^.{3,}$',
  minLength5: '^.{5,}$',
  minLength8: '^.{8,}$',
  minLength10: '^.{10,}$',

  maxLength10: '^.{0,10}$',
  maxLength20: '^.{0,20}$',
  maxLength50: '^.{0,50}$',
  maxLength100: '^.{0,100}$',
  maxLength255: '^.{0,255}$',
}