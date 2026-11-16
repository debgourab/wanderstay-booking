/**
 * WanderStay - Resort, Suite Tier, Tour Add-On & Promo Code Dataset (ES6+)
 * Author: Deb Gourab Biswas
 */

const WANDERSTAY_RESORTS = [
  {
    id: "RES-GOA",
    name: "Azure Palms Beachfront Resort",
    location: "South Goa, India",
    category: "Beach",
    rating: 4.9,
    baseRateINR: 8500,
    tagline: "Private white-sand beach access, infinity pool & sunset cabana lounge.",
    amenities: ["Private Beach", "Infinity Pool", "Sea-View Spa", "Complimentary Breakfast"],
    image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "RES-MANALI",
    name: "Himalayan Cedar Alpine Chalet",
    location: "Manali, Himachal Pradesh",
    category: "Mountain",
    rating: 4.8,
    baseRateINR: 7200,
    tagline: "Heated timber chalets overlooking snow-clad Dhauladhar peaks & apple orchards.",
    amenities: ["Mountain View Deck", "Fireplace", "Heated Indoor Pool", "Bonfire Nights"],
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "RES-UDAIPUR",
    name: "Rajputana Lakefront Heritage Palace",
    location: "Udaipur, Rajasthan",
    category: "Heritage",
    rating: 4.95,
    baseRateINR: 12500,
    tagline: "18th-century royal courtyard suites with private shikara boat arrival.",
    amenities: ["Lake Pichola View", "Royal Butler", "Heritage Walk", "Fine Dining Courtyard"],
    image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "RES-KERALA",
    name: "Emerald Backwater Lagoon Retreat",
    location: "Alleppey, Kerala",
    category: "Wildlife",
    rating: 4.85,
    baseRateINR: 9200,
    tagline: "Luxury over-water cottages & private houseboat cruises amidst coconut groves.",
    amenities: ["Backwater Cruise", "Ayurvedic Spa", "Organic Seafood", "Kayaking"],
    image: "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "RES-DARJEELING",
    name: "Glenburn Mist Tea Estate Bungalow",
    location: "Darjeeling, West Bengal",
    category: "Mountain",
    rating: 4.9,
    baseRateINR: 7800,
    tagline: "Colonial planter bungalows with panoramic Kanchenjunga sunrise views & tea tasting.",
    amenities: ["Kanchenjunga View", "Tea Tasting Tour", "Gourmet Bakery", "Guided Trails"],
    image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "RES-SUNDARBAN",
    name: "Sundarban Mangrove Eco-Luxury Lodge",
    location: "Sundarbans, West Bengal",
    category: "Wildlife",
    rating: 4.75,
    baseRateINR: 6400,
    tagline: "Sustainable riverfront cottages with guided delta boat safaris & folk music.",
    amenities: ["Boat Safari", "Eco Cottages", "Watchtower View", "Bengali Cuisine"],
    image: "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=900&q=80"
  }
];

const WANDERSTAY_ROOM_TIERS = [
  {
    id: "TIER-DELUXE",
    name: "Deluxe Garden Suite",
    multiplier: 1.0,
    sqft: "420 sq.ft",
    bed: "1 King Bed",
    perks: "High-speed Wi-Fi, Welcome Drink & Morning Breakfast Buffet"
  },
  {
    id: "TIER-PREMIER",
    name: "Premier Panorama Villa",
    multiplier: 1.35,
    sqft: "680 sq.ft",
    bed: "1 King Bed + Daybed",
    perks: "Private Balcony, Jacuzzi Tub, Evening High-Tea & Priority Check-In"
  },
  {
    id: "TIER-PRESIDENTIAL",
    name: "Presidential Royal Pool Suite",
    multiplier: 1.85,
    sqft: "1,150 sq.ft",
    bed: "2 King Bedrooms + Private Plunge Pool",
    perks: "Private Plunge Pool, 24/7 Butler Service & Complimentary Airport Chauffeur"
  }
];

const WANDERSTAY_TOUR_ADDONS = [
  {
    id: "ADD-TRANSFER",
    name: "Private Chauffeur Airport / Station Transfer",
    priceINR: 2400,
    billingType: "flat",
    icon: "bi-car-front-fill",
    desc: "Round-trip luxury SUV pickup and drop-off."
  },
  {
    id: "ADD-DINING",
    name: "All-Inclusive Gourmet Half-Board Dining",
    priceINR: 1800,
    billingType: "perNight",
    icon: "bi-cup-hot-fill",
    desc: "Chef's curated multi-course dinner & beverages every night."
  },
  {
    id: "ADD-TOUR",
    name: "Guided Local Heritage & Nature Expedition",
    priceINR: 3500,
    billingType: "flat",
    icon: "bi-binoculars-fill",
    desc: "Full-day private guided sightseeing tour with photography stops."
  },
  {
    id: "ADD-SPA",
    name: "Holistic Couple's Ayurvedic Spa & Wellness",
    priceINR: 4200,
    billingType: "flat",
    icon: "bi-flower1",
    desc: "90-minute aromatherapy massage, steam & herbal bath session."
  }
];

const WANDERSTAY_PROMO_CODES = {
  WANDER20: {
    code: "WANDER20",
    type: "percent",
    value: 20,
    minSubtotalINR: 10000,
    description: "20% Off on Resort & Tour Subtotal"
  },
  FIRST50: {
    code: "FIRST50",
    type: "flat",
    value: 5000,
    minSubtotalINR: 20000,
    description: "Flat ₹5,000 Off on bookings above ₹20,000"
  },
  FESTIVE15: {
    code: "FESTIVE15",
    type: "percent",
    value: 15,
    minSubtotalINR: 8000,
    description: "15% Seasonal Holiday Discount"
  }
};
