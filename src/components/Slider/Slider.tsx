/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useRef, useState, useEffect } from 'react';
import cx from 'classnames';
import styles from './Slider.module.css';
import { Tooltip } from '../';
import { debounce } from '../../utils/debounce';

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(min, value), max);
}

// Todo: get rid of "any" type on touchId with React.TouchEvent | React.MouseEvent
function trackFinger(event: any, touchId: any) {
  if (touchId.current !== undefined && event.changedTouches) {
    for (let i = 0; i < event.changedTouches.length; i += 1) {
      const touch = event.changedTouches[i];
      if (touch.identifier === touchId.current) {
        return {
          x: touch.clientX,
          y: touch.clientY,
        };
      }
    }

    return false;
  }

  return {
    x: event.clientX,
    y: event.clientY,
  };
}

function valueToPercent(value: number, min: number, max: number) {
  return ((value - min) * 100) / (max - min);
}

function percentToValue(percent: number, min: number, max: number) {
  return (max - min) * percent + min;
}

function getDecimalPrecision(num: number) {
  // This handles the case when num is very small (0.00000001), js will turn this into 1e-8.
  // When num is bigger than 1 or less than -1 it won't get converted to this notation so it's fine.
  if (Math.abs(num) < 1) {
    const parts = num.toExponential().split('e-');
    const matissaDecimalPart = parts[0].split('.')[1];
    return (
      (matissaDecimalPart ? matissaDecimalPart.length : 0) +
      parseInt(parts[1], 10)
    );
  }

  const decimalPart = num.toString().split('.')[1];
  return decimalPart ? decimalPart.length : 0;
}

function roundValueToStep(value: number, step: number, min: number) {
  const nearest = Math.round((value - min) / step) * step + min;
  return Number(nearest.toFixed(getDecimalPrecision(step)));
}
interface FocusThumb {
  sliderRef: any;
  activeIndex: any;
  setActive: any;
}

function focusThumb({ sliderRef, activeIndex, setActive }: FocusThumb) {
  if (
    !sliderRef.current?.contains(document.activeElement) ||
    (document.activeElement &&
      Number(document.activeElement.getAttribute('data-index')) !== activeIndex)
  ) {
    sliderRef.current.querySelector(`[data-index="${activeIndex}"]`).focus();
  }

  if (setActive) {
    setActive(activeIndex);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const axisProps: any = {
  horizontal: {
    offset: (percent: number) => ({ left: `${percent}%` }),
    leap: (percent: number) => ({ width: `${percent}%` }),
  },
  'horizontal-reverse': {
    offset: (percent: number) => ({ right: `${percent}%` }),
    leap: (percent: number) => ({ width: `${percent}%` }),
  },
  vertical: {
    offset: (percent: number) => ({ bottom: `${percent}%` }),
    leap: (percent: number) => ({ height: `${percent}%` }),
  },
};

interface SliderProps {
  defaultValue?: number;
  max?: number;
  min?: number;
  orientation?: string;
  step?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChangeCommitted?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onMouseDown?: any;
  railColorRanges?: any;
  tooltip?: boolean;
}

interface InstanceRef {
  source: number;
}
export default function Slider({
  defaultValue = 0,
  max = 100,
  min = 0,
  orientation = 'horizontal',
  railColorRanges = { red: 20, blue: 50, yellow: 60, green: 0 },
  step = 1,
  onChange,
  onChangeCommitted,
  onMouseDown,
  tooltip = false,
}: SliderProps) {
  const touchId = React.useRef();
  const [active, setActive] = React.useState(-1);
  const [valueState, setValueState] = React.useState(defaultValue);
  const [axisLength, setAxisLength] = React.useState(0);
  const [trackColorStyle, setTrackColorStyle] = React.useState({});
  let values = [valueState];
  values = values.map(value => clamp(value, min, max));
  const [value] = values;
  const instanceRef = useRef<InstanceRef | null>(null);
  instanceRef.current = {
    source: valueState, // Keep track of the input value to leverage immutable state comparison.
  };

  const sliderRef = React.useRef<HTMLDivElement>(null);
  const thumbRef = React.useRef<HTMLDivElement>(null);

  const axis = orientation;

  const colorOffset = (colorEnd: number, length: number) => {
    const range = max - min;
    const endValue = clamp(colorEnd, min, max);
    const percentOffset = endValue / range;
    const pixelOffset = percentOffset * length;
    return `${pixelOffset.toFixed()}px`;
  };

  const buildGradient = (ranges: RangesInterface, length: number) => {
    const result: string[] = [];
    let i = 0;
    // eslint-disable-next-line no-restricted-syntax
    const entries = Object.entries(ranges);
    entries.forEach(entry => {
      const [color, endValue] = entry;
      let prev = 0;
      if (i === 0) {
        result.push(`${color} ${colorOffset(endValue, length)}`);
      } else if (i !== entries.length - 1) {
        result.push(`${color} ${colorOffset(prev, length)}`);
        result.push(`${color} ${colorOffset(endValue, length)}`);
      } else {
        result.push(`${color} 0px`);
      }
      prev = endValue;
      i++;
    });
    return result.join(', ');
  };

  interface RangesInterface {
    color: number;
  }

  const buildGradientString = (rangesObj: RangesInterface, length: number) => {
    // eg 'linear-gradient(to right, red 20px, blue 20px, blue 50px, yellow 50px, yellow 60px , green 0px)',
    const prefix = `linear-gradient(`;
    const direction =
      axis.indexOf('vertical') === 0 ? 'to bottom, ' : 'to right, ';
    const ranges = buildGradient(rangesObj, length);
    const suffix = `)`;
    return `${prefix}${direction}${ranges}${suffix}`;
  };

  const getStyleFromRanges = (ranges: RangesInterface, length: number) => {
    const { current: slider } = sliderRef;
    if (
      slider === null ||
      axisLength === null ||
      axisLength === undefined ||
      ranges === undefined
    ) {
      return {};
    }
    return {
      background: `${buildGradientString(ranges, length)}`,
    };
  };

  useEffect(() => {
    if (axisLength === 0) {
      return;
    }
    setTrackColorStyle(getStyleFromRanges(railColorRanges, axisLength));
  }, [axisLength]);

  interface FingerNewValue {
    newValue: number;
    activeIndex: number;
  }

  const getFingerNewValue = ({ finger }: any): FingerNewValue => {
    const { current: slider } = sliderRef;
    if (slider === null) {
      const newValue = 0;
      const activeIndex = 0;
      return { newValue, activeIndex };
    }
    const { width, height, bottom, left } = slider.getBoundingClientRect();
    let percent;

    if (axis.indexOf('vertical') === 0) {
      percent = (bottom - finger.y) / height;
    } else {
      percent = (finger.x - left) / width;
    }

    if (axis.indexOf('-reverse') !== -1) {
      percent = 1 - percent;
    }

    let newValue;
    newValue = percentToValue(percent, min, max);
    if (step) {
      newValue = roundValueToStep(newValue, step, min);
    }

    newValue = clamp(newValue, min, max);
    const activeIndex = 0;

    // eslint-disable-next-line consistent-return
    return { newValue, activeIndex };
  };

  const handleTouchMove = (event: any) => {
    const finger = trackFinger(event, touchId);

    if (!finger) {
      return;
    }

    const { newValue, activeIndex } = getFingerNewValue({
      finger,
    });

    focusThumb({ sliderRef, activeIndex, setActive });

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    setValueState(newValue!);

    if (onChange) {
      onChange(event, newValue);
    }
  };

  const handleTouchEnd = (event: any) => {
    const finger = trackFinger(event, touchId);

    if (!finger) {
      return;
    }

    const { newValue } = getFingerNewValue({
      finger,
    });

    setActive(-1);

    if (onChangeCommitted) {
      onChangeCommitted(event, newValue);
    }

    touchId.current = undefined;

    const doc = sliderRef.current?.ownerDocument;
    if (doc) {
      doc.removeEventListener('mousemove', handleTouchMove);
      doc.removeEventListener('mouseup', handleTouchEnd);
      doc.removeEventListener('touchmove', handleTouchMove);
      doc.removeEventListener('touchend', handleTouchEnd);
    }
  };

  const handleTouchStart = (event: any) => {
    // Workaround as Safari has partial support for touchAction: 'none'.
    event.preventDefault();
    const [touch] = event.changedTouches;
    if (touch != null) {
      // A number that uniquely identifies the current finger in the touch session.
      touchId.current = touch.identifier;
    }
    const finger = trackFinger(event, touchId);
    const { newValue, activeIndex } = getFingerNewValue({
      finger,
      values,
    });
    focusThumb({ sliderRef, activeIndex, setActive });

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    setValueState(newValue!); // hack todo fix
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion

    if (onChange) {
      onChange(event, newValue);
    }

    const doc = sliderRef.current?.ownerDocument;
    if (doc) {
      doc.addEventListener('touchmove', handleTouchMove);
      doc.addEventListener('touchend', handleTouchEnd);
    }
  };

  React.useEffect(() => {
    const { current: slider } = sliderRef;
    slider?.addEventListener('touchstart', handleTouchStart);

    return () => {
      slider?.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('mousemove', handleTouchMove);
      window.removeEventListener('mouseup', handleTouchEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchEnd, handleTouchMove, handleTouchStart]);

  const updateAxisLength = debounce(() => {
    const { current: slider } = sliderRef;
    if (slider === null) {
      return;
    }
    const { width, height } = slider.getBoundingClientRect();
    let axisLength;

    if (axis.indexOf('vertical') === 0) {
      axisLength = height;
    } else {
      axisLength = width;
    }

    if (axisLength === undefined) {
      return;
    }

    setAxisLength(axisLength);
  }, 150);

  useEffect(() => {
    updateAxisLength();
    window.addEventListener('resize', updateAxisLength);
    return () => {
      window.removeEventListener('resize', updateAxisLength);
    };
  }, []);

  const handleMouseDown = (event: React.MouseEvent) => {
    if (onMouseDown) {
      onMouseDown(event);
    }

    event.preventDefault();
    const finger = trackFinger(event, touchId);
    const { newValue, activeIndex } = getFingerNewValue({
      finger,
      values,
    });
    focusThumb({ sliderRef, activeIndex, setActive });
    if (newValue) {
      setValueState(newValue);
    }

    if (onChange) {
      onChange(event, newValue);
    }

    const doc = sliderRef.current?.ownerDocument;
    if (doc) {
      doc.addEventListener('mousemove', handleTouchMove);
      doc.addEventListener('mouseup', handleTouchEnd);
    }
  };

  const [tooltipVisible, setTooltipVisible] = useState(false);

  const handleMouseOver = () => setTooltipVisible(true);

  const handleMouseOut = () => setTooltipVisible(false);

  useEffect(
    () => {
      const node = thumbRef.current;

      if (thumbRef && node) {
        node.addEventListener('mouseover', handleMouseOver);

        node.addEventListener('mouseout', handleMouseOut);

        return () => {
          node.removeEventListener('mouseover', handleMouseOver);

          node.removeEventListener('mouseout', handleMouseOut);
        };
      }
    },

    [thumbRef.current] // Recall only if ref changes
  );

  const trackOffset = valueToPercent(min, min, max);
  const trackLeap =
    valueToPercent(values[values.length - 1], min, max) - trackOffset;
  const trackStyle = {
    ...axisProps[axis].offset(trackOffset),
    ...axisProps[axis].leap(trackLeap),
  };
  const percent = valueToPercent(value, min, max);
  const thumbStyle = axisProps[axis].offset(percent);
  const index = 0;

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <span
      ref={sliderRef}
      className={cx(styles.root, {
        [styles.vertical]: orientation === 'vertical',
      })}
      onMouseDown={handleMouseDown}
    >
      <span className={styles.rail} />
      <span
        className={styles.track}
        style={{ ...trackStyle, ...trackColorStyle }}
      />
      <input type="hidden" defaultValue={100} />
      <span
        ref={thumbRef}
        className={cx(styles.thumb, {
          [styles.active]: true,
          [styles.active]: active === index,
        })}
        // tabIndex={disabled ? null : 0}
        // eslint-disable-next-line jsx-a11y/role-has-required-aria-props
        role="slider"
        style={thumbStyle}
        data-index={0}
        aria-valuemax={max}
        aria-valuemin={min}
        aria-valuenow={value}
      >
        <Tooltip
          text={value.toString()}
          tooltipVisible={(tooltip && active === index) || tooltipVisible}
        />
      </span>
    </span>
  );
}
