import gql from 'graphql-tag';

// Note: Using .js instead of .gql file for schema, since
//       .gql files seem to not refresh due to babel-loader's
//       cacheDirectory=true. Can't disable without `yarn eject`.

export const typeDefs = gql`
# ----------------------------------------------------
schema {
    query: RootQueryType
}

type RootQueryType {
    hello: Hello
    pheWAS(variantId: String!): PheWAS
    # regional(chromosome: String, start: Int, end: Int)
}

type Hello {
    label: String
}

type PheWAS {
    associations: [PheWASAssociation]
}
# # type PheWASAssociation implements StudyInterface {
type PheWASAssociation {
    studyId: String!
    pmId: String!
    pubDate: String!
    pubJournal: String!
    pubTitle: String!
    pubAuthor: String!
    traitReported: String!
    # traitMapped
    # traitEfos
    # ancestryInitial
    # ancestryReplication
    n: Int!
    nCases: Int
 
    eaf: Float!
    beta: Float!
    se: Float!
    pval: Float!
}
# # interface StudyInterface {
# #     studyId: String!
# #     pmid: String!
# #     pubDate: String!
# #     pubTitle: String!
# #     pubAuthor: String!
# #     n: Int!
# #     ncases: Int
# #     # TODO: include remaining columns from study table
# # }
# interface VariantInterface {
#     rsId: String
#     # variantId: String!
#     # otherAllele: String!
#     # effectAllele: String!
#     # chromosome: String!
#     # position: Int!
# }
# # interface SummaryStatisticInterface {
# #     eaf: Float!
# #     beta: Float!
# #     se: Float!
# #     pval: Float!
# # }


# -------------------------------------------------------
# RAW TABLE COLUMN HEADERS
# -------------------------------------------------------
# Summary Stats (per study)
# rsid    snpid   chrom   pos     other_allele    effect_allele   eaf     beta    se      pval    n       ncases
# V2D
# chr_id  position        ref_allele      alt_allele      stid    index_variant_id        r2      afr_1000g_prop  mar_1000g_prop  eas_1000g_prop    eur_1000g_prop  sas_1000g_prop  log10_abf       posterior_prob  pmid    pub_date        pub_journal     pub_titlepub_author       trait_reported  ancestry_initial        ancestry_replication    n_initial       n_replication   efo_code        efo_label index_rs_id     pval    index_chr_id    index_position  index_ref_allele        index_alt_allele        variant_id      rs_id
# V2G
# chr_id  position        ref_allele      alt_allele      variant_id      rs_id   gene_chr        gene_id gene_start      gene_end gene_name        feature type_id source_id       csq_counts      qtl_beta        qtl_se  qtl_pval        interval_score
# D2V2G
# chr_id  position        ref_allele      alt_allele      variant_id      rs_id   stid    index_variant_id        r2      afr_1000g_prop    mar_1000g_prop  eas_1000g_prop  eur_1000g_prop  sas_1000g_prop  log10_abf       posterior_prob  pmid    pub_date        pub_journal       pub_title       pub_author      trait_reported  ancestry_initial        ancestry_replication    n_initial       n_replication     efo_code        efo_label       index_rs_id     pval    index_chr_id    index_position  index_ref_allele        index_alt_allele  gene_chr        gene_id gene_start      gene_end        gene_name       feature type_id source_id       csq_countqtl_beta qtl_se  qtl_pval        interval_score
# Study
# study_id  pmid    pub_date    pub_journal pub_title   pub_author  trait_reported  trait_mapped    trait_efos  ancestry_initial    ancestry_replication    n_initial   n_replication   n_cases


# ----------------------------------------------------
`;



// Note: typeResolvers seem to be needed for
//       mocking graphql interfaces
// const typeResolvers = {
//     List: {
//       __resolveType(data) {
//         return data.typename
//       }
//     }
//   }
export const typeResolvers = {
    // Query: {
    //     assocs: () => new MockList([5, 8])
    // }
    // VariantInterface: {
    //     __resolveType(data) {
    //         console.log(data)
    //         return data.typename
    //     }
    // }
}
