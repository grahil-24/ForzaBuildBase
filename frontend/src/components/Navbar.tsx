import { useContext, useState } from "react";
import { Transition, Menu, MenuButton, MenuItem, MenuItems} from "@headlessui/react";
import { Link} from "@tanstack/react-router";
import { Cog8ToothIcon, ArrowRightStartOnRectangleIcon } from "@heroicons/react/24/outline";
import { PROFILE_PIC } from "../config/env";
import { AuthContext } from "../contexts/Auth/AuthContext";

function Nav() {
  const authContext = useContext(AuthContext);
  const handleLogout = async() => {
    if(authContext){
      await authContext.logout();
    }
  };
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed bg-white w-full shadow-sm z-10">
      <div className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-10">
        {/* Logo */}
        <div className="shrink-0 min-w-40 max-w-1/5 h-full flex items-center">
          <img src="/logo/header.png" className="" alt="Logo"/>
        </div>
        
        {/* Desktop Navigation */}
        {authContext?.isAuthenticated ? ( 
          <>
            <div className="hidden sm:flex items-center space-x-4 flex-1 ml-6 lg:ml-10">
              <Link
                to="/dashboard"
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
              <Link
                to="/u/$user"
                params={{user: authContext.user!.username}}
                className="relative text-black px-3 py-2 rounded-md text-sm font-medium after:content-[''] after:absolute after:bottom-1 after:left-3 after:right-3 after:h-0.5 after:bg-black after:scale-x-0 after:origin-left after:transition-transform after:duration-300 hover:after:scale-x-100"
              >
                My Tunes
              </Link>
              
              {/* User Menu */}
              <Menu as="div" className="relative ml-auto">
                <MenuButton className="focus:outline-none text-black relative flex items-center gap-2 rounded-full mr-10 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500">
                   <img 
                      src={`${PROFILE_PIC}/${authContext.user!.profile_pic}`}
                      alt={`${authContext.user!.username}'s profile`}
                      key={authContext.user!.profile_pic}
                      className='size-5 sm:size-8 rounded-full object-cover bg-gray-200'
                    />
                </MenuButton>

                <MenuItems
                  transition
                  className="focus:outline-none absolute right-0 z-20 mt-2 w-30 origin-top-right rounded-md bg-white border border-gray-200 shadow-lg py-0 transition data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
                >
                  <MenuItem>
                  <Link 
                    to='/settings'
                    className="flex gap-2 items-center w-full text-left px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded border-0 bg-transparent"
                  >
                    <Cog8ToothIcon className="size-6"/>
                    Settings
                  </Link>
                  </MenuItem>
                  <MenuItem>
                    <button
                      onClick={handleLogout}
                      className="flex items-center group hover:bg-red-100/50 transition-colors duration-300 gap-2 px-2 w-full text-left py-2 text-sm text-gray-700"
                    >
                      <ArrowRightStartOnRectangleIcon className='group-hover:text-red-600 transition-colors duration-300 size-6' />
                      <p className="group-hover:text-red-600 transition-colors duration-300">Sign out</p>
                    </button>
                  </MenuItem>
                </MenuItems>
              </Menu>
            </div>

            {/* Mobile menu button */}
            <div className="flex sm:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-black hover:bg-gray-100 focus:outline-none transition-colors"
                aria-controls="mobile-menu"
                aria-expanded={isOpen}
              >
                <span className="sr-only">Open main menu</span>
                {!isOpen ? (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                ) : (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </button>
            </div>
          </>
          ) : 
          (
            <div className="items-center gap-2 ml-auto mr-4">
              <Link
                to='/login'
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-black transition-colors"
              >
                Log in
              </Link>
              <Link
                to='/sign-up'
                className="px-4 py-2 text-sm font-medium text-white bg-black rounded-full hover:bg-gray-800 transition-colors"
              >
                Sign up
              </Link>
            </div>
          )
        }
      </div>

      {/* ✅ Mobile menu — outside the h-16 flex div so it drops below the navbar */}
      {authContext?.isAuthenticated && (
        <Transition
          show={isOpen}
          enter="transition ease-out duration-100 transform"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="transition ease-in duration-75 transform"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <div className="sm:hidden border-t border-gray-200" id="mobile-menu">
            <div className="px-4 pt-2 pb-3 space-y-1">
              <Link
                to="/dashboard"
                onClick={() => setIsOpen(false)}
                className="text-gray-900 hover:bg-gray-100 block px-3 py-2 rounded-md text-base font-medium"
              >
                Dashboard
              </Link>
              <Link
                to="/browse"
                onClick={() => setIsOpen(false)}
                className="text-gray-700 hover:bg-gray-100 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
              >
                Browse
              </Link>
              <Link
                to="/u/$user"
                onClick={() => setIsOpen(false)}
                params={{user: authContext.user!.username}}
                className="text-gray-700 hover:bg-gray-100 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
              >
                My Tunes
              </Link>

              <div className="border-t border-gray-200 pt-2 mt-2">
                <div className="px-3 py-2 text-sm font-medium text-gray-500">
                  {authContext.user?.username}
                </div>
                <Link
                  to='/settings'
                  onClick={() => setIsOpen(false)}
                  className="w-full text-left text-gray-700 hover:bg-gray-100 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
                >
                  Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left text-gray-700 hover:bg-gray-100 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </Transition>
      )}
    </nav>
  );
}

export default Nav;