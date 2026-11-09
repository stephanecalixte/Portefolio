import styles from "./DataCenterScene.module.css";

const SERVERS_PER_RACK = 20;

export default function DataCenterScene({ className = "" }) {
  return (
    <div
      className={`${styles.scene} ${className}`.trim()}
      aria-hidden="true"
      data-scene="data-center"
    >
      <div className={styles.rack} data-rack="0">
        <div className={styles.rackChassis}>

          {/* Bezel haut */}
          <div className={styles.rackTopBezel}>
            <span className={styles.rackLogo} />
            <span className={styles.rackBadge} />
          </div>

          {/* Serveurs empilés */}
          <div className={styles.rackServers}>
            {Array.from({ length: SERVERS_PER_RACK }).map((_, sIdx) => (
              <div
                key={`server-${sIdx}`}
                className={styles.server}
                data-server={sIdx}
              >
                <div className={styles.serverVents} />
                <div className={styles.serverLeds}>
                  <span className={`${styles.led} ${styles.ledGreen}`} data-led="0" />
                  <span className={`${styles.led} ${styles.ledGreen}`} data-led="1" />
                  <span className={`${styles.led} ${styles.ledBlue}`}  data-led="2" />
                </div>
              </div>
            ))}
          </div>

          {/* Bezel bas */}
          <div className={styles.rackBottomBezel}>
            <span className={styles.rackVent} />
          </div>
        </div>

        {/* Halo latéral */}
        <div className={styles.rackSideGlow} />
      </div>
    </div>
  );
}