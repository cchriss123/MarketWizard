//localStorage.clear();
const searchInput = document.getElementById('search-input');
const resultDiv = document.getElementById('result-label');
const searchResultsDiv = document.getElementById('results');
const favoriteStockDiv = document.getElementById('favorites');
const favoriteStocks = JSON.parse(localStorage.getItem('favoriteStocks')) || [];
document.getElementById('search-form-id').addEventListener('submit', searchSummit);displayFavoriteStocks();
initializePage();
let apiKey;



async function initializePage() {
    apiKey = await fetchAPIKey();
    getMockData().then(displaySearchResults);
    
}


async function fetchAPIKey() {
    return fetch('data/apiKey.json')
        .then(response => response.json())                                                        
        .then(jsonData => apiKey = jsonData.apiKey)
        .catch(error => console.error(error));
}

function searchSummit(event) {
    event.preventDefault();

    const searchTerm = searchInput.value;
    const endpoint = `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${searchTerm}&apikey=${apiKey}`;

    if (searchTerm === '') {
        event.preventDefault(); 
        searchInput.placeholder = "Please enter a search term";
        return; 
    }
    
    fetch(endpoint)
        .then(response => response.json())
        .then( displaySearchResults)
        .catch(error => console.log(error));

    // getMockData().then(displaySearchResults);
}  

function displaySearchResults(data) {
    if (!data['bestMatches'] || data['bestMatches'].length === 0) {
        resultDiv.textContent = "No results found.";
        return;
    }

    searchResultsDiv.innerHTML = '';
    let accumulatedHTML = '';
    resultDiv.textContent = "Search Results:";
    

    data.bestMatches.slice(0, 6).forEach((stock, i) => {
        accumulatedHTML += `
        
        <div class="search-result"> 
                <div>${stock['1. symbol']}</div>
                <div>${stock['2. name']}</div>
                <div>${stock['4. region']}</div>               
                <div>${stock['8. currency']}</div>
            <button class="add-button" id="confirmButton-${i}">Follow</button>
        </div>
        `;        
    });

    searchResultsDiv.innerHTML = accumulatedHTML;
    data.bestMatches.forEach((stock, i) => {
        const button = document.getElementById(`confirmButton-${i}`)
        if (button !== null) {
            button.addEventListener('click', () => addToFavoritesClick(stock))
        }
    });
}



function addToFavoritesClick(stockInfo) {

    if (favoriteStocks.some(stock => stock['1. symbol'] === stockInfo['1. symbol'])) 
        return;

    favoriteStocks.push(stockInfo);
    localStorage.setItem('favoriteStocks', JSON.stringify(favoriteStocks)); 
    displayFavoriteStocks();
}

function displayFavoriteStocks() {
    favoriteStockDiv.innerHTML = '';

    favoriteStocks.forEach(stock => {
        const stockSymbol = stock['1. symbol'];
        const stockName = stock['2. name'];

        const wrapperDiv = document.createElement('div'); 
        wrapperDiv.className = "favorite-wrapper";      
        let link = document.createElement('a');
        link.href = `details.html`;
        link.addEventListener('click',() => localStorage.setItem('currentStock', JSON.stringify(stock))); 

        link.innerHTML = `
            <div class="favorite">
                <div class="favorite-symbol">${stockSymbol}</div>
                <div class="favorite-name">${stockName}</div>
            </div>`;

        wrapperDiv.appendChild(link);   
        favoriteStockDiv.appendChild(wrapperDiv);  
    });
}



async function wait(timeInMs) {
    return new Promise(resolve => setTimeout(resolve, timeInMs));
}


async function getMockData() {
    await wait(500);
    return fetch(`data/mockSearch.json`)
        .then((response) => response.json())
        .catch((error) => console.log(error));   
      
}







