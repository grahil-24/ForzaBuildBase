import {createFileRoute, useNavigate, type ParsedLocation} from '@tanstack/react-router'
import CarTiles from '../../components/browse/CarTiles';
import FilterSidebar from '../../components/browse/FilterSidebar';
import React, { useEffect, useState } from 'react';
import type {Car} from '../../types/car';
import Searchbar from '../../components/Searchbar';
import {authFetch} from "../../api/authFetch.ts";
import type { AuthState } from '../../types/auth.ts';
import { BACKEND } from '../../config/env.ts';
import ScrollToTop from '../../components/ScrollToTop.tsx';

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

  return (
    <div className="w-full max-w-(--break-2xl) mx-auto">
      {/* Header Section */}
      <div className='px-6 mt-5 grid grid-cols-1 md:grid-cols-3 items-center gap-4'>
        
        {/* 1. Filter: Left aligned. On mobile, we keep it inline-block */}
        <div className='flex justify-start order-1'>
          <FilterSidebar />
        </div>

        {/* 2. Results: Dead Center on desktop. Order 2 */}
        <div className='text-center order-2'>
          <p className='text-lg font-semibold whitespace-nowrap'>
            Showing <span className="text-lime-600">{total}</span> results
          </p>
        </div>

        {/* 3. Search: Right aligned on desktop. Full width on mobile. Order 3 */}
        <div className='flex justify-center md:justify-end order-3 w-full'>
          <Searchbar 
            handleSearchbar={(e) => setSearchBarText(e.target.value)} 
            handleSearch={() => navigate({to: '/browse', search: {search: searchBarText, page: 1}})}
          />
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
            <button
              onClick={() => goToPage(page - 1)}
              disabled={page <= 1}
              className="px-4 py-2 bg-slate-800 text-white rounded-md disabled:opacity-30 transition-opacity hover:bg-slate-700"
            >
              Prev
            </button>
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
            <button
              onClick={() => goToPage(page + 1)}
              disabled={page >= totalPages}
              className="px-4 py-2 bg-slate-800 text-white rounded-md disabled:opacity-30 transition-opacity hover:bg-slate-700"
            >
              Next
            </button>
          </div>
        </div>
      </div>
      
      <div className='md:hidden'>
        <ScrollToTop />
      </div>
    </div>
  )
}