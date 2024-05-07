import { API_BASE } from "@shared/config";
import axios from "axios";

export const ax = axios.create({ validateStatus: () => false, baseURL: API_BASE });
