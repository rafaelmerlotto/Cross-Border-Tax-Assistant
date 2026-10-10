import { CaseContext } from "../modules/case-context/types";
import { ConsultationAnswers } from "../modules/case-context/answers";
import { evaluateRules } from "../modules/rules/engine";
import { buildRequirements } from "../modules/requirements/service";
import { buildReport } from "../modules/reports/report-builder";

/**
 * Test factories.
 *
 * The defaults describe a deliberately "busy" case — a Slovenian resident,
 * employed by an Italian company, working in both countries and partly remote —
 * so that most rules trigger by default and individual tests can switch a single
 * condition off via `overrides`.
 */

export function makeAnswers(overrides: Partial<ConsultationAnswers> = {}): ConsultationAnswers {
    return {
        residence_country: "SI",
        tax_residence_country: "SI",
        employer_country: "IT",
        employment_type: "employee",
        employment_start_date: "2024-01-01",
        work_locations: ["SI", "IT"],
        work_days_slovenia: 120,
        work_days_italy: 120,
        remote_work: "partly",
        remote_work_days: 60,
        other_work_countries: [],
        multiple_employers: false,
        property_abroad: false,
        other_income: false,
        foreign_tax_paid: "unknown",
        social_security_country: "SI",
        permanent_home_slovenia: true,
        permanent_home_italy: false,
        days_in_slovenia: 200,
        days_in_italy: 165,
        ...overrides,
    };
}

export function makeCaseContext(overrides: Partial<CaseContext> = {}): CaseContext {
    return {
        taxYear: 2025,
        residenceCountry: "SI",
        taxResidenceCountry: "SI",
        employerCountry: "IT",
        employmentType: "employee",
        employmentStartDate: "2024-01-01",
        workLocations: ["SI", "IT"],
        workDaysSlovenia: 120,
        workDaysItaly: 120,
        remoteWork: "partly",
        remoteWorkDays: 60,
        otherWorkCountries: [],
        multipleEmployers: false,
        propertyAbroad: false,
        otherIncome: false,
        foreignTaxPaid: "unknown",
        socialSecurityCountry: "SI",
        permanentHomeSlovenia: true,
        permanentHomeItaly: false,
        daysInSlovenia: 200,
        daysInItaly: 165,
        ...overrides,
    };
}

/** Runs the full domain pipeline in memory, without touching the database. */
export function runPipeline(caseContext: CaseContext = makeCaseContext()) {
    const ruleResults = evaluateRules(caseContext);
    const requirements = buildRequirements(ruleResults);
    const report = buildReport(caseContext, ruleResults, requirements);

    return { caseContext, ruleResults, requirements, report };
}

/** Extracts the ids of every requirement produced by a pipeline run. */
export function requirementIdsOf(caseContext: CaseContext = makeCaseContext()): string[] {
    return runPipeline(caseContext).requirements.map((requirement) => requirement.id);
}

/** Returns the ids of every rule that triggered for a given case. */
export function triggeredRuleIds(caseContext: CaseContext = makeCaseContext()): string[] {
    return runPipeline(caseContext)
        .ruleResults.filter((result) => result.triggered)
        .map((result) => result.ruleId);
}
