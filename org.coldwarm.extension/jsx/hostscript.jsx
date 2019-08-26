/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, Folder*/


function sayHello(){
    alert("hello from ExtendScript1");
}

function init(root){
    //alert("init " + root);
    app.notifiersEnabled = true;
    app.notifiers.add("setd", File(root + "callback.jsx"));
}

function loadForegroundColor(){
    return app.foregroundColor.rgb.hexValue;
}

function setForegroundColor(r, g, b) {
    var color = new SolidColor();
	color.rgb.red = r;
	color.rgb.blue = b;
	color.rgb.green = g;
	app.foregroundColor = color;
}