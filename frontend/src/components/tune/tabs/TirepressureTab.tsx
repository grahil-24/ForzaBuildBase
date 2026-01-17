import { useState } from "react";
import { TuneSlider } from "../TuneSlider";

export const TirePressureTab = () => {
  const [frontPressure, setFrontPressure] = useState(2.4);
  const [rearPressure, setRearPressure] = useState(2.4);

  return (
    <div className="bg-linear-to-br from-purple-900/40 to-purple-950/60 rounded-lg p-6 backdrop-blur-sm">
      <div className="mb-6">
        <h2 className="text-white font-bold text-xl mb-2 uppercase tracking-wide">
          Tyre Pressure
        </h2>
        <p className="text-gray-300 text-sm leading-relaxed">
          You can't transmit your car's power and handling potential to the road without the right tire 
          setup because tire pressure affects a tire's peak grip, responsiveness, and wear. Adjust front 
          tire pressure when the tires are cold so they reach peak grip once they have heated up to race 
          temperatures. Setting tire pressure lower causes the tires to heat faster, but it can reduce 
          overall responsiveness. Setting tire pressure higher can increase speed and responsiveness, but 
          it makes the tires more prone to sudden loss of grip.
        </p>
      </div>

      <div className="bg-black/30 rounded-lg p-4">
        <TuneSlider
          label="Front"
          startLabel="low"
          endLabel="high"
          value={frontPressure}
          onChange={setFrontPressure}
          min={1.0}
          max={3.8}
          step={0.1}
          unit="bar"
        />
        <TuneSlider
          label="Rear"
          startLabel="low"
          endLabel="high"
          value={rearPressure}
          onChange={setRearPressure}
          min={1.0}
          max={3.8}
          step={0.1}
          unit="bar"
        />
      </div>
    </div>
  );
};
