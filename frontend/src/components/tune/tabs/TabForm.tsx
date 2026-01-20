import { TuneSlider } from "../TuneSlider";
import type {TuneData } from "../../../types/tune";


export const TabForm = ({ data, onSliderChange, sliderData }: { data: TuneData, onSliderChange: (sliderId: string, value: number) => void,  sliderData: Record<string, number> }) => {
  return (
    <div className="bg-linear-to-br from-purple-900/40 to-purple-950/60 rounded-lg p-6 backdrop-blur-sm">
      <div className="mb-6">
        <h2 className="text-white font-bold text-xl mb-2 uppercase tracking-wide">
          {data.header}
        </h2>
        <p className="text-gray-300 text-sm leading-relaxed">
          {data.info}
        </p>
      </div>
        {data.sliders.map((sliderConfig, configIndex) => (
          <div key={configIndex}>
            {Object.entries(sliderConfig).map(([key, sliderArray]) => (
              <div className='mb-2 bg-black/30 rounded-lg p-3' key={key}>
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