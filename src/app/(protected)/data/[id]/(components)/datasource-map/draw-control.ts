import MapboxDraw, {
  DrawCreateEvent,
  DrawDeleteEvent,
  DrawUpdateEvent,
  MapboxDrawOptions,
} from "@mapbox/mapbox-gl-draw";
import { useControl } from "react-map-gl";

import type { MapRef, ControlPosition } from "react-map-gl";

type MapContextValue = {
  map: MapRef;
};

type DrawControlProps = MapboxDrawOptions & {
  position?: ControlPosition;
  onCreate?: (event: MapContextValue & DrawCreateEvent) => void;
  onUpdate?: (event: MapContextValue & DrawUpdateEvent) => void;
  onDelete?: (event: MapContextValue & DrawDeleteEvent) => void;
};

export default function DrawControl(props: DrawControlProps) {
  useControl<MapboxDraw>(
    () => new MapboxDraw(props),
    ({ map }) => {
      props.onCreate && map.on("draw.create", props.onCreate);
      props.onUpdate && map.on("draw.update", props.onUpdate);
      props.onDelete && map.on("draw.delete", props.onDelete);
    },
    ({ map }) => {
      props.onCreate && map.off("draw.create", props.onCreate);
      props.onUpdate && map.off("draw.update", props.onUpdate);
      props.onDelete && map.off("draw.delete", props.onDelete);
    },
    {
      position: props.position,
    }
  );

  return null;
}

DrawControl.defaultProps = {
  onCreate: () => {},
  onUpdate: () => {},
  onDelete: () => {},
};
