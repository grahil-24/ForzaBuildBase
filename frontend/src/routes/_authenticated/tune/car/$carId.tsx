import { createFileRoute, useBlocker } from '@tanstack/react-router'
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react'
import { useLayoutEffect, useState, useRef } from 'react'
import { TabForm } from '../../../../components/tune/tabs/TabForm'
import type { Slider, TuneData } from '../../../../types/tune'
import data from '../../../../components/tune/tabs/data.json'

const tuneData = data as unknown as Record<string, TuneData>;
const categories = Object.keys(tuneData);

export const Route = createFileRoute('/_authenticated/tune/car/$carId')({
  component: RouteComponent,
})

function RouteComponent() {
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
    if (!formIsDirty) {
      setFormIsDirty(true);
    }
  }

  return (
    <div className="flex h-screen w-full justify-center px-4 pt-24">
      <div className="w-full max-w-6xl">
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