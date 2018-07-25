import { MockList } from 'graphql-tools';
import casual from 'casual-browserify'

const SIGNIFICANCE = 5e-8;
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
const mockStudyId = () => casual.random_element(['ball', 'clock', 'table']);

const mocks = {
    PheWASAssociation: () => ({
        ...casual.random_element(STUDYS),
        eaf: mockEAF,
        beta: mockBeta,
        se: mockSE,
        pval: mockPValue,
    }),
    RootQueryType: () => ({
        pheWAS: (_, { variantId }) => {
            return {
                associations: () => new MockList([10, 11])
            }
        }
    })
}

export default mocks;
 