const weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const calendar = document.querySelector("main#calendar");


//---------------------------------------------------------------------------------------------------

const getCalendarData = async () => {
    const response = await fetch("/js/king81.json");

    const temperatureData = await response.json();

    const monthlyData = temperatureData.reduce((groupedMonths, day) => {
        const groupKey = day.group_key;

        if (groupedMonths[groupKey] == null) {
            groupedMonths[groupKey] = []
        }

        groupedMonths[groupKey].push(day);
        return groupedMonths;

    }, {});

    return monthlyData;
};

const loadCalender = (calendarData) => {
    // Hold monthly HTML to avoid multiple repaints and ...
    const fragment = new DocumentFragment();

    for (const monthkey in calendarData) {
        // month[array] full of day objects
        const month = calendarData[monthkey];

        // Get month and year for title
        const [titleYear, intMonth] = monthkey.split("-");
        const titleMonth = monthNames[parseInt(intMonth)-1];


        // -----------------------------------------------------

        // Parent container for each month
        const section = document.createElement("section");

        // Create sticky header container
        const stickyHeader = document.createElement("div");
        stickyHeader.className = "sticky-header";
        stickyHeader.innerHTML = `
            <h2>${titleMonth} ${titleYear}</h2>
            <div class="weekdays">
                <div>S</div>
                <div>M</div>
                <div>T</div>
                <div>W</div>
                <div>T</div>
                <div>F</div>
                <div>S</div>
            </div>
        `;

        // Add sticky header to section
        section.appendChild(stickyHeader);


        // -----------------------------------------------------


        // Create month div container
        const monthDiv = document.createElement("div");
        monthDiv.className = "month";


        // Generate empty day boxes to fill up the first week
        const dayName = month[0].date.day_name;
        const dayIndex = weekday.indexOf(dayName);
        let i = 0;
        while (i < dayIndex) {
            const emptyDay = document.createElement("div");
            emptyDay.className = "day";
            monthDiv.appendChild(emptyDay);
            i++;
        }


        // Loop through day objects
        month.forEach( day => {
            const dayDiv = document.createElement("div");
            dayDiv.className = "day";
            dayDiv.dataset.temp = day.temp;
            dayDiv.textContent = day.date.day;

            // Add day HTML to monthly container
            monthDiv.appendChild(dayDiv);
        });

        // Add monthy div to section
        section.appendChild(monthDiv);

        // Add section to fragment
        fragment.appendChild(section);
    }

    // Add fragment to calender element
    calendar.appendChild(fragment);
}

//---------------------------------------------------------------------------------------------------

const getColors = async () => {
    const response = await fetch("/.netlify/functions/api/colors");
    const colorData = await response.json();
    return colorData;
};

const loadColors = (colors) => {
    for (const color of colors) {
        // Apply color ruleset to calendar
        applyRule(color.min_temp, color.max_temp, color.color);
    }
};

// APPLY COLOR
const applyRule = (min, max, bgcolor) => {
    const days = document.querySelectorAll("div.day");

    for (const day of days) {
        const temp = parseFloat(day.dataset.temp);
        if (temp >= min && temp <= max) {
            day.style.backgroundColor = bgcolor;
        }
    }
};


// PAGE LOAD
//---------------------------------------------------------------------------------------------------

document.addEventListener("DOMContentLoaded", async () => {
    try {
        // Get temperature data
        const calendarData = await getCalendarData();
        loadCalender(calendarData);

        // Get color ruleset for calender
        const colorData = await getColors();
        loadColors(colorData);

    } catch (error) {
        console.error("init error:", error);
    }
});