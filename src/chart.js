// Initialize a function to format the numbers
function formatNumber(num) {
  return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
}
let yearlyData = [];
let appreciationRates = [-0.015, 0, 0.015, 0.035, 0.055];

// Main function to perform calculations and update the UI
function performCalculations() {
  // Reset the yearly data array
  yearlyData = [];
  let startingHomeValue = parseFloat(document.getElementById("currentValue").value.replace(/,/g, ""));

  // Validate if the starting home value is a number
  if (!isNaN(startingHomeValue)) {
    // Calculate the initial offer (10% of home value)
    let pointOffer = startingHomeValue * 0.16;

    // Define a constant to multiply with appreciation starting amount
    let appreciationMultiple = 1.9;
    // let appreciationStartingAmount = Math.round((startingHomeValue * 0.725) / 1000) * 1000;
    // Calculate the appreciation starting amount
    let appreciationStartingAmount = Math.round((startingHomeValue * 0.71) / 1000) * 1000;

    // Update the UI with the calculated point offer and appreciation starting amount
    document.querySelector(".point-offer").textContent = formatNumber(pointOffer.toFixed(0));
    document.querySelector(".appreciation-starting-point").textContent = formatNumber(appreciationStartingAmount.toFixed(0));

    // // Get the appreciation rate from the slider
    let sliderPosition = parseInt(document.querySelector(".custom-range-slider").value);
    let appreciation = appreciationRates[sliderPosition];

    // Determine if the rate is depreciation
    let isDepreciation = appreciation < 0;

    // Loop through each year (step of 2) up to 30 years
    for (let year = 2; year <= 30; year += 2) {
      // Calculate the home value for each year based on appreciation
      let homeValueForYear = startingHomeValue * Math.pow(1 + appreciation, year);

      let pointPercentage = (pointOffer / appreciationStartingAmount) * appreciationMultiple;

      let shareOfAppreciation = (homeValueForYear - appreciationStartingAmount) * pointPercentage;

      let capBasedRepayment = pointOffer * Math.pow(1.2, year);

      let shareBasedRepayment = shareOfAppreciation + pointOffer;

      let repayment = Math.min(capBasedRepayment, shareBasedRepayment);
      let isCapUsed = capBasedRepayment == repayment;

      // Store all calculated data for the year
      yearlyData.push({
        year: year,
        homeValueForYear: homeValueForYear,
        pointPercentage: pointPercentage,
        shareOfAppreciation: shareOfAppreciation,
        capBasedRepayment: capBasedRepayment,
        shareBasedRepayment: shareBasedRepayment,
        repayment: repayment,
        isCapUsed: isCapUsed,
      });

      const chartCol = document.querySelector(`.chart-col[data-year="${year}"]`);
      console.log("capBasedRepayment < shareBasedRepayment: ", capBasedRepayment < shareBasedRepayment, capBasedRepayment, shareBasedRepayment);

      // Event listener to format the input value with commas whenever it changes
      document.getElementById("currentValue").addEventListener("input", function () {
        this.value = formatNumber(this.value.replace(/,/g, ""));
      });

      // Event listener for input changes in the current value field
      document.getElementById("currentValue").addEventListener("input", performCalculations);
      // Update the visibility of the cap indicator based if the cap was used
      let capIndicator = chartCol.querySelector(".cap-indicator");
      if (capIndicator) {
        if (isCapUsed) {
          capIndicator.style.opacity = "1";
          capIndicator.style.pointerEvents = "auto";
        } else {
          capIndicator.style.opacity = "0";
          capIndicator.style.pointerEvents = "none";
        }
      }
    }

    // Adjust the height of chart columns based on the highest value
    const referenceValue = isDepreciation ? startingHomeValue : yearlyData[yearlyData.length - 1].homeValueForYear;
    yearlyData.forEach((data) => {
      const chartCol = document.querySelector(`.chart-col[data-year="${data.year}"]`);

      if (chartCol) {
        const heightPercentage = (data.homeValueForYear / referenceValue) * 90;
        chartCol.style.height = `${heightPercentage}%`;
      }
    });
  }

  // Trigger click event on the selected chart column wrapper
  const selectedChartColWrap = getSelectedChartColWrap();
  if (selectedChartColWrap) {
    selectedChartColWrap.click();
  }
}

// Function to get the selected chart column wrapper based on its opacity
function getSelectedChartColWrap() {
  return Array.from(document.querySelectorAll(".chart-col-wrap")).find((wrap) => getComputedStyle(wrap.querySelector(".chart-col")).opacity === "1");
}

// Event listener for changes in the custom range slider
document.querySelector(".custom-range-slider").addEventListener("input", function () {
  // Get slider position
  let sliderPosition = parseInt(this.value);
  let appreciation = appreciationRates[sliderPosition];
  // Update displayed values if a chart column is selected
  const selectedChartColWrap = getSelectedChartColWrap();
  if (selectedChartColWrap) {
    selectedChartColWrap.click();
  }
  // Update the elements with class 'percent-selected' with the appreciation percentage currently selected
  const percentSelectedElements = document.querySelectorAll(".percent-selected");
  percentSelectedElements.forEach(function (el) {
    el.textContent = (appreciation * 100).toFixed(1);
  });
  // Trigger recalculation
  document.getElementById("currentValue").dispatchEvent(new Event("input"));
});

// Event listener for input changes in the current value field
document.getElementById("currentValue").addEventListener("input", performCalculations);

// Event listener for changes in the custom range slider
document.querySelector(".custom-range-slider").addEventListener("input", function () {
  document.getElementById("currentValue").dispatchEvent(new Event("input"));

  // Update displayed values if a chart column is selected
  const selectedChartColWrap = getSelectedChartColWrap();
  if (selectedChartColWrap) {
    selectedChartColWrap.click();
  }
});

// On window load, set default values and perform initial calculations
window.addEventListener("DOMContentLoaded", (event) => {
  document.getElementById("currentValue").value = "500,000";
  performCalculations();
  document.querySelector(".calc-pricing-explainer").style.display = "none";
  // Add click event listeners to chart column wrappers
  const chartColWraps = document.querySelectorAll(".chart-col-wrap");
  chartColWraps.forEach((wrap, index) => {
    wrap.addEventListener("click", function () {
      document.querySelectorAll(".chart-col").forEach((col) => {
        col.style.opacity = "0.3";
      });

      // Set opacity to 1 for the clicked chart column
      const chartCol = wrap.querySelector(".chart-col");
      if (chartCol) {
        chartCol.style.opacity = "1";
        // Get the year from the selected column
        let yearSelected = chartCol.dataset.year;

        // Get the span with class 'year-selected' and update its text content
        let yearSelectedSpan = document.querySelector(".year-selected");
        if (yearSelectedSpan) {
          yearSelectedSpan.textContent = yearSelected;
        }
      }
      document.querySelector(".calc-pricing-explainer").style.display = "block";
      // Update displayed values based on the clicked chart column
      let yearIndex = parseInt(chartCol.getAttribute("data-year")) / 2 - 1;
      if (!isNaN(yearIndex) && yearlyData[yearIndex]) {
        let data = yearlyData[yearIndex];
        document.querySelector(".point-share").textContent = formatNumber(Math.round(data.repayment / 1000) * 1000);
        document.querySelector(".home-value").textContent = formatNumber(Math.round(data.homeValueForYear / 1000) * 1000);
        document.querySelector(".homeowner-share").textContent = formatNumber(Math.round((data.homeValueForYear - data.repayment) / 1000) * 1000);
      }
      // Get the elements with class 'wrap-get-started' and 'final-home-value-card'
      let getStartedElement = document.querySelector(".wrap-get-started");
      let homeValueCardElement = document.querySelector(".final-home-value-card");
      // Hide the 'wrap-get-started' element and show the 'final-home-value-card' element
      if (getStartedElement) {
        getStartedElement.style.display = "none";
      }
      if (homeValueCardElement) {
        homeValueCardElement.style.display = "block";
      }
    });
  });
});

// Event listener for DOMContentLoaded to set the appreciation type label
document.addEventListener("DOMContentLoaded", function () {
  const rangeSlider = document.querySelector(".custom-range-slider");
  const divElement = document.querySelector(".appreciation-type");
  // Update the label based on the slider value
  rangeSlider.addEventListener("input", function () {
    switch (parseInt(rangeSlider.value)) {
      case 0:
        divElement.textContent = "Depreciation: -1.5%";
        break;
      case 1:
        divElement.textContent = "No Change";
        break;
      case 2:
        divElement.textContent = "Low growth: 1.5%";
        break;
      case 3:
        divElement.textContent = "Average growth: 3.5%";
        break;
      case 4:
        divElement.textContent = "High growth: 5.5%";
        break;
      default:
        divElement.textContent = "unknown value";
    }
  });
  document.getElementById("currentValue").addEventListener("input", function (e) {
    e.target.value = e.target.value.replace(/[^0-9]/g, "");
  });
});
