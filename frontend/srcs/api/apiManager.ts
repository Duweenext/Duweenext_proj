import axios from "axios";

const ApiAxios = axios.create({
  baseURL: "http://10.0.2.2:8080",
  responseType: "json",
  withCredentials: true,
});

export default ApiAxios;
