import type React from "react"
import GetStartedBtn from "./GetStartedBtn";

const Header = (): React.ReactElement => {
    return (
        <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
            <nav>
                <div className="flex items-center justify-between px-4 sm:px-6 md:px-8 py-3 sm:py-4 max-w-7xl mx-auto">
                    <img src='/logo/header.png' className="h-7 sm:h-8" alt="ForzaBuildBase"/>
                    <div className="hidden sm:shrink-0 sm:inline">
                        <GetStartedBtn />
                    </div> 
                </div>
            </nav>
        </header>
    )
}

export default Header;