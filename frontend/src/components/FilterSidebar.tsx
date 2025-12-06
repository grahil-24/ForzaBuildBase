'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogBackdrop, DialogPanel, Disclosure, DisclosureButton, DisclosurePanel} from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { FunnelIcon, MinusIcon, PlusIcon} from '@heroicons/react/20/solid'
import { useNavigate, useSearch } from '@tanstack/react-router'

const filters = [
  {
    id: 'drivetrain',
    name: 'Drivetrain',
    options: [
      { value: 'AWD', label: 'AWD' },
      { value: 'RWD', label: 'RWD' },
      { value: 'FWD', label: 'FWD' }
    ],
  },
  {
    id: 'fuel_type',
    name: 'Fuel Type',
    options: [
      { value: 'Gas', label: 'Gas' },
      { value: 'Electric', label: 'Electric' },
      { value: 'Diesel', label: 'Diesel'},
      { value: 'Hybrid', label: 'Hybrid' },
      { value: 'Hydrogen Fuel-cell', label: 'Hydrogen Fuel-cell' },
    ],
  },
  {
    id: 'rank',
    name: 'Rank',
    options: [
      { value: 'S2', label: 'S2' },
      { value: 'S1', label: 'S1' },
      { value: 'A', label: 'A' },
      { value: 'B', label: 'B' },
      { value: 'C', label: 'C' },
      { value: 'D', label: 'D'},
    ],
  },
]

const FilterSidebar = () => {
  const [filtersOpen, setFiltersOpen] = useState<boolean>(false)
  const navigate = useNavigate();
  const currentSearch = useSearch({ from: '/browse' });
  const [selected, setSelected] = useState<{[key: string]: string[]}>({}); 
  
  // Initialize selected state from URL params
  useEffect(() => {
    const initialSelected: {[key: string]: string[]} = {};
    
    filters.forEach(filter => {
      const value = currentSearch[filter.id as keyof typeof currentSearch];
      if (Array.isArray(value) && value.length > 0) {
        initialSelected[filter.id] = value;
      }
    });
    
    setSelected(initialSelected);
  }, [currentSearch]);

  const handleChange = (sectionId: string, value: string, checked: boolean) => {
    setSelected((prev) => {
      const values = new Set(prev[sectionId] || [])
      if (checked) { 
        values.add(value) 
      } else {
        values.delete(value)
      }
      return {...prev, [sectionId]: Array.from(values)}
    })
  }

  const applyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    
    const searchParams: Record<string, string[] | number> = { page: 1 };
    
    // Add non-empty filter arrays
    Object.entries(selected).forEach(([key, values]) => {
      if (values.length > 0) {
        searchParams[key] = values;
      }
    });
    
    console.log("Applying filters: ", searchParams);
    navigate({ to: '/browse', search: searchParams });
    setFiltersOpen(false);
  }

  return (
    <>
      <Dialog open={filtersOpen} onClose={setFiltersOpen} className="relative z-40">
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-black/25 transition-opacity duration-300 ease-linear data-closed:opacity-0"
        />

        <div className="fixed inset-0 z-40 flex">
          <DialogPanel
            transition
            className="relative mt-16 mr-auto flex min-w-2xs transform flex-col bg-white pt-4 pb-6 shadow-xl transition duration-300 ease-in-out data-closed:-translate-x-full"
          >
            <div className="flex items-center justify-between px-4">
              <h2 className="text-lg font-medium text-gray-900">Filters</h2>
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className="relative -mr-2 flex size-10 items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              >
                <span className="absolute -inset-0.5" />
                <span className="sr-only">Close menu</span>
                <XMarkIcon aria-hidden="true" className="size-6" />
              </button>
            </div>
            <div className='overflow-y-auto'>
              <form onSubmit={applyFilters} className="mt-4 border-t border-gray-200">
                <h3 className="sr-only">Categories</h3>
                {filters.map((section) => (
                  <Disclosure key={section.id} as="div" className="border-t border-gray-200 px-4 py-6">
                    <h3 className="-mx-2 -my-3 flow-root">
                      <DisclosureButton className="group flex w-full items-center justify-between bg-white px-2 py-3 text-gray-400 hover:text-gray-500">
                        <span className="font-medium text-gray-900">{section.name}</span>
                        <span className="ml-6 flex items-center">
                          <PlusIcon aria-hidden="true" className="size-5 group-data-open:hidden" />
                          <MinusIcon aria-hidden="true" className="size-5 group-not-data-open:hidden" />
                        </span>
                      </DisclosureButton>
                    </h3>
                    <DisclosurePanel className="pt-4">
                      <div className="space-y-3">
                        {section.options.map((option, optionIdx) => (
                          <div key={option.value} className="flex gap-3">
                            <div className="flex h-5 shrink-0 items-center">
                              <div className="group grid size-4 grid-cols-1">
                                <input
                                  value={option.value}
                                  checked={selected[section.id]?.includes(option.value) || false}
                                  id={`filter-${section.id}-${optionIdx}`}
                                  name={`${section.id}[]`}
                                  type="checkbox"
                                  className="col-start-1 row-start-1 appearance-none rounded-sm border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto"
                                  onChange={e => handleChange(section.id, option.value, e.target.checked)}
                                />
                                <svg
                                  fill="none"
                                  viewBox="0 0 14 14"
                                  className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-disabled:stroke-gray-950/25"
                                >
                                  <path
                                    d="M3 8L6 11L11 3.5"
                                    strokeWidth={2}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="opacity-0 group-has-checked:opacity-100"
                                  />
                                  <path
                                    d="M3 7H11"
                                    strokeWidth={2}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="opacity-0 group-has-indeterminate:opacity-100"
                                  />
                                </svg>
                              </div>
                            </div>
                            <label
                              htmlFor={`filter-${section.id}-${optionIdx}`}
                              className="min-w-0 flex-1 text-gray-500"
                            >
                              {option.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </DisclosurePanel>
                  </Disclosure>
                ))}
                <div className="px-4 mt-6">
                  <button 
                    className="w-full rounded-md bg-gray-700 px-0 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-700" 
                    type='submit'
                  >
                    Apply Filters
                  </button>
                </div>
              </form>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
      <button
        type="button"
        onClick={() => setFiltersOpen(true)}
        className="p-2 text-gray-400 hover:text-gray-500"
      >
        <span className="sr-only">Filters</span>
        <FunnelIcon aria-hidden="true" className="size-5" />
      </button>
    </>
  )
}

export default FilterSidebar