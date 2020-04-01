# COVID-19 Charts
A website to visualize COVID-19 data from [The COVID Tracking Project](https://covidtracking.com/) in several ways.

Currently, the data is updated manually by calling a script and copying processed data into a website. To run the site:
```bash
./update_data.bash
cd frontend
polymer serve
```

To deploy the site:
```bash
cd frontend
polymer build
cd ../deploy
gcloud app deploy
```
