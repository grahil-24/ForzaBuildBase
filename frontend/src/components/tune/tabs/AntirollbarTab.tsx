import { useState } from "react";
import { TuneSlider } from "../TuneSlider";


export const AntirollbarTab = () => {
  const [frontArb, setFrontArb] = useState(30);
  const [rearArb, setRearArb] = useState(30);

  return (
    <div className="bg-linear-to-br from-purple-900/40 to-purple-950/60 rounded-lg p-6 backdrop-blur-sm">
      <div className="mb-6">
        <h2 className="text-white font-bold text-xl mb-2 uppercase tracking-wide">
          Antiroll bars
        </h2>
        <p className="text-gray-300 text-sm leading-relaxed">
          Anti-roll bar settings control how your vehicle resists body roll during cornering, directly affecting weight transfer and handling balance. Front and rear bars can be independently adjusted from 1 (softest) to 65 (stiffest).
Front Anti-Roll Bar determines front-end roll resistance—stiffer settings (higher values) reduce body roll and sharpen turn-in response but increase understeer by transferring more weight to the outside tire. Softer settings (lower values) allow more roll but distribute grip more evenly across both front tires, improving mechanical traction while sacrificing immediate steering response.
Rear Anti-Roll Bar controls rear roll resistance—stiffer settings reduce body movement and stabilize the rear but can induce oversteer. Softer settings maintain rear grip and reduce oversteer tendency but allow more weight shift.
Balance between front and rear determines handling character—stiffer front relative to rear creates understeer and stability, while stiffer rear relative to front induces oversteer and rotation.
        </p>
      </div>

      <div className="bg-black/30 rounded-lg p-4">
        <TuneSlider
          label="Front"
          startLabel="soft"
          endLabel="stiff"
          value={frontArb}
          onChange={setFrontArb}
          min={1.00}
          max={65.00}
          step={0.01}
        />
        <TuneSlider
          label="Rear"
          startLabel="soft"
          endLabel="stiff"
          value={rearArb}
          onChange={setRearArb}
          min={1.00}
          max={65.00}
          step={0.01}
        />
      </div>
    </div>
  );
};
