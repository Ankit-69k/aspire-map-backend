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

  async generateCareerRecommendations(studentId: string) {
    try {
      const student = await prisma.student.findFirst({
        where: { id: studentId },
        include: { profiles: true },
      });

      if (!student) {
        throw new Error(`Profile of student with id ${studentId} not found`);
      }

      // 2. Convert structured profile to text
      const profileText = `
      Education: ${student?.profiles[0]?.education}
      Certifications: ${student?.profiles[0]?.certifications?.join(', ')}
      Projects: ${student?.profiles[0]?.projects?.join(', ')}
      Experience: ${student?.profiles[0]?.experience?.join(', ')}
      Hobbies: ${student?.profiles[0]?.hobbies?.join(', ')}
      Resume: ${student?.profiles[0]?.resumeUrl}
      LinkedIn: ${student?.profiles[0]?.linkedInUrl}
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

  async generateCareerRoadmap(studentId: string) {
    const student = await prisma.student.findFirst({
      where: { id: studentId },
      include: { profiles: true },
    });

    // 1. Fetch profile with relations
    const profile = await prisma.profile.findUnique({
      where: { id: student?.profiles[0]?.id || '' },
      include: {
        student: {
          include: {
            skills: { include: { skill: true } }, // fetch actual skill details
          },
        },
        careers: {
          include: { career: true }, // get linked careers
        },
      },
    });

    const career = await prisma.profileCareer.findFirst({
      where: { profileId: profile?.id || '' },
      include: { career: true },
    });

    if (!profile) {
      throw new Error(`Profile with student id ${studentId} not found`);
    }
    // Extract fields safely
    const education = profile.education ?? 'Not specified';

    const skills = profile.student.skills.map(s => s.skill.name) ?? [];

    const experience =
      profile.experience && profile.experience.length > 0
        ? profile.experience.join(', ')
        : 'Not specified';

    const targetCareers = career?.career;

    logger.info('career', targetCareers);

    logger.info('Generating roadmap for profile', {
      studentId,
      targetCareers,
    });

    // 2. Build LLM prompt
    const prompt = getRoadmapPrompt(
      education,
      skills,
      experience,
      targetCareers
    );

    // 3. Call LLM
    const response = await llm.invoke(prompt);
    let rawOutput = response.content as string;

    logger.info('LLM response received for roadmap generation', response);

    // 4. Clean JSON wrappers
    rawOutput = rawOutput
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    // 5. Parse JSON safely
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
