export const getRoadmapPrompt = (
  education: string[] | string,
  skills: string[] | string,
  experience: string[] | string,
  targetCareer: any
) => {
  const prompt = `
    Create a personalized career roadmap for:

    Current Profile:
      - Education: ${Array.isArray(education) ? education.join(', ') : education}
      - Skills: ${Array.isArray(skills) ? skills.join(', ') : skills}
      - Experience: ${Array.isArray(experience) ? experience.join(', ') : experience}

    Target Career: ${JSON.stringify(targetCareer, null, 2)}


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
