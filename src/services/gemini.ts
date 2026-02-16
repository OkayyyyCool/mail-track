const STORAGE_KEY = 'geminiApiKey';

export interface MailAnalysisResult {
    collegeName: string | null;
    eventType: string | null;
    eventDate: string | null;
    importantLinks: { label: string; url: string }[];
    summary: string;
    otherInfo: string[];
}

export const getGeminiApiKey = (): string | null => {
    return localStorage.getItem(STORAGE_KEY);
};

export const setGeminiApiKey = (key: string): void => {
    localStorage.setItem(STORAGE_KEY, key);
};

export const removeGeminiApiKey = (): void => {
    localStorage.removeItem(STORAGE_KEY);
};

export const analyzeEmail = async (
    subject: string,
    sender: string,
    body: string
): Promise<MailAnalysisResult> => {
    const apiKey = getGeminiApiKey();
    if (!apiKey) {
        throw new Error('NO_API_KEY');
    }

    // Strip HTML tags for a cleaner prompt, keep first ~4000 chars
    const textBody = body
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 4000);

    const prompt = `You are an AI assistant analyzing an email related to MBA college admissions in India. Extract the following structured information from this email.

Subject: ${subject}
From: ${sender}
Body: ${textBody}

Return ONLY a valid JSON object with these fields (no markdown, no code fences, just raw JSON):
{
  "collegeName": "Name of the college/institute (e.g. IIM Ahmedabad, XLRI Jamshedpur) or null if unclear",
  "eventType": "Type of event mentioned (e.g. Interview, Test, Call Letter, Admit Card, Group Discussion, Result, Shortlist, Registration) or null",
  "eventDate": "Date and time of the event in a human-readable format (e.g. '15 March 2026, 10:00 AM IST') or null if not found",
  "importantLinks": [{"label": "short description", "url": "the actual URL"}],
  "summary": "A concise 2-3 sentence summary of what this email is about and any action items",
  "otherInfo": ["Any other useful details like venue, documents to carry, dress code, registration deadlines, etc."]
}`;

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.2,
                    maxOutputTokens: 1024,
                },
            }),
        }
    );

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 400 || response.status === 403) {
            throw new Error('INVALID_API_KEY');
        }
        throw new Error(errorData?.error?.message || `API Error: ${response.status}`);
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
        throw new Error('No response from Gemini');
    }

    // Try multiple strategies to extract JSON from the response
    const extractJSON = (raw: string): MailAnalysisResult | null => {
        // Strategy 1: Direct parse
        try { return JSON.parse(raw.trim()); } catch { }

        // Strategy 2: Strip markdown code fences
        const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (fenceMatch) {
            try { return JSON.parse(fenceMatch[1].trim()); } catch { }
        }

        // Strategy 3: Find the first { ... last } in the text
        const firstBrace = raw.indexOf('{');
        const lastBrace = raw.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace > firstBrace) {
            try { return JSON.parse(raw.slice(firstBrace, lastBrace + 1)); } catch { }
        }

        return null;
    };

    const parsed = extractJSON(text);

    if (parsed) {
        return {
            collegeName: parsed.collegeName || null,
            eventType: parsed.eventType || null,
            eventDate: parsed.eventDate || null,
            importantLinks: Array.isArray(parsed.importantLinks) ? parsed.importantLinks : [],
            summary: parsed.summary || 'No summary available.',
            otherInfo: Array.isArray(parsed.otherInfo) ? parsed.otherInfo : [],
        };
    }

    // Fallback: return raw text as summary
    return {
        collegeName: null,
        eventType: null,
        eventDate: null,
        importantLinks: [],
        summary: text.slice(0, 500),
        otherInfo: [],
    };
};
