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
            className=' shadow-xl bg-gray-200 rounded-full p-3 mb-10 fixed bottom-0 right-30'
            onClick={scrollToTop}
            >
            <FontAwesomeIcon size='xl' icon={faAngleUp} />
            </div>
        )
    )

}

export default ScrollToTop;