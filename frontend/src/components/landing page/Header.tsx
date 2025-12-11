import type React from "react"
import GetStartedBtn from "./GetStartedBtn";

const Header = (): React.ReactElement => {

    return (
            <header className="border-b border-green-400 py-3">
                <nav>
                    <div className="flex items-center justify-between px-5 md:px-5 gap-4">
                        <img src='/logo/header.png' className="h-8"/>
                        <div className="shrink-0">
                            <GetStartedBtn />
                        </div> 
                    </div>
                </nav>
            </header>
    )
}

export default Header;