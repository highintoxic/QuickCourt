import { PrismaClient, UserRole, VenueType, FacilityStatus, BookingStatus, PaymentStatus, PaymentProvider, PaymentProviderStatus, User, Facility, Court, Booking, Sport } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Sample data arrays
const cities = [
  { city: 'Mumbai', state: 'Maharashtra' },
  { city: 'Delhi', state: 'Delhi' },
  { city: 'Bangalore', state: 'Karnataka' },
  { city: 'Chennai', state: 'Tamil Nadu' },
  { city: 'Hyderabad', state: 'Telangana' },
  { city: 'Pune', state: 'Maharashtra' },
  { city: 'Kolkata', state: 'West Bengal' },
  { city: 'Ahmedabad', state: 'Gujarat' },
];

const facilityNames = [
  'Elite Sports Arena', 'Champions Court', 'Victory Sports Complex', 'Premier Play Zone',
  'Royal Sports Club', 'Ace Sports Center', 'Phoenix Sports Hub', 'Crown Sports Complex',
  'Diamond Courts', 'Golden Sports Arena', 'Platinum Play Center', 'Silver Sports Club',
  'Nexus Sports Complex', 'Apex Sports Center', 'Unity Sports Hub', 'Prime Sports Arena'
];

const sports = [
  { name: 'Badminton', icon: '🏸' },
  { name: 'Tennis', icon: '🎾' },
  { name: 'Football', icon: '⚽' },
  { name: 'Cricket', icon: '🏏' },
  { name: 'Basketball', icon: '🏀' },
  { name: 'Table Tennis', icon: '🏓' },
  { name: 'Squash', icon: '🟡' },
  { name: 'Volleyball', icon: '🏐' }
];

const amenities = [
  'Parking', 'Changing Rooms', 'Washrooms', 'Water Cooler', 'First Aid',
  'Equipment Rental', 'Cafeteria', 'Air Conditioning', 'WiFi', 'CCTV',
  'Shower Facility', 'Lockers', 'Lighting', 'Sound System', 'Spectator Seating'
];

const firstNames = [
  'Arjun', 'Priya', 'Rahul', 'Sneha', 'Vikram', 'Anita', 'Rohan', 'Kavya',
  'Amit', 'Pooja', 'Siddharth', 'Meera', 'Kiran', 'Neha', 'Suresh', 'Divya',
  'Rajesh', 'Sunita', 'Manish', 'Ritu', 'Ashish', 'Preeti', 'Deepak', 'Shweta',
  'Arun', 'Sangeeta', 'Naveen', 'Rekha', 'Vinod', 'Geeta', 'Manoj', 'Sushma'
];

const lastNames = [
  'Sharma', 'Verma', 'Gupta', 'Singh', 'Kumar', 'Agarwal', 'Jain', 'Patel',
  'Shah', 'Mehta', 'Reddy', 'Nair', 'Iyer', 'Chandra', 'Mishra', 'Tiwari',
  'Yadav', 'Joshi', 'Bansal', 'Saxena', 'Malhotra', 'Kapoor', 'Chopra', 'Sood'
];

// Helper functions
function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomElements<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, array.length));
}

function generatePhone(): string {
  return `+91${Math.floor(Math.random() * 9000000000 + 1000000000)}`;
}

function generateEmail(firstName: string, lastName: string): string {
  const providers = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
  const provider = getRandomElement(providers);
  const number = Math.floor(Math.random() * 999) + 1;
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}${number}@${provider}`;
}

function getRandomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function getRandomFutureDate(daysFromNow: number = 30): Date {
  const now = new Date();
  return new Date(now.getTime() + Math.random() * daysFromNow * 24 * 60 * 60 * 1000);
}

function generateTimeSlot(): { startsAt: Date, endsAt: Date, hours: number } {
  const baseDate = getRandomFutureDate(14); // Within next 2 weeks
  const hour = Math.floor(Math.random() * 12) + 6; // 6 AM to 6 PM
  const duration = [1, 1.5, 2][Math.floor(Math.random() * 3)]; // 1, 1.5, or 2 hours
  
  const startsAt = new Date(baseDate);
  startsAt.setHours(hour, 0, 0, 0);
  
  const endsAt = new Date(startsAt);
  endsAt.setHours(hour + Math.floor(duration), (duration % 1) * 60, 0, 0);
  
  return { startsAt, endsAt, hours: duration };
}

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create Admin User
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.create({
    data: {
      fullName: 'System Administrator',
      email: 'admin@quickcourt.com',
      phone: '+919999999999',
      passwordHash: adminPassword,
      role: UserRole.ADMIN,
      isVerified: true,
    },
  });
  console.log('✅ Created admin user');

  // Create Sports
  const createdSports = await Promise.all(
    sports.map(sport =>
      prisma.sport.create({
        data: sport,
      })
    )
  );
  console.log(`✅ Created ${createdSports.length} sports`);

  // Create Users (Regular Users and Facility Owners)
  const users: User[] = [];
  
  // Create 20 regular users
  for (let i = 0; i < 20; i++) {
    const firstName = getRandomElement(firstNames);
    const lastName = getRandomElement(lastNames);
    const password = await bcrypt.hash('password123', 12);
    
    const user = await prisma.user.create({
      data: {
        fullName: `${firstName} ${lastName}`,
        email: generateEmail(firstName, lastName),
        phone: generatePhone(),
        passwordHash: password,
        role: UserRole.USER,
        isVerified: Math.random() > 0.2, // 80% verified
      },
    });
    users.push(user);
  }

  // Create 10 facility owners
  const facilityOwners: User[] = [];
  for (let i = 0; i < 10; i++) {
    const firstName = getRandomElement(firstNames);
    const lastName = getRandomElement(lastNames);
    const password = await bcrypt.hash('owner123', 12);
    
    const owner = await prisma.user.create({
      data: {
        fullName: `${firstName} ${lastName}`,
        email: generateEmail(firstName, lastName),
        phone: generatePhone(),
        passwordHash: password,
        role: UserRole.FACILITY_OWNER,
        isVerified: true,
      },
    });
    facilityOwners.push(owner);
  }
  
  console.log(`✅ Created ${users.length + facilityOwners.length} users`);

  // Create Facilities
  const facilities: Facility[] = [];
  for (let i = 0; i < facilityNames.length; i++) {
    const owner = getRandomElement(facilityOwners);
    const location = getRandomElement(cities);
    const venueTypes = [VenueType.INDOOR, VenueType.OUTDOOR, VenueType.MIXED];
    
    const facility = await prisma.facility.create({
      data: {
        ownerId: owner.id,
        name: facilityNames[i],
        description: `Premium sports facility offering world-class amenities and professional courts for sports enthusiasts.`,
        addressLine: `${i + 1}, Sports Complex Street, ${location.city}`,
        city: location.city,
        state: location.state,
        pincode: `${Math.floor(Math.random() * 900000) + 100000}`,
        geoLat: 20.0 + Math.random() * 8, // Approximate India latitude range
        geoLng: 70.0 + Math.random() * 15, // Approximate India longitude range
        venueType: getRandomElement(venueTypes),
        status: Math.random() > 0.1 ? FacilityStatus.APPROVED : FacilityStatus.PENDING,
        ratingAvg: 3.5 + Math.random() * 1.5, // 3.5 to 5.0
        ratingCount: Math.floor(Math.random() * 50) + 5,
      },
    });
    
    // Add facility photos
    const photoCount = Math.floor(Math.random() * 3) + 2; // 2-4 photos
    for (let j = 0; j < photoCount; j++) {
      await prisma.facilityPhoto.create({
        data: {
          facilityId: facility.id,
          url: `https://picsum.photos/800/600?random=${facility.id}-${j}`,
          caption: `${facility.name} - View ${j + 1}`,
          sortOrder: j,
        },
      });
    }
    
    // Add facility amenities
    const facilityAmenities = getRandomElements(amenities, Math.floor(Math.random() * 8) + 3);
    for (const amenity of facilityAmenities) {
      await prisma.facilityAmenity.create({
        data: {
          facilityId: facility.id,
          amenityName: amenity,
        },
      });
    }
    
    facilities.push(facility);
  }
  console.log(`✅ Created ${facilities.length} facilities with photos and amenities`);

  // Create Courts for each facility
  const courts: Court[] = [];
  for (const facility of facilities) {
    const courtCount = Math.floor(Math.random() * 4) + 2; // 2-5 courts per facility
    const facilitySports = getRandomElements(createdSports, Math.floor(Math.random() * 3) + 1);
    
    for (let i = 0; i < courtCount; i++) {
      const sport = getRandomElement(facilitySports);
      const basePrice = sport.name === 'Tennis' ? 500 : sport.name === 'Badminton' ? 300 : 400;
      const price = basePrice + Math.floor(Math.random() * 200);
      
      const court = await prisma.court.create({
        data: {
          facilityId: facility.id,
          name: `Court ${String.fromCharCode(65 + i)}`, // Court A, B, C, etc.
          sportId: sport.id,
          pricePerHour: price,
          opensAt: "06:00",
          closesAt: "22:00",
          isActive: Math.random() > 0.05, // 95% active
        },
      });
      courts.push(court);
    }
  }
  console.log(`✅ Created ${courts.length} courts`);

  // Create Bookings
  const bookings: Booking[] = [];
  const bookingCount = 50; // Create 50 bookings
  
  for (let i = 0; i < bookingCount; i++) {
    const user = getRandomElement(users);
    const court = getRandomElement(courts);
    const timeSlot = generateTimeSlot();
    
    // Determine booking status
    let status: BookingStatus = BookingStatus.CONFIRMED;
    let paymentStatus: PaymentStatus = PaymentStatus.PAID;
    
    if (Math.random() < 0.1) status = BookingStatus.CANCELLED;
    else if (Math.random() < 0.05) status = BookingStatus.PENDING;
    else if (Math.random() < 0.1) status = BookingStatus.COMPLETED;
    
    if (status === BookingStatus.PENDING) paymentStatus = PaymentStatus.UNPAID;
    if (status === BookingStatus.CANCELLED) paymentStatus = PaymentStatus.REFUNDED;
    
    const totalAmount = timeSlot.hours * Number(court.pricePerHour);
    
    const booking = await prisma.booking.create({
      data: {
        userId: user.id,
        courtId: court.id,
        startsAt: timeSlot.startsAt,
        endsAt: timeSlot.endsAt,
        hours: timeSlot.hours,
        unitPrice: court.pricePerHour,
        totalAmount: totalAmount,
        status,
        paymentStatus,
      },
    });
    
    // Create payment record if booking is paid
    if (paymentStatus === PaymentStatus.PAID || paymentStatus === PaymentStatus.REFUNDED) {
      await prisma.payment.create({
        data: {
          bookingId: booking.id,
          provider: PaymentProvider.RAZORPAY,
          providerOrderId: `order_${booking.id.slice(-10)}`,
          providerPaymentId: paymentStatus === PaymentStatus.PAID ? `pay_${booking.id.slice(-10)}` : null,
          amount: totalAmount,
          currency: "INR",
          status: paymentStatus === PaymentStatus.PAID ? PaymentProviderStatus.CAPTURED : PaymentProviderStatus.REFUNDED,
        },
      });
    }
    
    bookings.push(booking);
  }
  console.log(`✅ Created ${bookings.length} bookings with payments`);

  // Create Reviews
  const reviewCount = 30;
  const createdReviews = new Set();
  
  for (let i = 0; i < reviewCount; i++) {
    const user = getRandomElement(users);
    const facility = getRandomElement(facilities.filter(f => f.status === FacilityStatus.APPROVED));
    const reviewKey = `${user.id}-${facility.id}`;
    
    // Ensure one review per user per facility
    if (createdReviews.has(reviewKey)) continue;
    
    const rating = Math.floor(Math.random() * 2) + 4; // 4-5 stars mostly
    const comments = [
      "Great facility with excellent courts and staff!",
      "Clean and well-maintained. Highly recommended.",
      "Good value for money. Will visit again.",
      "Professional setup with modern amenities.",
      "Enjoyed playing here. Good booking experience.",
      "Courts are in excellent condition.",
      "Staff is very helpful and courteous.",
    ];
    
    await prisma.review.create({
      data: {
        facilityId: facility.id,
        userId: user.id,
        rating,
        comment: Math.random() > 0.3 ? getRandomElement(comments) : null,
      },
    });
    
    createdReviews.add(reviewKey);
  }
  console.log(`✅ Created ${createdReviews.size} reviews`);

  // Create some Court Unavailabilities
  for (let i = 0; i < 10; i++) {
    const court = getRandomElement(courts);
    const startDate = getRandomFutureDate(7);
    const endDate = new Date(startDate);
    endDate.setHours(startDate.getHours() + Math.floor(Math.random() * 4) + 1); // 1-4 hours
    
    await prisma.courtUnavailability.create({
      data: {
        courtId: court.id,
        startsAt: startDate,
        endsAt: endDate,
        reason: 'MAINTENANCE',
      },
    });
  }
  console.log('✅ Created court unavailabilities');

  // Create some Audit Logs
  for (let i = 0; i < 20; i++) {
    const actor = Math.random() > 0.5 ? admin : getRandomElement(facilityOwners);
    const actions = ['CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT'];
    const entities = ['USER', 'FACILITY', 'BOOKING', 'PAYMENT'];
    
    await prisma.auditLog.create({
      data: {
        actorUserId: actor.id,
        action: getRandomElement(actions),
        entityType: getRandomElement(entities),
        entityId: getRandomElement([...users, ...facilities, ...bookings]).id,
        metadata: {
          timestamp: new Date().toISOString(),
          changes: { status: 'updated' },
        },
      },
    });
  }
  console.log('✅ Created audit logs');

  // Summary
  const summary = await Promise.all([
    prisma.user.count(),
    prisma.facility.count(),
    prisma.court.count(),
    prisma.booking.count(),
    prisma.payment.count(),
    prisma.review.count(),
    prisma.sport.count(),
  ]);

  console.log('\n📊 Database Seeding Complete!');
  console.log('==================================');
  console.log(`👥 Users: ${summary[0]}`);
  console.log(`🏢 Facilities: ${summary[1]}`);
  console.log(`🏟️  Courts: ${summary[2]}`);
  console.log(`📅 Bookings: ${summary[3]}`);
  console.log(`💳 Payments: ${summary[4]}`);
  console.log(`⭐ Reviews: ${summary[5]}`);
  console.log(`🏃 Sports: ${summary[6]}`);
  console.log('==================================');
  console.log('\n🔑 Test Credentials:');
  console.log('Admin: admin@quickcourt.com / admin123');
  console.log('Users: [any user email] / password123');
  console.log('Owners: [any owner email] / owner123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    //@ts-ignore
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
