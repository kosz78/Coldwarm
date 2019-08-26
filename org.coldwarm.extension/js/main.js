/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, window, location, CSInterface, SystemPath, themeManager*/

(function () {
    'use strict';
    
    var mockMode = true;

    var csInterface = new CSInterface();

    var _foregroundColor = 0;
    var _colors;
    var _saturationColors;

    function loadForegroundColor() {
        if (mockMode) {
            _foregroundColor = 0x9C8774;
        } else {
            csInterface.evalScript('loadForegroundColor()', 
                                    function(result) { 
                                        _foregroundColor = parseInt(result, 16);
                                        refresh();
                                    });
        }
    }

    function initColorsVectors() {
        _colors = new Array();
        for (var i = 0; i < Settings.plateRawQuantity; i++) {
            _colors[i] = new Array();
            
            for (var j = 0; j < Settings.plateRawQuantity; j++) {
                _colors[i][j] = _foregroundColor;
            }
        }
    }
    
    function initSaturationVector() {
        _saturationColors = new Array();
        
        for (var i = 0; i < Settings.plateRawQuantity; i++) {
            _saturationColors[i] = _foregroundColor;
        }
    }

    function refreshColors() {
        var currentTemp = - (Settings.tempStepDistance * Settings.plateOneSideQuantity);
        var currentLightness =  (Settings.lumaStepDistance * Settings.plateOneSideQuantity);
        
        for (var i = 0; i < Settings.plateRawQuantity; i++) {
            for (var j = 0; j < Settings.plateRawQuantity; j++) {
                _colors[i][j] = getWarmerColorBrightnessFix(addToAllChannels(_foregroundColor, currentLightness), currentTemp);
                currentLightness -= Settings.lumaStepDistance;
            }
            currentTemp += Settings.tempStepDistance;
            currentLightness = (Settings.lumaStepDistance * Settings.plateOneSideQuantity);
        }
    }

    function refreshSaturation() {
        var currentSaturationStep = Settings.saturationMaxStep;
        var saturationDecreaseStep = Settings.saturationMaxStep / Settings.plateOneSideQuantity;

        for (var i = 0; i < Settings.plateRawQuantity; i++) {
            if (Settings.saturationHSB) {
                _saturationColors[i] = saturationHSBMove(_foregroundColor, currentSaturationStep);
            } else {
                _saturationColors[i] = saturationMove(_foregroundColor, currentSaturationStep);
            }
            currentSaturationStep -= saturationDecreaseStep;
        }
    }

    function setColor(color) {
        if (!mockMode) {
            csInterface.evalScript('setForegroundColor(' + getRed24(color) + ', ' + getGreen24(color) + ', ' + getBlue24(color) + ')');
            _foregroundColor = color;
            refresh();
        } else {
            console.log("Color: " + color);
        }
    }

    function refresh() {
        var c = document.getElementById("canvas");
        var w = window.innerWidth;
        var h = window.innerHeight - 5;
        c.setAttribute("width", w)
        c.setAttribute("height", h)
        var ctx = c.getContext("2d");
        var cs = (w - Settings.plateBorderIndent * 2) / Settings.plateRawQuantity; 
        refreshColors();
        if (Settings.showSaturation) {
            cs = (w - Settings.plateBorderIndent * 3) / (Settings.plateRawQuantity + 1);
            refreshSaturation();
        }
        for (var i = 0; i < Settings.plateRawQuantity; i++) {
            for (var j = 0; j < Settings.plateRawQuantity; j++) {
                ctx.fillStyle = '#' + _colors[i][j].toString(16);
                ctx.fillRect(i * cs + Settings.plateBorderIndent, 
                             j * cs + Settings.plateBorderIndent, 
                             cs - Settings.plateIndent,
                             cs - Settings.plateIndent);
            }
        }     
        for (var i = 0; i < Settings.plateRawQuantity; i++) {
            ctx.fillStyle = '#' + _saturationColors[i].toString(16);
            ctx.fillRect(cs * Settings.plateRawQuantity + Settings.plateBorderIndent * 2, 
                         i * cs + Settings.plateBorderIndent, 
                         cs - Settings.plateIndent,
                         cs - Settings.plateIndent);
        }
    }

    function initMenu() {
        var menu = 
            `<Menu>
                <MenuItem Label="Show Saturation Bar" Enabled="true" Checked="` + Settings.showSaturation + `"/>
                <MenuItem Label="---" />
                <MenuItem Label="Increment Plate Count" Enabled="true" Checked="false"/>
                <MenuItem Label="Decriment Plate Count" Enabled="true" Checked="false"/>
            </Menu>`;
        csInterface.setPanelFlyoutMenu(menu);
        function flyoutMenuClickedHandler (event) {
			switch (event.data.menuName) {
				case "Show Saturation Bar": 
					Settings.showSaturation = !Settings.showSaturation;
					csInterface.updatePanelMenuItem("Show Saturation Bar", true, Settings.showSaturation);
					break;
                case "Increment Plate Count": 
					if (Settings.plateOneSideQuantity < 6) {
                        Settings.plateOneSideQuantity++;
                    }
					break;
                case "Decriment Plate Count": 
					if (Settings.plateOneSideQuantity > 1) {
                        Settings.plateOneSideQuantity--;
                    }
					break;
            }
            Settings.plateRawQuantity = Settings.plateOneSideQuantity * 2 + 1;
            storeSettings();
            reload();
		}
		csInterface.addEventListener("com.adobe.csxs.events.flyoutMenuClicked", flyoutMenuClickedHandler);
    }

    function reload() {
        loadForegroundColor();
        initColorsVectors();
        initSaturationVector();
        refresh();
    }

    function init() {
        loadSettings();
        mockMode = csInterface.hostEnvironment === undefined
        if (!mockMode) {
            themeManager.init();
            initMenu();
            var extensionRoot = csInterface.getSystemPath(SystemPath.EXTENSION) + "/jsx/";
            csInterface.evalScript('init("' + extensionRoot + '")');
            csInterface.addEventListener(
                "ColdWarmColorEvent", 
                function(e) {
                    _foregroundColor = parseInt(e.data, 16);
                    refresh();
                }
            );
        }
        reload();
        window.addEventListener("resize", refresh);
        var c = document.getElementById("canvas");
        c.addEventListener("mousedown", function(event) {
            var x = event.pageX;
            var y = event.pageY;
            var w = window.innerWidth;
            var cs = (w - Settings.plateBorderIndent * 2) / Settings.plateRawQuantity; 
            if (Settings.showSaturation) {
                cs = (w - Settings.plateBorderIndent * 3) / (Settings.plateRawQuantity + 1);
            }
            var i = Math.floor((x - Settings.plateBorderIndent) / cs);
            var j = Math.floor((y - Settings.plateBorderIndent) / cs);
            if (i >= Settings.plateRawQuantity && Settings.showSaturation) {
                setColor(_saturationColors[j]);
            } else {
                setColor(_colors[i][j]);
            }
        });
    }
        
    init();

}());