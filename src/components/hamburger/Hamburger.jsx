import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import styles from "./Hamburger.module.css";

const Hamburger = forwardRef(function Hamburger(
  {
    isOpen: isOpenProp,
    defaultOpen = false,
    onToggle,
    animation = "spin",
    position = "top-right",
    size = 44,
    label,
    disabled = false,
    className = "",
    ...rest
  },
  ref
) {
  const btnRef = useRef(null);
  const [isOpenInternal, setIsOpenInternal] = useState(defaultOpen);

  const isControlled = isOpenProp !== undefined;
  const isOpen = isControlled ? isOpenProp : isOpenInternal;

  const setOpenState = (next) => {
    if (!isControlled) setIsOpenInternal(next);
    onToggle?.(next);
  };

  const toggle = () => {
    if (disabled) return;
    setOpenState(!isOpen);
  };

  const open = () => {
    if (disabled || isOpen) return;
    setOpenState(true);
  };

  const close = () => {
    if (disabled || !isOpen) return;
    setOpenState(false);
  };

  useImperativeHandle(
    ref,
    () => ({
      el: btnRef.current,
      isOpen,
      toggle,
      open,
      close,
      focus: () => btnRef.current?.focus(),
    }),
    [isOpen]
  );

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") {
        close();
        btnRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const ariaLabel =
    label || (isOpen ? "Fermer le menu de navigation" : "Ouvrir le menu de navigation");

  return (
    <button
      ref={btnRef}
      type="button"
      className={[
        styles.hamburger,
        styles[position],
        styles[`anim_${animation}`],
        isOpen ? styles.isOpen : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ "--hamburger-size": `${size}px` }}
      aria-label={ariaLabel}
      aria-expanded={isOpen}
      aria-controls="nav-bar"
      aria-haspopup="menu"
      disabled={disabled}
      data-state={isOpen ? "open" : "closed"}
      onClick={toggle}
      {...rest}
    >
      <span className={styles.box} aria-hidden="true">
        <span className={styles.bar} data-bar="1" />
        <span className={styles.bar} data-bar="2" />
        <span className={styles.bar} data-bar="3" />
      </span>
    </button>
  );
});

export default Hamburger;