-- DropForeignKey
ALTER TABLE "public"."Drawing" DROP CONSTRAINT "Drawing_username_fkey";

-- AlterTable
ALTER TABLE "public"."Drawing" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AddForeignKey
ALTER TABLE "public"."Drawing" ADD CONSTRAINT "Drawing_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
