import { useCallback, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleUp } from "@fortawesome/free-solid-svg-icons";

const ScrollToTop = ({visiblePosition = 30}: {visiblePosition?: number}) => {

    const [scrollPosition, setScrollPosition] = useState<number>(0);

    const handleScroll = useCallback(() => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight;
        const clientHeight = window.innerHeight;
        const position = Math.ceil(
        (scrollTop / (scrollHeight - clientHeight)) * 100
        );
        setScrollPosition(position);
    }, []);


    const scrollToTop = useCallback(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    return (
        scrollPosition > visiblePosition && (
            <div 
            /* Changed right-30 to right-4 and adjusted bottom spacing */
            className='cursor-pointer shadow-xl bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full p-3 fixed bottom-8 right-4 z-50 transition-all'
            onClick={scrollToTop}
            >
                <FontAwesomeIcon size='xl' icon={faAngleUp} />
            </div>
        )
    )

}

export default ScrollToTop;