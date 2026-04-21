import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from '../config/database.js';
import { Breed } from '../models/index.js';

// Load environment variables
dotenv.config();

// Resolve path to classes.json located at repoRoot/model/classes.json
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const classesPath = path.resolve(__dirname, '../../../model/classes.json');

// Known buffalo breeds (use class names exactly as in classes.json)
const BUFFALO_SET = new Set([
  'Bhadawari',
  'Jaffrabadi',
  'Mehsana',
  'Murrah',
  'Nili_Ravi',
  'Surti',
  'Nagpuri',
  'Banni'
]);

// Master Data Map: Combines Origin, Location, Description, Traits, and Characteristics
const BREED_DATA = {
  // --- CATTLE BREEDS ---
  Gir: {
    origin: 'Gujarat, India',
    location: { lat: 21.13, lng: 70.80, region: 'Gir Forest, Gujarat' },
    description: 'The Gir is a famous Indian dairy cattle breed, native to the Gir hills and forests of Kathiawar. Known for its distinctive convex forehead and long, pendulous ears. It is highly resistant to tropical diseases and heat.',
    traits: ['Dairy breed', 'Heat tolerant', 'Disease resistant', 'Docile'],
    characteristics: { size: 'medium', color: ['Red', 'Speckled Red', 'White'], horns: 'Curved back and down' }
  },
  Kankrej: {
    origin: 'Gujarat, India',
    location: { lat: 24.17, lng: 71.95, region: 'Banaskantha, Gujarat' },
    description: 'One of the heaviest Indian breeds, the Kankrej is valued for both milk and draught power. They have massive, lyre-shaped horns and a powerful gait known as "Sawai Chal".',
    traits: ['Dual-purpose', 'Strong draught power', 'Heat tolerant', 'Active'],
    characteristics: { size: 'large', color: ['Silver-grey', 'Iron-grey', 'Black'], horns: 'Large, lyre-shaped' }
  },
  Sahiwal: {
    origin: 'Punjab (India/Pakistan)',
    location: { lat: 30.66, lng: 73.11, region: 'Sahiwal District, Punjab' },
    description: 'The Sahiwal is considered one of the best dairy breeds in India and Pakistan. It is known for high milk yield with high butterfat content and excellent heat tolerance.',
    traits: ['Dairy breed', 'High milk yield', 'Tick resistant', 'Heat tolerant'],
    characteristics: { size: 'medium', color: ['Reddish Dun', 'Pale Red'], horns: 'Short and thick' }
  },
  Red_Sindhi: {
    origin: 'Sindh (Pakistan)',
    location: { lat: 25.39, lng: 68.35, region: 'Hyderabad, Sindh' },
    description: 'Similar to Sahiwal but smaller, the Red Sindhi is a hardy dairy breed. It is extremely adaptable to different climates and resistant to common cattle diseases.',
    traits: ['Dairy breed', 'Heat adapted', 'Disease resistant', 'Hardy'],
    characteristics: { size: 'small', color: ['Deep Red'], horns: 'Short and curved' }
  },
  Tharparkar: {
    origin: 'Rajasthan, India',
    location: { lat: 24.74, lng: 69.80, region: 'Tharparkar District' },
    description: 'Also known as "White Sindhi", this breed is native to the Thar Desert. It is a dual-purpose breed known for its ability to thrive on poor quality forage and withstand extreme heat.',
    traits: ['Dual-purpose', 'Drought tolerant', 'Disease resistant', 'Hardy'],
    characteristics: { size: 'medium', color: ['White', 'Grey'], horns: 'Medium, curved' }
  },
  Hariana: {
    origin: 'Haryana, India',
    location: { lat: 29.05, lng: 76.08, region: 'Rohtak, Haryana' },
    description: 'The Hariana is a prominent dual-purpose breed from Northern India. Bullocks are excellent for field work, and cows are fair milkers.',
    traits: ['Dual-purpose', 'Strong draught', 'Active'],
    characteristics: { size: 'large', color: ['White', 'Light Grey'], horns: 'Short and fine' }
  },
  Hallikar: {
    origin: 'Karnataka, India',
    location: { lat: 12.29, lng: 76.63, region: 'Mysore, Karnataka' },
    description: 'Native to the Mysore region, Hallikar cattle are the progenitors of the Amritmahal breed. They are best known for their draught capacity and trotting ability.',
    traits: ['Draught breed', 'Endurance', 'Fast trotter'],
    characteristics: { size: 'medium', color: ['Grey', 'Dark Grey'], horns: 'Long, vertical and backward' }
  },
  Amritmahal: {
    origin: 'Karnataka, India',
    location: { lat: 13.55, lng: 75.78, region: 'Chikmagalur, Karnataka' },
    description: 'Developed by the rulers of Mysore for warfare and transport, Amritmahal cattle are famous for their speed and endurance. They are fiery and active.',
    traits: ['Draught breed', 'High endurance', 'Active', 'Fiery temperament'],
    characteristics: { size: 'medium', color: ['Grey', 'White'], horns: 'Long, sharp, close together' }
  },
  Ongole: {
    origin: 'Andhra Pradesh, India',
    location: { lat: 15.50, lng: 80.04, region: 'Ongole, Andhra Pradesh' },
    description: 'A large, muscular breed known internationally (as Nellore in Brazil). They are excellent for heavy draught work and are resistant to Foot and Mouth Disease.',
    traits: ['Dual-purpose', 'Heavy draught', 'Disease resistant', 'Heat tolerant'],
    characteristics: { size: 'large', color: ['White', 'Grey'], horns: 'Short and stumpy' }
  },
  Krishna_Valley: {
    origin: 'Karnataka, India',
    location: { lat: 16.16, lng: 74.83, region: 'Krishna River Basin' },
    description: 'A heavy draught breed found along the banks of the Krishna River. They are powerful animals used for ploughing in black cotton soil.',
    traits: ['Draught breed', 'Powerful', 'Heavy worker'],
    characteristics: { size: 'large', color: ['Grey', 'White'], horns: 'Small and curved' }
  },
  Deoni: {
    origin: 'Maharashtra, India',
    location: { lat: 18.40, lng: 77.08, region: 'Latur, Maharashtra' },
    description: 'Resembling the Gir in head shape, the Deoni is a dual-purpose breed. It is well-suited for the rocky terrain of the Deccan plateau.',
    traits: ['Dual-purpose', 'Hardy', 'Good milker'],
    characteristics: { size: 'medium', color: ['Spotted Black & White'], horns: 'Medium, lateral' }
  },
  Khillari: {
    origin: 'Maharashtra, India',
    location: { lat: 17.65, lng: 75.90, region: 'Solapur, Maharashtra' },
    description: 'A fast-paced draught breed known for its ability to work without fatigue. They are spirited and require firm handling.',
    traits: ['Draught breed', 'Fast worker', 'Spirited', 'Hardy'],
    characteristics: { size: 'medium', color: ['Greyish White'], horns: 'Long, pointed, forward' }
  },
  Kangayam: {
    origin: 'Tamil Nadu, India',
    location: { lat: 11.01, lng: 77.55, region: 'Kangayam, Tamil Nadu' },
    description: 'A sturdy draught breed from Tamil Nadu. They are known for their compact body and ability to thrive on poor fodder.',
    traits: ['Draught breed', 'Hardy', 'Low maintenance'],
    characteristics: { size: 'medium', color: ['Grey', 'White'], horns: 'Stout and curved' }
  },
  Rathi: {
    origin: 'Rajasthan, India',
    location: { lat: 28.02, lng: 73.31, region: 'Bikaner, Rajasthan' }, // Added location
    description: 'An important dual-purpose breed of the arid Rajasthan region. It is a good milker and hardy worker.',
    traits: ['Dual-purpose', 'Heat tolerant', 'Good milker'],
    characteristics: { size: 'medium', color: ['Brown', 'White', 'Black spots'], horns: 'Short' }
  },
  Dangi: {
    origin: 'Maharashtra, India',
    location: { lat: 20.00, lng: 73.78, region: 'Nashik, Maharashtra' }, // Added location
    description: 'Native to the hilly rainfall areas of the Western Ghats. Their skin secretes an oil that protects them from heavy rain.',
    traits: ['Draught breed', 'Rain tolerant', 'Hardy'],
    characteristics: { size: 'medium', color: ['Red & White spots', 'Black & White spots'], horns: 'Short and thick' }
  },
  Vechur: {
    origin: 'Kerala, India',
    location: { lat: 9.59, lng: 76.52, region: 'Kottayam, Kerala' }, // Added location
    description: 'The world\'s smallest cattle breed. Native to Kerala, they are extremely resistant to diseases and require very little food.',
    traits: ['Miniature breed', 'Disease resistant', 'Low maintenance', 'Heat tolerant'],
    characteristics: { size: 'small', color: ['Light Red', 'Black', 'White'], horns: 'Small' }
  },
  Holstein_Friesian: {
    origin: 'Netherlands/Germany',
    location: { lat: 53.16, lng: 5.78, region: 'Friesland, Netherlands' },
    description: 'The world\'s highest-production dairy animal. Known for its distinctive black and white markings and outstanding milk yield.',
    traits: ['Dairy breed', 'Very high milk yield', 'Large frame'],
    characteristics: { size: 'large', color: ['Black & White'], horns: 'Short (often polled)' }
  },
  Jersey: {
    origin: 'Channel Islands',
    location: { lat: 49.21, lng: -2.13, region: 'Jersey, Channel Islands' },
    description: 'A small dairy breed known for the high butterfat content of its milk. They are efficient converters of feed to milk and have a docile temperament.',
    traits: ['Dairy breed', 'High butterfat', 'Efficient', 'Docile'],
    characteristics: { size: 'small', color: ['Fawn', 'Cream', 'Light Brown'], horns: 'Small and curved' }
  },
  Brown_Swiss: {
    origin: 'Switzerland',
    location: { lat: 47.05, lng: 8.30, region: 'Schwyz, Switzerland' },
    description: 'One of the oldest dairy breeds, known for their longevity, strong legs, and good cheese-making milk.',
    traits: ['Dairy breed', 'Longevity', 'Strong constitution'],
    characteristics: { size: 'large', color: ['Brown', 'Grey-Brown'], horns: 'Short and white' }
  },
  Guernsey: {
    origin: 'Channel Islands',
    location: { lat: 49.44, lng: -2.58, region: 'Guernsey, Channel Islands' },
    description: 'Produces "Golden Guernsey" milk, rich in beta-carotene. They are docile and efficient producers.',
    traits: ['Dairy breed', 'High butterfat', 'Golden milk', 'Docile'],
    characteristics: { size: 'medium', color: ['Fawn & White'], horns: 'Medium curved' }
  },
  Ayrshire: {
    origin: 'Scotland',
    location: { lat: 55.45, lng: -4.63, region: 'Ayrshire, Scotland' },
    description: 'A hardy dairy breed from Scotland, known for its ability to forage in rugged terrain and produce milk with good protein/fat balance.',
    traits: ['Dairy breed', 'Hardy', 'Efficient forager'],
    characteristics: { size: 'medium', color: ['Red & White'], horns: 'Lyre-shaped' }
  },
  Red_Dane: {
    origin: 'Denmark',
    location: { lat: 56.26, lng: 9.50, region: 'Denmark' },
    description: 'A Danish dairy breed known for high milk production and good fertility.',
    traits: ['Dairy breed', 'High yield', 'Fertile'],
    characteristics: { size: 'large', color: ['Red'], horns: 'Short' }
  },
  // Additional breeds from classes.json (41 total)
  Alambadi: {
    origin: 'Tamil Nadu, India',
    location: { lat: 11.1271, lng: 78.6569, region: 'Tamil Nadu' },
    description: 'Alambadi is a draught breed from Tamil Nadu, known for its endurance. Derived from Hallikar.',
    traits: ['Drought', 'Hardy', 'Workable'],
    characteristics: { size: 'medium', color: ['grey', 'white'], horns: 'lyre-shaped' }
  },
  Bargur: {
    origin: 'Tamil Nadu, India',
    location: { lat: 11.6643, lng: 78.1455, region: 'Tamil Nadu' },
    description: 'Bargur is a draught breed from Tamil Nadu, known for stamina and hill work capability.',
    traits: ['Drought', 'Hardy', 'Mountain capable'],
    characteristics: { size: 'medium', color: ['brown', 'grey'], horns: 'short' }
  },
  Kasargod: {
    origin: 'Karnataka, India',
    location: { lat: 12.5000, lng: 74.9000, region: 'Karnataka Coast' },
    description: 'Kasargod is a cattle breed from Karnataka coastal region, tolerant to humid climate.',
    traits: ['Humidity tolerant', 'Drought'],
    characteristics: { size: 'small', color: ['grey', 'brown'], horns: 'short' }
  },
  Kenkatha: {
    origin: 'Uttar Pradesh, India',
    location: { lat: 25.3176, lng: 82.9739, region: 'Bundelkhand, UP' },
    description: 'Kenkatha is a draught breed from UP and MP. Found in Bundelkhand region.',
    traits: ['Drought', 'Hardy', 'Workable'],
    characteristics: { size: 'medium', color: ['grey', 'white'], horns: 'short' }
  },
  Kherigarh: {
    origin: 'Uttar Pradesh, India',
    location: { lat: 27.2046, lng: 77.4977, region: 'UP' },
    description: 'Kherigarh is a draught breed from UP with white or light grey color.',
    traits: ['Drought', 'Compact'],
    characteristics: { size: 'medium', color: ['white', 'grey'], horns: 'short' }
  },
  Malnad_gidda: {
    origin: 'Karnataka, India',
    location: { lat: 13.5782, lng: 75.3630, region: 'Malnad, Karnataka' },
    description: 'Malnad Gidda is a cattle breed from Karnataka Malnad region, known for black coat.',
    traits: ['Dairy', 'Rainfall tolerant'],
    characteristics: { size: 'medium', color: ['black'], horns: 'short' }
  },
  Nagori: {
    origin: 'Rajasthan, India',
    location: { lat: 27.0238, lng: 74.2179, region: 'Rajasthan' },
    description: 'Nagori is a draught breed from Rajasthan with grey white color and long horns.',
    traits: ['Drought', 'Fast', 'Stamina'],
    characteristics: { size: 'medium', color: ['grey', 'white'], horns: 'long' }
  },
  Nimari: {
    origin: 'Madhya Pradesh, India',
    location: { lat: 23.4735, lng: 77.7510, region: 'Madhya Pradesh' },
    description: 'Nimari is a draught breed from MP with white/grey and red markings.',
    traits: ['Drought', 'Strong'],
    characteristics: { size: 'medium', color: ['white', 'grey', 'red'], horns: 'short' }
  },
  Pulikulam: {
    origin: 'Tamil Nadu, India',
    location: { lat: 10.7905, lng: 78.6855, region: 'Tamil Nadu' },
    description: 'Pulikulam is a draught breed from Tamil Nadu with compact build.',
    traits: ['Drought', 'Compact'],
    characteristics: { size: 'small', color: ['grey', 'brown'], horns: 'lyre-shaped' }
  },
  Umblachery: {
    origin: 'Tamil Nadu, India',
    location: { lat: 10.7905, lng: 79.8498, region: 'Tamil Nadu' },
    description: 'Umblachery is a draught breed from Tamil Nadu used for agricultural work.',
    traits: ['Drought', 'Strong', 'Workable'],
    characteristics: { size: 'medium', color: ['grey', 'white'], horns: 'lyre-shaped' }
  },
  Banni: {
    origin: 'Gujarat, India',
    location: { lat: 23.5226, lng: 68.8898, region: 'Kutch, Gujarat' },
    description: 'Banni is a buffalo breed from Gujarat known for black coat and twisted horns.',
    traits: ['Dairy', 'High fat milk'],
    characteristics: { size: 'large', color: ['black'], horns: 'twisted' }
  },

  // --- BUFFALO BREEDS ---
  Murrah: {
    origin: 'Haryana, India',
    location: { lat: 29.14, lng: 76.45, region: 'Jind, Haryana' },
    description: 'The "Black Gold" of India. Murrah is the premier milking buffalo breed, known for its tightly curled horns and high milk production.',
    traits: ['Dairy breed', 'High milk yield', 'High butterfat'],
    characteristics: { size: 'large', color: ['Jet Black'], horns: 'Tightly curled' }
  },
  Mehsana: {
    origin: 'Gujarat, India',
    location: { lat: 23.58, lng: 72.36, region: 'Mehsana, Gujarat' },
    description: 'Developed from a cross between Murrah and Surti. They are persistent milkers and have a longer lactation period.',
    traits: ['Dairy breed', 'Persistent milker', 'Docile'],
    characteristics: { size: 'medium', color: ['Black', 'Grey'], horns: 'Curved, less curled than Murrah' }
  },
  Jaffrabadi: {
    origin: 'Gujarat, India',
    location: { lat: 20.86, lng: 71.37, region: 'Jaffrabad, Gujarat' },
    description: 'The heaviest Indian buffalo breed. They have massive, drooping horns and are excellent converters of roughage.',
    traits: ['Dairy breed', 'Large frame', 'High butterfat'],
    characteristics: { size: 'large', color: ['Black'], horns: 'Heavy, drooping' }
  },
  Surti: {
    origin: 'Gujarat, India',
    location: { lat: 22.30, lng: 73.18, region: 'Vadodara, Gujarat' },
    description: 'A medium-sized buffalo breed known for its sickle-shaped horns. They are economical producers for small farmers.',
    traits: ['Dairy breed', 'Economical', 'Heat tolerant'],
    characteristics: { size: 'medium', color: ['Black', 'Brown'], horns: 'Sickle-shaped' }
  },
  Nili_Ravi: {
    origin: 'Punjab (India/Pakistan)',
    location: { lat: 31.05, lng: 73.65, region: 'Lahore/Sahiwal' },
    description: 'Known as "Panch Kalyani" due to white markings on forehead, face, muzzle, and legs. Excellent milk producers.',
    traits: ['Dairy breed', 'High yield', 'Distinctive markings'],
    characteristics: { size: 'large', color: ['Black with white markings'], horns: 'Small, tightly curled' }
  },
  Bhadawari: {
    origin: 'Uttar Pradesh, India',
    location: { lat: 26.77, lng: 78.73, region: 'Etawah, Uttar Pradesh' },
    description: 'Famous for the highest butterfat content (up to 13%) in its milk. They are copper-colored and heat tolerant.',
    traits: ['Dairy breed', 'Highest butterfat', 'Heat tolerant'],
    characteristics: { size: 'medium', color: ['Copper', 'Light Brown'], horns: 'Flat, curved' }
  },
  Nagpuri: {
    origin: 'Maharashtra, India',
    location: { lat: 21.14, lng: 79.08, region: 'Nagpur, Maharashtra' },
    description: 'Also known as Ellichpuri. They are adapted to the harsh climate of Central India and have long, sword-shaped horns.',
    traits: ['Dual-purpose', 'Hardy', 'Heat tolerant'],
    characteristics: { size: 'medium', color: ['Black'], horns: 'Long, sword-shaped' }
  },
  Toda: {
    origin: 'Tamil Nadu, India',
    location: { lat: 11.40, lng: 76.73, region: 'Nilgiris, Tamil Nadu' },
    description: 'A semi-wild breed reared by the Toda tribe in the Nilgiris. They are fierce and known for their gregarious nature.',
    traits: ['Social/Cultural importance', 'Hardy', 'Fierce'],
    characteristics: { size: 'medium', color: ['Fawn', 'Ash-grey'], horns: 'Wide, curved' }
  },
  Pandharpuri: {
    origin: 'Maharashtra, India',
    location: { lat: 17.67, lng: 75.32, region: 'Pandharpur, Maharashtra' },
    description: 'Named after the town Pandharpur. They have very long, sword-like horns that can reach up to 45-50cm.',
    traits: ['Dairy breed', 'Hardy', 'Reproductive efficiency'],
    characteristics: { size: 'medium', color: ['Black'], horns: 'Very long, sword-shaped' }
  }
};

const seedBreeds = async () => {
  try {
    console.log('Reading classes from:', classesPath);
    const classesRaw = await fs.readFile(classesPath, 'utf-8');
    const classesObj = JSON.parse(classesRaw);

    // Handle both array and object formats
    const classes = Array.isArray(classesObj) 
      ? classesObj 
      : Object.values(classesObj);

    if (!Array.isArray(classes) || classes.length === 0) {
      throw new Error('classes.json is empty or invalid');
    }

    console.log(`Found ${classes.length} breeds`);

    console.log('Connecting to database...');
    await connectDB();

    console.log('Clearing existing breed data...');
    await Breed.deleteMany({});

    console.log('Preparing breed data...');
    const breedsData = classes.map((cls) => {
      const isBuffalo = BUFFALO_SET.has(cls);
      const species = isBuffalo ? 'buffalo' : 'cattle';
      
      // Get enriched data or fallback
      const enriched = BREED_DATA[cls] || {};
      
      // Handle missing data gracefully
      const origin = enriched.origin || 'India';
      const description = enriched.description || `Recognized ${species} breed.`;
      const traits = enriched.traits || [];
      const characteristics = enriched.characteristics || { size: 'medium', color: [], horns: 'present' };
      const location = enriched.location || null;

      return {
        name: cls,
        species,
        origin,
        description,
        traits,
        characteristics,
        location,
        isActive: true
      };
    });

    console.log('Seeding breed data...');
    const createdBreeds = await Breed.insertMany(breedsData);

    console.log(`✅ Successfully seeded ${createdBreeds.length} breeds with enriched data.`);
    
    // Validate a few entries
    const sample = createdBreeds.find(b => b.name === 'Gir');
    if (sample) {
      console.log('\nSample Entry (Gir):');
      console.log(`- Origin: ${sample.origin}`);
      console.log(`- Location: ${JSON.stringify(sample.location)}`);
      console.log(`- Traits: ${sample.traits.join(', ')}`);
    }

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