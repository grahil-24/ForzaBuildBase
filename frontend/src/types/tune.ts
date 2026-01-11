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
        resultant_rank: RankType
    }
}

export type {Tune};
