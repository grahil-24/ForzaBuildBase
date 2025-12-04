import { createFileRoute, Link, type ParsedLocation} from '@tanstack/react-router'
import CarTiles from '../components/CarTiles';
import Nav from '../components/Navbar';
import FilterSidebar from '../components/FilterSidebar';

interface BrowseSearch {
  page?: number
}

interface Car {
  id: number
  Year: number
  image_filename: string
  Model: string
  Manufacturer: string
  Rank: number
}

interface LoaderData {
  cars: Car[]
  totalPages: number,
  total: number
}

export const Route = createFileRoute('/browse')({
  validateSearch: (search: Record<string, unknown>): BrowseSearch => {
    return {
      page: Number(search?.page) || undefined,
    }
  },
  preload: true,
  loader: ({ location }) => fetchCars(location),
  component: BrowseComponent,
})

const fetchCars = async (location: ParsedLocation): Promise<LoaderData> => {
    const searchParams = new URLSearchParams(location.search)
    const page = searchParams.get('page') ? Number(searchParams.get('page')) : 1
    const res = await fetch(`http://localhost:9000/browse?page=${page}`)
    if (!res.ok) throw new Error('Failed to fetch cars')
    const data = await res.json()
    return data as LoaderData
}

function BrowseComponent() {
  const { cars, totalPages, total } = Route.useLoaderData();
  const search = Route.useSearch();
  const page = search.page ?? 1

  return (
    <div className="w-full">
      <Nav />
      <div>
          <p className='text-xl text-center pt-5'>Showing {total} results</p>
      </div>
      <div className='flex gap-6 p-6'>
        <aside> 
          <FilterSidebar />
        </aside>
        <div className="flex-1 pt-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {cars.map((car) => (
                <CarTiles key={car.id} car={car} />
                ))}
            </div>
            <div className="flex justify-center items-center mt-8 space-x-2">
                <Link
                to="/browse"
                search={{ page: page - 1 }}
                disabled={page <= 1}
                className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50"
                >
                Prev
                </Link>
                <span className="text-black">{page} / {totalPages}</span>
                <Link
                to="/browse"
                search={{ page: page + 1 }}
                disabled={page >= totalPages}
                className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50"
                >
                Next
                </Link>
            </div>
        </div>
      </div>
    </div>
  )
}