import { ax } from "@shared/api/axios-instance";
import urls from "@shared/api/urls";
import { getCommonHeaders } from "@shared/api/utils";
import { ODataResponse } from "@shared/types/api.types";
import { Datasource, DatasourceColumn } from "@shared/types/datasource.types";
import { downloadThisLink } from "@shared/utils/general";
import { Column } from "ag-grid-community";
import { AxiosRequestConfig } from "axios";
import isEqual from "lodash.isequal";
import { z } from "zod";
import { addColumnSchema } from "./schemas";

export async function addDatasourceColumn(
  datasourceID: string,
  column: z.infer<typeof addColumnSchema>,
) {
  const url = `${urls.editorTables}/${datasourceID}/columns`;

  const body = {
    columns: [column],
  };

  const options = {
    headers: getCommonHeaders(),
  };

  const res = await ax.post<ODataResponse<DatasourceColumn>>(
    url,
    body,
    options,
  );

  if (res.status >= 200 && res.status < 300 && res.data?.value?.length > 0) {
    return { success: true, updatedColumns: res.data };
  }

  return { success: false };
}

export async function updateDatasourceColumn({
  datasourceId,
  columnID,
  updatedColumnData,
}: {
  datasourceId: string;
  columnID: string;
  updatedColumnData: any;
}) {
  const url = `${urls.editorTables}/${datasourceId}/columns/${columnID}`;

  const body = {
    column: updatedColumnData,
  };

  const options = {
    headers: getCommonHeaders(),
  };

  const res = await ax.patch(url, body, options);

  if (res.status >= 200 && res.status < 300) {
    return { success: true };
  }

  return { success: false };
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
      name: datasourceName + "." + format,
      url: blobUrl,
    });

    return { success: true };
  } catch (error) {
    console.log(error);
    return { success: false };
  }
}

export async function updateColumnOrdering({
  columns_ordering,
  currentDatasource,
}: {
  columns_ordering: string[];
  currentDatasource: Datasource;
}) {
  const url = `${urls.datasources}/${currentDatasource.id}`;

  const body = {
    settings: {
      ...currentDatasource.settings,
      columns_ordering,
    },
  };

  const options = {
    headers: getCommonHeaders(),
  };
  await ax.patch(url, body, options);
}

export async function syncGridColumnsOrderWithApi({
  columns,
  currentDatasource,
}: {
  columns: Column[] | null;
  currentDatasource: Datasource | undefined;
}) {
  if (!columns || !currentDatasource) return;
  try {
    const prevColumnsOrdering = currentDatasource.settings?.columns_ordering;

    const pinnedColumns = columns
      .filter((column) => column.isPinned())
      .map((column) => column.getColDef().field);

    const unpinnedColumns = columns
      .filter((column) => !column.isPinned())
      .map((column) => column.getColDef().field);

    const columnsOrdering = [...pinnedColumns, ...unpinnedColumns] as string[];

    if (isEqual(prevColumnsOrdering, columnsOrdering)) {
      return;
    }

    await updateColumnOrdering({
      columns_ordering: columnsOrdering,
      currentDatasource: currentDatasource,
    });

    return true;
  } catch (error) {
    return false;
  }
}
