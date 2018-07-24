import { MockList } from 'graphql-tools';

const SIGNIFICANCE = 5e-8;
const mockEAF = () => Math.random() * 0.5
const mockBeta = () => Math.random() - 0.5
const mockSE = () => Math.random()
const mockPValue = () => Math.random() * SIGNIFICANCE

const mocks = {
    Hello: () => ({ label: 'World' }),
    PheWASAssociation: () => ({
        // studyId,
        // pmId,
        traitReported: () => 'cancer',
        // n,
        // nCases,
        eaf: mockEAF,
        beta: mockBeta,
        se: mockSE,
        pval: mockPValue,
    }),
    RootQueryType: () => ({
        pheWAS: (_, { variantId }) => {
            console.log('pheWAS', variantId)
            return {
                associations: () => new MockList([10, 11])
            }
        }
    })
}

export default mocks;
 