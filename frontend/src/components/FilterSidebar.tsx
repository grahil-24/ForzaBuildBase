'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogBackdrop, DialogPanel, Disclosure, DisclosureButton, DisclosurePanel} from '@headlessui/react'
import { XMarkIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { MinusIcon, PlusIcon} from '@heroicons/react/20/solid'
import { useNavigate, useSearch } from '@tanstack/react-router'
import brands from '../data/brands.json';

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
  const [brandDialogOpen, setBrandDialogOpen] = useState<boolean>(false);
  const [brandSearchQuery, setBrandSearchQuery] = useState<string>('');
  const [activateClearFilterButton, setActivateClearFilterButton] = useState<boolean>(false);
  const navigate = useNavigate();
  const currentSearch = useSearch({ from: '/_authenticated/browse' });
  const searchQuery: string | undefined = currentSearch.search;
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

    // // Handle brand filter
    const brandValue = currentSearch['manufacturer' as keyof typeof currentSearch];
    if(Array.isArray(brandValue) && brandValue.length > 0){
      initialSelected['manufacturer'] = brandValue;
    }


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

  const clearFilters = () => {
      setActivateClearFilterButton(false);
      navigate({to: '/browse', search: {search: currentSearch.search}})
  }

  const applyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    const searchParams: Record<string, string[] | number | string> = {};
    // Add non-empty filter arrays
    Object.entries(selected).forEach(([key, values]) => {
      if (values.length > 0) {
        searchParams[key] = values;
      }
    });
    if(Object.keys(searchParams).length > 0){
      setActivateClearFilterButton(true);
    }
    if(searchQuery !== undefined){
      searchParams.search = searchQuery;
    }
    searchParams.page = 1;
    navigate({ to: '/browse', search: searchParams});
    setFiltersOpen(false);
  }

  // Filter brands based on search query
  const filteredBrands = brands.filter(brand => 
    brand.toLowerCase().includes(brandSearchQuery.toLowerCase())
  );

  return (
    <>
      {/* Main Filters Dialog */}
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
                    <DisclosurePanel transition className="pt-4 origin-top transition duration-100 ease-out data-closed:-translate-y-6 data-closed:opacity-0">
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
                  {/* Brand Filter Button */}
                  <Disclosure key="brands" as="div" className="border-t border-gray-200 px-4 py-6">
                    <button
                      type="button"
                      onClick={() => setBrandDialogOpen(true)}
                      className="flex w-full items-center justify-between text-gray-400 hover:text-gray-500"
                    >
                      <span className="font-medium text-gray-900">Brand</span>
                      <ChevronRightIcon aria-hidden="true" className="size-5" />
                    </button>
                    {selected['manufacturer']?.length > 0 && (
                      <div className="mt-2">
                        <span className="text-sm text-gray-500">
                          {selected['manufacturer'].length} selected
                        </span>
                      </div>
                    )}
                  </Disclosure>
                  {/* Brand Selection Dialog - Centered */}
                  <Dialog open={brandDialogOpen} onClose={setBrandDialogOpen} className="relative z-50">
                    <DialogBackdrop
                      transition
                      className="fixed inset-0 bg-black/50 transition-opacity duration-150 ease-linear data-closed:opacity-0"
                    />

                    <div className="fixed inset-0 z-50 overflow-y-auto">
                      <div className="flex min-h-full items-center justify-center p-4">
                        <DialogPanel
                          transition
                          className="relative w-full max-w-4xl transform rounded-lg bg-white shadow-xl transition-all duration-150 ease-out data-closed:scale-95 data-closed:opacity-0"
                        >
                          {/* Header */}
                          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                            <h3 className="text-xl font-semibold text-gray-900">Select Brands</h3>
                            <button
                              type="button"
                              onClick={() => setBrandDialogOpen(false)}
                              className="text-gray-400 hover:text-gray-500 transition-colors"
                            >
                              <XMarkIcon className="size-6" />
                            </button>
                          </div>

                          {/* Search Bar */}
                          <div className="px-6 py-4 border-b border-gray-200">
                            <input
                              type="text"
                              placeholder="Search brands..."
                              value={brandSearchQuery}
                              onChange={(e) => setBrandSearchQuery(e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                          </div>

                          {/* Brand List - Multi-column Grid */}
                          <div className="px-6 py-4 max-h-96 overflow-y-auto">
                            {filteredBrands.length > 0 ? (
                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                {filteredBrands.map((brand) => (
                                  <div key={brand} className="flex gap-2 items-center">
                                    <div className="flex h-5 shrink-0 items-center">
                                      <div className="group grid size-4 grid-cols-1">
                                        <input
                                          value={brand}
                                          checked={selected['manufacturer']?.includes(brand) || false}
                                          id={`manufacturer-${brand}`}
                                          type="checkbox"
                                          className="col-start-1 row-start-1 appearance-none rounded-sm border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                          onChange={(e) => handleChange('manufacturer', brand, e.target.checked)}
                                        />
                                        <svg
                                          fill="none"
                                          viewBox="0 0 14 14"
                                          className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white"
                                        >
                                          <path
                                            d="M3 8L6 11L11 3.5"
                                            strokeWidth={2}
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="opacity-0 group-has-checked:opacity-100"
                                          />
                                        </svg>
                                      </div>
                                    </div>
                                    <label
                                      htmlFor={`manufacturer-${brand}`}
                                      className="text-sm text-gray-700 cursor-pointer truncate"
                                    >
                                      {brand}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-center text-gray-500 py-8">No brands found</p>
                            )}
                          </div>

                          {/* Footer */}
                          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
                            <span className="text-sm text-gray-600">
                              {selected['manufacturer']?.length || 0} brand(s) selected
                            </span>
                            <button
                              type="button"
                              onClick={() => setBrandDialogOpen(false)}
                              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
                            >
                              Done
                            </button>
                          </div>
                        </DialogPanel>
                      </div>
                    </div>
                  </Dialog>
                <div className="flex gap-6 px-4 mt-6">
                  <button
                  className="w-6/10 rounded-md bg-gray-700 px-0 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-700"  
                  disabled={!activateClearFilterButton} onClick={clearFilters}>Clear Filters</button>
                  <button 
                    className="w-6/10 rounded-md bg-gray-700 px-0 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-700" 
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

      {/* Filter Button */}
      <button
        type="button"
        onClick={() => setFiltersOpen(true)}
        className="mt-0 p-2 text-gray-400 hover:text-gray-500"
      >
        <span className="sr-only">Filters</span>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
        </svg>
      </button>
    </>
  )
}

export default FilterSidebar