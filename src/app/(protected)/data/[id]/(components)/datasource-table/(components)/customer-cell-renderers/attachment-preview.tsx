import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Drawer,
  Group,
  Image,
  Paper,
  Stack,
  Text,
  UnstyledButton,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { MAPIR_API_BASE } from "@shared/config";
import { getUserXApiKey } from "@shared/utils/local-storage";
import { IconGripVertical, IconPlus } from "@tabler/icons-react";
import { useState } from "react";
// @hello-pangea/dnd is a fork of react-beautiful-dnd that works with react 18
import {
  DragDropContext,
  Draggable,
  DraggableProvided,
  Droppable,
} from "@hello-pangea/dnd";

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

function AttachmentCard({
  attachment,
  provided,
}: {
  attachment: Attachment;
  provided: DraggableProvided;
}) {
  const filename = attachment.link.split("/").at(-1);
  return (
    <Paper withBorder p={"sm"}>
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
  );
}

function AttachmentEditor({
  previouslyUploaded,
}: {
  previouslyUploaded: Attachment[] | undefined;
}) {
  const [media, setMedia] = useState<Attachment[]>(previouslyUploaded || []);
  return (
    <div>
      <DragDropContext
        onDragEnd={(result) => {
          if (result.reason === "CANCEL") return;

          if (!result.destination) return;

          const [sourceIdx, destIdx] = [
            result.source.index,
            result.destination.index,
          ];

          // didn't change position
          if (sourceIdx === destIdx) return;

          const m = [...media];

          // remove dragged elem.
          const [removed] = m.splice(sourceIdx, 1);
          // insert it at new dest. index.
          m.splice(destIdx, 0, removed);

          setMedia(m);
        }}
      >
        <Droppable droppableId="col-1">
          {(provided) => (
            <div
              // className="first:mt-0 [&>div]:mt-2"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {media?.map((attachment, idx) => {
                return (
                  <Draggable
                    draggableId={attachment.id.toString()}
                    index={idx}
                    key={attachment.id}
                  >
                    {(provided) => (
                      <Box
                        mb={"md"}
                        {...provided.draggableProps}
                        ref={provided.innerRef}
                      >
                        <AttachmentCard
                          attachment={attachment}
                          provided={provided}
                        />
                      </Box>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );

  return (
    <Stack h={"90vh"} justify="space-between">
      {/* <Stack flex={"0 1 auto"} style={{ overflowY: "auto" }}> */}
      {/*   {previouslyUploaded?.map((a) => ( */}
      {/*     <AttachmentCard key={a.id} attachment={a} /> */}
      {/*   ))} */}
      {/* </Stack> */}

      <DragDropContext
        onDragEnd={(result) => {
          if (result.reason === "CANCEL") return;

          if (!result.destination) return;

          const [sourceIdx, destIdx] = [
            result.source.index,
            result.destination.index,
          ];

          // didn't change position
          if (sourceIdx === destIdx) return;

          const m = [...media];

          // remove dragged elem.
          const [removed] = m.splice(sourceIdx, 1);
          // insert it at new dest. index.
          m.splice(destIdx, 0, removed);

          setMedia(m);
        }}
      >
        <Droppable droppableId="col-1">
          {(provided) => (
            <div
              // className="first:mt-0 [&>div]:mt-2"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {media?.map((attachment, idx) => {
                const filename = attachment.link.split("/").at(-1);

                return (
                  <Draggable
                    draggableId={attachment.id.toString()}
                    index={idx}
                    key={attachment.id}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
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
                            <Badge flex={"1 0 auto"}>
                              {attachment.extension}
                            </Badge>
                          </Group>
                        </Paper>
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

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
