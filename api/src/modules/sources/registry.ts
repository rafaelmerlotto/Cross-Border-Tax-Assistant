import { Source } from "./types";
import { fursForeignIncome } from "./sources/furs-foreign-income";
import { siItTaxTreaty } from "./sources/si-it-tax-treaty";
import { a1Certificate } from "./sources/a1-certificate";
import { euSocialSecurity } from "./sources/eu-social-security";

export const sourceRegistry: Source[] = [
    fursForeignIncome,
    siItTaxTreaty,
    a1Certificate,
    euSocialSecurity
];

export function getSourceById(id: string): Source | undefined {
    return sourceRegistry.find(source => source.id === id);
}