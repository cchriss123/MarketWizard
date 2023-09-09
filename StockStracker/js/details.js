//localStorage.clear();
let storedStockInfo = JSON.parse(localStorage.getItem("currentStock"));
let stockSymbol = storedStockInfo["1. symbol"];
let stockName = storedStockInfo["2. name"];
let stockCurrency = storedStockInfo["8. currency"];
let fundamentalsFromSymbol = JSON.parse(localStorage.getItem(`fundamentalsFrom${stockSymbol}`));
let weeklyDataInMemory;
let intradayDataInMemory;
document.querySelector("h1").textContent = stockSymbol? stockName: "Symbol not found.";
initializePage();

async function initializePage() {
  const apiKey = await fetchAPIKey();
  fetchStockData(apiKey);
  setupTimeButtons();
}

async function fetchAPIKey() {
  return fetch("data/apiKey.json")
    .then((response) => response.json())
    .then((jsonData) => jsonData.apiKey)
    .catch((error) => console.error(error));
}

function displayStockDescription(data) {
  let descriptionDiv = document.getElementById("description");
  let description = data.Description? data.Description : "Description not available";
  descriptionDiv.innerHTML = `<div>${description}</div>`;
}

function displayKeyStockInfo(data) {
  let stockInfoDiv = document.getElementById("StockInfo");
  let getValue = (value) => (value ? value : "N/A"); // Sets value to "N/A" if value is undefined

  let fundamentalsHTML = `
      <div class="infoList">
          <div>Symbol:</div>
          <div>${getValue(data.Symbol)}</div>
          <div>Name:</div>
          <div>${getValue(data.Name)}</div>
          <div>Exchange:</div>
          <div>${getValue(data.Exchange)}</div>
          <div>Currency:</div>
          <div>${getValue(data.Currency)}</div>
          <div>Country:</div>
          <div>${getValue(data.Country)}</div>
          <div>Sector:</div>
          <div>${getValue(data.Sector)}</div>
          <div>Market Capitalization:</div>
          <div>${getValue(data.MarketCapitalization)}</div>
          <div>EBITDA:</div>
          <div>${getValue(data.EBITDA)}</div>
          <div>PE Ratio:</div>
          <div>${getValue(data.PERatio)}</div>
          <div>Dividend Per Share:</div>
          <div>${getValue(data.DividendPerShare)}</div>
          <div>Dividend Yield:</div>
          <div>${getValue(data.DividendYield)}</div>
          <div>EPS:</div>
          <div>${getValue(data.EPS)}</div>
          <div>Dividend Date:</div>
          <div>${getValue(data.DividendDate)}</div>
      </div>
  `;

  stockInfoDiv.innerHTML = fundamentalsHTML;
}

function fetchStockData(apiKey) {
  if (fundamentalsFromSymbol) {
    displayStockDescription(fundamentalsFromSymbol);
    displayKeyStockInfo(fundamentalsFromSymbol);
    return;
  }

  fetch(`https://www.alphavantage.co/query?function=OVERVIEW&symbol=${stockSymbol}&apikey=${apiKey}`)
    .then((response) => response.json())
    .then((data) => {
      localStorage.setItem(
        `fundamentalsFrom${fundamentalsFromSymbol}`,
        JSON.stringify(data)
      );
      displayStockDescription(data);
      displayKeyStockInfo(data);
    })
    .catch((error) => console.log(error));

  fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_WEEKLY_ADJUSTED&symbol=${stockSymbol}&apikey=${apiKey}`)
    .then((response) => response.json())
    .then((data) => spliceWeeklySeries(data, new Date(1983,8,7)))
    .catch((error) => console.log(error));

  fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${stockSymbol}&interval=5min&outputsize=full&apikey=${apiKey}`)
    .then((response) => response.json())
    .then((data) => displayIntraday(data))
    .catch((error) => console.log(error));

  // getHistoryMock().then((data) => spliceWeeklySeries(data, new Date(1983,8,7)));
  // getIntradayMock().then(displayIntraday);
  // getFundamentalsMock().then(displayStockDescription);
  // getFundamentalsMock().then(displayKeyStockInfo);

}

function displayGraph([dates, adjustedCloses]) {
  let isPositive = adjustedCloses[adjustedCloses.length - 1] > adjustedCloses[0];
  let color = isPositive ? "rgb(52,199,89)" : "rgb(254,59,48)";
  const ctx = document.getElementById("my-canvas");

  if (window.myChart) 
    window.myChart.destroy();

  myChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: dates,
      datasets: [
        {
          label: `Stock history ${stockSymbol}`,
          data: adjustedCloses,
          borderColor: color,
          borderWidth: 1,
          pointRadius: 0,
        },
      ],
    },

    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        x: {
          ticks: {
            color: "white",
          },
          grid: {
            color: "grey",
          },
        },
        y: {
          ticks: {
            fontSize: 15,
            color: "white",
          },
          grid: {
            color: "grey",
          },
          beginAtZero: true,
        },
      },
    },
  });
}

function spliceWeeklySeries(data, startDate) {
  
  weeklyDataInMemory = data;
  const weeklyAdjusted = data["Weekly Adjusted Time Series"];
  const dates = Object.keys(weeklyAdjusted).filter((date) => startDate < new Date(date)).reverse();
  const values = Object.values(weeklyAdjusted).slice(0, dates.length).map((week) => Number(week["5. adjusted close"])).reverse();

  displayGraph([dates, values]);
}



function setupTimeButtons(){

  let todaysDate = new Date();
  let thirtyDaysAgo = new Date(todaysDate-30*365*24*60*60*1000);
  let fiveYearsAgo = new Date(todaysDate-5*365*24*60*60*1000);
  let oneYearAgo = new Date(todaysDate-365*24*60*60*1000);
  let threeMonthsAgo = new Date(todaysDate-3*30*24*60*60*1000);
  

  let oneWeekAgo = new Date(todaysDate-7*24*60*60*1000);
  console.log(oneWeekAgo);
  let oneDayAgo = new Date(todaysDate-24*60*60*1000);


  document.getElementById("max").addEventListener("click", () => spliceWeeklySeries(weeklyDataInMemory, thirtyDaysAgo));
  document.getElementById("five-year").addEventListener("click", () => spliceWeeklySeries(weeklyDataInMemory, fiveYearsAgo));
  document.getElementById("one-year").addEventListener("click", () => spliceWeeklySeries(weeklyDataInMemory, oneYearAgo));
  document.getElementById("three-month").addEventListener("click", () => spliceWeeklySeries(weeklyDataInMemory, threeMonthsAgo));




}

function displayIntraday(data) {
  
  let topContainerDiv = document.getElementById("change");
  let intradayDataDiv = document.getElementById("intraday");

  let latestDate = data["Meta Data"]["3. Last Refreshed"].split(" ")[0];

  let closePrices = Object.keys(data["Time Series (5min)"])
    .filter((timestamp) => timestamp.includes(latestDate))
    .map((timestamp) => data["Time Series (5min)"][timestamp]["4. close"]);

  let openingPrices = Object.keys(data["Time Series (5min)"])
    .filter((timestamp) => timestamp.includes(latestDate))
    .map((timestamp) => data["Time Series (5min)"][timestamp]["1. open"]);

  let lastCloseValue = parseFloat(closePrices[0]);
  let lastCloseDisplay = lastCloseValue.toFixed(2);
  lastCloseDisplay = lastCloseDisplay.length > 7 ? lastCloseValue.toFixed(0) : lastCloseDisplay;

  let filterOpen = parseFloat(openingPrices[openingPrices.length - 1]);

  let amountChange = (lastCloseValue - filterOpen).toFixed(2);
  amountChange = amountChange.length > 6 ? (lastCloseValue - filterOpen).toFixed(0) : amountChange;
  let percentageChange = ((amountChange / filterOpen) * 100).toFixed(2);

  intradayDataDiv.innerHTML = `
    <div class="current-price">${lastCloseDisplay}</div>
    <div class="currency">${stockCurrency}</div>`;

  if (amountChange > 0) {
    topContainerDiv.innerHTML += `
      <div class="amount-change-up">+${amountChange}</div>
      <div class="percent-change-up">+${percentageChange}%</div>`;
  } 
  else {
    topContainerDiv.innerHTML += `
        <div class="amount-change-down">${amountChange}</div>
        <div class="percent-change-down">${percentageChange}%</div>`;
  }
}

async function wait(timeInMs) {
  return new Promise((resolve) => setTimeout(resolve, timeInMs));
}

async function getIntradayMock() {
  await wait(500);
  return fetch(`data/mockIntraday.json`)
    .then((response) => response.json())
    .catch((error) => console.log(error));  
}

async function getFundamentalsMock() {
  await wait(500);
  return fetch(`data/mockFundamentals.json`)
    .then((response) => response.json())
    .catch((error) => console.log(error));   
}

async function getHistoryMock() {
  await wait(500);
  return fetch(`data/mockWeekly.json`)
    .then((response) => response.json())
    .catch((error) => console.log(error));    
}
