export const getRoadmapPrompt = (
  education: string[],
  skills: string[],
  experience: string[],
  targetCareer: string
) => {
  const prompt = `
    Create a personalized career roadmap for:

    Current Profile:
    - Education: ${education}
    - Skills: ${skills}
    - Experience: ${experience}

    Target Career: ${targetCareer}

    Instructions:
    1. Do NOT use monthly timelines — instead, break down into ordered steps toward employability.
    2. Use JSON format with the following structure:
       {
         "career": {
           "title": string,
           "description": string,
           "industry": string,
           "emerging": boolean
         },
         "roadmap": {
           "timeline": "flexible", 
           "status": "draft",
           "steps": [
             {
               "order": number,
               "type": "course | project | certification | internship | interview_prep | networking",
               "title": string,
               "provider": string | null,
               "url": string | null,
               "skill": {
                 "name": string,
                 "done": boolean  // true if skill already exists in {skills}, else false
               },
               "completed": false
             }
           ]
         }
       }

    3. For each step, recommend:
       - Skills to learn (mark as done if already present in {skills})
       - Projects to build
       - Certifications to pursue
       - Networking activities
       - Interview prep
    4. Ensure the roadmap leads to landing a job in {targetCareer}.
  `;

  return prompt;
};
