/**
 * React component for the Header Section.
 */
import styles from "./Header.module.css"
export const Header = (props) => {
  const headerStyle = {
    position: 'relative',
    borderBottom: '2px solid var(--color-grey)',
    padding: '0 20px',
  };

  const h1Style = {
    float: 'left',
    fontSize: '24px',
    fontWeight: 600,
    lineHeight: '2.75',
    color: 'var(--color-grey)',
    WebkitTextRendering: 'optimizeLegibility',
    MozTextRendering: 'optimizeLegibility',
    textRendering: 'optimizeLegibility',
    backgroundColor:'white'
  };

  const h1GroupOneStyle = {
    color: 'var(--color-blue)',
  };

  const h1GroupTwoStyle = {
    color: 'var(--color-grey-light)',
  };

  const h2Style = {
    float: 'right',
    fontSize: '18px',
    fontWeight: 400,
    lineHeight: '2',
    color: 'var(--color-grey)',
    paddingTop: '16px',
    cursor: 'pointer',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)', // Hover effect will not work with inline styles
  };

  return (
    <header style={headerStyle}>
      <h1 style={{ fontSize: '24px',all:"revert", fontWeight: '600', lineHeight: '2.75', color: 'var(--color-grey)' }}>
  Su<span  className={styles.groupOne}>do</span><span className={styles.groupTwo}>ku</span>
</h1>

      <h2 onClick={props.onClick} style={h2Style}>
        New Game
      </h2>
    </header>
  )
}
