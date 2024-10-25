import { UnstyledButton, Group, ActionIcon } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { useState } from "react";

function EmptyCellWithAdd({ onAdd }: { onAdd: () => void }) {
  const [showAddButton, setShowAddButton] = useState(false);

  return (
    <UnstyledButton
      onMouseEnter={() => setShowAddButton(true)}
      onMouseLeave={() => setShowAddButton(false)}
      onClick={onAdd}
      h={"100%"}
      w={"100%"}
    >
      <Group justify="flex-end">
        <ActionIcon
          variant="filled"
          color="pink"
          opacity={showAddButton ? 1 : 0}
          component="div"
        >
          <IconPlus />
        </ActionIcon>
      </Group>
    </UnstyledButton>
  );
}

export default EmptyCellWithAdd;
