import os

US_DAILY_NAME = 'us_daily'
US_DAILY_URL = 'https://covidtracking.com/api/us/daily'

STATES_DAILY_NAME = 'states_daily'
STATES_DAILY_URL = 'http://covidtracking.com/api/states/daily'

DATASETS = {US_DAILY_NAME: US_DAILY_URL, STATES_DAILY_NAME: STATES_DAILY_URL}

STATES = [
    'AK', 'AL', 'AR', 'AS', 'AZ', 'CA', 'CO', 'CT', 'DC', 'DE', 'FL', 'GA',
    'GU', 'HI', 'IA', 'ID', 'IL', 'IN', 'KS', 'KY', 'LA', 'MA', 'MD', 'ME',
    'MI', 'MN', 'MO', 'MP', 'MS', 'MT', 'NC', 'ND', 'NE', 'NH', 'NJ', 'NM',
    'NV', 'NY', 'OH', 'OK', 'OR', 'PA', 'PR', 'RI', 'SC', 'SD', 'TN', 'TX',
    'UT', 'VA', 'VI', 'VT', 'WA', 'WI', 'WV', 'WY'
]

# July 1, 2019 pouplation estimates from US Census
POPULATIONS = {
    'US': 331814684,
    'AK': 731545,
    'AL': 4903185,
    'AR': 3017825,
    'AS': 55641,
    'AZ': 7278717,
    'CA': 39512223,
    'CO': 5758736,
    'CT': 3565287,
    'DC': 705749,
    'DE': 973764,
    'FL': 21477737,
    'GA': 10617423,
    'GU': 165718,
    'HI': 1415872,
    'IA': 3155070,
    'ID': 1787147,
    'IL': 12671821,
    'IN': 6732219,
    'KS': 2913314,
    'KY': 4467673,
    'LA': 4648794,
    'MA': 6949503,
    'MD': 6045680,
    'ME': 1344212,
    'MI': 9986857,
    'MN': 5639632,
    'MO': 6137428,
    'MP': 55194,
    'MS': 2976149,
    'MT': 1068778,
    'NC': 10488084,
    'ND': 762062,
    'NE': 1934408,
    'NH': 1359711,
    'NJ': 8882190,
    'NM': 2096829,
    'NV': 3080156,
    'NY': 19453561,
    'OH': 11689100,
    'OK': 3956971,
    'OR': 4217737,
    'PA': 12801989,
    'PR': 3193694,
    'RI': 1059361,
    'SC': 5148714,
    'SD': 884659,
    'TN': 6833174,
    'TX': 28995881,
    'UT': 3205958,
    'VA': 8535519,
    'VI': 104914,
    'VT': 623989,
    'WA': 7614893,
    'WI': 5822434,
    'WV': 1792065,
    'WY': 578759
}


def path(name):
    return os.path.join('working', '{}.json'.format(name))
