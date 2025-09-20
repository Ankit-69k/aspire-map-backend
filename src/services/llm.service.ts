import llm from '../config/llm.js';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { DocxLoader } from '@langchain/community/document_loaders/fs/docx';
import { getResumeParserPrompt } from '../prompts/resumeParser.js';
import logger from '../config/logger.js';
import { vectorStore } from '../config/vectorDb.js';
import { getCarrierPrompt } from '../prompts/career.js';
import prisma from '../config/db.js';
import { getRoadmapPrompt } from '../prompts/roadmap.js';

class LLMService {
  private llm: typeof llm;
  constructor() {
    this.llm = llm;
  }

  async generateCareerRecommendations(profileId: string) {
    try {
      // 1. Fetch profile from DB
      const profile = await prisma.profile.findUnique({
        where: { id: profileId },
      });

      if (!profile) {
        throw new Error(`Profile with id ${profileId} not found`);
      }

      // 2. Convert structured profile to text
      const profileText = `
      Education: ${profile.education}
      Certifications: ${profile.certifications?.join(', ')}
      Projects: ${profile.projects?.join(', ')}
      Experience: ${profile.experience?.join(', ')}
      Hobbies: ${profile.hobbies?.join(', ')}
      Resume: ${profile.resumeUrl}
      LinkedIn: ${profile.linkedInUrl}
    `;

      // 3. Similarity search
      const similarProfiles = await vectorStore.similaritySearch(
        profileText,
        5
      );

      // 4. Build LLM prompt
      const prompt = getCarrierPrompt(profileText, similarProfiles);

      // 5. Call LLM
      const response = await llm.invoke(prompt);
      let rawOutput = response.content as string;

      // 6. Clean JSON wrappers
      rawOutput = rawOutput
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();

      // 7. Parse JSON safely
      try {
        const structuredData = JSON.parse(rawOutput);
        return structuredData;
      } catch (err) {
        logger.error('Failed to parse LLM output:', rawOutput);
        throw new Error('Invalid JSON returned from LLM');
      }
    } catch (error) {
      logger.error('Error generating career recommendations:', error);
      throw new Error('Failed to generate career recommendations');
    }
  }

  async generateCareerRoadmap(
    education: string[],
    skills: string[],
    experience: string[],
    targetCareer: string
  ) {
    // 1. Build LLM prompt
    const prompt = getRoadmapPrompt(
      education,
      skills,
      experience,
      targetCareer
    );

    // 2. Call LLM
    const response = await llm.invoke(prompt);
    let rawOutput = response.content as string;

    // 3. Clean JSON wrappers
    rawOutput = rawOutput
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    // 4. Parse JSON safely
    try {
      const structuredData = JSON.parse(rawOutput);
      return structuredData;
    } catch (err) {
      logger.error('Failed to parse LLM output:', rawOutput);
      throw new Error('Invalid JSON returned from LLM');
    }
  }

  async parseResume(filePath: string, mimetype: string) {
    let loader;

    if (mimetype === 'application/pdf') {
      loader = new PDFLoader(filePath);
    } else if (
      mimetype ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      loader = new DocxLoader(filePath);
    } else {
      throw new Error('Only PDF and DOCX formats are supported');
    }

    // Step 1: Load raw text from file
    const docs = await loader.load();
    const extractedData = docs.map(d => d.pageContent).join('\n');

    // Step 2: Build structured parsing prompt
    const prompt = getResumeParserPrompt(extractedData);

    // Step 3: Call the LLM with the prompt
    const response = await this.llm.invoke(prompt);
    let rawOutput = response.content as string;

    // Step 4: Clean up ```json or ``` wrappers
    rawOutput = rawOutput
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    // Step 5: Parse JSON safely
    try {
      const structuredData = JSON.parse(rawOutput);
      return structuredData;
    } catch (err) {
      logger.error('Failed to parse LLM output:', rawOutput);
      throw new Error('Invalid JSON returned from LLM');
    }
  }
}

export default new LLMService();
