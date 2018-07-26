import { MockList } from 'graphql-tools';
import casual from 'casual-browserify'

const SIGNIFICANCE = 5e-8;
const CHROMOSOMES = [...Array.from(new Array(22),(val,index)=>`${index+1}`), 'X'];
const ALLELES = 'ACGT'.split('');
const STUDYS = [
    {
        studyId: 'GCST005806',
        pmId: '29875488',
        pubDate: '2018-06-06',
        pubJournal: 'Nature',
        pubTitle: 'Genomic atlas of the human plasma proteome.',
        pubAuthor: 'Sun BB',
        traitReported: 'Blood protein levels',
        traitEfoMapping: [
            { id: 'EFO_0007937', term: 'blood protein measurement' }
        ],
        n: 3301
    },
    {
        studyId: 'GCST005831',
        pmId: '29848360',
        pubDate: '2018-05-30',
        pubJournal: 'Arthritis Res Ther',
        pubTitle: 'Genome-wide association study meta-analysis identifies five new loci for systemic lupus erythematosus.',
        pubAuthor: 'Julia A',
        traitReported: 'Systemic lupus erythematosus',
        traitEfoMapping: [
            { id: 'EFO_0002690', term: 'systemic lupus erythematosus' }
        ],
        n: 16966
    }
]
const mockEAF = () => Math.random() * 0.5
const mockBeta = () => Math.random() - 0.5
const mockSE = () => Math.random()
const mockPValue = () => Math.random() * SIGNIFICANCE

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
    PheWASAssociation: () => ({
        ...casual.random_element(STUDYS),
        eaf: mockEAF,
        beta: mockBeta,
        se: mockSE,
        pval: mockPValue,
    }),
    ManhattanAssociation: mockManhattanAssociation,
    RootQueryType: () => ({
        pheWAS: (_, { variantId }) => {
            return {
                associations: () => new MockList([10, 11])
            }
        },
        manhattan: (_, { studyId }) => {
            return ({
                associations: () => new MockList(5)
            })
        }
    })
}

export default mocks;
 