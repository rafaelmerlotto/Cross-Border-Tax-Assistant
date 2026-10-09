export type CountryCode =
    | "SI"
    | "IT"
    | "AT"
    | "HR"
    | "OTHER";

export type OtherIncomeType =
    | "self_employment"
    | "rental"
    | "investment"
    | "other";


export type CaseContext = {
    // Tax period
    taxYear: number;

    // Residence
    residenceCountry: CountryCode;
    taxResidenceCountry: CountryCode | "UNKNOWN";

    // Employment
    employerCountry: CountryCode;
    employmentType: "employee";
    employmentStartDate: string;

    // Physical work
    workLocations: CountryCode[];
    workDaysSlovenia: number;
    workDaysItaly: number;

    // Remote work
    remoteWork: "yes" | "no" | "partly";
    remoteWorkDays: number;

    // Other work countries
    otherWorkCountries: CountryCode[];

    // Employment structure
    multipleEmployers: boolean;
    propertyAbroad: boolean;

    // Other income
    otherIncome: boolean;
    otherIncomeTypes?: OtherIncomeType[];

    // Tax
    foreignTaxPaid: "yes" | "no" | "unknown";

    // Social security
    socialSecurityCountry: CountryCode | "UNKNOWN";

    // Residence factors
    permanentHomeSlovenia: boolean;
    permanentHomeItaly: boolean;

    // Physical presence
    daysInSlovenia: number;
    daysInItaly: number;
}