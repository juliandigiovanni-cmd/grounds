import { useCallback } from "react";
import type { MapRef } from "react-map-gl";
import type { RefObject } from "react";

export function useMapFly(mapRef: RefObject<MapRef>) {
  return useCallback(
    (lat: number, lng: number, zoom = 12, options?: { offset?: [number, number] }) => {
      mapRef.current?.flyTo({
        center: [lng, lat],
        zoom,
        duration: 1500,
        essential: true,
        ...(options?.offset ? { offset: options.offset } : {}),
      });
    },
    [mapRef]
  );
}
