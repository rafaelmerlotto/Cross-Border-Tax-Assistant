import { CountryCode, OtherIncomeType } from "./types";

export type ConsultationAnswers = {
    residence_country: CountryCode;
    tax_residence_country: CountryCode | "UNKNOWN";

    employer_country: CountryCode;
    employment_type: "employee";
    employment_start_date: string;

    work_locations: CountryCode[];
    work_days_slovenia: number;
    work_days_italy: number;

    remote_work: "yes" | "no" | "partly";
    remote_work_days: number;

    other_work_countries: CountryCode[];

    multiple_employers: boolean;
    property_abroad: boolean;

    other_income: boolean;
    other_income_types?: OtherIncomeType[];

    foreign_tax_paid: "yes" | "no" | "unknown";

    social_security_country: CountryCode | "UNKNOWN";

    permanent_home_slovenia: boolean;
    permanent_home_italy: boolean;

    days_in_slovenia: number;
    days_in_italy: number;
};