const API_KEY = '967f0841c4109230328c29bad5fe36f3';
const BASE_URL = 'https://api.themoviedb.org/3';

const params = new URLSearchParams(window.location.search);
const itemId = params.get('id');

// DOM Elements
const titleElement = document.getElementById('showTitle');
const overviewElement = document.getElementById('showOverview');
const ratingElement = document.getElementById('showRating');
const releaseYearElement = document.getElementById('showReleaseYear');
const genresElement = document.getElementById('showGenres');
const posterElement = document.getElementById('showPoster');
const trailerContainer = document.getElementById('trailerContainer');
const castContainer = document.getElementById('castContainer');
const reviewsContainer = document.getElementById('reviewsContainer');
const streamingContainer = document.getElementById('streamingPlatforms');

// State variables for cast and reviews pagination
let currentCastPage = 0;
let currentReviewsPage = 0;
let castData = [];
let reviewsData = [];

// Fetch and display TV show details
async function fetchItemDetails() {
  try {
    const response = await fetch(`${BASE_URL}/tv/${itemId}?api_key=${API_KEY}`);
    if (!response.ok) throw new Error(`Error fetching TV show details: ${response.status}`);
    const data = await response.json();

    // Populate TV show details
    titleElement.textContent = data.name || 'No title available.';
    overviewElement.textContent = data.overview || 'No description available.';
    ratingElement.textContent = `Rating: ${data.vote_average || 'N/A'}/10`;
    releaseYearElement.textContent = `First Air Date: ${data.first_air_date ? new Date(data.first_air_date).getFullYear() : 'N/A'}`;
    genresElement.textContent = `Genres: ${data.genres.map((g) => g.name).join(', ') || 'N/A'}`;
    posterElement.src = data.poster_path
      ? `https://image.tmdb.org/t/p/w500${data.poster_path}`
      : 'default-image.jpg';
    await fetchTrailer();
    await fetchCast();
    await fetchReviews();
  } catch (error) {
    console.error('Error fetching TV show details:', error);
    trailerContainer.innerHTML = '<p>Error loading details. Please try again later.</p>';
  }
}

// Fetch Streaming Providers
async function fetchStreamingProviders(itemId) {
  try {
    const response = await fetch(`${BASE_URL}/tv/${itemId}/watch/providers?api_key=${API_KEY}`);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error fetching streaming platforms: ${response.status} - ${errorText}`);
    }
    const data = await response.json();
    const countryList = ["PH", "JP", "KR", "SG", ];
    const providersByCountry = {};
    for (const countryCode of countryList) {
      const providers = data.results[countryCode]?.flatrate || [];
      if (providers.length > 0) {
        providersByCountry[countryCode] = providers;
        break; 
      }
    }

    if (Object.keys(providersByCountry).length > 0) {
      displayStreamingProviders(providersByCountry);
    } else {
      providerData.innerHTML = "<p>Not available for streaming</p>";
    }
  } catch (error) {
    console.error("Error fetching streaming providers:", error);
    providerData.innerHTML = `<p>Something went wrong: ${error.message}. Please try again later.</p>`;
  }
}

const streamingServiceLinks = {
  'Apple TV Plus': 'https://tv.apple.com/', 'Netflix': 'https://www.netflix.com/', 'Amazon Prime Video': 'https://www.amazon.com/Prime-Video/',
  'Hulu': 'https://www.hulu.com/', 'Disney Plus': 'https://www.disneyplus.com/', 'HBO Max': 'https://www.hbomax.com/',
  'YouTube': 'https://www.youtube.com/', 'Google Play Movies & TV': 'https://play.google.com/store/movies', 'Crunchyroll': 'https://www.crunchyroll.com/',  
  'Viu': "https://www.viu.com/", 'iflix': 'https://www.iflix.com/', 'iWantTFC': 'https://tfc.tv/', 'Max': 'https://www.max.com/', 'MUBI': 'https://mubi.com',
  // Add more services as needed
};

function displayStreamingProviders(providers) {
  const container = streamingContainer;
  container.innerHTML = ""; 

  for (const countryCode in providers) {
    const countryProviders = providers[countryCode];
    const countryTitle = document.createElement('h3');
    container.appendChild(countryTitle);

    countryProviders.forEach(provider => {
      const logo = document.createElement("img");
      logo.src = `https://image.tmdb.org/t/p/w92${provider.logo_path}`;
      logo.alt = provider.provider_name;
      logo.title = provider.provider_name;
      const providerLink = provider.link || streamingServiceLinks[provider.provider_name];
      if (providerLink) {
        logo.addEventListener("click", () => {
          window.open(providerLink, "_blank");
        });
      } else {
        logo.addEventListener("click", () => {
          alert(`No direct link available for ${provider.provider_name}.`);
        });
      }
      container.appendChild(logo);
    });

    break;
  }
}

// Fetch and embed trailer
async function fetchTrailer() {
  const response = await fetch(`${BASE_URL}/tv/${itemId}/videos?api_key=${API_KEY}`);
  if (!response.ok) throw new Error('Error fetching trailer');
  const data = await response.json();

  const trailer = data.results.find((item) => item.type === 'Trailer');
  if (trailer) {
    const trailerIframe = document.getElementById('trailer');
    trailerIframe.src = `https://www.youtube.com/embed/${trailer.key}`;
  } else {
    trailerContainer.innerHTML = '<p>No trailer available.</p>';
  }
}

// Fetch and display cast details
async function fetchCast() {
  try {
    const response = await fetch(`${BASE_URL}/tv/${itemId}/credits?api_key=${API_KEY}`);
    if (!response.ok) throw new Error('Error fetching cast');
    const data = await response.json();
    castData = data.cast;
    displayCast();
  } catch (error) {
    console.error('Error fetching cast:', error);
  }
}

// Display cast members
function displayCast() {
  castContainer.innerHTML = '';
  const visibleCast = castData.slice(currentCastPage * 8, (currentCastPage + 1) * 8);
  visibleCast.forEach((actor) => {
    const castCard = document.createElement('div');
    castCard.classList.add('cast-card');
    const imageUrl = actor.profile_path
      ? `https://image.tmdb.org/t/p/w500${actor.profile_path}`
      : 'default-image.jpg';

    castCard.innerHTML = `
      <img src="${imageUrl}" alt="${actor.name}" onerror="this.src='https://via.placeholder.com/150x225?text=No+Image';">
      <h4>${actor.name}</h4>
      <p>${actor.character || 'No character specified'}</p>
    `;
    castContainer.appendChild(castCard);
  });
}

// Scroll cast members left or right
function scrollCast(direction) {
  if (direction === 'left' && currentCastPage > 0) {
    currentCastPage--;
  } else if (direction === 'right' && (currentCastPage + 1) * 8 < castData.length) {
    currentCastPage++;
  }
  displayCast();
}

// Fetch and display reviews
async function fetchReviews() {
  try {
    const response = await fetch(`${BASE_URL}/tv/${itemId}/reviews?api_key=${API_KEY}`);
    if (!response.ok) throw new Error('Error fetching reviews');
    const data = await response.json();
    reviewsData = data.results;
    displayReviews();
  } catch (error) {
    console.error('Error fetching reviews:', error);
  }
}

// Display reviews
function displayReviews() {
  reviewsContainer.innerHTML = '';
  const visibleReviews = reviewsData.slice(currentReviewsPage * 3, (currentReviewsPage + 1) * 3);
  visibleReviews.forEach((review) => {
    const reviewCard = document.createElement('div');
    reviewCard.classList.add('review-card');

    const firstParagraph = review.content.split('\n')[0];
    reviewCard.innerHTML = `
      <p class="review-snippet">${firstParagraph}</p>
      <div class="read-more-shadow"></div>
    `;

    reviewCard.addEventListener('click', () => openReviewPopup(review.author, review.content));
    reviewsContainer.appendChild(reviewCard);
  });

  document.querySelectorAll('.review-snippet').forEach((snippet) => {
    snippet.style.lineHeight = '1.5'; 
  });
}

// Scroll reviews left or right
function scrollReviews(direction) {
  if (direction === 'left' && currentReviewsPage > 0) {
    currentReviewsPage--;
  } else if (direction === 'right' && (currentReviewsPage + 1) * 3 < reviewsData.length) {
    currentReviewsPage++;
  }
  displayReviews();
}

function openReviewPopup(author, content) {
  const overlay = document.createElement('div');
  overlay.classList.add('overlay');
  overlay.style.display = 'block'; 

  const popup = document.createElement('div');
  popup.classList.add('review-popup');
  popup.innerHTML = `
    <div class="popup-content">
      <h3>Review by ${author}</h3>
      <p>${content}</p>
      <button class="close-popup">Close</button>
    </div>
  `;

  popup.querySelector('.close-popup').addEventListener('click', () => {
    popup.remove();
    overlay.remove();
  });

  document.body.appendChild(overlay);
  document.body.appendChild(popup);
}

function setupRedirectListeners() {
  document.getElementById('home-btn')?.addEventListener('click', () => redirectTo('index'));
  document.getElementById('movies-btn')?.addEventListener('click', () => redirectTo('movies'));
  document.getElementById('tvshows-btn')?.addEventListener('click', () => redirectTo('tv-shows'));
}

function redirectTo(page) {
  window.location.href = `${page}.html`;
}

fetchItemDetails();
setupRedirectListeners();
fetchStreamingProviders(itemId);