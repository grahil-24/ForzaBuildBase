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
}

export type {RankType, Car, DrivetrainType};