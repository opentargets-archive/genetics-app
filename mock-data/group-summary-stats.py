import os
import gzip
import json
import pandas as pd
import numpy as np

SCRIPT_DIR = os.path.dirname(__file__)
PROCESSED_DIR = os.path.join(SCRIPT_DIR, 'processed')

SUM_STATS_DIR = os.path.join(SCRIPT_DIR, 'raw/genetics-portal-sumstats2/filtered')
SUM_STATS_DIR_OUT = os.path.join(SCRIPT_DIR, 'processed/sum-stats')

def group_summary_stats():
    first = True
    for filename in os.listdir(SUM_STATS_DIR):
        if first:
            mode = 'w'
            first = False
        else:
            mode = 'a'
        
        if filename.endswith(".json.gz"):
            print('Processing {}'.format(filename))
            df = pd.read_json(os.path.join(SUM_STATS_DIR, filename), orient='records', lines=True)

            grouped = df.groupby(['chrom'])

            for name, group in grouped:
                with gzip.GzipFile(os.path.join(SUM_STATS_DIR_OUT, 'chromosome-{}.json.gz'.format(str(name))), mode) as f:
                    json_lines = group.to_json(orient='records', lines=True)
                    f.write(json_lines.encode('utf-8'))

if __name__ == '__main__':
    group_summary_stats()