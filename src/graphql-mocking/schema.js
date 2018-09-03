import gql from 'graphql-tag';

// Note: Using .js instead of .gql file for schema, since
//       .gql files seem to not refresh due to babel-loader's
//       cacheDirectory=true. Can't disable without `yarn eject`.

export const typeDefs = gql`
  # ----------------------------------------------------

  # Derived using
  # * mockups: https://5o96p0.axshare.com/#g=1&p=home_-_no_search_terms_entered
  # * table definitions: https://github.com/opentargets/v2d_data

  # Assumptions/Questions:
  # * pheWAS and regional use the summary statistics, while manhattan uses top loci
  # * should ManhattanAssociation include summary statistics fields for study-variant (eaf/beta/se/...); see mockup? NO
  # * should ManhattanAssociation include best gene and best gene evidence; see mockup? YES, ARRAY OF GENES (COULD BE EMPTY)
  # * should ManhattanAssociation include credible set count; see mockup? YES, AND LD SET COUNT
  # * we do not yet have LD for regional plots; ldWithLead is commented out for now
  # * field nCases could be null
  # * fields traitMapped, traitEfos can be grouped as [{ efoId, efoTerm }]
  # * under the current design, data magnitude for charts sufficiently limited that tables can just use chart data and do client-side pagination
  # * should a study have (n, nCases) or (nInitial, nReplication, nCases)? (N, NCASES) FOR PHEWAS

  schema {
    query: RootQueryType
  }
  type RootQueryType {
    # search(queryString: String): [SearchResult!]!
    studyInfo(studyId: String!): StudyInfo!
    manhattan(studyId: String!): Manhattan!
    gecko(chromosome: String!, start: Int!, end: Int!): Gecko!
    # regional(studyId: String!, leadVariantId: String!, chromosome: String!, start: Int!, end: Int!): Regional
    genesForVariant(variantId: String!): GenesForVariant!
    pheWAS(variantId: String!): PheWAS
    search(queryString: String!): SearchResult
    indexVariantsAndStudiesForTagVariant(
      variantId: String!
    ): IndexVariantsAndStudiesForTagVariant
    tagVariantsAndStudiesForIndexVariant(
      variantId: String!
    ): TagVariantsAndStudiesForIndexVariant
  }
  type SearchResult {
    genes: [SearchResultGene!]!
    variants: [SearchResultVariant!]!
    studies: [SearchResultStudy!]!
  }
  type SearchResultGene {
    id: String!
    symbol: String!
    name: String
    synonyms: [String!]!
  }
  type SearchResultVariant {
    variantId: String!
    rsId: String
  }
  type SearchResultStudy {
    studyId: String!
    traitReported: String!
    pubAuthor: String
    pubDate: String
    pubJournal: String
    # TBD: sample size
    # TBD: loci count
  }
  type GenesForVariant {
    genes: [GeneForVariant!]!
  }

  type GeneForVariant {
    id: String!
    symbol: String!
    overallScore: String!
    # qtls: [Qtl!]!
    # intervals: [Interval!]!
    # functionalPredictions: TBD
  }
  type PheWAS {
    associations: [PheWASAssociation!]!
  }
  # # type PheWASAssociation implements StudyInterface {
  type PheWASAssociation {
    studyId: String!
    traitReported: String!
    traitCode: String!
    pval: Float!
    beta: Float
    oddsRatio: Float
    nTotal: Int # total sample size (variant level)
    nCases: Int # number of cases (variant level)

    # pmId: String
    # pubDate: String
    # pubJournal: String
    # pubTitle: String
    # pubAuthor: String

    # traitEfoMapping: [Efo!]
    # TODO: ancestryInitial
    # TODO: ancestryReplication

    # EITHER block1 OR block2
    # -- block1
    # eaf: Float
    # beta: Float
    # se: Float
    # --
    # -- block2
    # oddsRatio: Float
    # oddsRatioCILower: Float
    # oddsRatioCIUpper: Float
    # --
  }
  # type Efo {
  #     id: String!
  #     term: String!
  # }
  type StudyInfo {
    studyId: String!
    traitReported: String!
    pubAuthor: String
    pubDate: String
    pubJournal: String
    pmid: String
  }
  type Manhattan {
    associations: [ManhattanAssociation!]!
  }
  type ManhattanAssociation {
    indexVariantId: String!
    indexVariantRsId: String
    pval: Float!
    chromosome: String!
    position: Int!
    bestGenes: [Gene!]

    # could have index variant which has no tag variants (goes nowhere on click)
    credibleSetSize: Int
    ldSetSize: Int

    # TODO: get this
    # maf: Float
  }
  type Gene {
    id: String
    symbol: String
  }
  type IndexVariantsAndStudiesForTagVariant {
    rows: [IndexVariantAndStudyForTagVariant!]!
  }
  type IndexVariantAndStudyForTagVariant {
    indexVariantId: String!
    indexVariantRsId: String!
    studyId: String!
    traitReported: String!
    pval: Float!
    # publication info
    pmid: String
    pubDate: String
    pubAuthor: String
    nTotal: Int # n_initial + n_replication
    # ld info is optional; but expect all or none of the following
    overallR2: Float # 0.7 - 1
    # finemapping is optional; but expect all or none of the following
    isInCredibleSet: Boolean
  }
  type TagVariantsAndStudiesForIndexVariant {
    rows: [TagVariantAndStudyForIndexVariant!]!
  }
  type TagVariantAndStudyForIndexVariant {
    tagVariantId: String!
    tagVariantRsId: String!
    studyId: String!
    traitReported: String!
    pval: Float!
    # publication info
    pmid: String
    pubDate: String
    pubAuthor: String
    nTotal: Int # n_initial + n_replication
    # ld info is optional; but expect all or none of the following
    overallR2: Float # 0.7 - 1
    # finemapping is optional; but expect all or none of the following
    isInCredibleSet: Boolean
    posteriorProbability: Float # 0 - 1
  }
  type Gecko {
    genes: [GeckoGene!]!
    tagVariants: [TagVariant!]!
    indexVariants: [IndexVariant!]!
    studies: [StudyInfo!]!
    geneTagVariants: [GeneTagVariant!]!
  }
  type GeckoGene {
    id: String!
    symbol: String!
    tss: Int!
    start: Int!
    end: Int!
    forwardStrand: Boolean!
    exons: [[Int!]!]!
  }
  type TagVariant {
    id: String!
    rsId: String
    position: Int!
  }
  type IndexVariant {
    id: String!
    rsId: String
    position: Int!
  }
  type GeneTagVariant {
    geneTss: Int!
    variantPosition: Int!
  }

  # type Regional {
  #     associations: [RegionalAssociation!]!
  # }
  # type RegionalAssociation {
  #     variantId: String!
  #     rsId: String
  #     pval: Float!
  #     chromosome: String!
  #     position: Int!
  #     # ldWithLead: Float!
  # }

  # ------------- IGNORE --------------

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
};
