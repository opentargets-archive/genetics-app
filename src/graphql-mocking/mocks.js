import { MockList } from 'graphql-tools';

const mocks = {
    Hello: () => ({ label: 'World' }),
    PheWASAssociation: () => ({ test: 4 }),
    RootQueryType: () => ({
        assocs: () => new MockList([5, 7])
    })
}

export default mocks;
