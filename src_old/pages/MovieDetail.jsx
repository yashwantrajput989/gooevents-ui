import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Calendar, Clock, Star, Play, ShieldCheck } from 'lucide-react';
import API_BASE_URL from '../config';
import './MovieDetail.css';

const MovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [show, setShow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ticketCount, setTicketCount] = useState(1);

  useEffect(() => {
    const fetchShow = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/shows/${id}`);
        setShow(res.data);
      } catch (err) {
        console.error('Error fetching show details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchShow();
  }, [id]);

  const handleBookNow = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      navigate('/auth', { state: { returnUrl: `/movie/${id}`, ticketCount } });
    } else {
      // Proceed to checkout
      navigate('/checkout', { state: { show, ticketCount } });
    }
  };

  if (loading) return <div className="loading">Loading details...</div>;
  if (!show) return <div className="loading">Show not found</div>;

  return (
    <div className="movie-detail-page">
      <div className="detail-hero">
        <div className="detail-backdrop-container">
          <img src={show.backdrop} alt="" className="detail-backdrop" />
          <div className="detail-backdrop-overlay"></div>
        </div>
        
        <div className="container detail-content">
          <div className="detail-poster-container">
            <img src={show.poster} alt={show.title} className="detail-poster" />
            {show.trailerUrl && (
              <button className="trailer-btn glass">
                <Play fill="currentColor" /> Watch Trailer
              </button>
            )}
          </div>

          <div className="detail-info">
            <div className="detail-header">
              <h1>{show.title}</h1>
              <div className="detail-meta">
                <div className="rating-badge">
                  <Star size={16} fill="currentColor" /> {show.rating}/10
                </div>
                <span>{show.duration}</span>
                <span>{show.genre.join(', ')}</span>
                <span>{show.language}</span>
              </div>
            </div>

            <div className="detail-description">
              <h3>About the Event</h3>
              <p>{show.description}</p>
            </div>

            <div className="booking-widget card glass">
              <div className="widget-header">
                <h3>Select Tickets</h3>
                <span className="price-label">₹{show.price}/ticket</span>
              </div>
              
              <div className="ticket-selector">
                <button onClick={() => setTicketCount(Math.max(1, ticketCount - 1))}>-</button>
                <span>{ticketCount}</span>
                <button onClick={() => setTicketCount(ticketCount + 1)}>+</button>
              </div>

              <div className="total-amount">
                <span>Total Amount</span>
                <span className="amount">₹{show.price * ticketCount}</span>
              </div>

              <button className="btn-primary w-100" onClick={handleBookNow}>
                Book Now
              </button>
              
              <p className="secure-tag">
                <ShieldCheck size={14} /> Secure Payment via Stripe
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetail;
