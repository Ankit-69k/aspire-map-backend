import logger from '../config/logger.js';
import prisma from '../config/db.js';

class CareerService {
  async createCareer(
    profileId: string,
    careerData: {
      title: string;
      description: string;
      industry: string;
      emerging: boolean;
    }
  ) {
    try {
      // Step 1: Create the career
      const career = await prisma.career.create({
        data: {
          title: careerData.title,
          description: careerData.description,
          industry: careerData.industry,
          emerging: careerData.emerging,
        },
      });

      // Step 2: Link it with the profile
      await prisma.profileCareer.create({
        data: {
          profileId: profileId,
          careerId: career.id,
        },
      });

      return career;
    } catch (error) {
      logger.error('Error creating career:', error);
      throw new Error('Error creating career');
    }
  }

  async getCareersByProfile(profileId: string) {
    try {
      const careers = await prisma.profileCareer.findMany({
        where: { profileId },
        include: { career: true },
      });

      return careers.map(pc => pc.career);
    } catch (error) {
      logger.error('Error fetching careers for profile:', error);
      throw new Error('Error fetching careers for profile');
    }
  }
}

export default new CareerService();
