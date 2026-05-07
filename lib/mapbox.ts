export const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? '';

export const MAP_DEFAULTS = {
  style: 'mapbox://styles/mapbox/light-v11',
  initialViewState: {
    longitude: 0,
    latitude: 20,
    zoom: 2,
  },
};
