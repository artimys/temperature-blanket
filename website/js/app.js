const weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const calendar = document.querySelector("main#calendar");
const calendarData = {};
const colorList = document.querySelector("#colorList");


//---------------------------------------------------------------------------------------------------

const getData = async (url) => {
    const response = await fetch(url, {
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
        console.log("getData error:", error);
    }
};

const postData = async (url, data) => {
    const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify(data),
        headers: new Headers({
            "Content-Type": "application/json"
        })
    });

    try {
        const dataResponse = await response.json();
        return dataResponse;
    } catch (error) {
        console.log("postData error:", error);
    }
};

const deleteData = async (url) => {
    const response = await fetch(url, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json"
        }
    });

    try {
        const dataResponse = await response.json();
        return dataResponse;
    } catch (error) {
        console.log("deleteData error:", error);
    }
};

//---------------------------------------------------------------------------------------------------

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
            let metaWeekdayIndex = 0;

            for (const hour of day) {
                tempList.push(hour.temp);
                statusList.push(hour.weather_status);
                metaDay = hour.day;
                metaWeekdayIndex= hour.weekday_index;
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
                temp_min: Math.min(...tempList),
                weekday_index: metaWeekdayIndex
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
                        <span>Hi:</span> ${day.temp_max} <span>&#176;F</span>
                    </div>
                    <div>
                        <span>Lo:</span> ${day.temp_min} <span>&#176;F</span>
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

// ADD COLOR
const addColor = () => {
    const minValue = document.querySelector("#min").value;
    const maxValue = document.querySelector("#max").value;
    const colorValue = document.querySelector("#color").value;

    const colorData = {
        min_temp: minValue,
        max_temp: maxValue,
        color: colorValue
    };

    // Create new color record
    postData("http://localhost:8000/colors", colorData)
        .then(response => {
            // console.log("add to list", response);

            // Get new record
            getData(`http://localhost:8000/colors/${response.id}`)
                .then(color => {
                    const fragment = new DocumentFragment();
                    const form = createColorForm(color);
                    fragment.appendChild(form);
                    colorList.appendChild(fragment);
                });
        })
};

// REMOVE COLOR
const removeColor = element => {
    if (element.className === "removeColor") {
        const colorId = element.dataset.id;
        console.log("remove color", colorId);

        deleteData("http://localhost:8000/colors/" + colorId)
            .then(response => {
                document.querySelector(`#colorForm-${colorId}`).remove();
            });
    }
}

// INSERT COLOR FORM TO SIDEBAR
const createColorForm = color => {
    const id = color.id;

    // Create form for each color
    const form = document.createElement("form");
    form.id = `colorForm-${id}`;
    form.className = "color-grid";
    form.dataset.id = id;
    form.innerHTML = `
        <div>
            <input type="number" name="min_${id}" id="min_${id}" value="${color.min_temp}">
        </div>
        <div>
            <input type="number" name="max_${id}" id="max_${id}" value="${color.max_temp}">
        </div>
        <div>
            <input type="color" name="color_${id}" id="color_${id}" value="${color.color}">
        </div>
        <div>
            <input type="submit" value="Save">
            <button data-id="${id}" class="removeColor">x</button>
        </div>
    `;

    // Apply color ruleset to calendar
    applyRule(color.min_temp, color.max_temp, color.color);

    return form;
}

//
const applyRule = (min, max, bgcolor) => {
    const days = document.querySelectorAll("div.day");

    for (const day of days) {
        const temp = parseFloat(day.dataset.temp);
        if (temp >= min && temp <= max) {
            day.style.backgroundColor = bgcolor;
        }
    }
};


// INITIAL PAGE LOAD
//---------------------------------------------------------------------------------------------------


const init = () => {
    // Add click event for add color form
    const addColorForm = document.querySelector("#addColorForm");
    addColorForm.addEventListener("submit", event => {
        event.preventDefault();
        addColor();
    });

    // Add click event delegation to remove color
    colorList.addEventListener("click", event => {
        event.preventDefault();
        removeColor(event.target);
    });

    // Get temperature data
    getData("http://localhost:8000/temps")
        .then(data => {
            const monthlyDailyTemps = groupMonthlyDailyTemps(data);
            groupHourlyTemps(monthlyDailyTemps);
        })
        .then(() => {
            loadCalender();
        });

    // Get color rulesets for calendar
    getData("http://localhost:8000/colors")
        .then(colors => {
            const fragment = new DocumentFragment();

            for (const color of colors) {
                // console.log(color);
                const form = createColorForm(color);
                fragment.appendChild(form);
            }

            colorList.appendChild(fragment);
        });
};

init();