import { useState, useEffect } from "react";

export const SearchBar = ({onChange}: {onChange: (input: string) => void}) => {
    const [inputValue, setInputValue] = useState<string>("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
        onChange(e.target.value);
    }

    const clearInput = () => {
        setInputValue("");
        onChange("");
    }

    useEffect(() => {
        const input = document.getElementById("search") as HTMLInputElement;
        if (input) {
            input.blur();
        }
    }, []);

    return (
        <div className="relative">
            <input
                className="appearance-none border-2 pl-8 sm:pl-10 border-gray-300 hover:border-gray-400 transition-colors rounded-md w-full py-1 sm:py-2 px-2 sm:px-3 text-xs sm:text-base text-gray-800 leading-tight focus:outline-none focus:ring-black focus:border-black focus:shadow-outline placeholder:text-xs sm:placeholder:text-sm"
                id="search"
                type="text"
                onChange={handleChange}
                value={inputValue}
                placeholder="Search..."
            />
            <div className="absolute right-0 inset-y-0 flex items-center">
                <button onClick={clearInput} className="">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="-ml-1 mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-gray-400 hover:text-gray-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>
            </div>
            <div className="absolute left-0 inset-y-0 flex items-center">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 sm:h-6 sm:w-6 ml-2 sm:ml-3 text-gray-400 hover:text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
                </svg>
            </div>
        </div>
    )
}