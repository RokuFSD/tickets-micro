import {useState, useEffect} from "react";
import StripeCheckout from "react-stripe-checkout";
import useRequest from "../../hooks/use-request";
import Router from "next/router";

function OrderShow({order, currentUser}) {
  const [timeLeft, setTimeLeft] = useState(0)
  const {doRequest, error} = useRequest({
    url: "/api/payments",
    method: "post",
    body: {orderId: order.id},
    onSuccess: () =>  Router.push("/orders"),
  })

  useEffect(() => {
    function findTimeLeft() {
      const msLeft = new Date(order.expiresAt) - new Date();
      setTimeLeft(Math.round(msLeft / 1000))
    }

    findTimeLeft()

    const interval = setInterval(findTimeLeft, 1000)

    return () => clearInterval(interval)
  }, [])

  if (timeLeft < 0) {
    return <div>Order Expired</div>
  }

  return <div>
    {timeLeft} seconds until order expires
    <StripeCheckout token={({ id }) => doRequest({token: id})}
                    amount={order.ticket.price * 100}
                    email={currentUser.email}
                    stripeKey="pk_test_51MdEOcKV7I06Eemdpklxg6cUmS51vaf8SnXQKdA09IqXDjyBY8348RAXlnddSV2cEpEApph0j44hVPZNLczq0dw7006E3niHuf"/>
    {error}
  </div>
}

OrderShow.getInitialProps = async (context) => {
  const {client, query: {orderId}} = context
  const {data} = await client.get(`/api/orders/${orderId}`)
  return {order: data}
}

export default OrderShow