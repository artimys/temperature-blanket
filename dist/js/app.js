const weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const calendar = document.querySelector("main#calendar");
const colorList = document.querySelector("#colorList");


//---------------------------------------------------------------------------------------------------

const postData = async (url, data) => {
    const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify(data),
        headers: new Headers({
            "Content-Type": "application/json"
        })
    });

    const dataResponse = await response.json();
    return dataResponse;
};

const patchData = async (url, data) => {
    const response = await fetch(url, {
        method: "PATCH",
        body: JSON.stringify(data),
        headers: {
            "Content-Type": "application/json"
        }
    });

    const dataResponse = await response.json();
    return dataResponse;
};

const deleteData = async (url) => {
    const response = await fetch(url, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json"
        }
    });

    const dataResponse = await response.json();
    return dataResponse;
};

//---------------------------------------------------------------------------------------------------

const getCalendarData = async () => {
    const response = await fetch("http://localhost:8000/js/king81.json");

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

            dayDiv.innerHTML = `
                <div class="corner">${day.date.day}</div>
                <div class="temp">
                    <div>
                        <span>Hi:</span> ${day.max_temp} <span>&#176;F</span>
                    </div>
                    <div>
                        <span>Lo:</span> ${day.min_temp} <span>&#176;F</span>
                    </div>
                </div>
                <small class="status">
                    ${day.weather.main}
                </small>
            `;

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
    const response = await fetch("http://localhost:8000/.netlify/functions/server/colors");
    const colorData = await response.json();
    return colorData;
};

const loadColors = (colors) => {
    const fragment = new DocumentFragment();

    for (const color of colors) {
        const form = createColorRow(color);
        fragment.appendChild(form);

        // Apply color ruleset to calendar
        applyRule(color.min_temp, color.max_temp, color.color);
    }

    // TODO -
    colorList.innerHTML = "";
    colorList.appendChild(fragment);
};

// ADD COLOR
const addColor = async () => {
    const minValue = document.querySelector("#min").value;
    const maxValue = document.querySelector("#max").value;
    const colorValue = document.querySelector("#color").value;

    const colorData = {
        min_temp: minValue,
        max_temp: maxValue,
        color: colorValue
    };

    try {
        // Create new color record
        await postData("http://localhost:8000/.netlify/functions/server/colors", colorData);

        // Get and load all colors again
        const colors = await getColors();
        loadColors(colors);
    } catch (error) {
        console.error("addColor error:", error);
    }
};

// UPDATE COLOR
const updateColor = async event => {
    const element = event.target;

    if (element.classList.contains("updateColor")) {
        event.preventDefault();
        const colorId = element.dataset.id;

        const colorUpdateData = {
            min_temp: document.querySelector(`#min_${colorId}`).value,
            max_temp: document.querySelector(`#max_${colorId}`).value,
            color: document.querySelector(`#color_${colorId}`).value
        };

        try {
            // Update color through API
            const reponse = await patchData("http://localhost:8000/.netlify/functions/server/colors/" + colorId, colorUpdateData);

            // Remove all colors from calendar
            document.querySelectorAll(".day").forEach(day => {
                day.style.backgroundColor = "";
            });

            // Get and load all colors again
            const colors = await getColors();
            loadColors(colors);
        } catch (error) {
            console.error("updateColor error:", error);
        }
    }
}

// REMOVE COLOR
const removeColor = async event => {
    const element = event.target;

    if (element.classList.contains("removeColor")) {
        event.preventDefault();

        const colorId = element.dataset.id;

        try {
            // Remove color through API
            const reponse = await deleteData("http://localhost:8000/.netlify/functions/server/colors/" + colorId);

            // Remove all colors from calendar
            document.querySelectorAll(".day").forEach(day => {
                day.style.backgroundColor = "";
            });

            // Get and load all colors again
            const colors = await getColors();
            loadColors(colors);
        } catch (error) {
            console.error("removeColor error:", error);
        }
    }
}

// INSERT COLOR FORM TO SIDEBAR
const createColorRow = color => {
    const id = color.id;

    // Create form for each color
    const section = document.createElement("section");
    section.className = "color-grid";
    section.innerHTML = `
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
            <button data-id="${id}" class="btn updateColor">save</button>
            <button data-id="${id}" class="btn btn-remove removeColor">x</button>
        </div>
    `;

    return section;
}

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
    // Add click event for add color form
    const addColorForm = document.querySelector("#addColorForm");
    addColorForm.addEventListener("submit", event => {
        event.preventDefault();
        addColor();
    });

    colorList.addEventListener("click", event => {
        // Add click event delegation to remove color
        removeColor(event);

        // Add click event delegation to update color
        updateColor(event);
    });

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