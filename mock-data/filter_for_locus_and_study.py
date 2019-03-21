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
COLOC_TABLE_COLS = [
    'right_study',
    'right_phenotype',
    'right_bio_feature',
    'right_chrom',
    'right_pos',
    'right_ref',
    'right_alt',
    'coloc_h3',
    'coloc_h4',
    'coloc_log_H4_H3'
]
COLOC_TABLE_COLS_MAPPING = {
    'right_study': 'study',
    'right_phenotype': 'phenotype',
    'right_bio_feature': 'bioFeature',
    'right_chrom': 'chrom',
    'right_pos': 'pos',
    'right_ref': 'ref',
    'right_alt': 'alt',
    'coloc_h3': 'h3',
    'coloc_h4': 'h4',
    'coloc_log_H4_H3': 'logH4H3'
}
COLOC_QTL_FILE_OUT = 'coloc-qtl-table.json'
COLOC_GWAS_FILE_OUT = 'coloc-gwas-table.json'


def build_mock_data_for_locus_and_study(lt, df_coloc):
    (study, chrom, pos, ref, alt) = lt
    print(study, chrom, pos, ref, alt)

    # create a directory for locus-trait files
    lt_dir_name = '{}__{}_{}_{}_{}'.format(study, chrom, pos, ref, alt)
    lt_dir = os.path.join(PROCESSED_DIR, lt_dir_name)
    os.makedirs(lt_dir, exist_ok=True)

    # coloc table
    df_coloc_lt = df_coloc[
        (df_coloc['left_study'] == study) &
        (df_coloc['left_chrom'].astype(str) == str(chrom)) &
        (df_coloc['left_pos'].astype(str) == str(pos)) &
        (df_coloc['left_ref'] == ref) &
        (df_coloc['left_alt'] == alt)
    ]

    # coloc table (qtls)
    coloc_qtl_outfile = os.path.join(lt_dir, COLOC_QTL_FILE_OUT)
    df_coloc_qtl = df_coloc_lt[df_coloc_lt['right_type'] != 'gwas']
    df_coloc_qtl = df_coloc_qtl[COLOC_TABLE_COLS]
    df_coloc_qtl.rename(columns=COLOC_TABLE_COLS_MAPPING, inplace=True)
    df_coloc_qtl.to_json(coloc_qtl_outfile, orient='records')

    # coloc table (gwas)
    coloc_gwas_outfile = os.path.join(lt_dir, COLOC_GWAS_FILE_OUT)
    df_coloc_gwas = df_coloc_lt[df_coloc_lt['right_type'] == 'gwas']
    df_coloc_gwas = df_coloc_gwas[COLOC_TABLE_COLS]
    df_coloc_gwas.rename(columns=COLOC_TABLE_COLS_MAPPING, inplace=True)
    df_coloc_gwas.to_json(coloc_gwas_outfile, orient='records')

def load_coloc():
    df = pd.read_json(COLOC_FILE, orient='records', lines=True)
    
    # filter on coloc_n_vars
    df = df.loc[df['coloc_n_vars'] >= COLOC_N_VARS_THRESHOLD, :]

    # filter left on type
    df = df.loc[df['left_type'] == 'gwas', :]

    # # de duplicate right
    # df = (
    #     df.sort_values('coloc_log_H4_H3', ascending=False)
    #     .drop(['right_chrom', 'right_pos', 'right_ref', 'right_alt'], axis=1)
    #     .drop_duplicates()
    # )

    # df['coloc_h3'] = df['coloc_h3'].astype('float64')
    # df['coloc_h4'] = df['coloc_h4'].astype('float64')
    # df['coloc_log_H4_H3'] = df['coloc_log_H4_H3'].astype('float64')

    return df


if __name__ == '__main__':
    df_coloc = load_coloc()
    
    for lt in LOCUS_TRAITS:
        lt_tuple = (lt['study'], lt['chrom'], lt['pos'], lt['ref'], lt['alt'])
        build_mock_data_for_locus_and_study(
            lt_tuple,
            df_coloc
        )