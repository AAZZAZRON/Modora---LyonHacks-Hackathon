// runs everytime the pop up is clicked
var check;
var chooseBlocked;
var badArray = [];
var defaultBad = ["https://twitter.com/", "https://www.youtube.com/", "https://www.reddit.com/", "https://www.netflix.com/ca/", "https://www.disneyplus.com/", "https://www.instagram.com/", "https://www.facebook.com/", "https://discord.com/"]
var validEndings = [".com", ".ca", ".org", ".net", ".edu", ".gov", ".info", ".jobs", ".mil", ".name", ".pro", ".me", ".xyz", ".tel"]
 
window.onload = function() { // runs everytime the popup extension is opened
    var arr = getCookie("banned").split(", ");
    if (arr.length == 1) { // if no "bad apps", then add the defaultBad
        arr = [];
        for (let i = 0; i < defaultBad.length; i += 1) {
            arr.push(defaultBad[i]);
        }
        addCookie("banned", arr.join(", "));
    }
    var goTo = getCookie("tracker"); // tracker cookie shows where the user last left off
    if (goTo == "") {
        addCookie("tracker", "mainMenu");
        goTo = "mainMenu";
    }
    if (goTo == "mainMenu") {
        mainMenu();
    } else if (goTo == "timerOn") {
        timerSetup();
    }
}


function mainMenu() { // show main menu screen
    check = false;
    addCookie("tracker", "mainMenu");
    document.getElementById("MainMenu").hidden = false;
    document.getElementById("SetupTimer").hidden = true;
    document.getElementById("TimerOn").hidden = true;
    document.getElementById("abortedScreen").hidden = true;
    document.getElementById("ToDoList").hidden = true;
    document.getElementById("websitesScreen").hidden = true;
    document.getElementById("completedScreen").hidden = true;
    document.getElementById("PomodoroButton").onclick = () => setPomodoro();
    document.getElementById("ToDoListButton").onclick = () => setToDoList();
    document.getElementById("ManageWebsitesButton").onclick = () => setWebsites();
}

function setPomodoro() { // show pomodoro setup screen
    document.getElementById("MainMenu").hidden = true;
    document.getElementById("SetupTimer").hidden = false;
    document.getElementById("TimerOn").hidden = true;
    document.getElementById("abortedScreen").hidden = true;
    document.getElementById("websitesScreen").hidden = true;
    document.getElementById("SelectAll").onclick = () => toggle();
    document.getElementById("bb1").onclick = () => {
        chooseBlocked.remove();
        mainMenu();
    };
    document.getElementById("start-button").onclick = () => {
        sendBadSites(document.getElementById("ChooseBlocked").children); 
        chooseBlocked.remove();
        timerSetup();
    }


    // build list based on "banned" list of user
    chooseBlocked = document.createElement("div");
    chooseBlocked.id = "ChooseBlocked";
    document.getElementById("choose-blocked-form").appendChild(chooseBlocked);
    const things = getCookie("banned").split(", ")
    for (let i = 0; i < things.length; i += 1) {
        addToBlockedList(things[i]); // add website to blocked list
    }   
}

function sendBadSites(instances) { // creates a global array of the "bad arrays", which is then used by the background to check the websites
    badArray = ["null"];
    var ind = instances.length - 2;
    while (ind >= 0) {
        if (instances[ind].checked) {
            badArray.push(instances[ind + 1].innerText.substring(0, instances[ind + 1].innerText.length - 2));
        }
        ind -= 2;
    }
    chrome.runtime.sendMessage({message: "update badLinks", content: `${badArray.join(", ")}`});
}


function timerSetup() { // set up the timer screen, start and reset timer
    document.getElementById("MainMenu").hidden = true;
    document.getElementById("SetupTimer").hidden = true;
    document.getElementById("TimerOn").hidden = false;
    document.getElementById("abortedScreen").hidden = true;
    document.getElementById("abort").onclick = () => {
        showAbortScreen();
    }
    if (getCookie("tracker") != "timerOn") { // makes sure that the timer is only set once
        createTimer();
    }
    addCookie("tracker", "timerOn")
}

function showAbortScreen() {
    document.getElementById("MainMenu").hidden = true;
    document.getElementById("SetupTimer").hidden = true;
    document.getElementById("TimerOn").hidden = true;
    document.getElementById("abortedScreen").hidden = false;
    document.getElementById("bb2").onclick = () => mainMenu();
    badArray = [];
    chrome.runtime.sendMessage({message: "update badLinks", content: "null"});
    chrome.runtime.sendMessage({message: "abort"})
    addCookie("tracker", "mainMenu");
}

function showCompletedScreen() {
    document.getElementById("MainMenu").hidden = true;
    document.getElementById("SetupTimer").hidden = true;
    document.getElementById("TimerOn").hidden = true;
    document.getElementById("completedScreen").hidden = false;
    document.getElementById("bb3").onclick = () => mainMenu();
    badArray = [];
    chrome.runtime.sendMessage({message: "update badLinks", content: "null"});
    addCookie("tracker", "mainMenu");
}


function toggle() { // check and uncheck all items
    var checkboxes = document.getElementsByName("x");
    if (check) {
        check = false;
    } else {
        check = true;
    }
    for (let i = 0; i < checkboxes.length; i += 1) {
        checkboxes[i].checked = check;
    }
}

function addToBlockedList(inner) { // add known blocked website to the blocked website list (in HTML)
    let check = document.createElement("INPUT");
    check.setAttribute("type", "checkbox");
    check.name = "x";
    let label = document.createElement("LABEL");
    label.innerText = inner + "\n";
    label.className = "boxes";
    label.name = "x";
    chooseBlocked.appendChild(check);
    chooseBlocked.appendChild(label);
}
