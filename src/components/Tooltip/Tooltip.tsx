import React from 'react';
import cx from 'classnames';
import styles from './Tooltip.module.css';

interface Tooltip {
  text: string;
  position?: string;
  tooltipVisible: boolean;
}

const Tooltip = ({ text, position = 'top', tooltipVisible }: Tooltip) => {
  return (
    <div className={styles.container}>
      {tooltipVisible && (
        <div className={cx(styles.tooltipContent, styles[position])}>
          <span className={styles.arrow} />
          {text}
        </div>
      )}
    </div>
  );
};

export default Tooltip;
