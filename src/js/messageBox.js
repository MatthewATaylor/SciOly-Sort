function displayMessage(message) {
    let messageBox = document.getElementById("message-box");
    messageBox.innerHTML = "<p>" + escapeHTML(message) + "</p>";
    messageBox.style.height = "auto";
    messageBox.style.top = "50%";
    messageBox.style.opacity = "0.95";
    setTimeout(function () { messageBox.style.opacity = "0"; }, 2000);
    setTimeout(function () {
        messageBox.style.height = "0";
        messageBox.style.top = "-9999%";
    }, 3000);
}
