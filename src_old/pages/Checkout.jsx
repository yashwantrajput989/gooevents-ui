import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';
import API_BASE_URL from '../config';
import './Checkout.css';

const stripePromise = loadStripe('pk_test_TYooMQauvdEDq54NiTphI7jx');

const MockCheckoutForm = ({ show, ticketCount, totalAmount }) => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    
    setTimeout(async () => {
      const user = JSON.parse(localStorage.getItem('user'));
      try {
        await axios.post(`${API_BASE_URL}/bookings`, {
          user,
          showId: show._id,
          showDetails: {
            title: show.title,
            poster: show.poster,
            price: show.price
          },
          tickets: ticketCount,
          totalAmount: totalAmount,
          paymentIntentId: 'mock_' + Date.now()
        });
        navigate('/my-tickets', { state: { success: true } });
      } catch (err) {
        setMessage("Booking failed. Please check backend console.");
      }
      setIsProcessing(false);
    }, 1500);
  };

  return (
    <form onSubmit={handleSubmit} className="glass card checkout-form">
      <h3>Payment (Demo Mode)</h3>
      <div className="mock-payment-info">
        <p>The app is running in Demo Mode because no Stripe Key was found.</p>
        <p>Click below to simulate a successful payment.</p>
      </div>
      <button disabled={isProcessing} className="btn-primary w-100 mt-24">
        <span>{isProcessing ? "Processing..." : `Pay ₹${totalAmount}`}</span>
      </button>
      {message && <div id="payment-message">{message}</div>}
    </form>
  );
};

const StripeCheckoutForm = ({ show, ticketCount, totalAmount }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setIsProcessing(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });

    if (error) {
      setMessage(error.message);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      const user = JSON.parse(localStorage.getItem('user'));
      try {
        await axios.post(`${API_BASE_URL}/bookings`, {
          user,
          showId: show._id,
          showDetails: {
            title: show.title,
            poster: show.poster,
            price: show.price
          },
          tickets: ticketCount,
          totalAmount: totalAmount,
          paymentIntentId: paymentIntent.id
        });
        navigate('/my-tickets', { state: { success: true } });
      } catch (err) {
        setMessage("Booking failed but payment succeeded.");
      }
    }
    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="glass card checkout-form">
      <h3>Payment Details</h3>
      <PaymentElement id="payment-element" />
      <button disabled={isProcessing || !stripe || !elements} className="btn-primary w-100 mt-24">
        <span>{isProcessing ? "Processing..." : `Pay ₹${totalAmount}`}</span>
      </button>
      {message && <div id="payment-message">{message}</div>}
    </form>
  );
};

const Checkout = () => {
  const location = useLocation();
  const { show, ticketCount } = location.state || {};
  const [paymentData, setPaymentData] = useState(null);

  const totalAmount = show ? show.price * ticketCount : 0;

  useEffect(() => {
    if (totalAmount > 0) {
      axios.post(`${API_BASE_URL}/payments/create-intent`, { amount: totalAmount })
        .then((res) => setPaymentData(res.data))
        .catch((err) => console.error(err));
    }
  }, [totalAmount]);

  if (!show) return <div className="loading">Invalid Checkout Session</div>;

  const appearance = {
    theme: 'night',
    variables: { colorPrimary: '#f97316' },
  };

  return (
    <div className="checkout-page container">
      <div className="checkout-layout">
        <div className="order-summary card glass">
          <h2>Order Summary</h2>
          <div className="summary-item">
            <img src={show.poster} alt={show.title} />
            <div>
              <h4>{show.title}</h4>
              <p>{show.category} • {show.language}</p>
            </div>
          </div>
          <div className="summary-details">
            <div className="summary-row">
              <span>Tickets ({ticketCount})</span>
              <span>₹{show.price * ticketCount}</span>
            </div>
            <div className="summary-row">
              <span>Booking Fees</span>
              <span>₹45</span>
            </div>
            <hr />
            <div className="summary-row total">
              <span>Total Amount</span>
              <span>₹{show.price * ticketCount + 45}</span>
            </div>
          </div>
        </div>

        <div className="payment-container">
          {paymentData?.isMock ? (
            <MockCheckoutForm show={show} ticketCount={ticketCount} totalAmount={totalAmount + 45} />
          ) : paymentData?.clientSecret ? (
            <Elements options={{ clientSecret: paymentData.clientSecret, appearance }} stripe={stripePromise}>
              <StripeCheckoutForm show={show} ticketCount={ticketCount} totalAmount={totalAmount + 45} />
            </Elements>
          ) : (
            <div className="loading">Initializing Payment...</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Checkout;
