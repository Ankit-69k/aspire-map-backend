-- CreateTable
CREATE TABLE "public"."ProfileCareer" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "careerId" TEXT NOT NULL,

    CONSTRAINT "ProfileCareer_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."ProfileCareer" ADD CONSTRAINT "ProfileCareer_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "public"."Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProfileCareer" ADD CONSTRAINT "ProfileCareer_careerId_fkey" FOREIGN KEY ("careerId") REFERENCES "public"."Career"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
