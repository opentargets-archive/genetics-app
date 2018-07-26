import { MockList } from 'graphql-tools';
import casual from 'casual-browserify'
import _ from 'lodash';

import STUDIES from './studies';

const SIGNIFICANCE = 5e-8;
const CHROMOSOMES = [...Array.from(new Array(22),(val,index)=>`${index+1}`), 'X'];
const ALLELES = 'ACGT'.split('');

const mockManhattanAssociation = () => {
    const chromosome = casual.random_element(CHROMOSOMES);
    const position = casual.integer(1, 10000000); // TODO: base on chrom length
    const effectAllele = casual.random_element(ALLELES);
    const effectAlleleIndex = ALLELES.indexOf(effectAllele);
    const otherAlleleOptions = [...ALLELES.slice(0, effectAlleleIndex), ...ALLELES.slice(effectAlleleIndex + 1)]
    const otherAllele = casual.random_element(otherAlleleOptions);
    const rsNumber = casual.integer(100, 100000);
    
    return {
        indexVariantId: `${chromosome}_${position}_${otherAllele}_${effectAllele}`,
        indexVariantRsId: `rs${rsNumber}`,
        pval: casual.double(0, SIGNIFICANCE),
        chromosome,
        position,
        credibleSetSize: casual.integer(0, 10),
        ldSetSize: casual.integer(0, 30),
        bestGenes: []
    }
};

const mocks = {
    PheWAS: (a, b) => {
        // sample from the actual study names, then augment with other fields
        const associations = _.sampleSize(STUDIES, 100).map(d => ({
            ...d,
            traitCode: `TRAIT_${casual.integer(10000, 99999)}`,
            pval: casual.double(0, SIGNIFICANCE),
            nCases: casual.integer(1, d.nTotal)
        }));
        return { associations };
    },
    ManhattanAssociation: mockManhattanAssociation,
    RootQueryType: () => ({
        manhattan: (_, { studyId }) => {
            return ({
                associations: () => new MockList(5)
            })
        }
    })
}

export default mocks;
 