// # ________________________________IMPORTS...______________________________________ # //
import $ from 'jquery';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MAPBOX_TOKEN, GLOBE_VISITED_FILL } from '../config';

// Handles the rendering of the globe if user asked about countries
class Globe {
  _map;

  // Renders the globe
  render(countries) {
    // If a globe exists, detach the HTML and insert it in the response window
    const exists = this.insertIfExists(countries);

    // Globe exists, upate filled in countries
    if (exists) this._fillCountries(countries);

    // If a globe doesn't exist, render a new globe
    if (!exists) return this.insertGlobe(countries);
  }

  // Checks if there is already a "globe" in the DOM and inserts it if there is
  insertIfExists(countries) {
    // Selects the DOM Element
    const globeExists = $('#map-container').get(0);

    // Defines markup depending on if there is already a globe
    const markup =
      $('#map-container').remove().get(0) || this._globeContainerMarkup();

    // Check if there is a "suggestions" markup in the HTML, I want the globe to be ABOVE that HTML
    if ($('.scroll-wrapper')) {
      $('.scroll-wrapper').before(markup);
    } else {
      $('.response').append(markup);
    }

    return globeExists;
  }

  insertGlobe(countries) {
    // Initialize the map with globe projection
    mapboxgl.accessToken = MAPBOX_TOKEN;
    this._map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/jeffreyvanderkooy/cm9k5rd7i00u601s8g1ky1bpp',
      projection: 'globe',
      center: [0, 0],
      zoom: 0.5,
      attributionControl: false,
    });

    this._map.on('load', () => {
      // Sets fog around the globe
      this._map.setFog({
        color: 'rgb(186, 210, 235)', // Lower atmosphere
        'high-color': 'rgb(82, 125, 226)', // Upper atmosphere
        'horizon-blend': 0.02, // Atmosphere thickness (default 0.2 at low zooms)
        'space-color': 'rgba(0, 0, 0, 0)', // Background color
        'star-intensity': 0, // Background star brightness (default 0.35 at low zooms)
      });

      // Add source for country boundaries
      this._map.addSource('countries', {
        type: 'vector',
        url: 'mapbox://mapbox.country-boundaries-v1',
      });

      this._fillCountries(countries);
    });
  }

  _fillCountries(countries) {
    // Build a GL match expression that defines the color for every vector
    // tile feature. Use the ISO 3166-1 alpha 3 code as the lookup key
    const matchExpression = ['match', ['get', 'iso_3166_1_alpha_3']];

    // Add your country codes and desired colors
    for (const countryCode of countries) {
      // Convert to uppercase and to alpha-3 if needed
      matchExpression.push(countryCode.toUpperCase(), GLOBE_VISITED_FILL);
    }

    // Last value is the default, used where there is no data
    matchExpression.push('rgba(0, 0, 0, 0)');

    console.log(this._map);

    // Check if the layer exists before attempting to remove it
    if (this._map.getLayer('countries-join')) {
      this._map.removeLayer('countries-join');
    }

    // Add layer from the vector tile source
    this._map.addLayer({
      id: 'countries-join',
      type: 'fill',
      source: 'countries',
      'source-layer': 'country_boundaries',
      paint: {
        'fill-color': matchExpression,
      },
    });
  }

  _globeContainerMarkup() {
    return `
    <div class='d-flex flex-column mt-2 gap-2' id="map-container">
      <small class='fw-light fst-italic d-flex align-items-center gap-3'>Visited: <span class='globe-visited-dot' style='background-color: ${GLOBE_VISITED_FILL}'></span></small>
      <div id='map'></div>
    </div>`;
  }
}

export default new Globe();
