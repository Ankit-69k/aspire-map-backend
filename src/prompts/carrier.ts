import { DocumentInterface } from '@langchain/core/documents';

export const getCarrierPrompt = (
  profileText: string,
  similarProfiles: DocumentInterface<Record<string, any>>[]
) => {
  const prompt = `
        Based on the following user profile:
        ${profileText}

        And similar successful career paths:
        ${similarProfiles.map(doc => doc.pageContent).join('\n\n')}

        Provide 3 specific career recommendations with:
        1. Job title
        2. Why it matches their profile
        3. Required skills to develop
        4. Industry outlook
        5. Expected salary range

        Format as JSON array.
      `;
  return prompt;
};
