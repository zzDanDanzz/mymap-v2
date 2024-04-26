import axios from "axios";

export const ax = axios.create({ validateStatus: () => false });
