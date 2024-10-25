import { useMantineTheme } from "@mantine/core";
import MapboxDraw, {
  DrawCreateEvent,
  DrawDeleteEvent,
  DrawUpdateEvent,
} from "@mapbox/mapbox-gl-draw";
import type { FeatureCollection } from "geojson";
import { useCallback, useEffect, useMemo } from "react";
import { ControlPosition, MapInstance, useControl, useMap } from "react-map-gl";
import getGlDrawStyles from "../(utils)/gl-draw-styles";

function MapboxGlDraw({
  geojsonData,
  onUpdate,
  onDelete,
  onSelect,
  onCreate,
  controls,
  position,
}: {
  geojsonData?: FeatureCollection;
  onCreate?: (e: DrawCreateEvent) => void;
  onUpdate?: (e: DrawUpdateEvent) => void;
  onDelete?: (e: DrawDeleteEvent) => void;
  onSelect?: (e: DrawUpdateEvent) => void;
  controls?: MapboxDraw.MapboxDrawControls;
  position?: ControlPosition;
}) {
  const theme = useMantineTheme();
  const { current: mapRef } = useMap();

  const createDrawControlInstance = useCallback(() => {
    return new MapboxDraw({
      defaultMode: "simple_select",
      displayControlsDefault: false,
      controls,
      styles: getGlDrawStyles({
        fillColor: theme.colors.orange[4],
        outlineColor: theme.colors.gray[1],
      }),
    });
  }, [controls, theme.colors.gray, theme.colors.orange]);

  const onAddControlToMap: any = useCallback(
    ({ map }: { map: MapInstance }) => {
      onCreate && map.on("draw.create", onCreate);
      onUpdate && map.on("draw.update", onUpdate);
      onDelete && map.on("draw.delete", onDelete);
      onSelect && map.on("draw.selectionchange", onSelect);
    },
    [onCreate, onDelete, onSelect, onUpdate]
  );

  const onRemoveControlFromMap: any = useCallback(
    ({ map }: { map: MapInstance }) => {
      onCreate && map.off("draw.create", onCreate);
      onUpdate && map.off("draw.update", onUpdate);
      onDelete && map.off("draw.delete", onDelete);
      onSelect && map.off("draw.selectionchange", onSelect);
    },
    [onCreate, onDelete, onSelect, onUpdate]
  );

  const controlOptions = useMemo(() => {
    return {
      position,
    };
  }, [position]);

  const draw: MapboxDraw | undefined = useControl<any>(
    createDrawControlInstance,
    onAddControlToMap,
    onRemoveControlFromMap,
    controlOptions
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