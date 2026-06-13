import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MovieCard from '../components/MovieCard';
import API_BASE_URL from '../config';
import './Home.css';
import { ChevronRight } from 'lucide-react';

const Home = () => {
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShows = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/shows`);
        setShows(res.data);
      } catch (err) {
        console.error('Error fetching shows:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchShows();
  }, []);

  const standups = shows.filter(show => show.category === 'Standup');
  const concerts = shows.filter(show => show.category === 'Concert');
  const openMics = shows.filter(show => show.category === 'Open Mic');

  if (loading) return <div className="loading">Loading experiences...</div>;

  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-content fade-in">
          <span className="hero-tag">Trending Now</span>
          <h1>Experience Entertainment Like <span className="gradient-text">Never Before</span></h1>
          <p>Book tickets for the latest movies, concerts, and exclusive events in your city.</p>
          <button className="btn-primary">Explore Shows</button>
        </div>
        <div className="hero-overlay"></div>
        <img 
          src="https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2059&auto=format&fit=crop" 
          alt="Hero" 
          className="hero-bg" 
        />
      </section>

      <div className="container">
        <section className="shows-section">
          <div className="section-header">
            <h2>Live <span className="gradient-text">Concerts</span></h2>
            <button className="view-all">View All <ChevronRight size={16} /></button>
          </div>
          <div className="shows-grid">
            {concerts.map(show => (
              <MovieCard key={show._id} show={show} />
            ))}
          </div>
        </section>

        <section className="shows-section">
          <div className="section-header">
            <h2>Top <span className="gradient-text">Standups</span></h2>
            <button className="view-all">View All <ChevronRight size={16} /></button>
          </div>
          <div className="shows-grid">
            {standups.map(show => (
              <MovieCard key={show._id} show={show} />
            ))}
          </div>
        </section>

        <section className="shows-section">
          <div className="section-header">
            <h2>Upcoming <span className="gradient-text">Open Mics</span></h2>
            <button className="view-all">View All <ChevronRight size={16} /></button>
          </div>
          <div className="shows-grid">
            {openMics.map(show => (
              <MovieCard key={show._id} show={show} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
