document.addEventListener("DOMContentLoaded", function () {
    const homeBtn = document.getElementById('home-btn');
    const moviesButton = document.getElementById('movies-btn');
    const tvshowContainer = document.getElementById('tvshow-container');
    const paginationContainer = document.getElementById("pagination-container");
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-btn'); 

    const BASE_URL = 'https://api.themoviedb.org/3';
    const API_KEY = '967f0841c4109230328c29bad5fe36f3';

    let currentPage = 1;
    let totalPages = 1;
    let displayedTvshowIds = new Set();
    let searchTerm = localStorage.getItem('searchTerm') || ''; 

    // Fetch TV show data from TMDB
    const fetchTvshows = async (page = 1, query = '') => {
        try {
            let url = `${BASE_URL}/trending/tv/week?api_key=${API_KEY}&page=${page}`;
            if (query) {
                url = `${BASE_URL}/search/tv?api_key=${API_KEY}&query=${query}&page=${page}`;
            }
            const response = await fetch(url);
            if (!response.ok) throw new Error("Network response was not ok");
            const data = await response.json();
            totalPages = data.total_pages;
            return data.results || [];
        } catch (error) {
            tvshowContainer.innerHTML = "<p>Error loading TV shows. Please try again later.</p>";
            console.error("Error fetching TV shows:", error);
            return [];
        }
    };

    // Display TV show cards in the container
    function displayTvshows(tvshows) {
        tvshowContainer.innerHTML = ''; 
        displayedTvshowIds.clear(); 

        tvshows.forEach(tvshow => {
            if (!displayedTvshowIds.has(tvshow.id)) {
                const tvshowCard = createTvshowCard(tvshow);
                tvshowCard.setAttribute('data-id', tvshow.id);
                tvshowCard.addEventListener('click', () => redirectToDetailsPage(tvshow.id));
                tvshowContainer.appendChild(tvshowCard);
                displayedTvshowIds.add(tvshow.id);

                // Show and hide the rating overlay on hover
                tvshowCard.addEventListener('mouseenter', () => {
                    tvshowCard.querySelector('.rating-overlay').style.visibility = 'visible';
                });
                tvshowCard.addEventListener('mouseleave', () => {
                    tvshowCard.querySelector('.rating-overlay').style.visibility = 'hidden';
                });
            }
        });
    }

    // Create a TV show card element
    function createTvshowCard(tvshow) {
        const tvshowCard = document.createElement('div');
        tvshowCard.classList.add('tvshow-card');

        const imgContainer = document.createElement('div');
        imgContainer.classList.add('img-container');

        const tvshowImage = document.createElement('img');
        tvshowImage.src = tvshow.poster_path
            ? `https://image.tmdb.org/t/p/w500${tvshow.poster_path}`
            : 'default-image.jpg';
        tvshowImage.alt = tvshow.name || 'Default TV Show Image';

        imgContainer.appendChild(tvshowImage);
        tvshowCard.appendChild(imgContainer);

        // Create and append rating overlay
        const ratingOverlay = document.createElement('div');
        ratingOverlay.classList.add('rating-overlay');
        ratingOverlay.innerHTML = `
            <span class="material-icons" style="font-size: 30px; color: gold;">star</span>
            <span>${tvshow.vote_average || 'N/A'}</span>
        `;
        tvshowCard.appendChild(ratingOverlay);

        return tvshowCard;
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
            fetchAndDisplayTvshows(searchTerm); 
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

    async function fetchAndDisplayTvshows(query = '') {
        const tvshows = await fetchTvshows(currentPage, query);
        displayTvshows(tvshows);
        updatePaginationButtons();
    }

    function redirectToDetailsPage(id) {
        window.location.href = `Show-Card.html?id=${id}`;
    }

    function setupRedirectListeners() {
        const redirectToCategoryPage = (type) => {
            window.location.href = `${type}.html`;
        };

        homeBtn?.addEventListener('click', () => redirectToCategoryPage('index'));
        moviesButton?.addEventListener('click', () => redirectToCategoryPage('movies'));
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
        fetchAndDisplayTvshows(searchTerm); 
    });

    window.addEventListener('beforeunload', () => {
        localStorage.setItem('searchTerm', searchTerm); 
    });
});