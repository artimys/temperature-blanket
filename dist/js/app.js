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

const loadCalendar = (calendarData) => {
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
                <div>Sun</div>
                <div>Mon</div>
                <div>Tue</div>
                <div>Wed</div>
                <div>Thu</div>
                <div>Fri</div>
                <div>Sat</div>
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
                    <div class="temp-hi">
                        <span>Hi:</span> ${day.max_temp} <span>&#176;F</span>
                    </div>
                    <div class="temp-low">
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

    // Add fragment to calendar element
    calendar.appendChild(fragment);
}

const updateColorsToCalendar = async () => {
    // Remove all colors from calendar
    document.querySelectorAll(".day").forEach(day => {
        day.style.backgroundColor = "";
    });

    // Get all colors again
    const colors = await getColors();
    // Apply colors to only calendar
    for (const color of colors) {
        applyRule(color.min_temp, color.max_temp, color.color);
    }
}

//---------------------------------------------------------------------------------------------------

const getColors = async () => {
    const response = await fetch("/.netlify/functions/api/colors");
    const colorData = await response.json();
    return colorData;
};

const loadColors = (colors) => {
    const fragment = new DocumentFragment();

    for (const color of colors) {
        const form = createColorSection(color);
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
    const minTemp = document.querySelector("#min");
    const maxTemp = document.querySelector("#max");
    const color = document.querySelector("#color");
    const colorData = {
        min_temp: minTemp.value,
        max_temp: maxTemp.value,
        color: color.value
    };

    try {
        // Create new color record
        const newColor = await postData("/.netlify/functions/api/colors", colorData);
        colorList.appendChild( createColorSection(newColor) );

        // Update colors on calendar
        updateColorsToCalendar();

        // Reset defaults
        minTemp.value = 60;
        maxTemp.value = 80;
        color.value = "#000000";
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
            const updatedColor = await patchData("/.netlify/functions/api/colors/" + colorId, colorUpdateData);

            // Update specific color row using response
            const updatedSection = document.querySelector(`#section-${updatedColor.id}`);
            updatedSection.replaceWith( createColorSection(updatedColor) );

            // Update colors on calendar
            updateColorsToCalendar();
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
            const removedColor = await deleteData("/.netlify/functions/api/colors/" + colorId);

            // Remove color section
            const sectionToRemove = document.querySelector(`#section-${removedColor.id}`);
            sectionToRemove.remove();

            // Update colors on calendar
            updateColorsToCalendar();
        } catch (error) {
            console.error("removeColor error:", error);
        }
    }
}

// INSERT COLOR FORM TO SIDEBAR
const createColorSection = color => {
    const id = color.id;

    // Create form for each color
    const section = document.createElement("section");
    section.id= `section-${id}`;
    section.dataset.id= id;
    section.dataset.initial = `${color.min_temp}${color.max_temp}${color.color}`;
    section.className = "color-grid";
    section.innerHTML = `
        <div>
            <input type="number" name="min_${id}" id="min_${id}" value="${color.min_temp}" step="0.01" min="50" max="110" class="control">
        </div>
        <div>
            <input type="number" name="max_${id}" id="max_${id}" value="${color.max_temp}" step="0.01" min="50" max="110" class="control">
        </div>
        <div>
            <input type="color" name="color_${id}" id="color_${id}" value="${color.color}" class="control">
        </div>
        <div>
            <button id="save_${id}" data-id="${id}" class="btn updateColor btn-update--hide">save</button>
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

// TOGGLE SAVE BUTTON
const toggleSaveButton = (event) => {
    if (event.target.classList.contains("control")) {
        const colorId = event.target.parentElement.parentElement.dataset.id;
        const initialValues = event.target.parentElement.parentElement.dataset.initial;
        const saveBtn = document.querySelector(`button#save_${colorId}`);

        // Determine current values
        const min_temp = document.querySelector(`#min_${colorId}`).value;
        const max_temp = document.querySelector(`#max_${colorId}`).value;
        const color = document.querySelector(`#color_${colorId}`).value;
        const currValues = `${min_temp}${max_temp}${color}`;

        // Hide or show
        if (initialValues === currValues) {
            saveBtn.classList.add("btn-update--hide");
        } else {
            saveBtn.classList.remove("btn-update--hide");
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

    // Add event listeners to detect temp and color changes
    ["keyup", "change"].forEach(eventType => {
        colorList.addEventListener(eventType, event => {
            toggleSaveButton(event);
        });
    });

    try {
        // Get temperature data
        const calendarData = await getCalendarData();
        loadCalendar(calendarData);

        // Get color ruleset for calendar
        const colorData = await getColors();
        loadColors(colorData);

    } catch (error) {
        console.error("init error:", error);
    }
});