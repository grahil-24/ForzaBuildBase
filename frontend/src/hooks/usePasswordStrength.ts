import { useState } from "react";

export interface PasswordStrengthState {
    min_chars: boolean;
    uppercase_char_present: boolean;
    numerical_char_present: boolean;
}

export function usePasswordStrength() {
    const [pwdStrength, setPwdStrength] = useState<PasswordStrengthState>({
        min_chars: false,
        uppercase_char_present: false,
        numerical_char_present: false,
    });

    const validatePassword = (password: string): PasswordStrengthState => {
        const strength: PasswordStrengthState = {
            min_chars: password.length >= 8,
            uppercase_char_present: /[A-Z]/.test(password),
            numerical_char_present: /[0-9]/.test(password),
        };
        setPwdStrength(strength);
        return strength;
    };

    const isPasswordValid = (): boolean => {
        return Object.values(pwdStrength).every(Boolean);
    };

    return {
        pwdStrength,
        validatePassword,
        isPasswordValid,
    };
}