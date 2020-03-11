// Copyright (c) VinAudit.com, Inc. All Right Reserved.
// Please contact VinAudit.com for licensing details.

/**************************************************************
Script Usage:
   <script src="//www.vinaudit.com/widgets/marketvalue.js"></script>
   <script>
      VinAudit.MarketValueWidget.insertHtml();
      VinAudit.MarketValueWidget.render({'key': 'VA_DEMO_KEY', 'vin':'999', 'price': 25000});
   </script>
**************************************************************/



var VinAudit = VinAudit || {};

VinAudit.dom = VinAudit.dom || new function() {
  this.loadedFiles = {};
  
  this.loadCss = function(url) {
    var element = document.createElement('link');
    element.setAttribute('rel', 'stylesheet');
    element.setAttribute('href', url);
    document.getElementsByTagName('head')[0].appendChild(element);
  };
  
  this.loadJs = function(url) {
    if (!this.loadedFiles[url]) {
      this.loadedFiles[url] = true;
      var element = document.createElement('script');
      element.setAttribute('src', url);
      document.getElementsByTagName('head')[0].appendChild(element);
    }
  };
  
  this.get = function(id) {
    return document.getElementById(id);
  }
  
  this.fill = function(id, html) {
    var element = this.get(id);
    if (element) {
      element.innerHTML = html;
    } else if (window.console) {
      window.console.log('missing elem: ' + id);
    }
  }
  
  this.hide = function(id) {
    var element = this.get(id);
    if (element) {
      element.style.display = 'none';
    } else if (window.console) {
      window.console.log('missing elem: ' + id);
    }
  }
  
  this.show = function(id) {
    var element = this.get(id);
    element.style.display = '';
  }
  
  this.fadeIn = function(id, startDelay, fadeDelay, displayStyle) {
    var elem = this.get(id);
    if (!elem) return;
    if (startDelay > 0) {
      setTimeout(function() {
        VinAudit.dom.fadeIn(id, 0, fadeDelay, displayStyle);
      }, startDelay);
    } else {
      elem.style.opacity = 0;
      elem.style.filter = "alpha(opacity=0)";
      elem.style.display = displayStyle || "inline-block";
      elem.style.visibility = "visible";
      if (fadeDelay) {
        var opacity = 0;
        var timer = setInterval(function() {
          opacity += 50 / fadeDelay;
          if (opacity >= 1) {
            clearInterval(timer);
            opacity = 1;
          }
          elem.style.opacity = opacity;
          elem.style.filter = "alpha(opacity=" + opacity * 100 + ")";
        }, 50 );
      } else {
        elem.style.opacity = 1;
        elem.style.filter = "alpha(opacity=1)";
      }
    }
  }
  
  this.selectAddOption = function(select, value, text) {
    var option = document.createElement('option');
    option.value = value;
    option.innerHTML = text;
    select.appendChild(option);
  }
  
  this.selectValue = function(selectId, value) {
    var select = document.getElementById(selectId);
    for (var i = 0; i < select.options.length; i++) {
      if (select.options[i].value == value) {
        select.selectedIndex = i;
        return;
      }
    }
  }
};

VinAudit.utils = VinAudit.utils || new function() {
  var VA = VinAudit;
  var MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var CURRENCY_PREFIX = '$';
  var MILEAGE_UNIT = '';
  var MILEAGE_UNIT_SHORT = 'mi';

  this.setMileageUnit = function(mileageUnit, mileageUnitShort) {
    MILEAGE_UNIT = mileageUnit;
    MILEAGE_UNIT_SHORT = mileageUnitShort;
  }

  this.setCurrencyPrefix = function(currencyPrefix) {
    CURRENCY_PREFIX = currencyPrefix;
  }
  
  this.getMileageUnit = function() {
    return MILEAGE_UNIT;
  }
  
  this.getMileageUnitShort = function() {
    return MILEAGE_UNIT_SHORT;
  }
  
  this.convertMileageOutput = function(miles) {
    return (MILEAGE_UNIT == 'kilometers') ? Math.round(miles * 1.609344) : miles;
  }
  
  this.convertMileageInput = function(value) {
    return (MILEAGE_UNIT == 'kilometers') ? Math.round(value / 1.609344) : value;
  }

  this.formatDate = function(date) {
    var year = date.substring(0,4);
		var month = date.substring(5,7);
    var day = date.substring(8,10);
		return MONTHS[parseInt(month) - 1] + ' ' + day + ', ' + year;
  }

  this.formatCents = function(num) {
    return num ? CURRENCY_PREFIX + num.toFixed(2) : num;
  }

  this.formatPrice = function(num, defaultText) {
    if (defaultText && !num) {
      return defaultText;
    }
    var num = VA.utils.formatNumber(num);
    return num ? CURRENCY_PREFIX + num : num;
  }
  
  this.formatNumber = function(num) {
    var num = parseInt(num);
    if (isNaN(num)) {
      return null;
    } else {
      return (num + '').replace(/(\d)(?=(\d{3})$)/g, "$1,").toString();
    }
  }

  this.computePrices = function(mean, stdev) {
    var prices = [];
    for (i = 0; i <= 100; i++) {
      var price = this.formatPrice(mean + stdev * (i - 50) / 25);
      prices.push(price || 'No data');
    }
    return prices;
  }

	this.normalCdf = function(mean, sigma, to) {
    var z = (to-mean)/Math.sqrt(2*sigma*sigma);
    var t = 1/(1+0.3275911*Math.abs(z));
    var a1 =  0.254829592;
    var a2 = -0.284496736;
    var a3 =  1.421413741;
    var a4 = -1.453152027;
    var a5 =  1.061405429;
    var erf = 1-(((((a5*t + a4)*t) + a3)*t + a2)*t + a1)*t*Math.exp(-z*z);
    var sign = 1;
    if (z < 0) {
      sign = -1;
    }
    return (1/2)*(1+sign*erf);
  }

  this.getUrlParam = function(field) {
		var urlParts = window.location.search.substring(1).split('&');
		for (var i = 0; i < urlParts.length; i++) {
			var param = urlParts[i].split('=');
			if (param[0] == field) {
				return param[1];
			}
		}
	}
};
VinAudit.MarketValueWidget = new function() {
	var VA = VinAudit;
  var key = 'VA_DEMO_KEY';
  var vin = null;
  var year = null;
  var make = null;
  var model = null;
  var trim = null;
  var price = null;
  var period = 182; // 6 months
  var mileage = null; 
  var myLineChart = null;
  var country = null;
  
  this.getHtml = function() {
    return '<div class="va_mv_wrapper"><div id="va_mv_graph">' +
        '<canvas id="va_mv_canvas" width="600" height="300"></canvas>' +
        '<div id="va_mv_overlay"><div id="va_mv_title" class="va_mv_title" style="display: none"><div id="va_mv_title_text" style="font-size:18px; font-weight: bold; margin-bottom:17px;"></div><div id="va_mv_centerlabel" class="va_mv_label"><p style="padding:0 6px"><b>Market Average</b><br><span id="va_mv_average_text"></span></p></div></div></div>' +
        '<div id="va_mv_leftlabel" class="va_mv_label"><p style="padding:0 6px"><b>Below Market</b><br><span id="va_mv_leftlabel_text"></span></p></div>' +
        '<div id="va_mv_rightlabel" class="va_mv_label"><p style="padding:0 6px"><b>Above Market</b><br><span id="va_mv_rightlabel_text"></span></p></div>' +
      '</div></div>'
  }
  
  this.render = function(options) {
    if (!window.Chart || !window.Chart.types || !window.Chart.types.Line) {  // "Chart" not loaded yet? Retry...
      setTimeout(function() {
        VinAudit.MarketValueWidget.render(options);
      }, 250);
      return;
    }
    vin = options.vin || '';
    year = options.year || '';
    make = options.make || '';
    model = options.model || '';
    trim = options.trim || '';
    price = options.price || "0";
    period = options.period || 182;
    mileage = options.mileage || null;
    key = options.key || 'VA_DEMO_KEY';
    country = options.country || 'USA';
    if (country == 'CAN') {
      VinAudit.utils.setCurrencyPrefix('C$');
      VA.utils.setMileageUnit('kilometers', 'km');
    }
    
    reloadWidget(true);
  };
  
  this.reRender = function(options) {
    var oldVin = vin;
    var oldYear = year;
    var oldMake = make;
    var oldModel = model;
    var oldTrim = trim;
    vin = options.vin || vin;
    year = options.year || year;
    make = options.make || make;
    model = options.model || model;
    trim = options.trim || trim;
    price = options.price || "0";
    mileage = options.mileage || mileage;
    reloadWidget(oldVin != vin || oldYear != year || oldMake != make || oldModel != model || oldTrim != trim);
  }
  
  this.destroy = function() {
    if (myLineChart) {
      myLineChart.destroy();
      myLineChart = null;
    }
  }
  
  var reloadWidget = function(newVin) {
    var dataUrl = '';
    if (vin != '') {
      // dataUrl = '//marketvalue.vinaudit.com/getmarketvalue.php?key='+encodeURIComponent(key)+'&vin='+encodeURIComponent(vin)+'&period='+encodeURIComponent(period)+'&mileage='+encodeURIComponent(mileage)+'&country='+country;
      dataUrl = 'new_getmarketvalue.php?key='+encodeURIComponent(key)+'&vin='+encodeURIComponent(vin)+'&period='+encodeURIComponent(period)+'&mileage='+encodeURIComponent(mileage)+'&country='+country+'&status=overview';
      
    } else {
      // dataUrl = '//marketvalue.vinaudit.com/getmarketvalue.php?key='+encodeURIComponent(key)+'&year='+encodeURIComponent(year)+'&make='+encodeURIComponent(make)+'&model='+encodeURIComponent(model)+'&trim='+encodeURIComponent(trim)+'&period='+encodeURIComponent(period)+'&mileage='+encodeURIComponent(mileage)+'&country='+country;
      dataUrl = 'new_getmarketvalue.php?key='+encodeURIComponent(key)+'&year='+encodeURIComponent(year)+'&make='+encodeURIComponent(make)+'&model='+encodeURIComponent(model)+'&trim='+encodeURIComponent(trim)+'&period='+encodeURIComponent(period)+'&mileage='+encodeURIComponent(mileage)+'&country='+country+'&status=overview';
    }
    hideGraphElements(newVin);
    getJson(dataUrl, onJsonReady);
  };
  
  var hideGraphElements = function(newVin) {
    if (newVin) {
      VA.dom.hide('va_mv_title');
    }
    VA.dom.hide('va_mv_centerlabel');
    VA.dom.hide('va_mv_leftlabel');
    VA.dom.hide('va_mv_rightlabel');
    VA.dom.hide('va_mv_statement');
    VinAudit.MarketValueWidget.destroy();
  };
  
  var fadeInGraphElements = function() {
    VA.dom.fadeIn('va_mv_title', 0, 0);
    VA.dom.fadeIn('va_mv_centerlabel', 1000, 200);
    VA.dom.fadeIn('va_mv_leftlabel', 1000, 700);
    VA.dom.fadeIn('va_mv_rightlabel', 1000, 1200);
    VA.dom.fadeIn('va_mv_statement', 1000, 1200, 'block');
  };
  
  var getJson = function(path, success, error) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 200) {
          window.console.log(xhr.responseText);
          if (success) success(JSON.parse(xhr.responseText));
        } else {
          if (error) error(xhr);
        }
      }
    };
    xhr.open("GET", path, true);
    xhr.send();
  };
  
  var onJsonReady = function(json) {
    window.console.log(json);
    var vehicle = json.vehicle && json.vehicle.trim() || vin;
    var mean = json.mean;
    var stdev = json.stdev;
    var periodStart = json.period ? VA.utils.formatDate(json.period[0]) : null;
    var periodEnd = json.period ? VA.utils.formatDate(json.period[1]) : null;
    var count = json.count || 0;
    VA.dom.fill('similar_vehicle_count', count);
    var currentMileage = json.mileage;

    var prices = VA.utils.computePrices(mean, stdev);
    var below = VA.utils.formatPrice(mean - stdev);
    var above = VA.utils.formatPrice(mean + stdev);
    var valuePoint;
    
    if (!json.success && json.error == 'rate_limited') {
      VA.dom.fill('va_mv_title_text', '<span style="color:red">Demo expired. Please contact support@vinaudit.com for licensing.</span>' );
    } else {
      VA.dom.fill('va_mv_vehicle1_text', vehicle);
    }
    
    VA.dom.fill('va_mv_certainty_text', json.certainty ? json.certainty + '%' : '0%');
    VA.dom.fill('va_mv_average_text', VA.utils.formatPrice(mean) || 'Unknown');
    VA.dom.fill('va_mv_leftlabel_text', below ? (below + ' or less') : 'Unknown');
    VA.dom.fill('va_mv_rightlabel_text', above ? (above + ' or more') : 'Unknown');
    VA.dom.fill('va_mv_marketvalue_text', below && above ? (below + ' - ' + above) : 'Unknown');
    
    initMileageSelect(currentMileage, price);
    initLinkSelect('va_mv_timeperiod', 'va_mv_timeperiod_select');
    initLinkSelect('va_mv_location_text', 'va_mv_location_text_dd');
    
    var ctx = VA.dom.get('va_mv_canvas').getContext("2d");
    var bgRainbow = new ColourGradient('0B3259', 'A0D9FF');
    var hiRainbow = new ColourGradient('37510C', 'D0EB97');
    var bgGradient = ctx.createLinearGradient(5, 0, 595, 0);
    bgGradient.addColorStop(0, 'rgba('+bgRainbow.rgbAt(0)+',1)');
    bgGradient.addColorStop(1, 'rgba('+bgRainbow.rgbAt(100)+',1)');
    
    var data = {
      labels: prices,
      datasets: [{
        label: "",
        fillColor: bgGradient,
        strokeColor: "rgba(11,50,89,1)",
        pointColor: "rgba(0,0,0,0)",
        pointStrokeColor: "rgba(0,0,0,0)",
        pointHighlightFill: "rgba(220,220,220,1)",
        pointHighlightStroke: "rgba(0,0,0,1)",
        pointHitDetectionRadius: 1,
        data: [0.60,2.38,4.26,6.26,8.36,10.58,12.91,15.35,17.91,20.58,23.37,26.26,29.27,32.37,35.58,38.89,42.29,45.77,49.34,52.97,56.67,60.43,64.23,68.06,71.92,75.79,79.66,83.51,87.35,91.14,94.88,98.55,102.14,105.64,109.02,112.29,115.42,118.40,121.21,123.85,126.31,128.56,130.61,132.44,134.05,135.42,136.55,137.43,138.07,138.45,138.58,138.45,138.07,137.43,136.55,135.42,134.05,132.44,130.61,128.56,126.31,123.85,121.21,118.40,115.42,112.29,109.02,105.64,102.14,98.55,94.88,91.14,87.35,83.51,79.66,75.79,71.92,68.06,64.23,60.43,56.67,52.97,49.34,45.77,42.29,38.89,35.58,32.37,29.27,26.26,23.37,20.58,17.91,15.35,12.91,10.58,8.36,6.26,4.26,2.38,0.60]}]
      };
      
    Chart.types.Line.extend({
      name: "CustomLine",
      initialize: function(data) {
        var arrayValue = data.labels;
        if (Math.abs(arrayValue[1].replace(/[^0-9\.]+/g, "")) > Math.abs(price.replace(/[^0-9\.]+/g, "")) || Math.abs(price.replace(/[^0-9\.]+/g, "")) > Math.abs(arrayValue[99].replace(/[^0-9\.]+/g, ""))) {
          Chart.helpers.bindEvents(this, ['mouseover', 'mousemove', 'mouseout'], function(evt){
            this.restoreLastActivePoint();
            var activePoints = (evt.type !== 'mouseout') ? this.getPointsAtEvent(evt) : [];
            var activePoint = null;
            if (activePoints.length > 0) {
              var activePoint = activePoints[Math.floor(activePoints.length/2)];
              if (activePoint === this.lastActivePoint) {
                return; // nothing changed.
              }
              if (activePoint) {
                this.lastActivePoint = activePoint;
                this.lastActivePoint.saveFillColor = activePoint.fillColor;
                this.lastActivePoint.saveStrokeColor = activePoint.strokeColor;
                activePoint.fillColor = activePoint.highlightFill;
                activePoint.strokeColor = activePoint.highlightStroke;
              }
            }
            if (activePoint) {
              setTooltipConfiguration(activePoint);
            } else {
              this.restorePreHoverChartState();
            }
          });
      }
        Chart.types.Line.prototype.initialize.apply(this, arguments);
      },
      restoreLastActivePoint: function() {
        if (this.lastActivePoint) {
          this.lastActivePoint.fillColor = this.lastActivePoint.saveFillColor;
          this.lastActivePoint.strokeColor = this.lastActivePoint.saveStrokeColor;
        }
      },
      restorePreHoverChartState: function() {
        myLineChart.datasets[0].fillColor = bgGradient;
        myLineChart.update();
        VA.dom.fill("va_mv_summary", "Estimates based on <b>"+count+" similar vehicles sold</b>" + (periodStart && periodEnd ? (" between "+periodStart+" - "+periodEnd) : ''));
      }
    });
    
    var options = {
      animation: true,
      scaleOverride: true,
      scaleSteps: 1,
      scaleStepWidth: 200,
      scaleStartValue: 0,
      pointDot: true,
      showTooltips: false,
      bezierCurveTension: 0.3,
      showScale: false,
      tooltipFillColor: "rgba(0,0,0,.75)",
      tooltipFontColor: "rgba(255,255,255,1)",
      tooltipFontSize: 12,
      tooltipFontStyle: "bold",
      tooltipTemplate: "<%=label%>",
      onAnimationComplete: function() {
        // hack: disable animation after loading; interferes with tooltips
        this.options.animation = false;
        if (Math.abs(price.replace(/[^0-9\.]+/g, "")) > 0) {
          var arrayValue = data.labels;
          if (Math.abs(arrayValue[1].replace(/[^0-9\.]+/g, "")) <= Math.abs(price.replace(/[^0-9\.]+/g, "")) && Math.abs(price.replace(/[^0-9\.]+/g, "")) <= Math.abs(arrayValue[99].replace(/[^0-9\.]+/g, ""))) {
            var currentPoint = getPoint(price.replace(/[^0-9\.]+/g, ""), arrayValue);
            myLineChart.datasets[0].points[currentPoint[0]].fillColor = "rgba(220,220,220,1)";
            myLineChart.datasets[0].points[currentPoint[0]].strokeColor = "rgba(0,0,0,.5)";
            myLineChart.eachPoints(function(point) {
              if (point.label.replace(/[^0-9\.]+/g, "") == currentPoint[1].replace(/[^0-9\.]+/g, "") ) {
                point.label =  VA.utils.formatPrice(price);
                valuePoint = point;
              }
            });
            setTimeout(function() {
              setTooltipConfiguration(valuePoint);
            }, 0);
          }
        }
      }
    };
    
    Chart.Tooltip = Chart.Element.extend({
      draw : function(){
        var ctx = this.chart.ctx;
        this.xAlign = "center";
        var arrayValue = data.labels;
        if (Math.abs(arrayValue[1].replace(/[^0-9\.]+/g, "")) <= Math.abs(price.replace(/[^0-9\.]+/g, "")) && Math.abs(price.replace(/[^0-9\.]+/g, "")) <= Math.abs(arrayValue[99].replace(/[^0-9\.]+/g, ""))) {
          this.yAlign = "below"; 
        } else {
          this.yAlign = "above"; 
        }
        //Distance between the actual element.y position and the start of the tooltip caret
        var caretPadding = this.caretPadding = 2;

        var tooltipWidth = ctx.measureText(this.text).width + 2*this.xPadding,
          tooltipRectHeight = this.fontSize + 2*this.yPadding,
          tooltipHeight = tooltipRectHeight + this.caretHeight + caretPadding;

        if (this.x + tooltipWidth/2 >this.chart.width){
          this.xAlign = "left";
        } else if (this.x - tooltipWidth/2 < 0){
          this.xAlign = "right";
        }

        if (this.y - tooltipHeight < 0){
          this.yAlign = "below";
        }
        
        // added to show tooltip above in case of points near to bottom of the chart
         if (this.y + tooltipHeight > this.chart.canvas.height - 10) {
          this.yAlign = "above";
        } 

        var tooltipX = this.x - tooltipWidth/2,
          tooltipY = this.y - tooltipHeight;

        ctx.fillStyle = this.fillColor;
        
        switch(this.yAlign)
        {
          case "above":
            //Draw a caret above the x/y
            ctx.beginPath();
            ctx.moveTo(this.x,this.y - caretPadding);
            ctx.lineTo(this.x + this.caretHeight, this.y - (caretPadding + this.caretHeight));
            ctx.lineTo(this.x - this.caretHeight, this.y - (caretPadding + this.caretHeight));
            ctx.closePath();
            ctx.fill();
            break;
          case "below":
            tooltipY = this.y + caretPadding + this.caretHeight;
            //Draw a caret below the x/y
            ctx.beginPath();
            ctx.moveTo(this.x, this.y + caretPadding);
            ctx.lineTo(this.x + this.caretHeight, this.y + caretPadding + this.caretHeight);
            ctx.lineTo(this.x - this.caretHeight, this.y + caretPadding + this.caretHeight);
            ctx.closePath();
            ctx.fill();
            break;
        }

        switch(this.xAlign)
        {
        case "left":
          tooltipX = this.x - tooltipWidth + (this.cornerRadius + this.caretHeight);
          break;
        case "right":
          tooltipX = this.x - (this.cornerRadius + this.caretHeight);
          break;
        }

        Chart.helpers.drawRoundedRectangle(ctx,tooltipX,tooltipY,tooltipWidth,tooltipRectHeight,this.cornerRadius);

        ctx.fill();

        ctx.fillStyle = this.textColor;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(this.text, tooltipX + tooltipWidth/2, tooltipY + tooltipRectHeight/2);
      }
    });  
    
    var getPoint = function(num, arr) {
      var curr = arr[0].replace(/[^0-9\.]+/g, "");
      var diff = Math.abs (num - curr);
      var pointValue = new Array(2);
      for (var val = 0; val < arr.length; val++) {
        campValue = arr[val].replace(/[^0-9\.]+/g, "");
        var newdiff = Math.abs (num - campValue);
        if (newdiff <= diff) {
          diff = newdiff;
          pointValue[0] = val;
          pointValue[1] = campValue; 
        }
      }
      return pointValue;
    }
    
    myLineChart = new Chart(ctx).CustomLine(data, options);
    myLineChart.restorePreHoverChartState();
    
    for (var pointIndex = 25; pointIndex <= 75; pointIndex += 25) {
      myLineChart.datasets[0].points[pointIndex].fillColor = "rgba(0,0,0,1)";
      myLineChart.datasets[0].points[pointIndex].strokeColor = "rgba(0,0,0,0.5)";
    }
    fadeInGraphElements();
    
    var setTooltipConfiguration = function(activePoint) {
      if (activePoint) {
        var bgGradient = ctx.createLinearGradient(5, 0, 600-5, 0);
        bgGradient.addColorStop(0, 'rgba('+hiRainbow.rgbAt(0)+',1)');
        bgGradient.addColorStop((activePoint.x-3)/590, 'rgba('+hiRainbow.rgbAt(100*activePoint.x/600)+', 1)');
        bgGradient.addColorStop((activePoint.x-3)/590, 'rgba('+bgRainbow.rgbAt(100*activePoint.x/600)+', 0.85)');
        bgGradient.addColorStop(1, 'rgba('+bgRainbow.rgbAt(100)+',0.85)');
        myLineChart.datasets[0].fillColor = bgGradient;
        myLineChart.showTooltip([activePoint]);
        
        var showPrice = activePoint.label.replace('C$', '').replace('$', '').replace(',', '');
        if (mean > 0 && stdev > 0) {
          var cdfPercent = (100*VA.utils.normalCdf(mean, stdev, showPrice)).toFixed(0);
          if (cdfPercent <= 50) {
            VA.dom.fill("va_mv_summary", "An estimated <b>"+cdfPercent+"%</b> of similar vehicles sold for <b>less than "+activePoint.label+"</b>" + (periodStart && periodEnd ? (" between "+periodStart+" - "+periodEnd) : ''));
          } else {
            VA.dom.fill("va_mv_summary", "An estimated <b>"+(100-cdfPercent)+"%</b> of similar vehicles sold for <b>more than "+activePoint.label+"</b>" + (periodStart && periodEnd ? (" between "+periodStart+" - "+periodEnd) : ''));
          }
        }
      }
    }
  };

  var initMileageSelect = function(currentMileage, price) {
    currentMileage = VinAudit.utils.convertMileageOutput(currentMileage);
	VA.dom.fill('va_mv_mileage_text', (currentMileage ? VA.utils.formatNumber(currentMileage) + ' ' + VA.utils.getMileageUnit() : 'Unknown'));
    VA.dom.show('va_mv_mileage_text');
    
    if (mileage == null) {
      VA.dom.show('va_mv_mileage_avg_text');
    } else {
      VA.dom.hide('va_mv_mileage_avg_text');
    }
    
    var mileageSelect = VA.dom.get('va_mv_mileage_text_dd');
    mileageSelect.innerHTML = '';
    var lastValue = -1;
    var maxI = 200;
    for (var i = 0; i <= maxI;) {
      var value = i*1000;
      VA.dom.selectAddOption(mileageSelect, value, VA.utils.formatNumber(value) + ' ' + VA.utils.getMileageUnit());
      i += 25;
      if (currentMileage > value && (currentMileage < i*1000 || i > maxI)) {
        VA.dom.selectAddOption(mileageSelect, currentMileage, VA.utils.formatNumber(currentMileage) + ' ' + VA.utils.getMileageUnit());
      }
    }
    VA.dom.selectAddOption(mileageSelect, 'input', 'Input...');
    
    VA.dom.get('va_mv_mileage_text').onclick = function() {
      VA.dom.hide('va_mv_mileage_text');
      VA.dom.show('va_mv_mileage_text_dd');
      VA.dom.hide('va_mv_mileage_avg_text');
      VA.dom.selectValue('va_mv_mileage_text_dd', currentMileage);
    };
    
    mileageSelect.onchange = function() {
      if (mileageSelect.style.display == '') {
        var mileage = VA.dom.get('va_mv_mileage_text_dd').value;
        if (mileage == 'input') {
          mileage = prompt('Current mileage:', currentMileage);
          if (mileage !== null) {
            mileage = parseInt(mileage);
            if (isNaN(mileage) || mileage < 0 || mileage > 1000000) {
              mileage = null;
            }
          }
          if (mileage === null) {
            VA.dom.selectValue('va_mv_mileage_text_dd', currentMileage);
            return;
          }
        }
        VinAudit.MarketValueWidget.reRender({
          'mileage': VinAudit.utils.convertMileageInput(mileage),
          'price' : price
        });
        VA.dom.hide('va_mv_mileage_text_dd');
        VA.dom.show('va_mv_mileage_text');
      }
    };
    mileageSelect.onblur = function() {
      mileageSelect.onchange();
    };
    
    VA.dom.show('va_mv_mileage_content');
  };
  
  var initLinkSelect = function(linkId, selectId) {
    VA.dom.get(linkId).onclick = function() {
      VA.dom.get(linkId).style.display = 'none';
      VA.dom.get(selectId).style.display = '';
    };
    var clickNum = 0;
    VA.dom.get(selectId).onclick = function() {
      clickNum++;
      if (clickNum == 2) {
        // alert (2);
        var selectElem = VA.dom.get(selectId);
        var periodDays = selectElem.value;
        var periodText = selectElem.options[selectElem.selectedIndex].text;
        VA.dom.fill(linkId, periodText);
        VA.dom.get(selectId).style.display = 'none';
        VA.dom.get(linkId).style.display = '';
        clickNum = 0;
        period = periodDays;
        // reloadWidget();
      }
    };
  };
  
  var ColourGradient = function(colourStart, colourEnd) {
    this.startColour = colourStart;
    this.endColour = colourEnd;
    this.rgbAt = function (number) {
      var hex = this.colourAt(number);
      var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return parseInt(result[1], 16) + ',' + parseInt(result[2], 16) + ',' + parseInt(result[3], 16);
    }
    this.colourAt = function (number) {
      return this.calcHex(number, this.startColour.substring(0,2), this.endColour.substring(0,2)) 
        + this.calcHex(number, this.startColour.substring(2,4), this.endColour.substring(2,4)) 
        + this.calcHex(number, this.startColour.substring(4,6), this.endColour.substring(4,6));
    }
    this.calcHex = function(number, channelStart_Base16, channelEnd_Base16) {
      var minNum = 0; var maxNum = 100;
      var num = number;
      if (num < minNum) num = minNum;
      if (num > maxNum) num = maxNum;
      var numRange = maxNum - minNum;
      var cStart_Base10 = parseInt(channelStart_Base16, 16);
      var cEnd_Base10 = parseInt(channelEnd_Base16, 16); 
      var cPerUnit = (cEnd_Base10 - cStart_Base10)/numRange;
      var c_Base10 = Math.round(cPerUnit * (num - minNum) + cStart_Base10);
      var hex = c_Base10.toString(16);
      return (hex.length === 1) ? ('0' + hex) : hex;
    }
  }
};

// Load css + js dependencies.
VinAudit.dom.loadCss('//fonts.googleapis.com/css?family=Open+Sans');
// VinAudit.dom.loadCss('//www.vinaudit.com/widgets/marketvalue/styles.css');
VinAudit.dom.loadCss('styles.css');
VinAudit.dom.loadJs('//www.vinaudit.com/widgets/libs/chart.js-1.0.2-h_min.js');
