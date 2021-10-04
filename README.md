# DMXAdvancedForChataigne

Add LTP and HTP support for DMX

## Usage
select the right method for your data type (dimmer or color, 8 or 16bits) then :
- Channel : DMX channel for the output
- Mode : How multiple values are handled (LTP, HTP, FX or Master)
- Slot : each slot has its own value, you can modify a slot value from different mappings and actions
- Value : value desired : float or color

## Modes
- LTP : the last slot called is applied to channel. When cleared, the one called previously is called.
- HTP : all slots are compared and the highest wins
- FX : values are added to the LTP and HTP values
- Master : reduces or boost the final value

## How it is calculated
- first step : applying the last LTP slot called
- second step : compare the first step with all HTP slots, taking the highest
- third step : adding all the FX slots to the second step
- last step : multiply the third step by the master value

Each mode of each channel has its own slots, you can use the same number for slots of different modes or different channels