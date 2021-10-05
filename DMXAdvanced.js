/// DMX processing

var clearAllSlotsBtn = script.addTrigger("Clear all slots", "Clear all slots for all channels");

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

function clearAllChannel(mode) {
	for (var i = 0; i < 512; i++) {
		clearChannel(i+1, mode);
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
				val[j] += s.value[j] * s.level;
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


////////  Patch helper

var variablesGroup = script.addTargetParameter("Patch helper variables","Select the custom variable group that you wanna use as values");
variablesGroup.setAttribute("targetType","container");
variablesGroup.setAttribute("root",root.customVariables);
variablesGroup.setAttribute("searchLevel",0);

var inputList = script.addTargetParameter("Patch helper list","Select the multiplex list that you wanna fill");
inputList.setAttribute("targetType","container");
inputList.setAttribute("root",root.states);
inputList.setAttribute("searchLevel",4);

var dmxChannelsList = script.addTargetParameter("Patch helper dmx channels list","Select the multiplex list that you wanna fill");
dmxChannelsList.setAttribute("targetType","container");
dmxChannelsList.setAttribute("root",root.states);
dmxChannelsList.setAttribute("searchLevel",4);

var cvStart = script.addIntParameter("Patch helper list Start ","List position for the first custom variable ", 1, 1);

var dmxStart = script.addIntParameter("Patch helper DMX First Adress","DMX address of the first custom variable ", 1, 1);
var dmxOffset = script.addIntParameter("Patch helper DMX Offset","DMX adress every X channels", 1, 1);

var fillInputListBtn = script.addTrigger("Fill input list", "Fill selected list with selected custom variables");

function fillInputList() {
	var group = variablesGroup.getTarget();
	var cvlist = inputList.getTarget();
	var dmxlist = dmxChannelsList.getTarget();
	if (!group.variables || !cvlist) {return;}
	var delta;

	var variables = group.variables.getItems();
	var cvInputs = getInputListElements(cvlist);

	var dmxIinputs = getInputListElements(dmxlist);
	var currentDMX = dmxStart.get();

	var max = Math.min(variables.length, cvInputs.length-delta);
	delta = cvStart.get()-1;
	for (var i = 0; i < max; i++) {
		cvInputs[i+delta].set(variables[i].getChild(variables[i].name));

		dmxIinputs[i+delta].set(currentDMX);
		currentDMX += dmxOffset.get();
	}


	//root.states.state.processors.multiplex1.lists.dmx.#2

}

function scriptParameterChanged(param) {
	if(param.is(fillInputListBtn)) {
		fillInputList();
	} else if(param.is(clearAllSlotsBtn)) {
		clearAllChannel();
	}  
}




function getInputListElements(element) {
	var children = [];
	var props = util.getObjectProperties(element);
	for (var i = 0; i< props.length; i++) {
		if (element[props[i]]._type == "Controllable" && props[i].substring(0,1) == "#") {
			children.push(element[props[i]]);
		}
	}
	return children;
}







/////// Util lib

function explode(v) {
	script.log("  ");
	script.log(" proprietes : ");
	var content = util.getObjectProperties(v);
	for (var i = 0; i< content.length; i++) {
		script.log("  - "+content[i]+" : "+v[content[i]]);
	}

	script.log(" methodes : ");
	content = util.getObjectMethods(v);
	for (var i = 0; i< content.length; i++) {
		script.log("  - "+content[i]);
	}
	script.log("  ");
}

function map(value, low1, high1, low2, high2) {
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}


function effect(targetValue, targetCV, num, total) {
	targetCV = controlAdressToElement(targetCV);
	if (!targetCV) {return;}
	var target = controlAdressToElement(targetValue);
	if (! target) { return; }
	var parents = getLayerAndSequence(target);
	if (!parents) {return; }

	var totalTime = root.sequences.effect.totalTime.get();
	var currentTime = root.sequences.effect.currentTime.get();
	
	var time = currentTime + (2*totalTime) - ((num / total) * totalTime);
	while(time > totalTime) {time -= totalTime;}
	
	var val = parents.layer.automation.getValueAtPosition(time);
	targetCV.set(val);

}

function controlAdressToElement(a) {
	a = a.split("/");
	a.splice(0,1);
	target = root;
	while (a.length > 0 && target != undefined) {
		target = target.getChild(a[0]);
		a.splice(0,1);
	}
	return target;
} 

function getLayerAndSequence(t) {
	var layer = false;
	var sequence = false;
	var noParent = false;

	while (!layer && !sequence && !noParent) {
		if (!t.is(root)) {
			t = t.getParent();
			if (t.automation != undefined) {layer = t;}
			if (t.currentTime != undefined) {sequence = t;}
		} else {
			noParent = true;
		}
	}

	if (noParent) {
		return false;
	}
	return {
		"layer":layer, 
		"sequence":sequence, 
	};
}


