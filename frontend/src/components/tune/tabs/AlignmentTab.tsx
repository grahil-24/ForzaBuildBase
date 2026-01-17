import { useState } from "react";
import { TuneSlider } from "../TuneSlider";

export const AlignmentTab = () => {
  const [frontCamber, setFrontCamber] = useState(2.4);
  const [rearCamber, setRearCamber] = useState(-0.9);
  const [frontToe, setFrontToe] = useState(2.4);
  const [rearToe, setRearToe] = useState(-0.9);
  const [frontCaster,setFrontCaster] = useState(1);

  return (
    <div className="bg-linear-to-br from-purple-900/40 to-purple-950/60 rounded-lg p-4 md:p-6 backdrop-blur-sm">
      <div className="mb-4 md:mb-6">
        <h2 className="text-white font-bold text-lg md:text-xl mb-2 uppercase tracking-wide">
          Alignment
        </h2>
        <p className="text-gray-300 text-xs md:text-sm leading-relaxed">
           Alignment settings determine how your tires make contact with the road surface, directly affecting 
          handling characteristics and tire wear patterns. Camber controls the inward or outward tilt of your 
          tires when viewed from the front—negative camber improves cornering grip but reduces straight-line 
          stability, while positive camber does the opposite. Toe adjusts whether your tires point inward or 
          outward when viewed from above—toe-in increases stability but reduces turn-in response, while toe-out 
          improves initial turn response but can make the car feel nervous. Caster angle affects steering feel 
          and self-centering—higher caster increases high-speed stability and steering weight, while lower caster 
          makes the steering lighter and more responsive at low speeds.
        </p>
      </div>

      {/* Camber Section */}
      <div className="bg-black/30 rounded-lg p-3 md:p-4 mb-4">
        <p className="text-base md:text-xl text-white mb-2 md:mb-3 font-semibold">Camber</p>
        <TuneSlider
          label="Front"
          startLabel="neg"
          endLabel="high"
          value={frontCamber}
          onChange={setFrontCamber}
          min={-5}
          max={5}
          step={0.1}
          unit="degree"
        />
        <TuneSlider
          label="Rear"
          startLabel="neg"
          endLabel="pos"
          value={rearCamber}
          onChange={setRearCamber}
          min={-5}
          max={5}
          step={0.1}
          unit="degree"
        />
      </div>

      {/* Toe Section */}
      <div className="bg-black/30 rounded-lg p-3 md:p-4 mb-4">
        <p className="text-base md:text-xl text-white mb-2 md:mb-3 font-semibold">Toe</p>
        <TuneSlider
          label="Front"
          startLabel="in"
          endLabel="out"
          value={frontToe}
          onChange={setFrontToe}
          min={-5}
          max={5}
          step={0.1}
          unit="degree"
        />
        <TuneSlider
          label="Rear"
          startLabel="in"
          endLabel="out"
          value={rearToe}
          onChange={setRearToe}
          min={-5}
          max={5}
          step={0.1}
          unit="degree"
        />
      </div>
      <div className="bg-black/30 rounded-lg p-3 md:p-4">
        <p className="text-base md:text-xl text-white mb-2 md:mb-3 font-semibold">Front Caster</p>
        <TuneSlider
          label="Caster"
          startLabel="low"
          endLabel="high"
          value={frontCaster}
          onChange={setFrontCaster}
          min={1}
          max={7}
          step={0.1}
          unit="degree"
        />
      </div>
    </div>
  );
};