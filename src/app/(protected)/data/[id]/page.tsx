"use client";

import "react-data-grid/lib/styles.css";

import DataGrid from "react-data-grid";
import type { Column as ReactDataGridColumn } from "react-data-grid";

import { useDatasourceColumns } from "@shared/hooks/swr/datasources/use-datasource-columns";
import { Loader } from "@mantine/core";
import { useDatasourceRows } from "@shared/hooks/swr/datasources/use-datasource-rows";
import { DatasourceRow } from "@shared/types/datasource.types";

const columnsToHide = ["deleted_at"];

function Page({ params }: { params: { id: string } }) {
  const { datasourceColumns, datasourceColumnsIsLoading } =
    useDatasourceColumns({ id: params.id });

  const { datasourceRows, datasourceRowsIsLoading } = useDatasourceRows({
    id: params.id,
  });

  const transformedColumns =
    datasourceColumns
      ?.filter(({ name }) => !columnsToHide.includes(name))
      .map(
        ({ name, data_type }) =>
          ({
            key: name,
            name: name,
          } as ReactDataGridColumn<DatasourceRow>)
      ) ?? [];

  if (datasourceColumnsIsLoading || datasourceRowsIsLoading) {
    return <Loader />;
  }

  return (
    <DataGrid
      columns={transformedColumns}
      rows={datasourceRows ?? []}
      className="rdg-light"
    />
  );
}

export default Page;
