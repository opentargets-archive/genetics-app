import * as classNames from 'classnames';
import Tooltip from '@material-ui/core/Tooltip';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
  modelSchematic: {
    fontFamily: 'sans-serif',
  },
  entityCircle: {
    strokeWidth: 2,
    stroke: theme.palette.grey[500],
    fill: theme.palette.grey[300],
  },
  entityCircleFixed: {
    fill: theme.palette.primary.main,
    stroke: theme.palette.primary.main,
  },
  entityText: {
    fill: theme.palette.grey[500],
    dominantBaseline: 'central',
    textAnchor: 'middle',
    fontSize: 12,
    fontWeight: 'bold',
    '&>tspan': {
      fontSize: 8,
    },
  },
  entityTextFixed: {
    fill: theme.palette.primary.contrastText,
  },
  connectorLine: {
    strokeWidth: 2,
    stroke: theme.palette.grey[500],
  },
}));

const ENTITY_WIDTH = 30;
const ENTITY_RADIUS = ENTITY_WIDTH / 2 - 2;
const CONNECTOR_WIDTH = 20;
const TOTAL_HEIGHT = ENTITY_WIDTH;
const NICENAME_MAP = {
  gene: 'gene',
  variant: 'variant',
  study: 'study',
  indexVariant: 'lead variant',
  tagVariant: 'tag variant',
};
const ICON_LABEL_MAP = {
  gene: 'G',
  variant: 'V',
  study: 'S',
  indexVariant: (
    <>
      V<tspan dy="6">L</tspan>
    </>
  ),
  tagVariant: (
    <>
      V<tspan dy="6">T</tspan>
    </>
  ),
};

export type ModelSchematicEntity = {
  type: keyof typeof NICENAME_MAP;
  fixed: boolean;
};
type ModelSchematicProps = {
  entities: ModelSchematicEntity[];
};
const ModelSchematic = ({ entities }: ModelSchematicProps) => {
  const classes = useStyles();
  const totalWidth =
    ENTITY_WIDTH * entities.length + CONNECTOR_WIDTH * (entities.length - 1);

  const tuple = entities.map(d => NICENAME_MAP[d.type]);
  const fixed = entities.filter(d => d.fixed).map(d => NICENAME_MAP[d.type]);
  const title = `This section shows (${tuple.join(', ')}) tuples${
    fixed.length > 0 ? ` where the ${fixed[0]} is fixed` : ''
  }`;
  return (
    <Tooltip title={title}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={`${totalWidth}px`}
        height={`${TOTAL_HEIGHT}px`}
        className={classes.modelSchematic}
      >
        <g>
          {entities.map((d, i) => {
            let label = ICON_LABEL_MAP[d.type];
            return (
              <g
                key={i}
                transform={`translate(${
                  ENTITY_WIDTH / 2 + i * (ENTITY_WIDTH + CONNECTOR_WIDTH)
                },${TOTAL_HEIGHT / 2})`}
              >
                <circle
                  cx={0}
                  cy={0}
                  r={ENTITY_RADIUS}
                  className={classNames(classes.entityCircle, {
                    [classes.entityCircleFixed]: d.fixed,
                  })}
                />
                <text
                  x={0}
                  y={0}
                  className={classNames(classes.entityText, {
                    [classes.entityTextFixed]: d.fixed,
                  })}
                >
                  {label}
                </text>
              </g>
            );
          })}
        </g>
        <g>
          {entities.map((d, i) => {
            if (i < entities.length - 1) {
              return (
                <line
                  x1={ENTITY_WIDTH + i * (ENTITY_WIDTH + CONNECTOR_WIDTH)}
                  y1={TOTAL_HEIGHT / 2}
                  x2={(i + 1) * (ENTITY_WIDTH + CONNECTOR_WIDTH)}
                  y2={TOTAL_HEIGHT / 2}
                  key={i}
                  className={classes.connectorLine}
                />
              );
            } else {
              return null;
            }
          })}
        </g>
      </svg>
    </Tooltip>
  );
};

export default ModelSchematic;
