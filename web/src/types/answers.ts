export type CountryCode = "SI" | "IT" | "AT" | "HR" | "OTHER";

export type ConsultationAnswers = {
    taxYear: number;
    answers: {
        residence_country: CountryCode;
        tax_residence_country: CountryCode;
        employer_country: CountryCode;
        employment_type: "EMPLOYEE";
        work_locations: CountryCode[];
        remote_work: boolean;
        other_income: boolean;
        other_employer: boolean;
        property_abroad: boolean;
    };
};

export type OtherIncomeType =
    | "self_employment"
    | "rental"
    | "investment"
    | "other";

