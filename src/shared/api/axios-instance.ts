import { API_BASE } from "@shared/config";
import axios from "axios";

export const ax = axios.create({ validateStatus: () => true, baseURL: API_BASE });
