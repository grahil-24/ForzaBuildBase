type RankType = "S2" | "S1" | "A" | "B" | "C" | "D"; 
type DrivetrainType = "AWD" | "RWD" | "FWD";

interface Car {
  id: number
  Year: number
  image_filename: string
  Model: string
  Manufacturer: string
  Rank: RankType
  Drivetrain: DrivetrainType
  Torque?:number
  Weight?:number
  Vehicle?:string
  Horsepower?:number
  EngineType?:string
  Displacement?:string
  FuelType?:string
  FrontPercent?:string
  Speed?:string
  Acceleration?:string
  Handling?:string
  Launch?:string
  Braking?:string
  Offroad?:string
  Aspiration?:string
}


export type {RankType, Car, DrivetrainType};