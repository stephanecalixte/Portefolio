import styles from './firewall_fortigate.module.css';

export default function FirewallFortigate() {
  return (
    <div className={styles.container}>

      {/* ===== CHÂSSIS FORTIGATE ===== */}
      <div className={styles.firewall}>

        {/* Logo Fortinet */}
        <div className={styles.logo}>
          <div className={styles.logo_icon}></div>
          <div className={styles.logo_text}>FORTINET</div>
        </div>

        {/* 16 ports GE RJ45 (2 rangées × 8) */}
        <div className={styles.port_group}>
          <div className={styles.port_group_label}>16× GE RJ45 (Switch)</div>
          <div className={styles.port_row}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div className={styles.port_rj45} key={`rj45-r1-${i}`} />
            ))}
          </div>
          <div className={styles.port_row}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div className={styles.port_rj45} key={`rj45-r2-${i}`} />
            ))}
          </div>
        </div>

        {/* 8 ports GE SFP (2 rangées × 4) */}
        <div className={styles.port_group}>
          <div className={styles.port_group_label}>8× GE SFP</div>
          <div className={styles.port_row}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div className={styles.port_sfp} key={`sfp-r1-${i}`} />
            ))}
          </div>
          <div className={styles.port_row}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div className={styles.port_sfp} key={`sfp-r2-${i}`} />
            ))}
          </div>
        </div>

        {/* 4 ports 10GE SFP+ (FortiLink) */}
        <div className={styles.port_group}>
          <div className={styles.port_group_label}>4× 10GE SFP+ (FortiLink)</div>
          <div className={styles.port_row}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div className={styles.port_sfpp} key={`sfpp-${i}`} />
            ))}
          </div>
        </div>

        {/* Management / HA / Console / USB + LEDs */}
        <div className={styles.mgmt}>
          <div className={styles.mgmt_row}>
            <div className={styles.port_mgmt_rj45} title="MGMT" />
            <div className={styles.port_mgmt_rj45} title="HA" />
            <div className={styles.port_mgmt_rj45} title="CONSOLE" />
            <div className={styles.port_usb} title="USB 3.0" />
            <div className={styles.leds}>
              <div className={`${styles.led} ${styles.green}`} />
              <div className={`${styles.led} ${styles.amber}`} />
              <div className={`${styles.led} ${styles.red}`} />
              <div className={`${styles.led} ${styles.off}`} />
            </div>
          </div>
          <div className={styles.mgmt_label}>MGMT · HA · CONSOLE · USB</div>
        </div>

        {/* Référence produit */}
        <div className={styles.model_tag}>FG-121G</div>
      </div>

      {/* ===== LÉGENDE ===== */}
      <div className={styles.legend}>
        <div className={styles.legend_item}>
          <span className={`${styles.legend_dot} ${styles.green}`} /> Link actif (RJ45)
        </div>
        <div className={styles.legend_item}>
          <span className={`${styles.legend_dot} ${styles.amber}`} /> Link actif (SFP 1G)
        </div>
        <div className={styles.legend_item}>
          <span className={`${styles.legend_dot} ${styles.blue}`} /> Link actif (SFP+ 10G)
        </div>
      </div>

      <p className={styles.caption}>FORTIGATE 121G · VUE FACE AVANT · 1U RACK 19"</p>

    </div>
  );
}