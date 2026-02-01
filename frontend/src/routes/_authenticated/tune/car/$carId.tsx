import { createFileRoute, useBlocker, notFound, useNavigate} from '@tanstack/react-router'
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react'
import { useLayoutEffect, useState, useRef} from 'react'
import { TabForm } from '../../../../components/tune/tabs/TabForm'
import type { Slider, TuneData } from '../../../../types/tune'
import data from '../../../../components/tune/tabs/data.json'
import type { Car } from '../../../../types/car'
import { authFetch } from '../../../../api/authFetch'
import type { AuthState } from '../../../../types/auth'
import { BACKEND } from '../../../../config/env'
import NotFoundComponent from '../../../../components/NotFoundComponent';
import { PencilIcon} from '@heroicons/react/24/outline'
import { formatS3BucketURL } from '../../../../util/urlFormatter'
import { Menu, MenuItem } from "@spaceymonk/react-radial-menu";
import type { RankType } from '../../../../types/car'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFloppyDisk } from '@fortawesome/free-solid-svg-icons'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'react-toastify'

const tuneData = data as unknown as Record<string, TuneData>;
const categories = Object.keys(tuneData);

interface PathParams {
  carId: string 
}

export const Route = createFileRoute('/_authenticated/tune/car/$carId')({
  loader: async({context, params, location}) => {
    let carData: Car | undefined = location.state?.carData
    if(carData === undefined) {
      carData = await fetchCar(params, context.auth)
    }
    return carData;
  },
  head: () => ({
    meta: [
      {
        title: 'Tune'
      }
    ]
  }),
  notFoundComponent: NotFoundComponent,
  component: RouteComponent,
})

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

const classColors: Record<RankType, string> = {
  'S2': 'bg-pink-600',
  'S1': 'bg-purple-600',
  'A': 'bg-blue-600',
  'B': 'bg-orange-600',
  'C': 'bg-yellow-500',
  'D': 'bg-green-600'
};

const classFontColors: Record<RankType, string> = {
  'S2': 'text-pink-600',
  'S1': 'text-purple-600',
  'A': 'text-blue-600',
  'B': 'text-orange-600',
  'C': 'text-yellow-500',
  'D': 'text-green-600'
};

const cssColors: Record<RankType, string> = {
  'S2': '#db2777',  // bg-pink-600
  'S1': '#9333ea',  // bg-purple-600
  'A': '#2563eb',   // bg-blue-600
  'B': '#ea580c',   // bg-orange-600
  'C': '#eab308',   // bg-yellow-500
  'D': '#16a34a'    // bg-green-600
};
  
function RouteComponent() {
  const navigate = useNavigate();
  const car: Car = Route.useLoaderData();
  const {auth} = Route.useRouteContext();
  const [carClass, setCarClass] = useState<RankType>('S1');
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [openClassMenu, setOpenClassMenu] = useState<boolean>(false);
  const classButtonRef = useRef<HTMLButtonElement>(null);
  const imageURL = formatS3BucketURL({manufacturer: car.Manufacturer, image_filename: car.image_filename, size: "medium"})
  const numOfTabs = categories.length;
  const [activeIndex, setActiveIndex] = useState(0);
  
  const [tuneName, setTuneName] = useState(`${car.Manufacturer} ${car.Model} Tune`);
  const [isEditingName, setIsEditingName] = useState(false);
  const nameInputRef = useRef<HTMLInputElement | null>(null);

  const tabListRef = useRef<HTMLDivElement | null>(null);
  const tabRefs = useRef<(HTMLElement | null)[]>([]);
  
  const [sliderData, setSliderData] = useState<Record<string, number>>(() => {
    const initialData: Record<string, number> = {};
    Object.values(tuneData).forEach((section) => {
      section.sliders.forEach((sliderGroup) => {
        Object.values(sliderGroup).forEach((sliders) => {
          sliders.forEach((slider: Slider) => {
            initialData[slider.sliderId] = slider.defaultValue;
          });
        });
      });
    });
    return initialData;
  });
  
  const [formIsDirty, setFormIsDirty] = useState<boolean>(false);
  
  const { proceed, reset, status } = useBlocker({
    shouldBlockFn: () => formIsDirty,
    withResolver: true
  });
  
  useLayoutEffect(() => {
    if (status === 'blocked') {
      const shouldLeave = window.confirm(
        'Are you sure you want to leave? Information you\'ve entered may not be saved.'
      );
      if (shouldLeave) {
        proceed();
      } else {
        reset();
      }
    }
  }, [status, proceed, reset]);
  
  useLayoutEffect(() => {
    if(isEditingName && nameInputRef.current) nameInputRef.current.select();
  }, [isEditingName])
  
  useLayoutEffect(() => {
    const tabElement = tabRefs.current[activeIndex];
    if (tabElement) {
      requestAnimationFrame(() => {
        tabElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      });
    }
  }, [activeIndex]);
  
  const handlePreviousTab = () => setActiveIndex((prev) => Math.max(0, prev - 1));
  const handleNextTab = () => setActiveIndex((prev) => Math.min(prev + 1, numOfTabs - 1));
  
  const handleSliderChange = (sliderId: string, value: number) => {
    setSliderData((prev) => ({ ...prev, [sliderId]: value }));
    if (!formIsDirty) setFormIsDirty(true);
  }

  const handleClassSelect = (_event: React.MouseEvent<SVGGElement, MouseEvent>, _index: number, classId: RankType) => {
    setCarClass(classId);
    setOpenClassMenu(false);
    setFormIsDirty(true);
  };

  const handleClassButtonClick = () => {
    if (classButtonRef.current) {
      const rect = classButtonRef.current.getBoundingClientRect();
      // Add scroll offsets to position menu correctly when page is scrolled
      setPosition({ 
        x: rect.left + rect.width / 2 + window.scrollX, 
        y: rect.top + rect.height / 2 + window.scrollY 
      });
      setOpenClassMenu(true);
    }
  };

  const createTune = useMutation({
    mutationFn: async(newTune: string) => {
      const res = await authFetch(`${BACKEND}/tune/create`, {method: 'POST', headers: {'Content-Type': 'application/json'}, body: newTune}, auth);
      if(res.status === 409){
        throw new Error('You have already created a tune with this name');
      }
      if(!res.ok){
        throw new Error();
      }
      return await res.json();
    },
    onError: (error) => {
      toast.error(error?.message || 'There was a problem saving the tune');
      createTune.reset();
    },
    onSuccess: (data: any) => {
      toast.success('Tune created successfully!', {autoClose: 2000});
      createTune.reset();
      setFormIsDirty(false);
      setTimeout(() => {
        navigate({to: '/view/tune/$tuneId', params: {tuneId: data.tune.tune_id}, state: {tuneDetails: {created_on: data.tune.created_on, tune_id: data.tune.tune_id, tune_name: data.tune.tune_name, creator: auth.user!.username, car: car, class: carClass, tune_details: sliderData}}})
      }, 2000);
      
    }
  })

  return (
    <div className="min-h-screen w-full flex justify-center px-2 sm:px-4 py-4 md:py-8 bg-slate-50">
      <div className="w-full max-w-6xl">
        <div className="flex flex-col md:flex-row items-center md:items-start bg-white rounded-xl shadow-md border border-slate-200 p-4 mb-6 gap-4">
          <div className="w-full md:w-auto flex items-center gap-4">
            <img 
              src={imageURL} 
              alt={`${car.Manufacturer} ${car.Model}`}
              className="w-48 sm:w-56 md:w-60 md:-mt-8 h-auto object-contain drop-shadow-lg"
            />
            <div className="text-center sm:text-left flex-1 min-w-0">
              <div className="text-blue-600 text-xs md:text-sm font-bold uppercase tracking-wider">
                {car.Manufacturer}
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-900 leading-tight">
                {car.Model}
              </h1>
              <div className="text-slate-500 text-base md:text-lg font-medium">
                {car.Year}
              </div>
            </div>
          </div>

          <div className="w-full md:w-auto flex flex-col gap-3 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
            {/* Tune Name */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-bold text-slate-700">Tune:</label>
              <div className="flex-1 flex items-center gap-2 min-w-0 bg-slate-50 md:bg-transparent p-2 md:p-0 rounded-lg">
                {isEditingName ? (
                  <input
                    ref={nameInputRef}
                    type="text"
                    value={tuneName}
                    onChange={(e) => { setTuneName(e.target.value); setFormIsDirty(true); }}
                    onBlur={() => { setIsEditingName(false); if (!tuneName.trim()) setTuneName(`${car.Manufacturer} ${car.Model} Tune`); }}
                    onKeyDown={(e) => {
                        if(e.key === 'Enter') {
                          if(!tuneName.trim()) setTuneName(`${car.Manufacturer} ${car.Model} Tune`);
                          setIsEditingName(false);
                        }
                      }
                    }
                    className="w-full outline-0 border-b border-blue-500 bg-transparent text-slate-900 font-medium"
                    maxLength={50}
                  />
                ) : (
                  <>
                    <span className="flex-1 text-slate-900 font-medium truncate max-w-[200px] md:max-w-xs">
                      {tuneName}
                    </span>
                    <button onClick={() => setIsEditingName(true)} className="p-1 hover:bg-slate-200 rounded-full transition-colors">
                      <PencilIcon className='size-4 text-slate-500'/>
                    </button>
                  </>
                )}
              </div>
            </div>
            {/* Class Selection */}
            <div className="flex items-center gap-5">
              <div>
              <label className="text-sm font-bold text-slate-700">Class:</label>
              <button
                ref={classButtonRef}
                onClick={handleClassButtonClick}
                className={`${classColors[carClass]} bg-linear-to-r from-indigo-500 from-10% via-sky-500 via-30% to-emerald-500 to-90% cursor-pointer w-12 h-12 px-3 py-2 rounded-full text-white font-black italic shadow-lg border-2 border-white transition-all hover:scale-105 active:scale-95`}
                >
                {carClass}
              </button>
              </div>
              <button onClick={() => {
                createTune.mutate(JSON.stringify({
                  tune_name: tuneName, 
                  car_id: car.id, 
                  tuneSettings: {
                    ...sliderData,
                    resultant_rank: carClass
                  }
                }))
              }} className='border-2 border-black px-2 py-2 rounded-sm hover:bg-black hover:text-white duration-200 cursor-pointer'>
                {createTune.isPending ? ( 
                  <p>Saving...</p>
                ) : (
                  <><FontAwesomeIcon icon={faFloppyDisk}/> Save</>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Radial Menu */}
        <Menu
          centerX={position.x}
          centerY={position.y}
          innerRadius={50}
          outerRadius={90}
          show={openClassMenu}
          animation={["rotate", "scale", "fade"]}
          animationTimeout={200}
          style={{'--__reactRadialMenu__zIndex': 1} as React.CSSProperties}
        >
          {(Object.keys(classColors) as RankType[]).map((classId: RankType) => (
            <MenuItem 
              key={classId}
              onItemClick={handleClassSelect} 
              data={classId}
              className='group'
              style={{'--__reactRadialMenu__activeItem-bgColor': cssColors[classId]
              } as React.CSSProperties}
            >
              <div className={`${classFontColors[classId]} group-hover:text-white font-extrabold`}>
                {classId}
              </div>
            </MenuItem>
          ))}
        </Menu>
      
        <TabGroup selectedIndex={activeIndex} onChange={setActiveIndex}>
          <div className="mx-auto xl:w-9/10 w-full top-2 mb-4 bg-slate-50/80 backdrop-blur-sm py-2">
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={handlePreviousTab}
                disabled={activeIndex === 0}
                className="cursor-pointer shrink-0 h-10 w-8 flex items-center justify-center bg-white border border-slate-200 shadow-sm rounded-lg disabled:opacity-30"
              >
                &lt;
              </button>
              
              <div ref={tabListRef} className="flex-1 overflow-x-auto"
              style={{
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                }}
              >
                <TabList className="flex gap-2 min-w-max px-1">
                  {categories.map((name, index) => (
                    <Tab
                      key={name}
                      ref={(el) => {tabRefs.current[index]= el}}
                      className={({ selected }) => `
                        cursor-pointer px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-colors
                        ${selected 
                          ? 'bg-slate-900 text-white' 
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'}
                      `}
                    >
                      {name}
                    </Tab>
                  ))}
                </TabList>
              </div>
              
              <button
                onClick={handleNextTab}
                disabled={activeIndex === numOfTabs - 1}
                className="shrink-0 h-10 w-8 flex items-center justify-center bg-white border border-slate-200 shadow-sm rounded-lg disabled:opacity-30"
              >
                &gt;
              </button>
            </div>
          </div>
          
          <TabPanels>
            {categories.map((name) => (
              <TabPanel key={name} className="focus:outline-none">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-3 sm:p-6 min-h-[400px]">
                  <TabForm
                    data={tuneData[name]}
                    onSliderChange={handleSliderChange}
                    sliderData={sliderData}
                  />
                </div>
              </TabPanel>
            ))}
          </TabPanels>
        </TabGroup>
      </div>
    </div>
  )
}