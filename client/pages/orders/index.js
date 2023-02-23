function Orders({orders}) {
  return <ul>
    {orders?.map(order => <li key={order.id}>
      {order.ticket.title} - {order.status}
    </li>)}
  </ul>
}

Orders.getInitialProps = async (context) => {
  const {client} = context;
  const {data} = await client.get("/api/orders")

  return {orders: data};
}

export default Orders