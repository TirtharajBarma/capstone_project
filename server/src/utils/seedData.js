import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import { Breed } from '../models/index.js';

// Load environment variables
dotenv.config();

// Sample breed data for Indian cattle and buffalo breeds
const breedsData = [
  // Cattle Breeds
  {
    name: 'Gir',
    species: 'cattle',
    origin: 'Gujarat, India',
    description: 'The Gir is one of the principal Zebu breeds originating in India. It is one of the most important milk producers and is also known for its disease resistance.',
    traits: ['High milk production', 'Disease resistant', 'Heat tolerant', 'Docile temperament'],
    milkYield: { average: 12, unit: 'liters/day' },
    characteristics: {
      size: 'medium',
      color: ['White', 'Red', 'Brown'],
      horns: 'present'
    }
  },
  {
    name: 'Holstein Friesian',
    species: 'cattle',
    origin: 'Europe (adapted in India)',
    description: 'Holstein Friesian cattle are a breed of dairy cattle originating from the Dutch provinces. They are known for their high milk production.',
    traits: ['Very high milk production', 'Large body size', 'Black and white markings'],
    milkYield: { average: 25, unit: 'liters/day' },
    characteristics: {
      size: 'large',
      color: ['Black', 'White'],
      horns: 'absent'
    }
  },
  {
    name: 'Sahiwal',
    species: 'cattle',
    origin: 'Punjab, Pakistan/India',
    description: 'Sahiwal is a breed of Zebu cattle which originated in the Sahiwal district of Punjab. They are excellent milk producers adapted to hot climates.',
    traits: ['Good milk production', 'Heat tolerant', 'Tick resistant', 'Easy calving'],
    milkYield: { average: 10, unit: 'liters/day' },
    characteristics: {
      size: 'medium',
      color: ['Light red', 'Reddish brown'],
      horns: 'present'
    }
  },
  {
    name: 'Red Sindhi',
    species: 'cattle',
    origin: 'Sindh (now Pakistan)',
    description: 'Red Sindhi is a dairy breed of Zebu cattle. They are heat tolerant and known for their reddish-brown color.',
    traits: ['Good milk production', 'Heat adaptation', 'Disease resistance'],
    milkYield: { average: 8, unit: 'liters/day' },
    characteristics: {
      size: 'medium',
      color: ['Red', 'Dark red'],
      horns: 'present'
    }
  },
  {
    name: 'Tharparkar',
    species: 'cattle',
    origin: 'Rajasthan, India',
    description: 'Tharparkar is a breed of Zebu cattle from the Thar Desert region. They are dual-purpose cattle known for milk production and drought tolerance.',
    traits: ['Drought tolerant', 'Dual purpose', 'Hardy breed'],
    milkYield: { average: 6, unit: 'liters/day' },
    characteristics: {
      size: 'medium',
      color: ['White', 'Light grey'],
      horns: 'present'
    }
  },
  {
    name: 'Haryana',
    species: 'cattle',
    origin: 'Haryana, India',
    description: 'Haryana cattle are a breed of Zebu cattle from Haryana state. They are primarily used for draft purposes but also produce milk.',
    traits: ['Good draught capacity', 'Hardy', 'Disease resistant'],
    milkYield: { average: 4, unit: 'liters/day' },
    characteristics: {
      size: 'large',
      color: ['White', 'Light grey'],
      horns: 'present'
    }
  },

  // Buffalo Breeds
  {
    name: 'Murrah',
    species: 'buffalo',
    origin: 'Haryana, India',
    description: 'Murrah buffalo is the most famous dairy buffalo breed of India. They are known for their high milk production and quality.',
    traits: ['Very high milk production', 'Rich milk quality', 'Long lactation period'],
    milkYield: { average: 15, unit: 'liters/day' },
    characteristics: {
      size: 'large',
      color: ['Black'],
      horns: 'present'
    }
  },
  {
    name: 'Jaffarabadi',
    species: 'buffalo',
    origin: 'Gujarat, India',
    description: 'Jaffarabadi is the heaviest buffalo breed of India. They are primarily raised for milk production and are known for their massive size.',
    traits: ['Large body size', 'Good milk production', 'Strong constitution'],
    milkYield: { average: 12, unit: 'liters/day' },
    characteristics: {
      size: 'large',
      color: ['Black'],
      horns: 'present'
    }
  },
  {
    name: 'Surti',
    species: 'buffalo',
    origin: 'Gujarat, India',
    description: 'Surti buffalo is a medium-sized buffalo breed known for good milk production. They are well adapted to the climate of Gujarat.',
    traits: ['Medium milk production', 'Good fertility', 'Heat tolerant'],
    milkYield: { average: 8, unit: 'liters/day' },
    characteristics: {
      size: 'medium',
      color: ['Black', 'Brown'],
      horns: 'present'
    }
  },
  {
    name: 'Mehsana',
    species: 'buffalo',
    origin: 'Gujarat, India',
    description: 'Mehsana buffalo is a synthetic breed developed in Gujarat. They are known for good milk production and adaptability.',
    traits: ['Good milk production', 'Adaptable', 'Long productive life'],
    milkYield: { average: 10, unit: 'liters/day' },
    characteristics: {
      size: 'medium',
      color: ['Black'],
      horns: 'present'
    }
  },
  {
    name: 'Nili-Ravi',
    species: 'buffalo',
    origin: 'Punjab, Pakistan/India',
    description: 'Nili-Ravi is a buffalo breed known for high milk production. They are characterized by their distinctive white markings.',
    traits: ['High milk production', 'Good fertility', 'White markings on face and legs'],
    milkYield: { average: 14, unit: 'liters/day' },
    characteristics: {
      size: 'large',
      color: ['Black with white markings'],
      horns: 'present'
    }
  }
];

const seedBreeds = async () => {
  try {
    console.log('Connecting to database...');
    await connectDB();

    console.log('Clearing existing breed data...');
    await Breed.deleteMany({});

    console.log('Seeding breed data...');
    const createdBreeds = await Breed.insertMany(breedsData);

    console.log(`✅ Successfully seeded ${createdBreeds.length} breeds`);
    console.log('Breeds seeded:');
    createdBreeds.forEach(breed => {
      console.log(`  - ${breed.name} (${breed.species})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedBreeds();
}

export default seedBreeds;