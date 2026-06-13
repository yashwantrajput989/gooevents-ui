import { Calendar, MapPin, Ticket as TicketIcon } from 'lucide-react';
import API_BASE_URL from '../config';
import './MyTickets.css';

const MyTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (user) {
      const fetchTickets = async () => {
        try {
          const res = await axios.get(`${API_BASE_URL}/bookings/my-tickets?email=${user.email}`);
          setTickets(res.data);
        } catch (err) {
          console.error('Error fetching tickets:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchTickets();
    } else {
      setLoading(false);
    }
  }, []);

  if (!user) return (
    <div className="container loading">
      Please sign in to view your tickets.
    </div>
  );

  if (loading) return <div className="loading">Loading your tickets...</div>;

  return (
    <div className="my-tickets-page container">
      <h1 className="page-title">My <span className="gradient-text">Tickets</span></h1>
      
      {tickets.length === 0 ? (
        <div className="no-tickets card glass">
          <TicketIcon size={48} className="muted-icon" />
          <h3>No tickets found</h3>
          <p>You haven't booked any shows yet. Explore the latest shows and start booking!</p>
          <button className="btn-primary mt-24" onClick={() => window.location.href = '/'}>Explore Shows</button>
        </div>
      ) : (
        <div className="tickets-list">
          {tickets.map(ticket => (
            <div key={ticket._id} className="ticket-card card glass">
              <div className="ticket-visual">
                <img src={ticket.showDetails.poster} alt={ticket.showDetails.title} />
              </div>
              
              <div className="ticket-info">
                <div className="ticket-header">
                  <h2>{ticket.showDetails.title}</h2>
                  <span className="ticket-status">{ticket.status}</span>
                </div>
                
                <div className="ticket-meta">
                  <div className="meta-item">
                    <Calendar size={16} />
                    <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="meta-item">
                    <TicketIcon size={16} />
                    <span>{ticket.tickets} Tickets</span>
                  </div>
                  <div className="meta-item">
                    <MapPin size={16} />
                    <span>Premium Cinema 4, PVR</span>
                  </div>
                </div>

                <div className="ticket-footer">
                  <div className="ticket-id">
                    <span>Booking ID</span>
                    <strong>{ticket._id.substring(ticket._id.length - 8).toUpperCase()}</strong>
                  </div>
                  <div className="ticket-amount">
                    <span>Amount Paid</span>
                    <strong>₹{ticket.totalAmount}</strong>
                  </div>
                </div>
              </div>

              <div className="ticket-qr-container">
                <div className="qr-wrapper glass">
                  <QRCodeSVG value={ticket.qrData} size={120} bgColor="transparent" fgColor="#ffffff" />
                </div>
                <span>Scan at Entrance</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyTickets;
