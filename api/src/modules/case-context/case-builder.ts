import { CaseContext } from "./types";
import { ConsultationAnswers } from "./answers";

export function buildCaseContext(taxYear: number, answers: ConsultationAnswers): CaseContext {

    return {
        taxYear,

        residenceCountry: answers.residence_country,
        taxResidenceCountry: answers.tax_residence_country,

        employerCountry: answers.employer_country,
        employmentType: "employee",
        employmentStartDate: answers.employment_start_date,

        workLocations: answers.work_locations,
        workDaysSlovenia: answers.work_days_slovenia,
        workDaysItaly: answers.work_days_italy,

        remoteWork: answers.remote_work,
        remoteWorkDays: answers.remote_work_days,
        propertyAbroad: answers.property_abroad,

        otherWorkCountries: answers.other_work_countries,

        multipleEmployers: answers.multiple_employers,

        otherIncome: answers.other_income,
        otherIncomeTypes: answers.other_income_types,

        foreignTaxPaid: answers.foreign_tax_paid,

        socialSecurityCountry: answers.social_security_country,

        permanentHomeSlovenia: answers.permanent_home_slovenia,
        permanentHomeItaly: answers.permanent_home_italy,

        daysInSlovenia: answers.days_in_slovenia,
        daysInItaly: answers.days_in_italy,
    };
}