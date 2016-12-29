var content, heading;

function addClass(element, className) {
    element.className += (' ' + className);
}

function removeClass(element, className) {
    element.className = element.className.replace((' ' + className), '');
}

function goTo(url) {
    window.open(url);
}

function loadPage(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'html/' + url + '.html', true);
    xhr.onreadystatechange = function () {
        if (this.readyState !== 4) return;
        if (this.status !== 200) return;
        content.innerHTML = this.responseText;
        window.scrollTo(0, 0);
        window.location.hash = url;

        var activeItems = document.getElementsByClassName('active');
        if (activeItems.length != 0) {
            var activeItem = activeItems[0];
            removeClass(activeItem, 'active');
        }
        var selectedItem = document.getElementById(url);
        if (selectedItem !== null) {
            addClass(selectedItem, 'active');
        }
    };
    xhr.send();
}

function updatePage() {
    var locationHash = window.location.hash;
    if (locationHash === '') {
        loadPage('index');
    } else {
        loadPage(locationHash.replace('#', ''));
    }
}

window.onload = function () {
    content = document.getElementById('content');
    heading = document.getElementsByTagName('h1')[0];
    content.style.width = heading.offsetWidth + "px";
    updatePage();
};