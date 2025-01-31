import React from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Typography,
  makeStyles,
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import STUDY_INFO from './StudyInfo.gql';
import STUDY_AND_LEAD_VARIANT from './StudiesAndLeadVariantsForGene.gql';
import STUDY_LOCUS_GENE_TABLE from './StudyLocus2GeneTable.gql';
import TAG_VARIANTS from './TagVariantsAndStudiesForIndexVariant.gql';
import COLOCALISATION_FOR_GENE from './ColocalisationsForGene.gql';
import MANHATTAN from './Manhattan.gql';

const useStyles = makeStyles({
  buttonMargin: {
    marginBottom: '12px',
  },
});

function SampleQueries({ setQuery }) {
  const classes = useStyles();
  return (
    <>
      <Typography variant="h5" paragraph>
        Example queries
      </Typography>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle2">Study info query</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <div>
            <Typography variant="subtitle2" display="block" paragraph>
              Find details on a specific study.
            </Typography>
            <Button
              className={classes.buttonMargin}
              variant="contained"
              color="primary"
              onClick={() => setQuery(STUDY_INFO.loc.source.body)}
            >
              Run sample query
            </Button>
          </div>
        </AccordionDetails>
      </Accordion>
      {/* No Response in production for this query, issue #2791 */}
      {/* <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle2">
            Studies and lead variants query
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <div>
            <Typography variant="subtitle2" display="block" paragraph>
              Which studies and lead variants are associated with Jak2?
            </Typography>
            <Button
              className={classes.buttonMargin}
              variant="contained"
              color="primary"
              onClick={() => setQuery(STUDY_AND_LEAD_VARIANT.loc.source.body)}
            >
              Run sample query
            </Button>
          </div>
        </AccordionDetails>
      </Accordion> */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle2">Colocalisation query</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <div>
            <Typography variant="subtitle2" display="block" paragraph>
              Which studies have evidence of colocalisation with molecular QTLs
              for Jak2?
            </Typography>
            <Button
              className={classes.buttonMargin}
              variant="contained"
              color="primary"
              onClick={() => setQuery(COLOCALISATION_FOR_GENE.loc.source.body)}
            >
              Run sample query
            </Button>
          </div>
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle2">
            Prioritised genes from study locus
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <div>
            <Typography variant="subtitle2" display="block" paragraph>
              Which genes were prioritised by L2G pipeline at this locus from a
              given study?
            </Typography>
            <Button
              className={classes.buttonMargin}
              variant="contained"
              color="primary"
              onClick={() => setQuery(STUDY_LOCUS_GENE_TABLE.loc.source.body)}
            >
              Run sample query
            </Button>
          </div>
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle2">Study variants query</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <div>
            <Typography variant="subtitle2" display="block" paragraph>
              Independent loci associated to a given study.
            </Typography>
            <Button
              className={classes.buttonMargin}
              variant="contained"
              color="primary"
              onClick={() => setQuery(MANHATTAN.loc.source.body)}
            >
              Run sample query
            </Button>
          </div>
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle2">Tag variants query</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <div>
            <Typography variant="subtitle2" display="block" paragraph>
              Which variants tag (through LD or fine-mapping) a given lead
              variant?
            </Typography>
            <Button
              className={classes.buttonMargin}
              variant="contained"
              color="primary"
              onClick={() => setQuery(TAG_VARIANTS.loc.source.body)}
            >
              Run sample query
            </Button>
          </div>
        </AccordionDetails>
      </Accordion>
    </>
  );
}

export default SampleQueries;
