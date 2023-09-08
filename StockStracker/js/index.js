//localStorage.clear();
const searchInput = document.getElementById('search-input');
const resultDiv = document.getElementById('result-label');
const searchResultsDiv = document.getElementById('results');
const favoriteStockDiv = document.getElementById('favorites');
const favoriteStocks = JSON.parse(localStorage.getItem('favoriteStocks')) || [];
document.getElementById('search-form-id').addEventListener('submit', searchSummit);displayFavoriteStocks();
initializePage();


async function initializePage() {
    let apiKey = await fetchAPIKey();
    // displaySearchResults(getMockData());
    
}


async function fetchAPIKey() {
    return fetch('data/apiKey.json')
        .then(response => response.json())                                                        
        .then(jsonData => apiKey = jsonData.apiKey)
        .catch(error => console.error(error));
}

function searchSummit(event) {
    event.preventDefault();

    let searchTerm = searchInput.value;
    let endpoint = `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${searchTerm}&apikey=${apiKey}`;

    if (searchTerm === '') {
        event.preventDefault(); 
        searchInput.placeholder = "Please enter a search term";
        return; 
    }
    
    // fetch(endpoint)
    //     .then(response => response.json())
    //     .then( displaySearchResults)
    //     .catch(error => console.log(error));

    getMockData().then(displaySearchResults);
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
            <button class="add-button" id="confirmBtn-${i}">Follow</button>
        </div>
        `;        
    });

    searchResultsDiv.innerHTML = accumulatedHTML;
    data.bestMatches.forEach((stock, i) => {
        const button = document.getElementById(`confirmBtn-${i}`)
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
        let stockSymbol = stock['1. symbol'];
        let stockName = stock['2. name'];

        let wrapperDiv = document.createElement('div'); 
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
    await wait(1000);
    return {
        "bestMatches": [
            {
                "1. symbol": "HNNA",
                "2. name": "Hennessy Advisors Inc",
                "3. type": "Equity",
                "4. region": "United States",
                "5. marketOpen": "09:30",
                "6. marketClose": "16:00",
                "7. timezone": "UTC-04",
                "8. currency": "USD",
                "9. matchScore": "0.6000"
            },
            {
                "1. symbol": "HNNMY",
                "2. name": "Hennes & Mauritz AB",
                "3. type": "Equity",
                "4. region": "United States",
                "5. marketOpen": "09:30",
                "6. marketClose": "16:00",
                "7. timezone": "UTC-04",
                "8. currency": "USD",
                "9. matchScore": "0.5455"
            },
            {
                "1. symbol": "HNNAZ",
                "2. name": "Hennessy Advisors Inc",
                "3. type": "Equity",
                "4. region": "United States",
                "5. marketOpen": "09:30",
                "6. marketClose": "16:00",
                "7. timezone": "UTC-04",
                "8. currency": "USD",
                "9. matchScore": "0.5455"
            },
            {
                "1. symbol": "HMRZF",
                "2. name": "Hennes & Mauritz AB - Class B",
                "3. type": "Equity",
                "4. region": "United States",
                "5. marketOpen": "09:30",
                "6. marketClose": "16:00",
                "7. timezone": "UTC-04",
                "8. currency": "USD",
                "9. matchScore": "0.3429"
            },
            {
                "1. symbol": "HBFBX",
                "2. name": "HENNESSY BALANCED FUND INVESTOR CLASS",
                "3. type": "Mutual Fund",
                "4. region": "United States",
                "5. marketOpen": "09:30",
                "6. marketClose": "16:00",
                "7. timezone": "UTC-04",
                "8. currency": "USD",
                "9. matchScore": "0.2791"
            },
            {
                "1. symbol": "HCBFX",
                "2. name": "HENNESSY CORE BOND FUND INVESTOR CLASS",
                "3. type": "Mutual Fund",
                "4. region": "United States",
                "5. marketOpen": "09:30",
                "6. marketClose": "16:00",
                "7. timezone": "UTC-04",
                "8. currency": "USD",
                "9. matchScore": "0.2727"
            }
        ]
    };
}







