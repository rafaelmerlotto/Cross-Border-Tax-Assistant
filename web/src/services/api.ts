import type { ConsultationAnswers } from "../types/answers";


const url: string = `${import.meta.env.VITE_API_URL}/api/consultation`

export async function createConsultation(data: ConsultationAnswers): Promise<any> {
    const res = await fetch(`${url}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });

    if (!res.ok) {
        let message = "An error occurred while processing the response.";

        try {
            const body = await res.json();
            if (body?.msg) message = body.msg;
            if (body?.error) message = body.error;
        } catch {

        }

        throw new Error(message);
    }

    return await res.json();
}

export async function getConsultation(id: string): Promise<any> {
    const res = await fetch(`${url}/${id}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!res.ok) {
        let message = "An error occurred while processing the response.";

        try {
            const data = await res.json();
            if (data?.msg) message = data.msg;
            if (data?.error) message = data.error;
        } catch {

        }

        throw new Error(message);
    }

    return await res.json();
}

export async function downloadConsultationPdf(id: string): Promise<void> {
    const res = await fetch(`${url}/${id}/pdf`, {
        method: "GET",
        headers: {
            "Accept": "application/pdf",
        },
    });

    //  rate limit 
    if (res.status === 429) {
        let message = "Too many requests. Please try again later.";
        try {
            const data = await res.json();
            if (data?.error) message = data.error;
            if (data?.retryAfter) message += ` (retry in ${data.retryAfter})`;
        } catch {

        }
        throw new Error(message);
    }

    if (!res.ok) {
        throw new Error("An error occurred while processing the response.");
    }

    const blob = await res.blob();

    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `consultation-${id}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);
}