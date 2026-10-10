import { describe, expect, it } from "vitest";
import { buildCaseContext } from "./case-builder";
import { ConsultationAnswers } from "./answers";
import { makeAnswers } from "../../test/factories";

describe("buildCaseContext", () => {
    it("passes the tax year through to the case context", () => {
        expect(buildCaseContext(2025, makeAnswers()).taxYear).toBe(2025);
        expect(buildCaseContext(2024, makeAnswers()).taxYear).toBe(2024);
    });

    it("maps every answer field to its camelCase counterpart", () => {
        const answers = makeAnswers({
            residence_country: "SI",
            tax_residence_country: "IT",
            employer_country: "AT",
            work_locations: ["SI", "IT", "AT"],
            work_days_slovenia: 100,
            work_days_italy: 40,
            remote_work: "yes",
            remote_work_days: 80,
            other_work_countries: ["HR"],
            multiple_employers: true,
            property_abroad: true,
            other_income: true,
            foreign_tax_paid: "yes",
            social_security_country: "IT",
            permanent_home_slovenia: false,
            permanent_home_italy: true,
            days_in_slovenia: 150,
            days_in_italy: 215,
            employment_start_date: "2023-06-15",
        });

        const context = buildCaseContext(2025, answers);

        expect(context).toMatchObject({
            taxYear: 2025,
            residenceCountry: "SI",
            taxResidenceCountry: "IT",
            employerCountry: "AT",
            workLocations: ["SI", "IT", "AT"],
            workDaysSlovenia: 100,
            workDaysItaly: 40,
            remoteWork: "yes",
            remoteWorkDays: 80,
            otherWorkCountries: ["HR"],
            multipleEmployers: true,
            propertyAbroad: true,
            otherIncome: true,
            foreignTaxPaid: "yes",
            socialSecurityCountry: "IT",
            permanentHomeSlovenia: false,
            permanentHomeItaly: true,
            daysInSlovenia: 150,
            daysInItaly: 215,
            employmentStartDate: "2023-06-15",
        });
    });

    it("always reports the employment type as the domain literal 'employee'", () => {
        // The wire contract uses the uppercase "EMPLOYEE"; the domain uses lowercase.
        const uppercaseAnswers = makeAnswers({ employment_type: "EMPLOYEE" as never });
        expect(buildCaseContext(2025, uppercaseAnswers).employmentType).toBe("employee");

        const bogusAnswers = makeAnswers({ employment_type: "self_employed" as never });
        expect(buildCaseContext(2025, bogusAnswers).employmentType).toBe("employee");
    });

    it("does not invent values for fields the answers omit", () => {
        // Over HTTP, Zod strips every key the schema does not declare, so the
        // builder receives `undefined` for them. This documents that behaviour
        // rather than hiding it: the keys are copied through as-is.
        const sparse = {
            residence_country: "SI",
            tax_residence_country: "SI",
            employer_country: "IT",
            employment_type: "employee",
            work_locations: ["IT"],
            remote_work: "yes",
            other_income: false,
            property_abroad: false,
        } as unknown as ConsultationAnswers;

        const context = buildCaseContext(2025, sparse);

        expect(context.remoteWorkDays).toBeUndefined();
        expect(context.workDaysSlovenia).toBeUndefined();
        expect(context.multipleEmployers).toBeUndefined();
    });

    it("preserves the work locations array order and contents", () => {
        const context = buildCaseContext(2025, makeAnswers({ work_locations: ["IT", "SI"] }));
        expect(context.workLocations).toEqual(["IT", "SI"]);
    });

    it("is a pure function of its arguments", () => {
        const answers = makeAnswers();
        expect(buildCaseContext(2025, answers)).toEqual(buildCaseContext(2025, answers));
    });
});
