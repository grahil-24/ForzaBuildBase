import { createFileRoute } from '@tanstack/react-router'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEllipsisH } from '@fortawesome/free-solid-svg-icons'
import { PencilIcon, TrashIcon, MinusCircleIcon } from '@heroicons/react/24/outline'

export const Route = createFileRoute('/_authenticated/profile/tunes')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className='max-w-4xl mx-auto px-4 py-6 space-y-3'>
      {/* First Item */}
      <div className='cursor-pointer relative flex items-center border border-gray-200 bg-white hover:shadow-lg transition-shadow duration-200 overflow-hidden'>
        {/* Rank Badge */}
        <div className='hidden sm:flex items-center justify-center w-16 md:w-20 text-black'>
          <span className='text-2xl md:text-3xl font-bold opacity-50'>#1</span>
        </div>
        
        {/* Car Image */}
        <div className='w-32 sm:w-40 md:w-48 lg:w-56 shrink-0 flex items-center justify-center  from-gray-50 to-gray-100'>
          <img 
            className='w-full h-auto object-contain' 
            src='https://fh5-car-images.s3.ap-south-1.amazonaws.com/images/Abarth/Abarth_124_Spider.png'
            alt="Abarth 124 Spider"
          />
        </div>
        
        {/* Content */}
        <div className='flex-1 px-4 py-2 md:px-6 flex flex-col justify-center min-w-0'>
          <h2 className='text-sm sm:text-sm md:text-2xl font-bold text-gray-900 mb-1 truncate'>
            ABARTH 124 SPIDER
          </h2>
          
          <p className='text-sm md:text-base text-gray-600 mb-3'>
            My Custom Tune
          </p>
          
          <div className='flex flex-wrap items-center gap-x-4 gap-y-2 text-xs md:text-sm text-gray-600'>
            <span>Creator: <span className='font-semibold text-gray-800'>Rahil</span></span>
            <span className='hidden sm:inline text-gray-400'>•</span>
            <span>Created: January 5, 2026</span>
          </div>
        </div>
        
        {/* Class Badge - Top Right */}
        <div className='absolute top-3 right-3 sm:right-16 md:right-20'>
          <span className='inline-block px-3 py-1 bg-purple-500 text-white text-xs md:text-sm font-bold shadow-md'>
            CLASS A
          </span>
        </div>
        
        {/* Menu */}
        <div className='flex items-center pr-3 md:pr-4'>
          <Menu as="div" className="relative">
            <MenuButton className="p-2 hover:bg-gray-100 transition-colors duration-150">
              <FontAwesomeIcon 
                icon={faEllipsisH} 
                className="text-gray-600 text-lg md:text-xl" 
              />
            </MenuButton>
            <MenuItems
              transition
              modal={false}
              anchor="bottom end"
              className="absolute right-0 mt-2 w-48 bg-white border border-gray-200  shadow-xl overflow-hidden z-50 focus:outline-none transition duration-100 ease-out data-closed:scale-95 data-closed:opacity-0"
            >
              <MenuItem>
                {({ active }) => (
                  <button className={`${active ? 'bg-gray-50' : ''} group flex w-full items-center gap-3 px-4 py-3 text-sm font-medium transition-colors`}>
                    <PencilIcon className="size-5 text-gray-600" />
                    <span className='text-gray-700'>Rename</span>
                  </button>
                )}
              </MenuItem>
              <MenuItem>
                {({ active }) => (
                  <button className={`${active ? 'bg-gray-50' : ''} group flex w-full items-center gap-3 px-4 py-3 text-sm font-medium transition-colors`}>
                    <TrashIcon className="size-5 text-gray-600" />
                    <span className='text-gray-700'>Delete</span>
                  </button>
                )}
              </MenuItem>
              <MenuItem>
                {({ active }) => (
                  <button className={`${active ? 'bg-gray-50' : ''} group flex w-full items-center gap-3 px-4 py-3 text-sm font-medium transition-colors`}>
                    <MinusCircleIcon className="size-5 text-gray-600" />
                    <span className='text-gray-700'>Remove</span>
                  </button>
                )}
              </MenuItem>
            </MenuItems>
          </Menu>
        </div>
      </div>
      {/* Second Item */}
      <div className='cursor-pointer relative flex items-center border border-gray-200 bg-white hover:shadow-lg transition-shadow duration-200 overflow-hidden'>
        {/* Rank Badge */}
        <div className='hidden sm:flex items-center justify-center w-16 md:w-20 text-black'>
          <span className='text-2xl md:text-3xl font-bold opacity-50'>#1</span>
        </div>
        
        {/* Car Image */}
        <div className='w-32 sm:w-40 md:w-48 lg:w-56 shrink-0 flex items-center justify-center  from-gray-50 to-gray-100'>
          <img 
            className='w-full h-auto object-contain' 
            src='https://fh5-car-images.s3.ap-south-1.amazonaws.com/images/Abarth/Abarth_124_Spider.png'
            alt="Abarth 124 Spider"
          />
        </div>
        
        {/* Content */}
        <div className='flex-1 px-4 py-2 md:px-6 flex flex-col justify-center min-w-0'>
          <h2 className='text-sm sm:text-sm md:text-2xl font-bold text-gray-900 mb-1 truncate'>
            ABARTH 124 SPIDER
          </h2>
          
          <p className='text-sm md:text-base text-gray-600 mb-3'>
            My Custom Tune
          </p>
          
          <div className='flex flex-wrap items-center gap-x-4 gap-y-2 text-xs md:text-sm text-gray-600'>
            <span>Creator: <span className='font-semibold text-gray-800'>Rahil</span></span>
            <span className='hidden sm:inline text-gray-400'>•</span>
            <span>Created: January 5, 2026</span>
          </div>
        </div>
        
        {/* Class Badge - Top Right */}
        <div className='absolute top-3 right-3 sm:right-16 md:right-20'>
          <span className='inline-block px-3 py-1 bg-purple-500 text-white text-xs md:text-sm font-bold shadow-md'>
            CLASS A
          </span>
        </div>
        
        {/* Menu */}
        <div className='flex items-center pr-3 md:pr-4'>
          <Menu as="div" className="relative">
            <MenuButton className="p-2 hover:bg-gray-100 transition-colors duration-150">
              <FontAwesomeIcon 
                icon={faEllipsisH} 
                className="text-gray-600 text-lg md:text-xl" 
              />
            </MenuButton>
            <MenuItems
              transition
              modal={false}
              anchor="bottom end"
              className="absolute right-0 mt-2 w-48 bg-white border border-gray-200  shadow-xl overflow-hidden z-50 focus:outline-none transition duration-100 ease-out data-closed:scale-95 data-closed:opacity-0"
            >
              <MenuItem>
                {({ active }) => (
                  <button className={`${active ? 'bg-gray-50' : ''} group flex w-full items-center gap-3 px-4 py-3 text-sm font-medium transition-colors`}>
                    <PencilIcon className="size-5 text-gray-600" />
                    <span className='text-gray-700'>Rename</span>
                  </button>
                )}
              </MenuItem>
              <MenuItem>
                {({ active }) => (
                  <button className={`${active ? 'bg-gray-50' : ''} group flex w-full items-center gap-3 px-4 py-3 text-sm font-medium transition-colors`}>
                    <TrashIcon className="size-5 text-gray-600" />
                    <span className='text-gray-700'>Delete</span>
                  </button>
                )}
              </MenuItem>
              <MenuItem>
                {({ active }) => (
                  <button className={`${active ? 'bg-gray-50' : ''} group flex w-full items-center gap-3 px-4 py-3 text-sm font-medium transition-colors`}>
                    <MinusCircleIcon className="size-5 text-gray-600" />
                    <span className='text-gray-700'>Remove</span>
                  </button>
                )}
              </MenuItem>
            </MenuItems>
          </Menu>
        </div>
      </div>
    </div>
  )
}