<?php

    //echo 'date: ', $_POST["fDate"], ' to ' . $_POST["tDate"] . '<br>';
    $file_db = new PDO('sqlite:tell.db');

    $dquery = 'date BETWEEN ' . $_POST["fDate"] . ' AND ' . $_POST["tDate"];

    

    //echo $query . '<br><hr>';
    $result = $file_db->query('SELECT * FROM measurements WHERE ' . $dquery);

    // ALWAYS FETCH WHOLE 24hour-parts and do the filtering with js instead..
    // TODO: Impkement sensor filter


    foreach ($result as $row) {
       //echo json_encode($row);
       echo $row['date'] . ',' . $row['time'] . ',' . $row['device'] . ',' . $row['temp'] . ',' .  $row['RH'] . ';';
       //foreach ($row as $data) {
       //    echo $data . '<br>';
       //}
    }
?>
