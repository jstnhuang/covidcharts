#!/usr/bin/env python3

import os
import sys

import requests

import datasets


def main():
    os.makedirs('working', exist_ok=True)
    for name, url in datasets.DATASETS.items():
        print('Downloading {} dataset... '.format(name), end='', flush=True)
        req = requests.get(url)
        if req.status_code != 200:
            print('Error getting {} dataset'.format(name),
                  file=sys.stderr,
                  flush=True)
            continue
        else:
            print('Done', flush=True)
        outpath = datasets.path(name)
        with open(outpath, 'w') as outfile:
            outfile.write(req.text)


if __name__ == '__main__':
    main()
