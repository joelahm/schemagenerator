import React, { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MapPin } from 'lucide-react';

// Extend Window interface for Google Maps
declare global {
  interface Window {
    google: any;
    initAutocomplete: () => void;
  }
}

const GooglePlacesAutocomplete = ({ 
  value, 
  onChange, 
  onPlaceSelect, 
  placeholder = "Enter address", 
  label = "Address", 
  //apiKey = 'AIzaSyB1SiZWgwVib7DCqkCHPFDySwewiOi4GgQ',
  apiKey = 'AIzaSyA8pdQ7GAaJWaH7ZY7t_OFlRQ8liwO3AUA',
  enableBusinessSearch = false 
}) => {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState('');
  const [searchMode, setSearchMode] = useState(enableBusinessSearch ? 'business' : 'address');
  const lastProcessedPlaceId = useRef(null);

  // Always use hardcoded API key
  //const HARDCODED_API_KEY = 'AIzaSyB1SiZWgwVib7DCqkCHPFDySwewiOi4GgQ';
  const HARDCODED_API_KEY = 'AIzaSyA8pdQ7GAaJWaH7ZY7t_OFlRQ8liwO3AUA';

  useEffect(() => {
    const loadGoogleMaps = async () => {
      try {
        // Check if Google Maps is already loaded
        if (window.google && window.google.maps && window.google.maps.places) {
          console.log('Google Maps already loaded');
          setIsLoaded(true);
          return;
        }

        // Check if script is already being loaded
        const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
        if (existingScript) {
          console.log('Google Maps script already exists, waiting for load...');
          // Wait for it to load
          const checkInterval = setInterval(() => {
            if (window.google && window.google.maps && window.google.maps.places) {
              console.log('Google Maps loaded from existing script');
              clearInterval(checkInterval);
              setIsLoaded(true);
            }
          }, 100);
          
          // Timeout after 10 seconds
          setTimeout(() => {
            clearInterval(checkInterval);
            if (!window.google || !window.google.maps || !window.google.maps.places) {
              setError('Failed to load Google Maps API');
            }
          }, 10000);
          return;
        }

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${HARDCODED_API_KEY}&libraries=places&callback=initAutocomplete`;
        script.async = true;
        script.defer = true;

        window.initAutocomplete = () => {
          console.log('Google Maps API loaded successfully');
          setIsLoaded(true);
        };

        script.onerror = () => {
          console.error('Failed to load Google Maps script');
          setError('Failed to load Google Maps API');
        };

        document.head.appendChild(script);
      } catch (err) {
        console.error('Error loading Google Maps:', err);
        setError('Error loading Google Maps API');
      }
    };

    loadGoogleMaps();
  }, []);

  // Enhanced place processing - always use Places Details API for complete data
  const processPlaceWithRetry = (place: any) => {
    if (!place?.place_id) {
      console.log('No place_id found');
      return;
    }

    // Avoid processing the same place multiple times
    if (lastProcessedPlaceId.current === place.place_id) {
      console.log('Place already processed, skipping');
      return;
    }

    console.log('Processing place:', place.place_id);
    lastProcessedPlaceId.current = place.place_id;

    // Always use Places Details API to ensure we get complete data
    if (window.google?.maps?.places?.PlacesService) {
      const service = new window.google.maps.places.PlacesService(document.createElement('div'));
      
      service.getDetails({
        placeId: place.place_id,
        fields: ['address_components', 'formatted_address', 'geometry', 'name', 'place_id', 'business_status', 'formatted_phone_number', 'website', 'rating', 'reviews', 'types', 'opening_hours']
      }, (detailedPlace, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && detailedPlace) {
          console.log('Got complete place data:', detailedPlace);
          onChange(detailedPlace.formatted_address || '');
          onPlaceSelect(detailedPlace);
        } else {
          console.log('Places Details API failed, using basic data');
          onChange(place.formatted_address || '');
          if (place.address_components || place.geometry) {
            onPlaceSelect(place);
          }
        }
      });
    } else {
      // Fallback if Places service not available
      onChange(place.formatted_address || '');
      onPlaceSelect(place);
    }
  };

  useEffect(() => {
    if (!isLoaded || !inputRef.current || !window.google) return;

    // Clean up existing autocomplete instance if it exists
    if (autocompleteRef.current && window.google) {
      window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      autocompleteRef.current = null;
    }

    try {
      const searchTypes = searchMode === 'business' ? ['establishment'] : ['address'];
      autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: searchTypes,
        fields: ['address_components', 'formatted_address', 'geometry', 'name', 'place_id', 'business_status', 'formatted_phone_number', 'website', 'rating', 'reviews', 'types', 'opening_hours']
      });

      // Main place_changed listener
      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current?.getPlace();
        console.log('place_changed event fired:', place);
        
        if (place) {
          processPlaceWithRetry(place);
        }
      });

      // Additional listeners for better coverage
      const handleManualSelection = () => {
        setTimeout(() => {
          const place = autocompleteRef.current?.getPlace();
          if (place && place.place_id !== lastProcessedPlaceId.current) {
            console.log('Manual selection detected:', place);
            processPlaceWithRetry(place);
          }
        }, 100);
      };

      // Listen for Enter key
      inputRef.current.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          setTimeout(handleManualSelection, 200);
        }
      });

      // Listen for blur (when user clicks away)
      inputRef.current.addEventListener('blur', () => {
        setTimeout(handleManualSelection, 100);
      });

    } catch (err) {
      setError('Error initializing autocomplete');
      console.error('Autocomplete initialization error:', err);
    }

    return () => {
      if (autocompleteRef.current && window.google) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
      
      // Clean up document event listener
      if (inputRef.current?._cleanup) {
        inputRef.current._cleanup();
      }
    };
  }, [isLoaded, onChange, onPlaceSelect, searchMode]);

  if (error) {
    return (
      <div>
        <Label htmlFor="address">{label}</Label>
        <Input
          id="address"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
        <Alert className="mt-2">
          <AlertDescription className="text-destructive">
            {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <Label htmlFor="address">{label}</Label>
        {enableBusinessSearch && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSearchMode('address')}
              className={`px-2 py-1 text-xs rounded ${
                searchMode === 'address' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Address
            </button>
            <button
              type="button"
              onClick={() => setSearchMode('business')}
              className={`px-2 py-1 text-xs rounded ${
                searchMode === 'business' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Business
            </button>
          </div>
        )}
      </div>
      <Input
        ref={inputRef}
        id="address"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={isLoaded ? 
          (searchMode === 'business' ? "Search for business name..." : "Start typing an address...") 
          : placeholder
        }
        disabled={!isLoaded}
      />
      {!isLoaded && (
        <div className="text-sm text-muted-foreground mt-1">
          Loading Google Places...
        </div>
      )}
      {searchMode === 'business' && (
        <div className="text-xs text-muted-foreground mt-1">
          💡 Search by business name (e.g., "Rakesh Panchal Clinic") to auto-fill address and details
        </div>
      )}
    </div>
  );
};

export default GooglePlacesAutocomplete;
