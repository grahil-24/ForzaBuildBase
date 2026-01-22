import { createFileRoute, useBlocker, notFound} from '@tanstack/react-router'
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react'
import { useLayoutEffect, useState, useRef } from 'react'
import { TabForm } from '../../../../components/tune/tabs/TabForm'
import type { Slider, TuneData } from '../../../../types/tune'
import data from '../../../../components/tune/tabs/data.json'
import type { Car } from '../../../../types/car'
import { authFetch } from '../../../../api/authFetch'
import type { AuthState } from '../../../../types/auth'
import { BACKEND } from '../../../../config/env'
import NotFoundComponent from '../../../../components/NotFoundComponent';
import { formatS3BucketURL } from '../../../../util/urlFormatter'

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

function RouteComponent() {
  const car: Car = Route.useLoaderData();
  const imageURL = formatS3BucketURL({manufacturer: car.Manufacturer, image_filename: car.image_filename, size: "medium"})
  const numOfTabs = categories.length;
  const [activeIndex, setActiveIndex] = useState(0);

  /* These refs allow direct DOM access for measuring positions, and controlling scroll behaviour*/
  //holds reference to the div wrapping tablist
  const tabListRef = useRef<HTMLDivElement | null>(null);
  //an array that stores references to each individual tab button element
  const tabRefs = useRef<(HTMLElement | null)[]>([]);
  
  /* initialize slider data with the defaultValue */
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

  /* flag which is set when a value in slider is changed, this flag is used to throw the warning modal when
  user tries to leave the page*/
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

  // runs when activeTab is changed. Scroll active tab into view
 useLayoutEffect(() => {
  const tabElement = tabRefs.current[activeIndex];
  if (tabElement) {
    // requestAnimationFrame ensures the browser has finished 
    // any internal layout shifts before we move the scrollbar
    requestAnimationFrame(() => {
      tabElement.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    });
  }
}, [activeIndex]);

  const handlePreviousTab = () => {
    setActiveIndex((prev) => Math.max(0, prev - 1));
  }

  const handleNextTab = () => {
    setActiveIndex((prev) => Math.min(prev + 1, numOfTabs - 1));
  }

  const handleSliderChange = (sliderId: string, value: number) => {
    setSliderData((prev) => ({
      ...prev,
      [sliderId]: value
    }));
    console.log("slider data ", sliderData);
    if (!formIsDirty) {
      setFormIsDirty(true);
    }
  }

  return (
    <div className="flex h-screen w-full justify-center px-4 pt-24">
      <div className="w-full max-w-6xl">
        {/* Car Info Header */}
        <div className="bg-white rounded-xl shadow-md border border-slate-200 p-4 mb-6 flex items-center gap-4">
          <img 
            src={imageURL} 
            alt={`${car.Manufacturer} ${car.Model}`}
            className="w-32 h-auto object-contain"
          />
          <div>
            <div className="text-blue-600 text-sm font-bold uppercase tracking-wider">
              {car.Manufacturer}
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              {car.Model}
            </h1>
            <div className="text-slate-600 text-lg font-medium">
              {car.Year}
            </div>
          </div>
        </div>
        <TabGroup selectedIndex={activeIndex} onChange={setActiveIndex}>
          <div className="relative mb-6">
            <div className="flex mx-auto w-9/10 gap-2 items-center">
              {/* Previous Button */}
              <button
                onClick={handlePreviousTab}
                disabled={activeIndex === 0}
                className="shrink-0 p-2 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed rounded transition-colors duration-200 font-bold text-lg"
                aria-label="Previous tab"
              >
                &lt;
              </button>

              {/* Scrollable Tab List */}
              <div
                ref={tabListRef}
                className="flex-1 overflow-x-auto scrollbar-hide"
                style={{
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                }}
              >
                <TabList className="flex justify-center items-center gap-2 min-w-min">
                  {categories.map((name, index) => (
                    <Tab
                      key={name}
                      ref={(el) => {tabRefs.current[index]= el}}
                      className={`
                        shrink-0 px-4 py-2 text-sm font-semibold rounded-lg
                        transition-all duration-200 whitespace-nowrap
                        focus:outline-none  
                        ${
                          activeIndex === index
                            ? 'bg-black text-white shadow-md'
                            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                        }
                      `}
                    >
                      {name}
                    </Tab>
                  ))}
                </TabList>
              </div>

              {/* Next Button */}
              <button
                onClick={handleNextTab}
                disabled={activeIndex === numOfTabs - 1}
                className="shrink-0 p-2 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed rounded transition-colors duration-200 font-bold text-lg"
                aria-label="Next tab"
              >
                &gt;
              </button>
            </div>
          </div>

          <TabPanels>
            {categories.map((name) => (
              <TabPanel
                key={name}
                className="rounded-xl bg-gray-50 p-4 shadow-sm"
              >
                <TabForm
                  data={tuneData[name]}
                  onSliderChange={handleSliderChange}
                  sliderData={sliderData}
                />
              </TabPanel>
            ))}
          </TabPanels>
        </TabGroup>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}