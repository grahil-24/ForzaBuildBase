import { useContext, useState, useRef } from "react";
import { Transition, Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { Link, useLocation, useNavigate} from "@tanstack/react-router";
import { Cog8ToothIcon, ArrowRightStartOnRectangleIcon, MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { PROFILE_PIC } from "../config/env";
import { AuthContext } from "../contexts/Auth/AuthContext";

const SEARCH_HISTORY_KEY = "SearchHistory";
const MAX_HISTORY_ITEMS = 8;

function Nav() {
  const authContext = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [prevPath, setPrevPath] = useState(location.pathname);
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    try {
      const history = localStorage.getItem(SEARCH_HISTORY_KEY);
      return history ? JSON.parse(history) : [];
    }catch{
      return [];
    }
  });
  const [showHistory, setShowHistory] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Save search history to localStorage
  const saveSearchHistory = (history: string[]) => {
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history));
    setSearchHistory(history);
  };

  // Add search term to history
  const addToSearchHistory = (term: string) => {
    const trimmedTerm = term.trim();
    if (!trimmedTerm) return;

    let updatedHistory = searchHistory.filter(item => item !== trimmedTerm);
    updatedHistory = [trimmedTerm, ...updatedHistory].slice(0, MAX_HISTORY_ITEMS);
    saveSearchHistory(updatedHistory);
  };

  // Remove specific search term from history
  const removeFromHistory = (term: string) => {
    const updatedHistory = searchHistory.filter(item => item !== term);
    saveSearchHistory(updatedHistory);
  };

  // Clear all search history
  const clearSearchHistory = () => {
    saveSearchHistory([]);
  };

  const handleLogout = async() => {
    if(authContext){
      await authContext.logout();
    }
  };

  const handleEnterKeyDownSearchbar = (e: React.KeyboardEvent<HTMLInputElement>)=> {
    if(e.key === 'Enter' && query.trim()){
      addToSearchHistory(query.trim());
      navigate({to: '/search', search: {q: query.trim()}});
      setShowHistory(false);
    }
  };

  const handleSearchFromHistory = (term: string) => {
    setQuery(term);
    navigate({to: '/search', search: {q: term}});
    setShowHistory(false);
  };

  if (location.pathname !== prevPath) {
    setPrevPath(location.pathname);
    setQuery('');
  }

  return (
    <nav className="fixed bg-white w-full shadow-sm z-10">
      <div className="h-16 flex items-center justify-between gap-2 px-3 sm:px-6 lg:px-10">
        {/* Logo */}
        <div className="shrink-0 w-36 sm:w-40 lg:w-60 h-full flex items-center">
          <img src="/logo/header.png" className="w-full h-auto" alt="Logo"/>
        </div>
        
        {/* Desktop Navigation Links */}
        {authContext?.isAuthenticated && (
          <div className="hidden sm:flex items-center space-x-4">
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
          </div>
        )}

        {/* Searchbar */}
        {authContext?.isAuthenticated && (
          <div className="flex-1 max-w-xs sm:max-w-xs mx-2 sm:mx-4 relative">
            <div className="flex gap-1 border border-gray-300 rounded-full px-3 py-1.5 sm:py-2 bg-transparent text-sm">
              <MagnifyingGlassIcon className="size-4 sm:size-5 text-gray-400 shrink-0"/>
              <input
                key={location.pathname}
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleEnterKeyDownSearchbar}
                onFocus={() => searchHistory.length > 0 && setShowHistory(true)}
                placeholder="Search tunes, users..."
                className="outline-none w-full bg-transparent min-w-0"
              />
            </div>

            {/* Backdrop - click to close - Desktop only */}
            {showHistory && searchHistory.length > 0 && (
              <div 
                className="hidden sm:block fixed inset-0 z-40" 
                onClick={() => setShowHistory(false)}
              />
            )}

            {/* Search History Dropdown - Desktop only */}
            {showHistory && searchHistory.length > 0 && (
              <div className="hidden sm:block absolute top-full mt-2 w-full bg-gray-200 rounded-lg shadow-xl p-4 z-50">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-black">Search History</h3>
                  <button
                    onClick={clearSearchHistory}
                    className="text-xs text-gray-600 hover:text-black transition-colors"
                  >
                    Clear
                  </button>
                </div>

                {/* Search History Items */}
                <div className="flex flex-wrap gap-2">
                  {searchHistory.map((term, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1 bg-gray-300 rounded-full px-3 py-1.5 text-sm group hover:bg-gray-400 transition-colors cursor-pointer"
                    >
                      <button
                        onClick={() => handleSearchFromHistory(term)}
                        className="text-black"
                      >
                        {term}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromHistory(term);
                        }}
                        className="ml-1 text-gray-500 hover:text-black transition-colors"
                      >
                        <XMarkIcon className="size-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Right side - User menu or Login/Signup */}
        {authContext?.isAuthenticated ? (
          <div className="flex items-center gap-2 shrink-0">
            {/* Desktop User Menu */}
            <Menu as="div" className="relative hidden sm:block">
              <MenuButton className="focus:outline-none text-black relative flex items-center gap-2 rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500">
                <img 
                  src={`${PROFILE_PIC}/${authContext.user!.profile_pic}`}
                  alt={`${authContext.user!.username}'s profile`}
                  key={authContext.user!.profile_pic}
                  className='size-8 rounded-full object-cover bg-gray-200'
                />
              </MenuButton>

              <MenuItems
                transition
                className="focus:outline-none absolute right-0 z-20 mt-2 w-36 origin-top-right rounded-md bg-white border border-gray-200 shadow-lg py-0 transition data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
              >
                <MenuItem>
                  <Link 
                    to='/settings'
                    className="flex gap-2 items-center w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-t border-0 bg-transparent"
                  >
                    <Cog8ToothIcon className="size-5"/>
                    Settings
                  </Link>
                </MenuItem>
                <MenuItem>
                  <button
                    onClick={handleLogout}
                    className="flex items-center group hover:bg-red-100/50 transition-colors duration-300 gap-2 px-3 w-full text-left py-2 text-sm text-gray-700 rounded-b"
                  >
                    <ArrowRightStartOnRectangleIcon className='group-hover:text-red-600 transition-colors duration-300 size-5' />
                    <p className="group-hover:text-red-600 transition-colors duration-300">Sign out</p>
                  </button>
                </MenuItem>
              </MenuItems>
            </Menu>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="sm:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-black hover:bg-gray-100 focus:outline-none transition-colors"
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
        ) : (
          <div className="flex items-center gap-2 shrink-0">
            <Link
              to='/login'
              className="px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 hover:text-black transition-colors"
            >
              Log in
            </Link>
            <Link
              to='/sign-up'
              className="px-3 sm:px-4 py-2 text-sm font-medium text-white bg-black rounded-full hover:bg-gray-800 transition-colors"
            >
              Sign up
            </Link>
          </div>
        )}
      </div>

      {/* Mobile menu */}
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
                <div className="flex items-center gap-3 px-3 py-2">
                  <img 
                    src={`${PROFILE_PIC}/${authContext.user!.profile_pic}`}
                    alt={`${authContext.user!.username}'s profile`}
                    key={authContext.user!.profile_pic}
                    className='size-10 rounded-full object-cover bg-gray-200'
                  />
                  <div className="text-sm font-medium text-gray-900">
                    {authContext.user?.username}
                  </div>
                </div>
                <Link
                  to='/settings'
                  onClick={() => setIsOpen(false)}
                  className="w-full text-left text-gray-700 hover:bg-gray-100 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
                >
                  Settings
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
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