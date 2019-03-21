import os
import pandas as pd

LOCUS_TRAITS = [
    { 'study': 'GCST006288_hbmd', 'chrom': '17', 'pos': 7463300, 'ref': 'T', 'alt': 'C' },
    { 'study': 'GCST004132_cr', 'chrom': '19', 'pos': 1178655, 'ref': 'G', 'alt': 'C' }
]
SCRIPT_DIR = os.path.dirname(__file__)
PROCESSED_DIR = os.path.join(SCRIPT_DIR, 'processed')

COLOC_DIR = os.path.join(SCRIPT_DIR, 'raw/genetics-portal-staging/coloc/190320')
COLOC_FILE = os.path.join(COLOC_DIR, 'coloc.json.gz')
COLOC_N_VARS_THRESHOLD = 200
COLOC_FILE_OUT = 'coloc-table.json'


def build_mock_data_for_locus_and_study(lt, df_coloc):
    (study, chrom, pos, ref, alt) = lt
    print(study, chrom, pos, ref, alt)

    # create a directory for locus-trait files
    lt_dir_name = '{}__{}_{}_{}_{}'.format(study, chrom, pos, ref, alt)
    lt_dir = os.path.join(PROCESSED_DIR, lt_dir_name)
    os.makedirs(lt_dir, exist_ok=True)

    # get rows for coloc table
    coloc_outfile = os.path.join(lt_dir, COLOC_FILE_OUT)
    df_coloc_lt = df_coloc[
        (df_coloc['left_study'] == study) &
        (df_coloc['left_chrom'].astype(str) == str(chrom)) &
        (df_coloc['left_pos'].astype(str) == str(pos)) &
        (df_coloc['left_ref'] == ref) &
        (df_coloc['left_alt'] == alt)
    ]
    df_coloc_lt.to_json(coloc_outfile, orient='records')

def load_coloc():
    df = pd.read_json(COLOC_FILE, orient='records', lines=True)
    
    # filter on coloc_n_vars
    df = df.loc[df['coloc_n_vars'] >= COLOC_N_VARS_THRESHOLD, :]

    # filter left on type
    df = df.loc[df['left_type'] == 'gwas', :]

    # de duplicate right
    df = (
        df.sort_values('coloc_log_H4_H3', ascending=False)
        .drop(['right_chrom', 'right_pos', 'right_ref', 'right_alt'], axis=1)
        .drop_duplicates()
    )

    return df


if __name__ == '__main__':
    df_coloc = load_coloc()
    
    for lt in LOCUS_TRAITS:
        lt_tuple = (lt['study'], lt['chrom'], lt['pos'], lt['ref'], lt['alt'])
        build_mock_data_for_locus_and_study(
            lt_tuple,
            df_coloc
        )