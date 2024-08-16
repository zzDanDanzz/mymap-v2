import {
  ActionIcon,
  Drawer,
  Group,
  Image,
  Text,
  Paper,
  Stack,
  UnstyledButton,
  Badge,
  Button,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
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

function EmptyAttachmentCell({ onAdd }: { onAdd: () => void }) {
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

function AttachmentCard({ attachment }: { attachment: Attachment }) {
  const filename = attachment.link.split("/").at(-1);
  return (
    <Paper withBorder p={"sm"}>
      <Group wrap="nowrap">
        <Image
          key={attachment.id}
          h={40}
          radius="md"
          alt={`attachment image #${filename}`}
          src={`${MAPIR_API_BASE}/${attachment.thumbnail_link}?x-api-key=${getUserXApiKey()}`}
        />
        <Text truncate="end">{filename}</Text>
        <Badge flex={"1 0 auto"}>{attachment.extension}</Badge>
      </Group>
    </Paper>
  );
}

function AttachmentEditor({
  previouslyUploaded,
}: {
  previouslyUploaded: Attachment[] | undefined;
}) {
  return (
    <Stack h={"90vh"} justify="space-between">
      <Stack flex={"0 1 auto"} style={{ overflowY: "auto" }}>
        {previouslyUploaded?.map((a) => (
          <AttachmentCard key={a.id} attachment={a} />
        ))}
      </Stack>
      <Button flex={"0 0 auto"}>done</Button>
    </Stack>
  );
}

export default function AttachmentPreview({
  cellData,
}: {
  cellData: Attachment[];
  columnId: string;
}) {
  const hasNoAttachments = !(cellData?.length >= 1);

  const [isEditorOpened, { open: openEditor, close: closeEditor }] =
    useDisclosure(false);

  const attachmentEditorDrawer = (
    <Drawer
      opened={isEditorOpened}
      onClose={() => closeEditor()}
      position="right"
      transitionProps={{
        transition: "fade-right",
      }}
    >
      <AttachmentEditor previouslyUploaded={cellData} />
    </Drawer>
  );

  if (hasNoAttachments) {
    return (
      <>
        <EmptyAttachmentCell onAdd={() => openEditor()} />
        {attachmentEditorDrawer}
      </>
    );
  }

  return (
    <>
      <UnstyledButton h={"100%"} w={"100%"} onClick={openEditor}>
        <Group justify="flex-end" wrap="nowrap" gap={"xs"}>
          {cellData.map((a, idx) => (
            <Image
              key={a.id}
              h={36}
              radius="md"
              alt={`attachment image #${idx}`}
              src={`${MAPIR_API_BASE}/${a.thumbnail_link}?x-api-key=${getUserXApiKey()}`}
            />
          ))}
        </Group>
      </UnstyledButton>
      {attachmentEditorDrawer}
    </>
  );
}
