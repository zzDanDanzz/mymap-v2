import { Button, FileButton, Group, Stack, Text } from "@mantine/core";
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

  const mediaUplaodToastId = toast.loading("آپلود فایل ضمیمه") as
    | string
    | number;

  const updateProgress = (event: ProgressEvent<EventTarget>) => {
    const progress = Math.round((event.loaded / event.total) * 100);
    toast.update(mediaUplaodToastId as string | number, {
      render: `آپلود فایل ضمیمه - ${toFaDigits(progress)}%`,
    });
  };

  const mediaResponse = await fetchWithProgress<IMediaResponse>(
    `${urls.media}`,
    {
      method: "POST",
      headers: {
        // token: token ?? '',
        "x-api-key": `${getMapAPIKey()}`,
      },
      body: formData,
    },
    updateProgress,
  ).catch(({ status, statusText }) => {
    let message = "مشکلی در آپلود تصویر پیش آمده.";
    if (status === 413) {
      message = "حجم فایل انتخاب شده بیش از حد مجاز است.";
    }

    toast.update(mediaUplaodToastId as string | number, {
      render: message,
      type: "error",
      isLoading: false,
      autoClose: 1000,
    });

    return undefined;

    /// TODO: Remove file from uploadings
  });

  if (!mediaResponse) return;

  toast.update(mediaUplaodToastId, {
    render: `تصویر قرارداد آپلود شد`,
    type: "success",
    isLoading: false,
    autoClose: 2000,
  });

  return mediaResponse;
}

function UploadAttachments({ onCancel }: { onCancel: () => void }) {
  const [files, setFiles] = useState<File[] | null>(null);

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
        <Button disabled={!((files ?? [])?.length > 1)}>آپلود</Button>
      </Group>
    </Stack>
  );
}

export default UploadAttachments;
