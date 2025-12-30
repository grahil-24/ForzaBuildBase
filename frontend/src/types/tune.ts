interface RecentTunes {
    saved_on: "string",
    tune: {
        creator: {
            username: "string"
        },
        tune_id: number,
        tune_name: "string",
        car: {
            id: number
            image_filename: string
            Manufacturer: string
        }
    }
}

export type {RecentTunes};
