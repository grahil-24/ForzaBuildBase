import {createFileRoute, useNavigate, type ParsedLocation, Link} from '@tanstack/react-router'
import CarTiles from '../../components/browse/CarTiles';
import FilterSidebar from '../../components/browse/FilterSidebar';
import React, { useEffect, useState } from 'react';
import type {Car} from '../../types/car';
import Searchbar from '../../components/Searchbar';
import {authFetch} from "../../api/authFetch.ts";
import type { AuthState } from '../../types/auth.ts';
import { BACKEND } from '../../config/env.ts';
import ScrollToTop from '../../components/ScrollToTop.tsx';
import ErrorToast from '../../components/ErrorToast.tsx';

interface BrowseSearch {
  page?: number,
  rank?: string[]
  drivetrain?: string[]
  fuel_type?: string[]
  manufacturer?: string[]
  search?: string
}

interface LoaderData {
  cars: Car[]
  totalPages: number,
  total: number
}

export const Route = createFileRoute('/_authenticated/browse')({
  //validate and normalize URL search parameters for the browse page
  validateSearch: (search: Record<string, unknown>): BrowseSearch => {
    const parseArrayParam = (param: unknown): string[] | undefined => {
      if (!param) return undefined;
      if (Array.isArray(param)) return param.map(String);
      return String(param).split(',').map(s => s.trim()).filter(Boolean);
    };

    return {
      page: Number(search?.page) || 1,
      rank: parseArrayParam(search?.rank),
      drivetrain: parseArrayParam(search?.drivetrain),
      fuel_type: parseArrayParam(search?.fuel_type),
      manufacturer: parseArrayParam(search?.manufacturer),
      search: search.search ? search.search as string : undefined
    };
  },
  head: () => ({
    meta: [
      {
        title: 'Browse Cars'
      }
    ]
  }),
  errorComponent: ErrorToast,
  preload: true,
  loaderDeps: ({search: {page, rank, drivetrain, fuel_type, manufacturer, search}}) => ({page, rank, drivetrain, fuel_type, manufacturer, search}),
  loader: async({ context, location }) => {
    const res = await fetchCars(location, context.auth); 
    // window.scrollTo(0, 0); 
    return res
  },
  staleTime: Infinity,
  component: BrowseComponent,
})

const fetchCars = async (location: ParsedLocation, auth: AuthState): Promise<LoaderData> => {
  const params = new URLSearchParams();
  Object.entries(location.search).forEach(([key, value] ) => {
    if (Array.isArray(value) && value.length > 0) {
      params.set(key, value.join(','));
    } else if (value !== undefined && value !== null) {
      params.set(key, String(value));
    }
  });

  const queryString = params.toString();
  const res = await authFetch(`${BACKEND}/browse?${queryString}`,
      { method: 'GET'},
      auth
    );
    if (!res.ok) throw new Error('Failed to fetch cars');
    const data = await res.json();
    return data as LoaderData;
}

function BrowseComponent(): React.ReactElement {
  const { cars, totalPages, total } = Route.useLoaderData();
  const search = Route.useSearch();
  const page = search.page ?? 1;
  const [pageInputField, setPageInputField] = useState<number>(page);
  const [searchBarText, setSearchBarText] = useState<string>("");
  const [isfilterOpen, setIsFilterOpen] = useState<boolean>(false);

  useEffect(() => {
    setPageInputField(page);
  }, [page]);

  const navigate = useNavigate();

  const goToPage = (newPage: number) => {
    navigate({
      to: '/browse',
      search: { ...search, page: newPage }
    });
  };

  const handleFilterButtonClick = () => {
    setIsFilterOpen(prev => !prev);
  }

  return (
    <div className="w-full max-w-(--break-2xl) mx-auto">
      {/* Header Section */}
      <div className='px-6 mt-5'>
        {/* justify-between pushes the three children to the left, center, and right on md+ */}
        <div className='flex flex-wrap items-center justify-between gap-y-4 gap-x-2'>
          
          {/* 1. Filter Button - Left End */}
          <div className='flex items-center order-1'>
            {!isfilterOpen && 
              <button
                type="button"
                onClick={handleFilterButtonClick}
                className="p-2 text-gray-500 hover:text-gray-700 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
                </svg>
              </button>
            } 
          </div>
          <FilterSidebar isFilterOpen={isfilterOpen} handleFilterButtonClick={handleFilterButtonClick} />
          {/* 2. Results Text - Middle (Centered) */}
          {/* On mobile, it takes available space; on desktop, it sits in the middle */}
          <div className='flex-1 md:flex-initial text-center order-2'>
            <p className='md:text-xl text-lg font-semibold whitespace-nowrap'>
              Showing <span className="text-lime-600">{total}</span> results
            </p>
          </div>

          {/* 3. Search Bar - Right End */}
          {/* w-full on mobile to prevent overflow; specific width on md+ */}
          <div className='w-full md:w-auto md:min-w-[300px] lg:min-w-[400px] order-3 flex justify-end'>
            <Searchbar
              handleSearchbar={(e) => setSearchBarText(e.target.value)}
              handleSearch={() => navigate({ to: '/browse', search: { ...search, search: searchBarText, page: 1 } })}
            />
          </div>
          
        </div>
      </div>
      {/* Main Content */}
      <div className='p-6'>
        {/* Removed ml-15 as it's not standard Tailwind and causes off-centering */}
        <div className="flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {cars.map((car) => (
              <CarTiles key={car.id} car={car} />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center mt-12 space-x-4">
            <Link
              // onClick={() => goToPage(page - 1)}
              to='/browse'
              preload='intent'
              search={{ ...search, page: page - 1 }}
              disabled={page <= 1}
              className="px-4 py-2 bg-slate-800 text-white rounded-md disabled:opacity-30 transition-opacity hover:bg-slate-700"
            >
              Prev
            </Link>
            <div className="flex items-center gap-2">
              <input 
                className="w-12 text-center border rounded-md p-1"
                onChange={(e) => setPageInputField(Number(e.target.value))} 
                onKeyDown={(e) => e.key === 'Enter' && goToPage(pageInputField)} 
                type='number' 
                value={pageInputField} 
              />
              <span className="text-gray-500">/ {totalPages}</span>
            </div>
            <Link
              // onClick={() => goToPage(page + 1)}
              to='/browse'
              preload='intent'
              search={{...search, page: page + 1}}
              disabled={page >= totalPages}
              className="px-4 py-2 bg-slate-800 text-white rounded-md disabled:opacity-30 transition-opacity hover:bg-slate-700"
            >
              Next
            </Link>
          </div>
        </div>
      </div>
        <ScrollToTop />
    </div>
  )
}