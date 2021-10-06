/// DMX processing

var clearAllSlotsBtn = script.addTrigger("Clear all slots", "Clear all slots for all channels");

var slotsData = {};

function verifSlotData(chanName) {
	if (!slotsData[chanName]) {
		script.log(chanName);
		slotsData[chanName] = {"HTP" : {}, "LTP" : {}, "LTPStack" : [], "FX" : {}, "Master" : 1, "dataType" : ""};
	}
}

var dmxSlot = function() {
	this.value = 0;
	this.level = 1;
};

function setValueSimple(chanName, dataType, mode, slotName, value) {
	if (dataType == "i8") {setValue(chanName,dataType, mode, slotName, value, false, false, false); }
	else if (dataType == "i16") {setValue(chanName,dataType, mode, slotName, false, value, false, false); }
	else if (dataType == "rgb8") {setValue(chanName,dataType, mode, slotName, false, false, valus, false); }
	else if (dataType == "rgb16") {setValue(chanName,dataType, mode, slotName, false, false, false, value); }
}

function setSlotLevel(chanName, mode, slotName, value) {
	if (slotsData[chanName][mode] && slotsData[chanName][mode][slotName]) {
		slotsData[chanName][mode][slotName].level = value;
		if (slotsData[chanName].dataType == "i8") {processChannelI8(chanName); }
		else if (slotsData[chanName].dataType == "i16") {processChannelI16(chanName); }
		else if (slotsData[chanName].dataType == "rgb8") {processChannelRGB8bit(chanName); }
		else if (slotsData[chanName].dataType == "rgb16") {processChannelRGB16bit(chanName); }
	}
}

function refreshSlot(chanName) {
	if (slotsData[chanName].dataType == "i8") {processChannelI8(chanName);}
	else if (slotsData[chanName].dataType == "i16") {processChannelI16(chanName);}
	else if (slotsData[chanName].dataType == "rgb8") {processChannelRGB8(chanName);}
	else if (slotsData[chanName].dataType == "rgb16") {processChannelRGB16(chanName);}

}

function setValue(chanName, dataType, mode, slotName, valuei8, valuei16, valuergb8, valuergb16) {
	if (dataType == "i8") {setChannel8bit(chanName, mode, slotName, valuei8); }
	else if (dataType == "i16") {setChannel16bit(chanName, mode, slotName, valuei16); }
	else if (dataType == "rgb8") {setChannelRGB8bit(chanName, mode, slotName, valuergb8); }
	else if (dataType == "rgb16") {setChannelRGB16bit(chanName, mode, slotName, valuergb16); }
}

function setChannel8bit(chanName, mode, slotName, value) {
	updateSlot(chanName, mode, slotName, value, "i8");
	processChannelI8(chanName);
}

function setChannel16bit(chanName, mode, slotName, value) {
	updateSlot(chanName, mode, slotName, value, "i16");
	processChannelI16(chanName);
}

function setChannelRGB8bit(chanName, mode, slotName, value) {
	updateSlot(chanName, mode, slotName, value, "rgb8");
	processChannelRGB8(chanName);
}

function setChannelRGB16bit(chanName, mode, slotName, value) {
	updateSlot(chanName, mode, slotName, value, "rgb16");
	processChannelRGB16(chanName);
}

function clearSlot(chanName, mode, slotName) {
	if (slotsData[chanName][mode]!==undefined && slotsData[chanName][mode][slotName]!==undefined) {
		if (mode == "LTP") {
			var slot = slotsData[chanName][mode][slotName];
			var index = slotsData[chanName].LTPStack.indexOf(slot);
			if (index != -1) {slotsData[chanName].LTPStack.splice(index,1);}
		}
		slotsData[chanName][mode][slotName] = undefined;
		if (slotsData[chanName].dataType == "i8") {processChannelI8(chanName);}
		else if (slotsData[chanName].dataType == "i16") {processChannelI16(chanName);}
		else if (slotsData[chanName].dataType == "rgb8") {processChannelRGB8(chanName);}
		else if (slotsData[chanName].dataType == "rgb16") {processChannelRGB16(chanName);}
	}
}


function clearChannel(chanName, mode) {
	if (mode == "LTP" || mode == "All") {
		slotsData[chanName].LTP = {};
		slotsData[chanName].LTPStack = {};
	}
	if (mode == "HTP" || mode == "All") {
		slotsData[chanName].HTP = {};
	}
	if (mode == "FX" || mode == "All") {
		slotsData[chanName].FX = {};
	}
}

function clearAllChannel(mode) {
	for (var i = 0; i < 512; i++) {
		clearChannel(i+1, mode);
	}
}


function updateSlot(chanName, mode, slotName, value, dataType) {
	verifSlotData(chanName);
	slotsData[chanName].dataType = dataType;
	if (mode == "HTP") {setHTPChannel(chanName, slotName, value);}
	else if (mode == "LTP") {setLTPChannel(chanName, slotName, value) ;}
	else if (mode == "FX") {setFXChannel(chanName, slotName, value) ;}
	else if (mode == "Master") {setMasterChannel(chanName, value) ;}
}

function setHTPChannel(chanName, slotName, value) {
	if (!slotsData[chanName].HTP[slotName]) {slotsData[chanName].HTP[slotName] = new dmxSlot(); }
	slotsData[chanName].HTP[slotName].value = value;
}

function setLTPChannel(chanName, slotName, value) {
	if (!slotsData[chanName].LTP[slotName]) {
		slotsData[chanName].LTP[slotName] = new dmxSlot();
	}
	var slot = slotsData[chanName].LTP[slotName];
	slot.value = value;
	var index = slotsData[chanName].LTPStack.indexOf(slot);
	if (index != -1) {slotsData[chanName].LTPStack.splice(index,1);}
	slotsData[chanName].LTPStack.push(slot);
}

function setFXChannel(chanName, slotName, value) {
	if (!slotsData[chanName].FX[slotName]) {
		slotsData[chanName].FX[slotName] = new dmxSlot();
	}
	slotsData[chanName].FX[slotName].value = value;
}

function setMasterChannel(chanName, value) {
	slotsData[chanName].Master = value;
}


function processChannelI8(chanName) {
	var val = processNumericChannel(chanName);
	write8bitValue(chanName, val);
}

function processChannelI16(chanName) {
	var val = processNumericChannel(chanName);
	write16bitValue(chanName, val);
}

function processChannelRGB8(chanName) {
	var val = processRGBChannel(chanName);
	write8bitRGB(chanName, val);
}

function processChannelRGB16(chanName) {
	var val = processRGBChannel(chanName);
	write16bitRGB(chanName, val);
}

function processNumericChannel(chanName) {
	var val = 0;
	var data = slotsData[chanName];
	if (data.LTPStack.length > 0 ) {
		for (var i = 0; i < data.LTPStack.length; i++) {
			var slot = data.LTPStack[i];
			val = map(slot.level, 0, 1, val, slot.value);
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


function processRGBChannel(chanName) {
	var val = [0,0,0,0];
	var data = slotsData[chanName];
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




function write8bitValue(chanName, value) {
	value = Math.round(value*255);
	var chans = getPatch(chanName);
	for (var i = 0; i< chans.length; i++) {
		var address = chans[i];
		local.send(address, value);
	}
}

function write16bitValue(chanName, value) {
	value = value * ((256 * 256)-1);
	var msb = Math.floor(value / 256);
	var lsb = Math.floor(value % 256);
	var chans = getPatch(chanName);
	for (var i = 0; i< chans.length; i++) {
		var address = chans[i];
		local.send(address, msb);
		local.send(address+1, lsb);
	}
}

function write8bitRGB(chanName, value) {
	var r = Math.round(value[0]*255);
	var g = Math.round(value[1]*255);
	var b = Math.round(value[2]*255);
	var chans = getPatch(chanName);
	for (var i = 0; i< chans.length; i++) {
		var address = chans[i];
		local.send(address+0, r);
		local.send(address+1, g);
		local.send(address+2, b);
	}
}

function write16bitRGB(chanName, value) {
	var r = value[0] * ((256 * 256)-1);
	var g = value[1] * ((256 * 256)-1);
	var b = value[2] * ((256 * 256)-1);
	var chans = getPatch(chanName);
	for (var i = 0; i< chans.length; i++) {
		var address = chans[i];
		script.log(address);
		local.send(address+0, Math.floor(r/256));
		local.send(address+1, Math.floor(r%256));
		local.send(address+2, Math.floor(g/256));
		local.send(address+3, Math.floor(g%256));
		local.send(address+4, Math.floor(b/256));
		local.send(address+5, Math.floor(b%256));
	}
}


////////  Patch helper

var variablesGroup = script.addTargetParameter("Patch helper variables","Select the custom variable group that you wanna use as values");
variablesGroup.setAttribute("targetType","container");
variablesGroup.setAttribute("root",root.customVariables);
variablesGroup.setAttribute("searchLevel",0);

var inputList = script.addTargetParameter("Patch helper custom variables list","Select the multiplex list that you wanna fill");
inputList.setAttribute("targetType","container");
inputList.setAttribute("root",root.states);
inputList.setAttribute("searchLevel",4);

var dmxChannelsList = script.addTargetParameter("Patch helper channels list","Select the multiplex list that you wanna fill");
dmxChannelsList.setAttribute("targetType","container");
dmxChannelsList.setAttribute("root",root.states);
dmxChannelsList.setAttribute("searchLevel",4);

var fillInputListBtn = script.addTrigger("Fill input list", "Fill selected list with selected custom variables");

function fillInputList() {
	var group = variablesGroup.getTarget();
	var cvlist = inputList.getTarget();
	var dmxlist = dmxChannelsList.getTarget();
	if (!group.variables || !cvlist) {return;}

	var variables = group.variables.getItems();
	var cvInputs = getInputListElements(cvlist);

	var dmxIinputs = getInputListElements(dmxlist);

	var max = Math.min(variables.length, cvInputs.length);
	for (var i = 0; i < max; i++) {
		cvInputs[i].set(variables[i].getChild(variables[i].name));
		dmxIinputs[i].set(variables[i].niceName);
	}


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





function effect(chanName, dataType, mode, slotName, sequenceValue, num, total) {
	var target = controlAdressToElement(sequenceValue);
	if (! target) { return; }
	var parents = getLayerAndSequence(target);
	if (!parents) {return; }

	var totalTime = parents.sequence.totalTime.get();
	var currentTime = parents.sequence.currentTime.get();
	
	var time = currentTime + (2*totalTime) - ((num / total) * totalTime);
	while(time > totalTime) {time -= totalTime;}
	
	var val = parents.layer.automation.getValueAtPosition(time);
	setValueSimple(chanName, dataType, mode, slotName, val);
}

function effectCV(targetValue, targetCV, num, total) {
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
	if (!a) {return false;}
	a = a.split("/");
	if (!a) {return false;}
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

	while ((!layer || !sequence) && !noParent) {
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



var patch = {};
var patchContainer = local.parameters.addContainer("Patch");
var patchReset = local.parameters.addTrigger("Reset Patch", "Reset all patch values");

var deletePatchItems = [];

function update(deltaTime) {
	for (var i = 0; i< deletePatchItems.length; i++) {
		patchContainer.removeContainer(deletePatchItems[i].name);
		patch[deletePatchItems[i].niceName] = false;
	}		
	deletePatchItems = [];
}

function getPatch(chanName) {
	if (!patch[chanName]) {
		patch[chanName] = [];
		updatePatchDisplay();
	}
	return patch[chanName];
}

function updatePatchDisplay() {
	var channelNames = util.getObjectProperties(patch);
	for (var i = 0; i < channelNames.length; i++) {
		var name = channelNames[i];
		var channelContainer = patchContainer.getChild(name);
		if (channelContainer == undefined) {
			channelContainer = patchContainer.addContainer(name);
			addPatchButtons(channelContainer);
			var btnAddress = channelContainer.addIntParameter("Address 1", "DMX Address", 0, 0, 512);
			btnAddress.setAttribute("saveValueOnly",false);
		} 
	}
}

function init() {
	checkAddRemoveButtons();
	readAllPatchFromInput();
}

function readAllPatchFromInput() {
	var children = util.getObjectProperties(patchContainer);
	for (var i = 0; i < children.length; i++) {
		var elmt = patchContainer[children[i]];
		if (elmt._type == "Container") {
			readPatchFromInput(elmt.name, elmt.niceName);
		}
		script.log(patchContainer[children[i]]._type);
	}
}

function checkAddRemoveButtons() {
	var children = util.getObjectProperties(patchContainer);
	for (var i = 0; i < children.length; i++) {
		var elmt = patchContainer[children[i]];
		script.log(elmt);
		if (elmt._type == "Container" && !elmt.addPatch) {
			addPatchButtons(elmt);
		}
	}
}

function addPatchButtons(element) {
	var btnAdd = element.addTrigger("Add patch", "Press me to add a new patch value");
	var btnDelete = element.addTrigger("Delete patch", "Press me to delete a patch value or this channel");
}

function moduleParameterChanged(param) {
	var parent = param.getParent();
	if (param.is(patchReset)) {
		resetPatch();
	} else if (param.name == "addPatch" || param.name == "deletePatch") {
		var next = 0;
		var valid = true;
		while (valid) {
			next++;
			valid = parent["address"+next] !== undefined;
		}
		if (param.name == "addPatch") {
			var addressField = parent.addIntParameter("Address "+(next), "DMX Address (set to 0 means disabled)", 0, 0, 512);
			addressField.setAttribute("saveValueOnly",false);
		} else if (param.name == "deletePatch") {
			if (next > 2) {
				parent.removeParameter("address"+(next-1));
			} else {
				deletePatchItems.push(parent);
			}
		} 
	} else if (param.name.substring(0,7) == "address") {
		readPatchFromInput(param.getParent().name, param.getParent().niceName);
	} else {
		script.log(param.name);
	}
}

function resetPatch() {
	local.parameters.removeContainer("Patch");
	patchContainer = local.parameters.addContainer("Patch");
	patch = {};

}

function readPatchFromInput(name, niceName){
	var container = patchContainer.getChild(name);
	var currentPatch = patch[niceName];
	var newPatch = [];
	var current = 0;
	var valid = true;
	while (valid && current < 100) {
		current++;
		var param = container.getChild("address"+current);
		valid = container["address"+current] !== undefined;
		if (valid) {
			var val = param.get();
			if (val > 0) {
				newPatch.push(val);
			}
		}
	}
	var type = slotsData[niceName].dataType;

	for (var i = 0; i< currentPatch.length; i++) {
		if (newPatch.indexOf(currentPatch[i]) == -1) {
			if (type == "i8") {
				local.send(currentPatch[i],0);
			}
			else if (type == "i16") {
				local.send(currentPatch[i],0);
				local.send(currentPatch[i+1],0);
			}
			else if (type == "rgb8") {
				local.send(currentPatch[i],0);
				local.send(currentPatch[i+1],0);
				local.send(currentPatch[i+2],0);
			}
			else if (type == "rgb16") {
				local.send(currentPatch[i],0);
				local.send(currentPatch[i+1],0);
				local.send(currentPatch[i+2],0);
				local.send(currentPatch[i+3],0);
				local.send(currentPatch[i+4],0);
				local.send(currentPatch[i+5],0);
			}
		}
	}

	patch[niceName] = newPatch;
	refreshSlot(name);
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




