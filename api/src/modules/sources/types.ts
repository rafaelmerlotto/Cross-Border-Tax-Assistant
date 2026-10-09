export type SourceType =
    | "tax_authority"
    | "tax_treaty"
    | "eu_regulation"
    | "legislation"
    | "official_guidance";

export type Source = {
    id: string;
    country: "SI" | "IT" | "EU";
    type: SourceType;

    title: string;
    description?: string;

    authority: string;

    url?: string;

    effectiveFrom?: string;
    effectiveTo?: string;
};