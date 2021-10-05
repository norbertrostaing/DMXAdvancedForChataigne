# DMXAdvancedForChataigne

## LTP and HTP support for DMX

### Usage
select the right method for your data type (dimmer or color, 8 or 16bits) then :
- Channel : DMX channel for the output
- Mode : How multiple values are handled (LTP, HTP, FX or Master)
- Slot : each slot has its own value, you can modify a slot value from different mappings and actions
- Value : value desired : float or color

### Modes
- LTP : the last slot called is applied to channel. When cleared, the one called previously is called.
- HTP : all slots are compared and the highest wins
- FX : values are added to the LTP and HTP values
- Master : reduces or boost the final value

### How it is calculated
- first step : applying the last LTP slot called
- second step : compare the first step with all HTP slots, taking the highest
- third step : adding all the FX slots to the second step
- last step : multiply the third step by the master value

Each mode of each channel has its own slots, you can use the same number for slots of different modes or different channels
You can release slots with the clearSlot function (to stop your LTP sequences or to clean your HTP)
A "Clear all slots" button is present on script part to clear all slots.


## Patch helper
To help you patch dmx channels, the simplest way is to create a multiplex with an **input list of custom variables** representing your channel desired values and a **custom list of integer** representing your DMX adresses.
In this multiplex, you can add a mapping with your multiplex custom variable list for input and a dimmer or color function wwith parameters : 
- Channel : your DMX adresses list
- Mode : you desired mode for these channels
- Slot number : in wich slot you wanna write these values
- Value : your custom variables list
Once this done, you can use the patch helper fields in the script section to auto fill your custom variable list with all variables of a custom variable group



## Effects
	! work in progress !
To try the effect function of the module, you must start by create a sequence with a mapping.
This sequence will be the path of your effect.
Then you should create a multiplex with one custom target list with all the custom variables you want to assign
in the multiplex, you can now add a mapping with **the current time of you sequence as input** and the effect function as output with these parameters :
- Sequence layer : your sequence layer to use as path
- Target element : your target list from multiplex
- Element position : multiplex index 0-n
- Element total : the number of elements 
when playing your sequence, you should see your custom variables values moving along your path

