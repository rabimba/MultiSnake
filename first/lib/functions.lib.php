<?php

        function timeToClean() {
                
                $conn   = new DB();
                $query  = "SELECT `value` FROM `infos` WHERE `key` = 'lastCheck'";
                if ( $conn->query( $query ) ) {
                        $lastCheck      = $conn->fetch();
                        if ( ( time() - $lastCheck['value'] ) < TIME_BEFORE_DEATH ) {
                                return false;
                        } else {
                                $query  = "UPDATE infos SET `value` = '" . time() . "' WHERE `key` = 'lastCheck'";
                                $conn->query( $query );
                                return true;
                        }
                }
                
                return true;
        
        }
        
        
        /*
            Function to call in case of error, to complete the script, instead of a die () or exit ()
            
             It is very important to use this feature, because it will be specified in the header
             HTTP code 400 (invalid request) error, which will report to the Comet and class
             an error has occurred, and should not try to reconnect immediately
        */
        
        function error($message, $file, $line) {
        header("HTTP/1.0 400 Invalid request");
            die("Error in file $file at line $line : <br/><b>$message</b>");
        }

?>