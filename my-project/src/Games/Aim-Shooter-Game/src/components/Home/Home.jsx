import logo from "../../assets/logo.png";
import styles from "../../App.module.css";

function Home({ regAim, preAim }) {
  return (
    <div className={styles.container}>
      <div className={styles["home-container"]}>
        <img src={logo} alt="Logo" />
        <button className={styles["start-button"]} onClick={regAim}>
          Regular Aim
          <div className={styles["start-button-helper-text"]}>
            (Click LMB to shoot)
          </div>
        </button>
        {/* <button className={styles["start-button"]} onClick={preAim}>
          Pre Aim
          <div className={styles["start-button-helper-text"]}>
            (Hold RMB to aim and LMB to shoot)
          </div>
        </button> */}
      </div>
    </div>
  );
}

export default Home;
