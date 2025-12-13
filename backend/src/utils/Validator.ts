import validator from 'validator';

const validateEmail = (email: string): boolean => {
    return validator.isEmail(email);
}

const validatePassword = (password: string): boolean => {
    return validator.isStrongPassword(password, {minSymbols: 0, minLength: 8, minNumbers: 1, minUppercase: 1});
}

export {validateEmail, validatePassword};