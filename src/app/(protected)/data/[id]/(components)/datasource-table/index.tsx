import "ag-grid-community/styles/ag-grid.css"; // Core grid CSS, always needed
import "ag-grid-community/styles/ag-theme-alpine.css"; // Optional theme CSS

import { Group, Stack, Text, TextInput, UnstyledButton } from "@mantine/core";
import useDatasource from "@shared/hooks/swr/datasources/use-datasource";
import { useDatasourceColumns } from "@shared/hooks/swr/datasources/use-datasource-columns";
import { useDatasourceRows } from "@shared/hooks/swr/datasources/use-datasource-rows";
import useCreateQueryString from "@shared/hooks/use-create-query-string";
import { IconSearch, IconSquareX } from "@tabler/icons-react";
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import React, { useEffect, useState } from "react";
import ActionButtons from "./(components)/action-buttons";
import AddDataButtons from "./(components)/add-data-buttons";
import Grid from "./(components)/grid";
import { usePrevious } from "@mantine/hooks";

function useSyncStateWithUrl({
  state,
  paramName,
}: {
  state: string | number;
  paramName: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const createQueryString = useCreateQueryString();

  useEffect(() => {
    router.push(pathname + "?" + createQueryString(paramName, String(state)));
  }, [createQueryString, paramName, pathname, router, state]);

  return null;
}

const getIsPageInvalid = ({
  currentPage,
  totalPageCount,
}: {
  currentPage: number | "";
  totalPageCount: number;
}) => {
  return (
    typeof currentPage === "number" &&
    currentPage >= 1 &&
    currentPage <= totalPageCount
  );
};

export function DatasourceTable() {
  const { id } = useParams<{ id: string }>();

  const params = useSearchParams();

  const [currentPage, setCurrentPage] = useState<number | "">(
    Number(params.get("page") ?? 1),
  );

  const [validatedCurrentPage, setValidatedCurrentPage] = useState<number>(1);

  const [searchText, setSearchText] = useState(params.get("search") ?? "");

  useSyncStateWithUrl({
    state: currentPage === 1 ? "" : currentPage,
    paramName: "page",
  });

  useSyncStateWithUrl({ state: searchText, paramName: "search" });

  // reset page to 1 when search text is changed
  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, setCurrentPage]);

  const {
    datasourceRows,
    datasourceRowsIsValidating,
    totalPageCount,
    totalCount,
  } = useDatasourceRows({
    id,
    search: searchText,
    page: validatedCurrentPage,
  });

  useEffect(() => {
    const isValid = getIsPageInvalid({
      currentPage,
      totalPageCount: totalPageCount,
    });

    if (isValid) {
      setValidatedCurrentPage(currentPage as number);
    }
  }, [currentPage, totalPageCount]);

  const { datasource } = useDatasource({ id });

  const { datasourceColumnsIsLoading } = useDatasourceColumns({ id });

  const prevTotalPageCount = usePrevious(totalPageCount);

  const prevTotalCount = usePrevious(totalCount);

  return (
    <Stack h={"100%"} p={"md"}>
      <title>{datasource?.name}</title>
      <Group justify="space-between">
        <TextInput
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="جستجو"
          rightSection={
            searchText ? (
              <UnstyledButton
                onClick={() => setSearchText("")}
                display={"flex"}
              >
                <IconSquareX />
              </UnstyledButton>
            ) : (
              <IconSearch />
            )
          }
        />
        <ActionButtons />
      </Group>

      <Grid
        loading={datasourceRowsIsValidating || datasourceColumnsIsLoading}
        rowData={datasourceRows}
      />

      <Group justify={"space-between"}>
        <Text ff={"IRANSansWebFa"}>
          رکوردها: {prevTotalCount && !totalCount ? prevTotalCount : totalCount}
        </Text>

        <MinimalPagination
          totalPageCount={
            prevTotalPageCount && prevTotalPageCount > 0 && totalPageCount === 0
              ? prevTotalPageCount
              : totalPageCount
          }
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />

        <AddDataButtons />
      </Group>
    </Stack>
  );
}

function MinimalPagination({
  totalPageCount,
  currentPage,
  setCurrentPage,
}: {
  totalPageCount: number;
  currentPage: number | "";
  setCurrentPage: React.Dispatch<React.SetStateAction<number | "">>;
}) {
  return (
    <Group gap={"xs"}>
      <Text ff={"IRANSansWebFa"}>{totalPageCount}</Text>

      <Text>/</Text>

      <TextInput
        disabled={totalPageCount === 1}
        styles={{ input: { fontFamily: "IRANSansWebFa" } }}
        w={64}
        value={currentPage}
        onChange={(e) => {
          const value = e.target.value;

          // allow empty string
          if (value === "") {
            setCurrentPage(value);
            return;
          }

          const isValid = /^\d+$/.test(value);

          // regex test to allow only digits
          if (isValid) {
            setCurrentPage(Number(value));
          }
        }}
        onBlur={() => {
          // if empty string then set current page to 1
          if (currentPage === "") setCurrentPage(1);
        }}
      />
    </Group>
  );
}

export default DatasourceTable;
