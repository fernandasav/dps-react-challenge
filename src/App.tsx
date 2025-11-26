import { useState, useEffect } from 'react';
import './App.css';

interface Locality {
  name: string;
  postalCode: string;
}

function App() {
  const [city, setCity] = useState('');
  const [plz, setPlz] = useState('');
  const [plzOptions, setPlzOptions] = useState<Locality[]>([]);
  const [error, setError] = useState('');

  const [cityTimer, setCityTimer] = useState<number | null>(null);
  const [plzTimer, setPlzTimer] = useState<number | null>(null);

  // Flags to track input origin
  const [isCityManual, setIsCityManual] = useState(false);
  const [isPlzManual, setIsPlzManual] = useState(false);
  const [isCityFromApi, setIsCityFromApi] = useState(false);
  const [isPlzFromApi, setIsPlzFromApi] = useState(false);


  // --- Fetch PLZ options based on city ---
  const fetchPlzByCity = async (cityName: string) => {
    try {
      const res = await fetch(
        `https://openplzapi.org/de/Localities?name=${cityName}`
      );
      const data: Locality[] = await res.json();

      // Match city exactly
      const exactMatches = data.filter(
        (item) => item.name.toLowerCase() === cityName.toLowerCase()
      );

      if (exactMatches.length === 0) {
        setError('City not found.');
        setPlzOptions([]);
      } else if (exactMatches.length === 1) {
        // Auto-fill PLZ when only one match exists
        setError('');
        if (!isPlzManual) {
          setPlz(exactMatches[0].postalCode);
          setIsPlzFromApi(true); // mark as API update
        }
        setPlzOptions([]);
      } else {
        // Show dropdown when multiple PLZ options exist
        setError('');
        setPlzOptions(exactMatches);
      }
    } catch (err) {
      console.error(err);
      setError('Error fetching city data.');
      setPlzOptions([]);
    }
  };

  // --- Fetch city based on PLZ ---
  const fetchCityByPlz = async (plzCode: string) => {
    if (plzCode.length !== 5) return; // only fetch valid PLZ

    try {
      const res = await fetch(
        `https://openplzapi.org/de/Localities?postalCode=${plzCode}`
      );
      const data: Locality[] = await res.json();

      if (data.length === 0) {
        setError('PLZ not found.');
      } else {
        // Auto-fill city if PLZ exists
        setError('');
        if (!isCityManual) {
          setCity(data[0].name);
          setIsCityFromApi(true); // mark as API update
        }
      }
    } catch (err) {
      console.error(err);
      setError('Error fetching PLZ data.');
    }
  };

  // --- Debounce city input logic ---
  useEffect(() => {
    // Do not run if city was updated by API
    if (isCityFromApi) {
      setIsCityFromApi(false);
      return;
    }

    if (cityTimer) clearTimeout(cityTimer);

    // Only fetch after user stops typing
    if (city.length > 2) {
      const timer = window.setTimeout(() => fetchPlzByCity(city), 1000);
      setCityTimer(timer);
    }

    return () => {
      if (cityTimer) clearTimeout(cityTimer);
    };
  }, [city]);

  // --- Debounce PLZ input logic ---
  useEffect(() => {
    // Do not run if PLZ was updated by API
    if (isPlzFromApi) {
      setIsPlzFromApi(false);
      return;
    }

    if (plzTimer) clearTimeout(plzTimer);

    // Fetch only when PLZ reaches 5 digits
    if (plz.length === 5) {
      const timer = window.setTimeout(() => fetchCityByPlz(plz), 1000);
      setPlzTimer(timer);
    }

    return () => {
      if (plzTimer) clearTimeout(plzTimer);
    };
  }, [plz]);

  // --- Handle PLZ selection when multiple exist ---
  const handlePlzSelect = (selectedPlz: string) => {
    setPlz(selectedPlz);

    // Fill city linked to selected PLZ
    const selectedCity = plzOptions.find((p) => p.postalCode === selectedPlz);
    if (selectedCity) setCity(selectedCity.name);

    // Clear dropdown
    setPlzOptions([]);
    setError('');

    // Reset flags because selection is user-confirmed
    setIsCityManual(false);
    setIsPlzManual(false);
    setIsCityFromApi(false);
    setIsPlzFromApi(false);
  };

  return (
    <div>
      <h2>Let's find your city or postal code in Germany</h2>

      <div>
        <label>Locality:</label>
        <input
          type="text"
          value={city}
          onChange={(e) => {
            setCity(e.target.value);
            setIsCityManual(true); // mark as manual typing
          }}
          placeholder="Enter city"
        />
      </div>

      <div>
        <label>Postal Code (PLZ):</label>
        {plzOptions.length > 1 ? (
          <select
            value={plz}
            onChange={(e) => handlePlzSelect(e.target.value)}
          >
            <option value="">Select PLZ</option>
            {plzOptions.map((p) => (
              <option key={p.postalCode} value={p.postalCode}>
                {p.postalCode}
              </option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            value={plz}
            onChange={(e) => {
              setPlz(e.target.value);
              setIsPlzManual(true); // mark as manual typing
            }}
            placeholder="Enter 5-digit PLZ"
            maxLength={5}
          />
        )}
      </div>

      <div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>
    </div>
  );
}

export default App;
