/* PAGE NAVIGATION */

function showPage(pageId) {
    // Hide all the pages
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  
    // Show the selected page only
    document.getElementById(pageId).classList.add('active');
  
    // Update the active nav link
    document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active-link'));
    const activeLink = document.getElementById('link-' + pageId);
    if (activeLink) activeLink.classList.add('active-link');
  
    // Show the search group only on the home page
    const searchGroup = document.getElementById('nav-search-group');
    searchGroup.style.display = (pageId === 'home') ? 'flex' : 'none';
  
    // Scroll to the top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  
  /* FETCH TRAVEL DATA */
  let travelData = null; // cached data
  
  async function fetchTravelData() {
    if (travelData) return travelData; // return cached if already fetched
  
    try {
      const response = await fetch('Travel_Bloom_api.json');
      if (!response.ok) throw new Error('Failed to fetch travel data');
      travelData = await response.json();
      console.log('Travel data loaded:', travelData);
      return travelData;
    } catch (error) {
      console.error('Error fetching travel data:', error);
      return null;
    }
  }
  
  /* KEYWORD MATCHING */
  function classifyKeyword(keyword) {
    const kw = keyword.trim().toLowerCase();
  
    if (kw === 'beach' || kw === 'beaches') return 'beach';
    if (kw === 'temple' || kw === 'temples') return 'temple';
  
    // Country, city names (check against data)
    return 'country'; // fallback: treat as country/city search
  }
  
  /*  GET LOCAL TIME FOR A TIME ZONE */
  function getLocalTime(timeZone) {
    try {
      const options = {
        timeZone,
        hour12: true,
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
      };
      return new Date().toLocaleTimeString('en-US', options);
    } catch {
      return null;
    }
  }
  
  /* RENDER RESULT CARDS  */
  function renderCards(places, label) {
    const section   = document.getElementById('results-section');
    const grid      = document.getElementById('results-grid');
    const heading   = document.getElementById('results-heading');
    const subText   = document.getElementById('results-sub');
  
    grid.innerHTML = '';
  
    if (!places || places.length === 0) {
      heading.textContent = 'No results found';
      subText.textContent = 'Try searching for "beach", "temple", or a country name like "Japan".';
      section.classList.add('visible');
      return;
    }
  
    heading.textContent = `Recommended ${label}`;
    subText.textContent = `${places.length} destination${places.length > 1 ? 's' : ''} matching your search`;
  
    places.forEach((place, i) => {
      const card = document.createElement('div');
      card.className = 'result-card';
      card.style.animationDelay = `${i * 0.1}s`;
  
      // Local time
      const timeHtml = place.timeZone
        ? `<div class="result-card-time">🕐 Local time: ${getLocalTime(place.timeZone)}</div>`
        : '';
  
      card.innerHTML = `
        <img src="${place.imageUrl}" alt="${place.name}" onerror="this.src='https://images.unsplash.com/photo-1488085061387-422e29b40080?w=800&q=80'" />
        <div class="result-card-body">
          <div class="result-card-name">${place.name}</div>
          <p class="result-card-desc">${place.description}</p>
          ${timeHtml}
          <a class="btn-visit" href="#" onclick="return false;">Learn More</a>
        </div>
      `;
      grid.appendChild(card);
    });
  
    section.classList.add('visible');
  
    // Scroll to results
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  
  /* SEARCH HANDLER */
  async function handleSearch() {
    const input   = document.getElementById('search-input');
    const keyword = input.value.trim();
  
    if (!keyword) {
      alert('Please enter a destination keyword to search.');
      return;
    }
  
    const data = await fetchTravelData();
    if (!data) {
      alert('Could not load travel data. Please try again.');
      return;
    }
  
    const kw      = keyword.toLowerCase();
    const category = classifyKeyword(kw);
  
    let results = [];
    let label   = '';
  
    if (category === 'beach') {
      results = data.beaches;
      label   = 'Beaches';
  
    } else if (category === 'temple') {
      results = data.temples;
      label   = 'Temples';
  
    } else {
      // Country / city search (look for matching country name or city name)
      label = 'Destinations';
      data.countries.forEach(country => {
        if (country.name.toLowerCase().includes(kw)) {
          // whole country matched — add all cities
          results.push(...country.cities);
        } else {
          // check individual cities
          country.cities.forEach(city => {
            if (city.name.toLowerCase().includes(kw)) {
              results.push(city);
            }
          });
        }
      });
  
      // If still nothing, also check temples & beaches by name
      if (results.length === 0) {
        data.temples.forEach(t => {
          if (t.name.toLowerCase().includes(kw)) results.push(t);
        });
        data.beaches.forEach(b => {
          if (b.name.toLowerCase().includes(kw)) results.push(b);
        });
      }
    }
  
    renderCards(results, label);
  }
  
  /* RESET HANDLER */
  function handleReset() {
    document.getElementById('search-input').value = '';
    document.getElementById('results-grid').innerHTML = '';
    document.getElementById('results-section').classList.remove('visible');
  }
  
  /* CONTACT FORM */
  function submitForm() {
    const name    = document.getElementById('cf-name').value.trim();
    const email   = document.getElementById('cf-email').value.trim();
    const message = document.getElementById('cf-message').value.trim();
  
    if (!name || !email || !message) {
      alert('Please fill in all fields before submitting.');
      return;
    }
  
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Please enter a valid email address.');
      return;
    }
  
    console.log('Form submitted:', { name, email, message });
  
    // Show success message
    document.getElementById('form-success').style.display = 'block';
  
    // Clear fields
    document.getElementById('cf-name').value    = '';
    document.getElementById('cf-email').value   = '';
    document.getElementById('cf-message').value = '';
  
    // Hide success after 5 seconds
    setTimeout(() => {
      document.getElementById('form-success').style.display = 'none';
    }, 5000);
  }
  
  /* ENTER KEY on search input */
  document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('search-input');
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleSearch();
    });
  
    // Pre-fetch data on page load for faster first search
    fetchTravelData();
  });