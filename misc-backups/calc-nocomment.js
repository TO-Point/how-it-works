let yearlyData = [];
function performCalculations() {
    console.clear();
    yearlyData = [];
    let startingHomeValue = parseFloat(document.getElementById("currentValue").value);
    if (!isNaN(startingHomeValue)) {
        let pointOffer = startingHomeValue * 0.10;
        let appreciationMultiple = 1.9;
        let appreciationStartingAmount = startingHomeValue * 0.725;
        document.querySelector(".point-offer").textContent = pointOffer.toFixed(0);
        document.querySelector(".appreciation-starting-point").textContent = appreciationStartingAmount.toFixed(0);
        let appreciation = parseFloat(document.querySelector(".custom-range-slider").value) / 100;
        let isDepreciation = appreciation < 0;
        for(let year = 2; year <= 30; year += 2) {
            let homeValueForYear = startingHomeValue * Math.pow((1 + appreciation), year);
            let pointPercentage = (pointOffer / appreciationStartingAmount * appreciationMultiple);
            let shareOfAppreciation = (homeValueForYear - appreciationStartingAmount) * pointPercentage;
            let capForYear = pointOffer * Math.pow(1.2, year);
            let repayment = Math.min(capForYear, (shareOfAppreciation + pointOffer));
            let totalHomeValueForYear = repayment + (homeValueForYear - repayment);
            yearlyData.push({
                year: year,
                homeValueForYear: homeValueForYear,
                pointPercentage: pointPercentage,
                shareOfAppreciation: shareOfAppreciation,
                capForYear: capForYear,
                repayment: repayment,
                totalHomeValueForYear: totalHomeValueForYear
            });
            // Add the cap-indicator div to the corresponding chart-col
            const chartCol = document.querySelector(`.chart-col[data-year="${year}"]`);
            if (chartCol && capForYear < shareOfAppreciation) {
                const capIndicator = document.createElement('div');
                capIndicator.className = 'cap-indicator';
                capIndicator.textContent = capForYear.toFixed(0);
                chartCol.appendChild(capIndicator);
            }
        }
        // Set the height of each chart-col based on the maximum height
        const referenceValue = isDepreciation ? startingHomeValue : yearlyData[yearlyData.length - 1].totalHomeValueForYear;
        yearlyData.forEach(data => {
            const chartCol = document.querySelector(`.chart-col[data-year="${data.year}"]`);
            if (chartCol) {
                const heightPercentage = (data.totalHomeValueForYear / referenceValue) * 90;
                chartCol.style.height = `${heightPercentage}%`;
            }
        });
    }
   const selectedChartColWrap = getSelectedChartColWrap();
    if (selectedChartColWrap) {
        selectedChartColWrap.click();
    }
}
function getSelectedChartColWrap() {
    return Array.from(document.querySelectorAll('.chart-col-wrap')).find(wrap => getComputedStyle(wrap.querySelector('.chart-col')).opacity === '1');
}
document.getElementById("currentValue").addEventListener("input", performCalculations);
document.querySelector(".custom-range-slider").addEventListener("input", function() {
    // Trigger recalculation
    document.getElementById("currentValue").dispatchEvent(new Event('input'));
    // Check if any .chart-col is currently selected (opacity of 1)
    const selectedChartColWrap = getSelectedChartColWrap();
    // If a .chart-col is selected, simulate a click to update the displayed values
    if (selectedChartColWrap) {
        selectedChartColWrap.click();
    }
});
window.onload = function() {
    document.getElementById("currentValue").value = "400000";
    performCalculations();
    const chartColWraps = document.querySelectorAll('.chart-col-wrap');
    chartColWraps.forEach((wrap, index) => {
        wrap.addEventListener('click', function() {
            document.querySelectorAll('.chart-col').forEach(col => {
                col.style.opacity = '0.3';
            });
            const chartCol = wrap.querySelector('.chart-col');
            if (chartCol) {
                chartCol.style.opacity = '1';
            }
            let yearIndex = parseInt(chartCol.getAttribute("data-year")) / 2 - 1;
            if (!isNaN(yearIndex) && yearlyData[yearIndex]) {
                let data = yearlyData[yearIndex];
                document.querySelector(".point-share").textContent = data.repayment.toFixed(0);
                document.querySelector(".home-value").textContent = data.totalHomeValueForYear.toFixed(0);
                document.querySelector(".homeowner-share").textContent = (data.totalHomeValueForYear - data.repayment).toFixed(0);
            }
        });
        if (index === 2) {
            wrap.click();
        }
    });
}
document.addEventListener('DOMContentLoaded', function() {
    const rangeSlider = document.querySelector('.custom-range-slider');
    const divElement = document.querySelector('.appreciation-type');
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