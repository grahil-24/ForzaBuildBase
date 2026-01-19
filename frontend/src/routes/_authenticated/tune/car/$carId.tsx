import { createFileRoute } from '@tanstack/react-router'
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react'
import { useLayoutEffect, useState, useRef } from 'react'
import { TabForm } from '../../../../components/tune/tabs/TabForm'
import data from '../../../../components/tune/tabs/data.json'

const categories = Object.keys(data);

export const Route = createFileRoute('/_authenticated/tune/car/$carId')({
  component: RouteComponent,
})

function RouteComponent (){

  const numOfTabs = categories.length;
  const [activeIndex, setActiveIndex] = useState(0);
  const tabRefs = useRef<HTMLElement[]>([]);
  const [indicatorStyle, setIndicatorStyle] = useState({
    width: 0,
    left: 0,
  });
  const [sliderData, setSliderData] = useState<Record<string, number>>(() => {
    //initialize with default values 
    const initialData: Record<string, number> = {};
    Object.values(data).forEach((section) => {
      section.sliders.forEach((sliderGroup) => {
        Object.values(sliderGroup).forEach((sliders) => {
          sliders.forEach((slider) => {
            initialData[slider.sliderId] = slider.defaultValue;
          });
        });
      });
    });
    
    return initialData;
  });

  useLayoutEffect(() => {
    const tab = tabRefs.current[activeIndex]
    if (!tab) return

    setIndicatorStyle({
      width: tab.offsetWidth,
      left: tab.offsetLeft,
    })
  }, [activeIndex])

  const handlePreviousTab = () => {
    setActiveIndex((prev) => Math.max(0, (prev - 1)));
  }

  const handleNextTab = () => {
    setActiveIndex((prev) => Math.min((prev + 1), (numOfTabs-1)));
  }

  const handleSliderChange = (sliderId: string, value: number) => {
    setSliderData((prev) => ({
      ...prev,
      [sliderId]: value
    }));
  }

  return (
    <div className="flex h-screen w-full justify-center px-4 pt-24">
      <div className="w-9/10">
        <TabGroup selectedIndex={activeIndex} onChange={setActiveIndex}>
          <div className="relative">
            <span
              className="absolute border-blue-600 border-b-2 bottom-0 top-0 bg-gray-200 transition-all duration-300 ease-out"
              style={{
                width: indicatorStyle.width,
                left: indicatorStyle.left,
              }}
            />

            <TabList className="overflow-hidden relative flex justify-center gap-1">
              <button onClick={handlePreviousTab} className='p-2 border-black bg-gray-200'>&lt;</button>
              {categories.map((name , index) => (
                <Tab
                  key={name}
                  ref={(el) => {
                    if (el) tabRefs.current[index] = el
                  }}
                  className={`relative ${activeIndex !== index ? 'hover:bg-gray-200/70' : ''} px-3 py-1 text-sm/6 font-semibold text-black focus:outline-none transition-colors duration-200`}
                >
                  {name}
                </Tab>
              ))}
              <button onClick={handleNextTab} className='p-2 border-black bg-gray-200'>&gt;</button>
            </TabList>
          </div>

          <TabPanels className="mt-3">
            {categories.map((name) => 
            (
              <TabPanel
                key={name}
                className="rounded-xl bg-black/5 p-3"
              >
                <TabForm data={data[name]} onSliderChange={handleSliderChange} sliderData={sliderData}/>
              </TabPanel>
            ))}
          </TabPanels>
        </TabGroup>
      </div>
    </div>
  )
}