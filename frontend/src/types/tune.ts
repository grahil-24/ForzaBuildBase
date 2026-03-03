import type { RankType } from "./car"

interface Tune {
  saved_on: string,
  tune: {
    creator: {
      username: string,
      profile_pic?: string,
    },
    tune_id: number,
    tune_name: string,
    car: {
      id: number
      image_filename: string
      Manufacturer: string,
      Model?: string
    },
    resultant_rank: RankType,
    public_url: string,
  },
  isSaved: boolean
}

interface Car {
  Manufacturer: string;
  Model: string;
  Year: number;
  image_filename: string;
}

interface TuneDetailsData {
  // Tires
  front_tire_pressure: number;
  rear_tire_pressure: number;
  
  // Anti-Roll Bars
  front_arb: number;
  rear_arb: number;
  
  // Aero
  front_aero: number;
  rear_aero: number;
  
  // Springs
  front_spring: number;
  rear_spring: number;
  
  // Ride Height
  front_ride_height: number;
  rear_ride_height: number;
  
  // Brakes
  brake_balance: number;
  brake_pressure: number;
  
  // Damping
  front_rebound: number;
  rear_rebound: number;
  front_bump: number;
  rear_bump: number;
  
  // Differential
  front_diff_accel: number;
  front_diff_decel: number;
  rear_diff_accel: number;
  rear_diff_decel: number;
  center_diff_balance: number;
  
  // Alignment
  front_camber: number;
  rear_camber: number;
  front_toe: number;
  rear_toe: number;
  front_caster: number;
  
  // Gearing
  final_drive: number;
}

// This is the COMPLETE tune details object from the API
interface TuneDetails {
  tune_id: number;
  tune_name: string;
  class: RankType;
  creator: string;
  profile_pic: string;
  created_on: string;
  isSaved: boolean;
  public_url: string;
  car: Car;
  tune_details: TuneDetailsData;
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

export type { Tune, Slider, TuneData, TuneDetails, TuneDetailsData, Car };