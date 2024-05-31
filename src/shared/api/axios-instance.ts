import { MAPIR_API_BASE } from "@shared/config";
import axios from "axios";

export const ax = axios.create({ validateStatus: () => true, baseURL: MAPIR_API_BASE });
