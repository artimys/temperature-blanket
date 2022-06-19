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

const buildMonthlyTempObject = json => {
    let count = 0;
    for (const item of json) {
        // console.log(item);

        // Destructure date, time, timezone
        const [strUTCDate, timestamp, timezone] = item.dt_iso.split(" ");

        // console.log(strUTCDate);

        // Convert
        const [year, month, day] = strUTCDate.split("-");
        const date = new Date(+year, +month - 1, +day);

        // isoDate.toLocaleString("en-US", {timeZone: "UTC"})
        // console.log(isoDate.toISOString());

// console.log(date);
        const entry = {
            weekday_index: date.getDay(),
            weekday: weekday[date.getDay()],
            year: date.getFullYear(),
            month: date.getMonth() + 1,
            day: date.getDate(),
            iso_date: item.dt_iso,
            temp: item.main.temp,
            temp_max: item.main.temp_max,
            temp_min: item.main.temp_min,
            dew_point: item.main.dew_point,
            feels_like: item.main.feels_like,
            humidity: item.main.humidity,
            pressure: item.main.pressure,
            weather_status: item.weather[0].main,
            weather_status_description: item.weather[0].description,
        }
        // console.log(entry);

        // Create key with empty array if key does not exist
        const key = date.getFullYear() + "-" + date.getMonth();
        if (calendarData[key] === undefined) {
            calendarData[key] = {};
        }

        // Make new key to overwrite multiple day objects
        // JSON data containers 24 hour entries per day
        // Keeping latest hourly temp of 11pm
        dayKey = date.getDate();
        calendarData[key][dayKey] = entry;


        count = count + 1;
        if (count === 1500) {
            // break;
        }
    }

        console.log(calendarData);
}

const loadCalender = () => {
/*
        <section>
            <h2>February 1981</h2>
            <div class="month">
                <div class="day"></div>
                <div class="day"></div>
            </div>
        </section>
*/
    // Hold monthly HTML
    const fragment = new DocumentFragment();

    for (const monthkey in calendarData) {
        // month array full of day objects
        const month = calendarData[monthkey];

        const [titleYear, intMonth] = monthkey.split("-");
        const titleMonth = monthNames[intMonth];

        console.log(monthkey)
        const section = document.createElement("section");

        // Create heading 2
        const heading2 = document.createElement("h2");
        heading2.textContent = `${titleMonth} ${titleYear}`;

        // Create month div container
        const monthDiv = document.createElement("div");
        monthDiv.className = "month";

        // Add heading and monthy div to section
        section.appendChild(heading2);
        section.appendChild(monthDiv);


        // Generate empty day boxes to fill up the week
        let i = 0;
        while (i < month[Object.keys(month)[0]].weekday_index) {
            const emptyDay = document.createElement("div");
            monthDiv.appendChild(emptyDay);
            i++;
        }



        // Loop through day objects
        for (const daykey in month) {
            const day = month[daykey];
            // console.log(day);
            const dayDiv = document.createElement("div");
            dayDiv.className = "day";


/*
                    <div class="corner">1</div>
                    <div class="temp">
                        72 &#176;F
                        <span>Cloudy with meatballs</span>
                    </div>
                    <small class="minmax">
                       min: 69, max: 12
                    </small>
*/
            const corner = document.createElement("div");
            corner.className = "corner";
            corner.textContent = day.day;
            dayDiv.appendChild(corner);

            const temp = document.createElement("div");
            temp.className = "temp";
            temp.textContent = `${day.temp} F`;
            dayDiv.appendChild(temp);

            const tempStatus = document.createElement("span");
            tempStatus.textContent = day.weather_status_description;
            temp.appendChild(tempStatus);

            const minmax = document.createElement("small");
            minmax.className = "minmax";
            minmax.textContent = `min: ${day.temp_min}, max: ${day.temp_max}`;
            dayDiv.appendChild(minmax);






            // Add day HTML to monthly container
            monthDiv.appendChild(dayDiv);
        }



        fragment.appendChild(section);
    }

    calendar.appendChild(fragment);
}


// INITIAL PAGE LOAD
//---------------------------------------------------------------------------------------------------

const init = () => {
    getYearlyTemps()
    .then(data => {
        buildMonthlyTempObject(data);
    })
    .then(() => {
        loadCalender();
    });
};

init();