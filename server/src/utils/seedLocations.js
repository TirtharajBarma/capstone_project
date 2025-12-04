import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Breed } from '../models/index.js';

dotenv.config();

const breedLocations = [
  { name: 'Gir', lat: 21.13, lng: 70.80, region: 'Gujarat, India' }, // Gir Forest
  { name: 'Red Sindhi', lat: 25.39, lng: 68.35, region: 'Sindh, Pakistan' }, // Hyderabad, Sindh
  { name: 'Sahiwal', lat: 30.66, lng: 73.11, region: 'Punjab, Pakistan' }, // Sahiwal District
  { name: 'Hallikar', lat: 12.29, lng: 76.63, region: 'Karnataka, India' }, // Mysore
  { name: 'Amritmahal', lat: 13.55, lng: 75.78, region: 'Karnataka, India' }, // Chikmagalur
  { name: 'Khillari', lat: 17.65, lng: 75.90, region: 'Maharashtra, India' }, // Solapur
  { name: 'Kangayam', lat: 11.01, lng: 77.55, region: 'Tamil Nadu, India' }, // Kangayam
  { name: 'Hariana', lat: 29.05, lng: 76.08, region: 'Haryana, India' }, // Rohtak
  { name: 'Tharparkar', lat: 24.74, lng: 69.80, region: 'Sindh, Pakistan' }, // Tharparkar
  { name: 'Kankrej', lat: 24.17, lng: 71.95, region: 'Gujarat, India' }, // Banaskantha
  { name: 'Ongole', lat: 15.50, lng: 80.04, region: 'Andhra Pradesh, India' }, // Ongole
  { name: 'Krishna Valley', lat: 16.16, lng: 74.83, region: 'Karnataka, India' }, // Krishna River basin
  { name: 'Deoni', lat: 18.40, lng: 77.08, region: 'Maharashtra, India' }, // Latur
  { name: 'Murrah', lat: 29.14, lng: 76.45, region: 'Haryana, India' }, // Jind (Home of Murrah)
  { name: 'Surti', lat: 22.30, lng: 73.18, region: 'Gujarat, India' }, // Vadodara/Kaira
  { name: 'Jaffarabadi', lat: 20.86, lng: 71.37, region: 'Gujarat, India' }, // Jaffrabad
  { name: 'Nili-Ravi', lat: 31.05, lng: 73.65, region: 'Punjab, Pakistan' }, // Lahore/Sahiwal
  { name: 'Mehsana', lat: 23.58, lng: 72.36, region: 'Gujarat, India' }, // Mehsana
  { name: 'Bhadawari', lat: 26.77, lng: 78.73, region: 'Uttar Pradesh, India' }, // Etawah/Agra
  { name: 'Nagpuri', lat: 21.14, lng: 79.08, region: 'Maharashtra, India' }, // Nagpur
  { name: 'Toda', lat: 11.40, lng: 76.73, region: 'Tamil Nadu, India' }, // Nilgiris
  { name: 'Pandharpuri', lat: 17.67, lng: 75.32, region: 'Maharashtra, India' }, // Pandharpur
  { name: 'Ayrshire', lat: 55.45, lng: -4.63, region: 'Ayrshire, Scotland' },
  { name: 'Jersey', lat: 49.21, lng: -2.13, region: 'Jersey, Channel Islands' },
  { name: 'Holstein Friesian', lat: 53.16, lng: 5.78, region: 'Friesland, Netherlands' },
  { name: 'Brown Swiss', lat: 47.05, lng: 8.30, region: 'Schwyz, Switzerland' },
  { name: 'Guernsey', lat: 49.44, lng: -2.58, region: 'Guernsey, Channel Islands' }
];

const seedLocations = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    let updatedCount = 0;

    for (const loc of breedLocations) {
      // Try to find by exact name first
      let breed = await Breed.findOne({ name: new RegExp(`^${loc.name}$`, 'i') });
      
      // If not found, try to match partial name (e.g. "Krishna_Valley" vs "Krishna Valley")
      if (!breed) {
        const normalized = loc.name.replace(/ /g, '_');
        breed = await Breed.findOne({ name: new RegExp(`^${normalized}$`, 'i') });
      }

      if (breed) {
        breed.location = {
          lat: loc.lat,
          lng: loc.lng,
          region: loc.region
        };
        await breed.save();
        console.log(`Updated location for ${breed.name}`);
        updatedCount++;
      } else {
        console.log(`Breed not found: ${loc.name}`);
      }
    }

    console.log(`\nSuccessfully updated ${updatedCount} breeds.`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding locations:', error);
    process.exit(1);
  }
};

seedLocations();
