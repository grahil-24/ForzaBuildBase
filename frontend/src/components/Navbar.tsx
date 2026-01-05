import { useState } from "react";
import { Transition, Menu, MenuButton, MenuItem, MenuItems, Button} from "@headlessui/react";
import { Link} from "@tanstack/react-router";
import { Route } from "../routes/__root";

function Nav() {
  const authContext = Route.useRouteContext().auth;
  // const navigate = useNavigate();
  const handleLogout = async() => {
    //set accesstoken, user, isauth to false  
    await authContext.logout();
    // navigate({to: '/'});
  };
  const [isOpen, setIsOpen] = useState(false);
  return (
    <nav className="fixed bg-white w-full shadow-sm z-1">
      <div className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-10">
        {/* Logo */}
        <div className="shrink-0 min-w-40 max-w-1/5 h-full flex items-center">
          <img src="/logo/header.png" className="" alt="Logo"/>
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden sm:flex items-center space-x-4 flex-1 ml-6 lg:ml-10">
          <Link
            to="/profile"
            className="relative text-black px-3 py-2 rounded-md text-sm font-medium after:content-[''] after:absolute after:bottom-1 after:left-3 after:right-3 after:h-0.5 after:bg-black after:scale-x-0 after:origin-left after:transition-transform after:duration-300 hover:after:scale-x-100"
          >
            Dashboard
          </Link>
          <Link
            to="/browse"
            className="relative text-black px-3 py-2 rounded-md text-sm font-medium after:content-[''] after:absolute after:bottom-1 after:left-3 after:right-3 after:h-0.5 after:bg-black after:scale-x-0 after:origin-left after:transition-transform after:duration-300 hover:after:scale-x-100"
          >
            Browse
          </Link>
          
          {/* User Menu */}
          {authContext.isAuthenticated && 
            <Menu as="div" className="relative ml-auto">
              <MenuButton className="text-black relative flex items-center gap-2 rounded-full px-3 py-2 hover:bg-gray-100 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500">
                <span className="sr-only">Open user menu</span>
                <span className="text-sm font-medium">{authContext.user?.username}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </MenuButton>

              <MenuItems
                transition
                className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white border border-gray-200 shadow-lg py-1 transition data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
              >
                <MenuItem>
                  <a
                    href="#"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Your profile
                  </a>
                </MenuItem>
                <MenuItem>
                  <Button
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Settings
                  </Button>
                </MenuItem>
                <MenuItem>
                  <button
                    onClick={handleLogout}
                    className="block px-4 w-full text-left cursor-pointer py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Sign out
                  </button>
                </MenuItem>
              </MenuItems>
            </Menu>
          }
        </div>
        
        {/* Mobile menu button */}
        <div className="flex sm:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            type="button"
            className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-black hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors"
            aria-controls="mobile-menu"
            aria-expanded={isOpen}
          >
            <span className="sr-only">Open main menu</span>
            {!isOpen ? (
              <svg
                className="block h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            ) : (
              <svg
                className="block h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
  
    {/* Mobile menu */}
    <Transition
      show={isOpen}
      enter="transition ease-out duration-100 transform"
      enterFrom="opacity-0 scale-95"
      enterTo="opacity-100 scale-100"
      leave="transition ease-in duration-75 transform"
      leaveFrom="opacity-100 scale-100"
      leaveTo="opacity-0 scale-95"
    >
      {(ref) => (
        <div className="md:hidden border-t border-gray-200" id="mobile-menu">
          <div
            ref={ref as React.RefObject<HTMLDivElement>}
            className="px-4 pt-2 pb-3 space-y-1"
          >
            <Link
              to="/profile"
              className="text-gray-900 hover:bg-gray-100 block px-3 py-2 rounded-md text-base font-medium"
            >
              Dashboard
            </Link>
            <Link
              to="/browse"
              className="text-gray-700 hover:bg-gray-100 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
            >
              Browse
            </Link>
            
            {/* Mobile user menu */}
            {authContext.isAuthenticated && (
              <>
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="px-3 py-2 text-sm font-medium text-gray-500">
                    {authContext.user?.username}
                  </div>
                  <Link
                    to="/profile"
                    className="text-gray-700 hover:bg-gray-100 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
                  >
                    Your profile
                  </Link>
                  <button
                    className="w-full text-left text-gray-700 hover:bg-gray-100 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
                  >
                    Settings
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left text-gray-700 hover:bg-gray-100 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
                  >
                    Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </Transition>
  </nav>
  );
}

export default Nav;