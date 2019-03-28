import os
import gzip
import json
import glob
import pandas as pd
import numpy as np

SCRIPT_DIR = os.path.dirname(__file__)
PROCESSED_DIR = os.path.join(SCRIPT_DIR, "processed")

CRED_SET_DIR = os.path.join(
    SCRIPT_DIR, "raw/genetics-portal-staging/finemapping/190320/credset"
)
CRED_SET_DIR_OUT = os.path.join(SCRIPT_DIR, "processed/credible-sets-grouped")


def group_credible_sets():
    # remove previous output
    previous_files = glob.glob(os.path.join(CRED_SET_DIR_OUT, "*.json"))
    for pf in previous_files:
        os.remove(pf)

    # now process the credible sets
    i = 1
    for filename in os.listdir(CRED_SET_DIR):
        print("Processing part {}: ({})".format(i, filename))
        i += 1

        # use append mode (hence need to remove previous output)
        mode = "a"

        if filename.endswith(".json.gz"):
            df = pd.read_json(
                os.path.join(CRED_SET_DIR, filename), orient="records", lines=True
            )

            # handle gwas
            df_gwas = df[df["type"] == "gwas"]
            grouped = df_gwas.groupby(["study_id", "lead_chrom"])
            for name, group in grouped:
                filename_out = "{}__null__null__{}.json".format(name[0], name[1])
                print(" * " + filename_out)
                with open(os.path.join(CRED_SET_DIR_OUT, filename_out), mode) as f:
                    group.to_json(f, orient="records", lines=True, double_precision=15)

            # handle qtls
            df_qtl = df[df["type"] != "gwas"]
            grouped = df_qtl.groupby(
                ["study_id", "phenotype_id", "bio_feature", "lead_chrom"]
            )
            for name, group in grouped:
                filename_out = "{}__{}__{}__{}.json".format(
                    name[0], name[1], name[2], name[3]
                )
                print(" * " + filename_out)
                with open(os.path.join(CRED_SET_DIR_OUT, filename_out), mode) as f:
                    group.to_json(f, orient="records", lines=True, double_precision=15)


if __name__ == "__main__":
    group_credible_sets()
