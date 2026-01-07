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
    <div className='w-full sm:w-4/5 md:w-3/4 lg:w-2/3 xl:w-1/2 mx-auto px-4 py-6'>
      <div className='flex flex-col sm:flex-row border border-gray-300 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden bg-white'>
        {/* Car Image */}
        <div className='w-full sm:w-5/12 md:w-4/12 flex items-center justify-center bg-linear-to-br from-gray-50 to-gray-100'>
          <img 
            className='w-full h-auto -mt-2 sm:-mt-3 md:-mt-4 object-contain' 
            src='https://fh5-car-images.s3.ap-south-1.amazonaws.com/images/Abarth/Abarth_124_Spider.png'
            alt="Abarth 124 Spider"
          />
        </div>
        
        {/* Content */}
        <div className='flex-1 p-4 sm:p-5 flex flex-col justify-center'>
          {/* Car Brand & Model */}
          <p className='text-xs sm:text-sm md:text-base font-medium text-gray-600 uppercase tracking-wider'>
            Abarth - 124 Spider
          </p>
          
          {/* Tune Name */}
          <h2 className='text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mt-1 mb-3 leading-tight'>
            My Custom Tune
          </h2>
          
          {/* Metadata */}
          <div className='flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-gray-600'>
            <span className='font-semibold px-2 py-1 bg-blue-100 text-blue-800 rounded'>
              Class: A
            </span>
            <span className='hidden sm:inline text-gray-400'>•</span>
            <span>Creator: <span className='font-medium text-gray-800'>Rahil</span></span>
          </div>
          
          <p className='text-xs sm:text-sm text-gray-500 mt-2'>
            Created: January 5, 2026
          </p>
        </div>
        
        {/* Menu */}
        <div className='absolute top-3 right-3 sm:relative sm:top-0 sm:right-0 sm:flex sm:items-start sm:pt-4 sm:pr-3'>
          <Menu as="div" className="relative">
            <MenuButton className="rounded-full p-2 hover:bg-gray-100 transition-colors duration-150">
              <FontAwesomeIcon 
                icon={faEllipsisH} 
                className="text-gray-600 text-lg sm:text-xl" 
              />
            </MenuButton>
            <MenuItems
              transition
              modal={false}
              anchor="bottom end"
              className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden z-50 focus:outline-none transition duration-100 ease-out data-closed:scale-95 data-closed:opacity-0"
            >
              <MenuItem>
                {({ active }) => (
                  <button className={`group flex w-full items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${active ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}`}>
                    <PencilIcon className="size-5" />
                    Rename
                  </button>
                )}
              </MenuItem>
              <MenuItem>
                {({ active }) => (
                  <button className={`group flex w-full items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${active ? 'bg-red-50 text-red-700' : 'text-gray-700'}`}>
                    <TrashIcon className="size-5" />
                    Delete
                  </button>
                )}
              </MenuItem>
              <MenuItem>
                {({ active }) => (
                  <button className={`group flex w-full items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${active ? 'bg-orange-50 text-orange-700' : 'text-gray-700'}`}>
                    <MinusCircleIcon className="size-5" />
                    Remove
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