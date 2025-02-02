import type { SelectProps } from "@mantine/core";
import {
  Button,
  Group,
  Modal,
  Select,
  Stack,
  Switch,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import {
  ALL_DATA_TYPES,
  DATA_TYPES_BY_CATEGORY,
  DATA_TYPE_CATEGORIES_TRANSLATIONS,
} from "@shared/constants/datasource.constants";
import { useDatasourceColumns } from "@shared/hooks/swr/datasources/use-datasource-columns";
import { useDatasourceRows } from "@shared/hooks/swr/datasources/use-datasource-rows";
import notify from "@shared/utils/toasts";
import { IconColumnInsertLeft, IconRowInsertBottom } from "@tabler/icons-react";
import { zodResolver } from "mantine-form-zod-resolver";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { z } from "zod";
import { addDatasourceColumn } from "../../(utils)/api";
import { addColumnSchema } from "../../(utils)/schemas";

function AddColumn({ onSuccess }: { onSuccess: () => void }) {
  const { id: datasourceID } = useParams<{ id: string }>();

  const { datasourceColumnsMutate } = useDatasourceColumns({
    id: datasourceID,
  });

  const { datasourceRowsMutate } = useDatasourceRows({
    id: datasourceID,
  });

  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof addColumnSchema>>({
    initialValues: {
      name: "",
      data_type: "string" as (typeof ALL_DATA_TYPES)[number],
      is_nullable: true,
      default_value: undefined,
    },
    validate: zodResolver(addColumnSchema),
    /**
     * if `is_nullable` is `true`, then `default_value` must be undefined so that it won't be sent to the server with axios
     * not done with zod because mantine-form-zod-resolver doesn't seem to support it
     */
    transformValues: (values) => ({
      ...values,
      default_value: values.is_nullable ? undefined : values.default_value,
    }),
    enhanceGetInputProps() {
      return { disabled: loading };
    },
  });

  const selectOptions: SelectProps["data"] = useMemo(
    () =>
      Object.keys(DATA_TYPES_BY_CATEGORY).map((category) => ({
        group: DATA_TYPE_CATEGORIES_TRANSLATIONS[category],
        items:
          DATA_TYPES_BY_CATEGORY[
            category as keyof typeof DATA_TYPES_BY_CATEGORY
          ],
      })),
    []
  );

  async function handleSubmit(values: z.infer<typeof addColumnSchema>) {
    setLoading(true);
    const res = await addDatasourceColumn(datasourceID, values);
    if (res.success) {
      datasourceColumnsMutate(res.updatedColumns);

      if (values.is_nullable === false) {
        // if the column is not nullable, then the rows will have values for this column. need to refetch
        await datasourceRowsMutate();
      }

      onSuccess();
    } else {
      notify.error("ساخت ستون جدید با خطا مواجه شد");
    }
    setLoading(false);
  }

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack>
        <TextInput {...form.getInputProps("name")} label="نام ستون" />
        <Select
          {...form.getInputProps("data_type")}
          label="نوع داده"
          data={selectOptions}
        />
        <Switch
          {...form.getInputProps("is_nullable", { type: "checkbox" })}
          label="می‌تواند خالی باشد"
        />
        <TextInput
          {...form.getInputProps("default_value")}
          label="مقدار پیش فرض"
          disabled={form.values.is_nullable}
        />
        <Button type="submit" loading={loading}>
          افزودن
        </Button>
      </Stack>
    </form>
  );
}

function AddDataButtons() {
  const [isAddColumnModalOpen, setIsAddColumnModalOpen] = useState(false);

  return (
    <Group>
      <Button size="xs" variant="subtle" leftSection={<IconRowInsertBottom />}>
        افزودن سطر
      </Button>
      <Button
        size="xs"
        variant="subtle"
        leftSection={<IconColumnInsertLeft />}
        onClick={() => setIsAddColumnModalOpen(true)}
      >
        افزودن ستون
      </Button>

      <Modal
        opened={isAddColumnModalOpen}
        onClose={() => setIsAddColumnModalOpen(false)}
        title="افزودن ستون"
      >
        <AddColumn onSuccess={() => setIsAddColumnModalOpen(false)} />
      </Modal>
    </Group>
  );
}

export default AddDataButtons;
