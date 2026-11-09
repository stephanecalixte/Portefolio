
import { forwardRef } from 'react';
import styles from './MellanoxSwitch.module.css';

const MellanoxSwitch = forwardRef(function MellanoxSwitch(
  {
    className = '',
    style,
    compact = false,
    skills = [],
    skillsRef = null,
    model = 'MCS7520',
  },
  ref
) {
  const leafCount = compact && skills.length > 0 ? 3 : 6;

  return (
    <div
      ref={ref}
      className={`${styles.container} ${compact ? styles.compact : ''} ${className}`.trim()}
      style={style}
    >
      <div className={styles.chassis}>

        {/* ===== En-tête ===== */}
        <div className={styles.chassis_header}>
          <div className={styles.brand}>
            <div className={styles.logo}>
              <div className={styles.logo_bars}>
                <span></span><span></span><span></span><span></span>
                <span></span><span></span><span></span>
              </div>
            </div>
            <div className={styles.brand_name}>
              MELLANOX <span>by NVIDIA</span>
            </div>
          </div>
          <div className={styles.model_label}>{model}</div>
        </div>

        {/* ===== Corps : skills (optionnel) + leaf modules ===== */}
        <div className={styles.body_row}>

          {/* Skills panel — animé via skillsRef */}
          {skills.length > 0 && (
            <div ref={skillsRef} className={styles.skills_section}>
              <div className={styles.skills_title}>SKILLS</div>
              {skills.map((label) => (
                <div key={label} className={styles.skill_item}>
                  <span className={styles.skill_led} />
                  <span className={styles.skill_label}>{label}</span>
                </div>
              ))}
            </div>
          )}

          {/* Leaf modules */}
          <div className={styles.leaf_section}>
            <div className={styles.leaf_section_title}>
              216× QSFP28 EDR 100Gb/s — Leaf Modules
            </div>
            <div className={styles.leaf_grid} data-count={leafCount}>
              {Array.from({ length: leafCount }).map((_, leaf) => (
                <div className={styles.leaf_module} key={`leaf-${leaf}`}>
                  <div className={styles.leaf_module_label}>LEAF {leaf + 1}</div>
                  <div className={styles.port_grid}>
                    {Array.from({ length: 36 }).map((_, i) => (
                      <div
                        className={styles.port_qsfp}
                        key={`leaf-${leaf}-port-${i}`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ===== System section ===== */}
        <div className={styles.system_section}>
          <div className={styles.mgmt_ports}>
            <div className={styles.mgmt_item}>
              <div className={styles.port_rj45} title="MGMT" />
              <div className={styles.mgmt_label}>MGMT</div>
            </div>
            <div className={styles.mgmt_item}>
              <div className={styles.port_rj45} title="CONSOLE" />
              <div className={styles.mgmt_label}>CONSOLE</div>
            </div>
            <div className={styles.mgmt_item}>
              <div className={styles.port_usb} title="USB" />
              <div className={styles.mgmt_label}>USB</div>
            </div>
          </div>

          <div className={styles.system_leds}>
            <div className={styles.led_group}>
              <div className={`${styles.led} ${styles.green}`} />
              <div className={styles.led_caption}>Power</div>
            </div>
            <div className={styles.led_group}>
              <div className={`${styles.led} ${styles.green}`} />
              <div className={styles.led_caption}>Status</div>
            </div>
            <div className={styles.led_group}>
              <div className={`${styles.led} ${styles.amber}`} />
              <div className={styles.led_caption}>Fan</div>
            </div>
            <div className={styles.led_group}>
              <div className={`${styles.led} ${styles.red}`} />
              <div className={styles.led_caption}>Fault</div>
            </div>
            <div className={styles.led_group}>
              <div className={`${styles.led} ${styles.blue}`} />
              <div className={styles.led_caption}>UID</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
});

export default MellanoxSwitch;