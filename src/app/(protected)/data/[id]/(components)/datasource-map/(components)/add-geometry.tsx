import { addingGeomModeAtom } from "@/data/[id]/(utils)/atoms";
import { Flex, Paper, Group, Alert, Stack, Button } from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";
import { useAtom } from "jotai";
import { useCallback, useRef, useMemo } from "react";
import MapboxGlDraw from "./mapbox-gl-draw";

const getControls = (dataType: string) => {
  const pointControls = { point: true };
  const lineControls = { line_string: true };
  const polygonControls = { polygon: true };
  const allControls = { ...pointControls, ...lineControls, ...polygonControls };

  const map: Record<string, MapboxDraw.MapboxDrawControls> = {
    point: pointControls,
    multipoint: pointControls,
    linestring: lineControls,
    multilinestring: lineControls,
    polygon: polygonControls,
    multipolygon: polygonControls,
    geometry: allControls,
    geometrycollection: allControls,
  };
  return map[dataType];
};

function AddGeometry() {
  const [addingGeomMode, setAddingGeomMode] = useAtom(addingGeomModeAtom);
  const onCancel = useCallback(() => {
    setAddingGeomMode({ isEnabled: false });
  }, [setAddingGeomMode]);
  const glDrawRef = useRef<MapboxDraw>();

  const columnDataType = useMemo(() => {
    const FALLBACK = "geometry";
    return (
      addingGeomMode.datasourceColumn?.data_type ?? FALLBACK
    ).toLowerCase();
  }, [addingGeomMode.datasourceColumn?.data_type]);

  const onCreate = useCallback(
    (e: MapboxDraw.DrawCreateEvent) => {
      console.log({
        "addingGeomMode.datasourceColumn?.name":
          addingGeomMode.datasourceColumn?.name,
      });

      const lastAddedFeature = e.features[e.features.length - 1];

      const isMulti =
        columnDataType.includes("multi") ||
        columnDataType.includes("collection");

      if (!isMulti) {
        const features = glDrawRef.current?.getAll().features ?? [];
        if (features.length > 1) {
          // delete all features except the most recently addded one
          features.forEach((feature) => {
            if (feature.id !== lastAddedFeature.id) {
              glDrawRef.current?.delete(
                (feature as GeoJSON.Feature & { id: string }).id
              );
            }
          });
        }
      }
    },
    [addingGeomMode.datasourceColumn?.name, columnDataType]
  );

  return (
    <>
      <Flex pos={"absolute"} bottom={10} left={10} w={"calc(100% - 20px)"}>
        <Paper p={"sm"} withBorder>
          <Group wrap="nowrap">
            <Alert title="افزودن ژئومتری" icon={<IconInfoCircle />}>
              {"شما در حال افزودن ژئومتری در ردیفی با آیدی " +
                addingGeomMode.rowId +
                " در ستون " +
                addingGeomMode.datasourceColumn?.name +
                " هستید"}
            </Alert>
            <Stack>
              <Button>ثبت</Button>
              <Button onClick={onCancel} variant="light">
                لغو
              </Button>
            </Stack>
          </Group>
        </Paper>
      </Flex>

      <MapboxGlDraw
        controls={getControls(columnDataType)}
        onCreate={onCreate}
        position="top-right"
        ref={glDrawRef}
      />
    </>
  );
}

export default AddGeometry;
