

export const answersMock = {
    "remote_work": true,
    "other_income": false,
    "other_employer": false,
    "work_locations": [
        "IT"
    ],
    "employment_type": "EMPLOYEE",
    "property_abroad": false,
    "employer_country": "IT",
    "residence_country": "SI",
    "tax_residence_country": "SI"
}

export const caseContextMock = {
    "taxYear": 2025,
    "remoteWork": true,
    "otherIncome": false,
    "workLocations": [
        "IT"
    ],
    "employmentType": "employee",
    "propertyAbroad": false,
    "employerCountry": "IT",
    "residenceCountry": "SI",
    "taxResidenceCountry": "SI"
}

export const ruleResultsMock = [
    {
        "ruleId": "si-it-foreign-income",
        "triggered": true,
        "requirementIds": [
            "foreign-income-reporting",
            "employment-documents"
        ]
    },
    {
        "ruleId": "si-it-a1-certificate",
        "triggered": false,
        "requirementIds": []
    },
    {
        "ruleId": "si-it-double-taxation",
        "triggered": true,
        "requirementIds": [
            "double-taxation-review",
            "foreign-tax-paid-verification",
            "foreign-tax-documents"
        ]
    },
    {
        "ruleId": "si-it-professional-review",
        "triggered": false,
        "requirementIds": []
    },
    {
        "ruleId": "si-property-abroad",
        "triggered": false,
        "requirementIds": []
    },
    {
        "ruleId": "si-it-remote-work-tax",
        "triggered": false,
        "requirementIds": []
    },
    {
        "ruleId": "si-it-remote-work-social-security",
        "triggered": false,
        "requirementIds": []
    },
    {
        "ruleId": "si-it-social-security",
        "triggered": false,
        "requirementIds": []
    },
    {
        "ruleId": "si-it-tax-residence",
        "triggered": true,
        "requirementIds": [
            "tax-residence-review"
        ]
    }
]

export const requirementsMock = [
    {
        "id": "foreign-income-reporting",
        "title": "Check foreign employment income reporting",
        "action": "Verify how and where this income must be reported to the Slovenian tax authority.",
        "status": "required",
        "category": "tax_reporting",
        "priority": "high",
        "documents": [
            {
                "id": "employment-contract",
                "name": "Employment contract",
                "purpose": "May be needed to verify the employment relationship and employer.",
                "required": true
            }
        ],
        "sourceIds": [
            "source-furs-foreign-income"
        ],
        "description": "Your situation involves employment income from an Italian employer while you live in Slovenia."
    },
    {
        "id": "double-taxation-review",
        "title": "Review double taxation",
        "action": "Verify which country has the right to tax your employment income and how double taxation is avoided.",
        "status": "required",
        "category": "double_taxation",
        "priority": "high",
        "documents": [
            {
                "id": "employment-contract",
                "name": "Employment contract",
                "purpose": "May be needed to determine the employment relationship, employer and applicable tax rules.",
                "required": true
            },
            {
                "id": "foreign-tax-certificate",
                "name": "Foreign tax certificate",
                "purpose": "May be needed to verify taxes paid in Italy and determine whether double taxation relief applies.",
                "required": false
            }
        ],
        "sourceIds": [
            "source-si-it-tax-treaty"
        ],
        "description": "Your employment income may be taxable in both Slovenia and Italy."
    },
    {
        "id": "employment-documents",
        "title": "Provide employment documents",
        "action": "Provide your employment contract and other relevant employment documents for review.",
        "status": "required",
        "category": "documents",
        "priority": "high",
        "documents": [
            {
                "id": "employment-contract",
                "name": "Employment contract",
                "purpose": "Used to verify the employment relationship, employer, employment conditions and working arrangements.",
                "required": true
            },
            {
                "id": "payslips",
                "name": "Payslips",
                "purpose": "May be needed to verify employment income, taxes and social security contributions.",
                "required": false
            },
            {
                "id": "annual-income-statement",
                "name": "Annual income statement",
                "purpose": "May be needed to verify the total employment income and taxes withheld during the tax year.",
                "required": false
            }
        ],
        "sourceIds": [],
        "description": "Your cross-border employment situation requires documentation about your employment relationship."
    },
    {
        "id": "foreign-tax-documents",
        "title": "Provide foreign tax documents",
        "action": "Provide the relevant foreign tax documents to verify income, taxes paid and taxes withheld in Italy.",
        "status": "required",
        "category": "documents",
        "priority": "high",
        "documents": [
            {
                "id": "foreign-tax-certificate",
                "name": "Foreign tax certificate",
                "purpose": "Used to verify income reported and taxes paid or withheld in Italy.",
                "required": true
            },
            {
                "id": "italian-income-statement",
                "name": "Italian income statement",
                "purpose": "May be needed to verify employment income and taxes withheld during the tax year.",
                "required": false
            },
            {
                "id": "italian-payslips",
                "name": "Italian payslips",
                "purpose": "May be needed to verify salary, income tax withholding and social security contributions.",
                "required": false
            }
        ],
        "sourceIds": [],
        "description": "Your cross-border employment situation may require documentation related to taxes paid or withheld in Italy."
    },
    {
        "id": "foreign-tax-paid-verification",
        "title": "Verify foreign taxes paid",
        "action": "Verify the amount of tax paid or withheld in Italy and determine whether it can be considered for double taxation relief in Slovenia.",
        "status": "required",
        "category": "double_taxation",
        "priority": "high",
        "documents": [
            {
                "id": "foreign-tax-certificate",
                "name": "Foreign tax certificate",
                "purpose": "Used to verify the amount of income tax paid or withheld in Italy.",
                "required": true
            },
            {
                "id": "italian-payslips",
                "name": "Italian payslips",
                "purpose": "May be used to verify income tax withheld from employment income.",
                "required": false
            }
        ],
        "sourceIds": [
            "source-si-it-tax-treaty"
        ],
        "description": "You may have paid or had taxes withheld in Italy on your employment income."
    },
    {
        "id": "tax-residence-review",
        "title": "Review your tax residence",
        "action": "Verify your tax residence for the relevant tax year based on your residence, physical presence, permanent home and other relevant circumstances.",
        "status": "required",
        "category": "residence",
        "priority": "high",
        "documents": [
            {
                "id": "residence-documentation",
                "name": "Residence documentation",
                "purpose": "May be needed to establish where you live and maintain your habitual residence.",
                "required": true
            },
            {
                "id": "physical-presence-record",
                "name": "Physical presence records",
                "purpose": "May be needed to establish the number of days spent in Slovenia and Italy during the relevant tax year.",
                "required": false
            },
            {
                "id": "permanent-home-documentation",
                "name": "Permanent home documentation",
                "purpose": "May be needed to determine where you maintain a permanent home.",
                "required": false
            }
        ],
        "sourceIds": [
            "source-si-it-tax-treaty"
        ],
        "description": "Your residence and cross-border employment circumstances may affect your tax residence in Slovenia and Italy."
    }
]


export const reportMock = {
    "sources": [
        {
            "id": "source-furs-foreign-income",
            "url": "https://www.fu.gov.si/",
            "type": "tax_authority",
            "title": "Foreign employment income reporting",
            "country": "SI",
            "authority": "Finančna uprava Republike Slovenije (FURS)",
            "description": "Official Slovenian guidance concerning reporting of foreign employment income.",
            "effectiveFrom": "2026-01-01"
        },
        {
            "id": "source-si-it-tax-treaty",
            "type": "tax_treaty",
            "title": "Convention between Slovenia and Italy for the avoidance of double taxation",
            "country": "SI",
            "authority": "Republic of Slovenia / Italian Republic",
            "description": "Tax treaty between Slovenia and Italy concerning taxes on income.",
            "effectiveFrom": "2004-01-01"
        },
        {
            "id": "source-si-it-tax-treaty",
            "type": "tax_treaty",
            "title": "Convention between Slovenia and Italy for the avoidance of double taxation",
            "country": "SI",
            "authority": "Republic of Slovenia / Italian Republic",
            "description": "Tax treaty between Slovenia and Italy concerning taxes on income.",
            "effectiveFrom": "2004-01-01"
        },
        {
            "id": "source-si-it-tax-treaty",
            "type": "tax_treaty",
            "title": "Convention between Slovenia and Italy for the avoidance of double taxation",
            "country": "SI",
            "authority": "Republic of Slovenia / Italian Republic",
            "description": "Tax treaty between Slovenia and Italy concerning taxes on income.",
            "effectiveFrom": "2004-01-01"
        }
    ],
    "summary": [
        "You are resident in Slovenia.",
        "Your employer is based in Italy."
    ],
    "documents": [
        "Employment contract",
        "Foreign tax certificate",
        "Residence documentation"
    ],
    "requirements": [
        "Check foreign employment income reporting",
        "Review double taxation",
        "Provide employment documents",
        "Provide foreign tax documents",
        "Verify foreign taxes paid",
        "Review your tax residence"
    ],
    "attentionPoints": [],
    "professionalReview": {
        "recommended": false
    }
}