import {
  DropResult,
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";
import {
  Stack,
  Box,
  Image,
  Text,
  Button,
  ActionIcon,
  Badge,
  Group,
  Paper,
} from "@mantine/core";
import { useListState } from "@mantine/hooks";
import { MAPIR_API_BASE } from "@shared/config";
import { getUserXApiKey } from "@shared/utils/local-storage";
import { IconGripVertical, IconUpload } from "@tabler/icons-react";
import { Attachment } from "./types";

function DraggableAttachmentCard({
  attachment,
  index,
}: {
  attachment: Attachment;
  index: number;
}) {
  const filename = attachment.link.split("/").at(-1);
  return (
    <Draggable
      draggableId={attachment.id.toString()}
      index={index}
      key={attachment.id}
    >
      {(provided) => (
        <Paper
          {...provided.draggableProps}
          ref={provided.innerRef}
          withBorder
          p={"sm"}
          mb={"md"}
        >
          <Group wrap="nowrap">
            <ActionIcon
              {...provided.dragHandleProps}
              size={"sm"}
              variant="subtle"
              style={{ cursor: "grab" }}
            >
              <IconGripVertical />
            </ActionIcon>
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
      )}
    </Draggable>
  );
}

function AttachmentEditor({
  initialAttachments,
}: {
  initialAttachments: Attachment[] | undefined;
}) {
  const [attachments, attachmentsListHandlers] = useListState(
    initialAttachments || [],
  );

  function onDragEnd(result: DropResult) {
    if (result.reason === "CANCEL") return;
    attachmentsListHandlers.reorder({
      from: result.source.index,
      to: result.destination?.index || 0,
    });
  }

  return (
    <Stack justify="space-between" h={"90vh"}>
      <Stack
        style={{ overflowY: "auto" }}
        mah={"100%"}
        pos={"relative"}
        pl={"md"}
      >
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="col-1">
            {(provided) => (
              <Box ref={provided.innerRef} {...provided.droppableProps}>
                {attachments?.map((attachment, index) => {
                  return (
                    <DraggableAttachmentCard
                      attachment={attachment}
                      index={index}
                      key={attachment.id}
                    />
                  );
                })}
                {provided.placeholder}
              </Box>
            )}
          </Droppable>
        </DragDropContext>
      </Stack>

      <Button
        leftSection={<IconUpload />}
        style={{
          alignSelf: "flex-start",
          flexShrink: 0,
        }}
      >
        بارگذاری فایل جدید
      </Button>
    </Stack>
  );
}

export default AttachmentEditor;