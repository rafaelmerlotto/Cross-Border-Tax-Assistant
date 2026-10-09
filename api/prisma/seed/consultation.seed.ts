import { prisma } from '../../lib/prisma'

export async function seedConsultations() {
    await prisma.consultation.create({
        data: {
            status: "COMPLETED",

            taxYear: 2026,

            answers: {
                residence_country: "SI",
                tax_residence_country: "SI",

                employer_country: "IT",
                employment_type: "EMPLOYEE",

                work_locations: ["SI", "IT"],

                remote_work: true,

                other_income: false,
                other_employer: false,

                property_abroad: false
            },

            caseContext: {
                residenceCountry: "SI",
                taxResidenceCountry: "SI",

                employerCountry: "IT",
                employmentType: "employee",

                workLocations: ["SI", "IT"],

                remoteWork: true,

                hasOtherIncome: false,
                hasOtherEmployer: false,
                ownsPropertyAbroad: false
            },

            ruleResults: [
                {
                    ruleId: "tax-residence",
                    triggered: true,
                    requirementIds: [
                        "tax-residence-review"
                    ]
                },
                {
                    ruleId: "foreign-employment-income",
                    triggered: true,
                    requirementIds: [
                        "foreign-income-reporting"
                    ]
                },
                {
                    ruleId: "double-taxation",
                    triggered: true,
                    requirementIds: [
                        "double-taxation-review"
                    ]
                },
                {
                    ruleId: "social-security",
                    triggered: true,
                    requirementIds: [
                        "social-security-review"
                    ]
                },
                {
                    ruleId: "remote-work",
                    triggered: true,
                    requirementIds: [
                        "remote-work-review"
                    ]
                }
            ],

            requirements: [
                {
                    id: "tax-residence-review",
                    title: "Review your tax residence",
                    priority: "HIGH",
                    status: "REQUIRED"
                },
                {
                    id: "foreign-income-reporting",
                    title: "Check foreign employment income reporting",
                    priority: "HIGH",
                    status: "REQUIRED"
                },
                {
                    id: "double-taxation-review",
                    title: "Review double taxation",
                    priority: "HIGH",
                    status: "RECOMMENDED"
                },
                {
                    id: "social-security-review",
                    title: "Verify social security coverage",
                    priority: "MEDIUM",
                    status: "RECOMMENDED"
                },
                {
                    id: "remote-work-review",
                    title: "Review remote work implications",
                    priority: "MEDIUM",
                    status: "RECOMMENDED"
                }
            ],

            report: {
                summary: [
                    "You are resident in Slovenia.",
                    "Your employer is based in Italy.",
                    "You physically work in both Slovenia and Italy.",
                    "You perform remote work from Slovenia."
                ],

                requirements: [
                    "Review your tax residence",
                    "Check foreign employment income reporting",
                    "Review double taxation",
                    "Verify social security coverage",
                    "Review remote work implications"
                ],

                documents: [
                    "Employment contract",
                    "Payslips",
                    "Annual income statement",
                    "Foreign tax certificate"
                ],

                attentionPoints: [
                    "Cross-border employment",
                    "Physical work in multiple countries",
                    "Remote work from Slovenia"
                ],

                professionalReview: {
                    recommended: true,
                    reason:
                        "The case involves employment and physical work in multiple countries."
                },

                sources: [
                    "furs-foreign-income",
                    "si-it-tax-treaty"
                ]
            },

            completedAt: new Date(),
            expiresAt: new Date(
                Date.now() + 1000 * 60 * 60 * 24 * 30
            )
        }
    });

    console.log("Seed completed.");
}

// seedConsultations()
//     .catch((error) => {
//         console.error(error);
//         process.exit(1);
//     })
//     .finally(async () => {
//         await prisma.$disconnect();
//     });