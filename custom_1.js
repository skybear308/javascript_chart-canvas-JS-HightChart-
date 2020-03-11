
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
        console.log(result);
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
            width:500,
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
                    dataPoints: result.scatter
                }
            ]
        });

        chart.render();

        calculateLine(chart);

        function calculateLine(chart) {
            
            chart.addTo("data",{
                type: "line", //Line series showing trend
                markerSize: 0,
                lineThickness: 4,
                highlightEnabled: false,
                toolTipContent: null,
                dataPoints: [result.spline['start_point'], result.spline['end_point']]
            });

        }

    });
    
});
