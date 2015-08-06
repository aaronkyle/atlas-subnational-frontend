import Ember from 'ember';
import numeral from 'numeral';
const {computed, get:get } = Ember;

export default Ember.Controller.extend({
  needs: 'application',
  locale: computed.alias("controllers.application.locale"),
  queryParams: ['year'],
  departmentsData: computed.oneWay('model.departments'),
  productsData: computed.oneWay('model.productsData'),
  industriesData: computed.oneWay('model.industriesData'),
  timeSeriesData: computed.oneWay('model.timeseries'),
  locationId: computed.readOnly('model.id'),
  year: 2013,
  productsSortedByExports: computed('productsData', function() {
    return _.slice(_.sortBy(this.get('productsData'), function(d) { return -d.export_value;}), 0, 50);
  }),
  exportTotal: computed('productsData', function() {
    var total = _.reduce(this.get('productsData'), function(memo, data) {
      return memo + data.export_value;
    }, 0);
    return "USD" + numeral(total).format('0.00 a');
  }),

  yearSort: ['year'],

  //validTimeseries is array of data points where all key(expect diversity cause fucking values are null),value pairs are not null
  validTimeseries: computed.filter('model.timeseries', function(data) {
    return data.gdp_real;
  }),
  sortedTimeseries: computed.sort('validTimeseries','yearSort'),

  firstDataPoint: computed('validTimeseries', function() {
    return _.first(this.get('validTimeseries')) || {};
  }),
  lastDataPoint: computed('validTimeseries', function() {
    return _.last(this.get('validTimeseries')) || {};
  }),
  yearRange: computed('validTimeseries', function() {
    var firstYear = get(this.get('firstDataPoint'), 'year');
    var lastYear = get(this.get('lastDataPoint'), 'year');
    return `${firstYear} - ${lastYear}`;
  }),
  lastPop: computed('validTimeseries','locale', function() {
    let pop = get(this.get('lastDataPoint'), 'population');
    return numeral(pop).format('0.00 a');
   }),
  lastGdp: computed('validTimeseries','locale', function() {
    let gdp = get(this.get('lastDataPoint'), 'gdp_real');
    return numeral(gdp).format('$ 0.00 a');
   }),
  lastGdpPerCapita: computed('validTimeseries','locale', function() {
    let gdpPC = get(this.get('lastDataPoint'), 'gdp_pc_real');
    return numeral(gdpPC).format('$ 0.00 a');
   }),
  gdpGrowth:computed('validTimeseries', function() {
    var firstGdp = get(this.get('firstDataPoint'), 'gdp_real');
    var lastGdp = get(this.get('lastDataPoint'), 'gdp_real');
    var growth = (lastGdp - firstGdp) / firstGdp;
    return numeral(growth).format('0.000%');
  }),
  activeStep: 1,
  stepStories: computed(function() {
    return [ { index: 1 }, { index: 2 }, { index: 3 }, { index: 4 } ];
  }),
  actions: {
    back: function() {
      if(this.get('activeStep') > 1) {
        this.decrementProperty('activeStep');
      }
    },
    forward: function() {
      if(this.get('activeStep') < this.get('stepStories').length) {
        this.incrementProperty('activeStep');
      }
    }
 }
});

