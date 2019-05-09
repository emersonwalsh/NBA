angular.module('myApp', [])
  .controller('myController', function ($scope, $http) {

    // Scoped Variables
    $scope.name = 'NBA';
    
    // Functions
    $scope.updateState = function() {
      getGeoJson();
    };

    // Global Variables
    var myChart;

     /**
     * @name initialize
     * @desc creates the visualization on the chart div
     * @returns {void}
     */
     function initialize() {
      //  checkForFirstTimeUse();
       getData();
     }

    /**
    * @name checkForFirstTimeUse
    * @desc start the tour if this is the users first time
    * @return {void}
    */
    function checkForFirstTimeUse() {
      var productTour = window.localStorage.getItem('ProductTour');

      if (productTour === null) {
        setTimeout(function () {
          window.localStorage.setItem('ProductTour', true);
          startProductTour();
        }, 0);
      }
    }
    
    /**
    * @name startProductTour
    * @desc begin product tour using driver.js
    * @return {void}
    */
    function startProductTour() {
      var driver = new Driver(),
        steps;

      steps = [
        {
          element: '#main',
          popover: {
            title: 'Welcome to TheRealMVP!',
            description: 'Observe player statistics from the 2018-2019 season.'
          }
        }
      ];

      driver.defineSteps(steps);
      driver.start();
    }

    /**
    * @name getData
    * @desc fetch data to paint
    * @returns {void}
    */
    function getData() {
        $http({
          url: './resources/data/18-19 Regular Season.json',
          method: 'GET'
        }).then(function (response) {
          formatData(response.data);
        }, function (error) {
          console.error(error);
        });
    }
    /**
     * @name formatData
     * @desc format the data for echarts
     * @param {array} data raw data retrieved from json
     * @return {void}
     */
    function formatData(data) {
      var i, 
        fullData = [],
        scatterData = [];

      for (i = 0; i < data.length; i++) {
        fullData.push([data[i].PPG, data[i].RPG, data[i].BPG, data[i].POS, data[i].APG, data[i].SPG, data[i].TOPG, data[i].TEAM, data[i]['FULL NAME']]);
        scatterData.push([data[i].ORTG, data[i].DRTG, data[i]['FULL NAME'], data[i].POS])
      }

      paint(fullData, scatterData);
    }

    /**
     * @name paint
     * @desc paint visualizations
     * @param {array} fullData all formatted data
     * @param {array} scatterData formatted data for scatter
     * @return {void}
     */
    function paint(fullData, scatterData) {
      myChart = echarts.init(document.getElementById('main'));

      // specify chart configuration item and data
      var option = {
        animation: true,
        visualMap: {
          type: 'piecewise',
          categories: ['C', 'C-F', 'F', 'F-C', 'F-G', 'G' , 'G-F'],
          dimension: 3,
          orient: 'horizontal',
          top: 0,
          left: 'center',
          inRange: {
              color: ['#4E79A7', '#F28E2B', '#E15759', '#76B7B2', '#59A14E', '#EDC949', '#B07AA1']
          },
          outOfRange: {
              color: '#ddd'
          },
          seriesIndex: [0, 1]
        },
        brush: {
            brushLink: 'all',
            xAxisIndex: [],
            yAxisIndex: [],
            seriesIndex: 1,
            inBrush: {
                opacity: 1
            }
        },
        toolbox: {
          bottom: '5%',
          right: '5%',
          feature: {
            brush: {
              type: ['polygon', 'keep', 'clear'],
              title: {
                polygon: 'Lasso',
                keep: 'Multi Select',
                clear: 'Clear'
              }
            }
          }
        },
        tooltip: {
          formatter: '{a}: {c}'
        },
        parallelAxis: [
            {dim: 0, name: 'Points'},
            {dim: 1, name: 'Rebounds'},
            {dim: 2, name: 'Blocks'},
            {dim: 4, name: 'Assists'},
            {dim: 5, name: 'Steals'},
            {dim: 6, name: 'Turnovers'}
        ],
        parallel: {
            top: '10%',
            left: '10%',
            right: '10%',
            height: '25%',
            parallelAxisDefault: {
                type: 'value',
                name: '2018-2019 Regular Season',
                nameLocation: 'end',
                nameGap: 20,
                splitNumber: 3,
                nameTextStyle: {
                    fontSize: 14
                },
                axisLine: {
                    lineStyle: {
                        color: '#555'
                    }
                },
                axisTick: {
                    lineStyle: {
                        color: '#555'
                    }
                },
                splitLine: {
                    show: false
                },
                axisLabel: {
                    textStyle: {
                        color: '#555'
                    }
                }
            }
        },
        xAxis: {
          name: 'Number of Wins',
          nameLocation: 'center',
          nameGap: 30
        },
        yAxis: {
          name: 'Player Effeciency',
          nameLocation: 'center',
          nameGap: 30
        },
        grid: [
          {
            top: '40%',
            left: '10%',
            right: '10%',
            height: '50%'
          },
      ],
        series: [
            {
                name: 'parallel',
                type: 'parallel',
                smooth: true,
                lineStyle: {
                    normal: {
                        width: 1,
                        opacity: 0.3
                    }
                },
                data: fullData
            }, {
              name: 'scatter',
              type: 'scatter',
              symbolSize: 10,
              data: scatterData
            }
        ]
      };

      // use configuration item and data specified to show chart
      myChart.setOption(option);
    }

    /**
     * @name cleanValue
     * @param {string | number} item the value to replace
     * @desc if number just returns value, otherwise removes spaces from string
     * @return {string | number} altered value
     */
    function cleanValue(item) {
      if (typeof item === 'string') {
        return item.replace(/_/g, ' ');
      } else if (typeof item === 'number') {
        item = item * 100;
        return item.toLocaleString(undefined, {
          minimumFractionDigits: 0,
          maximumFractionDigits: 1
        });
      }
      return item;
    }
     
     initialize();
});