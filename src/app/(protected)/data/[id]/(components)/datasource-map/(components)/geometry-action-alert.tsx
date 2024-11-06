import { Flex, Paper, Group, Alert, Stack, Button } from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";

function GeometryActionAlert({
  onSubmit,
  onCancel,
  action,
  rowId,
  columnName,
}: {
  onSubmit: () => void;
  onCancel: () => void;
  rowId: number;
  columnName: string;
  action: "add" | "edit";
}) {
  return (
    <Flex pos={"absolute"} bottom={10} left={10} w={"calc(100% - 20px)"}>
      <Paper p={"sm"} withBorder>
        <Group wrap="nowrap">
          <Alert
            title={action === "add" ? "افزودن ژئومتری" : "ویرایش ژئومتری"}
            icon={<IconInfoCircle />}
          >
            {`شما در حال ${
              action === "add" ? "افزودن" : "ویرایش"
            } ژئومتری در ردیفی با آیدی ${rowId} در ستون ${columnName} هستید`}
          </Alert>
          <Stack>
            <Button onClick={onSubmit}>ثبت</Button>
            <Button onClick={onCancel} variant="light">
              لغو
            </Button>
          </Stack>
        </Group>
      </Paper>
    </Flex>
  );
}
export default GeometryActionAlert;
