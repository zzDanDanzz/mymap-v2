import { updateDatasourceRow } from "@/data/[id]/(utils)/api";
import {
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
import { useDatasourceRows } from "@shared/hooks/swr/datasources/use-datasource-rows";
import { getUserXApiKey } from "@shared/utils/local-storage";
import { CustomCellRendererProps } from "ag-grid-react";
import { useParams, useSearchParams } from "next/navigation";
import EmptyCellWithAdd from "../../empty-cell-with-add";
import { Attachment } from "../types";
import AttachmentEditor from "./attachments-editor";
import UploadAttachments from "./upload-attachments";

function AttachmentEditorDrawer({
  drawerProps,
  initialAttachments,
}: {
  drawerProps: Pick<DrawerProps, "opened" | "onClose">;
  initialAttachments: Attachment[] | undefined;
}) {
  return (
    <Drawer
      position="right"
      transitionProps={{
        transition: "fade-right",
      }}
      {...drawerProps}
    >
      <AttachmentEditor initialAttachments={initialAttachments} />
    </Drawer>
  );
}

function UploadAttachmentsModal({
  modalProps,
  onUpload,
}: {
  modalProps: Pick<ModalProps, "opened" | "onClose">;
  onUpload: (_files: Attachment[]) => void;
}) {
  return (
    <Modal title="بارگذاری فایل جدید" {...modalProps}>
      <UploadAttachments onCancel={modalProps.onClose} onUpload={onUpload} />
    </Modal>
  );
}
export default function AttachmentPreview(props: CustomCellRendererProps) {
  const cellData = props.value as Attachment[];

  const { id } = useParams<{ id: string }>();

  const params = useSearchParams();

  const { datasourceRowsMutate } = useDatasourceRows({
    id,
    search: params.get("search") ?? "",
  });

  const hasNoAttachments = !(cellData?.length >= 1);

  const [isEditorOpened, { open: openEditor, close: closeEditor }] =
    useDisclosure(false);

  const [
    isUploadModalOpened,
    { open: openUploadModal, close: closeUploadModal },
  ] = useDisclosure(false);

  const handleUpdateAttachments = async (files: Attachment[]) => {
    const _columnField = props.colDef?.field;

    if (!_columnField) return;

    const _cellData = props.data[_columnField];

    props.api.setGridOption("loading", true);

    closeUploadModal();

    updateDatasourceRow({
      datasourceId: id,
      rowId: props.data.id,
      cellColumnName: _columnField,
      updatedCellData: [...(_cellData ?? []), ...files],
    });

    await datasourceRowsMutate();

    props.api.setGridOption("loading", false);
  };

  if (hasNoAttachments) {
    return (
      <>
        <EmptyCellWithAdd onAdd={openUploadModal} />
        <UploadAttachmentsModal
          modalProps={{
            opened: isUploadModalOpened,
            onClose: closeUploadModal,
          }}
          onUpload={handleUpdateAttachments}
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
              src={`${MAPIR_API_BASE}/${
                a.thumbnail_link
              }?x-api-key=${getUserXApiKey()}`}
            />
          ))}
        </Group>
      </UnstyledButton>
      <AttachmentEditorDrawer
        drawerProps={{
          opened: isEditorOpened,
          onClose: closeEditor,
        }}
        initialAttachments={cellData}
      />
    </>
  );
}
