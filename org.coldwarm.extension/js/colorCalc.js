/**
 * Сравнивает два цваета, возврашает сумму разницы каналов.
 * @param	colorA
 * @param	colorB
 * @return
 */
function compareTwoColors24(colorOne, colorTwo) {
	var colorA = colorOne;
	var colorB = colorTwo;

	var red    = getRed24(colorA) - getRed24(colorB);
	var green  = Math.abs(getGreen24(colorA) - getGreen24(colorB));
	var blue   = Math.abs(getBlue24 (colorA) - getBlue24 (colorB));

	if (red   < 0){ red   = -red }
	if (green < 0){ green = -green }
	if (blue  < 0){ blue  = -blue }

	return red + green + blue;
}

/**
 * Сдвиг цвета по насыщенности в пространстве HSB. Двигает относительно текущего положения.
 * @param	color Цвет который нужно сдвинуть.
 * @param	value Значение от -1 до 1. 1 - максимально насыщенный, -1 серый, 0.5 -- на пол пути к максимально насыщенному.
 * @return Новый цвет.
 */
function saturationHSBMove(color, value) {
	var rgb = [getRed24(color), getGreen24(color), getBlue24(color)];

	//Индексы массива
	var red = 0;
	var green = 1;
	var blue = 2;

	//Если серый -- нечего делать. Если насыщенность 100% -- нечего делать. Если изменение 0 -- нечего делать. Если отключили свет -- нечего делать.
	var isGray = (rgb[red] == rgb[green] && rgb[red] == rgb[blue] && rgb[green] == rgb[blue]);
	var isSaturationMax = (rgb[red] == 0 || rgb[blue] == 0 || rgb[green] == 0) && value > 0;

	if (isGray || isSaturationMax ||  value == 0) {
		return color;
	} else {
		if (value > 1) { value = 1; } else
		if (value < -1) { value = -1; }
	}

	//Console.log("2: " + "R: " + rgb[red] + "   G: " + rgb[green] + "   B: " + rgb[blue]);
	var h = (rgb[red] > rgb[green]) ? red : green;
	h = (rgb[h] > rgb[blue]) ? h : blue;

	var l = (rgb[red] < rgb[green]) ? red : green;
	l = (rgb[l] > rgb[blue]) ? blue : l;

	var m = (rgb[red] > rgb[green] && rgb[red] < rgb[blue]) || (rgb[red] > rgb[blue] && rgb[red] < rgb[green]) ? red 
					: ((rgb[green] > rgb[red] && rgb[green] < rgb[blue]) || (rgb[green] > rgb[blue] && rgb[green] < rgb[red])) ? green : blue;
	//Console.log("3: " + "H: " + h + "   M: " + m + "   L: " + l);

	if (value > 0) {
		//От среднего отнимаем часть пропорциональную разнице H и M к разнице H и S.
		rgb[m] -= (rgb[h] - rgb[m]) / (rgb[h] - rgb[l]) * rgb[l] * value;
		rgb[l] -= rgb[l] * value;
	} else {
		//Подтягиваем слабые каналы к сильному
		rgb[m] += (rgb[h] - rgb[m]) * -value;
		rgb[l] += (rgb[h] - rgb[l]) * -value;
	}

	return combineTo24(rgb[red], rgb[green], rgb[blue]);
}

/**
 * Сдвиг цвета по насыщенности. Двигает относительно текущего положения. По сравнению с saturationHSBMove есть корректировки
 * так что визуально это более похоже на Ctrl + U в ФШ.
 * @param	color Цвет который нужно сдвинуть.
 * @param	value Значение от -1 до 1. 1 - максимально насыщенный, -1 серый.
 * @return Новый цвет.
 */
function saturationMove(color, value) {
	var resultColor;
	
	var rgb = [getRed24(color), getGreen24(color), getBlue24(color)];
	
	//Индексы массива
	var red = 0;
	var green = 1;
	var blue = 2;
	
	//Если серый -- нечего делать. Если насыщенность 100% -- нечего делать. Если изменение 0 -- нечего делать. Если отключили свет -- нечего делать.
	var isGray = (rgb[red] == rgb[green] && rgb[red] == rgb[blue] && rgb[green] == rgb[blue]);
	var isSaturationMax = (rgb[red] == 0 || rgb[blue] == 0 || rgb[green] == 0) && value > 0;
	
	if (isGray || isSaturationMax ||  value == 0)	{
		return color;
	} else {
		if (value > 1) { value = 1; } 
		else if (value < -1) { value = -1; }
	}
	
	//Console.log("2: " + "R: " + rgb[red] + "   G: " + rgb[green] + "   B: " + rgb[blue]);
	var h = (rgb[red] > rgb[green]) ? red : green;
	h = (rgb[h] > rgb[blue]) ? h : blue;
	
	var l = (rgb[red] < rgb[green]) ? red : green;
	l = (rgb[l] > rgb[blue]) ? blue : l;
	
	var m = (rgb[red] > rgb[green] && rgb[red] < rgb[blue]) || (rgb[red] > rgb[blue] && rgb[red] < rgb[green]) ? red 
			: ((rgb[green] > rgb[red] && rgb[green] < rgb[blue]) || (rgb[green] > rgb[blue] && rgb[green] < rgb[red])) ? green : blue;
	//Console.log("3: " + "H: " + h + "   M: " + m + "   L: " + l);
	
	var medium = getLumaGray(color);
	
	if (value > 0) {
		//От среднего отнимаем часть пропорциональную разнице H и M к разнице H и S.
		rgb[m] -= (rgb[h] - rgb[m]) / (rgb[h] - rgb[l]) * rgb[l] * value;
		rgb[l] -= rgb[l] * value;
	} else {
		//Считаем яркость этого цвета и "идем" всеми каналами к ней.
		rgb[l] += (rgb[l] - medium) * value;
		rgb[m] += (rgb[m] - medium) * value;
		rgb[h] += (rgb[h] - medium) * value;				
	}
	
	return combineTo24(rgb[red], rgb[green], rgb[blue]);
}

/**
 * Добавляет значение ко всем каналам.
 * @param	color Оригинальный цвет.
 * @param	value Значение, может быть отрицательным.
 * @return получившийся цвет.
 */
function addToAllChannels(color, value) {
	var r = getRed24(color) + value;
	var g = getGreen24(color) + value;
	var b = getBlue24(color) + value;
	
	if (r > 255) {  r = 255; };
	if (g > 255) {	g = 255; };
	if (b > 255) {	b = 255; };
	if (r < 0) { r = 0; }
	if (g < 0) { g = 0; }
	if (b < 0) { b = 0; }
	
	return combineTo24(r, g, b);
}

//1 Выбор и присваивание разных каналов изображению

//2 HSV и обратно

/**
 * Возвращяет цвет теплее или холоднее заданного.
 * @param	color заданный цвет.
 * @param	distance степень утепления, если  отрицательное - степень холоднения
 * @return
 */
function getWarmerColor(color, distance) {
	var r = getRed24(color);
	var g = getGreen24(color);
	var b = getBlue24(color);
	
	r += distance;
	b -= distance;
	
	if (r > 255) {  r = 255; };
	if (b > 255) {	b = 255; };
	if (r < 0) { r = 0; }
	if (b < 0) { b = 0; }
	
	return combineTo24(r, g, b);
}

function getWarmerColorBrightnessFix(color, distance) {
	var r = getRed24(color);
	var g = getGreen24(color);
	var b = getBlue24(color);
	
	var startBrightness = getLumaGray(color);
	
	r += distance;
	b -= distance;
	
	if (r > 255) {  r = 255; };
	if (b > 255) {	b = 255; };
	if (g > 255) {	g = 255; };
	if (r < 0) { r = 0; }
	if (b < 0) { b = 0; }
	if (g < 0) { g = 0; }
	
	var result = combineTo24(r, g, b);
	var endBrightness = getLumaGray(result);
	//Console.log("2: " + (endBrightness - startBrightness));
	result = addToAllChannels(result, (startBrightness - endBrightness) * 2);
	
	return result;
}

//1 getRedChannelAsGrey

/**
 * Делает из одноканального серого, RGB серый.
 * @param	color серый от 0 до 255.
 * @return серый от 0 до 255 в RGB.
 */
function getGray(color) {
	return combineTo24(color, color, color);
}
		
/**
 * Возвращает яркость(0-255) RGB цвета.
 * @param	color RGB цвет.
 * @return Одноканальная яркость цвета, число от 0 до 255.
 */
function getLumaGray(color) {
	var r = getRed24(color);
	var g = getGreen24(color);
	var b = getBlue24(color);

	return (0.2126 * r) + (0.7152 * g) + (0.0722 * b);
}
		
function getRed24(color) {
	return color >>> 16;
}

function getGreen24(color) {
	return color >>> 8 & 0xFF;
}

function getBlue24(color) {
	return color & 0xFF;
}

function getAlpha32(color) {
	return color >>> 24;
}

function getRed32(color) {
	return color >>> 16 & 0xFF;
}

function getGreen32(color) {
	return color >>> 8 & 0xFF;
}

function getBlue32(color) {
	return color & 0xFF;
}

function setAlpha(Color, value) {
	return (Color & 0x00ffffff) | (value << 24);
}

function setRed(Color, value)	{
	return (Color & 0xff00ffff) | (value << 16);
}

function setGreen(Color, value) {
	return (Color & 0xffff00ff) | (value << 8);
}
		
function setBlue(Color, value)	{
	return (Color & 0xffffff00) | value;
}
		
function setAllEqualChannels(value) {
	var result = 0;
	result = setRed(result, value);
	result = setGreen(result, value);
	result = setBlue(result, value);
	return result;
}

function combineTo24(red, green, blue) {
	return red << 16 | green << 8 | blue;
}

function combineTo32(alpha, red, green, blue) {
	return alpha << 24 | red << 16 | green << 8 | blue;
}