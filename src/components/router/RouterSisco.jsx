import { forwardRef } from 'react';
import styles from './router_sisco.module.css';

const RouterSisco = forwardRef(function RouterSisco(
  { className = '', style, compact = false },
  ref
) {
  return (
    <div
      ref={ref}
      className={`${styles.container} ${compact ? styles.compact : ''} ${className}`.trim()}
      style={style}
    >
      <div className={styles.router}>

        {/* Logo Cisco */}
        <div className={styles.logo}>
          <div className={styles.logo_bars}>
            <span></span><span></span><span></span><span></span>
            <span></span><span></span><span></span>
          </div>
          <div className={styles.logo_text}>CISCO</div>
        </div>

        {/* 24 ports Multi-Gig (2 rangées × 12) */}
        <div className={styles.port_group}>
          <div className={styles.port_group_label}>24× Multi-Gig</div>
          <div className={styles.port_row}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div className={styles.port_mg} key={`mg-r1-${i}`} />
            ))}
          </div>
          <div className={styles.port_row}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div className={styles.port_mg} key={`mg-r2-${i}`} />
            ))}
          </div>
        </div>

        {/* 8 ports 100GE QSFP28 (2 rangées × 4) */}
        <div className={styles.port_group}>
          <div className={styles.port_group_label}>8× 100GE QSFP28</div>
          <div className={styles.port_row}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div className={styles.port_qsfp} key={`qsfp-r1-${i}`} />
            ))}
          </div>
          <div className={styles.port_row}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div className={styles.port_qsfp} key={`qsfp-r2-${i}`} />
            ))}
          </div>
        </div>

        {/* Management / Console / USB + LEDs */}
        <div className={styles.mgmt}>
          <div className={styles.mgmt_row}>
            <div className={styles.port_rj45} title="MGMT" />
            <div className={styles.port_rj45} title="CONSOLE" />
            <div className={styles.port_usb} title="USB" />
            <div className={styles.leds}>
              <div className={`${styles.led} ${styles.green}`} />
              <div className={`${styles.led} ${styles.amber}`} />
              <div className={`${styles.led} ${styles.blue}`} />
            </div>
          </div>
          <div className={styles.mgmt_label}>MGMT · CONSOLE · USB</div>
        </div>

        {/* Référence produit */}
        <div className={styles.model_tag}>N540-24Z8Q2C-SYS</div>
      </div>
    </div>
  );
});

export default RouterSisco;