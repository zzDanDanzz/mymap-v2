import { useMantineTheme } from "@mantine/core";
import MapboxDraw, {
  DrawDeleteEvent,
  DrawUpdateEvent,
} from "@mapbox/mapbox-gl-draw";
import type { FeatureCollection } from "geojson";
import { useCallback, useEffect, useMemo } from "react";
import { ControlPosition, MapInstance, useControl, useMap } from "react-map-gl";
import getGlDrawStyles from "../../(utils)/gl-draw-styles";

type ControlOptions = {
  position?: ControlPosition;
};

function MapboxGlDraw({
  geojsonData,
  onUpdate,
  onDelete,
}: {
  geojsonData: FeatureCollection;
  onUpdate: (e: DrawUpdateEvent) => void;
  onDelete: (e: DrawDeleteEvent) => void;
}) {
  const theme = useMantineTheme();
  const { current: mapRef } = useMap();

  const createDrawControlInstance = useCallback(() => {
    return new MapboxDraw({
      defaultMode: "simple_select",
      displayControlsDefault: false,
      controls: {
        trash: true,
      },
      styles: getGlDrawStyles({
        fillColor: theme.colors.orange[4],
        outlineColor: theme.colors.gray[1],
      }),
    });
  }, [theme.colors.gray, theme.colors.orange]);

  const onAddControlToMap: any = useCallback(
    ({ map }: { map: MapInstance }) => {
      map.on("draw.update", onUpdate);
      map.on("draw.delete", onDelete);
    },
    [onDelete, onUpdate],
  );

  const onRemoveControlFromMap: any = useCallback(
    ({ map }: { map: MapInstance }) => {
      map.off("draw.update", onUpdate);
      map.off("draw.delete", onDelete);
    },
    [onDelete, onUpdate],
  );

  const controlOptions = useMemo(() => {
    return {
      position: "bottom-right",
    } as ControlOptions;
  }, []);

  const draw: MapboxDraw | undefined = useControl<any>(
    createDrawControlInstance,
    onAddControlToMap,
    onRemoveControlFromMap,
    controlOptions,
  );

  // add features to gl-draw if editing geom
  useEffect(() => {
    if (geojsonData && draw && mapRef?.hasControl(draw)) {
      draw.add(geojsonData);

      return () => {
        if (draw && mapRef?.hasControl(draw)) {
          draw?.deleteAll();
        }
      };
    }
  }, [draw, geojsonData, mapRef]);

  return null;
}

export default MapboxGlDraw;
