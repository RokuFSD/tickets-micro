import {useEffect} from "react"
import useRequest from "../../hooks/use-request";
import Router from "next/router";

export default function Signout() {
  const {doRequest} = useRequest({
    url: "/api/users/signout",
    method: 'post',
    body: {},
    onSuccess: () => Router.push('/')
  })
  useEffect(() => {
    async function signout() {
      await doRequest()
    }

    void signout()
  }, [])
}