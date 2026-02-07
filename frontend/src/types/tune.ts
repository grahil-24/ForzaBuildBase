import type { RankType } from "./car"

interface Tune {
    saved_on: string,
    tune: {
        creator: {
            username: string
        },
        tune_id: number,
        tune_name: string,
        car: {
            id: number
            image_filename: string
            Manufacturer: string,
            Model?:string
        },
        resultant_rank: RankType,
        public_url: string
    }
}

type Slider = {
  label: string;
  sliderId: string;
  startLabel?: string;
  endLabel?: string;
  defaultValue: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
};

type SliderConfig = {
  [key: string]: Slider[];
};

interface TuneData {
  header: string;
  info: string;
  sliders: SliderConfig[];
}

export type {Tune, Slider, TuneData};
