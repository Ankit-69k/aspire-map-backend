-- CreateTable
CREATE TABLE "public"."Student" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Profile" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "education" TEXT,
    "subjects" TEXT[],
    "certifications" TEXT[],
    "projects" TEXT[],
    "internships" TEXT[],
    "hobbies" TEXT[],
    "resumeUrl" TEXT,
    "linkedInUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Skill" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."StudentSkill" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "level" INTEGER,
    "detected" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Career" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "industry" TEXT,
    "emerging" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Career_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CareerSkill" (
    "id" TEXT NOT NULL,
    "careerId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "importance" INTEGER NOT NULL,

    CONSTRAINT "CareerSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Roadmap" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "careerId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "timeline" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Roadmap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RoadmapStep" (
    "id" TEXT NOT NULL,
    "roadmapId" TEXT NOT NULL,
    "skillId" TEXT,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "provider" TEXT,
    "url" TEXT,
    "order" INTEGER NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "RoadmapStep_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Student_email_key" ON "public"."Student"("email");

-- AddForeignKey
ALTER TABLE "public"."Profile" ADD CONSTRAINT "Profile_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StudentSkill" ADD CONSTRAINT "StudentSkill_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StudentSkill" ADD CONSTRAINT "StudentSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "public"."Skill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CareerSkill" ADD CONSTRAINT "CareerSkill_careerId_fkey" FOREIGN KEY ("careerId") REFERENCES "public"."Career"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CareerSkill" ADD CONSTRAINT "CareerSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "public"."Skill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Roadmap" ADD CONSTRAINT "Roadmap_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Roadmap" ADD CONSTRAINT "Roadmap_careerId_fkey" FOREIGN KEY ("careerId") REFERENCES "public"."Career"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RoadmapStep" ADD CONSTRAINT "RoadmapStep_roadmapId_fkey" FOREIGN KEY ("roadmapId") REFERENCES "public"."Roadmap"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RoadmapStep" ADD CONSTRAINT "RoadmapStep_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "public"."Skill"("id") ON DELETE SET NULL ON UPDATE CASCADE;
