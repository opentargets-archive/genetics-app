import React from 'react';
import { Link } from 'react-router-dom';
import { Gecko } from 'ot-charts';

const LocusPage = () => (
    <div>
        <Link to="/">HOME</Link>
        <h1>Locus</h1>
        <Gecko />
    </div>
);

export default LocusPage;
