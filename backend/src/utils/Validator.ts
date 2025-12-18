import validator from 'validator';

const validateEmail = (email: string): boolean => {
    return validator.isEmail(email);
}

const validatePassword = (password: string): boolean => {
    return validator.isStrongPassword(password, {minSymbols: 0, minLength: 8, minNumbers: 1, minUppercase: 1});
}

const validateUsername = (username: string): boolean => {
    return validator.isLength(username, {min: 4, max: 30});
}
export {validateEmail, validatePassword, validateUsername};