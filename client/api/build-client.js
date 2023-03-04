import axios from "axios";

export default ({req}) => {
  if (typeof window === "undefined") {
    // We are on the server
    return axios.create({
      baseURL: "http://www.rokudev.engineer/",
      headers: req.headers
    })
  } else {
    return axios.create({
      baseURL: '/'
    })
  }
}