type RankType = "S2" | "S1" | "A" | "B" | "C" | "D"; 

interface Car {
  id: number
  Year: number
  image_filename: string
  Model: string
  Manufacturer: string
  Rank: RankType
}

export type {RankType, Car};