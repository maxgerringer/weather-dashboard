$(document).ready(function() {
  $("#search-button").on("click", function() {
    var searchValue = $("#search-value").val();

    $("#search-value").val("");

    searchWeather(searchValue);
  });

  $(".history").on("click", "li", function() {
    searchWeather($(this).text());
  });

  function makeRow(text) {
    var li = $("<li>").addClass("list-group-item list-group-item-action").text(text);
    $(".history").append(li);
  }

  function searchWeather(searchValue) {
    $.ajax({
      type: "GET",
      url: "https://api.openweathermap.org/data/2.5/weather?q=" + searchValue + "&appid=c2d73c47a3ef6d3574f9444a3a5a5124",
      dataType: "json",
      success: function(data) {
        
        if (history.indexOf(searchValue) === -1) {
          history.push(searchValue);
          window.localStorage.setItem("history", JSON.stringify(history));
    
          makeRow(searchValue);
        }
        
        $("#today").empty();

        var weatherIcon = data.weather[0].icon
        var iconURL = "http://openweathermap.org/img/wn/" + weatherIcon + ".png"
        var iconEl = $("<img>").attr("src", iconURL);
        
        var today = moment().format("l");
        var temp = (data.main.temp * (9/5)) - 459.67;
        
        var currentWeatherCard = $("<div>").attr("class", "card-body");
        var currentCityEl = $("<h2>").attr("class", "card-title");
        var currentTempEl = $("<p>").attr("class", "card-text").html("Temperature: " + temp.toFixed(1) + " °F");
        var currentHumEl = $("<p>").attr("class", "card-text").text("Humidity: " + data.main.humidity + "%");
        var currentWindEl = $("<p>").attr("class", "card-text").text("Wind Speed: " + data.wind.speed + " MPH"); 
        currentCityEl.html(searchValue + " " + "(" + today + ")");
        currentCityEl.append(iconEl);
        currentWeatherCard.append(currentCityEl, currentTempEl, currentHumEl, currentWindEl);
        $("#today").append(currentWeatherCard);
        
        getForecast(searchValue);
        getUVIndex(data.coord.lat, data.coord.lon);
      }
    });
  }
  
  function getForecast(searchValue) {
    $.ajax({
      type: "GET",
      url: "https://api.openweathermap.org/data/2.5/forecast?q=" + searchValue + "&appid=c2d73c47a3ef6d3574f9444a3a5a5124",
      dataType: "json",
      success: function(data) {
        console.log(data);
        
        $("#forecast").empty();
        var forecastHeader = $("<h2>").addClass("col-12").text("5-day Forecast:");
        var forecastDeck = $("<div>").addClass("row card-deck");
        $("#forecast").append(forecastHeader, forecastDeck);

        for (var i = 0; i < data.list.length; i++) {
          if (data.list[i].dt_txt.indexOf("15:00:00") !== -1) {
            var date = moment(data.list[i].dt_txt).format("M/D/YYYY");
            var temp = (data.list[i].main.temp * (9/5)) - 459.67;
            var cardDate = $("<h5>").addClass("card-title").text(date)
            var forecastIcon = data.list[i].weather[0].icon;
            var iconURL =  "http://openweathermap.org/img/wn/" + forecastIcon + ".png";
            var iconEl = $("<img>").attr("src", iconURL);
            var weatherCardBody = $("<div>").addClass("card-body");
            var tempEl = $("<p>").text("Temp: " + temp.toFixed(1) + " °F")
            var humEl = $("<p>").text("Humidity: " + data.list[i].main.humidity + "%");
            weatherCardBody.append(cardDate, iconEl, tempEl, humEl);

            var forecastCard = $("<div>").addClass("card text-white bg-primary mb-3");
            forecastCard.append(weatherCardBody);
            forecastDeck.append(forecastCard);

          }
        }
      }
    });
  }

  function getUVIndex(lat, lon) {
    $.ajax({
      type: "GET",
      url: "https://api.openweathermap.org/data/2.5/uvi/forecast?appid=c2d73c47a3ef6d3574f9444a3a5a5124&lat=" + lat + "&lon=" + lon,
      dataType: "json",
      success: function(data) {
        var uv = $("<p>").text("UV Index: ");
        var btn = $("<span>").addClass("btn btn-sm").text(data[0].value);
        
        if(data[0].value >= 6){
          btn.addClass("btn-danger")
        }else if(data[0].value <= 3){
          btn.addClass("btn-success")
        }else{
          btn.addClass("btn-warning")
        };
        
        $("#today .card-body").append(uv.append(btn));
      }
    });
  }

  var history = JSON.parse(window.localStorage.getItem("history")) || [];

  if (history.length > 0) {
    searchWeather(history[history.length-1]);
  }

  for (var i = 0; i < history.length; i++) {
    makeRow(history[i]);
  }
});
