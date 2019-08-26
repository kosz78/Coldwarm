function Settings(){};

Settings.WINDOW_MAX_WIDTH = 500;
Settings.WINDOW_MAX_HEIGHT = 500;

Settings.WINDOW_MIN_WIDTH = 60;
Settings.WINDOW_MIN_HEIGHT = 50;

Settings.plateOneSideQuantity = 3;
Settings.plateRawQuantity = Settings.plateOneSideQuantity * 2 + 1;

Settings.plateIndent = 0;
Settings.plateBorderIndent = 5;

Settings.saturationRawDistanceMin = 2;
Settings.saturationRawDistanceMax = 8;
Settings.showSaturation = true;

Settings.tempStepDistance = 12; 
Settings.lumaStepDistance = 12;

Settings.saturationMaxStep = 0.5;
Settings.saturationHSB = false;

function loadSettings() {
  if (localStorage.getItem("coldwarm.plateOneSideQuantity") !== null) {
    Settings.plateOneSideQuantity = parseInt(localStorage.getItem("coldwarm.plateOneSideQuantity"));
    Settings.plateRawQuantity = Settings.plateOneSideQuantity * 2 + 1;
  }
  if (localStorage.getItem("coldwarm.showSaturation") !== null) {
    Settings.showSaturation = localStorage.getItem("coldwarm.showSaturation") === 'true';
  }
}

function storeSettings() {
  localStorage.setItem('coldwarm.plateOneSideQuantity', Settings.plateOneSideQuantity);
  localStorage.setItem('coldwarm.showSaturation', Settings.showSaturation);
}