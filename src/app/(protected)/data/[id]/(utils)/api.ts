import { ax } from "@shared/api/axios-instance";
import urls from "@shared/api/urls";
import { getCommonHeaders } from "@shared/api/utils";

export async function updateDatasourceRow({
  datasourceId,
  rowId,
  updatedCellData,
  cellColumnName,
}: {
  datasourceId: string;
  rowId: string;
  cellColumnName: string;
  updatedCellData: unknown;
}) {
  const url = `${urls.editorTables}/${datasourceId}/rows/${rowId}`;

  const body = { data: { [cellColumnName]: updatedCellData } };

  const options = {
    headers: getCommonHeaders(),
  };

  await ax.patch(url, body, options);
}
