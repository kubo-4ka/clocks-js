let dateFormat = "YYYY/MM/DD";
let weekdayFormat = "JP";
let timeUnit = "hms";
let colonVisible = true;
let lastBlink = Date.now();
let currentTimezone = "Asia/Tokyo";
let showTimezone = true;

function getComplementaryColor(hexColor) {
  const hex = hexColor.replace('#', '');
  if (hex.length !== 6) return '#ffffff';
  const original = parseInt(hex, 16);
  const inverted = 0xFFFFFF ^ original;
  return '#' + inverted.toString(16).padStart(6, '0');
}

function showNotification(message) {
  const el = document.getElementById('notification');
  el.textContent = message;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 3000);
}

function updateClock() {
  const now = new Date();
  const options = {
    timeZone: currentTimezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  };

  const dateTimeFormat = new Intl.DateTimeFormat("en-US", options);
  const parts = dateTimeFormat.formatToParts(now);
  const partMap = Object.fromEntries(parts.map(p => [p.type, p.value]));

  const hours = partMap.hour;
  const minutes = partMap.minute;
  const seconds = partMap.second;
  const milliseconds = String(now.getMilliseconds()).padStart(3, '0').slice(0, 2);
  const year = partMap.year;
  const month = partMap.month;
  const day = partMap.day;

  const weekdayJP = new Intl.DateTimeFormat("ja-JP", { weekday: "short", timeZone: currentTimezone }).format(now);
  const weekdayEN = new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: currentTimezone }).format(now).toUpperCase();
  let weekday = "";
  if (weekdayFormat === "JP") {
    weekday = weekdayJP;
  } else if (weekdayFormat === "EN") {
    weekday = weekdayEN;
  }

  let colon = ":";
  if (timeUnit === "hm") {
    colon = colonVisible ? ":" : " ";
  }

  let timeText = "";
  if (timeUnit === "hm") {
    timeText = `${hours}${colon}${minutes}`;
  } else if (timeUnit === "hms") {
    timeText = `${hours}:${minutes}:${seconds}`;
  } else if (timeUnit === "hmsms") {
    timeText = `${hours}:${minutes}:${seconds}.${milliseconds}`;
  }

  let dateText = "";
  switch (dateFormat) {
    case "MM/DD": dateText = `${month}/${day}`; break;
    case "MM/DD/YYYY": dateText = `${month}/${day}/${year}`; break;
    case "DD-MM-YYYY": dateText = `${day}-${month}-${year}`; break;
    case "NONE": dateText = ""; break;
    case "YYYY/MM/DD":
    default: dateText = `${year}/${month}/${day}`; break;
  }

  document.getElementById('time').textContent = timeText;
  document.getElementById('date').textContent = dateText + (weekdayFormat !== "NONE" && dateText ? ` ${weekday}` : "");

  const tzIdDisplay = document.getElementById('timezoneIdDisplay');
  tzIdDisplay.textContent = currentTimezone;
  tzIdDisplay.style.display = showTimezone ? 'block' : 'none';
}

function toggleFullScreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(err => {
      console.error(`フルスクリーンにできませんでした: ${err.message}`);
    });
  } else {
    document.exitFullscreen();
  }
}

function getSettings() {
  return {
    bgColor: document.getElementById('bgColorPicker').value,
    textColor: document.getElementById('textColorPicker').value,
    timeFont: document.getElementById('timeFontSelect').value,
    dateFont: document.getElementById('dateFontSelect').value,
    timeSize: document.getElementById('timeSizeRange').value,
    dateSize: document.getElementById('dateSizeRange').value,
    dateFormat: document.getElementById('dateFormatSelect').value,
    weekdayFormat: document.getElementById('weekdayFormatSelect').value,
    timeUnit: document.getElementById('timeUnitSelect').value,
    timezone: document.getElementById('timezoneSelect').value,
    showTimezone: document.getElementById('showTimezoneLabel').checked,
  };
}

function applySettings(settings) {
  if (settings.textColor.toLowerCase() === settings.bgColor.toLowerCase()) {
    const corrected = getComplementaryColor(settings.bgColor);
    settings.textColor = corrected;
    showNotification("背景と文字色が同一のため、文字色を変更しました");
  }

  document.getElementById('bgColorPicker').value = settings.bgColor;
  document.getElementById('textColorPicker').value = settings.textColor;
  document.getElementById('timeFontSelect').value = settings.timeFont;
  document.getElementById('dateFontSelect').value = settings.dateFont;
  document.getElementById('timeSizeRange').value = settings.timeSize;
  document.getElementById('dateSizeRange').value = settings.dateSize;
  document.getElementById('dateFormatSelect').value = settings.dateFormat;
  document.getElementById('weekdayFormatSelect').value = settings.weekdayFormat;
  document.getElementById('timeUnitSelect').value = settings.timeUnit;
  document.getElementById('timezoneSelect').value = settings.timezone || "Asia/Tokyo";
  document.getElementById('showTimezoneLabel').checked = settings.showTimezone !== false;

  dateFormat = settings.dateFormat;
  weekdayFormat = settings.weekdayFormat;
  timeUnit = settings.timeUnit;
  currentTimezone = settings.timezone || "Asia/Tokyo";
  showTimezone = settings.showTimezone !== false;

  document.body.style.backgroundColor = settings.bgColor;
  document.body.style.color = settings.textColor;
  document.querySelectorAll('.hamburger span').forEach(span => {
    span.style.backgroundColor = settings.textColor;
  });
  document.getElementById('time').style.fontFamily = settings.timeFont;
  document.getElementById('date').style.fontFamily = settings.dateFont;
  document.getElementById('time').style.fontSize = settings.timeSize + "vw";
  document.getElementById('date').style.fontSize = settings.dateSize + "vw";
  document.getElementById('timeSizeValue').textContent = settings.timeSize;
  document.getElementById('dateSizeValue').textContent = settings.dateSize;
}

function updateClockLoop() {
  const now = Date.now();
  if (timeUnit === "hm" && now - lastBlink >= 1000) {
    colonVisible = !colonVisible;
    lastBlink = now;
  }
  updateClock();
  requestAnimationFrame(updateClockLoop);
}

window.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem('clockSettings');
  if (saved) {
    applySettings(JSON.parse(saved));
  } else {
    applySettings({
      bgColor: "#000000",
      textColor: "#dddddd",
      timeFont: "'Courier New'",
      dateFont: "'Courier New'",
      timeSize: "8",
      dateSize: "4",
      dateFormat: "YYYY/MM/DD",
      weekdayFormat: "JP",
      timeUnit: "hms",
      timezone: "Asia/Tokyo",
      showTimezone: true
    });
  }

  const menuButton = document.getElementById('menu-button');
  const menuPanel = document.getElementById('menu-panel');
  menuButton.addEventListener('click', () => {
    menuPanel.classList.toggle('active');
    menuButton.classList.toggle('active');
  });

  document.querySelectorAll('#bgColorPicker, #textColorPicker, #timeFontSelect, #dateFontSelect, #dateFormatSelect, #weekdayFormatSelect, #timeUnitSelect, #timezoneSelect')
    .forEach(el => {
      el.addEventListener('change', () => {
        const settings = getSettings();
        applySettings(settings);
        localStorage.setItem('clockSettings', JSON.stringify(settings));
      });
    });

  document.querySelectorAll('#timeSizeRange, #dateSizeRange').forEach(el => {
    el.setAttribute('min', '1');
    el.setAttribute('max', '20');
    el.addEventListener('input', () => {
      const settings = getSettings();
      applySettings(settings);
      localStorage.setItem('clockSettings', JSON.stringify(settings));
    });
  });

  document.getElementById('showTimezoneLabel').addEventListener('change', () => {
    const settings = getSettings();
    applySettings(settings);
    localStorage.setItem('clockSettings', JSON.stringify(settings));
  });

  document.getElementById('resetSettings').addEventListener('click', () => {
    const defaultSettings = {
      bgColor: "#000000",
      textColor: "#dddddd",
      timeFont: "'Courier New'",
      dateFont: "'Courier New'",
      timeSize: "8",
      dateSize: "4",
      dateFormat: "YYYY/MM/DD",
      weekdayFormat: "JP",
      timeUnit: "hms",
      timezone: "Asia/Tokyo",
      showTimezone: true
    };
    applySettings(defaultSettings);
    localStorage.removeItem('clockSettings');
  });

  document.addEventListener('click', (e) => {
    if (menuPanel.classList.contains('active') && !menuPanel.contains(e.target) && !menuButton.contains(e.target)) {
      menuPanel.classList.remove('active');
      menuButton.classList.remove('active');
    }
  });

  updateClockLoop();
});
