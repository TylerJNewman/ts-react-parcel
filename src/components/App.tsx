import * as React from 'react';
import { Toggle } from './Toggle';

export const App = () => (
  <Toggle onToggle={on => console.log('on: ', on)}>
    <Toggle.On>The button is onn</Toggle.On>
    <Toggle.Off>The button is offf</Toggle.Off>
    <Toggle.Button />
  </Toggle>
);

// import React from 'react';
// import Slider from './Slider/Slider';

// export const App = () => {
//   return (
//     <div className="box flex main-wrapper ">
//       <Slider tooltip></Slider>
//     </div>
//   );
// };

// import React from 'react';
// import Tooltip from './Tooltip/Tooltip';

// export const App = () => {
//   return (
//     <div className="box flex main-wrapper ">
//       <Tooltip text="hello" position="top" tooltipVisible></Tooltip>
//     </div>
//   );
// };
