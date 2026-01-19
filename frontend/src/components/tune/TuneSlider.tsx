interface SliderInterface {
  label: string;
  startLabel?: string;
  endLabel?: string;
  value: number;
  onChange: (arg: number) => void;
  min: number;
  max: number;
  step: number;
  unit?: string;
}

const countDecimals = (arg: number) => {
    if(Math.floor(arg.valueOf()) === arg.valueOf()) return 0;
    return arg.toString().split(".")[1].length || 0;
}

export const TuneSlider = ({ 
  label, 
  startLabel, 
  endLabel, 
  value, 
  onChange, 
  min, 
  max, 
  step = 1, 
  unit = '' 
}: SliderInterface) => {
  
  const numOfDecimals = countDecimals(step);
  
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 py-3 border-b border-purple-900/30 last:border-b-0">
      {/* Label */}
      <div className="w-full sm:w-10 md:w-15 text-pink-500 font-bold text-xs md:text-sm uppercase">
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
        <div className="w-20 sm:w-24 md:w-28 text-right flex-shrink-0">
          <span className="text-white font-bold text-sm sm:text-base md:text-lg">
            {value.toFixed(numOfDecimals)}
          </span>
          <span className="text-gray-400 text-[10px] sm:text-xs md:text-sm ml-1 whitespace-nowrap">
            {unit}
          </span>
        </div>
      </div>
    </div>
  );
};