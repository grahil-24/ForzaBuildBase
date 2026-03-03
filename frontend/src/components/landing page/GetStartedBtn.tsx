import { Button } from "@headlessui/react";
import type React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faFlagCheckered} from '@fortawesome/free-solid-svg-icons'
import { Link } from "@tanstack/react-router";


const GetStartedBtn = (): React.ReactElement => {

    return (
        <Link to={'/login'}>
            <Button className="
             group hover:scale-103 duration-100 inline-flex items-center gap-2
            px-4 py-3 
            bg-green-500 rounded-3xl 
            whitespace-nowrap
            text-sm md:text-base
            ">
            Get Started
            <FontAwesomeIcon className="transition-transform duration-200 group-hover:rotate-30" icon={faFlagCheckered} />
            </Button>
        </Link>
    );
}

export default GetStartedBtn;