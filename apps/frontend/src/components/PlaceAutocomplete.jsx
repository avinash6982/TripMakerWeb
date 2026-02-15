import { useState, useRef, useEffect } from "react";
import { searchPlaces } from "../services/geocode";

const DEBOUNCE_MS = 1200; // Nominatim 1 req/sec; debounce to avoid rapid calls
const BLUR_CLOSE_DELAY_MS = 200;

/**
 * Place name input with as-you-type suggestions from Nominatim (OpenStreetMap).
 * Use for itinerary item names so users pick real places and avoid wrong names.
 */
export default function PlaceAutocomplete({
  value,
  onChange,
  destination = "",
  placeholder,
  disabled,
  id,
  "aria-label": ariaLabel,
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);
  const blurDelayRef = useRef(null);
  const listId = useRef(`place-autocomplete-list-${Math.random().toString(36).slice(2, 9)}`).current;

  const clearDebounce = () => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
  };

  const clearBlurDelay = () => {
    if (blurDelayRef.current) {
      clearTimeout(blurDelayRef.current);
      blurDelayRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      clearDebounce();
      clearBlurDelay();
    };
  }, []);

  const handleInputChange = (e) => {
    const v = e.target.value;
    onChange(v);
    clearDebounce();
    if (v.trim().length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      debounceRef.current = null;
      try {
        const list = await searchPlaces(v.trim(), destination, 6);
        setSuggestions(list);
        setIsOpen(list.length > 0);
      } catch {
        setSuggestions([]);
        setIsOpen(false);
      } finally {
        setLoading(false);
      }
    }, DEBOUNCE_MS);
  };

  const handleBlur = () => {
    clearBlurDelay();
    blurDelayRef.current = setTimeout(() => {
      blurDelayRef.current = null;
      setIsOpen(false);
    }, BLUR_CLOSE_DELAY_MS);
  };

  const handleSelect = (shortName) => {
    clearBlurDelay();
    onChange(shortName);
    setSuggestions([]);
    setIsOpen(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div className="place-autocomplete">
      <input
        type="text"
        id={id}
        value={value}
        onChange={handleInputChange}
        onBlur={handleBlur}
        onFocus={() => suggestions.length > 0 && setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
        aria-label={ariaLabel}
        aria-autocomplete="list"
        aria-expanded={isOpen}
        aria-controls={isOpen ? listId : undefined}
        aria-activedescendant={undefined}
      />
      {loading && <span className="place-autocomplete-spinner" aria-hidden />}
      {isOpen && suggestions.length > 0 && (
        <ul
          id={listId}
          className="place-autocomplete-list"
          role="listbox"
          onMouseDown={(e) => e.preventDefault()}
        >
          {suggestions.map((item, i) => (
            <li
              key={`${item.shortName}-${i}`}
              role="option"
              className="place-autocomplete-option"
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(item.shortName);
              }}
            >
              {item.shortName}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
