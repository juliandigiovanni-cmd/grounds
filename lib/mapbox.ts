export const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? '';

export const MAP_DEFAULTS = {
  style: 'mapbox://styles/mapbox/outdoors-v12',
  initialViewState: {
    longitude: 15,
    latitude: 30,
    zoom: 2.2,
  },
};
