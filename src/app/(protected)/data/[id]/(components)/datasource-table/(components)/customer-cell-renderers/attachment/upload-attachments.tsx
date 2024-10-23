import { Button, FileButton, Group, Stack, Text } from "@mantine/core";
import { ax } from "@shared/api/axios-instance";
import urls from "@shared/api/urls";
import { getUserXApiKey } from "@shared/utils/local-storage";
import notify from "@shared/utils/toasts";
import { useState } from "react";
import { Attachment } from "../types";

/** Get name and extension from a filename string */
const splitAtExtension = (name: string) => {
  const cutIndex = name.lastIndexOf(".");
  return [name.slice(0, cutIndex), name.slice(cutIndex)] as [string, string];
};

/**
 * except for extension, turns dots to underscores
 *
 */
const transformDotsToUnderscores = (fileName: string) => {
  const [name, ext] = splitAtExtension(fileName);
  return name.replaceAll(".", "_") + ext;
};

async function uploadFile(file: File) {
  const formData = new FormData();
  formData.append("file", file, transformDotsToUnderscores(file.name));

  const toastId = notify.loading(`در حال آپلود فایل ${file.name}`);

  const mediaResponse = await ax.post<Attachment>(`${urls.media}/`, formData, {
    headers: {
      "x-api-key": `${getUserXApiKey()}`,
    },
  });

  const isOk = mediaResponse.status >= 200 && mediaResponse.status < 300;

  if (!isOk) {
    notify.update({
      id: toastId,
      message:
        mediaResponse.status === 413
          ? "حجم فایل انتخاب شده بیش از حد مجاز است."
          : `مشکلی در آپلود فایل ${file.name} پیش آمده`,
      color: "red",
      loading: false,
      autoClose: 5000,
    });

    return;
  }

  notify.update({
    id: toastId,
    message: `فایل ${file.name} آپلود شد`,
    color: "green",
    loading: false,
    autoClose: 5000,
  });

  return mediaResponse.data;
}

function UploadAttachments({
  onCancel,
  onUpload,
}: {
  onCancel: () => void;
  onUpload: (files: Attachment[]) => void;
}) {
  const [files, setFiles] = useState<File[] | null>(null);

  const pickedAtLeastOneFile = (files ?? []).length > 0;

  const handleUpload = async () => {
    if (!files) return;

    const uploadedFiles = await Promise.all(
      files.map((file) => uploadFile(file))
    ).catch((err) => {
      console.error(err);
    });

    if (!uploadedFiles) return;

    onUpload(uploadedFiles.filter(Boolean) as Attachment[]);
  };

  return (
    <Stack gap={"xs"}>
      <FileButton onChange={setFiles} multiple>
        {(props) => <Button {...props}>انتخاب فایل(ها)</Button>}
      </FileButton>
      <Text size="sm">{files?.map((f) => f.name).join(", ")}</Text>
      <Group justify="flex-end">
        <Button variant="outline" onClick={onCancel}>
          انصراف
        </Button>
        <Button disabled={!pickedAtLeastOneFile} onClick={handleUpload}>
          آپلود
        </Button>
      </Group>
    </Stack>
  );
}

export default UploadAttachments;
