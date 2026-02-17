import type React from "react";
import type { PasswordStrengthState } from "../hooks/usePasswordStrength";

const PasswordValiditySVG = ({ valid }: { valid: boolean }): React.ReactElement => {
    return (
        <>
        {!valid ? (
        <svg width="20px" height="20px" viewBox="0 -0.5 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6.96967 16.4697C6.67678 16.7626 6.67678 17.2374 6.96967 17.5303C7.26256 17.8232 7.73744 17.8232 8.03033 17.5303L6.96967 16.4697ZM13.0303 12.5303C13.3232 12.2374 13.3232 11.7626 13.0303 11.4697C12.7374 11.1768 12.2626 11.1768 11.9697 11.4697L13.0303 12.5303ZM11.9697 11.4697C11.6768 11.7626 11.6768 12.2374 11.9697 12.5303C12.2626 12.8232 12.7374 12.8232 13.0303 12.5303L11.9697 11.4697ZM18.0303 7.53033C18.3232 7.23744 18.3232 6.76256 18.0303 6.46967C17.7374 6.17678 17.2626 6.17678 16.9697 6.46967L18.0303 7.53033ZM13.0303 11.4697C12.7374 11.1768 12.2626 11.1768 11.9697 11.4697C11.6768 11.7626 11.6768 12.2374 11.9697 12.5303L13.0303 11.4697ZM16.9697 17.5303C17.2626 17.8232 17.7374 17.8232 18.0303 17.5303C18.3232 17.2374 18.3232 16.7626 18.0303 16.4697L16.9697 17.5303ZM11.9697 12.5303C12.2626 12.8232 12.7374 12.8232 13.0303 12.5303C13.3232 12.2374 13.3232 11.7626 13.0303 11.4697L11.9697 12.5303ZM8.03033 6.46967C7.73744 6.17678 7.26256 6.17678 6.96967 6.46967C6.67678 6.76256 6.67678 7.23744 6.96967 7.53033L8.03033 6.46967ZM8.03033 17.5303L13.0303 12.5303L11.9697 11.4697L6.96967 16.4697L8.03033 17.5303ZM13.0303 12.5303L18.0303 7.53033L16.9697 6.46967L11.9697 11.4697L13.0303 12.5303ZM11.9697 12.5303L16.9697 17.5303L18.0303 16.4697L13.0303 11.4697L11.9697 12.5303ZM13.0303 11.4697L8.03033 6.46967L6.96967 7.53033L11.9697 12.5303L13.0303 11.4697Z" fill="#000000"/>
        </svg>
        ): (
            <svg width="20px" height="20px" viewBox="0 -0.5 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                <g id="SVGRepo_iconCarrier">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M17.4995 7.44055C17.8085 7.71643 17.8353 8.19054 17.5595 8.49952L10.4166 16.4995C10.2743 16.6589 10.0708 16.75 9.85715 16.75C9.6435 16.75 9.43999 16.6589 9.2977 16.4995L6.44055 13.2995C6.16468 12.9905 6.19152 12.5164 6.5005 12.2406C6.80947 11.9647 7.28359 11.9915 7.55946 12.3005L9.85715 14.8739L16.4406 7.5005C16.7164 7.19152 17.1905 7.16468 17.4995 7.44055Z" fill="#00ff41"></path> 
                </g>
            </svg>
        )}
        </>
    )
}

export function PasswordStrengthChecklist({ strength }: { strength: PasswordStrengthState }): React.ReactElement {
    return (
        <div className="pt-2">
            <ul className="font-light text-sm">
                <li>
                    <span className="inline-flex gap-2">
                        <PasswordValiditySVG valid={strength.min_chars} />
                        <p>Minimum 8 characters</p>
                    </span>
                </li>
                <li>
                    <span className="inline-flex gap-2">
                        <PasswordValiditySVG valid={strength.uppercase_char_present} />
                        <p>Atleast one uppercase character</p>
                    </span>
                </li>
                <li>
                    <span className="inline-flex gap-2">
                        <PasswordValiditySVG valid={strength.numerical_char_present} />
                        <p>Atleast one numerical character</p>
                    </span>
                </li>
            </ul>
        </div>
    );
}