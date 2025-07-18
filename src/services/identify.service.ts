import { PrismaClient, Contact } from "@prisma/client";

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
  // 1. find existing matches
  const matches = await prisma.contact.findMany({
    where: {
      OR: [
        email ? { email } : undefined,
        phoneNumber ? { phoneNumber } : undefined,
      ].filter(Boolean) as any[],
    },
  });

  // 2. no matches → create primary
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

  // 3. collect full linked set via BFS
  const queue = matches.map((c) => c.id);
  const visited = new Set<number>();
  while (queue.length) {
    const id = queue.shift()!;
    if (visited.has(id)) continue;
    visited.add(id);

    const c = await prisma.contact.findUnique({
      where: { id },
      include: { secondaries: true },
    });
    if (!c) continue;
    if (c.linkedId) queue.push(c.linkedId);
    c.secondaries.forEach((s) => queue.push(s.id));
  }

  // 4. load all linked contacts sorted by creation time
  const linkedContacts = await prisma.contact.findMany({
    where: { id: { in: Array.from(visited) } },
    orderBy: { createdAt: "asc" },
  });

  // 5. the oldest is primary
  const primary = linkedContacts[0];

  // 6. demote any other primaries
  await Promise.all(
    linkedContacts.slice(1).map((c) =>
      c.linkPrecedence === "primary"
        ? prisma.contact.update({
            where: { id: c.id },
            data: { linkPrecedence: "secondary", linkedId: primary.id },
          })
        : Promise.resolve()
    )
  );

  // 7. add new secondary if new info present
  const existingEmails = new Set(
    linkedContacts.map((c) => c.email).filter(Boolean) as string[]
  );
  const existingPhones = new Set(
    linkedContacts.map((c) => c.phoneNumber).filter(Boolean) as string[]
  );
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

  // 8. final fetch of primary + secondaries
  const final = await prisma.contact.findMany({
    where: {
      OR: [{ id: primary.id }, { linkedId: primary.id }],
    },
  });

  return {
    primaryContactId: primary.id,
    emails: Array.from(new Set(final.map((c) => c.email).filter(Boolean) as string[])),
    phoneNumbers: Array.from(
      new Set(final.map((c) => c.phoneNumber).filter(Boolean) as string[])
    ),
    secondaryContactIds: final
      .filter((c) => c.linkPrecedence === "secondary")
      .map((c) => c.id),
  };
}
