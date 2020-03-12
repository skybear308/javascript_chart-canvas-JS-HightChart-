<?php
# include necessary classes
require_once('lib/sales_new.php');
require_once('lib/outputFormat.php');

# config
date_default_timezone_set('America/Los_Angeles'); 
header('Access-Control-Allow-Origin: *');
header('X-Robots-Tag: none'); // block Googlebot from excessive crawling 

# extract each values from request
# vin
$vin = $_REQUEST["vin"] ? strtoupper($_REQUEST["vin"]) : false;

# period
$period = $_REQUEST["period"] ? strtolower($_REQUEST["period"]) : 180;

# mileage
// echo $_REQUEST["mileage"]; exit;
// $mileage = $_REQUEST["mileage"] ? preg_replace('/[^\d-.]/', '', $_REQUEST["mileage"]) : '';
$mileage = $_REQUEST["mileage"] ? $_REQUEST["mileage"] : '';
$intMileage = intval($mileage);
$mileage = $mileage == '0' ? 0 : ($intMileage > 0 && $intMileage < 1000000 ? $intMileage : null);

# pastDate
$pastDate = strtotime("-$period days");
$pastDate = date('Y-m-d', $pastDate);

# initialize sale class
$sales = new Sales();
// $squishVin = substr($vin, 0, 8) . substr($vin, 9, 2);


if(isset($_REQUEST["status"]) && $_REQUEST["status"] == 'overview') {
    # overview
    $marketValue = $sales->calculateSalePrices($vin, $mileage, $pastDate);

    echo json_encode($marketValue);

} else if(isset($_REQUEST["status"]) && $_REQUEST["status"] == 'histogram') {
    # histogram
    $marketValue = $sales->calculateHistogram($vin, $pastDate);
    
	echo json_encode($marketValue);

} else if(isset($_REQUEST["status"]) && $_REQUEST["status"] == 'mileage') {
    # mileage
    $marketValue = $sales->calculateMielagePrices($vin, $pastDate);

	echo json_encode($marketValue);

} else if(isset($_REQUEST["status"]) && $_REQUEST["status"] == 'location') {
    # location
    $marketValue = $sales->calculateStatePrices($vin, $mileage, $pastDate);

	echo json_encode($marketValue);

} else if(isset($_REQUEST["status"]) && $_REQUEST["status"] == 'overtime') {
    # historical
    $marketValue = $sales->calculateHistoricalPrices($vin, $mileage, $zipcode);

	echo json_encode($marketValue);

}


?>