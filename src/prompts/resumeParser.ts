export function getResumeParserPrompt(resumeText: string) {
  return `
    Extract structured information from this resume text and return ONLY a valid JSON object with the following structure:

    {
    "personalInfo": {
        "name": "string",
        "email": "string",
        "phone": "string",
        "location": "string",
        "linkedIn": "string",
        "portfolio": "string"
    },
    "education": [
        {
        "degree": "string",
        "institution": "string",
        "year": "string",
        "gpa": "string"
        }
    ],
    "experience": [
        {
        "title": "string",
        "company": "string",
        "duration": "string",
        "description": "string"
        }
    ],
    "projects": [
        {
        "name": "string",
        "description": "string",
        "technologies": ["string"],
        "link": "string"
        }
    ],
    "skills": {
        "technical": ["string"],
        "programming": ["string"],
        "frameworks": ["string"],
        "databases": ["string"],
        "tools": ["string"],
        "soft": ["string"]
    },
    "certifications": [
        {
        "name": "string",
        "issuer": "string",
        "year": "string"
        }
    ],
    "internships": [
        {
        "title": "string",
        "company": "string",
        "duration": "string",
        "description": "string"
        }
    ],
    "achievements": ["string"],
    "languages": ["string"],
    "interests": ["string"]
    }

    Rules:
    1. Extract information accurately from the resume text
    2. If a field is not found, use empty string "" for strings or empty array [] for arrays
    3. For skills, categorize them appropriately (technical, programming, frameworks, etc.)
    4. Normalize company/institution names (proper capitalization)
    5. Extract years in YYYY format when possible
    6. For experience/internships, extract key responsibilities and achievements
    7. Return ONLY the JSON object, no additional text or formatting

    Resume Text:
    ${resumeText}
    `;
}
