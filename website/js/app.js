const weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
// const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul","Aug", "Sep", "Oct", "Nov", "Dec"];

const calendar = document.querySelector("main#calendar");
const calendarData = {};


//---------------------------------------------------------------------------------------------------

const getYearlyTemps = async () => {
    const response = await fetch("http://localhost:8000/temps", {
        method: "GET",
        credentials: "same-origin",
        headers: {
            "Content-Type": "application/json"
        }
    });

    try {
        const data = await response.json();
        return data;
    } catch (error) {
        console.log("getYearlyTemps error:", error);
    }
}

const groupMonthlyDailyTemps = json => {
    const monthlyData = {}

    for (const item of json) {
// console.log(item);

        // Destructure date, time, timezone with empty space split;
        // then split first element by dash
        const [year, month, day] = item.dt_iso.split(" ")[0].split("-");

        // Convert to date object
        const date = new Date(+year, +month - 1, +day);


// console.log(date);
        const dailyHourlyEntry = {
            weekday_index: date.getDay(),
            weekday: weekday[date.getDay()],
            year: date.getFullYear(),
            month: date.getMonth() + 1,
            day: date.getDate(),
            iso_date: item.dt_iso,
            temp: item.main.temp,
            // temp_max: item.main.temp_max,
            // temp_min: item.main.temp_min,
            // dew_point: item.main.dew_point,
            // feels_like: item.main.feels_like,
            // humidity: item.main.humidity,
            // pressure: item.main.pressure,
            weather_status: item.weather[0].main,
            weather_status_description: item.weather[0].description,
        }
// console.log(entry);

        // Create key with empty array if key does not exist
        const key = date.getFullYear() + "-" + date.getMonth();
        if (monthlyData[key] === undefined) {
            monthlyData[key] = [];
        }

        // Add hour entry per day
        dayKey = date.getDate();
        if (monthlyData[key][dayKey] === undefined) {
            monthlyData[key][dayKey] = [];
        }
        monthlyData[key][dayKey].push(dailyHourlyEntry);
    }

    // console.log(monthlyData);
    return monthlyData;
}

const groupHourlyTemps = data => {
    for (const monthkey in data) {
        // month object contains array of objects
        const month = data[monthkey];


        // Loop through hours of day to transform data
        for (const daykey in month) {
            const day = month[daykey];

            // Stats
            let tempList = [];
            let statusList = [];
            let metaDay = 0;

            for (const hour of day) {
                tempList.push(hour.temp);
                statusList.push(hour.weather_status);
                metaDay = hour.day;
            }

            // Create key with empty array if key does not exist
            if (calendarData[monthkey] === undefined) {
                calendarData[monthkey] = [];
            }

            // Remove duplicate values
            const weather_status = statusList.filter((value, index, self) => self.indexOf(value) === index);

            calendarData[monthkey].push({
                day: metaDay,
                weather_status_description: weather_status,
                temp: Math.max(...tempList),
                temp_max: Math.max(...tempList),
                temp_min: Math.min(...tempList)
            });
        }
    }
    // console.log(calendarData);
}

const loadCalender = () => {
    // Hold monthly HTML to avoid multiple repaints and ...
    const fragment = new DocumentFragment();

    for (const monthkey in calendarData) {
        // month array full of day objects
        const month = calendarData[monthkey];

        // Get month and year for title
        const [titleYear, intMonth] = monthkey.split("-");
        const titleMonth = monthNames[intMonth];


        // -----------------------------------------------------

        // Parent container for each month
        const section = document.createElement("section");

        // Create sticky header container
        const stickyHeader = document.createElement("div");
        stickyHeader.className = "sticky-header";
        stickyHeader.innerHTML = `
            <h2>${titleMonth} ${titleYear}</h2>
            <div class="weekdays">
                <div>Sunday</div>
                <div>Monday</div>
                <div>Tuesday</div>
                <div>Wednesay</div>
                <div>Thursday</div>
                <div>Friday</div>
                <div>Saturday</div>
            </div>
        `;

        // Add sticky header to section
        section.appendChild(stickyHeader);


        // -----------------------------------------------------


        // Create month div container
        const monthDiv = document.createElement("div");
        monthDiv.className = "month";

        // Generate empty day boxes to fill up the week
        let i = 0;
        while (i < month[Object.keys(month)[0]].weekday_index) {
            const emptyDay = document.createElement("div");
            emptyDay.className = "day";
            monthDiv.appendChild(emptyDay);
            i++;
        }

        // Loop through day objects
        for (const daykey in month) {
            const day = month[daykey];

            const dayDiv = document.createElement("div");
            dayDiv.className = "day";
            dayDiv.dataset.temp = day.temp;
            dayDiv.innerHTML = `
                <div class="corner">${day.day}</div>
                <div class="temp">
                    <div>
                        <span>Hi:</span> ${day.temp_max} &#176;F
                    </div>
                    <div>
                        <span>Lo:</span> ${day.temp_min} &#176;F
                    </div>
                </div>
                <small class="status">
                    ${day.weather_status_description}
                </small>
            `;

            // Add day HTML to monthly container
            monthDiv.appendChild(dayDiv);
        }

        // Add monthy div to section
        section.appendChild(monthDiv);

        // Add section to fragment
        fragment.appendChild(section);
    }

    // Add fragment to calender element
    calendar.appendChild(fragment);
}

//---------------------------------------------------------------------------------------------------


const applyRule = (min, max, bgcolor) => {
    const days = document.querySelectorAll("div.day");

    for (const day of days) {
        const temp = parseFloat(day.dataset.temp);
        if (temp >= min && temp <= max) {
            day.style.backgroundColor = bgcolor;
        }
    }
}




// INITIAL PAGE LOAD
//---------------------------------------------------------------------------------------------------

const init = () => {
    getYearlyTemps()
    .then(data => {
        const monthlyDailyTemps = groupMonthlyDailyTemps(data);
        groupHourlyTemps(monthlyDailyTemps);
    })
    .then(() => {
        loadCalender();
        // applyRule(74.7, 75, "red");
    });
};

init();