// import { PrismaClient, Contact } from '@prisma/client';
// import { buildContactGraph } from '../utils/contactGraph';

// const prisma = new PrismaClient();

// export const handleIdentityReconciliation = async (email?: string, phoneNumber?: string) => {
//   if (!email && !phoneNumber) throw new Error("Missing email or phone number");

//   const matches = await prisma.contact.findMany({
//     where: {
//       OR: [
//         email ? { email } : undefined,
//         phoneNumber ? { phoneNumber } : undefined
//       ].filter(Boolean) as any[]
//     }
//   });

//   if (!matches.length) {
//     const newContact = await prisma.contact.create({
//       data: { email, phoneNumber, linkPrecedence: 'primary' }
//     });
//     return {
//       primaryContactId: newContact.id,
//       emails: email ? [email] : [],
//       phoneNumbers: phoneNumber ? [phoneNumber] : [],
//       secondaryContactIds: []
//     };
//   }

//   const allLinkedContacts = await buildContactGraph(matches[0].id);
//   const primary = allLinkedContacts.reduce((prev, curr) =>
//     curr.createdAt < prev.createdAt ? curr : prev
//   );

//   const updatePromises = allLinkedContacts
//     .filter(c => c.id !== primary.id && c.linkPrecedence === 'primary')
//     .map(c => prisma.contact.update({
//       where: { id: c.id },
//       data: { linkPrecedence: 'secondary', linkedId: primary.id }
//     }));

//   await Promise.all(updatePromises);

//   const existingEmails = new Set(allLinkedContacts.map(c => c.email).filter(Boolean));
//   const existingPhones = new Set(allLinkedContacts.map(c => c.phoneNumber).filter(Boolean));

//   if ((email && !existingEmails.has(email)) || (phoneNumber && !existingPhones.has(phoneNumber))) {
//     await prisma.contact.create({
//       data: {
//         email,
//         phoneNumber,
//         linkPrecedence: 'secondary',
//         linkedId: primary.id
//       }
//     });
//   }

//   const finalContacts = await prisma.contact.findMany({
//     where: {
//       OR: [{ id: primary.id }, { linkedId: primary.id }]
//     }
//   });

//   const emails = [...new Set(finalContacts.map(c => c.email).filter(Boolean))];
//   const phoneNumbers = [...new Set(finalContacts.map(c => c.phoneNumber).filter(Boolean))];
//   const secondaryContactIds = finalContacts
//     .filter(c => c.linkPrecedence === 'secondary')
//     .map(c => c.id);

//   return {
//     primaryContactId: primary.id,
//     emails,
//     phoneNumbers,
//     secondaryContactIds
//   };
// };
