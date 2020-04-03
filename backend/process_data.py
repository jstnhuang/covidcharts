#!/usr/bin/env python3

from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple, Union, cast
import json
import math
import os
import sys

from dateutil.parser import isoparse

import datasets

DAY = timedelta(days=1)
OptStrNum = Optional[Union[str, int, float]]

DATA_ORDER = [
    'days',
    'deathIncrease',
    'deaths',
    'deathsPerHospitalized',
    'deathsPerPositive',
    'deathsPerTest',
    'hospitalized',
    'hospitalizedIncrease',
    'hospitalizedPerPositive',
    'hospitalizedPerTest',
    'label',
    'lnDeathsPerCapita',
    'lnHospitalizedPerCapita',
    'lnPositivePerCapita',
    'lnTestsPerCapita',
    'positive',
    'positiveIncrease',
    'positivePerTest',
    'totalTestResults'
] # yapf: disable


def compute_derived_stats(
    count: Optional[int],
    ln_population: float,
    tests: Optional[int],
    positive: Optional[int],
    hospitalized: Optional[int],
) -> Tuple[Optional[float], Optional[float], Optional[float], Optional[float]]:
    if count is None:
        per_positive = None
        per_test = None
        per_hospitalized = None
        ln_per_capita = None
    else:
        if positive is None or positive == 0:
            per_positive = None
        else:
            per_positive = count / positive

        if tests is None or tests == 0:
            per_test = None
        else:
            per_test = count / tests

        if hospitalized is None or hospitalized == 0:
            per_hospitalized = None
        else:
            per_hospitalized = count / hospitalized

        if count == 0:
            ln_per_capita = None
        else:
            ln_per_capita = math.log(count) - ln_population
    return ln_per_capita, per_test, per_positive, per_hospitalized


def datum_to_list(datum: Dict[str, OptStrNum]) -> List[OptStrNum]:
    return [datum[f] for f in DATA_ORDER]


def fatal(*args, **kwargs):
    kwargs['file'] = sys.stderr
    print(*args, **kwargs)


def get_date(datum: Dict) -> datetime:
    return isoparse(datum['dateChecked'])


def has_valid_date(datum: Dict) -> bool:
    if 'dateChecked' not in datum:
        return False
    date_str = datum['dateChecked']
    try:
        date = isoparse(date_str)
    except ValueError:
        return False
    return True


def min_max_date(data: List[Dict]) -> Tuple[datetime, datetime]:
    assert len(data) > 0
    min_date = None
    max_date = None
    for datum in data:
        if 'dateChecked' not in datum:
            continue
        date_str = datum['dateChecked']
        try:
            date = isoparse(date_str)
        except ValueError:
            print('Error parsing date "{}", skipping'.format(date_str))
        if min_date is None or date < min_date:
            min_date = date
        if max_date is None or date < max_date:
            max_date = date
    return cast(datetime, min_date), cast(datetime, max_date)


def process_locality_data(json_data: List[Dict], log_pop: float,
                          min_date: datetime) -> List[Dict[str, OptStrNum]]:
    """Process data for either the US as a whole or for a particular state

    Args:
        log_pop: the natural log of the population of the locality

    Returns: [
        {
            days: 0.1,
            deaths: 2,
            hospitalized: 9,
            label: '2020-03-20',
            positive: 10,
            totalTestResults: 1000,
            ...
        },
        ...
    ]
    The return value will be in ascending order of days.

    days: A float indicating days since the first data point (the first day is
        days=0). 
    deaths: The number of deaths
    deathIncrease: The increase in the number of deaths from the day before
    deathsPerHospitalized: number of deaths per hospitalized
    deathsPerPositive: number of deaths per positive test
    deathsPerTest: number of deaths per test
    hospitalized: The number of hospitalized cases
    hospitalizedIncrease: The increase in hospitalized from the day before
    hospitalizedPerPositive: The number of hospitalized cases per positive test
    hospitalizedPerTest: The number of hospitalized cases per test
    label: Date label YYYY-MM-DD
    lnDeathsPerCapita: ln(number of deaths per capita)
    lnHospitalizedPerCapita: ln(number of hospitalized per capita)
    lnPositivePerCapita: ln(number of positive test results per capita)
    lnTestsPerCapita: ln(number of tests per capita)
    positive: The number of positive test results
    positiveIncrease: The number of new positive cases
    positivePerTest: number of positive test results per test
    totalTestResults: The number of tests
    """
    # Eliminate data with no date
    json_data = [d for d in json_data if has_valid_date(d)]

    # Sort data by date in ascending order
    json_data = sorted(json_data, key=get_date)

    output: List[Dict[str, OptStrNum]] = []
    for datum in json_data:
        date = get_date(datum)
        days = round((date - min_date) / DAY)
        deaths: Optional[int] = datum.get('death')
        death_increase: Optional[int] = datum.get('deathIncrease')
        hospitalized: Optional[int] = datum.get('hospitalized')
        hospitalized_increase: Optional[int] = datum.get(
            'hospitalizedIncrease')
        positive: Optional[int] = datum.get('positive')
        positive_increase: Optional[int] = datum.get('positiveIncrease')
        tests: Optional[int] = datum.get('totalTestResults')

        # Sometimes these numbers can go down, probably due to data corrections
        # We just zero them out for the purposes of visualizing # new cases
        if positive_increase is not None and positive_increase < 0:
            positive_increase = 0
        if hospitalized_increase is not None and hospitalized_increase < 0:
            hospitalized_increase = 0
        if death_increase is not None and death_increase < 0:
            death_increase = 0

        def _derived_stats(count):
            return compute_derived_stats(count, log_pop, tests, positive,
                                         hospitalized)

        (
            ln_deaths_per_capita,
            deaths_per_test,
            deaths_per_positive,
            deaths_per_hospitalized,
        ) = _derived_stats(deaths)
        (
            ln_hospitalized_per_capita,
            hospitalized_per_test,
            hospitalized_per_positive,
            _,
        ) = _derived_stats(hospitalized)
        (
            ln_positive_per_capita,
            positive_per_test,
            _,
            _,
        ) = _derived_stats(positive)
        (ln_tests_per_capita, _, _, _) = _derived_stats(tests)

        output.append({
            'days': days,
            'deathIncrease': death_increase,
            'deaths': deaths,
            'deathsPerHospitalized': deaths_per_hospitalized,
            'deathsPerPositive': deaths_per_positive,
            'deathsPerTest': deaths_per_test,
            'hospitalized': hospitalized,
            'hospitalizedIncrease': hospitalized_increase,
            'hospitalizedPerPositive': hospitalized_per_positive,
            'hospitalizedPerTest': hospitalized_per_test,
            'label': date.date().isoformat(),
            'lnDeathsPerCapita': ln_deaths_per_capita,
            'lnHospitalizedPerCapita': ln_hospitalized_per_capita,
            'lnPositivePerCapita': ln_positive_per_capita,
            'lnTestsPerCapita': ln_tests_per_capita,
            'positive': positive,
            'positiveIncrease': positive_increase,
            'positivePerTest': positive_per_test,
            'totalTestResults': tests
        })

    return output


def process_states_daily(
        json_data: List[Dict]) -> Dict[str, List[List[OptStrNum]]]:
    """Process daily state data

    Returns: a dictionary from states ID (e.g., CA, TX) to a list of lists. The
        outer list represents time, each element is a day's data. Each inner
        list contains data in the same order as listed in process_locality_data
    """
    # Get the earliest date across all states
    min_date, max_date = min_max_date(json_data)

    output = {}
    for state in datasets.STATES:
        state_data = [
            d for d in json_data if 'state' in d and d['state'] == state
        ]
        state_output = process_locality_data(
            state_data, math.log(datasets.POPULATIONS[state]), min_date)
        output[state] = [datum_to_list(datum) for datum in state_output]
    return output


def process_us_daily(json_data: List[Dict]) -> List[Dict[str, OptStrNum]]:
    """Process US daily dataset

    """
    min_date, max_date = min_max_date(json_data)
    return [
        datum_to_list(datum) for datum in process_locality_data(
            json_data, math.log(datasets.POPULATIONS['US']), min_date)
    ]


def main() -> None:
    os.makedirs('output', exist_ok=True)
    fns = [(datasets.US_DAILY_NAME, process_us_daily),
           (datasets.STATES_DAILY_NAME, process_states_daily)]
    for name, process_fn in fns:
        with open(datasets.path(name)) as json_file:
            data = json.load(json_file)
            if type(data) != list:
                fatal('Error with {}: expected list of data, got {}'.format(
                    name, type(data)))
            if len(data) == 0:
                fatal('Error with {}: got no data'.format(name))
            for datum in data:
                if type(datum) != dict:
                    fatal('Error with {}: expected list of dicts, but got '
                          'type {} in list'.format(name, type(datum)))
            processed_data = process_fn(data)
            output_path = os.path.join('output', '{}.js'.format(name))
            if name == datasets.US_DAILY_NAME:
                us_data = {'US': processed_data}
                json_str = json.dumps(us_data, indent=2)
            else:
                json_str = json.dumps(processed_data, indent=2)
            with open(output_path, 'w') as output_file:
                print('export const {} = {};'.format(name, json_str),
                      file=output_file)

    # Dump the data indices as well
    index_strs = [
        '  "{}": {},'.format(DATA_ORDER[i], i) for i in range(len(DATA_ORDER))
    ]
    index_str = '\n'.join(index_strs)
    data_js = ('export const DATA_INDICES = {{\n'
               '{}\n'
               '}};').format(index_str)
    index_path = os.path.join('output', 'data_indices.js')
    with open(index_path, 'w') as output_file:
        output_file.write(data_js)


if __name__ == '__main__':
    main()
