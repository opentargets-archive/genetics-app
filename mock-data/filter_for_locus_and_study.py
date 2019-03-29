import os
import json
import gzip
from io import StringIO

import pandas as pd
import numpy as np

LOCUS_TRAITS = [
    {"study": "GCST006288_hbmd", "chrom": "17", "pos": 7463300, "ref": "T", "alt": "C"},
    {"study": "GCST004132_cr", "chrom": "19", "pos": 1178655, "ref": "G", "alt": "C"},
    {
        "study": "GCST003044_cr_ic",
        "chrom": "2",
        "pos": 60977721,
        "ref": "A",
        "alt": "G",
    },
    {
        "study": "GCST003044_cr_ic",
        "chrom": "9",
        "pos": 114806766,
        "ref": "T",
        "alt": "C",
    }
]
SCRIPT_DIR = os.path.dirname(__file__)
PROCESSED_DIR = os.path.join(SCRIPT_DIR, "processed")

MAPPING_FILE_ILMN_TO_ENSEMBL = "raw/ilmn-to-ensembl.json"
MAPPING_FILE_ENSEMBL_TO_SYMBOL = "raw/ensembl-to-symbol.json"

COLOC_DIR = os.path.join(SCRIPT_DIR, "raw/genetics-portal-staging/coloc/190320")
COLOC_FILE = os.path.join(COLOC_DIR, "coloc.json.gz")
COLOC_N_VARS_THRESHOLD = 200
COLOC_TABLE_COLS = [
    "right_study",
    "right_phenotype",
    "right_phenotype_ensembl_id",
    "right_phenotype_symbol",
    "right_bio_feature",
    "right_chrom",
    "right_pos",
    "right_ref",
    "right_alt",
    "right_beta",
    "coloc_h3",
    "coloc_h4",
    "coloc_log_H4_H3",
]
COLOC_TABLE_COLS_MAPPING = {
    "right_study": "study",
    "right_phenotype": "phenotype",
    "right_phenotype_ensembl_id": "phenotypeEnsemblId",
    "right_phenotype_symbol": "phenotypeSymbol",
    "right_bio_feature": "bioFeature",
    "right_chrom": "chrom",
    "right_pos": "pos",
    "right_ref": "ref",
    "right_alt": "alt",
    "right_beta": "beta",
    "coloc_h3": "h3",
    "coloc_h4": "h4",
    "coloc_log_H4_H3": "logH4H3",
}
COLOC_QTL_FILE_OUT = "coloc-qtl-table.json"
COLOC_GWAS_FILE_OUT = "coloc-gwas-table.json"
COLOC_GWAS_HEATMAP_FILE_OUT = "coloc-gwas-heatmap-table.json"

FINEMAPPING_DIR = os.path.join(
    SCRIPT_DIR, "raw/genetics-portal-staging/finemapping/190320"
)
TOP_LOCI_FILE = os.path.join(FINEMAPPING_DIR, "top_loci.json.gz")

SUM_STATS_DIR = os.path.join(SCRIPT_DIR, "processed/sum-stats-grouped")
SUM_STATS_FILE_OUT = "sum-stats-table.json"
SUM_STATS_DISTANCE = 500000

CRED_SET_DIR = os.path.join(SCRIPT_DIR, "processed/credible-sets-grouped")
CRED_SET_FILE_OUT = "credible-sets-table.json"

PAGE_SUMMARY_FILE_OUT = "page-summary.json"


def build_mock_data_for_locus_and_study(lt, df_coloc):
    (study, chrom, pos, ref, alt) = lt
    print(study, chrom, pos, ref, alt)

    # create a directory for locus-trait files
    lt_dir_name = "{}__{}_{}_{}_{}".format(study, chrom, pos, ref, alt)
    lt_dir = os.path.join(PROCESSED_DIR, lt_dir_name)
    os.makedirs(lt_dir, exist_ok=True)

    # page summary
    page_summary_outfile = os.path.join(lt_dir, PAGE_SUMMARY_FILE_OUT)
    with open(page_summary_outfile, "w") as f:
        json.dump(
            {
                "study": study,
                "chromosome": chrom,
                "position": pos,
                "ref": ref,
                "alt": alt,
            },
            f,
        )

    # coloc table
    df_coloc_lt = df_coloc[
        (df_coloc["left_study"] == study)
        & (df_coloc["left_chrom"].astype(str) == str(chrom))
        & (df_coloc["left_pos"].astype(str) == str(pos))
        & (df_coloc["left_ref"] == ref)
        & (df_coloc["left_alt"] == alt)
    ]

    # coloc table (qtls)
    coloc_qtl_outfile = os.path.join(lt_dir, COLOC_QTL_FILE_OUT)
    df_coloc_qtl = df_coloc_lt[df_coloc_lt["right_type"] != "gwas"]
    df_coloc_qtl = df_coloc_qtl[COLOC_TABLE_COLS]
    df_coloc_qtl.rename(columns=COLOC_TABLE_COLS_MAPPING, inplace=True)
    df_coloc_qtl.to_json(coloc_qtl_outfile, orient="records", double_precision=15)

    # coloc table (gwas)
    coloc_gwas_outfile = os.path.join(lt_dir, COLOC_GWAS_FILE_OUT)
    df_coloc_gwas = df_coloc_lt[df_coloc_lt["right_type"] == "gwas"]
    df_coloc_gwas = df_coloc_gwas[COLOC_TABLE_COLS]
    df_coloc_gwas.rename(columns=COLOC_TABLE_COLS_MAPPING, inplace=True)
    df_coloc_gwas.to_json(coloc_gwas_outfile, orient="records", double_precision=15)

    # coloc heatmap table (filtered gwas set vs self)
    keys = [
        (study, chrom, pos, ref, alt),
        *[
            (row["study"], row["chrom"], row["pos"], row["ref"], row["alt"])
            for _, row in df_coloc_gwas.iterrows()
        ],
    ]

    def key_to_string(key):
        (study, chrom, pos, ref, alt) = key
        return "{}__{}__{}__{}__{}".format(study, chrom, pos, ref, alt)

    coloc_lt_heatmap = {key_to_string(k): {} for k in keys}
    for k1 in keys:
        (study1, chrom1, pos1, ref1, alt1) = k1
        for k2 in keys:
            (study2, chrom2, pos2, ref2, alt2) = k2
            if k1 != k2:
                k1_k2_rows = df_coloc[
                    (df_coloc["left_study"] == study1)
                    & (df_coloc["left_chrom"].astype(str) == str(chrom1))
                    & (df_coloc["left_pos"].astype(str) == str(pos1))
                    & (df_coloc["left_ref"] == ref1)
                    & (df_coloc["left_alt"] == alt1)
                    & (df_coloc["right_study"] == study2)
                    & (df_coloc["right_chrom"].astype(str) == str(chrom2))
                    & (df_coloc["right_pos"].astype(str) == str(pos2))
                    & (df_coloc["right_ref"] == ref2)
                    & (df_coloc["right_alt"] == alt2)
                ]
                assert len(k1_k2_rows) == 1
                r = k1_k2_rows.iloc[0]
                coloc_lt_heatmap[key_to_string(k1)][key_to_string(k2)] = {
                    "h3": r["coloc_h3"],
                    "h4": r["coloc_h4"],
                    "logH4H3": r["coloc_log_H4_H3"],
                }
    coloc_heatmap_outfile = os.path.join(lt_dir, COLOC_GWAS_HEATMAP_FILE_OUT)
    with open(coloc_heatmap_outfile, "w") as f:
        json.dump(coloc_lt_heatmap, f)

    # summary stats table
    sum_stats_outfile = os.path.join(lt_dir, SUM_STATS_FILE_OUT)
    sum_stats = {}

    # summary stats table (self)
    key = "{}__null__null__{}".format(study, chrom)
    filename = key + ".json.gz"

    # TODO: remove
    if os.path.exists(os.path.join(SUM_STATS_DIR, filename)):
        df_partial = pd.read_json(os.path.join(SUM_STATS_DIR, filename), orient="records", lines=True)

        # get only those within the locus
        df_partial_filtered = df_partial[
            ((df_partial["pos"] - pos) < SUM_STATS_DISTANCE)
            & ((pos - df_partial["pos"]) < SUM_STATS_DISTANCE)
        ]

        # subset of keys
        sum_stats[key] = [
            {
                "chromosome": r["chrom"],
                "position": r["pos"],
                "ref": r["ref"],
                "alt": r["alt"],
                "beta": r["beta"],
                "pval": r["pval"],
            }
            for r in df_partial_filtered.to_dict("records")
        ]

    # summary stats table (coloced gwas)
    for _, row in df_coloc_gwas.iterrows():
        key = "{}__null__null__{}".format(row["study"], row["chrom"])
        filename = key + ".json.gz"

        # check if already visited
        if key in sum_stats.keys():
            print('sum stats (gwas) key hit twice: ' + key)
            continue

        # TODO: remove
        if not os.path.exists(os.path.join(CRED_SET_DIR, filename)):
            continue

        df_partial = pd.read_json(os.path.join(SUM_STATS_DIR, filename), orient="records", lines=True)

        # get only those within the locus
        df_partial_filtered = df_partial[
            ((df_partial["pos"] - pos) < SUM_STATS_DISTANCE)
            & ((pos - df_partial["pos"]) < SUM_STATS_DISTANCE)
        ]

        # subset of keys
        sum_stats[key] = [
            {
                "chromosome": r["chrom"],
                "position": r["pos"],
                "ref": r["ref"],
                "alt": r["alt"],
                "beta": r["beta"],
                "pval": r["pval"],
            }
            for r in df_partial_filtered.to_dict("records")
        ]

    # summary stats table (coloced qtls)
    for _, row in df_coloc_qtl.iterrows():
        key = "{}__{}__{}__{}".format(
            row["study"], row["phenotype"], row["bioFeature"], row["chrom"]
        )
        filename = key + ".json.gz"

        # check if already visited
        if key in sum_stats.keys():
            print('sum stats (qtls) key hit twice: ' + key)
            continue

        # TODO: remove
        if not os.path.exists(os.path.join(SUM_STATS_DIR, filename)):
            continue

        df_partial = pd.read_json(os.path.join(SUM_STATS_DIR, filename), orient="records", lines=True)

        # get only those within the locus
        df_partial_filtered = df_partial[
            ((df_partial["pos"] - pos) < SUM_STATS_DISTANCE)
            & ((pos - df_partial["pos"]) < SUM_STATS_DISTANCE)
        ]

        # subset of keys
        sum_stats[key] = [
            {
                "chromosome": r["chrom"],
                "position": r["pos"],
                "ref": r["ref"],
                "alt": r["alt"],
                "beta": r["beta"],
                "pval": r["pval"],
            }
            for r in df_partial_filtered.to_dict("records")
        ]

    with open(sum_stats_outfile, "w") as f:
        json.dump(sum_stats, f)

    # credible sets
    credible_sets_outfile = os.path.join(lt_dir, CRED_SET_FILE_OUT)
    credible_sets = {}

    # credible set (self)
    key = "{}__null__null__{}".format(study, chrom)
    filename = key + ".json.gz"

    row_key = "{}__null__null__{}__{}__{}__{}".format(
        study, chrom, pos, ref, alt
    )

    df_partial = pd.read_json(os.path.join(CRED_SET_DIR, filename), orient="records", lines=True)

    # get only those within the locus
    df_partial_filtered = df_partial[
        (df_partial["lead_pos"] == pos)
        & (df_partial["lead_ref"] == ref)
        & (df_partial["lead_alt"] == alt)
        & (df_partial["postprob"] > 0.01)
        & (df_partial["is95_credset"] == True)
    ]

    # subset of keys
    credible_sets[row_key] = [
        {
            "chromosome": r["tag_chrom"],
            "position": r["tag_pos"],
            "ref": r["tag_ref"],
            "alt": r["tag_alt"],
            "beta": r["tag_beta"],
            "betaCond": r["tag_beta_cond"],
            "pval": r["tag_pval"],
            "pvalCond": r["tag_pval_cond"],
            "posteriorProbability": r["postprob"],
            "posteriorProbabilityCumulative": r["postprob_cumsum"],
            "logABF": r["logABF"],
            "is95CredibleSet": r["is95_credset"],
            "is99CredibleSet": r["is99_credset"],
        }
        for r in df_partial_filtered.to_dict("records")
    ]

    # credible sets (coloced qtls)
    for _, row in df_coloc_qtl.iterrows():
        if (row['logH4H3'] > 1):
            key = "{}__{}__{}__{}".format(
                row["study"], row["phenotype"], row["bioFeature"], row["chrom"]
            )
            filename = key + ".json.gz"

            row_key = "{}__{}__{}__{}__{}__{}__{}".format(
                row["study"], row["phenotype"], row["bioFeature"], row["chrom"], row['pos'], row['ref'], row['alt']
            )

            # check if already visited
            if row_key in credible_sets.keys():
                print('credible set key hit twice: ' + key)
                continue

            # TODO: remove
            if not os.path.exists(os.path.join(CRED_SET_DIR, filename)):
                continue

            df_partial = pd.read_json(os.path.join(CRED_SET_DIR, filename), orient="records", lines=True)
            print(row_key, df_partial.shape)

            # get only those within the locus
            df_partial_filtered = df_partial[
                (df_partial["lead_pos"] == row['pos'])
                & (df_partial["lead_ref"] == row['ref'])
                & (df_partial["lead_alt"] == row['alt'])
                & (df_partial["postprob"] > 0.01)
                & (df_partial["is95_credset"] == True)
            ]
            print(row_key, df_partial_filtered.shape)

            # subset of keys
            credible_sets[row_key] = [
                {
                    "chromosome": r["tag_chrom"],
                    "position": r["tag_pos"],
                    "ref": r["tag_ref"],
                    "alt": r["tag_alt"],
                    "beta": r["tag_beta"],
                    "betaCond": r["tag_beta_cond"],
                    "pval": r["tag_pval"],
                    "pvalCond": r["tag_pval_cond"],
                    "posteriorProbability": r["postprob"],
                    "posteriorProbabilityCumulative": r["postprob_cumsum"],
                    "logABF": r["logABF"],
                    "is95CredibleSet": r["is95_credset"],
                    "is99CredibleSet": r["is99_credset"],
                }
                for r in df_partial_filtered.to_dict("records")
            ]

    with open(credible_sets_outfile, "w") as f:
        json.dump(credible_sets, f)


def load_coloc(ilmn_to_ensembl, ensembl_to_symbol, top_loci_beta_lookup):
    df = pd.read_json(COLOC_FILE, orient="records", lines=True)

    # filter on coloc_n_vars
    df = df.loc[df["coloc_n_vars"] >= COLOC_N_VARS_THRESHOLD, :]

    # filter left on type
    df = df.loc[df["left_type"] == "gwas", :]

    # map phenotypes
    to_ensembl = (
        lambda p: p
        if str(p).startswith("ENSG")
        else (ilmn_to_ensembl[p] if p in ilmn_to_ensembl.keys() else p)
    )
    to_symbol = lambda g: ensembl_to_symbol[g] if g in ensembl_to_symbol.keys() else g
    df["right_phenotype_ensembl_id"] = df["right_phenotype"].apply(to_ensembl)
    df["right_phenotype_symbol"] = df["right_phenotype_ensembl_id"].apply(to_symbol)

    # # de duplicate right
    # df = (
    #     df.sort_values('coloc_log_H4_H3', ascending=False)
    #     .drop(['right_chrom', 'right_pos', 'right_ref', 'right_alt'], axis=1)
    #     .drop_duplicates()
    # )

    # add beta (for right study-locus)
    def to_right_beta(row):
        key = (
            row["right_study"],
            row["right_phenotype"],
            row["right_bio_feature"],
            row["right_chrom"],
            row["right_pos"],
            row["right_ref"],
            row["right_alt"],
        )
        value = (
            top_loci_beta_lookup[key] if key in top_loci_beta_lookup.keys() else np.nan
        )
        return value

    df["right_beta"] = df.apply(lambda row: to_right_beta(row), axis=1)

    return df


def load_top_loci():
    df = pd.read_json(TOP_LOCI_FILE, orient="records", lines=True)
    return df


def build_beta_lookup(df_top_loci):
    lookup = {}
    for _, row in df_top_loci.iterrows():
        key = (
            row["study_id"],
            row["phenotype_id"],
            row["bio_feature"],
            row["chrom"],
            row["pos"],
            row["ref"],
            row["alt"],
        )
        lookup[key] = row["beta"]

    return lookup


def load_gene_mappings():
    with open(MAPPING_FILE_ILMN_TO_ENSEMBL, "r") as f:
        ilmn_to_ensembl_list = json.load(f)
        ilmn_to_ensembl = {o["phenotype"]: o["ensgId"] for o in ilmn_to_ensembl_list}

    with open(MAPPING_FILE_ENSEMBL_TO_SYMBOL, "r") as f:
        ensembl_to_symbol = json.load(f)

    return (ilmn_to_ensembl, ensembl_to_symbol)


if __name__ == "__main__":
    (ilmn_to_ensembl, ensembl_to_symbol) = load_gene_mappings()

    df_top_loci = load_top_loci()
    top_loci_beta_lookup = build_beta_lookup(df_top_loci)

    df_coloc = load_coloc(ilmn_to_ensembl, ensembl_to_symbol, top_loci_beta_lookup)

    for lt in LOCUS_TRAITS:
        lt_tuple = (lt["study"], lt["chrom"], lt["pos"], lt["ref"], lt["alt"])
        build_mock_data_for_locus_and_study(lt_tuple, df_coloc)

