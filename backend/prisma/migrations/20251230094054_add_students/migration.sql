-- CreateEnum
CREATE TYPE "ScreeningStatus" AS ENUM ('pending', 'completed', 'reviewed');

-- CreateTable
CREATE TABLE "students" (
    "student_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "grade" INTEGER NOT NULL,
    "school_id" TEXT,
    "assigned_teacher_id" TEXT,
    "assigned_therapist_id" TEXT,
    "language_preference" TEXT NOT NULL DEFAULT 'en',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "screening_status" "ScreeningStatus" NOT NULL DEFAULT 'pending',
    "dyslexia_risk" DECIMAL(5,2),
    "adhd_risk" DECIMAL(5,2),
    "asd_risk" DECIMAL(5,2),
    "screening_confidence" DECIMAL(3,2),
    "assessed_at" TIMESTAMP(3),

    CONSTRAINT "students_pkey" PRIMARY KEY ("student_id")
);

-- CreateTable
CREATE TABLE "student_parents" (
    "student_id" TEXT NOT NULL,
    "parent_id" TEXT NOT NULL,
    "relationship" TEXT,

    CONSTRAINT "student_parents_pkey" PRIMARY KEY ("student_id","parent_id")
);

-- CreateIndex
CREATE INDEX "students_assigned_teacher_id_idx" ON "students"("assigned_teacher_id");

-- CreateIndex
CREATE INDEX "students_assigned_therapist_id_idx" ON "students"("assigned_therapist_id");

-- CreateIndex
CREATE INDEX "students_screening_status_idx" ON "students"("screening_status");

-- CreateIndex
CREATE INDEX "student_parents_student_id_idx" ON "student_parents"("student_id");

-- CreateIndex
CREATE INDEX "student_parents_parent_id_idx" ON "student_parents"("parent_id");

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_assigned_teacher_id_fkey" FOREIGN KEY ("assigned_teacher_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_assigned_therapist_id_fkey" FOREIGN KEY ("assigned_therapist_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_parents" ADD CONSTRAINT "student_parents_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("student_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_parents" ADD CONSTRAINT "student_parents_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
