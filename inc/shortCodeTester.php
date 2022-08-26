
<?php
namespace mvbplugins\fotoramamulti;
use Exception;

final class shTester {
	private static ?shTester $instance = null;

	public $instanciated  = false;
	public $time = null;

	/**
     * gets the instance via lazy initialization (created on first usage)
     */
    public static function getInstance(): shTester
    {	
		if (self::$instance === null) {
            self::$instance = new self();
        }
		
		return self::$instance;
    }

	public function init() {
		// do all the work for folder that should be done once only
		if (! $this->instanciated) {
			$test = 0;
			$this->instanciated = true;
		}
		
	}

	private function __construct() 
	{
	}

	/**
     * prevent the instance from being cloned (which would create a second instance of it)
     */
    private function __clone()
    {
    }

    /**
     * prevent from being unserialized (which would create a second instance of it)
     */
    public function __wakeup()
    {
        throw new Exception("Cannot unserialize singleton");
    }

	public function setTime($local) {
		if ($this->time === null){
			$this->time = $local;
		}
		return $this->time;
	}
}

add_shortcode('gpxview-part', '\mvbplugins\fotoramamulti\shTesterfunc1', 10, 1);
add_shortcode('gpxview-part2', '\mvbplugins\fotoramamulti\shTesterfunc2', 10, 1);

function shTesterfunc1() {
	$fmClass = shTester::getInstance();
	$fmClass->init();
	$fmClass->setTime(time() );
	$istime = $fmClass->time;
	$string = '<p>Die Zeit ist: ' . strval($istime) . '</p>';
	return $string;
}

function shTesterfunc2() {
	$fmClass = shTester::getInstance();
	$fmClass->init();
	$fmClass->setTime(time() );
	$istime = $fmClass->time;
	$string = '<p>Die Zeit ist: ' . strval($istime) . '</p>';
	return $string;
}