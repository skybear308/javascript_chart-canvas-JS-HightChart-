
$("#overview_histogram").click(function(){
    var dataUrl = ''
    
    // if (vin != '') {
    //     dataUrl = 'new_getmarketvalue.php?key='+encodeURIComponent(key)+'&vin='+encodeURIComponent(vin)+'&period='+encodeURIComponent(period)+'&mileage='+encodeURIComponent(mileage)+'&country='+country+'&status=overview';
        
    // } else {
    //     dataUrl = 'new_getmarketvalue.php?key='+encodeURIComponent(key)+'&year='+encodeURIComponent(year)+'&make='+encodeURIComponent(make)+'&model='+encodeURIComponent(model)+'&trim='+encodeURIComponent(trim)+'&period='+encodeURIComponent(period)+'&mileage='+encodeURIComponent(mileage)+'&country='+country+'&status=overview';
    // }
    var vin = $('#vin').val();
    var period = $('#va_mv_timeperiod_select').val();
    // var mileage = $('#va_mv_mileage_text_dd').val();
    var mileage = '';

    dataUrl = 'new_getmarketvalue.php?&mileage=' + mileage + '&vin=' + vin + '&period=' + period + '&status=histogram';

    $.get(dataUrl,function(data){
        var result = JSON.parse(data);
        
        var chart = new CanvasJS.Chart("chartContainer_bar", {
            width:550,
            height:300,
            theme: "light2",
            animationEnabled: true,
            title:{
                fontFamily: "arial black",
                fontColor: "#695A42"
            },
            axisX:{
                lineThickness: 0,
                tickThickness: 0,
                prefix: "$",
                suffix: "K",
                interval: 2
            },
            axisY:{
                lineThickness: 0,
                gridThickness: 0,
                tickThickness: 0,
                labelFormatter: function(e){
                    return "";
                },
                margin: 10
            },
            toolTip: {
                content:"{y}",
            },
            data: [{
                type: "column",
                indexLabel: "{y}",
                indexLabelPlacement: "outside",  
                indexLabelOrientation: "horizontal",
                color: "#3A7BB5",
                dataPoints: result
                }]
        });
        chart.render();

        chart.set("dataPointWidth",Math.ceil(chart.axisX[0].bounds.width/chart.data[0].dataPoints.length - 2),true);

    })

    
});

$("#showlocation").click(function(){

    var dataUrl = '';
    // if (vin != '') {
    //     dataUrl = 'new_getmarketvalue.php?key='+encodeURIComponent(key)+'&vin='+encodeURIComponent(vin)+'&period='+encodeURIComponent(period)+'&mileage='+encodeURIComponent(mileage)+'&country='+country+'&status=overview';
        
    // } else {
    //     dataUrl = 'new_getmarketvalue.php?key='+encodeURIComponent(key)+'&year='+encodeURIComponent(year)+'&make='+encodeURIComponent(make)+'&model='+encodeURIComponent(model)+'&trim='+encodeURIComponent(trim)+'&period='+encodeURIComponent(period)+'&mileage='+encodeURIComponent(mileage)+'&country='+country+'&status=overview';
    // }
    var vin = $('#vin').val();
    var period = $('#va_mv_timeperiod_select').val();
    // var mileage = $('#va_mv_mileage_text_dd').val();
    var mileage = '';

    dataUrl = 'new_getmarketvalue.php?&mileage=' + mileage + '&vin=' + vin + '&period=' + period + '&status=location';


    Highcharts.getJSON(dataUrl, function (data) {
        
        // console.log('asdf');
        console.log(data);
            
        var keys = data.key,
        names = data.name,
        average_price = data.average_price,
        similar_vehicle = data.similar_vehicle,
        mapData = Highcharts.maps['countries/us/us-all'],
        // Build the chart options
        options = {
            chart: {
                type: 'map',
                map: mapData,
                renderTo: 'location_graph_chart',
            // borderWidth: 1
            },
    
            title: {
                text: ''
            },
            subtitle: {
                // text: 'Source: <a href="https://transition.fec.gov/pubrec/fe2016/2016presgeresults.pdf">Federal Election Commission</a>'
            },
    
            legend: {
                layout: 'proximate',
                align: 'right',
                verticalAlign: 'top',
                x: -65,
                y: 50,
                // itemDistance: 30,
                symbolRadius: 0
            },
    
            mapNavigation: {
                enabled: true,
                enableButtons: false
            },
    
            colorAxis: {
                dataClasses: [{
                    from: -6310,
                    color: '#154155',
                    name: 'Most Expensive ($6,310+)'
                }, {
                    from: 5732,
                    to: 6310,
                    color: '#2675b0',
                    name: 'Above Average ($5,732-$6,310)'
                }, {
                    from: 5549,
                    to: 5573,
                    color: '#259dfd',
                    name: 'Average ($5,549-$5,573)'
                }, {
                    from: 5132,
                    to: 5549,
                    color: '#7ec9fa',
                    name: 'Below Average ($5,132-$5,549)'
                }, {
                    to: 5132,
                    color: '#bee4f7',
                    name: 'Least Average (<$5,132)'
                }]
            },
    
            series: [
            {
                data: [],
                joinBy: 'postal-code',
                dataLabels: {
                    enabled: true,
                    color: '#FFFFFF',
                    format: '{point.postal-code}',
                    style: {
                        textTransform: 'uppercase'
                    }
                },
                name: '',
                dataLabels:{
                    enabled:false
                },
                tooltip: {
                    color: '#FF0000',
                    useHTML: true,
            		headerFormat: '<table>',
            		pointFormat: '<span style="color:red;">Average Price: ${point.value}</span><br><span style="color:red;">Recently sold: {point.similar_vehicle} similar vehicles</span>',
                    pointFooter: '</table>'
                },
                cursor: 'pointer'
                
            }]
        };

        keys = keys.map(function (key) {
            return key.toUpperCase();
        });

        Highcharts.each(mapData.features, function (mapPoint) {
            if (mapPoint.properties['postal-code']) {
                var postalCode = mapPoint.properties['postal-code'],
                i = $.inArray(postalCode, keys);
                options.series[0].data.push(Highcharts.extend({
                    value: parseInt(average_price[i]),
                    name: names[i],
                    similar_vehicle: similar_vehicle[i],
                    'postal-code': postalCode,
                    row: i
                }, 
                mapPoint));
            }
        });
    
        // Initiate the chart
    
        window.chart = new Highcharts.Map(options);
    });
      
});

$('#showmileage').click(function(){
    
    var dataUrl = ''
    
    // if (vin != '') {
    //     dataUrl = 'new_getmarketvalue.php?key='+encodeURIComponent(key)+'&vin='+encodeURIComponent(vin)+'&period='+encodeURIComponent(period)+'&mileage='+encodeURIComponent(mileage)+'&country='+country+'&status=overview';
        
    // } else {
    //     dataUrl = 'new_getmarketvalue.php?key='+encodeURIComponent(key)+'&year='+encodeURIComponent(year)+'&make='+encodeURIComponent(make)+'&model='+encodeURIComponent(model)+'&trim='+encodeURIComponent(trim)+'&period='+encodeURIComponent(period)+'&mileage='+encodeURIComponent(mileage)+'&country='+country+'&status=overview';
    // }
    var vin = $('#vin').val();
    var period = $('#va_mv_timeperiod_select').val();

    dataUrl = 'new_getmarketvalue.php?status=mileage&mileage=""&vin=' + vin + '&period=' + period;

    $.get(dataUrl,function(res) {

        var result = JSON.parse(res);

        var chart = new CanvasJS.Chart("mileage_graph_chart", {
            animationEnabled: true,
            width:650,
            height:300,
            
            theme:"light1",
            interactivityEnabled: true,
            axisX: {
                tickThickness: 0,
                lineThickness: 2,
                title: "Mileage",
                labelFormatter: function(e){
                    return "";
                }
            },
            axisY:{
                tickThickness: 0,
                gridThickness: 0,
                lineThickness: 2,
                title: "Price(in thousands of USD)",
                labelFormatter: function(e){
                    return "";
                }
            },
            toolTip: {
                fontColor: "red"
            },
            data: [   
                {
                    type: "scatter",
                    color: "#d7e1fe",
                    dataPoints: result.scatter
                }
            ]
        });

        chart.render();

        calculateLine(chart);

        function calculateLine(chart) {
            
            chart.addTo("data",{
                type: "spline", //Line series showing trend
                markerSize: 0,
                lineThickness: 4,
                highlightEnabled: false,
                toolTipContent: null,
                dataPoints: [result.spline['start_point'], result.spline['middle_point'], result.spline['end_point']]
                // dataPoints:[
                //     {x: 11790, y: 46501, lineColor: '#289afd'},
                //     {x: 118326, y: 23076, lineColor: '#289afd'},
                //     {x: 230141, y: 16243, lineColor: '#289afd'}
                // ]
            });

        }

    });
    
});

$('#showovertime').click(function(){
    
    var dataUrl = ''
    
    // if (vin != '') {
    //     dataUrl = 'new_getmarketvalue.php?key='+encodeURIComponent(key)+'&vin='+encodeURIComponent(vin)+'&period='+encodeURIComponent(period)+'&mileage='+encodeURIComponent(mileage)+'&country='+country+'&status=overview';
        
    // } else {
    //     dataUrl = 'new_getmarketvalue.php?key='+encodeURIComponent(key)+'&year='+encodeURIComponent(year)+'&make='+encodeURIComponent(make)+'&model='+encodeURIComponent(model)+'&trim='+encodeURIComponent(trim)+'&period='+encodeURIComponent(period)+'&mileage='+encodeURIComponent(mileage)+'&country='+country+'&status=overview';
    // }
    var vin = $('#vin').val();
    // var period = $('#va_mv_timeperiod_select').val();
    var mileage = $('#va_mv_mileage_text_dd').val();
    var zipcode = '';

    dataUrl = 'new_getmarketvalue.php?status=overtime&mileage=' + mileage + '&vin=' + vin + '&zipcode=' + zipcode;

    $.get(dataUrl,function(res) {

        // var result = JSON.parse(res);

        var vehicle = '2005 Toyota Corolla CE';

        var chart = new CanvasJS.Chart("overtime_graph_chart", {
            theme:"light2",
            width:650,
            // height:300,
            animationEnabled: true,
            title:{
                text: ""
            },
            axisY:{
                tickThickness: 0,
                gridThickness: 0,
                lineThickness: 2,
                title: "Price(in thousands of USD)",
                labelFormatter: function(e){
                    return "";
                }
            },
            axisX: {
                tickThickness: 0,
                lineThickness: 2,
                title: ""
            },
            toolTip: {
                shared: "true"
            },
            legend:{
                cursor:"pointer"
            },
            data: [{
                yValueFormatString: "#,### Units",
                xValueFormatString: "YYYY",
                lineColor: "#a0a0a0",
                showInLegend: true,
                name: "Estimated Market Price for mileage and location",
                type: "spline",
                color: "#a0a0a0",
                dataPoints: [
                    {x: new Date(2002, 0), y: 7289000, toolTipContent: 'asdfasdf'},
                    {x: new Date(2002, 1), y: 7189000},
                    {x: new Date(2002, 2), y: 7089000},
                    {x: new Date(2002, 3), y: 6989000},
                    {x: new Date(2002, 4), y: 6889000},
                    {x: new Date(2002, 5), y: 6789000},
                    {x: new Date(2002, 6), y: 6689000},
                    {x: new Date(2002, 7), y: 6589000},
                    {x: new Date(2002, 8), y: 6489000},
                    {x: new Date(2002, 9), y: 6389000},
                    {x: new Date(2002, 10), y: 6289000},
                    {x: new Date(2002, 11), y: 6189000},
                    {x: new Date(2002, 12), y: 6089000},
                    {x: new Date(2003, 1), y: 5989000},
                    {x: new Date(2003, 2), y: 5889000},
                    {x: new Date(2003, 3), y: 5789000},
                    {x: new Date(2003, 4), y: 5689000},
                    {x: new Date(2003, 5), y: 5589000},
                    {x: new Date(2003, 6), y: 5489000},
                    {x: new Date(2003, 7), y: 5389000},
                    {x: new Date(2003, 8), y: 5289000},
                    {x: new Date(2003, 9), y: 5189000},
                    {x: new Date(2003, 10), y: 5089000},
                    {x: new Date(2003, 11), y: 4989000},
                    {x: new Date(2003, 12), y: 4889000},
                    {x: new Date(2004, 1), y: 4789000},
                    {x: new Date(2004, 2), y: 4989000},
                    {x: new Date(2004, 3), y: 4989000},
                    {x: new Date(2004, 4), y: 4989000},
                    {x: new Date(2004, 5), y: 4989000},
                    {x: new Date(2004, 6), y: 4989000},
                    {x: new Date(2004, 7), y: 4989000},
                    {x: new Date(2004, 8), y: 4989000},
                    {x: new Date(2004, 9), y: 7289000},
                    {x: new Date(2004, 10), y: 4830000},
                    {x: new Date(2004, 11), y: 2009000},
                    {x: new Date(2004, 12), y: 2840000},
                    {x: new Date(2005, 1), y: 2506000},
                    {x: new Date(2005, 2), y: 2798000},
                    {x: new Date(2005, 3), y: 3386000},
                    {x: new Date(2005, 4), y: 6944000},
                    {x: new Date(2005, 5), y: 6026000},
                    {x: new Date(2005, 6), y: 2394000},
                    {x: new Date(2005, 7), y: 1872000},
                    {x: new Date(2005, 8), y: 2140000},
                    {x: new Date(2005, 9), y: 7289000},
                    {x: new Date(2005, 10), y: 4830000},
                    {x: new Date(2005, 11), y: 2009000},
                    {x: new Date(2005, 12), y: 2840000},
                    {x: new Date(2006, 1), y: 2506000},
                    {x: new Date(2006, 2), y: 2798000},
                    {x: new Date(2006, 3), y: 3386000},
                    {x: new Date(2006, 4), y: 6944000},
                    {x: new Date(2006, 5), y: 6026000},
                    {x: new Date(2006, 6), y: 2394000},
                    {x: new Date(2006, 7), y: 1872000},
                    {x: new Date(2006, 8), y: 2140000},
                    {x: new Date(2006, 9), y: 7289000},
                    {x: new Date(2006, 10), y: 4830000},
                    {x: new Date(2006, 11), y: 2009000},
                    {x: new Date(2006, 12), y: 2840000}
                ]
            },
            {
                yValueFormatString: "#,### Units",
                xValueFormatString: "YYYY",
                type: "spline",
                showInLegend: true,
                name: "Average Market Price for " + vehicle,
                lineColor: "#082dfc",
                color: "#082dfc",
                highlightEnabled: false,
                toolTipContent: null,
                dataPoints: [
                    {x: new Date(2002, 0), y: 2506000},
                    {x: new Date(2002, 1), y: 2506000},
                    {x: new Date(2002, 2), y: 2798000},
                    {x: new Date(2002, 3), y: 3386000},
                    {x: new Date(2002, 4), y: 6944000},
                    {x: new Date(2002, 5), y: 6026000},
                    {x: new Date(2002, 6), y: 2394000},
                    {x: new Date(2002, 7), y: 1872000},
                    {x: new Date(2002, 8), y: 2140000},
                    {x: new Date(2002, 9), y: 7289000},
                    {x: new Date(2002, 10), y: 4830000},
                    {x: new Date(2002, 11), y: 2009000},
                    {x: new Date(2002, 12), y: 2840000},
                    {x: new Date(2003, 1), y: 2506000},
                    {x: new Date(2003, 2), y: 2798000},
                    {x: new Date(2003, 3), y: 3386000},
                    {x: new Date(2003, 4), y: 6944000},
                    {x: new Date(2003, 5), y: 6026000},
                    {x: new Date(2003, 6), y: 2394000},
                    {x: new Date(2003, 7), y: 1872000},
                    {x: new Date(2003, 8), y: 2140000},
                    {x: new Date(2003, 9), y: 7289000},
                    {x: new Date(2003, 10), y: 4830000},
                    {x: new Date(2003, 11), y: 2009000},
                    {x: new Date(2003, 12), y: 2840000},
                    {x: new Date(2004, 1), y: 2506000},
                    {x: new Date(2004, 2), y: 2798000},
                    {x: new Date(2004, 3), y: 3386000},
                    {x: new Date(2004, 4), y: 6944000},
                    {x: new Date(2004, 5), y: 6026000},
                    {x: new Date(2004, 6), y: 2394000},
                    {x: new Date(2004, 7), y: 1872000},
                    {x: new Date(2004, 8), y: 2140000},
                    {x: new Date(2004, 9), y: 7289000},
                    {x: new Date(2004, 10), y: 4830000},
                    {x: new Date(2004, 11), y: 2009000},
                    {x: new Date(2004, 12), y: 2840000},
                    {x: new Date(2005, 1), y: 2506000},
                    {x: new Date(2005, 2), y: 2798000},
                    {x: new Date(2005, 3), y: 3386000},
                    {x: new Date(2005, 4), y: 6944000},
                    {x: new Date(2005, 5), y: 6026000},
                    {x: new Date(2005, 6), y: 2394000},
                    {x: new Date(2005, 7), y: 1872000},
                    {x: new Date(2005, 8), y: 2140000},
                    {x: new Date(2005, 9), y: 7289000},
                    {x: new Date(2005, 10), y: 4830000},
                    {x: new Date(2005, 11), y: 2009000},
                    {x: new Date(2005, 12), y: 2840000},
                    {x: new Date(2006, 1), y: 2506000},
                    {x: new Date(2006, 2), y: 2798000},
                    {x: new Date(2006, 3), y: 3386000},
                    {x: new Date(2006, 4), y: 6944000},
                    {x: new Date(2006, 5), y: 6026000},
                    {x: new Date(2006, 6), y: 2394000},
                    {x: new Date(2006, 7), y: 1872000},
                    {x: new Date(2006, 8), y: 2140000},
                    {x: new Date(2006, 9), y: 7289000},
                    {x: new Date(2006, 10), y: 4830000},
                    {x: new Date(2006, 11), y: 2009000},
                    {x: new Date(2006, 12), y: 2840000}
                ]
            }]
        });

        chart.render();

    });
    
});
