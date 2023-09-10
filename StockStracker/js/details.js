const storedStockInfo = JSON.parse(localStorage.getItem("currentStock"));
const stockSymbol = storedStockInfo["1. symbol"];
const stockName = storedStockInfo["2. name"];
const stockCurrency = storedStockInfo["8. currency"];
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
  const descriptionDiv = document.getElementById("description");
  const description = data.Description? data.Description : "Description not available";
  descriptionDiv.innerHTML = `<div>${description}</div>`;
}

function displayKeyStockInfo(data) {
  const stockInfoDiv = document.getElementById("StockInfo");
  const getValue = (value) => (value ? value : "N/A"); // Sets value to "N/A" if value is undefined

  const fundamentalsHTML = `
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
        <div>Profit Margin:</div>
        <div>${getValue(data.ProfitMargin)}</div>
        <div>Revenue TTM:</div>
        <div>${getValue(data.RevenueTTM)}</div>
        <div>Gross Profit TTM:</div>
        <div>${getValue(data.GrossProfitTTM)}</div>
        <div>Return On Assets TTM:</div>
        <div>${getValue(data.ReturnOnAssetsTTM)}</div>
        <div>Return On Equity TTM:</div>
        <div>${getValue(data.ReturnOnEquityTTM)}</div>
        <div>Analyst Target Price:</div>
        <div>${getValue(data.AnalystTargetPrice)}</div>
        <div>Forward PE:</div>
        <div>${getValue(data.ForwardPE)}</div>
        <div>EV To EBITDA:</div>
        <div>${getValue(data.EVToEBITDA)}</div>
        <div>Price To Book:</div>
        <div>${getValue(data.PriceToBookRatio)}</div>
    </div>
`;

  stockInfoDiv.innerHTML = fundamentalsHTML;
}

function fetchStockData(apiKey) {


  // fetch(`https://www.alphavantage.co/query?function=OVERVIEW&symbol=${stockSymbol}&apikey=${apiKey}`)
  //   .then((response) => response.json())
  //   .then((data) => {
  //     displayStockDescription(data);
  //     displayKeyStockInfo(data);
  //   })
  //   .catch((error) => console.log(error));

  // fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_WEEKLY_ADJUSTED&symbol=${stockSymbol}&apikey=${apiKey}`)
  //   .then((response) => response.json())
  //   .then((data) => spliceWeeklySeries(data, new Date(1983,8,7)))
  //   .catch((error) => console.log(error));

  // fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${stockSymbol}&interval=5min&outputsize=full&apikey=${apiKey}`)
  //   .then((response) => response.json())
  //   .then((data) => displayIntraday(data))
  //   .catch((error) => console.log(error));

  getHistoryMock().then((data) => spliceWeeklySeries(data, new Date(1983,8,7)));
  getIntradayMock().then(displayIntraday);
  getFundamentalsMock().then(displayStockDescription);
  getFundamentalsMock().then(displayKeyStockInfo);

}

function displayGraph([dates, closeingPrices]) {
  const isPositive = closeingPrices[closeingPrices.length - 1] > closeingPrices[0];
  const color = isPositive ? "rgb(52,199,89)" : "rgb(254,59,48)";
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
          data: closeingPrices,
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
          beginAtZero: false,
        },
      },
    },
  });
}

function spliceWeeklySeries(data, startDate) { // data argument is needed here despite being a global variable for the first call to work
  
  weeklyDataInMemory = data;
  const weeklyAdjusted = data["Weekly Adjusted Time Series"];
  const dates = Object.keys(weeklyAdjusted).filter((date) => startDate < new Date(date)).reverse();
  const values = Object.values(weeklyAdjusted).slice(0, dates.length).map((week) => Number(week["5. adjusted close"])).reverse();

  displayGraph([dates, values]);
}

function spiceItradayForToday() {

  const data = intradayDataInMemory;
  const latestDate = data["Meta Data"]["3. Last Refreshed"].split(" ")[0];


  const closePriceData = data["Time Series (5min)"];
  const closePrices = Object.keys(closePriceData)
    .filter(timestamp => timestamp.includes(latestDate))
    .map(timestamp => Number(closePriceData[timestamp]["4. close"]))
    .reverse();


    const closeTimes = Object.keys(data["Time Series (5min)"])
    .slice(0, closePrices.length)
    .map(timestamp => timestamp.split(" ")[1].split(":").slice(0, 2).join(":"))
    .reverse();

  displayGraph([closeTimes, closePrices]);
}


function fullIntradayMonth() {
  const data = intradayDataInMemory;
  const intratradeSeries = data["Time Series (5min)"];
  const intradayMonthPrices = Object.values(intratradeSeries).map(entry => Number(entry["4. close"])).reverse();
  const intradayMonthTimestamps = Object.keys(intratradeSeries).map(timestamp => timestamp.split(" ")[0]).reverse();

  displayGraph([intradayMonthTimestamps, intradayMonthPrices]);
}



function setupTimeButtons(){

  const todaysDate = new Date();
  const thirtyYearsAgo = new Date(todaysDate-30*365*24*60*60*1000);
  const fiveYearsAgo = new Date(todaysDate-5*365*24*60*60*1000);
  const oneYearAgo = new Date(todaysDate-365*24*60*60*1000);
  const threeMonthsAgo = new Date(todaysDate-3*30*24*60*60*1000);
  

  document.getElementById("max").addEventListener("click", () => spliceWeeklySeries(weeklyDataInMemory, thirtyYearsAgo));
  document.getElementById("five-year").addEventListener("click", () => spliceWeeklySeries(weeklyDataInMemory, fiveYearsAgo));
  document.getElementById("one-year").addEventListener("click", () => spliceWeeklySeries(weeklyDataInMemory, oneYearAgo));
  document.getElementById("three-month").addEventListener("click", () => spliceWeeklySeries(weeklyDataInMemory, threeMonthsAgo));
  document.getElementById("one-month").addEventListener("click", () => fullIntradayMonth(todaysDate));
  document.getElementById("today").addEventListener("click", () => spiceItradayForToday());
}

function displayIntraday(data) {
  
  intradayDataInMemory = data;
  const topContainerDiv = document.getElementById("change");
  const intradayDataDiv = document.getElementById("intraday");

  const latestDate = data["Meta Data"]["3. Last Refreshed"].split(" ")[0];

  const closePrices = Object.keys(data["Time Series (5min)"])
    .filter((timestamp) => timestamp.includes(latestDate))
    .map((timestamp) => data["Time Series (5min)"][timestamp]["4. close"]);

  const openingPrices = Object.keys(data["Time Series (5min)"])
    .filter((timestamp) => timestamp.includes(latestDate))
    .map((timestamp) => data["Time Series (5min)"][timestamp]["1. open"]);

  const lastCloseValue = parseFloat(closePrices[0]);
  let lastCloseDisplay = lastCloseValue.toFixed(2);
  lastCloseDisplay = lastCloseDisplay.length > 7 ? lastCloseValue.toFixed(0) : lastCloseDisplay;

  const filterOpen = parseFloat(openingPrices[openingPrices.length - 1]);

  let amountChange = (lastCloseValue - filterOpen).toFixed(2);
  amountChange = amountChange.length > 6 ? (lastCloseValue - filterOpen).toFixed(0) : amountChange;
  const percentageChange = ((amountChange / filterOpen) * 100).toFixed(2);

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
