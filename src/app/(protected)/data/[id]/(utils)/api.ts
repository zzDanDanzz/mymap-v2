import { ax } from "@shared/api/axios-instance";
import { getCommonHeaders } from "@shared/api/utils";

export async function updateDatasourceRow({
  datasourceId,
  rowId,
  updatedCell,
}: {
  datasourceId: string;
  rowId: string;
  updatedCell: { [k: string]: unknown };
}) {
  const url = `${}`;

  const res = await ax.patch(url, updatedCell, {
    headers: getCommonHeaders(),
  });
}
