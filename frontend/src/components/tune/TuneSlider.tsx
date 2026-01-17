interface SliderInterface {
  label: string;
  startLabel: string;
  endLabel: string;
  value: number;
  onChange: (arg: number) => void;
  min: number;
  max: number;
  step: number;
  unit: string;
}

export const TuneSlider = ({ 
  label, 
  startLabel, 
  endLabel, 
  value, 
  onChange, 
  min, 
  max, 
  step = 0.1, 
  unit = '' 
}: SliderInterface) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 py-3 border-b border-purple-900/30 last:border-b-0">
      {/* Label */}
      <div className="w-full sm:w-16 md:w-24 text-pink-500 font-bold text-xs md:text-sm uppercase">
        {label}
      </div>
      
      {/* Slider Container */}
      <div className="flex-1 flex items-center gap-2 sm:gap-3 md:gap-4">
        <span className="text-[10px] sm:text-xs text-gray-400 uppercase w-8 sm:w-auto">
          {startLabel}
        </span>
        
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="flex-1 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
          style={{
            background: `linear-gradient(to right, #ec4899 0%, #ec4899 ${((value - min) / (max - min)) * 100}%, #4b5563 ${((value - min) / (max - min)) * 100}%, #4b5563 100%)`
          }}
        />
        
        <span className="text-[10px] sm:text-xs text-gray-400 uppercase w-8 sm:w-auto">
          {endLabel}
        </span>
        
        {/* Value Display */}
        <div className="w-16 sm:w-20 text-right">
          <span className="text-white font-bold text-sm sm:text-base md:text-lg">
            {value.toFixed(1)}
          </span>
          <span className="text-gray-400 text-[10px] sm:text-xs md:text-sm ml-1">
            {unit}
          </span>
        </div>
      </div>
    </div>
  );
};