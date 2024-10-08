import { ActionIcon, Menu } from "@mantine/core";
import useDatasource from "@shared/hooks/swr/datasources/use-datasource";
import notify from "@shared/utils/toasts";
import { IconDownload } from "@tabler/icons-react";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import { exportDatasourceTable } from "../../(utils)/api";

function ExportDatasource() {
  const { id } = useParams<{ id: string }>();

  const { datasource } = useDatasource({ id });

  const menuItems = useMemo(
    () => ["csv", "geojson", "shapefile", "kml", "gml", "xlsx"],
    [],
  );

  return (
    <Menu>
      <Menu.Target>
        <ActionIcon variant="filled" title="دانلود">
          <IconDownload />
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown>
        {menuItems.map((item) => (
          <Menu.Item
            key={item}
            onClick={async () => {
              if (!datasource) return;

              const tableName = datasource.tablename!;

              const { success } = await exportDatasourceTable({
                datasourceName: datasource.name!,
                format: item,
                tableName,
                query: `select*from ${tableName}`,
              });

              if (success) {
                notify.success("با موفقیت دانلود شد");
              } else {
                notify.error("خطا در دانلود");
              }
            }}
          >
            {item}
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
}

export default ExportDatasource;
