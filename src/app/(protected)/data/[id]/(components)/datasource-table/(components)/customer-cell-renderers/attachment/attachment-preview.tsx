import {
  ActionIcon,
  Drawer,
  DrawerProps,
  Group,
  Image,
  Modal,
  ModalProps,
  UnstyledButton,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { MAPIR_API_BASE } from "@shared/config";
import { getUserXApiKey } from "@shared/utils/local-storage";
import { IconPlus } from "@tabler/icons-react";
import { useState } from "react";
// @hello-pangea/dnd is a fork of react-beautiful-dnd that works with react 18
import AttachmentEditor from "./attachments-editor";
import { Attachment } from "../types";
import UploadAttachments from "../upload-attachments";

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

function AttachmentEditorDrawer(
  props: Pick<DrawerProps, "opened" | "onClose"> & {
    initialAttachments: Attachment[] | undefined;
  },
) {
  return (
    <Drawer
      position="right"
      transitionProps={{
        transition: "fade-right",
      }}
      {...props}
    >
      <AttachmentEditor initialAttachments={props.initialAttachments} />
    </Drawer>
  );
}

function UploadAttachmentsModal(props: Pick<ModalProps, "opened" | "onClose">) {
  return (
    <Modal title="بارگذاری فایل جدید" {...props}>
      <UploadAttachments onCancel={props.onClose} />
    </Modal>
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
  const [
    isUploadModalOpened,
    { open: openUploadModal, close: closeUploadModal },
  ] = useDisclosure(false);

  if (hasNoAttachments) {
    return (
      <>
        <EmptyAttachmentCell onAdd={openUploadModal} />
        <UploadAttachmentsModal
          opened={isUploadModalOpened}
          onClose={closeUploadModal}
        />
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
      <AttachmentEditorDrawer
        opened={isEditorOpened}
        onClose={closeEditor}
        initialAttachments={cellData}
      />
    </>
  );
}
