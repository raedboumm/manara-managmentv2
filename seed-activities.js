const mongoose = require('mongoose');
const Activity = require('./models/Activity');
require('dotenv').config();

const activities = [
  // Makkah Activities (15)
  {
    name: 'Perform Umrah',
    description: 'Complete the sacred pilgrimage rituals of Tawaf and Sa\'i',
    city: 'Makkah'
  },
  {
    name: 'Pray in Mataf',
    description: 'Special prayer in the Mataf area around the Kaaba',
    city: 'Makkah'
  },
  {
    name: 'Visit Cave Hira',
    description: 'Visit the cave where Prophet Muhammad (PBUH) received the first revelation',
    city: 'Makkah'
  },
  {
    name: 'Visit Cave Thawr',
    description: 'Visit the cave where the Prophet (PBUH) took refuge during migration',
    city: 'Makkah'
  },
  {
    name: 'Visit Makkah Museum',
    description: 'Explore Islamic history and heritage at the Makkah Museum',
    city: 'Makkah'
  },
  {
    name: 'Visit Kiswa Factory',
    description: 'See the making of the Kaaba\'s covering cloth',
    city: 'Makkah'
  },
  {
    name: 'Visit Mina, Arafat, and Muzdalifah',
    description: 'Tour the sacred sites of Hajj pilgrimage',
    city: 'Makkah'
  },
  {
    name: 'Visit Clock Tower Museum',
    description: 'Explore the museum at the iconic Abraj Al Bait Clock Tower',
    city: 'Makkah'
  },
  {
    name: 'Visit Jannat al-Mu\'alla',
    description: 'Visit the historic cemetery where many companions are buried',
    city: 'Makkah'
  },
  {
    name: 'Learn about Zamzam Water',
    description: 'Learn the history and significance of the blessed Zamzam well',
    city: 'Makkah'
  },
  {
    name: 'Shop at Souq Al-Khalil',
    description: 'Traditional market shopping near the Haram',
    city: 'Makkah'
  },
  {
    name: 'Visit Masjid al-Jin',
    description: 'Visit the mosque where the Prophet (PBUH) preached to the jinn',
    city: 'Makkah'
  },
  {
    name: 'Visit Aisha Mosque (Masjid Taneem)',
    description: 'The miqat point where pilgrims enter ihram for Umrah',
    city: 'Makkah'
  },
  {
    name: 'Dine at Clock Tower',
    description: 'Enjoy halal dining with a view at the Clock Tower restaurants',
    city: 'Makkah'
  },
  {
    name: 'Visit Two Holy Mosques Exhibition',
    description: 'Learn about the architecture and expansion of the Two Holy Mosques',
    city: 'Makkah'
  },

  // Madinah Activities (10+)
  {
    name: 'Pray in Rawdah',
    description: 'Pray in the blessed garden (Rawdah) between the Prophet\'s pulpit and grave',
    city: 'Madinah'
  },
  {
    name: 'Give Salutation at Prophet\'s Grave',
    description: 'Pay respects at the grave of Prophet Muhammad (PBUH)',
    city: 'Madinah'
  },
  {
    name: 'Visit Masjid al-Quba',
    description: 'Visit the first mosque built in Islam',
    city: 'Madinah'
  },
  {
    name: 'Visit Mount Uhud',
    description: 'Visit the site of the historic Battle of Uhud',
    city: 'Madinah'
  },
  {
    name: 'Visit Masjid al-Qiblatayn',
    description: 'Visit the mosque where the qiblah direction was changed',
    city: 'Madinah'
  },
  {
    name: 'Visit Jannat al-Baqi',
    description: 'Visit the cemetery where many companions are buried',
    city: 'Madinah'
  },
  {
    name: 'Visit Prophet\'s Biography Museum',
    description: 'Learn about the life of Prophet Muhammad (PBUH)',
    city: 'Madinah'
  },
  {
    name: 'Visit Seven Mosques',
    description: 'Visit the seven historic mosques near Mount Uhud',
    city: 'Madinah'
  },
  {
    name: 'Visit Dar Al Madinah Museum',
    description: 'Explore the history and heritage of Madinah',
    city: 'Madinah'
  },
  {
    name: 'Date Shopping at Local Markets',
    description: 'Shop for famous Madinah dates at local markets',
    city: 'Madinah'
  },
  {
    name: 'Walk Quba Walking Trail',
    description: 'Follow the path the Prophet (PBUH) walked to Quba Mosque',
    city: 'Madinah'
  },
  {
    name: 'Visit Date Palm Grove',
    description: 'Tour the historic date palm farms of Madinah',
    city: 'Madinah'
  },
  {
    name: 'Visit Masjid al-Ghamama',
    description: 'Visit the mosque where the Prophet (PBUH) prayed for rain',
    city: 'Madinah'
  },
  {
    name: 'Visit Qur\'an Printing Complex',
    description: 'Tour the King Fahd Complex for printing the Holy Qur\'an',
    city: 'Madinah'
  },
  {
    name: 'Evening Walk at Piazza',
    description: 'Enjoy the beautiful evening atmosphere at the Prophet\'s Mosque piazza',
    city: 'Madinah'
  }
];

async function seedActivities() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/manar-management');
    console.log('Connected to MongoDB');

    // Clear existing activities (optional - comment out if you want to keep existing ones)
    // await Activity.deleteMany({});
    // console.log('Cleared existing activities');

    // Check which activities already exist
    const existingActivities = await Activity.find({});
    const existingNames = existingActivities.map(a => a.name);
    
    // Filter out activities that already exist
    const newActivities = activities.filter(a => !existingNames.includes(a.name));
    
    if (newActivities.length === 0) {
      console.log('All activities already exist in the database');
    } else {
      // Insert new activities
      const result = await Activity.insertMany(newActivities);
      console.log(`✅ Successfully added ${result.length} activities`);
      console.log(`📊 Total activities in database: ${existingActivities.length + result.length}`);
    }

    // Display summary
    const makkahCount = await Activity.countDocuments({ city: 'Makkah' });
    const madinahCount = await Activity.countDocuments({ city: 'Madinah' });
    console.log(`\n📍 Makkah activities: ${makkahCount}`);
    console.log(`📍 Madinah activities: ${madinahCount}`);
    console.log(`📍 Total: ${makkahCount + madinahCount}`);

    mongoose.connection.close();
    console.log('\n✅ Database seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    mongoose.connection.close();
    process.exit(1);
  }
}

seedActivities();
