

/* ********** GENERAL SCRIPTING **********************

		This templates shows what you can do in this is module script
		All the code outside functions will be executed each time this script is loaded, meaning at file load, when hitting the "reload" button or when saving this file
*/


// You can add custom parameters to use in your script here, they will be replaced each time this script is saved
// var myFloatParam = script.addFloatParameter("My Float Param","Description of my float param",.1,0,1); 		//This will add a float number parameter (slider), default value of 0.1, with a range between 0 and 1

//Here are all the type of parameters you can create
/*
var myTrigger = script.addTrigger("My Trigger", "Trigger description"); 									//This will add a trigger (button)
var myBoolParam = script.addBoolParameter("My Bool Param","Description of my bool param",false); 			//This will add a boolean parameter (toggle), defaut unchecked
var myFloatParam = script.addFloatParameter("My Float Param","Description of my float param",.1,0,1); 		//This will add a float number parameter (slider), default value of 0.1, with a range between 0 and 1
var myIntParam = script.addIntParameter("My Int Param","Description of my int param",2,0,10); 				//This will add an integer number parameter (stepper), default value of 2, with a range between 0 and 10
var myStringParam = script.addStringParameter("My String Param","Description of my string param", "cool");	//This will add a string parameter (text field), default value is "cool"
var myColorParam = script.addColorParameter("My Color Param","Description of my color param",0xff0000ff); 	//This will add a color parameter (color picker), default value of opaque blue (ARGB)
var myP2DParam = script.addPoint2DParameter("My P2D Param","Description of my p2d param"); 					//This will add a point 2d parameter
var myP3DParam = script.addPoint3DParameter("My P3D Param","Description of my p3d param"); 					//This will add a point 3d parameter
var myTargetParam = script.addTargetParameter("My Target Param","Description of my target param"); 			//This will add a target parameter (to reference another parameter)
var myEnumParam = script.addEnumParameter("My Enum Param","Description of my enum param",					//This will add a enum parameter (dropdown with options)
											"Option 1", 1,													//Each pair of values after the first 2 arguments define an option and its linked data
											"Option 2", 5,												    //First argument of an option is the label (string)
											"Option 3", "banana"											//Second argument is the value, it can be whatever you want
											); 	
*/


//you can also declare custom internal variable
//var myValue = 5;

/*
 The init() function will allow you to init everything you want after the script has been checked and loaded
 WARNING it also means that if you change values of your parameters by hand and set their values inside the init() function, they will be reset to this value each time the script is reloaded !
*/
function init()
{
	//myFloatParam.set(5); //The .set() function set the parameter to this value.
	//myColorParam.set([1,.5,1,1]);	//for a color parameter, you need to pass an array with 3 (RGB) or 4 (RGBA) values.
	//myP2DParam.set([1.5,-5]); // for a Point2D parameter, you need to pass 2 values (XY)
	//myP3DParam.set([1.5,2,-3]); // for a Point3D parameter, you need to pass 3 values (XYZ)
}

/*
 This function will be called each time a parameter of your script has changed
*/
function scriptParameterChanged(param)
{
	//You can use the script.log() function to show an information inside the logger panel. To be able to actuallt see it in the logger panel, you will have to turn on "Log" on this script.
	script.log("Parameter changed : "+param.name); //All parameters have "name" property
	if(param.is(myTrigger)) script.log("Trigger !"); //You can check if two variables are the reference to the same parameter or object with the method .is()
	else if(param.is(myEnumParam)) script.log("Key = "+param.getKey()+", data = "+param.get()); //The enum parameter has a special function getKey() to get the key associated to the option. .get() will give you the data associated
	else script.log("Value is "+param.get()); //All parameters have a get() method that will return their value
}

/*
 This function, if you declare it, will launch a timer at 50hz, calling this method on each tick
*/
/*
function update(deltaTime)
{
	script.log("Update : "+util.getTime()+", delta = "+deltaTime); //deltaTime is the time between now and last update() call, util.getTime() will give you a timestamp relative to either the launch time of the software, or the start of the computer.
}
*/



function moduleParameterChanged(param)
{
	if(param.isParameter())
	{
		script.log("Module parameter changed : "+param.name+" > "+param.get());
	}else 
	{
		script.log("Module parameter triggered : "+param.name);	
	}
}

function moduleValueChanged(value)
{
	if(value.isParameter())
	{
		script.log("Module value changed : "+value.name+" > "+value.get());	
	}else 
	{
		script.log("Module value triggered : "+value.name);	
	}
}

var slotsData = [];
for (var i = 0; i < 512; i++) {
	slotsData[i] = {"HTP" : {}, "LTP" : {}, "LTPStack" : [], "FX" : {}, "Master" : 1, "dataType" : ""};
}

var dmxSlot = function() {
	this.value = 0;
	this.level = 1;
};


function setChannel8bit(chanNumber, mode, slotNumber, value) {
	updateSlot(chanNumber, mode, slotNumber, value, "i8");
	processChannelI8(chanNumber);
}

function setChannel16bit(chanNumber, mode, slotNumber, value) {
	updateSlot(chanNumber, mode, slotNumber, value, "i16");
	processChannelI16(chanNumber);
}

function setChannelRGB8bit(chanNumber, mode, slotNumber, value) {
	updateSlot(chanNumber, mode, slotNumber, value, "rgb8");
	processChannelRGB8(chanNumber);
}

function setChannelRGB16bit(chanNumber, mode, slotNumber, value) {
	updateSlot(chanNumber, mode, slotNumber, value, "rgb16");
	processChannelRGB16(chanNumber);
}

function clearSlot(chanNumber, mode, slotNumber) {
	if (slotsData[chanNumber-1][mode] && slotsData[chanNumber-1][mode][""+slotNumber]) {
		if (mode == "LTP") {
			var slot = slotsData[chanNumber-1][mode][""+slotNumber];
			var index = slotsData[chanNumber-1].LTPStack.indexOf(slot);
			if (index != -1) {slotsData[chanNumber-1].LTPStack.splice(index,1);}
		}
		slotsData[chanNumber-1][mode][""+slotNumber] = undefined;
		if (slotsData[chanNumber-1].dataType == "i8") {processChannelI8(chanNumber);}
		else if (slotsData[chanNumber-1].dataType == "i16") {processChannelI16(chanNumber);}
		else if (slotsData[chanNumber-1].dataType == "rgb8") {processChannelRGB8(chanNumber);}
		else if (slotsData[chanNumber-1].dataType == "rgb16") {processChannelRGB16(chanNumber);}
	}
}


function clearChannel(chanNumber, mode) {
	if (mode == "LTP" || mode == "All") {
		slotsData[chanNumber-1].LTP = {};
		slotsData[chanNumber-1].LTPStack = {};
	}
	if (mode == "HTP" || mode == "All") {
		slotsData[chanNumber-1].HTP = {};
	}
	if (mode == "FX" || mode == "All") {
		slotsData[chanNumber-1].FX = {};
	}
}






function updateSlot(chanNumber, mode, slotNumber, value, dataType) {
	slotsData[chanNumber-1].dataType = dataType;
	if (mode == "HTP") {setHTPChannel(chanNumber, slotNumber, value) ;}
	else if (mode == "LTP") {setLTPChannel(chanNumber, slotNumber, value) ;}
	else if (mode == "FX") {setFXChannel(chanNumber, slotNumber, value) ;}
	else if (mode == "Master") {setMasterChannel(chanNumber, value) ;}
}




function setHTPChannel(chanNumber, slotNumber, value) {
	if (!slotsData[chanNumber-1].HTP[""+slotNumber]) {slotsData[chanNumber-1].HTP[""+slotNumber] = new dmxSlot();}
	slotsData[chanNumber-1].HTP[""+slotNumber].value = value;
}

function setLTPChannel(chanNumber, slotNumber, value) {
	if (!slotsData[chanNumber-1].LTP[""+slotNumber]) {
		slotsData[chanNumber-1].LTP[""+slotNumber] = new dmxSlot();
	}
	var slot = slotsData[chanNumber-1].LTP[""+slotNumber];
	slot.value = value;
	var index = slotsData[chanNumber-1].LTPStack.indexOf(slot);
	if (index != -1) {slotsData[chanNumber-1].LTPStack.splice(index,1);}
	slotsData[chanNumber-1].LTPStack.push(slot);
}

function setFXChannel(chanNumber, slotNumber, value) {
	if (!slotsData[chanNumber-1].FX[""+slotNumber]) {slotsData[chanNumber-1].FX[""+slotNumber] = new dmxSlot();}
	slotsData[chanNumber-1].FX[""+slotNumber].value = value;
}

function setMasterChannel(chanNumber, value) {
	slotsData[chanNumber-1].Master = value;
}


function processChannelI8(chanNumber) {
	var val = processNumericChannel(chanNumber);
	write8bitValue(chanNumber, val);
}

function processChannelI16(chanNumber) {
	var val = processNumericChannel(chanNumber);
	write16bitValue(chanNumber, val);
}

function processChannelRGB8(chanNumber) {
	var val = processRGBChannel(chanNumber);
	write8bitRGB(chanNumber, val);
}

function processChannelRGB16(chanNumber) {
	var val = processRGBChannel(chanNumber);
	write16bitRGB(chanNumber, val);
}

function processNumericChannel(chanNumber) {
	val = 0;
	var data = slotsData[chanNumber-1];

	if (data.LTPStack) {
		for (var i = 0; i < data.LTPStack.length; i++) {
			var slot = data.LTPStack[i];
			val = map(slot.level,0,1,val, slot.value);
		}
	}
	if (data.HTP) {
		var slotsId = util.getObjectProperties(data.HTP);
		for (var i = 0; i< slotsId.length; i++) {
			var s = data.HTP[slotsId[i]];
			val = Math.max(val, s.value * s.level);
		}
	}
	if (data.FX) {
		var slotsId = util.getObjectProperties(data.FX);
		for (var i = 0; i< slotsId.length; i++) {
			var s = data.FX[slotsId[i]];
			val += s.value * s.level;
		}
	}

	val = val * data.Master; 

	val = Math.max(val, 0);
	val = Math.min(val, 1);
	return val;
}


function processRGBChannel(chanNumber) {
	val = [0,0,0,0];
	var data = slotsData[chanNumber-1];

	if (data.LTPStack) {
		for (var i = 0; i < data.LTPStack.length; i++) {
			var slot = data.LTPStack[i];
			for (var j = 0; j < 4; j++) {
				val[j] = map(slot.level,0,1,val[j], slot.value[j]);
			}
		}
	}

	if (data.HTP) {
		var slotsId = util.getObjectProperties(data.HTP);
		for (var i = 0; i< slotsId.length; i++) {
			var s = data.HTP[slotsId[i]];
			for (var j = 0; j < 4; j++) {
				val = Math.max(val[j], s.value[j] * s.level);
			}
		}
	}

	if (data.FX) {
		var slotsId = util.getObjectProperties(data.FX);
		for (var i = 0; i< slotsId.length; i++) {
			var s = data.FX[slotsId[i]];
			for (var j = 0; j < 4; j++) {
				val += s.value[j] * s.level;
			}
		}
	}

	for (var j = 0; j < 4; j++) {
		val[j] = val[j] * data.Master; 
		val[j] = Math.max(val[j], 0);
		val[j] = Math.min(val[j], 1);
	}
	return val;
}




function write8bitValue(chanNumber, value) {
	value = Math.round(value*255);
	local.send(chanNumber, value);
}

function write16bitValue(chanNumber, value) {
	value = value * ((256 * 256)-1);
	var msb = Math.floor(value / 256);
	var lsb = Math.floor(value % 256);
	local.send(chanNumber, msb);
	local.send(chanNumber+1, lsb);
}

function write8bitRGB(chanNumber, value) {
	var r = Math.round(value[0]*255);
	local.send(chanNumber+0, r);
	var g = Math.round(value[1]*255);
	local.send(chanNumber+1, g);
	var b = Math.round(value[2]*255);
	local.send(chanNumber+2, b);
}

function write16bitRGB(chanNumber, value) {
	script.log(value[0], value[1], value[2]);
	var r = value[0] * ((256 * 256)-1);
	local.send(chanNumber+0, Math.floor(r/256));
	local.send(chanNumber+1, Math.floor(r%256));
	var g = value[1] * ((256 * 256)-1);
	local.send(chanNumber+2, Math.floor(g/256));
	local.send(chanNumber+3, Math.floor(g%256));
	var b = value[2] * ((256 * 256)-1);
	local.send(chanNumber+4, Math.floor(b/256));
	local.send(chanNumber+5, Math.floor(b%256));
}












function explode(v) {
	script.log(" proprietes : ");
	var content = util.getObjectProperties(v);
	for (var i = 0; i< content.length; i++) {
		script.log("  - "+content[i]);
	}

	script.log(" methodes : ");
	content = util.getObjectMethods(v);
	for (var i = 0; i< content.length; i++) {
		script.log("  - "+content[i]);
	}
}

function map(value, low1, high1, low2, high2) {
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}
