const API_KEY = '967f0841c4109230328c29bad5fe36f3';
const BASE_URL = 'https://api.themoviedb.org/3';

let allMovies = [];
let allTVShows = [];
let featuredMovies = [];
let currentFeaturedIndex = 0;

document.addEventListener('DOMContentLoaded', () => {
    fetchTrendingMovies();
    fetchTrendingTVShows();
    fetchFeaturedMovie();
    setupRedirectListeners();
    setupSearchListener();
});

// Fetch Trending Movies
const fetchTrendingMovies = async () => {
    try {
        const response = await fetch(`${BASE_URL}/trending/movie/week?api_key=${API_KEY}`);
        const data = await response.json();
        allMovies = data.results;

        displayMovies(allMovies.slice(0, 10));
        populateFeaturedMovie(allMovies[0]);
    } catch (error) {
        displayErrorMessage('Trending movies could not be loaded at this time.');
    }
};

// Fetch Trending TV Shows
const fetchTrendingTVShows = async () => {
    try {
        const response = await fetch(`${BASE_URL}/trending/tv/week?api_key=${API_KEY}`);
        const data = await response.json();
        allTVShows = data.results;

        displayTVShows(allTVShows.slice(0, 10));
    } catch (error) {
        displayErrorMessage('Trending TV shows could not be loaded at this time.');
    }
};

// Fetch Featured Movie
const fetchFeaturedMovie = async () => {
    try {
        const response = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}`);
        const data = await response.json();
        featuredMovies = data.results.slice(0, 5);
        populateFeaturedMovie(featuredMovies[currentFeaturedIndex]);
        setupAutoRotateFeaturedMovies();
    } catch (error) {
        displayErrorMessage('Featured movie could not be loaded.');
    }
};

// Populate Featured Movie
const populateFeaturedMovie = (movie) => {
    document.getElementById('featured-title').textContent = movie.title || 'Unknown Title';
    document.getElementById('featured-release-year').textContent = new Date(movie.release_date).getFullYear() || 'N/A';
    document.getElementById('featured-rating').textContent = movie.vote_average || 'N/A';
    document.getElementById('featured-description').textContent = movie.overview || 'No description available.';
    document.getElementById('featured-movie-image').src = movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : 'default-image.jpg';
    document.getElementById('featured-genres').textContent = `Genres: ${movie.genres?.map(genre => genre.name).join(', ') || 'N/A'}`;
    document.getElementById('featured-more-info').addEventListener('click', () => {
        window.location.href = `Movie-Card.html?id=${movie.id}&type=movie`;
    });
};

// Rotate Featured Movies
const setupAutoRotateFeaturedMovies = () => {
    setInterval(() => {
        currentFeaturedIndex = (currentFeaturedIndex + 1) % featuredMovies.length;
        populateFeaturedMovie(featuredMovies[currentFeaturedIndex]);
    }, 3200);
};

// Search Functionality
const setupSearchListener = () => {
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-btn');

    const searchHandler = () => {
        const query = searchInput.value.trim();
        if (!query) {
            clearSearchResults();
            displayMovies(allMovies.slice(0, 10));
            displayTVShows(allTVShows.slice(0, 10));
            return;
        }
        clearErrorMessage();
        searchMovies(query);
        searchTVShows(query);
    };

    searchButton.addEventListener('click', searchHandler);
    searchInput.addEventListener('input', (e) => {
        if (!e.target.value) {
            clearSearchResults();
            displayMovies(allMovies.slice(0, 10));
            displayTVShows(allTVShows.slice(0, 10));
        }
    });
};

const searchMovies = async (query) => {
    try {
        showLoading('movie-container');
        const response = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${query}`);
        const data = await response.json();
        if (data.results.length > 0) {
            displayMovies(data.results.slice(0, 10));
            document.getElementById('movie-container').style.display = 'flex';
        } else {
            document.getElementById('movie-container').style.display = 'none';
        }
    } catch (error) {
        displayErrorMessage('Error searching for movies.');
    }
};

const searchTVShows = async (query) => {
    try {
        showLoading('tv-show-container');
        const response = await fetch(`${BASE_URL}/search/tv?api_key=${API_KEY}&query=${query}`);
        const data = await response.json();
        if (data.results.length > 0) {
            displayTVShows(data.results.slice(0, 10));
            document.getElementById('tv-show-container').style.display = 'flex';
        } else {
            document.getElementById('tv-show-container').style.display = 'none';
        }
    } catch (error) {
        displayErrorMessage('Error searching for TV shows.');
    }
};

// Display Movies
const displayMovies = (movies) => {
    const container = document.getElementById('movie-container');
    container.innerHTML = movies.length
        ? movies.map((movie) => `
            <div class="list" style="background-image: url('https://image.tmdb.org/t/p/w500${movie.poster_path || ''}')"
                data-movie-id="${movie.id}">
                <div class="rating-overlay">
                    <span class="material-icons" style="font-size: 24px; color: gold;">star</span>
                    <span>${movie.vote_average || 'N/A'}</span> <!-- Rating Value -->
                </div>
            </div>`).join('')
        : '<p>No movies found.</p>';

    container.querySelectorAll('.list').forEach((movieElement) => {
        const movieId = movieElement.getAttribute('data-movie-id');
        movieElement.addEventListener('click', () => redirectToDetailsPage(movieId));
        
        // Hover effect to show rating
        movieElement.addEventListener('mouseenter', () => {
            movieElement.querySelector('.rating-overlay').style.visibility = 'visible';
        });
        movieElement.addEventListener('mouseleave', () => {
            movieElement.querySelector('.rating-overlay').style.visibility = 'hidden';
        });
    });
};

// Display TV Shows
const displayTVShows = (shows) => {
    const container = document.getElementById('tv-show-container');
    container.innerHTML = shows.length
        ? shows.map((show) => `
            <div class="list" style="background-image: url('https://image.tmdb.org/t/p/w500${show.poster_path || ''}')"
                data-show-id="${show.id}">
                <div class="rating-overlay">
                    <span class="material-icons" style="font-size: 24px; color: gold;">star</span>
                    <span>${show.vote_average || 'N/A'}</span> <!-- Rating Value -->
                </div>
            </div>`).join('')
        : '<p>No TV shows found.</p>';

    container.querySelectorAll('.list').forEach((showElement) => {
        const showId = showElement.getAttribute('data-show-id');
        showElement.addEventListener('click', () => redirectToDetailsPage(showId, false));
        
        // Hover effect to show rating
        showElement.addEventListener('mouseenter', () => {
            showElement.querySelector('.rating-overlay').style.visibility = 'visible';
        });
        showElement.addEventListener('mouseleave', () => {
            showElement.querySelector('.rating-overlay').style.visibility = 'hidden';
        });
    });
};

// Display Error Message
const displayErrorMessage = (message) => {
    const errorContainer = document.getElementById('error-container');
    errorContainer.textContent = message;
    errorContainer.style.display = 'block';
};

// Clear error messages
const clearErrorMessage = () => {
    const errorContainer = document.getElementById('error-container');
    errorContainer.textContent = '';
    errorContainer.style.display = 'none';
};

// Clear Search Results
const clearSearchResults = () => {
    document.getElementById('movie-container').style.display = 'none';
    document.getElementById('tv-show-container').style.display = 'none';
};

// Show loading message
const showLoading = (containerId) => {
    document.getElementById(containerId).innerHTML = '<p>Loading...</p>';
};

// Redirect to Details Page for Movie or TV Show
const redirectToDetailsPage = (id, isMovie = true) => {
    const type = isMovie ? 'movie' : 'tv';
    const url = isMovie ? `Movie-Card.html?id=${id}&type=${type}` : `Show-Card.html?id=${id}&type=${type}`;
    window.location.href = url;
};

// Setup Redirection Listeners
const setupRedirectListeners = () => {
    const tvshowsButton = document.getElementById('tvshows-btn');
    const moviesButton = document.getElementById('movies-btn');
    const seeAllMoviesLink = document.getElementById('see-all-movies');
    const seeAllTVShowsLink = document.getElementById('see-all-tvshows');

    const redirectToCategoryPage = (type) => {
        window.location.href = `${type}.html`;
    };

    if (moviesButton) {
        moviesButton.addEventListener('click', () => redirectToCategoryPage('movies'));
    }

    if (tvshowsButton) {
        tvshowsButton.addEventListener('click', () => redirectToCategoryPage('tv-shows'));
    }

    if (seeAllMoviesLink) {
        seeAllMoviesLink.addEventListener('click', () => redirectToCategoryPage('movies'));
    }

    if (seeAllTVShowsLink) {
        seeAllTVShowsLink.addEventListener('click', () => redirectToCategoryPage('tv-shows'));
    }
};