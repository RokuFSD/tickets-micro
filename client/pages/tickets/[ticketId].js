import useRequest from "../../hooks/use-request";
import Router from "next/router";

function TicketShow({ticket}) {
  const {doRequest, errors} = useRequest({
    url: "/api/orders",
    method: "post",
    body: {
      ticketId: ticket.id
    },
    onSuccess: (order) => Router.push('/orders/[orderId]', `/orders/${order.id}`)
  })

  return (
      <div>
        <h1>{ticket.title}</h1>
        <h4>Price: ${ticket.price}</h4>
        {errors}
        <button className="btn btn-primary" type="button" onClick={() => doRequest()}>Purchase</button>
      </div>
  )
}

TicketShow.getInitialProps = async (context) => {
  const {client, query: {ticketId}} = context
  const {data} = await client.get(`/api/tickets/${ticketId}`)
  return {ticket: data}
}

export default TicketShow