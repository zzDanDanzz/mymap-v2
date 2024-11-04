import { Flex, Text, Paper, Checkbox, Stack, Tooltip } from "@mantine/core";
import { DatasourceColumn } from "@shared/types/datasource.types";

function LayerVisibilityToggle({
  geometryColumns,
  enabledGeomColmnNamesToView,
  setEnabledGeomColmnNamesToView,
}: {
  geometryColumns: DatasourceColumn[];
  enabledGeomColmnNamesToView: string[];
  setEnabledGeomColmnNamesToView: React.Dispatch<
    React.SetStateAction<string[]>
  >;
}) {
  return (
    <Flex
      pos={"absolute"}
      top={"10px"}
      left={"10px"}
      w={"calc(100% - 20px)"}
      align="flex-start"
      direction={"row-reverse"}
      gap={"md"}
    >
      <Paper p={"sm"} withBorder w={"256px"} maw={"100%"} mah={"60%"}>
        <Checkbox.Group
          label="نمایش ستون(های) ژئومتری"
          value={enabledGeomColmnNamesToView}
          onChange={setEnabledGeomColmnNamesToView}
        >
          <Stack gap={"xs"} mt={"md"}>
            {geometryColumns?.map(({ name }) => (
              <Tooltip
                label={name}
                key={name}
                refProp="rootRef"
                position="top-start"
              >
                <Checkbox
                  styles={{
                    labelWrapper: {
                      overflowX: "hidden",
                    },
                  }}
                  value={name}
                  label={
                    <Text truncate maw={"100%"} size="xs">
                      {name}
                    </Text>
                  }
                />
              </Tooltip>
            ))}
          </Stack>
        </Checkbox.Group>
      </Paper>
    </Flex>
  );
}

export default LayerVisibilityToggle;
