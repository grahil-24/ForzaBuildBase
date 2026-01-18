import { useState } from "react";
import { TuneSlider } from "../TuneSlider";


export const GearingTab = () => {
  const [finalDrive, setFinalDrive] = useState(3.00);

  return (
    <div className="bg-linear-to-br from-purple-900/40 to-purple-950/60 rounded-lg p-6 backdrop-blur-sm">
      <div className="mb-6">
        <h2 className="text-white font-bold text-xl mb-2 uppercase tracking-wide">
          Gearing
        </h2>
        <p className="text-gray-300 text-sm leading-relaxed">
          Final drive ratio determines how engine power is delivered to the wheels, affecting acceleration versus top speed across all gears. This setting multiplies the effect of your transmission ratios, fundamentally changing your vehicle's performance characteristics.

Higher Final Drive Ratios (numerically higher, such as 4.10 or 4.50) provide shorter gearing that delivers quicker acceleration at the cost of lower top speed. Each gear feels more responsive and pulls harder from lower RPMs, making the car feel more eager and athletic in everyday driving. However, your engine reaches redline sooner in each gear, requiring more frequent shifting, and your maximum speed in top gear decreases.

Lower Final Drive Ratios (numerically lower, such as 3.23 or 2.90) provide taller gearing that sacrifices acceleration for higher top speed potential. Each gear feels longer and less aggressive, requiring more throttle input to achieve the same acceleration. The engine runs at lower RPMs at any given speed, improving fuel efficiency and reducing mechanical stress, while your maximum achievable speed increases significantly.

        </p>
      </div>

      <div className="bg-black/30 rounded-lg p-4">
        <TuneSlider
          label="Final Drive"
          startLabel=""
          endLabel=""
          value={finalDrive}
          onChange={setFinalDrive}
          min={2.20}
          max={6.10}
          step={0.01}
        />
      </div>
    </div>
  );
};
