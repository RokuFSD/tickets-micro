import Link from "next/link";

export default function Page({currentUser, tickets}) {
  const ticketList = tickets.map(ticket => (
      <tr key={ticket.id}>
        <td>{ticket.title}</td>
        <td>{ticket.price}</td>
        <td>
          <Link href="tickets/[ticketId]" as={`/tickets/${ticket.id}`}>View</Link>
        </td>
      </tr>
  ))
  return (
      <div>
        <h2> Tickets </h2>
        <table className="table">
          <thead>
          <tr>
            <th>Title</th>
            <th>Price</th>
            <th>Link</th>
          </tr>
          </thead>
          <tbody>
          {ticketList}
          </tbody>
        </table>
      </div>
  )
}

Page.getInitialProps = async (context) => {
  const {client, currentUser} = context
  const {data} = await client.get("/api/tickets")

  return {tickets: data};
}