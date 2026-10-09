import { buildCaseContext } from "../case-context/case-builder";
import { CaseContext } from "../case-context/types";
import { buildReport } from "../reports/report-builder";
import { Report, RuleResult } from "../reports/types";
import { buildRequirements } from "../requirements/service";
import { Requirement } from "../requirements/types";
import { evaluateRules } from "../rules/engine";
import { createConsultationRecord } from "./consultation.repository";
import { ConsultationInput, CreateConsultationData } from "./consultation.types";


export async function createConsultation(data: ConsultationInput) {

    const { taxYear, answers } = data;

    const caseContext: CaseContext = buildCaseContext(taxYear, answers);
    const ruleResults: RuleResult[] = evaluateRules(caseContext);
    const requirements: Requirement[] = buildRequirements(ruleResults);
    const report: Report = buildReport(caseContext, ruleResults, requirements);


    const consultation: {} | any = await createConsultationRecord({
        taxYear,
        answers,
        caseContext,
        ruleResults,
        requirements,
        report,
    });

    return consultation;
}