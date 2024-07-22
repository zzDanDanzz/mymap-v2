import { ColumnDataType, DatasourceRow } from "@shared/types/datasource.types";
import React from "react";
import { RenderEditCellProps } from "react-data-grid";

type CellEditorProps = RenderEditCellProps<DatasourceRow> & {
  dataType: ColumnDataType;
};

function CellTextEditor(props: CellEditorProps): JSX.Element {
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <input
      ref={inputRef}
      type="text"
      defaultValue={String(props.row[props.column.key])}
      onChange={(e) => {
        props.onRowChange({ ...props.row, [props.column.key]: e.target.value });
      }}
    />
  );
}

function CellEditor(props: CellEditorProps): JSX.Element {
  switch (props.dataType) {
    case "point":
    case "linestring":
    case "polygon":
    case "multipoint":
    case "multilinestring":
    case "multipolygon":
    case "geometrycollection":
    case "geometry":
      return <span>geom tho</span>;

    case "bool":
      return <span>bool tho</span>;

    case "attachment":
      return <span>attachment tho</span>;

    default:
      return <CellTextEditor {...props} />;
  }
}

export default CellEditor;
