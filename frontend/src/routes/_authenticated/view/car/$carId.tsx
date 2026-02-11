import { createFileRoute, notFound, Link} from '@tanstack/react-router'
import type { AuthState } from '../../../../types/auth'
import { authFetch } from '../../../../api/authFetch';
import { BACKEND } from '../../../../config/env';
// import { SessionExpiredError } from '../../../../errors/auth.errors';
import NotFoundComponent from '../../../../components/NotFoundComponent';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faChartLine, faBolt, faTachometerAlt, faRocket, faHandPaper, faMountain} from '@fortawesome/free-solid-svg-icons';
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import {useState, useEffect, type  ReactElement, type JSX} from 'react';
import { formatS3BucketURL } from '../../../../util/urlFormatter';
import type { Car } from '../../../../types/car';
import ErrorToast from '../../../../components/ErrorToast';

const faSteeringWheel: ReactElement =
    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="15px" width="15px" xmlns="http://www.w3.org/2000/svg">
      <path d="M256 25C128.3 25 25 128.3 25 256s103.3 231 231 231 231-103.3 231-231S383.7 25 256 25zm0 30c110.9 0 201 90.1 201 201s-90.1 201-201 201S55 366.9 55 256 145.1 55 256 55zM80.52 203.9c-4.71 19.2-7.52 37-7.52 54 144.7 30.3 121.5 62.4 148 177.8 11.4 2.1 23 3.3 35 3.3s23.6-1.2 35-3.3c26.5-115.4 3.3-147.5 148-177.8-.6-18.9-3-38.4-7.5-54C346.7 182.7 301.1 172 256 172c-45.1 0-90.7 10.7-175.48 31.9zM256 183c40.2 0 73 32.8 73 73s-32.8 73-73 73-73-32.8-73-73 32.8-73 73-73zm0 18c-30.5 0-55 24.5-55 55s24.5 55 55 55 55-24.5 55-55-24.5-55-55-55z"></path>
    </svg>
    
  
interface PathParams {
  carId: string 
}

type Unit = 'imperial' | 'metric';

export const Route = createFileRoute('/_authenticated/view/car/$carId')({
  loader: ({context, params}) => fetchCar(params, context.auth),
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorToast,
  component: RouteComponent,
  head: () => ({
    meta: [
      {
        title: 'View Car'
      }
    ]
  }),
});

const fetchCar = async(params: PathParams, authContext: AuthState): Promise<Car> => {
    const car = await authFetch(`${BACKEND}/view/car/${params.carId}`,
        {method: 'GET'},
        authContext
    )
    if(car.status === 404){
      throw notFound();
    }
    if(!car.ok){
      throw new Error();
    }
    return (await car.json()).car;
}

const StatBar = ({
  label,
  value,
  max = 10,
  icon,
}: {
  label: string;
  value: string;
  max?: number;
  icon: IconDefinition | JSX.Element; 
}) => {
  const [animatedWidth, setAnimatedWidth] = useState('0%');
  const targetWidth = `${(parseFloat(value) / max) * 100}%`;
  
  useEffect(() => {
    // Trigger animation after component mounts
    const timer = setTimeout(() => {
      setAnimatedWidth(targetWidth);
    }, 50); // Small delay to ensure animation triggers
    
    return () => clearTimeout(timer);
  }, [targetWidth]);
  
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          {typeof icon === 'object' && "iconName" in icon ? (
            <FontAwesomeIcon icon={icon as IconDefinition} className="text-slate-600" />
          ) : (
            icon
          )}
          <span className="text-slate-700 font-medium">{label}</span>
        </div>
        <span className="text-slate-900 font-bold">{value}</span>
      </div>
      <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-linear-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-400 ease-out"
          style={{ width: animatedWidth }}
        />
      </div>
    </div>
  );
};

const getRankColor = (rank: string): string => {
  const colors: Record<string, string> = {
    'S2': "from-indigo-500 to-indigo-600",
    'S1': "from-purple-500 to-purple-600",
    'A': 'from-rose-500 to-red-500',
    'B': 'from-orange-500 to-amber-500',
    'C': 'from-yellow-500 to-orange-400',
    'D': 'from-blue-500 to-cyan-500'
  };
  return colors[rank] || 'from-gray-400 to-gray-500';
};

const getRankBg = (rank: string):string => {
  const colors: Record<string, string> = {
    'S1': 'bg-purple-50 border-purple-200',
    'A': 'bg-rose-50 border-rose-200',
    'B': 'bg-orange-50 border-orange-200',
    'C': 'bg-yellow-50 border-yellow-200',
    'D': 'bg-blue-50 border-blue-200'
  };
  return colors[rank] || 'bg-gray-50 border-gray-200';
};

function RouteComponent() {
  const car: Car = Route.useLoaderData();
  const [unit, setUnit] = useState<Unit>('imperial');
  const imageUrl = formatS3BucketURL({manufacturer: car.Manufacturer, image_filename: car.image_filename, size: 'medium'});
  const displayTorque = unit === 'imperial' 
    ? car.Torque
    : car.Torque! * 1.36;
  const displayWeight = unit === 'imperial' ? car.Weight : car.Weight! * 0.45

  return (
   <div className="flex-row items-center justify-center min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100 px-7 py-2">
      <div className="max-w-6xl mx-auto">
        {/* Main Card with Image */}
        <div className="flex flex-col md:flex-row items-center justify-between bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden mb-6">
          {/* Image Section */}
          <div className="w-full lg:max-w-[40%] p-6 lg:p-0 lg:ml-auto lg:mr-auto">
            <img 
              src={imageUrl}
              alt={car.Vehicle!}
              className="-mt-10 object-contain drop-shadow-2xl w-full"
            />
          </div>

          {/* Header Info */}
          <div className="p-2 w-full">
            <div className="flex items-start justify-between mb-6">
              <div className='w-full'>
                <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0'>
                  <div className="text-blue-600 text-sm font-bold mb-2 uppercase tracking-wider">
                    {car.Manufacturer}
                  </div>
                  <div className='mr-auto ml-auto flex items-center gap-2'>
                    <label htmlFor="unit" className='text-sm text-slate-600'>Unit</label>
                    <select 
                      onChange={e => setUnit(e.target.value as Unit)}
                      name="unit" 
                      id="unit"
                      className="px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer transition-all text-sm"
                    >
                      <option value="imperial">Imperial</option>
                      <option value="metric">Metric</option>
                    </select>
                  </div>
                </div>
                <div className='flex justify-between mr-auto items-center gap-3'>
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
                    {car.Model}
                  </h1>
                  <div className={`bg-linear-to-br ${getRankColor(car.Rank!)} text-white text-xl sm:text-2xl font-bold w-10 h-10 rounded-xl flex items-center justify-center shadow-md shrink-0`}>
                    {car.Rank}
                  </div>
                </div>
                <div className="text-slate-600 text-lg sm:text-xl font-medium">{car.Year}</div>
              </div>
            </div>

            {/* Key Specs Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className={`${getRankBg(car.Rank!)} rounded-xl p-3 border`}>
                <div className="text-slate-600 text-xs uppercase tracking-wide font-semibold mb-1">Horsepower</div>
                <div className="text-lg sm:text-xl font-bold text-slate-900">{car.Horsepower} HP</div>
              </div>
              <div className={`${getRankBg(car.Rank!)} rounded-xl p-3 border`}>
                <div className="text-slate-600 text-xs uppercase tracking-wide font-semibold mb-1">Torque</div>
                <div className="text-lg sm:text-xl font-bold text-slate-900">{displayTorque!.toFixed(0)} {unit === 'imperial' ? 'lb-ft':'N-m'}</div>
              </div>
              <div className={`${getRankBg(car.Rank!)} rounded-xl p-3 border`}>
                <div className="text-slate-600 text-xs uppercase tracking-wide font-semibold mb-1">Weight</div>
                <div className="text-lg sm:text-xl font-bold text-slate-900">{displayWeight!.toFixed(0).toLocaleString()} {unit === 'imperial' ? 'lbs' : 'kgs'}</div>
              </div>
              <div className={`${getRankBg(car.Rank!)} rounded-xl p-3 border`}>
                <div className="text-slate-600 text-xs uppercase tracking-wide font-semibold mb-1">Drivetrain</div>
                <div className="text-lg sm:text-xl font-bold text-slate-900">{car.Drivetrain}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Engine Specifications */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-md">
            <h2 className="text-xl font-bold text-slate-900 mb-5 flex items-center gap-2">
              <FontAwesomeIcon icon={faCog} className='text-blue-600' />
              Engine Specifications
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-3 border-b border-slate-200">
                <span className="text-slate-600 font-medium">Engine Type</span>
                <span className="text-slate-900 font-bold">{car.EngineType}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-slate-200">
                <span className="text-slate-600 font-medium">Displacement</span>
                <span className="text-slate-900 font-bold">{car.Displacement}L</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-slate-200">
                <span className="text-slate-600 font-medium">Aspiration</span>
                <span className="text-slate-900 font-bold">
                  {car.Aspiration || 'Natural'}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-slate-200">
                <span className="text-slate-600 font-medium">Fuel Type</span>
                <span className="text-slate-900 font-bold">{car.FuelType}</span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-slate-600 font-medium">Weight Distribution</span>
                <span className="text-slate-900 font-bold">{car.FrontPercent}% Front</span>
              </div>
            </div>
          </div>

          {/* Performance Stats */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-md">
            <h2 className="text-xl font-bold text-slate-900 mb-5 flex items-center gap-2">
              <FontAwesomeIcon icon={faChartLine} className='text-blue-600' />
              Performance Ratings
            </h2>
            <div className="space-y-4">
              <StatBar label="Speed" value={car.Speed!} icon={faBolt} />
              <StatBar label="Acceleration" value={car.Acceleration!} icon={faTachometerAlt} />
              <StatBar label="Handling" value={car.Handling!} icon={faSteeringWheel}/>
              <StatBar label="Launch" value={car.Launch!} icon={faRocket} />
              <StatBar label="Braking" value={car.Braking!} icon={faHandPaper} />
              <StatBar label="Offroad" value={car.Offroad!} icon={faMountain} />
            </div>
          </div>
        </div>
      </div>
      <div className='flex'>
        <Link className='mx-auto' to="/tune/car/$carId" params={{carId: car.id.toString()}} state={{
          carData: {
            id: car.id,
            image_filename: car.image_filename,
            Manufacturer: car.Manufacturer,
            Year: car.Year,
            Model: car.Model
          }
        }}>
        <button className='mt-5 bg-white font-black text-[18px] px-[1.3em] py-[0.6em]
    border-[3px] border-black rounded-[0.4em] shadow-[0.1em_0.1em_0_#000] cursor-pointer
    transition-all hover:-translate-x-[0.05em] hover:-translate-y-[0.05em] hover:shadow-[0.15em_0.15em_0_#000]
    active:translate-x-[0.05em] active:translate-y-[0.05em] active:shadow-[0.05em_0.05em_0_#000]'>
      Tune</button>
      </Link>
      </div>
    </div>
  );

}