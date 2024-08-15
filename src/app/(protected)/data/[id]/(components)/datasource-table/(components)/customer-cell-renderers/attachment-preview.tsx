import { ActionIcon, Group, Image, UnstyledButton } from "@mantine/core";
import { MAPIR_API_BASE } from "@shared/config";
import { getUserXApiKey } from "@shared/utils/local-storage";
import { IconPlus } from "@tabler/icons-react";
import { useState } from "react";

type Attachment = {
  mime_type: string;
  extension: string;
  size: number;
  link: string;
  thumbnail_link: string;
  id: number;
};

export default function AttachmentPreview({
  cellData,
}: {
  cellData: Attachment[];
  columnId: string;
}) {
  const [showAddButton, setShowAddButton] = useState(false);

  return (
    <UnstyledButton
      // onClick={() => handleSelectMedia({ index: idx, ...m })}
      onMouseEnter={() => setShowAddButton(true)}
      onMouseLeave={() => setShowAddButton(false)}
      h={"100%"}
      w={"100%"}
    >
      <Group justify="flex-end" wrap="nowrap" gap={"xs"} w={"100%"}>
        {cellData?.map((m, idx) => (
          <Image
            key={m.id}
            w={36}
            radius="md"
            alt={`attachment image #${idx}`}
            src={`${MAPIR_API_BASE}/${m.thumbnail_link}?x-api-key=${getUserXApiKey()}`}
          />
        ))}
        {(!cellData || cellData.length === 0) && (
          <ActionIcon
            variant="filled"
            color="pink"
            opacity={showAddButton ? 1 : 0}
          >
            <IconPlus />
          </ActionIcon>
        )}
      </Group>
    </UnstyledButton>
  );
}
