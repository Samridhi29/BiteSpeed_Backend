import { PrismaClient, Contact } from "@prisma/client";
import { buildContactGraph } from "../utils/contactGraph";

const prisma = new PrismaClient();

interface Reconciled {
  primaryContactId: number;
  emails: string[];
  phoneNumbers: string[];
  secondaryContactIds: number[];
}

export async function reconcileContact(
  email?: string,
  phoneNumber?: string
): Promise<Reconciled> {
  if (!email && !phoneNumber) {
    throw { statusCode: 400, message: "At least one of email or phoneNumber is required." };
  }

  //Find any direct matches by email or phone
  const matches = await prisma.contact.findMany({
    where: {
      OR: [
        email ? { email } : undefined,
        phoneNumber ? { phoneNumber } : undefined,
      ].filter(Boolean) as any[],
    },
  });

  //No matches → create new primary contact
  if (matches.length === 0) {
    const created = await prisma.contact.create({
      data: { email, phoneNumber, linkPrecedence: "primary" },
    });
    return {
      primaryContactId: created.id,
      emails: email ? [email] : [],
      phoneNumbers: phoneNumber ? [phoneNumber] : [],
      secondaryContactIds: [],
    };
  }

  //Build full graph of linked contacts
  const linkedContacts = await buildContactGraph(matches[0].id);

  //Determine the primary (oldest createdAt)
  linkedContacts.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  const primary = linkedContacts[0];

  //Demote any other “primary” record to secondary && link to true primary
  await Promise.all(
    linkedContacts.slice(1)
      .filter(c => c.linkPrecedence === "primary")
      .map(c =>
        prisma.contact.update({
          where: { id: c.id },
          data: { linkPrecedence: "secondary", linkedId: primary.id },
        })
      )
  );

  // If new email/phone, create a secondary record
  const existingEmails = new Set(linkedContacts.map(c => c.email).filter(Boolean) as string[]);
  const existingPhones = new Set(linkedContacts.map(c => c.phoneNumber).filter(Boolean) as string[]);

  if (
    (email && !existingEmails.has(email)) ||
    (phoneNumber && !existingPhones.has(phoneNumber))
  ) {
    await prisma.contact.create({
      data: {
        email,
        phoneNumber,
        linkPrecedence: "secondary",
        linkedId: primary.id,
      },
    });
  }

  //Fetch final list of primary + secondaries
  const finalContacts = await prisma.contact.findMany({
    where: {
      OR: [{ id: primary.id }, { linkedId: primary.id }],
    },
  });

  //Build response payload
  return {
    primaryContactId: primary.id,
    emails: Array.from(
      new Set(finalContacts.map(c => c.email).filter(Boolean) as string[])
    ),
    phoneNumbers: Array.from(
      new Set(finalContacts.map(c => c.phoneNumber).filter(Boolean) as string[])
    ),
    secondaryContactIds: finalContacts
      .filter(c => c.linkPrecedence === "secondary")
      .map(c => c.id),
  };
}

