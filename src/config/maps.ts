export const MOUNTAIN_MARKER_ZOOM = 7;

export const MOUNTAIN_MAP_OPTIONS = {
  mapId: "b86f8d865b37b547b7840834",
  center: {
    lat: 35.9718577,
    lng: 138.3684228,
  },
  zoom: 8,
  mapTypeId: "terrain",
  mapTypeControl: false,
  scaleControl: true,
  zoomControlOptions: {
    position: 1,
  },
  streetViewControl: true,
} as const;
