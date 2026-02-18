import bcrypt from 'bcrypt';

const saltRounds: number = 10;

const hashPassword = async (password: string): Promise<string> => {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
}

const comparePasswords = async(plaintextPwd: string, hashedPwd: string): Promise<boolean> => {
    return await bcrypt.compare(plaintextPwd, hashedPwd);
}

export {hashPassword, comparePasswords};