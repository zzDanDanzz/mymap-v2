import { Button, FileButton, Group, Stack, Text } from "@mantine/core";
import urls from "@shared/api/urls";
import { getUserXApiKey } from "@shared/utils/local-storage";
import notify from "@shared/utils/toasts";
import { useState } from "react";

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

  const mediaResponse = await fetch(`${urls.media}/`, {
    method: "POST",
    headers: {
      "x-api-key": `${getUserXApiKey()}`,
    },
    body: formData,
  }).catch(({ status }) => {
    const message =
      status === 413
        ? "حجم فایل انتخاب شده بیش از حد مجاز است."
        : `مشکلی در آپلود فایل ${file.name} پیش آمده`;

    notify.update({
      id: toastId,
      message,
      color: "red",
      loading: false,
      autoClose: 5000,
    });
  });

  if (!mediaResponse) return;

  notify.update({
    id: toastId,
    message: `فایل ${file.name} آپلود شد`,
    color: "green",
    loading: false,
    autoClose: 5000,
  });

  return mediaResponse;
}

function UploadAttachments({ onCancel }: { onCancel: () => void }) {
  const [files, setFiles] = useState<File[] | null>(null);

  const pickedAtLeastOneFile = (files ?? []).length > 0;

  const handleUpload = async () => {
    if (!files) return;

    const uploadedFiles = await Promise.all(
      files.map((file) => uploadFile(file))
    ).catch((err) => {
      console.error(err);
    });

    onCancel();

    return uploadedFiles;
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
