/* ========================================
   ✅ REAOSADEK - Validators
   ======================================== */

import { STAGES, STATUS, PRIORITY, STAGE_IDS } from '../config.js';

// ═══════════════════════════════════════
// 🎯 Validation Result Helper
// ═══════════════════════════════════════

/**
 * Create validation result
 */
function createResult(isValid, message = null) {
  return { isValid, message };
}

/**
 * Create validation error
 */
function createError(message) {
  return createResult(false, message);
}

/**
 * Create validation success
 */
function createSuccess() {
  return createResult(true, null);
}

// ═══════════════════════════════════════
// 📝 Required Field Validators
// ═══════════════════════════════════════

/**
 * Validate required field
 */
export function validateRequired(value, fieldName = 'الحقل') {
  if (value === null || value === undefined) {
    return createError(`${fieldName} مطلوب`);
  }
  
  if (typeof value === 'string' && value.trim().length === 0) {
    return createError(`${fieldName} مطلوب`);
  }
  
  if (Array.isArray(value) && value.length === 0) {
    return createError(`${fieldName} مطلوب`);
  }
  
  return createSuccess();
}

/**
 * Validate not empty
 */
export function validateNotEmpty(value, fieldName = 'الحقل') {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return createError(`${fieldName} لا يمكن أن يكون فارغاً`);
  }
  return createSuccess();
}

// ═══════════════════════════════════════
// 📧 Email Validators
// ═══════════════════════════════════════

/**
 * Validate email format
 */
export function validateEmail(email) {
  if (!email) return createError('البريد الإلكتروني مطلوب');
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return createError('البريد الإلكتروني غير صحيح');
  }
  
  return createSuccess();
}

// ═══════════════════════════════════════
// 📱 Phone Validators
// ═══════════════════════════════════════

/**
 * Validate Egyptian phone number
 */
export function validateEgyptianPhone(phone) {
  if (!phone) return createError('رقم الهاتف مطلوب');
  
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length !== 11 && cleaned.length !== 10) {
    return createError('رقم الهاتف يجب أن يكون 11 رقم');
  }
  
  if (!cleaned.startsWith('01') && !cleaned.startsWith('1')) {
    return createError('رقم الهاتف يجب أن يبدأ بـ 01');
  }
  
  return createSuccess();
}

/**
 * Validate phone number (international)
 */
export function validatePhone(phone) {
  if (!phone) return createError('رقم الهاتف مطلوب');
  
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  if (!phoneRegex.test(phone)) {
    return createError('رقم الهاتف غير صحيح');
  }
  
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 8 || digits.length > 15) {
    return createError('رقم الهاتف يجب أن يكون بين 8 و 15 رقم');
  }
  
  return createSuccess();
}

// ═══════════════════════════════════════
// 🔢 Number Validators
// ═══════════════════════════════════════

/**
 * Validate number
 */
export function validateNumber(value, fieldName = 'الحقل') {
  if (value === null || value === undefined || value === '') {
    return createError(`${fieldName} مطلوب`);
  }
  
  if (isNaN(Number(value))) {
    return createError(`${fieldName} يجب أن يكون رقماً`);
  }
  
  return createSuccess();
}

/**
 * Validate positive number
 */
export function validatePositiveNumber(value, fieldName = 'الحقل') {
  const numResult = validateNumber(value, fieldName);
  if (!numResult.isValid) return numResult;
  
  if (Number(value) <= 0) {
    return createError(`${fieldName} يجب أن يكون أكبر من صفر`);
  }
  
  return createSuccess();
}

/**
 * Validate non-negative number
 */
export function validateNonNegativeNumber(value, fieldName = 'الحقل') {
  const numResult = validateNumber(value, fieldName);
  if (!numResult.isValid) return numResult;
  
  if (Number(value) < 0) {
    return createError(`${fieldName} لا يمكن أن يكون سالباً`);
  }
  
  return createSuccess();
}

/**
 * Validate integer
 */
export function validateInteger(value, fieldName = 'الحقل') {
  const numResult = validateNumber(value, fieldName);
  if (!numResult.isValid) return numResult;
  
  if (!Number.isInteger(Number(value))) {
    return createError(`${fieldName} يجب أن يكون عدداً صحيحاً`);
  }
  
  return createSuccess();
}

/**
 * Validate number range
 */
export function validateNumberRange(value, min, max, fieldName = 'الحقل') {
  const numResult = validateNumber(value, fieldName);
  if (!numResult.isValid) return numResult;
  
  const num = Number(value);
  if (num < min || num > max) {
    return createError(`${fieldName} يجب أن يكون بين ${min} و ${max}`);
  }
  
  return createSuccess();
}

// ═══════════════════════════════════════
// 📏 Dimension Validators
// ═══════════════════════════════════════

/**
 * Validate dimension (width, depth, height)
 */
export function validateDimension(value, fieldName = 'البعد') {
  const numResult = validateNumber(value, fieldName);
  if (!numResult.isValid) return numResult;
  
  const num = Number(value);
  if (num <= 0) {
    return createError(`${fieldName} يجب أن يكون أكبر من صفر`);
  }
  
  if (num > 10000) {
    return createError(`${fieldName} كبير جداً (الحد الأقصى 10000 مم)`);
  }
  
  return createSuccess();
}

/**
 * Validate width
 */
export function validateWidth(value) {
  return validateDimension(value, 'العرض');
}

/**
 * Validate depth
 */
export function validateDepth(value) {
  return validateDimension(value, 'العمق');
}

/**
 * Validate height
 */
export function validateHeight(value) {
  return validateDimension(value, 'الارتفاع');
}

/**
 * Validate quantity
 */
export function validateQuantity(value) {
  const intResult = validateInteger(value, 'الكمية');
  if (!intResult.isValid) return intResult;
  
  if (Number(value) <= 0) {
    return createError('الكمية يجب أن تكون أكبر من صفر');
  }
  
  if (Number(value) > 1000) {
    return createError('الكمية كبيرة جداً (الحد الأقصى 1000)');
  }
  
  return createSuccess();
}

// ═══════════════════════════════════════
// 📝 String Validators
// ═══════════════════════════════════════

/**
 * Validate string length
 */
export function validateStringLength(value, minLength, maxLength, fieldName = 'الحقل') {
  if (!value || typeof value !== 'string') {
    return createError(`${fieldName} مطلوب`);
  }
  
  const length = value.trim().length;
  
  if (length < minLength) {
    return createError(`${fieldName} يجب أن يكون ${minLength} حرف على الأقل`);
  }
  
  if (length > maxLength) {
    return createError(`${fieldName} يجب أن يكون ${maxLength} حرف كحد أقصى`);
  }
  
  return createSuccess();
}

/**
 * Validate text (no special characters)
 */
export function validateText(value, fieldName = 'النص') {
  if (!value || value.trim().length === 0) {
    return createError(`${fieldName} مطلوب`);
  }
  
  // Allow Arabic, English, numbers, spaces, and basic punctuation
  const textRegex = /^[\u0600-\u06FFa-zA-Z0-9\s\.\,\-\_\(\)\[\]\/]+$/;
  if (!textRegex.test(value)) {
    return createError(`${fieldName} يحتوي على أحرف غير مسموحة`);
  }
  
  return createSuccess();
}

/**
 * Validate client code format
 */
export function validateClientCode(code) {
  if (!code) return createError('كود العميل مطلوب');
  
  // Allow alphanumeric and dashes
  const codeRegex = /^[A-Za-z0-9\-]+$/;
  if (!codeRegex.test(code)) {
    return createError('كود العميل يجب أن يحتوي على أحرف وأرقام فقط');
  }
  
  if (code.length < 2 || code.length > 20) {
    return createError('كود العميل يجب أن يكون بين 2 و 20 حرف');
  }
  
  return createSuccess();
}

/**
 * Validate item code format
 */
export function validateItemCode(code) {
  if (!code) return createError('كود البند مطلوب');
  
  const codeRegex = /^[A-Za-z0-9\-_]+$/;
  if (!codeRegex.test(code)) {
    return createError('كود البند يجب أن يحتوي على أحرف وأرقام وشرطات فقط');
  }
  
  if (code.length < 2 || code.length > 30) {
    return createError('كود البند يجب أن يكون بين 2 و 30 حرف');
  }
  
  return createSuccess();
}

// ═══════════════════════════════════════
// 🏭 Stage Validators
// ═══════════════════════════════════════

/**
 * Validate stage ID
 */
export function validateStage(stageId) {
  if (!stageId) return createError('المرحلة مطلوبة');
  
  if (!STAGE_IDS.includes(stageId)) {
    return createError('المرحلة غير صحيحة');
  }
  
  return createSuccess();
}

/**
 * Validate stage transition
 */
export function validateStageTransition(fromStage, toStage) {
  if (!fromStage || !toStage) {
    return createError('المرحلة المصدرية والهدفية مطلوبتان');
  }
  
  const fromIndex = STAGE_IDS.indexOf(fromStage);
  const toIndex = STAGE_IDS.indexOf(toStage);
  
  if (fromIndex === -1 || toIndex === -1) {
    return createError('مرحلة غير صحيحة');
  }
  
  // Can only move to next stage or previous stage
  if (Math.abs(toIndex - fromIndex) > 1) {
    return createError('يمكن الانتقال إلى المرحلة التالية أو السابقة فقط');
  }
  
  return createSuccess();
}

// ═══════════════════════════════════════
// 🚦 Status Validators
// ═══════════════════════════════════════

/**
 * Validate status
 */
export function validateStatus(status) {
  if (!status) return createError('الحالة مطلوبة');
  
  const validStatuses = Object.values(STATUS);
  if (!validStatuses.includes(status)) {
    return createError('الحالة غير صحيحة');
  }
  
  return createSuccess();
}

// ═══════════════════════════════════════
// 🎯 Priority Validators
// ═══════════════════════════════════════

/**
 * Validate priority
 */
export function validatePriority(priority) {
  if (!priority) return createError('الأولوية مطلوبة');
  
  const validPriorities = Object.values(PRIORITY);
  if (!validPriorities.includes(priority)) {
    return createError('الأولوية غير صحيحة');
  }
  
  return createSuccess();
}

// ═══════════════════════════════════════
// 📅 Date Validators
// ═══════════════════════════════════════

/**
 * Validate date
 */
export function validateDate(date, fieldName = 'التاريخ') {
  if (!date) return createError(`${fieldName} مطلوب`);
  
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) {
    return createError(`${fieldName} غير صحيح`);
  }
  
  return createSuccess();
}

/**
 * Validate date range
 */
export function validateDateRange(startDate, endDate) {
  const startResult = validateDate(startDate, 'تاريخ البداية');
  if (!startResult.isValid) return startResult;
  
  const endResult = validateDate(endDate, 'تاريخ النهاية');
  if (!endResult.isValid) return endResult;
  
  const start = startDate instanceof Date ? startDate : new Date(startDate);
  const end = endDate instanceof Date ? endDate : new Date(endDate);
  
  if (start > end) {
    return createError('تاريخ البداية يجب أن يكون قبل تاريخ النهاية');
  }
  
  return createSuccess();
}

/**
 * Validate date is not in the future
 */
export function validateNotFutureDate(date, fieldName = 'التاريخ') {
  const dateResult = validateDate(date, fieldName);
  if (!dateResult.isValid) return dateResult;
  
  const d = date instanceof Date ? date : new Date(date);
  if (d > new Date()) {
    return createError(`${fieldName} لا يمكن أن يكون في المستقبل`);
  }
  
  return createSuccess();
}

// ═══════════════════════════════════════
// 🔐 Password Validators
// ═══════════════════════════════════════

/**
 * Validate password strength
 */
export function validatePassword(password) {
  if (!password) return createError('كلمة المرور مطلوبة');
  
  if (password.length < 6) {
    return createError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
  }
  
  if (password.length > 50) {
    return createError('كلمة المرور طويلة جداً');
  }
  
  return createSuccess();
}

/**
 * Validate password match
 */
export function validatePasswordMatch(password, confirmPassword) {
  if (password !== confirmPassword) {
    return createError('كلمتا المرور غير متطابقتين');
  }
  return createSuccess();
}

// ═══════════════════════════════════════
// 📋 Form Validators
// ═══════════════════════════════════════

/**
 * Validate client form
 */
export function validateClientForm(data) {
  const errors = {};
  
  // Client Code
  const codeResult = validateClientCode(data.code);
  if (!codeResult.isValid) errors.code = codeResult.message;
  
  // Client Name
  const nameResult = validateRequired(data.name, 'اسم العميل');
  if (!nameResult.isValid) errors.name = nameResult.message;
  
  // Project Name
  const projectResult = validateRequired(data.projectName, 'اسم المشروع');
  if (!projectResult.isValid) errors.projectName = projectResult.message;
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate item form
 */
export function validateItemForm(data) {
  const errors = {};
  
  // Item Code
  const codeResult = validateItemCode(data.code);
  if (!codeResult.isValid) errors.code = codeResult.message;
  
  // Item Name
  const nameResult = validateRequired(data.name, 'اسم البند');
  if (!nameResult.isValid) errors.name = nameResult.message;
  
  // Dimensions
  const widthResult = validateWidth(data.width);
  if (!widthResult.isValid) errors.width = widthResult.message;
  
  const depthResult = validateDepth(data.depth);
  if (!depthResult.isValid) errors.depth = depthResult.message;
  
  const heightResult = validateHeight(data.height);
  if (!heightResult.isValid) errors.height = heightResult.message;
  
  // Quantity
  const quantityResult = validateQuantity(data.quantity);
  if (!quantityResult.isValid) errors.quantity = quantityResult.message;
  
  // Stage
  const stageResult = validateStage(data.stage);
  if (!stageResult.isValid) errors.stage = stageResult.message;
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate shortage form
 */
export function validateShortageForm(data) {
  const errors = {};
  
  // Client Code
  const clientResult = validateClientCode(data.clientCode);
  if (!clientResult.isValid) errors.clientCode = clientResult.message;
  
  // Stage
  const stageResult = validateStage(data.stage);
  if (!stageResult.isValid) errors.stage = stageResult.message;
  
  // Description
  const descResult = validateStringLength(data.description, 5, 500, 'الوصف');
  if (!descResult.isValid) errors.description = descResult.message;
  
  // Priority
  const priorityResult = validatePriority(data.priority);
  if (!priorityResult.isValid) errors.priority = priorityResult.message;
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate login form
 */
export function validateLoginForm(data) {
  const errors = {};
  
  // Username
  const usernameResult = validateRequired(data.username, 'اسم المستخدم');
  if (!usernameResult.isValid) errors.username = usernameResult.message;
  
  // Password
  const passwordResult = validateRequired(data.password, 'كلمة المرور');
  if (!passwordResult.isValid) errors.password = passwordResult.message;
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate message form
 */
export function validateMessageForm(data) {
  const errors = {};
  
  // Message content
  const contentResult = validateStringLength(data.message, 1, 2000, 'الرسالة');
  if (!contentResult.isValid) errors.message = contentResult.message;
  
  // Client ID
  const clientResult = validateRequired(data.clientId, 'العميل');
  if (!clientResult.isValid) errors.clientId = clientResult.message;
  
  // Stage
  const stageResult = validateStage(data.stage);
  if (!stageResult.isValid) errors.stage = stageResult.message;
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

// ═══════════════════════════════════════
// 📤 Import Validators
// ═══════════════════════════════════════

/**
 * Validate import data row
 */
export function validateImportRow(row, rowIndex) {
  const errors = {};
  
  // Client Code
  if (!row['Client Code']) {
    errors.clientCode = 'كود العميل مطلوب';
  }
  
  // Item Code
  if (!row['Item Code']) {
    errors.itemCode = 'كود البند مطلوب';
  }
  
  // Item Name
  if (!row['Item Name']) {
    errors.itemName = 'اسم البند مطلوب';
  }
  
  // Dimensions
  if (row['Width'] && isNaN(Number(row['Width']))) {
    errors.width = 'العرض يجب أن يكون رقماً';
  }
  
  if (row['Depth'] && isNaN(Number(row['Depth']))) {
    errors.depth = 'العمق يجب أن يكون رقماً';
  }
  
  if (row['Height'] && isNaN(Number(row['Height']))) {
    errors.height = 'الارتفاع يجب أن يكون رقماً';
  }
  
  // Quantity
  if (row['Quantity'] && (isNaN(Number(row['Quantity'])) || Number(row['Quantity']) <= 0)) {
    errors.quantity = 'الكمية يجب أن تكون رقماً موجباً';
  }
  
  // Stage
  if (row['Stage'] && !STAGE_IDS.includes(row['Stage'].toLowerCase())) {
    errors.stage = 'المرحلة غير صحيحة';
  }
  
  return {
    row: rowIndex,
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate import data
 */
export function validateImportData(data) {
  const errors = [];
  
  data.forEach((row, index) => {
    const rowResult = validateImportRow(row, index + 1);
    if (!rowResult.isValid) {
      errors.push(rowResult);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors,
    totalRows: data.length,
    validRows: data.length - errors.length,
  };
}

// ═══════════════════════════════════════
// 🎯 Generic Validators
// ═══════════════════════════════════════

/**
 * Validate multiple fields
 */
export function validateMultiple(validations) {
  const errors = {};
  
  validations.forEach(({ field, validator, value, fieldName }) => {
    const result = validator(value, fieldName);
    if (!result.isValid) {
      errors[field] = result.message;
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate with custom function
 */
export function validateCustom(value, validatorFn, errorMessage = 'القيمة غير صحيحة') {
  try {
    const isValid = validatorFn(value);
    if (!isValid) {
      return createError(errorMessage);
    }
    return createSuccess();
  } catch (error) {
    return createError(errorMessage);
  }
}

// ═══════════════════════════════════════
// 🎨 Export All
// ═══════════════════════════════════════

export default {
  // Result helpers
  createResult, createError, createSuccess,
  // Required
  validateRequired, validateNotEmpty,
  // Email
  validateEmail,
  // Phone
  validateEgyptianPhone, validatePhone,
  // Numbers
  validateNumber, validatePositiveNumber, validateNonNegativeNumber,
  validateInteger, validateNumberRange,
  // Dimensions
  validateDimension, validateWidth, validateDepth, validateHeight, validateQuantity,
  // Strings
  validateStringLength, validateText, validateClientCode, validateItemCode,
  // Stages
  validateStage, validateStageTransition,
  // Status
  validateStatus,
  // Priority
  validatePriority,
  // Dates
  validateDate, validateDateRange, validateNotFutureDate,
  // Password
  validatePassword, validatePasswordMatch,
  // Forms
  validateClientForm, validateItemForm, validateShortageForm,
  validateLoginForm, validateMessageForm,
  // Import
  validateImportRow, validateImportData,
  // Generic
  validateMultiple, validateCustom,
};