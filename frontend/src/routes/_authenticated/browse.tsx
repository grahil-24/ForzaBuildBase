import {createFileRoute, useNavigate, type ParsedLocation} from '@tanstack/react-router'
import CarTiles from '../../components/browse/CarTiles';
import FilterSidebar from '../../components/browse/FilterSidebar';
import React, { useEffect, useState } from 'react';
import type {Car} from '../../types/car';
import Searchbar from '../../components/Searchbar';
import {authFetch} from "../../api/authFetch.ts";
import type { AuthState } from '../../types/auth.ts';
import { BACKEND } from '../../config/env.ts';

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
  preload: true,
  loaderDeps: ({search: {page, rank, drivetrain, fuel_type, manufacturer, search}}) => ({page, rank, drivetrain, fuel_type, manufacturer, search}),
  loader: async({ context, location }) => await fetchCars(location, context.auth),
  staleTime: Infinity,
  component: BrowseComponent,
})

const fetchCars = async (location: ParsedLocation, auth: AuthState): Promise<LoaderData> => {
  window.scrollTo(0, 0);
  const params = new URLSearchParams();
  Object.entries(location.search).forEach(([key, value] ) => {
    if (Array.isArray(value) && value.length > 0) {
      params.set(key, value.join(','));
    } else if (value !== undefined && value !== null) {
      params.set(key, String(value));
    }
  });

  const queryString = params.toString();
  // try {
  //   const res = await authFetch(`${BACKEND}/browse?${queryString}`,
  //     { method: 'GET' },
  //     auth
  //   );
  //   if (!res.ok) throw new Error('Failed to fetch cars');
  //   const data = await res.json();
  //   return data as LoaderData;
  // } catch(err: unknown) {
  //   if(err instanceof SessionExpiredError){
  //     await auth.logout();
  //     throw redirect({to: '/', replace: true})
  //   }
  //   throw err;
  // }
  const res = await authFetch(`${BACKEND}/browse?${queryString}`,
      { method: 'GET' },
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

  useEffect(()=> {
    setPageInputField(page);
  }, [page]);

  const navigate = useNavigate();

  const goToPage = (newPage: number) => {
    navigate({
      to: '/browse',
      search: { ...search, page: newPage }
    });
  };

  const handleSearchbar = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchBarText(e.target.value);
  }

  const handleSearch = () => {
    navigate({to: '/browse', search: {search: searchBarText, page: 1}})
  }

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageInputField(Number(e.target.value));
  }

  const handlePageEnterPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
     if(e.key === 'Enter'){
        goToPage(pageInputField);
     }
  }

  return (
    <div className="w-full">
      <div className='relative flex flex-col md:flex-row items-center justify-center px-6 pt-5 gap-4'>
        <p className='text-lg pt-5'>Showing {total} results</p>
        <div className='md:absolute md:right-6'>
          <Searchbar handleSearchbar={handleSearchbar} handleSearch={handleSearch}/>
        </div>
      </div>
      <div className='flex gap-6 p-6'>
        <aside className='fixed -mt-10'>
          <FilterSidebar />
        </aside>
        <div className="ml-15 flex-1 pt-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {cars.map((car) => (
              <CarTiles key={car.id} car={car} />
            ))}
          </div>
          <div className="flex justify-center items-center mt-8 space-x-2">
            <button
              onClick={() => goToPage(page - 1)}
              disabled={page <= 1}
              className="px-3 py-1 bg-lime-400 text-white rounded disabled:opacity-50"
            >
              Prev
            </button>
            <span className="text-black"><input onChange={handlePageInputChange} onKeyDown={handlePageEnterPress} type='number' value={pageInputField} min={1} max={totalPages}/> / {totalPages}</span>
            <button
              onClick={() => goToPage(page + 1)}
              disabled={page >= totalPages}
              className="px-3 py-1 bg-lime-400 text-white rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}