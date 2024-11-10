import { useMantineTheme } from "@mantine/core";
import MapboxDraw, {
  DrawCreateEvent,
  DrawDeleteEvent,
  DrawUpdateEvent,
} from "@mapbox/mapbox-gl-draw";
import type { FeatureCollection } from "geojson";
import {
  ForwardedRef,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
} from "react";
import { ControlPosition, MapInstance, useControl, useMap } from "react-map-gl";
import getGlDrawStyles from "../(utils)/gl-draw";

type MapboxGlDrawProps = {
  geojsonData?: FeatureCollection;
  onCreate?: (_: DrawCreateEvent) => void;
  onUpdate?: (_: DrawUpdateEvent) => void;
  onDelete?: (_: DrawDeleteEvent) => void;
  onSelect?: (_: DrawUpdateEvent) => void;
  controls?: MapboxDraw.MapboxDrawControls;
  position?: ControlPosition;
};

function _MapboxGlDraw(
  props: MapboxGlDrawProps,
  ref: ForwardedRef<MapboxDraw | undefined>
) {
  const {
    geojsonData,
    onUpdate,
    onDelete,
    onSelect,
    onCreate,
    controls,
    position,
  } = props;

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

  useImperativeHandle(ref, () => draw, [draw]);

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

const MapboxGlDraw = forwardRef(_MapboxGlDraw);

export default MapboxGlDraw;
