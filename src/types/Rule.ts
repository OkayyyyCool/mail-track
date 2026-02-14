export interface Rule {
    id: string;
    description: string;
    tag: string;
    color: string;
    criteria: {
        from?: string;
        to?: string;
        subject?: string;
        includes?: string;
        excludes?: string;
        excludeFrom?: string; // New field
        hasAttachment?: boolean;
    };
    isActive: boolean;
}
