import { useDebouncedValue } from "@mantine/hooks";
import { useEffect } from "react";
import { useMap } from "react-map-gl";

function ResizeMapToContainer({
  containerObserverRect,
}: {
  containerObserverRect: Omit<DOMRect, "toJSON">;
}) {
  const { current: mapRef } = useMap();

  const debouncedMapContainerRect = useDebouncedValue(
    containerObserverRect,
    500,
  );
  // resize map on container resize
  useEffect(() => {
    mapRef?.resize();
  }, [debouncedMapContainerRect, mapRef]);

  return null;
}

export default ResizeMapToContainer;
