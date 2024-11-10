import { FeatureCollection } from "geojson";
import { bbox as getBbox } from "@turf/turf";
import { useEffect } from "react";
import { useMap } from "react-map-gl";

function FitMapBoundsToGeojsonData({
  geojson,
}: {
  geojson: FeatureCollection | null;
}) {
  const { current: mapRef } = useMap();

  // zoom to bbox of fetched rows of selected geometry column
  useEffect(() => {
    if (geojson && geojson.features.length > 0 && mapRef) {
      try {
        const bbox = getBbox(geojson) as [number, number, number, number];
        bbox && mapRef.fitBounds(bbox, { padding: 200 });
      } catch (error) {
        console.error(error);
      }
    }
  }, [geojson, mapRef]);

  return null;
}

export default FitMapBoundsToGeojsonData;
