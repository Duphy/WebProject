<?PHP

define('HEADER_LENGTH', 18);
define('UID_LENGTH', 4);
define('EVENTID_LENGTH', 8);
define('SID_LENGTH',4);
define('RID_LENGTH',4);
define('POSTID_LENGTH', 8);
define('NUM_OF_BYTES_IN_LENGTH', 4);
define('NUM_OF_BITS_IN_BYTE', 8);
define('SESSION_KEY_LENGTH', 8);
define('DUMB_SESSION_KEY', '00000000');

define('SUCCESSFUL', 0);
define('FAILED', 1);

define('LOG_IN_WITH_UID', 0);
define('LOG_IN_WITH_EMAIL', 1);
define('LOG_IN_FAILED', -1);

define('TYPE_STRING', 1);
define('TYPE_TAG',2);
define('TYPE_UIDS',3);
define('TYPE_ONE_BYTE_INT', 4);
define('TYPE_TWO_BYTE_INT', 5);
define('TYPE_FOUR_BYTE_INT', 6);
define('TYPE_EIGHT_BYTE_INT', 7);
define('TYPE_HEADER', 8);
define('TYPE_UPDATE', 9);
//PHP_INT_MAX