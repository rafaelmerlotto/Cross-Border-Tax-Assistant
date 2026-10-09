import { Requirement } from "./types";
import { foreignIncomeReporting } from "./requirements/foreign-income-reporting";
import { a1CertificateReview } from "./requirements/a1-certificate-review";
import { doubleTaxationReview } from "./requirements/double-taxation-review";
import { employmentDocuments } from "./requirements/employment-documents";
import { foreignTaxDocuments } from "./requirements/foreign-tax-documents";
import { foreignTaxPaidVerification } from "./requirements/foreign-tax-paid-verification";
import { remoteWorkSocialSecurityReview } from "./requirements/remote-work-social-security-review";
import { remoteWorkTaxReview } from "./requirements/remote-work-tax-review";
import { socialSecurityReview } from "./requirements/social-security-review";
import { taxResidenceProfessionalReview } from "./requirements/tax-residence-professional-review";
import { taxResidenceReview } from "./requirements/tax-residence-review";
import { foreignPropertyReview } from "./requirements/foreign-property-review";

export const requirements: Requirement[] = [
    foreignIncomeReporting,
    a1CertificateReview,
    doubleTaxationReview,
    employmentDocuments,
    foreignTaxDocuments,
    foreignTaxPaidVerification,
    remoteWorkSocialSecurityReview,
    remoteWorkTaxReview,
    socialSecurityReview,
    taxResidenceProfessionalReview,
    taxResidenceReview,
    foreignPropertyReview
];