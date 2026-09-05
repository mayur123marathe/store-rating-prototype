import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clean existing data
  await prisma.rating.deleteMany({});
  await prisma.store.deleteMany({});
  await prisma.user.deleteMany({});

  const defaultPassword = 'Password@123';
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(defaultPassword, salt);
  const adminPasswordHash = await bcrypt.hash('Admin@123', salt);
  const ownerPasswordHash = await bcrypt.hash('Owner@123', salt);
  const userPasswordHash = await bcrypt.hash('User@123', salt);

  // 1. Create Admin
  const admin = await prisma.user.create({
    data: {
      name: 'System Administrator Roxiler Platform',
      email: 'admin@roxiler.com',
      password: adminPasswordHash,
      address: '742 Evergreen Terrace, Sector 4, Silicon Valley',
      role: Role.ADMIN,
    },
  });
  console.log(`✅ Created Admin: ${admin.email}`);

  // 2. Create Store Owners
  const owner1 = await prisma.user.create({
    data: {
      name: 'Marcus Aurelius Store Manager',
      email: 'owner.tech@roxiler.com',
      password: ownerPasswordHash,
      address: '101 Tech Boulevard, North Wing, Metropolis',
      role: Role.STORE_OWNER,
    },
  });

  const owner2 = await prisma.user.create({
    data: {
      name: 'Elena Rostova Grocery Director',
      email: 'owner.fresh@roxiler.com',
      password: ownerPasswordHash,
      address: '220 Green Valley Road, Market Square, Greenfield',
      role: Role.STORE_OWNER,
    },
  });

  const owner3 = await prisma.user.create({
    data: {
      name: 'Sebastian Michael Artisan Baker',
      email: 'owner.cafe@roxiler.com',
      password: ownerPasswordHash,
      address: '88 Bohemian Promenade, Arts Quarter, Old Town',
      role: Role.STORE_OWNER,
    },
  });
  console.log('✅ Created 3 Store Owners');

  // 3. Create Stores
  const store1 = await prisma.store.create({
    data: {
      name: 'Apex Electronics & Gadget Hub',
      email: 'contact@apexelectronics.com',
      address: '101 Tech Boulevard, North Wing, Metropolis',
      ownerId: owner1.id,
    },
  });

  const store2 = await prisma.store.create({
    data: {
      name: 'Urban Fresh Organic Grocery Market',
      email: 'support@urbanfreshmarket.com',
      address: '220 Green Valley Road, Market Square, Greenfield',
      ownerId: owner2.id,
    },
  });

  const store3 = await prisma.store.create({
    data: {
      name: 'Metro Books & Artisanal Cafe',
      email: 'hello@metrobookscafe.com',
      address: '88 Bohemian Promenade, Arts Quarter, Old Town',
      ownerId: owner3.id,
    },
  });

  const store4 = await prisma.store.create({
    data: {
      name: 'Summit Athletic & Sports Outfitters',
      email: 'gear@summitathletics.com',
      address: '500 Mountain View Heights, Olympic Village',
      ownerId: null, // Store without owner yet for admin demo
    },
  });
  console.log('✅ Created 4 Stores');

  // 4. Create Normal Users
  const user1 = await prisma.user.create({
    data: {
      name: 'Alexander Hamilton Senior Reviewer',
      email: 'user.alex@roxiler.com',
      password: userPasswordHash,
      address: '12 Financial Row, Manhattan Center, New York',
      role: Role.USER,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: 'Benjamin Franklin Certified Buyer',
      email: 'user.ben@roxiler.com',
      password: userPasswordHash,
      address: '34 Liberty Way, Historic District, Philadelphia',
      role: Role.USER,
    },
  });

  const user3 = await prisma.user.create({
    data: {
      name: 'Charlotte Bronte Verified Customer',
      email: 'user.charlotte@roxiler.com',
      password: userPasswordHash,
      address: '56 Yorkshire Vale, Literature Way, Greenfield',
      role: Role.USER,
    },
  });

  const user4 = await prisma.user.create({
    data: {
      name: 'David Copperfield Loyal Consumer',
      email: 'user.david@roxiler.com',
      password: userPasswordHash,
      address: '78 Victorian Avenue, Waterfront Harbor, Old Town',
      role: Role.USER,
    },
  });

  const user5 = await prisma.user.create({
    data: {
      name: 'Elizabeth Bennet Regular Shopper',
      email: 'user.elizabeth@roxiler.com',
      password: userPasswordHash,
      address: '90 Hertfordshire Manor, Countryside Estates',
      role: Role.USER,
    },
  });
  console.log('✅ Created 5 Normal Users');

  // 5. Create Ratings
  // Store 1: Apex Electronics
  await prisma.rating.createMany({
    data: [
      { score: 5, userId: user1.id, storeId: store1.id },
      { score: 4, userId: user2.id, storeId: store1.id },
      { score: 5, userId: user3.id, storeId: store1.id },
      { score: 4, userId: user4.id, storeId: store1.id },
    ],
  });

  // Store 2: Urban Fresh
  await prisma.rating.createMany({
    data: [
      { score: 5, userId: user1.id, storeId: store2.id },
      { score: 5, userId: user2.id, storeId: store2.id },
      { score: 4, userId: user3.id, storeId: store2.id },
      { score: 5, userId: user5.id, storeId: store2.id },
    ],
  });

  // Store 3: Metro Books
  await prisma.rating.createMany({
    data: [
      { score: 4, userId: user1.id, storeId: store3.id },
      { score: 3, userId: user2.id, storeId: store3.id },
      { score: 5, userId: user4.id, storeId: store3.id },
      { score: 4, userId: user5.id, storeId: store3.id },
    ],
  });

  // Store 4: Summit Athletics
  await prisma.rating.createMany({
    data: [
      { score: 3, userId: user3.id, storeId: store4.id },
      { score: 4, userId: user4.id, storeId: store4.id },
    ],
  });

  console.log('✅ Created 14 Ratings across stores');
  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
