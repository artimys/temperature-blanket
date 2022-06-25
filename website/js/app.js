const weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const calendar = document.querySelector("main#calendar");
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

    console.log("have calender data");
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
    const response = await fetch("http://localhost:8000/colors");
    const colorData = await response.json();
    console.log("have color data");
    return colorData;
};

const loadColors = (colors) => {
    const fragment = new DocumentFragment();

    for (const color of colors) {
        const form = createColorForm(color);
        fragment.appendChild(form);
    }

    colorList.appendChild(fragment);
    console.log("colors added");
};

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
                // Remove color form from sidebar
                document.querySelector(`#colorForm-${colorId}`).remove();

                // Remove all color from calendar
                document.querySelectorAll(".day").forEach((day) => {
                    day.style.backgroundColor = "";
                });

                // Re-apply colors
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

    // Add click event delegation to remove color
    colorList.addEventListener("click", event => {
        event.preventDefault();
        removeColor(event.target);
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