import os
import gzip
import json
import glob
import pandas as pd
import numpy as np

SCRIPT_DIR = os.path.dirname(__file__)
PROCESSED_DIR = os.path.join(SCRIPT_DIR, 'processed')

SUM_STATS_DIR = os.path.join(SCRIPT_DIR, 'raw/genetics-portal-sumstats2/filtered')
SUM_STATS_DIR_OUT = os.path.join(SCRIPT_DIR, 'processed/sum-stats-grouped')

def group_summary_stats():
    # remove previous output
    previous_files = glob.glob(os.path.join(SUM_STATS_DIR_OUT, '*.json.gz'))
    for pf in previous_files:
        os.remove(pf)
    
    # now process the sumstats
    for filename in os.listdir(SUM_STATS_DIR):
        # use append mode (hence need to remove previous output)
        mode = 'a'
        
        if filename.endswith(".json.gz"):
            print('Processing {}'.format(filename))
            df = pd.read_json(os.path.join(SUM_STATS_DIR, filename), orient='records', lines=True)
            
            # handle gwas
            df_gwas = df[df['type'] == 'gwas']

            grouped = df_gwas.groupby(['study_id', 'chrom'])
            for name, group in grouped:
                filename = '{}__null__null__{}.json.gz'.format(name[0], name[1])
                print(' * ' + filename)
                with gzip.GzipFile(os.path.join(SUM_STATS_DIR_OUT, filename), mode) as f:
                    json_lines = group.to_json(orient='records', lines=True)
                    f.write(json_lines.encode('utf-8'))

            # handle qtls
            df_qtl = df[df['type'] != 'gwas']
            grouped = df_qtl.groupby(['study_id', 'phenotype_id', 'bio_feature', 'chrom'])
            for name, group in grouped:
                filename = '{}__{}__{}__{}.json.gz'.format(name[0], name[1], name[2], name[3])
                print(' * ' + filename)
                with gzip.GzipFile(os.path.join(SUM_STATS_DIR_OUT, filename), mode) as f:
                    json_lines = group.to_json(orient='records', lines=True)
                    f.write(json_lines.encode('utf-8'))

if __name__ == '__main__':
    group_summary_stats()