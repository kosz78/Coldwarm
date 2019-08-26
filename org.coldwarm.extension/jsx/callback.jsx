/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, Folder*/

try {
	var xLib = new ExternalObject("lib:\PlugPlugExternalObject");
  if (xLib) {
		var eventObj = new CSXSEvent(); 
		eventObj.type = "ColdWarmColorEvent";
		eventObj.data = app.foregroundColor.rgb.hexValue;
		eventObj.dispatch();
	}
} catch (e) {
	alert(e);
}