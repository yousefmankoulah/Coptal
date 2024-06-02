import axios from "axios";

export const getCoordinates = async (zipCode) => {
  try {
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/search`,
      {
        params: {
          country: "united states",
          postalcode: zipCode,
          format: "json",
          limit: 1,
        },
        headers: {
          "User-Agent": "YourAppName/1.0 (yourname@example.com)",
        },
      }
    );

    const data = response.data;
    if (data.length === 0) {
      throw new Error("No results found");
    }

    const { lat, lon } = data[0];
    return { latitude: parseFloat(lat), longitude: parseFloat(lon) };
  } catch (error) {
    console.error("Error fetching coordinates:", error.message);
    throw error;
  }
};

export const getDistance = (coord1, coord2) => {
  const R = 6371e3; // Radius of the Earth in meters
  const φ1 = coord1.latitude * (Math.PI / 180); // φ, λ in radians
  const φ2 = coord2.latitude * (Math.PI / 180);
  const Δφ = (coord2.latitude - coord1.latitude) * (Math.PI / 180);
  const Δλ = (coord2.longitude - coord1.longitude) * (Math.PI / 180);

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distanceInMeters = R * c; // Distance in meters
  const distanceInMiles = distanceInMeters / 1609.34; // Convert meters to miles

  return distanceInMiles;
};
