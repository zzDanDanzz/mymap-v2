import Map from "react-map-gl/maplibre";
import urls from "@shared/api/urls";
import { getUserXApiKey } from "@shared/utils/local-storage";

function DatasourceMap({id}: {id: string}) {
  return (
    <Map
      initialViewState={{
        longitude: 51.4015,
        latitude: 35.6425,
        zoom: 12,
      }}
      mapStyle={urls.mapStyles["xyz-style"]}
      transformRequest={(url) => {
        return {
          url,
          headers: {
            "x-api-key": getUserXApiKey(),
          },
        };
      }}
    ></Map>
  );
}

export default DatasourceMap;
