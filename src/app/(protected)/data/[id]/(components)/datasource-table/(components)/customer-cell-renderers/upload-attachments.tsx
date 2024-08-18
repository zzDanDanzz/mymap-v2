import {
  ActionIcon,
  Button,
  Text,
  FileButton,
  Group,
  Stack,
} from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import { useRef, useState } from "react";

function UploadAttachments() {
  const [files, setFiles] = useState<File[] | null>(null);

  const resetRef = useRef<() => void>(null);

  const clearFile = () => {
    setFiles(null);
    resetRef.current?.();
  };
  return (
    <Stack gap={"xs"}>
      <Group>
        <FileButton resetRef={resetRef} onChange={setFiles} multiple>
          {(props) => <Button {...props}>انتخاب فایل(ها)</Button>}
        </FileButton>
        <Group gap={"xs"}>
          <ActionIcon disabled={!files} color="red" onClick={clearFile}>
            <IconTrash />
          </ActionIcon>
          {files && <Text size="sm">({files.length})</Text>}
        </Group>
      </Group>

      {files && <Text size="sm">{files.map((f) => f.name).join(", ")}</Text>}
    </Stack>
  );
}

export default UploadAttachments;
