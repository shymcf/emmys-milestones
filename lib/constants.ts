export const CATEGORIES = ["language", "gross_motor", "fine_motor"] as const;
export type Category = (typeof CATEGORIES)[number];

export const STATUSES = ["not_yet", "sometimes", "consistently"] as const;
export type Status = (typeof STATUSES)[number];

export const ENTRY_TYPES = ["word", "gesture"] as const;
export type EntryType = (typeof ENTRY_TYPES)[number];
