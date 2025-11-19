import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from '../config/database.js';
import { Breed } from '../models/index.js';

// Load environment variables
dotenv.config();

// Resolve path to classes.json located at repoRoot/pytorch/classes.json
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const classesPath = path.resolve(__dirname, '../../../pytorch/classes.json');

// Known buffalo breeds (use class names exactly as in classes.json)
const BUFFALO_SET = new Set([
  'Bhadawari',
  'Jaffrabadi',
  'Mehsana',
  'Murrah',
  'Nili_Ravi',
  'Surti',
  'Nagpuri'
]);

// Optional origin overrides for better accuracy; defaults to 'India' otherwise
const ORIGIN_MAP = {
  Ayrshire: 'Scotland',
  Guernsey: 'Channel Islands',
  Brown_Swiss: 'Switzerland',
  Jersey: 'Channel Islands',
  Red_Dane: 'Denmark',
  Holstein_Friesian: 'Netherlands/Germany',
  Nili_Ravi: 'Punjab (India/Pakistan)',
  Jaffrabadi: 'Gujarat, India',
  Murrah: 'Haryana, India',
  Mehsana: 'Gujarat, India',
  Surti: 'Gujarat, India',
  Nagpuri: 'Maharashtra, India',
  Gir: 'Gujarat, India',
  Kankrej: 'Gujarat, India',
  Sahiwal: 'Punjab (India/Pakistan)',
  Red_Sindhi: 'Sindh (Pakistan)',
  Tharparkar: 'Rajasthan, India',
  Hariana: 'Haryana, India'
};

// Optional detailed overrides for traits and characteristics
// Note: Keep keys exactly matching classes.json entries
const OVERRIDES = {
  Gir: {
    description: 'Renowned Indian zebu dairy breed known for heat tolerance and disease resistance.',
    traits: ['Dairy breed', 'Heat tolerant', 'Disease resistant', 'Docile'],
    characteristics: { size: 'medium', color: [], horns: 'present' }
  },
  Kankrej: {
    description: 'Dual-purpose Indian breed valued for milk and draught power.',
    traits: ['Dual-purpose', 'Hardy', 'Heat tolerant'],
    characteristics: { size: 'large', color: [], horns: 'present' }
  },
  Sahiwal: {
    description: 'High-yielding zebu dairy breed adapted to hot climates.',
    traits: ['Dairy breed', 'Heat tolerant', 'Tick resistant'],
    characteristics: { size: 'medium', color: [], horns: 'present' }
  },
  Red_Sindhi: {
    description: 'Red-coated dairy zebu noted for adaptation and longevity.',
    traits: ['Dairy breed', 'Heat adapted', 'Disease resistant'],
    characteristics: { size: 'medium', color: [], horns: 'present' }
  },
  Tharparkar: {
    description: 'Dual-purpose desert-adapted zebu breed from Rajasthan.',
    traits: ['Dual-purpose', 'Drought tolerant', 'Hardy'],
    characteristics: { size: 'medium', color: [], horns: 'present' }
  },
  Hariana: {
    description: 'Northern Indian zebu breed used for draught and milk.',
    traits: ['Dual-purpose', 'Hardy'],
    characteristics: { size: 'large', color: [], horns: 'present' }
  },
  Hallikar: {
    description: 'South Indian draught zebu known for endurance.',
    traits: ['Strong draught', 'Hardy'],
    characteristics: { size: 'medium', color: [], horns: 'present' }
  },
  Murrah: {
    description: 'Premier Indian dairy buffalo with high butterfat milk.',
    traits: ['Dairy breed', 'High milk fat'],
    characteristics: { size: 'large', color: [], horns: 'present' }
  },
  Mehsana: {
    description: 'Composite Indian dairy buffalo breed known for good milk.',
    traits: ['Dairy breed', 'Adaptable'],
    characteristics: { size: 'medium', color: [], horns: 'present' }
  },
  Jaffrabadi: {
    description: 'Massive Indian buffalo breed with strong frame.',
    traits: ['Large frame', 'Good milk production'],
    characteristics: { size: 'large', color: [], horns: 'present' }
  },
  Surti: {
    description: 'Medium-sized Indian buffalo with steady milk yield.',
    traits: ['Dairy breed', 'Heat tolerant'],
    characteristics: { size: 'medium', color: [], horns: 'present' }
  },
  Nili_Ravi: {
    description: 'High-yield dairy buffalo from the Punjab region.',
    traits: ['Dairy breed', 'Good fertility'],
    characteristics: { size: 'large', color: [], horns: 'present' }
  },
  Holstein_Friesian: {
    description: 'Global high-yield dairy cattle breed.',
    traits: ['Very high milk production'],
    characteristics: { size: 'large', color: [], horns: 'present' }
  },
  Jersey: {
    description: 'Jersey dairy breed known for rich milk.',
    traits: ['High milk fat', 'Efficient grazer'],
    characteristics: { size: 'small', color: [], horns: 'present' }
  },
  Brown_Swiss: {
    description: 'Sturdy dairy breed with good temperament.',
    traits: ['Dairy breed', 'Hardy'],
    characteristics: { size: 'large', color: [], horns: 'present' }
  },
  Guernsey: {
    description: 'Channel Island dairy breed noted for golden milk.',
    traits: ['High milk fat', 'Docile'],
    characteristics: { size: 'medium', color: [], horns: 'present' }
  },
  Ayrshire: {
    description: 'Scottish dairy breed with balanced production.',
    traits: ['Dairy breed', 'Robust'],
    characteristics: { size: 'medium', color: [], horns: 'present' }
  },
  Vechur: {
    description: 'Small indigenous cattle breed from Kerala.',
    traits: ['Small size', 'Adapted to humid climates'],
    characteristics: { size: 'small', color: [], horns: 'present' }
  },
  Ongole: {
    description: 'Indian zebu known internationally as Nellore.',
    traits: ['Hardy', 'Draught power'],
    characteristics: { size: 'large', color: [], horns: 'present' }
  },
  Rathi: {
    description: 'Indian dual-purpose breed from Rajasthan.',
    traits: ['Dual-purpose', 'Heat tolerant'],
    characteristics: { size: 'medium', color: [], horns: 'present' }
  },
  Khillari: {
    description: 'Deccan plateau draught breed with endurance.',
    traits: ['Strong draught', 'Hardy'],
    characteristics: { size: 'medium', color: [], horns: 'present' }
  },
  Kangayam: {
    description: 'Tamil Nadu draught breed with good adaptation.',
    traits: ['Strong draught', 'Heat tolerant'],
    characteristics: { size: 'medium', color: [], horns: 'present' }
  },
  Deoni: {
    description: 'Dual-purpose Indian breed with good milk and draught.',
    traits: ['Dual-purpose', 'Hardy'],
    characteristics: { size: 'medium', color: [], horns: 'present' }
  },
  Dangi: {
    description: 'Western Indian breed adapted to heavy rainfall regions.',
    traits: ['Hardy', 'Good for draught'],
    characteristics: { size: 'medium', color: [], horns: 'present' }
  },
  Bhadawari: {
    description: 'Indian buffalo known for high milk fat content.',
    traits: ['High milk fat', 'Dairy breed'],
    characteristics: { size: 'medium', color: [], horns: 'present' }
  },
  Nagpuri: {
    description: 'Buffalo breed from Maharashtra adapted to arid conditions.',
    traits: ['Adaptable', 'Dairy potential'],
    characteristics: { size: 'large', color: [], horns: 'present' }
  }
};

const seedBreeds = async () => {
  try {
    console.log('Reading classes from:', classesPath);
    const classesRaw = await fs.readFile(classesPath, 'utf-8');
    const classes = JSON.parse(classesRaw);

    if (!Array.isArray(classes) || classes.length === 0) {
      throw new Error('classes.json is empty or invalid');
    }

    // Build seed array strictly from classes.json
    const breedsData = classes.map((cls) => {
      const species = BUFFALO_SET.has(cls) ? 'buffalo' : 'cattle';
      const origin = ORIGIN_MAP[cls] || 'India';
      const base = {
        name: cls, // Keep exact class name (underscores) to match model output
        species,
        origin,
        description: `Recognized ${species} breed.`,
        isActive: true
      };
      const extra = OVERRIDES[cls] || {};
      // Merge characteristics carefully to preserve object shape
      const merged = {
        ...base,
        ...(extra.description ? { description: extra.description } : {}),
        ...(Array.isArray(extra.traits) ? { traits: extra.traits } : {}),
        ...(extra.characteristics ? { characteristics: {
          size: extra.characteristics.size || null,
          color: Array.isArray(extra.characteristics.color) ? extra.characteristics.color : [],
          horns: extra.characteristics.horns || null
        }} : {})
      };
      return merged;
    });

    console.log('Connecting to database...');
    await connectDB();

    console.log('Clearing existing breed data...');
    await Breed.deleteMany({});

    console.log('Seeding breed data from classes.json...');
    const createdBreeds = await Breed.insertMany(breedsData);

    console.log(`✅ Successfully seeded ${createdBreeds.length} breeds`);
    console.log('Breeds seeded (name -> species):');
    createdBreeds.forEach((breed) => {
      console.log(`  - ${breed.name} -> ${breed.species}`);
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