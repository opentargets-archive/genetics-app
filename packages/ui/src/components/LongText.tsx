import { useState, useLayoutEffect, useRef, PropsWithChildren } from "react";
import { Typography, makeStyles, Theme } from "@material-ui/core";

const useStyles = makeStyles((theme: Theme) => ({
  textContainer: {
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  showMore: {
    color: theme.palette.primary.main,
    cursor: "pointer",
  },
}));

type LongTextProps = {
  lineLimit: number;
  variant: string;
};

const LongText = ({
  lineLimit,
  variant = "body2",
  children,
}: PropsWithChildren<LongTextProps>) => {
  const classes = useStyles();
  const containerRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLInputElement>(null);
  const [showMore, setShowMore] = useState(false);
  const [numberOfLines, setNumberOfLines] = useState<number | null>();

  useLayoutEffect(() => {
    const container = containerRef.current;
    const el = textRef.current;
    if (!el || !container) return;
    const height = el.offsetHeight;
    const DOMLineHeight = document.defaultView
      ? document.defaultView
          .getComputedStyle(el, null)
          .getPropertyValue("line-height")
      : "";
    const lineHeight = Number.parseInt(DOMLineHeight);
    const numberOfLines = Math.round(height / lineHeight);
    container.style.height =
      numberOfLines <= lineLimit
        ? "auto"
        : showMore
        ? "auto"
        : `${lineLimit * lineHeight}px`;

    setNumberOfLines(numberOfLines);
  }, [lineLimit, showMore, children]);

  return (
    <Typography variant={variant}>
      <span ref={containerRef} className={classes.textContainer}>
        <span ref={textRef}>{children}</span>
      </span>
      {numberOfLines > lineLimit && (
        <span>
          {showMore ? "" : "... "}[{" "}
          <span
            className={classes.showMore}
            onClick={() => setShowMore(!showMore)}
          >
            {showMore ? " hide" : " show more"}
          </span>{" "}
          ]
        </span>
      )}
    </Typography>
  );
};

export default LongText;
