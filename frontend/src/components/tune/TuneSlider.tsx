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
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 py-3 border-b border-gray-800/50 last:border-b-0">
      {/* Label */}
      <div className="w-full sm:w-32 md:w-36 lg:w-40 text-gray-100 font-bold text-[11px] md:text-sm uppercase wrap-break-word">
        {label}
      </div>
      
      {/* Slider Container */}
      <div className="flex-1 flex items-center gap-1.5 sm:gap-3">
        <span className="text-[9px] sm:text-xs text-gray-400 uppercase w-7 sm:w-10 shrink-0 text-left">
          {startLabel}
        </span>
        
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="flex-1 h-2 bg-gray-600 rounded-lg appearance-none slider min-w-20"
          style={{
            background: `linear-gradient(to right, #e5e7eb 0%, #e5e7eb ${((value - min) / (max - min)) * 100}%, #4b5563 ${((value - min) / (max - min)) * 100}%, #4b5563 100%)`
          }}
        />
        
        <span className="text-[9px] sm:text-xs text-gray-400 uppercase w-7 sm:w-10 shrink-0 text-right">
          {endLabel}
        </span>
        
        {/* Value Display */}
        <div className="w-fit sm:w-24 md:w-28 text-right shrink-0 flex items-baseline justify-end gap-1">
          <span className="text-white font-bold text-xs sm:text-sm md:text-base">
            {value.toFixed(numOfDecimals)}
          </span>
          <span className="text-gray-400 text-[9px] sm:text-[10px] md:text-sm whitespace-nowrap overflow-hidden text-ellipsis">
            {unit}
          </span>
        </div>
      </div>
    </div>
  );
};