import type { Cafe } from '@/types';
import { calculateScore } from './scoring';
import { NA_RAW_CAFES } from './seed-na';
import { EU_RAW_CAFES } from './seed-europe';
import { ASIA_RAW_CAFES } from './seed-asia';
import { LATAM_RAW_CAFES } from './seed-latam';
import { AFRICA_RAW_CAFES } from './seed-africa';
import { OCEANIA_RAW_CAFES } from './seed-oceania';

const rawCafes: Omit<Cafe, 'id' | 'created_at' | 'third_wave_score' | 'overall_rating' | 'review_count' | 'permanently_closed'>[] = [];

const allRawCafes = [...NA_RAW_CAFES, ...EU_RAW_CAFES, ...ASIA_RAW_CAFES, ...LATAM_RAW_CAFES, ...AFRICA_RAW_CAFES, ...OCEANIA_RAW_CAFES, ...rawCafes];

// Deterministic pseudo-random based on seed — avoids different values across Next.js build workers
function seededRandom(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

export const SEED_CAFES: Cafe[] = allRawCafes.map((cafe, index) => {
  const scoreBreakdown = calculateScore({
    roaster: cafe.roaster,
    brew_methods: cafe.brew_methods,
    vibe_tags: cafe.vibe_tags,
    featured_in: cafe.featured_in,
    community_upvotes: 0,
  });
  return {
    ...cafe,
    id: `cafe-${index + 1}`,
    created_at: new Date().toISOString(),
    third_wave_score: scoreBreakdown.total,
    overall_rating: parseFloat((4.2 + seededRandom(index) * 0.7).toFixed(1)),
    review_count: 50 + Math.floor(seededRandom(index * 7 + 3) * 200),
    permanently_closed: false,
    flagged: false,
    sponsored: false,
  };
});

export const SEED_CITIES = [
  { id: 'city-1', name: 'Tokyo', country: 'Japan', lat: 35.6762, lng: 139.6503, slug: 'tokyo', cafe_count: 20, city_blurb: 'Tokyo has elevated coffee into an art form — precision brewing, flawless service, and a density of world-class cafés that rivals any city on earth.' },
  { id: 'city-2', name: 'Copenhagen', country: 'Denmark', lat: 55.6761, lng: 12.5683, slug: 'copenhagen', cafe_count: 11, city_blurb: 'Scandinavia\'s coffee capital leads Europe on sourcing ethics and light-roast technique — every cup here feels considered.' },
  { id: 'city-3', name: 'Melbourne', country: 'Australia', lat: -37.8136, lng: 144.9631, slug: 'melbourne', cafe_count: 25, city_blurb: 'Melbourne\'s café culture is a civic institution — world-class flat whites and a roasting scene that exports talent globally.' },
  { id: 'city-4', name: 'New York City', country: 'United States', lat: 40.7128, lng: -74.0060, slug: 'new-york-city', cafe_count: 20, city_blurb: 'New York\'s specialty coffee scene is borough-by-borough diverse — Brooklyn leads on craft, Manhattan on volume, and the competition makes everyone better.' },
  { id: 'city-5', name: 'London', country: 'United Kingdom', lat: 51.5074, lng: -0.1278, slug: 'london', cafe_count: 18, city_blurb: 'London transformed from espresso-resistant to one of the world\'s most exciting coffee cities in a single decade — the east side is still the epicenter.' },
  { id: 'city-6', name: 'Montreal', country: 'Canada', lat: 45.5017, lng: -73.5673, slug: 'montreal', cafe_count: 12, city_blurb: 'Montreal\'s bilingual café culture and Québécois identity produce some of North America\'s most distinctive specialty shops.' },
  { id: 'city-7', name: 'Berlin', country: 'Germany', lat: 52.5200, lng: 13.4050, slug: 'berlin', cafe_count: 11, city_blurb: 'Berlin\'s third wave arrived with characteristic intensity — precise roasting, opinionated baristas, and spaces that double as cultural institutions.' },
  { id: 'city-8', name: 'Mexico City', country: 'Mexico', lat: 19.4326, lng: -99.1332, slug: 'mexico-city', cafe_count: 15, city_blurb: 'CDMX is rewriting what Mexican coffee means — local Oaxacan and Veracruz single-origins are finally getting the treatment they deserve.' },
  { id: 'city-9', name: 'Seoul', country: 'South Korea', lat: 37.5665, lng: 126.9780, slug: 'seoul', cafe_count: 15, city_blurb: 'Seoul\'s café density is unmatched anywhere — specialty coffee thrives alongside traditional tea culture and the aesthetics are always exceptional.' },
  { id: 'city-10', name: 'Cape Town', country: 'South Africa', lat: -33.9249, lng: 18.4241, slug: 'cape-town', cafe_count: 12, city_blurb: 'Cape Town\'s proximity to East African origins gives it an unfair advantage — roasters here work with some of the freshest beans on earth.' },
  { id: 'city-11', name: 'Buenos Aires', country: 'Argentina', lat: -34.6037, lng: -58.3816, slug: 'buenos-aires', cafe_count: 12, city_blurb: 'Buenos Aires is in the middle of a specialty coffee awakening — Palermo\'s independent roasteries are making the city\'s traditional café culture look again.' },
  { id: 'city-12', name: 'Portland', country: 'United States', lat: 45.5051, lng: -122.6750, slug: 'portland', cafe_count: 15, city_blurb: 'Portland\'s coffee heritage runs deep — this is where the American third wave started, and the roasting culture it built still sets global standards.' },
  { id: 'city-13', name: 'San Francisco', country: 'United States', lat: 37.7749, lng: -122.4194, slug: 'san-francisco', cafe_count: 15, city_blurb: 'San Francisco\'s specialty scene is as opinionated as the city itself — SOMA roasteries and Mission standing bars set the West Coast benchmark.' },
  { id: 'city-14', name: 'Chicago', country: 'United States', lat: 41.8781, lng: -87.6298, slug: 'chicago', cafe_count: 15, city_blurb: 'Chicago\'s third-wave story starts with Intelligentsia and keeps getting better — the West Loop and Wicker Park are now among America\'s most exciting coffee corridors.' },
  { id: 'city-15', name: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522, slug: 'paris', cafe_count: 15, city_blurb: 'Paris resisted specialty coffee and then embraced it completely — the 10th and 18th arrondissements are now home to some of Europe\'s most exciting new roasters.' },
  { id: 'city-16', name: 'Amsterdam', country: 'Netherlands', lat: 52.3676, lng: 4.9041, slug: 'amsterdam', cafe_count: 10, city_blurb: 'Amsterdam\'s canal-side café culture found a new gear when specialty roasters arrived — the Jordaan and Amsterdam West are the places to start.' },
  { id: 'city-17', name: 'Sydney', country: 'Australia', lat: -33.8688, lng: 151.2093, slug: 'sydney', cafe_count: 18, city_blurb: 'Sydney\'s Surry Hills is Australia\'s most concentrated specialty coffee district — three world-class roasteries within walking distance of each other.' },
  { id: 'city-18', name: 'Vienna', country: 'Austria', lat: 48.2082, lng: 16.3738, slug: 'vienna', cafe_count: 9, city_blurb: 'Vienna perfected café culture centuries ago and is now adding specialty precision to the tradition — the combination is unlike anywhere else in Europe.' },
  { id: 'city-19', name: 'Stockholm', country: 'Sweden', lat: 59.3293, lng: 18.0686, slug: 'stockholm', cafe_count: 9, city_blurb: 'Stockholm\'s Södermalm roasteries have shaped how all of Scandinavia thinks about light roasting and ethical sourcing — the world is still catching up.' },
  { id: 'city-20', name: 'Lisbon', country: 'Portugal', lat: 38.7169, lng: -9.1399, slug: 'lisbon', cafe_count: 10, city_blurb: 'Lisbon\'s specialty scene arrived late but moved fast — Chiado and Príncipe Real are now home to some of the most interesting cafés in southern Europe.' },
  { id: 'city-21', name: 'Barcelona', country: 'Spain', lat: 41.3851, lng: 2.1734, slug: 'barcelona', cafe_count: 11, city_blurb: 'Barcelona\'s specialty coffee scene is as design-conscious as the city itself — Poblenou\'s roasteries and El Born\'s bars are raising the bar for all of Spain.' },
  { id: 'city-22', name: 'Singapore', country: 'Singapore', lat: 1.3521, lng: 103.8198, slug: 'singapore', cafe_count: 12, city_blurb: 'Singapore\'s coffee culture runs from hawker-centre kopi to competition-level pour-overs — the specialty scene here is among Asia\'s most sophisticated.' },
  { id: 'city-23', name: 'Taipei', country: 'Taiwan', lat: 25.0330, lng: 121.5654, slug: 'taipei', cafe_count: 11, city_blurb: 'Taipei\'s barista talent and roasting culture are world-class — world competition champions run cafés here and the density of quality is quietly remarkable.' },
  { id: 'city-24', name: 'São Paulo', country: 'Brazil', lat: -23.5505, lng: -46.6333, slug: 'sao-paulo', cafe_count: 15, city_blurb: 'The world\'s largest coffee-producing country is finally drinking its own best beans — São Paulo\'s Vila Madalena and Pinheiros lead that transformation.' },
  { id: 'city-25', name: 'Istanbul', country: 'Turkey', lat: 41.0082, lng: 28.9784, slug: 'istanbul', cafe_count: 12, city_blurb: 'Istanbul\'s specialty scene sits at the crossroads of coffee history — Cihangir and Karaköy roasters are building something entirely new on ancient grounds.' },
  { id: 'city-26', name: 'Nairobi', country: 'Kenya', lat: -1.2921, lng: 36.8219, slug: 'nairobi', cafe_count: 11, city_blurb: 'Nairobi is the world\'s most exciting origin city for coffee — drinking single-farm Kenyan lots here, where they\'re grown and roasted, is irreplaceable.' },
  { id: 'city-27', name: 'Ho Chi Minh City', country: 'Vietnam', lat: 10.8231, lng: 106.6297, slug: 'ho-chi-minh-city', cafe_count: 9, city_blurb: 'Ho Chi Minh City has one of the world\'s oldest café cultures and is now adding specialty precision to it — District 1\'s third-wave scene is worth the trip alone.' },
  { id: 'city-28', name: 'Osaka', country: 'Japan', lat: 34.6937, lng: 135.5023, slug: 'osaka', cafe_count: 10, city_blurb: 'Osaka\'s coffee scene is Tokyo\'s more relaxed sibling — Kitahama and Namba have quietly built a specialty culture that rewards the traveler who looks beyond ramen.' },
  { id: 'city-29', name: 'Toronto', country: 'Canada', lat: 43.6532, lng: -79.3832, slug: 'toronto', cafe_count: 13, city_blurb: 'Toronto\'s specialty coffee scene has quietly become one of North America\'s most sophisticated — Pilot, Sam James, and a generation of independent roasters have built something world-class.' },
  { id: 'city-30', name: 'Vancouver', country: 'Canada', lat: 49.2827, lng: -123.1207, slug: 'vancouver', cafe_count: 13, city_blurb: 'Vancouver\'s Gastown and Mount Pleasant are home to some of Canada\'s finest roasters — Revolver, 49th Parallel, and Matchstick have made this a mandatory stop for serious coffee travelers.' },
  { id: 'city-31', name: 'Miami', country: 'United States', lat: 25.7617, lng: -80.1918, slug: 'miami', cafe_count: 6, city_blurb: 'Miami\'s specialty coffee scene is anchored by Panther Coffee\'s Wynwood roastery and growing fast — the Cuban coffee heritage and the new wave of third-wave cafés make an irresistible combination.' },
  { id: 'city-32', name: 'Los Angeles', country: 'United States', lat: 34.0522, lng: -118.2437, slug: 'los-angeles', cafe_count: 14, city_blurb: 'LA\'s specialty coffee scene sprawls as wide as the city itself — Go Get Em Tiger leads the pack, but Civil in Highland Park, Cognoscenti in Culver City, and a dozen others make the case that this is now a world-class coffee city.' },
  { id: 'city-33', name: 'Lima', country: 'Peru', lat: -12.0464, lng: -77.0428, slug: 'lima', cafe_count: 8, city_blurb: 'Lima is one of coffee\'s great untold stories — grown at some of the world\'s highest altitudes in Cajamarca and Amazonas, and finally being served with the reverence it deserves in Miraflores and Barranco.' },
  { id: 'city-34', name: 'Auckland', country: 'New Zealand', lat: -36.8485, lng: 174.7633, slug: 'auckland', cafe_count: 8, city_blurb: 'Auckland\'s specialty scene is built on export-quality roasting turned inward — Kokako, Allpress, Eighthirty, and a generation of independents have made this one of the Pacific\'s most serious coffee cities.' },
  { id: 'city-35', name: 'Wellington', country: 'New Zealand', lat: -41.2865, lng: 174.7762, slug: 'wellington', cafe_count: 7, city_blurb: 'Wellington is New Zealand\'s coffee capital — a small city with an outsized café culture, home to Coffee Supreme, Flight Coffee, People\'s Coffee, and Cuba Street\'s never-sleeping espresso scene.' },
];
