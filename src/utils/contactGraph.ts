import { PrismaClient, Contact } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Given a starting Contact ID, traverses all linked records (both primary and secondary)
 * and returns the full list of Contact objects.
 */
export async function buildContactGraph(startId: number): Promise<Contact[]> {
  const visited = new Set<number>();
  const toVisit = [startId];
  const result: Contact[] = [];

  while (toVisit.length) {
    const id = toVisit.shift()!;
    if (visited.has(id)) continue;
    visited.add(id);

    const contact = await prisma.contact.findUnique({
      where: { id },
      include: { secondaries: true },
    });

    if (contact) {
      result.push(contact);

      // enqueue its primary link
      if (contact.linkedId) {
        toVisit.push(contact.linkedId);
      }

      // enqueue all its secondaries
      for (const sec of contact.secondaries) {
        toVisit.push(sec.id);
      }
    }
  }

  return result;
}
