const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Message = require('./models/Message');
const CollaborationRequest = require('./models/CollaborationRequest');
const Deal = require('./models/Deal');
const Document = require('./models/Document');
const Notification = require('./models/Notification');

dotenv.config();

const seedData = async () => {
  // Clear existing data
  await User.deleteMany({});
  await Message.deleteMany({});
  await CollaborationRequest.deleteMany({});
  await Deal.deleteMany({});
  await Document.deleteMany({});
  await Notification.deleteMany({});
  console.log('Cleared existing data.');

  // ------ USERS ------
  const entrepreneursData = [
    {
      name: 'Sarah Johnson',
      email: 'sarah@techwave.io',
      password: 'password123',
      role: 'entrepreneur',
      avatarUrl: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
      bio: 'Serial entrepreneur with 10+ years of experience in SaaS and fintech.',
      startupName: 'TechWave AI',
      pitchSummary: 'AI-powered financial analytics platform helping SMBs make data-driven decisions.',
      fundingNeeded: '$1.5M',
      industry: 'FinTech',
      location: 'San Francisco, CA',
      foundedYear: 2021,
      teamSize: 12,
      isOnline: true
    },
    {
      name: 'David Chen',
      email: 'david@greenlife.co',
      password: 'password123',
      role: 'entrepreneur',
      avatarUrl: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg',
      bio: 'Environmental scientist turned entrepreneur. Passionate about sustainable solutions.',
      startupName: 'GreenLife Solutions',
      pitchSummary: 'Biodegradable packaging alternatives for consumer goods and food industry.',
      fundingNeeded: '$2M',
      industry: 'CleanTech',
      location: 'Portland, OR',
      foundedYear: 2020,
      teamSize: 8,
      isOnline: false
    },
    {
      name: 'Maya Patel',
      email: 'maya@healthpulse.com',
      password: 'password123',
      role: 'entrepreneur',
      avatarUrl: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg',
      bio: 'Former healthcare professional with an MBA. Building tech to improve patient care.',
      startupName: 'HealthPulse',
      pitchSummary: 'Mobile platform connecting patients with mental health professionals in real-time.',
      fundingNeeded: '$800K',
      industry: 'HealthTech',
      location: 'Boston, MA',
      foundedYear: 2022,
      teamSize: 5,
      isOnline: true
    },
    {
      name: 'James Wilson',
      email: 'james@urbanfarm.io',
      password: 'password123',
      role: 'entrepreneur',
      avatarUrl: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
      bio: 'Agricultural engineer focused on urban farming solutions and food security.',
      startupName: 'UrbanFarm',
      pitchSummary: 'IoT-enabled vertical farming systems for urban environments and food deserts.',
      fundingNeeded: '$3M',
      industry: 'AgTech',
      location: 'Chicago, IL',
      foundedYear: 2019,
      teamSize: 14,
      isOnline: false
    }
  ];

  const investorsData = [
    {
      name: 'Michael Rodriguez',
      email: 'michael@vcinnovate.com',
      password: 'password123',
      role: 'investor',
      avatarUrl: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg',
      bio: 'Early-stage investor with focus on B2B SaaS and fintech. Previously founded and exited two startups.',
      investmentInterests: ['FinTech', 'SaaS', 'AI/ML'],
      investmentStage: ['Seed', 'Series A'],
      portfolioCompanies: ['PayStream', 'DataSense', 'CloudSecure'],
      totalInvestments: 12,
      minimumInvestment: '$250K',
      maximumInvestment: '$1.5M',
      isOnline: true
    },
    {
      name: 'Jennifer Lee',
      email: 'jennifer@impactvc.org',
      password: 'password123',
      role: 'investor',
      avatarUrl: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg',
      bio: 'Impact investor focused on climate tech, sustainable agriculture, and clean energy.',
      investmentInterests: ['CleanTech', 'AgTech', 'Sustainability'],
      investmentStage: ['Seed', 'Series A', 'Series B'],
      portfolioCompanies: ['SolarFlow', 'EcoPackage', 'CleanWater Solutions'],
      totalInvestments: 18,
      minimumInvestment: '$500K',
      maximumInvestment: '$3M',
      isOnline: false
    },
    {
      name: 'Robert Torres',
      email: 'robert@healthventures.com',
      password: 'password123',
      role: 'investor',
      avatarUrl: 'https://images.pexels.com/photos/834863/pexels-photo-834863.jpeg',
      bio: 'Healthcare-focused investor with medical background. Looking for innovations in patient care and biotech.',
      investmentInterests: ['HealthTech', 'BioTech', 'Medical Devices'],
      investmentStage: ['Series A', 'Series B'],
      portfolioCompanies: ['MediTrack', 'BioGenics', 'Patient+'],
      totalInvestments: 9,
      minimumInvestment: '$1M',
      maximumInvestment: '$5M',
      isOnline: true
    }
  ];

  const entrepreneurs = await User.create(entrepreneursData);
  const investors = await User.create(investorsData);
  console.log(`Created ${entrepreneurs.length} entrepreneurs and ${investors.length} investors.`);

  // ------ MESSAGES ------
  const messagesData = [
    { senderId: entrepreneurs[0]._id, receiverId: investors[0]._id, content: 'Thanks for connecting. Id love to discuss how our AI platform can revolutionize financial analytics for SMBs.', isRead: true },
    { senderId: investors[0]._id, receiverId: entrepreneurs[0]._id, content: 'Im interested in learning more about your tech stack and ML models. Are you available for a call this week?', isRead: true },
    { senderId: entrepreneurs[0]._id, receiverId: investors[0]._id, content: 'Absolutely! I can walk you through our technology and current traction. How does Thursday at 2pm PT work?', isRead: true },
    { senderId: investors[0]._id, receiverId: entrepreneurs[0]._id, content: 'Thursday works great. Ill send a calendar invite. Looking forward to it!', isRead: false },
    { senderId: investors[1]._id, receiverId: entrepreneurs[2]._id, content: 'I saw your pitch for HealthPulse and Im intrigued by your approach to mental healthcare accessibility.', isRead: true },
    { senderId: entrepreneurs[2]._id, receiverId: investors[1]._id, content: 'Thank you, Jennifer! Mental health services need to be more accessible, especially in underserved communities.', isRead: true },
    { senderId: investors[1]._id, receiverId: entrepreneurs[2]._id, content: 'I completely agree. Could you share more about your user acquisition strategy and current metrics?', isRead: false },
    { senderId: entrepreneurs[1]._id, receiverId: investors[2]._id, content: 'Hello Robert, I noticed you invest in healthcare. While GreenLife is focused on sustainable packaging, we have some applications in medical supplies.', isRead: true },
    { senderId: investors[2]._id, receiverId: entrepreneurs[1]._id, content: 'Interesting crossover, David. Id be interested in learning more about your biodegradable materials and how they could be used in healthcare.', isRead: true },
    { senderId: entrepreneurs[1]._id, receiverId: investors[2]._id, content: 'Great! Weve been developing materials that can safely package medical devices while being eco-friendly. Our tests show 40% less environmental impact.', isRead: false }
  ];

  await Message.create(messagesData);
  console.log(`Created ${messagesData.length} messages.`);

  // ------ COLLABORATION REQUESTS ------
  const collabData = [
    { investorId: investors[0]._id, entrepreneurId: entrepreneurs[0]._id, message: 'Id like to explore potential investment in TechWave AI. Your AI-driven financial analytics platform aligns well with my investment thesis.', status: 'pending' },
    { investorId: investors[1]._id, entrepreneurId: entrepreneurs[0]._id, message: 'Interested in discussing how TechWave AI can incorporate sustainable practices. Lets connect to explore potential collaboration.', status: 'accepted' },
    { investorId: investors[2]._id, entrepreneurId: entrepreneurs[2]._id, message: 'Your HealthPulse platform addresses a critical need in mental healthcare. Id like to learn more about your traction and roadmap.', status: 'pending' },
    { investorId: investors[1]._id, entrepreneurId: entrepreneurs[1]._id, message: 'GreenLifes biodegradable packaging solutions align with my focus on sustainable investments. Lets discuss scaling possibilities.', status: 'accepted' },
    { investorId: investors[0]._id, entrepreneurId: entrepreneurs[3]._id, message: 'Your UrbanFarm concept is fascinating. Im interested in learning more about your IoT implementation and market validation.', status: 'rejected' }
  ];

  await CollaborationRequest.create(collabData);
  console.log(`Created ${collabData.length} collaboration requests.`);

  // ------ DEALS ------
  const dealsData = [
    { startup: { name: 'TechWave AI', logo: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg', industry: 'FinTech' }, investorId: investors[0]._id, entrepreneurId: entrepreneurs[0]._id, amount: '$1.5M', equity: '15%', status: 'Due Diligence', stage: 'Series A' },
    { startup: { name: 'GreenLife Solutions', logo: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg', industry: 'CleanTech' }, investorId: investors[1]._id, entrepreneurId: entrepreneurs[1]._id, amount: '$2M', equity: '20%', status: 'Term Sheet', stage: 'Seed' },
    { startup: { name: 'HealthPulse', logo: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg', industry: 'HealthTech' }, investorId: investors[2]._id, entrepreneurId: entrepreneurs[2]._id, amount: '$800K', equity: '12%', status: 'Negotiation', stage: 'Pre-seed' }
  ];

  await Deal.create(dealsData);
  console.log(`Created ${dealsData.length} deals.`);

  // ------ DOCUMENTS ------
  const docsData = [
    { name: 'Pitch Deck 2024.pdf', type: 'PDF', size: '2.4 MB', shared: true, ownerId: entrepreneurs[0]._id },
    { name: 'Financial Projections.xlsx', type: 'Spreadsheet', size: '1.8 MB', shared: false, ownerId: entrepreneurs[0]._id },
    { name: 'Business Plan.docx', type: 'Document', size: '3.2 MB', shared: true, ownerId: entrepreneurs[1]._id },
    { name: 'Market Research.pdf', type: 'PDF', size: '5.1 MB', shared: false, ownerId: entrepreneurs[2]._id }
  ];

  await Document.create(docsData);
  console.log(`Created ${docsData.length} documents.`);

  // ------ NOTIFICATIONS ------
  const notifsData = [
    { userId: entrepreneurs[0]._id, type: 'message', fromUser: investors[0]._id, content: 'sent you a message about your startup', unread: true },
    { userId: entrepreneurs[0]._id, type: 'connection', fromUser: investors[0]._id, content: 'accepted your connection request', unread: true },
    { userId: entrepreneurs[0]._id, type: 'investment', fromUser: investors[1]._id, content: 'showed interest in investing in your startup', unread: false }
  ];

  await Notification.create(notifsData);
  console.log(`Created ${notifsData.length} notifications.`);

  console.log('\n✅ Database seeded successfully!');
  console.log('\nDemo accounts (password: password123):');
  console.log('  Entrepreneurs: sarah@techwave.io, david@greenlife.co, maya@healthpulse.com, james@urbanfarm.io');
  console.log('  Investors: michael@vcinnovate.com, jennifer@impactvc.org, robert@healthventures.com');
};

// Run standalone if called directly
if (require.main === module) {
  (async () => {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('MongoDB connected for seeding...');
      await seedData();
      process.exit(0);
    } catch (error) {
      console.error('Seeding error:', error);
      process.exit(1);
    }
  })();
}

module.exports = { seedData };
