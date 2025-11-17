export interface PasswordValidationResult {
    isValid: boolean;
    errors: string[];
  }
  
  export const validatePassword = (password: string): PasswordValidationResult => {
    const errors: string[] = [];
  
    if (!password) {
      errors.push("Password is required");
      return { isValid: false, errors };
    }
  
    if (password.length < 8) {
      errors.push("Password must be at least 8 characters long");
    }
  
    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
    }
  
    if (!/[0-9]/.test(password)) {
      errors.push("Password must contain at least one number");
    }
  
    return {
      isValid: errors.length === 0,
      errors
    };
  };
  
  export const validateEmail = (email: string): boolean => {
    if (!email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  export const validateName = (name: string): boolean => {
    return Boolean(name && name.trim().length > 0);
  };