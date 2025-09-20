import logger from '#config/logger.ts';
import prisma from '#config/db.ts';
import llm from '#config/llm.ts';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { DocxLoader } from '@langchain/community/document_loaders/fs/docx';
import { getResumeParserPrompt } from '../prompts/resumeParser.ts';
import { vectorStore } from '#config/vectorDb.ts';
import * as fs from 'fs/promises';
import * as path from 'path';

interface ProfileData {
  education?: string;
  subjects?: string[];
  certifications?: string[];
  projects?: string[];
  internships?: string[];
  hobbies?: string[];
  resumeUrl?: string;
  linkedInUrl?: string;
}

class ProfileService {
  /**
   * Create a new profile for a student
   */
  async createProfile(studentId: string, profileData: ProfileData) {
    try {
      // Validate student exists
      const student = await prisma.student.findUnique({
        where: { id: studentId },
      });

      if (!student) {
        throw new Error('Student not found');
      }

      // Check if profile already exists
      const existingProfile = await prisma.profile.findFirst({
        where: { studentId },
      });

      const profile = await prisma.profile.update({
        where: { id: existingProfile ? existingProfile.id : '' },
        data: {
          ...profileData,
          student: { connect: { id: studentId } },
        },
        include: {
          student: true,
        },
      });

      this.addToVectorStore(profile).catch(err =>
        logger.error('Failed to add profile to vector store:', err)
      );

      logger.info(`Profile created successfully for student: ${studentId}`);
      return profile;
    } catch (error) {
      logger.error('Error creating profile:', error);
      throw new Error('Failed to create profile');
    }
  }

  /**
   * Update an existing profile
   */
  async updateProfile(studentId: string, profileData: Partial<ProfileData>) {
    try {
      const existingProfile = await prisma.profile.findFirst({
        where: { studentId },
      });

      if (!existingProfile) {
        throw new Error('Profile not found');
      }

      const profile = await prisma.profile.update({
        where: { id: existingProfile.id },
        data: profileData,
        include: {
          student: true,
        },
      });

      logger.info(`Profile updated successfully for student: ${studentId}`);
      return profile;
    } catch (error) {
      logger.error('Error updating profile:', error);
      throw new Error('Failed to update profile');
    }
  }

  /**
   * Add skills to student
   */
  async addSkillsToStudent(
    studentId: string,
    skills: Array<{ name: string; level?: number }>,
    detected: boolean = false
  ) {
    try {
      for (const skillData of skills) {
        // Find or create skill
        let skill = await prisma.skill.findFirst({
          where: {
            name: {
              equals: skillData.name,
              mode: 'insensitive',
            },
          },
        });

        if (!skill) {
          skill = await prisma.skill.create({
            data: {
              name: skillData.name,
              category: 'General', // Default category, you might want to categorize this
            },
          });
        }

        // Check if student already has this skill
        const existingStudentSkill = await prisma.studentSkill.findFirst({
          where: {
            studentId,
            skillId: skill.id,
          },
        });

        if (!existingStudentSkill) {
          await prisma.studentSkill.create({
            data: {
              studentId,
              skillId: skill.id,
              level: skillData.level || 1,
              detected,
            },
          });
        }
      }

      logger.info(`Added ${skills.length} skills to student: ${studentId}`);
    } catch (error) {
      logger.error('Error adding skills to student:', error);
      throw error;
    }
  }

  /**
   * Get complete profile with skills
   */
  async getCompleteProfile(studentId: string) {
    try {
      const profile = await prisma.profile.findFirst({
        where: { studentId },
        include: {
          student: {
            include: {
              skills: {
                include: {
                  skill: true,
                },
              },
            },
          },
        },
      });

      return profile;
    } catch (error) {
      logger.error('Error fetching complete profile:', error);
      throw new Error('Failed to fetch profile');
    }
  }

  /**
   * Generate profile text for career recommendations
   */
  generateProfileText(profile: any): string {
    const parts = [];

    if (profile.education) {
      parts.push(`Education: ${profile.education}`);
    }

    if (profile.subjects && profile.subjects.length > 0) {
      parts.push(`Subjects: ${profile.subjects.join(', ')}`);
    }

    if (profile.certifications && profile.certifications.length > 0) {
      parts.push(`Certifications: ${profile.certifications.join(', ')}`);
    }

    if (profile.projects && profile.projects.length > 0) {
      parts.push(`Projects: ${profile.projects.join(', ')}`);
    }

    if (profile.internships && profile.internships.length > 0) {
      parts.push(`Internships: ${profile.internships.join(', ')}`);
    }

    if (profile.student?.skills && profile.student.skills.length > 0) {
      const skillNames = profile.student.skills.map((s: any) => s.skill.name);
      parts.push(`Skills: ${skillNames.join(', ')}`);
    }

    if (profile.hobbies && profile.hobbies.length > 0) {
      parts.push(`Hobbies: ${profile.hobbies.join(', ')}`);
    }

    return parts.join('\n');
  }

  /**
   * Add profile to vector store for similarity search
   */
  async addToVectorStore(profile: any) {
    try {
      const profileText = this.generateProfileText(profile);

      if (profileText.trim()) {
        await vectorStore.addDocuments([
          {
            pageContent: profileText,
            metadata: {
              studentId: profile.studentId,
              profileId: profile.id,
              type: 'profile',
            },
          },
        ]);

        logger.info(
          `Profile added to vector store for student: ${profile.studentId}`
        );
      }
    } catch (error) {
      logger.error('Error adding profile to vector store:', error);
      // Don't throw here as it's not critical for profile creation
    }
  }

  /**
   * Delete profile and cleanup
   */
  async deleteProfile(studentId: string) {
    try {
      const existingProfile = await prisma.profile.findFirst({
        where: { studentId },
      });

      if (!existingProfile) {
        throw new Error('Profile not found');
      }

      // Delete associated student skills that were auto-detected
      await prisma.studentSkill.deleteMany({
        where: {
          studentId,
          detected: true,
        },
      });

      // Delete the profile
      const deletedProfile = await prisma.profile.delete({
        where: { id: existingProfile.id },
      });

      logger.info(`Profile deleted for student: ${studentId}`);
      return deletedProfile;
    } catch (error) {
      logger.error('Error deleting profile:', error);
      throw new Error('Failed to delete profile');
    }
  }

  /**
   * Clean up uploaded file
   */
  async cleanupFile(filePath: string) {
    try {
      await fs.unlink(filePath);
      logger.info(`Cleaned up file: ${filePath}`);
    } catch (error) {
      logger.warn(`Failed to cleanup file ${filePath}:`, error);
    }
  }
}

export default new ProfileService();
