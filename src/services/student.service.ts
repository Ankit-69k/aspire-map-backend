import prisma from '#config/db.ts';
import bcrypt from 'bcrypt';

class StudentService {
  async createStudent(name: string, email: string, password: string) {
    // Check if email already exists
    const existing = await prisma.student.findUnique({ where: { email } });
    if (existing) {
      throw new Error('Email already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create student
    const student = await prisma.student.create({
      data: {
        name,
        email,
        password: hashedPassword,
        profiles: { create: {} }, // create empty profile
      },
      include: { profiles: true },
    });

    // Do not return password
    const { password: _, ...safeStudent } = student;
    return safeStudent;
  }

  async getStudentById(id: string) {
    return prisma.student.findUnique({
      where: { id },
      include: { profiles: true, skills: true, roadmaps: true },
    });
  }
}

export default new StudentService();
