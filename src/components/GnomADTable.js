import React from 'react';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

const populations = [
  { code: 'AFR', description: 'African/African-American' },
  { code: 'AMR', description: 'Latino/Admixed American' },
  { code: 'ASJ', description: 'Ashkenazi Jewish' },
  { code: 'EAS', description: 'East Asian' },
  { code: 'FIN', description: 'Finnish' },
  { code: 'NFE', description: 'Non-Finnish European' },
  { code: 'NFEEST', description: 'Non-Finnish Eurpoean Estonian' },
  {
    code: 'NFENWE',
    description: 'Non-Finnish Eurpoean North-Western European',
  },
  { code: 'NFESEU', description: 'Non-Finnish Eurpoean Southern European' },
  { code: 'OTH', description: 'Other (population not assigned)' },
];

const GnomADTable = ({ data }) => (
  <Paper>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Code</TableCell>
          <TableCell>Population</TableCell>
          <TableCell>Minor Allele Frequency</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {populations.map(p => (
          <TableRow key={p.code}>
            <TableCell>{p.code}</TableCell>
            <TableCell>{p.description}</TableCell>
            <TableCell>{data[`gnomad${p.code}`].toPrecision(3)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </Paper>
);

export default GnomADTable;
