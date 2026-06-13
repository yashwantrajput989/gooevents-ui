import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock } from 'lucide-react';
import './MovieCard.css';

const MovieCard = ({ show }) => {
  return (
    <Link to={`/movie/${show._id}`} className="movie-card card">
      <div className="card-image-container">
        <img src={show.poster} alt={show.title} className="card-image" />
        <div className="card-rating glass">
          <Star size={14} fill="currentColor" />
          <span>{show.rating}</span>
        </div>
      </div>
      <div className="card-info">
        <h3>{show.title}</h3>
        <p className="card-genre">{show.genre.join(' / ')}</p>
        <div className="card-footer">
          <span className="card-price">₹{show.price} onwards</span>
          <span className="card-duration">
            <Clock size={12} />
            {show.duration}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default MovieCard;
