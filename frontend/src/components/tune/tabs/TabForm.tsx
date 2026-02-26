import { TuneSlider } from "../TuneSlider";
import type {TuneData } from "../../../types/tune";
import { BookOpenIcon } from "@heroicons/react/20/solid";
import { useState } from "react";
import { Dialog, DialogPanel, DialogTitle, Button } from "@headlessui/react";

export const TabForm = ({ data, onSliderChange, sliderData }: { data: TuneData, onSliderChange: (sliderId: string, value: number) => void,  sliderData: Record<string, number> }) => {
  const [guideOpen, setGuideOpen] = useState<boolean>(false);
  
  return (
    <div className="bg-linear-to-br from-gray-900/60 to-black/80 rounded-lg p-3 sm:p-6 backdrop-blur-sm">
      <div className="mb-6">
        <h2 className="text-white font-bold text-xl mb-2 uppercase tracking-wide">
          {data.header}
        </h2>
        <p className="hidden md:block text-gray-300 text-sm leading-relaxed">
          {data.info}
        </p>
        {/* hide guide in mobile screen. instead show a pop up*/} 
        <button onClick={() => setGuideOpen(true)} className="md:hidden flex gap-1 items-center bg-gray-200 rounded-lg p-2"><BookOpenIcon className="size-5 group-not-data-open:hidden"/> Guide</button>
        
        <Dialog open={guideOpen} as="div" className="relative z-10 focus:outline-none" onClose={() => setGuideOpen(false)}>
          <div className="fixed inset-0 z-10 w-screen overflow-y-auto bg-black/40 backdrop-blur-sm">
            <div className="flex min-h-full items-center justify-center p-4">
              <DialogPanel
                transition
                className="w-full max-w-md rounded-lg bg-white p-8 shadow-2xl duration-300 ease-out data-closed:transform-[scale(95%)] data-closed:opacity-0 border border-black"
              >
                <DialogTitle as="h3" className="text-xl font-serif font-semibold text-gray-800 mb-4 border-b border-black pb-2">
                  {data.header}
                </DialogTitle>
                <div className="mt-2 max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-amber-300 scrollbar-track-transparent">
                  <p className="text-base leading-relaxed text-gray-700 font-serif">
                    {data.info}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-black">
                  <Button
                    className="inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-semibold text-black border-2 border-neutral-400 hover:shadow-md focus:outline-none transition-colors"
                    onClick={() => setGuideOpen(false)}
                  >
                    Close
                  </Button>
                </div>
              </DialogPanel>
            </div>
          </div>
        </Dialog>
      </div>

      {data.sliders.map((sliderConfig, configIndex) => (
        <div key={configIndex}>
          {Object.entries(sliderConfig).map(([key, sliderArray]) => (
            <div className='mb-2 bg-black/40 rounded-lg p-3 border border-gray-800' key={key}>
              {key !== 'default' && 
                <p className="font-bold text-white text-xl">{key}</p>
              }
              {sliderArray.map((slider, index) => (
                <TuneSlider
                  key={index}
                  label={slider.label}
                  startLabel={slider.startLabel}
                  endLabel={slider.endLabel}
                  min={slider.min}
                  max={slider.max}
                  step={slider.step}
                  unit={slider.unit}
                  value={sliderData[slider.sliderId]}
                  onChange={(value) => onSliderChange(slider.sliderId, value)}
                />
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};
