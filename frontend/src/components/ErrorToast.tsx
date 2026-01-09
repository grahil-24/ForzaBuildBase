import {toast} from 'react-toastify';
import { useEffect } from 'react';

const ErrorToast = ({error}: {error: Error}) => {
    useEffect(() => {
        toast.error(error.message);
    }, [error.message]);
        
    return null;
}

export default ErrorToast;