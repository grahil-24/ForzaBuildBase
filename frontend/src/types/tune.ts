interface RecentTunes {
    saved_on: "string",
    tune: {
        creator: {
            username: "string"
        },
        tune_id: number,
        tune_name: "string"
    }
}

export type {RecentTunes};
