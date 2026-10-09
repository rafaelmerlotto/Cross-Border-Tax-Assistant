import { Requirement } from "../types";

export const foreignPropertyReview: Requirement = {
    id: "foreign-property-review",
    category: "tax_reporting",
    priority: "medium",
    status: "required",
    title: "Review foreign property tax obligations",
    description: "You indicated that you own or have property abroad.",
    action: "Verify whether the foreign property must be declared in Slovenia and whether any related tax obligations apply.",
    documents: [],
    sourceIds: [],
};