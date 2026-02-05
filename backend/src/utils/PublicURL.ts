import crypto from 'crypto';

const generatePublicURL = (): string => {
    const randomBytes = crypto.randomBytes(16);

    //convert to base64 
    //This gives us a 22-character string that's URL-safe
    const publicURL = randomBytes.toString('base64').replace(/\+/g, '-') //replace + with -
                      .replace(/\//g, '_') //replace / with _
                      .replace(/=/g, '') //remove padding

    return publicURL;                    
}

const isValidPublicURL = (publicURL: string): boolean => {
    const base64UrlPattern = /^[A-Za-z0-9_-]{22}$/;

    return base64UrlPattern.test(publicURL);
}

export {generatePublicURL, isValidPublicURL};