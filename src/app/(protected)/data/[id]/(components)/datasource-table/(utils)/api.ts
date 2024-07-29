import { ax } from "@shared/api/axios-instance";
import urls from "@shared/api/urls";
import { getCommonHeaders } from "@shared/api/utils";
import { downloadThisLink } from "@shared/utils/general";
import { AxiosRequestConfig } from "axios";

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

  const res = await ax.patch(url, body, options);
}

export async function exportDatasourceTable({
  tableName,
  query,
  format,
  datasourceName,
}: {
  tableName: string;
  query: string;
  format: string;
  datasourceName: string;
}) {
  const url = `${urls.transfer.export}?table=${tableName}&query=${query}&format=${format}`;

  const options: AxiosRequestConfig = {
    headers: getCommonHeaders(),
    responseType: "blob",
  };

  const res = await ax.get(url, options);

  const data = await res.data;

  if (!data) {
    return { success: false };
  }

  try {
    const blobUrl = window.URL.createObjectURL(data);

    downloadThisLink({
      name: datasourceName,
      url: blobUrl,
    });

    return { success: true };
  } catch (error) {
    console.log(error);
    return { success: false };
  }
}
