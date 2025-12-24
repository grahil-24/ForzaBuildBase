import { createFileRoute, notFound, redirect} from '@tanstack/react-router'
import type { AuthState } from '../../../../types/auth'
import { authFetch } from '../../../../api/authFetch';
import { BACKEND } from '../../../../config/env';
import { SessionExpiredError } from '../../../../errors/auth.errors';
import NotFoundComponent from '../../../../components/NotFoundComponent';
import ErrorComponent from '../../../../components/ErrorComponent';
import { S3_BUCKET_URL } from '../../../../config/env';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faChartLine, faBolt, faTachometerAlt, faRocket, faHandPaper, faMountain} from '@fortawesome/free-solid-svg-icons';
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';

interface PathParams {
  carId: string  // Note: route params are typically strings
}

export const Route = createFileRoute('/_authenticated/view/car/$carId')({
  loader: ({context, params}) => fetchCar(params, context.auth),
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
  component: RouteComponent,
});

const fetchCar = async(params: PathParams, authContext: AuthState) => {
    try{
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
    }catch(err: unknown){
      console.log("error ", err);
      if(err instanceof SessionExpiredError){
        await authContext.logout();
        throw redirect({to: '/'});
      }
      throw err;
    }
}

 const StatBar = ({ label, value, max = 10, icon }: {label: string, value: string, max?: number, icon?: IconDefinition}) => (
  <div className="space-y-1.5">
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2">
        {icon && <FontAwesomeIcon icon={icon} className='text-slate-600'/>}
        <span className="text-slate-700 font-medium">{label}</span>
      </div>
      <span className="text-slate-900 font-bold">{value}</span>
    </div>
    <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
      <div 
        className="h-full bg-linear-to-r from-blue-500 to-cyan-400 transition-all duration-500 rounded-full"
        style={{ width: `${(parseFloat(value) / max) * 100}%` }}
      />
    </div>
  </div>
);

const getRankColor = (rank: string): string => {
  const colors: Record<string, string> = {
    'S2': "from-blue-800",
    'S1': "from-purple-500",
    'S': 'from-purple-500 to-pink-500',
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
  const car = Route.useLoaderData();
  const manufacturerImg = car.Manufacturer.replace(/ /g, '_');
  const image_filename = car.image_filename ? car.image_filename.replace(/ /g, '_') : null;
  const imageUrl = `${S3_BUCKET_URL}/${car.image_filename ? manufacturerImg: 'Default'}/${car.image_filename ? image_filename : 'default_car.png'}`;
  
  
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Main Card with Image */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden mb-6">
          {/* Image Section */}
          <div className="bg-linear-to-br from-slate-100 to-slate-200 p-12 flex items-center justify-center">
            <img 
              src={imageUrl}
              alt={car.Vehicle}
              className="max-w-full h-auto max-h-96 object-contain drop-shadow-2xl"
            />
          </div>

          {/* Header Info */}
          <div className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="text-blue-600 text-sm font-bold mb-2 uppercase tracking-wider">
                  {car.Manufacturer}
                </div>
                <h1 className="text-4xl font-bold text-slate-900 mb-2">
                  {car.Model}
                </h1>
                <div className="text-slate-600 text-xl font-medium">{car.Year}</div>
              </div>
              <div className={`bg-linear-to-br ${getRankColor(car.Rank)} text-white text-3xl font-bold w-16 h-16 rounded-xl flex items-center justify-center shadow-md`}>
                {car.Rank}
              </div>
            </div>

            {/* Key Specs Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className={`${getRankBg(car.Rank)} rounded-xl p-4 border`}>
                <div className="text-slate-600 text-xs uppercase tracking-wide font-semibold mb-1">Horsepower</div>
                <div className="text-2xl font-bold text-slate-900">{car.Horsepower} HP</div>
              </div>
              <div className={`${getRankBg(car.Rank)} rounded-xl p-4 border`}>
                <div className="text-slate-600 text-xs uppercase tracking-wide font-semibold mb-1">Torque</div>
                <div className="text-2xl font-bold text-slate-900">{car.Torque} lb-ft</div>
              </div>
              <div className={`${getRankBg(car.Rank)} rounded-xl p-4 border`}>
                <div className="text-slate-600 text-xs uppercase tracking-wide font-semibold mb-1">Weight</div>
                <div className="text-2xl font-bold text-slate-900">{car.Weight.toLocaleString()} lbs</div>
              </div>
              <div className={`${getRankBg(car.Rank)} rounded-xl p-4 border`}>
                <div className="text-slate-600 text-xs uppercase tracking-wide font-semibold mb-1">Drivetrain</div>
                <div className="text-2xl font-bold text-slate-900">{car.Drivetrain}</div>
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
              <StatBar label="Speed" value={car.Speed} icon={faBolt} />
              <StatBar label="Acceleration" value={car.Acceleration} icon={faTachometerAlt} />
              <StatBar label="Handling" value={car.Handling} />
              <StatBar label="Launch" value={car.Launch} icon={faRocket} />
              <StatBar label="Braking" value={car.Braking} icon={faHandPaper} />
              <StatBar label="Offroad" value={car.Offroad} icon={faMountain} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

}