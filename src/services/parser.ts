// import { differenceInDays, parse } from 'date-fns';

export interface ParsedEmail {
    id: string;
    subject: string;
    snippet: string;
    date: string; // original email date
    eventDate?: Date;
    type: 'interview' | 'test' | 'call_letter' | 'shortlist' | 'other';
    institution: string;
    sender: string;
    body?: string;
}

const KEYWORDS = {
    interview: ['interview', 'pi', 'personal interview', 'gd', 'group discussion'],
    test: ['test', 'exam', 'assessment', 'aptitude'],
    call_letter: ['call letter', 'admit card'],
    shortlist: ['shortlist', 'selected']
};

// Heuristic to extract institution name (simple version)
const extractInstitution = (from: string, subject: string): string => {
    // Try to get from "From" header (e.g., "IIM Bangalore <admissions@iimb.ac.in>")
    const fromMatch = from.match(/"?([^"<]+)"?\s*<.*>/);
    if (fromMatch && fromMatch[1]) return fromMatch[1].trim();

    // Fallback to subject parts
    return subject.split(':')[0].trim(); // "IIMA: Interview..." -> IIMA
};

// Heuristic to extract dates
const extractDate = (text: string): Date | undefined => {
    // 1. DD Mon YYYY (e.g., 12th Feb 2024, 15 March 2024)
    const ddmmyyyy = /\b(\d{1,2}(?:st|nd|rd|th)?\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4})\b/i;

    // 2. Mon DD YYYY (e.g., Feb 12th 2024, March 15, 2024)
    const mmddyyyy = /\b((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2}(?:st|nd|rd|th|,)?.?\s+\d{4})\b/i;

    let match = text.match(ddmmyyyy);
    if (match) {
        try {
            const cleanDate = match[1].replace(/(\d+)(st|nd|rd|th)/, '$1');
            return new Date(cleanDate);
        } catch (e) { }
    }

    match = text.match(mmddyyyy);
    if (match) {
        try {
            // Remove ordinal suffixes and commas
            let cleanDate = match[1].replace(/(\d+)(st|nd|rd|th)/, '$1').replace(/,/g, '');
            return new Date(cleanDate);
        } catch (e) { }
    }

    return undefined;
};

// Helper to decode Base64Url
const decodeBase64 = (data: string) => {
    try {
        const binaryString = atob(data.replace(/-/g, '+').replace(/_/g, '/'));
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return new TextDecoder('utf-8').decode(bytes);
    } catch (e) {
        console.error("Failed to decode base64", e);
        return "";
    }
};

// Helper to extract body from parts
const getBody = (payload: any): string => {
    let body = '';

    // 1. Check if body is directly in payload (non-multipart)
    if (payload.body && payload.body.data) {
        return decodeBase64(payload.body.data);
    }

    // 2. Traverse parts for text/html
    if (payload.parts) {
        const htmlPart = payload.parts.find((p: any) => p.mimeType === 'text/html');
        if (htmlPart && htmlPart.body && htmlPart.body.data) {
            return decodeBase64(htmlPart.body.data);
        }

        const textPart = payload.parts.find((p: any) => p.mimeType === 'text/plain');
        if (textPart && textPart.body && textPart.body.data) {
            return decodeBase64(textPart.body.data);
        }

        // Recursive check for nested multipart
        for (const part of payload.parts) {
            if (part.parts) {
                const nestedBody = getBody(part);
                if (nestedBody) return nestedBody;
            }
        }
    }

    return body;
};

export const parseEmail = (email: any): ParsedEmail => {
    const subject = email.payload.headers.find((h: any) => h.name === 'Subject')?.value || '';
    const from = email.payload.headers.find((h: any) => h.name === 'From')?.value || '';
    const snippet = email.snippet;
    const body = getBody(email.payload) || snippet; // Fallback to snippet
    const date = email.internalDate ? new Date(parseInt(email.internalDate)).toISOString() : new Date().toISOString();

    let type: ParsedEmail['type'] = 'other';
    const combinedText = (subject + ' ' + snippet).toLowerCase();

    if (KEYWORDS.interview.some(k => combinedText.includes(k))) type = 'interview';
    else if (KEYWORDS.test.some(k => combinedText.includes(k))) type = 'test';
    else if (KEYWORDS.call_letter.some(k => combinedText.includes(k))) type = 'call_letter';
    else if (KEYWORDS.shortlist.some(k => combinedText.includes(k))) type = 'shortlist';

    const eventDate = extractDate(combinedText);

    return {
        id: email.id,
        subject,
        sender: from, // Add sender field
        snippet,
        body,
        date,
        eventDate,
        type,
        institution: extractInstitution(from, subject)
    };
};
