var express = require('express');
var bodyParser = require('body-parser');
var _ = require('lodash');
var app = express();

app.use(bodyParser.json());

var timeserie = require('./series');

var now = Date.now();
var isFirst = true;
var delta = 0;
for (var i = 0; i < timeserie.length; i++) {
    var series = timeserie[i];

    //1. Successes의 첫번째 아이템을 기준으로 delta 값 구하기
    if(isFirst && series.target == "Successes"){
        delta = Math.round(((now + 3600) - series.datapoints[0][1] ) /1000) * 1000;
        console.info("series.target : " + series.target +  ", delta : " + delta);
        isFirst = false;
    }

    for (var y = 0; y < series.datapoints.length; y++) {
        // series.datapoints[y][1] = Math.round((now - decreaser) /1000) * 1000;
        // decreaser += 50000;

        series.datapoints[y][1] = delta + series.datapoints[y][1];

    }
}

var annotation = {
  name : "annotation name",
  enabled: true,
  datasource: "generic datasource",
  showLine: true,
}

var annotations = [
  { annotation: annotation, "title": "Donlad trump is kinda funny", "time": 1450754160000, text: "teeext", tags: "taaags" },
  { annotation: annotation, "title": "Wow he really won", "time": 1450754160000, text: "teeext", tags: "taaags" },
  { annotation: annotation, "title": "When is the next ", "time": 1450754160000, text: "teeext", tags: "taaags" }
];

var now = Date.now();
var decreaser = 0;
for (var i = 0;i < annotations.length; i++) {
  var anon = annotations[i];

  anon.time = (now - decreaser);
  decreaser += 1000000
}

var table =
  {
    columns: [{text: 'Time', type: 'time'}, {text: 'Country', type: 'string'}, {text: 'Number', type: 'number'}],
    values: [
      [ 1234567, 'SE', 123 ],
      [ 1234567, 'DE', 231 ],
      [ 1234567, 'US', 321 ],
    ]
  };
  
function setCORSHeaders(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST");
  res.setHeader("Access-Control-Allow-Headers", "accept, content-type");  
}


var now = Date.now();
var decreaser = 0;
for (var i = 0;i < table.values.length; i++) {
  var anon = table.values[i];

  anon[0] = (now - decreaser);
  decreaser += 1000000
}

app.all('/', function(req, res) {
  setCORSHeaders(res);
  res.send('I have a quest for you!');
  res.end();
});

app.all('/search', function(req, res){
  setCORSHeaders(res);
  var result = [];
  _.each(timeserie, function(ts) {
    result.push(ts.target);
  });

  res.json(result);
  res.end();
});

app.all('/annotations', function(req, res) {
  setCORSHeaders(res);
  console.log(req.url);
  console.log(req.body);

  res.json(annotations);
  res.end();
})

app.all('/query', function(req, res){
    setCORSHeaders(res);
    // console.log(req.url);
    // console.log(req.body);
    // console.info(req.body['targets'][0]['target']);

    var tsResult = [];



    _.each(req.body.targets, function(target) {

    if (target.type === 'table') {
      tsResult.push(table);
    } else {

        //timeserie
        if(req.body['targets'][0]['target'] == "Successes - Count"){
            for (var i = timeserie.length -1; i >= 0; i--) {
                var series = timeserie[i];
                if(timeserie[i].target == req.body['targets'][0]['target']){
                    console.info("series.target(success-count).points : ", series);
                }
            }
        }

        //timeserie 중 조회에 필요한 series만 담는다.
        var k = _.filter(timeserie, function(t) {
        return t.target === target.target
        });

        _.each(k, function(kk) {
        tsResult.push(kk)
        });
    }
  });


    if(req.body['targets'][0]['target'] == "Successes - Count" || req.body['targets'][0]['target'] == "Failures - Count" ||
        req.body['targets'][0]['target'] == "Under 1s" || req.body['targets'][0]['target'] == "1s ~ 3s" ||
        req.body['targets'][0]['target'] == "3s ~ 5s" || req.body['targets'][0]['target'] == "Over 5s" ||
        req.body['targets'][0]['target'] == "Errors"
    ){

        console.info(req.body['targets'][0]['target']);
        var searchFromTimeStamp = new Date(req.body['range']['from']).getTime();
        var searchToTimeStamp = new Date(req.body['range']['to']).getTime();

        console.info("============searchFromTimeStamp : ", searchFromTimeStamp);
        console.info("============searchToTimeStamp : ", searchToTimeStamp);

        var fillterList = []; //from ~ to 사이의 timestamp만 담는다
        var success_count_datapoints = tsResult[0]['datapoints'];

        console.info("========================================================================");
        for (var z =0; z < success_count_datapoints.length; z++){
            if (searchFromTimeStamp <= success_count_datapoints[z][1] ){
              if(searchToTimeStamp >= success_count_datapoints[z][1]){
                  fillterList.push(success_count_datapoints[z]);
              }
            }
        }
        console.info("fillterList : ", fillterList);
        console.info("========================================================================");
        var result = JSON.parse(JSON.stringify(tsResult));
        result[0]['datapoints'] = fillterList;
        res.json(result);
        res.end();
    }else{
        res.json(tsResult);
        res.end();
    }
});

app.listen(3335);

console.log("Server is listening to port 3333");
