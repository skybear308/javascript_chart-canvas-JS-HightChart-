
<?php

class Sales {

    public $server_name;
    public $user_name;
    public $password;
    public $db_name;
    public $state_keys;
    public $state_names;

    public function __construct() {

        # mysql server info (vin_server)
        // $this->server_name = "localhost";
        // $this->user_name = "market";
        // $this->password = "root_password";
        // $this->db_name = "marketvalue";

        # local server
        $this->server_name = 'localhost';
        $this->user_name = 'root';
        $this->password = '';
        $this->db_name = 'marketvalue';
        $this->state_keys = array("AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DC", "DE", "FL", "GA", 
                                    "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", 
                                    "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", 
                                    "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", 
                                    "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
        );
        $this->state_names = array("Alabama","Alaska","Arizona","Arkansas","California","Colorado",
                                    "Connecticut","Washington DC", "Delaware","Florida","Georgia","Hawaii","Idaho","Illinois",
                                    "Indiana","Iowa","Kansas","Kentucky","Louisiana","Maine","Maryland",
                                    "Massachusetts","Michigan","Minnesota","Mississippi","Missouri","Montana",
                                    "Nebraska","Nevada","New Hampshire","New Jersey","New Mexico","New York",
                                    "North Carolina","North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania",
                                    "Rhode Island","South Carolina","South Dakota","Tennessee","Texas","Utah",
                                    "Vermont","Virginia","Washington","West Virginia","Wisconsin","Wyoming"
        );
    
    }

    # https://www.dummies.com/education/math/statistics/how-to-calculate-standard-deviation-in-a-statistical-data-set/
    # This function calculates the standard deviation of price. (measure of variation; 'average' distance from the mean)
    public function calculateStandardDeviation($prices) {

        # step 1. Calculate the average of the prices
        $average = array_sum($prices) / count($prices);
        $sum_square = 0.0;

        foreach ( $prices as $price ) {

            # step 2. Subtract the mean from each price
            $mean = $price - $average;

            # step 3. Square each of the differences
            $square = pow($price - $average, 2);

            # step 4. Add up all of the results from Step 3 to get the sum of squares
            $sum_square += $square;

        }

        # step 5. Divide the sum of squares (found in Step 4) by the number of numbers minus one; that is, (n – 1).
        $n = count($prices);
        $final_variance = $sum_square / ($n - 1);

        # step 6. Take the square root to get the result
        $s = (float) sqrt($final_variance);
        
        return $s;

    }

    # https://www.dummies.com/education/math/statistics/how-to-calculate-percentiles-in-statistics/
    # This function calculates the percentiles of the prices
    public function calculatePercentiles($prices) {
        
        # step 1. Order all the values in the data set from smallest to largest.
        sort($prices);

        # step 2. Multiply k percent by the total number of values, n.
        $n = count($prices);

        $percentiles = array();
        $indexs = array();

        # get price and index for each percentage (0 ~ 100) %
        for ( $i = 0; $i <= 10; $i ++ ) {

            # multiplying (i*10)% times the total number of prices
            
            $index = $i * 10 / 100 * $n;

            if ( $i == 10)
                $index = $index - 1;

            # if index is a whole number
            if (gettype($index) == 'integer') {
                
                # Count the values in your data set from left to right until you reach the number
                if ($i == 10)
                    $percentile = $prices[$index];
                else
                    $percentile = ( $prices[$index] + $prices[$index + 1] ) / 2;

            } else {

                # Rounding up to the nearest whole number
                $index = round($index);

                # Counting from left to right (from the smallest to the largest value in the data set)
                $percentile = $prices[$index];
                
            }

            array_push( $percentiles, $percentile );
            array_push( $indexs, $index );

        }

        # get min price, max price and calculate the count of prices between two percentages

        $mmcs = array(); # array((min, max, count), (min, max, count) ... )

        for ( $i = 0; $i < 10; $i ++ ) {
        
            $mmc = array(); # array(min, max, count)

            # get min price
            $min = $percentiles[$i];
            array_push($mmc, $min);
            
            # get max price
            $max = $percentiles[$i + 1];
            array_push($mmc, $max);

            # calculate the count of prices
            $count = $indexs[$i + 1] - $indexs[$i];
            array_push($mmc, $count);

            array_push($mmcs, $mmc);
        }

        return $mmcs;

    }

    # https://www.dummies.com/education/math/statistics/understanding-formulas-for-common-statistics/
    # This funciton calculates the median of price. (measure of center; not affected by outliers)
    public function calculateMedian($priceData) {

        if (count($priceData) % 2 == 0) {
            #  n even (average of the two middle prices)
        
            $middle = count($priceData) / 2 ; 
            
            $median = ($priceData[$middle - 1] + $priceData[$middle]) / 2;
        
        } else {
            # n odd (middle price of ordered prices)
        
            $middle = round((count($priceData) + 1) / 2);
            
            $median = $priceData[$middle - 1];
        
        }
        
        return $median;
    }

    # This function fetchs ymmt_id, Year, Make, Model, Trim depends on the squishVin.
    public function getYmmtFromDB($squishVin) {

        # create connection
        $conn = new mysqli($this->server_name, $this->user_name, $this->password, $this->db_name);

        # check connection
        if ($conn->connect_error) {
            die("Connection failed: " . $conn->connect_error);
        }
        
        $sql = "SELECT * FROM new_map WHERE vinprefix = '$squishVin'";
        
        $result = $conn->query($sql);

        $ymmt = array();

        # get ymmt_id, Year, Make, Model, Trim depending on the squishVin
        if ( $result->num_rows > 0 ) {

            // output data of each row
            while( $row = $result->fetch_assoc() ) {

                array_push( $ymmt, $row['ymmt_id'], $row['Year'], $row['Make'], $row['Model'], $row['Trim'] );
                
            }
        }

        $conn->close();

        return $ymmt;
    }

    // # real_server
    // public function getDBDirectory() {

    //     # get the directories of source csv files and processed csv files
    //     $path = trim( file_get_contents('/var/marketvalue_2.0/dbconfig.txt') ); 
        
    //     # split path by '\n' into pieces (array).
    //     # paths[0]: directory of source csv files. (default: /var/allcsvfiles/)
    //     # paths[1]: directory of processed csv files. (default: /var/marketvalue_db/)
    //     $paths = explode('\n', $path);

    //     # directory means the the directory of processed csv file.
    //     $directory = $paths[1];

    //     return $directory;
    // }

    # local_server
    public function getDBDirectory() {

        // # get the directories of source csv files and processed csv files
        // $path = trim( file_get_contents('/var/marketvalue_2.0/dbconfig.txt') ); 
        
        // # split path by '\n' into pieces (array).
        // # paths[0]: directory of source csv files. (default: /var/allcsvfiles/)
        // # paths[1]: directory of processed csv files. (default: /var/marketvalue_db/)
        // $paths = explode('\n', $path);

        // # directory means the the directory of processed csv file.
        // $directory = $paths[1];
        $directory = 'D:/Project/BigData/MarketValue/milestone2_2020_2_2/Deliver/source/';

        return $directory;
    }

    public function linearRegression($x, $y) {
        // calculate number points
        $n = count($x);
        // if ($n <= 0) {
        //  return array('price' => 0, 'mileage' => 0);
        // }
        // ensure both arrays of points are the same size
        if ($n != count($y)) {
          trigger_error("linear_regression(): Number of elements in coordinate arrays do not match.", E_USER_ERROR);
        }

        $x_sum = array_sum($x);
        $y_sum = array_sum($y);
        $xx_sum = 0;
        $xy_sum = 0;
        
        for ( $i = 0; $i < $n; $i++ ) {

            $xy_sum += ($x[$i] * $y[$i]);
            
            $xx_sum += ($x[$i] * $x[$i]);

        }

        $averageMarketValue = $x_sum / $n;
        // calculate slope
        if (($n * $xx_sum) - ($x_sum * $x_sum) != 0)
            $m = (($n * $xy_sum) - ($x_sum * $y_sum)) / (($n * $xx_sum) - ($x_sum * $x_sum));
        else
            $m = 0;
        
        if ( $m > 0 ) {
            $m = $averageMarketValue / -275000;
        }

        if ( $m > -0.005 ) {
            $m = -0.005;
        } else if ( $m < -0.1 ) {
            $m = -0.1;
        }

        // calculate intercept
        $b = ($y_sum - ($m * $x_sum)) / $n;
        
        // ensure not below $2,000 @ 250000 miles
        $minM = -(2000 + $b) / 250000;
        
        if ($m < $minM) {

            $m = $minM;
        }

        // calculate new intercept
        $b = ($y_sum - ($m * $x_sum)) / $n;

        return array('price' => $b, 'mileage' => round($m, 5));
    }

    # This function calculates the marketvalue sale prices
    public function calculateSalePrices($vin, $mileage, $pastDate, $zipcode = '') {

        # calculate squishvin (vinprefix) from vin
        $squishVin = substr($vin, 0, 8) . substr($vin, 9, 2);

        # get ymmt depends on the squishVin from mysql database
        # array(ymmt_id, Year, Make, Model, Trim)
        $ymmt = $this->getYmmtFromDB($squishVin);

        # get db driectory from config file
        $directory = $this->getDBDirectory();

        if( !empty($ymmt) ) {
            # if ymmt exist
            
            # Year + Make + Model + Trim (ugly to human readable  ex: 2016 Toyota Camry LE)
            $vehicle = $ymmt[1] . ' ' . $ymmt[2] . ' ' . $ymmt[3] . ' ' . $ymmt[4];

            # unique records (vinprefix, price, mileage, date, zipcode, date, count)
            $unique_records = array();

            # only get price from unique records
            $price_records = array();

            # filtered date
            $filtered_price = array();
            $filtered_mileage = array();
            $filtered_date = array();

            # file to analyze
            $filename = '';

            if ( $zipcode == '' ) {
                # zipcode (state) is not selected

                # ex: /var/marketvalue_db/2016 Toyota Camry LE/__ALL.csv
                $filename = $directory . $ymmt[0] . '/__ALL.csv';

            } else {
                # zipcode (state) is selected

                # ex: /var/marketvalue_db/2016 Toyota Camry LE/LA.csv
                $filename = $directory . $ymmt[0] . '/' . $zipcode . '.csv';
            }

            if ( file_exists($filename) ) {
                # file exists

                $record = array();
                $file = fopen($filename, 'r');

                while ( !feof($file) ) {

                    # 0 : vinprefix, 1 : price, 2 : mileage, 3 : date, 4 : state, 5 : zipcode, 6 : count 
                    $record = fgetcsv($file);

                    if ( $record[1] != '' && $record[2] != '' && $record[1] != 0 && $record[2] != 0 && $record[3] >= $pastDate ) {

                        $unique_records[] = $record;

                    }
                }

                fclose($file);

                # only get price record from unique records
                foreach ( $unique_records as $row ) {
                    
                    $price_records[] = $row[1];

                }

                if ( count($price_records) > 0 ) {

                    sort($price_records);

                    # calculate the median of prices
                    $median = $this->calculateMedian($price_records);

                    # calculate the lower and higher prices
                    $lower_median = 0.5 * $median;
                    $higher_median = 1.5 * $median;

                    # validate the prices (choose between lower_median and higher_median prices)
                    foreach ( $unique_records as $row ) {

                        if ( $lower_median <= $row[1] && $higher_median >= $row[1] ) {

                            # validate mileages
                            if ( $row[2] > 0 && $row[2] < 1000000 ) {

                                $filtered_price[] = $row[1];
                                $filtered_mileage[] = $row[2];
                                $filtered_date[] = $row[3];

                            }

                        }

                    }

                    $count = count($filtered_price);

                    if ( $count > 0 ) {

                        $average_price = array_sum($filtered_price) / $count;
                        $average_mileage = array_sum($filtered_mileage) / $count;

                        # calculate the standard deviation
                        if ( $count > 1 ) {
                            $standard_deviation = $this->calculateStandardDeviation($filtered_price);
                        } else {
                            $standard_deviation = 0;
                        }

                        # calculate low and high percentile
                        $low_percentile = (int)$average_price - (int)$standard_deviation;
                        $high_percentile = (int)$average_price + (int)$standard_deviation;

                        # get min and max price
                        $min_price = min($filtered_price);
                        $max_price = max($filtered_price);

                        # get min and max date
                        $min_date = min($filtered_date);
                        $max_date = max($filtered_date);

                        # calculate certainty
                        $certainty = 100 * max(0.25, min(0.99, 1.15 - 1 / sqrt($count)));

                        # if mileage is interger select mileage, not averagemileage
                        $input_mileage = is_int($mileage) ? $mileage : $average_mileage;

                        # liner regression
                        $result = $this->linearRegression($filtered_mileage, $filtered_price);
                        
                        # calculate mileage adjustment
                        $calculated_price = $result['price'];
                        $calculated_mileage = $result['mileage'];

                        $final_mileage_price = $calculated_price + $calculated_mileage * intval($input_mileage);
                        $final_mileage_price = round($final_mileage_price, 2);
                        $mileage_adjustment = $final_mileage_price - $average_price;

                        # calculate the percentiles
                        $percentiles = $this->calculatePercentiles($filtered_price);
                        
                        // $marketvalues = array(

                        //     'success'        => TRUE,
                        //     'vehicle'        => $vehicle,
                        //     'averagemileage' => $average_mileage,
                        //     'averageprice'   => $average_price + $mileage_adjustment,
                        //     'below'          => $low_percentile + $mileage_adjustment,
                        //     'above'          => $high_percentile + $mileage_adjustment,
                        //     'min'            => $min_price,
                        //     'max'            => $max_price,
                        //     'mindate'        => $min_date,
                        //     'maxdate'        => $max_date,
                        //     'certainty'      => $certainty,
                        //     'count'          => $count,
                        //     'stdev'          => (int)$standard_deviation,
                        //     'zipcode'        => $zipcode,
                        //     'percentiles'    => $percentiles

                        // );

                        // "vin" 		=> 	"1NXBR32E85Z505904",
                        // "vehicle"	=>	"2005 Toyota Corolla LE",
                        // "mileage"	=>	143660,
                        // "success"	=>	true,
                        // "count"		=>	63,
                        // "mean"		=>	5054.74,
                        // "stdev"		=>	1112,
                        // "certainty"	=>	99,
                        // "period"	=>	array("2019-06-28","2019-11-05"),
                        // "prices"	=>	array("average"=>5054.74,"below"=>3942.74,"above"=>6166.74)
        
                        $marketvalues = array(

                            'success'        => TRUE,
                            'vin'            => $vin,   
                            'vehicle'        => $vehicle,
                            'mileage'        => is_int($mileage) ? $mileage : $average_mileage,
                            'mean'           => $average_price + $mileage_adjustment,
                            'averageprice'   => $average_price + $mileage_adjustment,
                            'below'          => $low_percentile + $mileage_adjustment,
                            // 'above'          => $high_percentile + $mileage_adjustment,
                            // 'min'            => $min_price,
                            // 'max'            => $max_price,
                            'prices'         => array('average'=>$average_price + $mileage_adjustment, 'below'=>$min_price, 'above'=>$max_price),
                            // 'mindate'        => $min_date,
                            // 'maxdate'        => $max_date,
                            'period'         => array($min_date, $max_date),
                            'certainty'      => $certainty,
                            'count'          => $count,
                            'stdev'          => (int)$standard_deviation,
                            // 'zipcode'        => $zipcode,
                            'percentiles'    => $percentiles

                        );

                        # fix negative price
                        if( $marketvalues['below'] < $marketvalues['averageprice'] / 2 ) {
                            
                            $marketvalues['stdev'] = (int)($marketvalues['averageprice'] / 2);
                            $marketvalues['below'] = $marketvalues['averageprice'] - $marketvalues['stdev'];
                            $marketvalues['above'] = $marketvalues['averageprice'] + $marketvalues['stdev'];

                        }
                    } else {

                    }

                    return $marketvalues;

                } else {
                    # no records
                }

            } else {
                # file not exist

                return array(
                    'success' => FALSE,
                    'ymmt'    => $ymmt_directory,
                    'error'   => 'no_data'
                );
            }

        } else {
            # if ymmt not exist in database
            
            return array(
                'success' => FALSE,
                'error'   => 'invalid_vin'
            ); 

        }

    }

    # This function calculates the marketvalue histogram
    public function calculateHistogram($vin, $pastDate, $zipcode = '') {

        # calculate squishvin (vinprefix) from vin
        $squishVin = substr($vin, 0, 8) . substr($vin, 9, 2);

        # get ymmt depends on the squishVin from mysql database
        # array(ymmt_id, Year, Make, Model, Trim)
        $ymmt = $this->getYmmtFromDB($squishVin);

        # get db driectory from config file
        $directory = $this->getDBDirectory();

        if( !empty($ymmt) ) {
            # if ymmt exist
            
            # Year + Make + Model + Trim (ugly to human readable  ex: 2016 Toyota Camry LE)
            $vehicle = $ymmt[1] . ' ' . $ymmt[2] . ' ' . $ymmt[3] . ' ' . $ymmt[4];

            # unique records (vinprefix, price, mileage, date, zipcode, date, count)
            $unique_records = array();

            # only get price from unique records
            $price_records = array();

            # filtered date
            $filtered_price = array();
            $filtered_mileage = array();
            $scatter_color = array();
            $toolTipContent = array();

            # file to analyze
            $filename = '';

            if ( $zipcode == '' ) {
                # zipcode (state) is not selected

                # ex: /var/marketvalue_db/2016 Toyota Camry LE/__ALL.csv
                $filename = $directory . $ymmt[0] . '/__ALL.csv';

            } else {
                # zipcode (state) is selected

                # ex: /var/marketvalue_db/2016 Toyota Camry LE/LA.csv
                $filename = $directory . $ymmt[0] . '/' . $zipcode . '.csv';
            }

            if ( file_exists($filename) ) {
                # file exists

                $record = array();
                $file = fopen($filename, 'r');

                while ( !feof($file) ) {

                    # 0 : vinprefix, 1 : price, 2 : mileage, 3 : date, 4 : state, 5 : zipcode, 6 : count 
                    $record = fgetcsv($file);

                    if ( $record[1] != '' && $record[2] != '' && $record[1] != 0 && $record[2] != 0 && $record[3] >= $pastDate ) {

                        $unique_records[] = $record;

                    }
                }

                fclose($file);

                # only get price record from unique records
                foreach ( $unique_records as $row ) {
                    
                    $price_records[] = $row[1];

                }

                if ( count($price_records) > 0 ) {
                    sort($price_records);

                    # calculate the median of prices
                    $median = $this->calculateMedian($price_records);

                    # calculate the lower and higher prices
                    $lower_median = 0.5 * $median;
                    $higher_median = 1.5 * $median;

                    # validate the prices (choose between lower_median and higher_median prices)
                    foreach ( $unique_records as $row ) {

                        if ( $lower_median <= $row[1] && $higher_median >= $row[1] ) {

                            # validate mileages
                            if ( $row[2] > 0 && $row[2] < 1000000 ) {

                                # $10000 -> $10K
                                $filtered_price[] = intval($row[1] / 1000);
                                // $filtered_mileage[] = $row[2];
                                // $scatter_color[] = '#d7e1fe';
                                // $toolTipContent[] = $vehicle . '<br>' . 'Date: ' . $row[3] . '  Mileage: ' . $row[2] . '<br>' . 'Location: ' . 'San Francisco, CA' ;

                            }

                        }

                    }

                    $count = count($filtered_price);

                    sort($filtered_price);

                    if ( $count > 0 ) {

                        # if price is even number
                        if ( $filtered_price[0] % 2 == 0 )
                            $filtered_price[0] = $filtered_price[0] - 1;
                        
                        if ( $filtered_price[$count - 1] % 2 == 0 )
                            $filtered_price[$count - 1] = $filtered_price[$count - 1] + 1;

                        $marketvalues = array();

                        $min_price = $filtered_price[0];
                        $max_price = $filtered_price[$count - 1];

                        $odd_count = 0;

                        for ($i = $min_price; $i < $max_price; $i += 2) {

                            $y = 0;

                            for ($j = 0; $j < $count; $j ++) {
                                if ($i <= $filtered_price[$j] && $i + 2 > $filtered_price[$j])
                                    $y ++;
                            }

                            $marketvalues[$odd_count] = array (

                                'x' => $i,
                                'y' => $y
    
                            );

                            $odd_count ++;
                        }

                        return $marketvalues;
                    }
                }
            }
        }

        return array();

    }

    # This function calculates the marketvalue mileage prices
    public function calculateMielagePrices($vin, $pastDate, $zipcode='') {

        # calculate squishvin (vinprefix) from vin
        $squishVin = substr($vin, 0, 8) . substr($vin, 9, 2);

        # get ymmt depends on the squishVin from mysql database
        # array(ymmt_id, Year, Make, Model, Trim)
        $ymmt = $this->getYmmtFromDB($squishVin);

        # get db driectory from config file
        $directory = $this->getDBDirectory();

        if( !empty($ymmt) ) {
            # if ymmt exist
            
            # Year + Make + Model + Trim (ugly to human readable  ex: 2016 Toyota Camry LE)
            $vehicle = $ymmt[1] . ' ' . $ymmt[2] . ' ' . $ymmt[3] . ' ' . $ymmt[4];

            # unique records (vinprefix, price, mileage, date, zipcode, date, count)
            $unique_records = array();

            # only get price from unique records
            $price_records = array();

            # filtered date
            $filtered_price = array();
            $filtered_mileage = array();
            $toolTipContent = array();

            # file to analyze
            $filename = '';

            if ( $zipcode == '' ) {
                # zipcode (state) is not selected

                # ex: /var/marketvalue_db/2016 Toyota Camry LE/__ALL.csv
                $filename = $directory . $ymmt[0] . '/__ALL.csv';

            } else {
                # zipcode (state) is selected

                # ex: /var/marketvalue_db/2016 Toyota Camry LE/LA.csv
                $filename = $directory . $ymmt[0] . '/' . $zipcode . '.csv';
            }

            if ( file_exists($filename) ) {
                # file exists

                $record = array();
                $file = fopen($filename, 'r');

                while ( !feof($file) ) {

                    # 0 : vinprefix, 1 : price, 2 : mileage, 3 : date, 4 : state, 5 : zipcode, 6 : count 
                    $record = fgetcsv($file);

                    if ( $record[1] != '' && $record[2] != '' && $record[1] != 0 && $record[2] != 0 && $record[3] >= $pastDate ) {

                        $unique_records[] = $record;

                    }
                }

                fclose($file);

                # only get price record from unique records
                foreach ( $unique_records as $row ) {
                    
                    $price_records[] = $row[1];

                }

                if ( count($price_records) > 0 ) {

                    sort($price_records);

                    # calculate the median of prices
                    $median = $this->calculateMedian($price_records);

                    # calculate the lower and higher prices
                    $lower_median = 0.5 * $median;
                    $higher_median = 1.5 * $median;

                    # validate the prices (choose between lower_median and higher_median prices)
                    foreach ( $unique_records as $row ) {

                        if ( $lower_median <= $row[1] && $higher_median >= $row[1] ) {

                            # validate mileages
                            if ( $row[2] > 0 && $row[2] < 1000000 ) {

                                $filtered_price[] = $row[1];
                                $filtered_mileage[] = $row[2];
                                $toolTipContent[] = $vehicle . ' @ $' . number_format($row[1]) . '<br>' . 'Date: ' . $row[3] . '  Mileage: ' . $row[2] . '<br>' . 'Location: ' . 'San Francisco, CA';

                            }

                        }

                    }

                    $count = count($filtered_price);

                    if ( $count > 0 ) {

                        $marketvalues = array();

                        for ($i = 0; $i < $count; $i ++) {

                            $marketvalues['scatter'][$i] = array (

                                'x'                 => intval($filtered_mileage[$i]),
                                'y'                 => intval($filtered_price[$i]),
                                'toolTipContent'    => $toolTipContent[$i]
    
                            );    
                            
                        }

                        for ($k = 0; $k < $count - 1; $k ++)
                            for ($m = $k + 1; $m < $count; $m ++) {
                                # order by asc
                                if ($filtered_price[$k] > $filtered_price[$m]) {

                                    $tmp = $filtered_price[$k];
                                    $filtered_price[$k] = $filtered_price[$m];
                                    $filtered_price[$m] = $tmp;

                                    $tmp = $filtered_mileage[$k];
                                    $filtered_mileage[$k] = $filtered_mileage[$m];
                                    $filtered_mileage[$m] = $tmp;

                                }
                            }

                        # formular for line through two points
                        # min mileage
                        $y1 = ($filtered_price[0] + $filtered_price[1]) / 2;
                        $x1 = ($filtered_mileage[0] + $filtered_mileage[1]) / 2;
                        
                        # max mileage
                        $y2 = ($filtered_price[$count - 1] + $filtered_price[$count - 2]) / 2;
                        $x2 = ($filtered_mileage[$count - 1] + $filtered_mileage[$count - 2]) / 2;

                        # mean mileage
                        $mean_id = round($count / 2);
                        $y3 = ($filtered_price[$mean_id] + $filtered_price[$mean_id + 1]) / 2;
                        $x3 = ($filtered_mileage[$mean_id] + $filtered_mileage[$mean_id + 1]) / 2;

                        $a = ($y1 - $y2) / ($x1 - $x2);
                        $b = $y1 - $a * $x1;

                        $mean_y_1_2 = $a * $x3 + $b;

                        $b = ($y3 + $mean_y_1_2) / 2;

                        $start_point = array(
                            'x' => intval(min($filtered_mileage)),
                            'y' => intval($filtered_price[$count - 1]),
                            'lineColor' => '#289afd'
                        );

                        $avg_price = intval(array_sum($filtered_price)/count($filtered_price));
                        $key = array_search($avg_price, $filtered_price);
                        $mileage_related_avg_price = $filtered_mileage[$key];

                        $middle_point = array(
                            'x' => $mileage_related_avg_price,
                            'y' => $avg_price,
                            'lineColor' => '#289afd'
                        );

                        $end_point = array(
                            'x' => intval(max($filtered_mileage)),
                            'y' => intval($filtered_price[0]),
                            'lineColor' => '#289afd'
                        );

                        $marketvalues['spline'] = array (
                            'start_point'   => $start_point,
                            'middle_point'  => $middle_point,
                            'end_point'     => $end_point
                        );
                        
                        return $marketvalues;

                    } else {

                    }
                }
            }


        } else {

        }

        return array();

    }

    # This function calculates the marketvalue historical prices
    public function calculateHistoricalPrices($vin, $mileage, $zipcode) {

        # calculate squishvin (vinprefix) from vin
        $squishVin = substr($vin, 0, 8) . substr($vin, 9, 2);

        # get ymmt depends on the squishVin from mysql database
        # array(ymmt_id, Year, Make, Model, Trim)
        $ymmt = $this->getYmmtFromDB($squishVin);

        # get db driectory from config file
        $directory = $this->getDBDirectory();




        return array();

    }

    # This function calculates the marketvalue state prices
    public function calculateStatePrices($vin, $mileage, $pastDate) {

        # calculate squishvin (vinprefix) from vin
        $squishVin = substr($vin, 0, 8) . substr($vin, 9, 2);

        # get ymmt depends on the squishVin from mysql database
        # array(ymmt_id, Year, Make, Model, Trim)
        $ymmt = $this->getYmmtFromDB($squishVin);

        # get db driectory from config file
        $directory = $this->getDBDirectory();

        if( !empty($ymmt) ) {
            # if ymmt exist
            
            # Year + Make + Model + Trim (ugly to human readable  ex: 2016 Toyota Camry LE)
            $vehicle = $ymmt[1] . ' ' . $ymmt[2] . ' ' . $ymmt[3] . ' ' . $ymmt[4];

            $marketvalues = array();

            for ($i = 0; $i < count($this->state_keys); $i ++) {

                # unique records (vinprefix, price, mileage, date, zipcode, date, count)
                $unique_records = array();

                # only get price from unique records
                $price_records = array();

                # filtered date
                $filtered_price = array();
                $filtered_mileage = array();
                $filtered_date = array();

                # ex: /var/marketvalue_db/2016 Toyota Camry LE/LA.csv
                $filename = $directory . $ymmt[0] . '/' . strtoupper($this->state_keys[$i]) . '.csv';

                $marketvalues['key'][0] = 'Key';
                $marketvalues['name'][0] = 'State'; 
                $marketvalues['average_price'][0] = 'average_price';
                $marketvalues['similar_vehicle'][0] = 'similar_vechiles';

                $marketvalues['key'][$i + 1] = $this->state_keys[$i];
                $marketvalues['name'][$i + 1] = $this->state_names[$i]; 
                
                if ( file_exists($filename) ) {
                    # file exists
    
                    $record = array();
                    $file = fopen($filename, 'r');
    
                    while ( !feof($file) ) {
    
                        # 0 : vinprefix, 1 : price, 2 : mileage, 3 : date, 4 : state, 5 : zipcode, 6 : count 
                        $record = fgetcsv($file);
    
                        if ( $record[1] != '' && $record[2] != '' && $record[1] != 0 && $record[2] != 0 && $record[3] >= $pastDate ) {
    
                            $unique_records[] = $record;
    
                        }
                    }
    
                    fclose($file);
    
                    # only get price record from unique records
                    foreach ( $unique_records as $row ) {
                        
                        $price_records[] = $row[1];
    
                    }
    
                    if ( count($price_records) > 0 ) {
    
                        sort($price_records);
    
                        # calculate the median of prices
                        $median = $this->calculateMedian($price_records);
    
                        # calculate the lower and higher prices
                        $lower_median = 0.5 * $median;
                        $higher_median = 1.5 * $median;
    
                        # validate the prices (choose between lower_median and higher_median prices)
                        foreach ( $unique_records as $row ) {
    
                            if ( $lower_median <= $row[1] && $higher_median >= $row[1] ) {
    
                                # validate mileages
                                if ( $row[2] > 0 && $row[2] < 1000000 ) {
    
                                    $filtered_price[] = $row[1];
                                    $filtered_mileage[] = $row[2];
    
                                }
    
                            }
    
                        }
    
                        $count = count($filtered_price);
    
                        if ( $count > 0 ) {
    
                            $average_price = array_sum($filtered_price) / $count;
                            $average_mileage = array_sum($filtered_mileage) / $count;
    
                            # calculate certainty
                            $certainty = 100 * max(0.25, min(0.99, 1.15 - 1 / sqrt($count)));
    
                            # if mileage is interger select mileage, not averagemileage
                            $input_mileage = is_int($mileage) ? $mileage : $average_mileage;
    
                            # liner regression
                            $result = $this->linearRegression($filtered_mileage, $filtered_price);
                            
                            # calculate mileage adjustment
                            $calculated_price = $result['price'];
                            $calculated_mileage = $result['mileage'];
    
                            $final_mileage_price = $calculated_price + $calculated_mileage * intval($input_mileage);
                            $final_mileage_price = round($final_mileage_price, 2);
                            $mileage_adjustment = $final_mileage_price - $average_price;
    
                            
                            $marketvalues['average_price'][$i + 1] = $average_price + $mileage_adjustment;
                            $marketvalues['similar_vehicle'][$i + 1] = $count;

                        } else {
                            $marketvalues['average_price'][$i + 1] = 0;
                            $marketvalues['similar_vehicle'][$i + 1] = 0;
                        }
    
                    } else {
                        # no records
                        $marketvalues['average_price'][$i + 1] = 0;
                        $marketvalues['similar_vehicle'][$i + 1] = 0;
                    }
    
                } else {
                    # file not exist
                    
                    $marketvalues['average_price'][$i + 1] = 0;
                    $marketvalues['similar_vehicle'][$i + 1] = 0;
                }
            }

            return $marketvalues;

        } else {
            # if ymmt not exist in database
            
            return array(
                'success' => FALSE,
                'error'   => 'invalid_vin'
            ); 

        }

    }
}

?>