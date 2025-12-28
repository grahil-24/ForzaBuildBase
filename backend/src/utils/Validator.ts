import validator from 'validator';

const validateEmail = (email?: string): boolean => {
    if(email) return validator.isEmail(email)
    return false;
}

const validatePassword = (password?: string): boolean => {
    if(password) return validator.isStrongPassword(password, {minSymbols: 0, minLength: 8, minNumbers: 1, minUppercase: 1});
    return false;
}

const validateUsername = (username?: string): boolean => {
    if(username) return validator.isLength(username, {min: 4, max: 30});
    return false
}
export {validateEmail, validatePassword, validateUsername};