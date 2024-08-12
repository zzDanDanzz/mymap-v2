import { FeatureCollection } from "geojson";
import { bbox as getBbox } from "@turf/turf";
import { useEffect } from "react";
import { useMap } from "react-map-gl";

function FitMapBoundsToGeojsonData({
  geojsonData,
}: {
  geojsonData: FeatureCollection;
}) {
  const { current: mapRef } = useMap();

  // zoom to bbox of fetched rows of selected geometry column
  useEffect(() => {
    if (geojsonData && mapRef) {
      try {
        const bbox = getBbox(geojsonData) as [number, number, number, number];
        bbox && mapRef.fitBounds(bbox, { padding: 200 });
      } catch (error) {
        console.error(error);
      }
    }
  }, [geojsonData, mapRef]);

  return null;
}

export default FitMapBoundsToGeojsonData;
