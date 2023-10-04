// Initialize a function to format the numbers with proper commas
function formatNumber(num) {
	return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
}
// Initialize an empty array to store yearly data
let yearlyData = [];

// Main function to perform calculations and update the UI
function performCalculations() {
		// Clear the console for debugging
		//console.clear();
		// Reset the yearly data array
		yearlyData = [];
		
		// Get the starting home value from the input field and parse it as float
		let startingHomeValue = parseFloat(document.getElementById("currentValue").value);
		
		// Validate if the starting home value is a number
		if (!isNaN(startingHomeValue)) {
				// Calculate the initial offer (10% of home value)
				let pointOffer = startingHomeValue * 0.10;
				
				// Define a constant to multiply with appreciation starting amount
				let appreciationMultiple = 1.9;
				
				// Calculate the appreciation starting amount
				let appreciationStartingAmount = startingHomeValue * 0.725;
				
				// Update the UI with the calculated point offer and appreciation starting amount
				document.querySelector(".point-offer").textContent = formatNumber(pointOffer.toFixed(0));
				document.querySelector(".appreciation-starting-point").textContent =formatNumber(appreciationStartingAmount.toFixed(0));
				
				// Get the appreciation rate from the slider
				let appreciation = parseFloat(document.querySelector(".custom-range-slider").value) / 100;
				
				// Determine if the rate is depreciation
				let isDepreciation = appreciation < 0;
				
				// Loop through each year (step of 2) up to 30 years
				for(let year = 2; year <= 30; year += 2) {
						// Calculate the home value for each year based on appreciation
						let homeValueForYear = startingHomeValue * Math.pow((1 + appreciation), year);
						
						// Calculate the point percentage
						let pointPercentage = (pointOffer / appreciationStartingAmount * appreciationMultiple);
						
						// Calculate the share of appreciation
						let shareOfAppreciation = (homeValueForYear - appreciationStartingAmount) * pointPercentage;
						
						// Calculate the cap for each year
						let capForYear = pointOffer * Math.pow(1.2, year);
						
						// Calculate the repayment amount
						let repayment = Math.min(capForYear, (shareOfAppreciation + pointOffer));

						// Calculate the total home value for the year
						let totalHomeValueForYear = repayment + (homeValueForYear - repayment);
						
						// Store all calculated data for the year
						yearlyData.push({
								year: year,
								homeValueForYear: homeValueForYear,
								pointPercentage: pointPercentage,
								shareOfAppreciation: shareOfAppreciation,
								capForYear: capForYear,
								repayment: repayment,
								totalHomeValueForYear: totalHomeValueForYear
						});
						
						// Update the UI to display cap for the year if applicable
						const chartCol = document.querySelector(`.chart-col[data-year="${year}"]`);
						if (chartCol && capForYear < shareOfAppreciation) {
								const capIndicator = document.createElement('div');
								capIndicator.className = 'cap-indicator';
								capIndicator.textContent = capForYear.toFixed(0);
								chartCol.appendChild(capIndicator);
						}
				}
				
				// Adjust the height of chart columns based on the highest value
				const referenceValue = isDepreciation ? startingHomeValue : yearlyData[yearlyData.length - 1].totalHomeValueForYear;
				yearlyData.forEach(data => {
						const chartCol = document.querySelector(`.chart-col[data-year="${data.year}"]`);
						if (chartCol) {
								const heightPercentage = (data.totalHomeValueForYear / referenceValue) * 90;
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
		return Array.from(document.querySelectorAll('.chart-col-wrap')).find(wrap => getComputedStyle(wrap.querySelector('.chart-col')).opacity === '1');
}

// Event listener for input changes in the current value field
document.getElementById("currentValue").addEventListener("input", performCalculations);

// Event listener for changes in the custom range slider
document.querySelector(".custom-range-slider").addEventListener("input", function() {
		// Trigger recalculation
		document.getElementById("currentValue").dispatchEvent(new Event('input'));
		
		// Update displayed values if a chart column is selected
		const selectedChartColWrap = getSelectedChartColWrap();
		if (selectedChartColWrap) {
				selectedChartColWrap.click();
		}
});

// On window load, set default values and perform initial calculations
window.onload = function() {
		document.getElementById("currentValue").value = "400000";
		performCalculations();
		
		// Add click event listeners to chart column wrappers
		const chartColWraps = document.querySelectorAll('.chart-col-wrap');
		chartColWraps.forEach((wrap, index) => {
				wrap.addEventListener('click', function() {
						// Reset opacity for all chart columns
						document.querySelectorAll('.chart-col').forEach(col => {
								col.style.opacity = '0.3';
						});
						
						// Set opacity to 1 for the clicked chart column
						const chartCol = wrap.querySelector('.chart-col');
						if (chartCol) {
								chartCol.style.opacity = '1';
						}

						// Update displayed values based on the clicked chart column
						let yearIndex = parseInt(chartCol.getAttribute("data-year")) / 2 - 1;
if (!isNaN(yearIndex) && yearlyData[yearIndex]) {
		let data = yearlyData[yearIndex];
		document.querySelector(".point-share").textContent = formatNumber(Math.round(data.repayment / 1000) * 1000);
		document.querySelector(".home-value").textContent = formatNumber(Math.round(data.totalHomeValueForYear / 1000) * 1000);
		document.querySelector(".homeowner-share").textContent = formatNumber(Math.round((data.totalHomeValueForYear - data.repayment) / 1000) * 1000);
}
					// Get the elements with class 'wrap-get-started' and 'final-home-value-card'
				let getStartedElement = document.querySelector('.wrap-get-started');
				let homeValueCardElement = document.querySelector('.final-home-value-card');
				// Hide the 'wrap-get-started' element and show the 'final-home-value-card' element
				if(getStartedElement) {
						getStartedElement.style.display = 'none';
				}
				if(homeValueCardElement) {
						homeValueCardElement.style.display = 'block';
				}
				});
				
				// Trigger click event for the 3rd chart column wrapper (index = 2)
				// if (index === 2) {
				//     wrap.click();
				// }
		});
}

// Event listener for DOMContentLoaded to set the appreciation type label
document.addEventListener('DOMContentLoaded', function() {
		const rangeSlider = document.querySelector('.custom-range-slider');
		const divElement = document.querySelector('.appreciation-type');
		
		// Update the label based on the slider value
		rangeSlider.addEventListener('input', function() {
				switch (parseInt(rangeSlider.value)) {
						case -2:
								divElement.textContent = 'Depreciation: -1%';
								break;
						case 0:
								divElement.textContent = 'No Change';
								break;
						case 2:
								divElement.textContent = 'Average growth: 3.5%';
								break;
						case 4:
								divElement.textContent = 'High growth: 5.5%';
								break;
						default:
								divElement.textContent = 'unknown value';
				}
		});
});