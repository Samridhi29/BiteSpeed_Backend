-- CreateTable
CREATE TABLE "Contact" (
    "id" SERIAL NOT NULL,
    "email" TEXT,
    "phoneNumber" TEXT,
    "linkedId" INTEGER,
    "linkPrecedence" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Contact_email_key" ON "Contact"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Contact_phoneNumber_key" ON "Contact"("phoneNumber");

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_linkedId_fkey" FOREIGN KEY ("linkedId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;
