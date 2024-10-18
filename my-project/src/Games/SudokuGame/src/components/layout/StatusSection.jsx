import { Difficulty } from '../Difficulty';
import { Numbers } from '../Numbers';
import Action from '../Action';
import { Mode } from '../Mode';
import styles from './Status.module.css'; // Import the CSS module
import { Timer } from '../Timer';

/**
 * React component for the Status Section.
 */
export const StatusSection = (props) => {
  return (
    <section className={styles.status}> {/* Use the scoped class name */}
      <Difficulty onChange={props.onChange} />
      <Timer />
      <Numbers onClickNumber={(number) => props.onClickNumber(number)} />
      <div className={styles.actions}> {/* Use the scoped class name */}
        <Action action='undo' onClickAction={props.onClickErase} />
        <Action action='erase' onClickAction={props.onClickErase} />
        <Action action='hint' onClickAction={props.onClickHint} />
      </div>
    </section>
  );
};
