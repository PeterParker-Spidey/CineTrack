document.addEventListener("DOMContentLoaded", function () {
    const homeBtn = document.getElementById('home-btn');
    const tvshowsButton = document.getElementById('tvshows-btn');
    const movieContainer = document.getElementById('movie-container');
    const paginationContainer = document.getElementById("pagination-container");
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-btn'); 

    const BASE_URL = 'https://api.themoviedb.org/3';
    const API_KEY = '967f0841c4109230328c29bad5fe36f3';

    let currentPage = 1;
    let totalPages = 1;
    let displayedMovieIds = new Set();
    let searchTerm = localStorage.getItem('searchTerm') || ''; 

    // Fetch movie data from TMDB
    const fetchMovies = async (page = 1, query = '') => {
        try {
            let url = `${BASE_URL}/trending/movie/week?api_key=${API_KEY}&page=${page}`;
            if (query) {
                url = `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${query}&page=${page}`;
            }
            const response = await fetch(url);
            if (!response.ok) throw new Error("Network response was not ok");
            const data = await response.json();
            totalPages = data.total_pages;
            return data.results || [];
        } catch (error) {
            movieContainer.innerHTML = "<p>Error loading movies. Please try again later.</p>";
            console.error("Error fetching movies:", error);
            return [];
        }
    };

    // Display movie cards in the container
    function displayMovies(movies) {
        movieContainer.innerHTML = ''; 
        displayedMovieIds.clear(); 

        movies.forEach(movie => {
            if (!displayedMovieIds.has(movie.id)) {
                const movieCard = createMovieCard(movie);
                movieCard.setAttribute('data-id', movie.id);
                movieCard.addEventListener('click', () => redirectToDetailsPage(movie.id));
                movieContainer.appendChild(movieCard);
                displayedMovieIds.add(movie.id);

                // Show and hide the rating overlay on hover
                movieCard.addEventListener('mouseenter', () => {
                    movieCard.querySelector('.rating-overlay').style.visibility = 'visible';
                });
                movieCard.addEventListener('mouseleave', () => {
                    movieCard.querySelector('.rating-overlay').style.visibility = 'hidden';
                });
            }
        });
    }

    // Create a movie card element
    function createMovieCard(movie) {
        const movieCard = document.createElement('div');
        movieCard.classList.add('movie-card');

        const imgContainer = document.createElement('div');
        imgContainer.classList.add('img-container');

        const movieImage = document.createElement('img');
        movieImage.src = movie.poster_path
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : 'default-image.jpg';
        movieImage.alt = movie.title || 'Default Movie Image';

        imgContainer.appendChild(movieImage);
        movieCard.appendChild(imgContainer);

        // Create and append rating overlay
        const ratingOverlay = document.createElement('div');
        ratingOverlay.classList.add('rating-overlay');
        ratingOverlay.innerHTML = `
            <span class="material-icons" style="font-size: 30px; color: gold;">star</span>
            <span>${movie.vote_average || 'N/A'}</span>
        `;
        movieCard.appendChild(ratingOverlay);

        return movieCard;
    }

    // Update pagination buttons
    function updatePaginationButtons() {
        paginationContainer.innerHTML = '';
        const rangeStart = Math.max(1, currentPage - 1);
        const rangeEnd = Math.min(totalPages, currentPage + 2);

        if (rangeStart > 1) {
            addPaginationButton(1);
            if (rangeStart > 2) addEllipsis();
        }

        for (let i = rangeStart; i <= rangeEnd; i++) {
            addPaginationButton(i, i === currentPage);
        }

        if (rangeEnd < totalPages) {
            if (rangeEnd < totalPages - 1) addEllipsis();
            addPaginationButton(totalPages);
        }
    }

    // Add a pagination button
    function addPaginationButton(page, isActive = false) {
        const button = document.createElement("button");
        button.textContent = page;
        button.classList.toggle("active", isActive);
        button.disabled = isActive;
        button.addEventListener("click", () => {
            currentPage = page;
            localStorage.setItem('currentPage', currentPage); 
            fetchAndDisplayMovies(searchTerm); 
        });
        paginationContainer.appendChild(button);
    }

    // Add an ellipsis in pagination
    function addEllipsis() {
        const ellipsis = document.createElement("span");
        ellipsis.textContent = "...";
        ellipsis.classList.add("ellipsis");
        paginationContainer.appendChild(ellipsis);
    }

    async function fetchAndDisplayMovies(query = '') {
        const movies = await fetchMovies(currentPage, query);
        displayMovies(movies);
        updatePaginationButtons();
    }

    function redirectToDetailsPage(id) {
        window.location.href = `Movie-Card.html?id=${id}`;
    }

    function setupRedirectListeners() {
        const redirectToCategoryPage = (type) => {
            window.location.href = `${type}.html`;
        };

        homeBtn?.addEventListener('click', () => redirectToCategoryPage('index'));
        tvshowsButton.addEventListener('click', () => redirectToCategoryPage('tv-shows'));
    }
    
    setupRedirectListeners();

    function handleSearch() {
        searchTerm = searchInput.value.trim(); 
        currentPage = 1;
        localStorage.setItem('searchTerm', searchTerm); 
        localStorage.setItem('currentPage', currentPage); 
        fetchAndDisplayMovies(searchTerm); 
    }

    searchButton?.addEventListener('click', handleSearch); 
    searchInput?.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            handleSearch(); 
        }
    });

    window.addEventListener('load', () => {
        searchInput.value = searchTerm;
        fetchAndDisplayMovies(searchTerm); 
    });

    window.addEventListener('beforeunload', () => {
        localStorage.setItem('searchTerm', searchTerm); 
    });
});