<?php
use PHPUnit\Framework\TestCase;
use function Brain\Monkey\setUp;
use function Brain\Monkey\tearDown;
use function Brain\Monkey\Functions\stubs;
use function Brain\Monkey\Functions\expect;
use function Brain\Monkey\Actions\expectDone;
use function Brain\Monkey\Filters\expectApplied;

final class FmFunctionsTest extends TestCase {
	public function setUp(): void {
		parent::setUp();
		setUp();
	}
	public function tearDown(): void {
		tearDown();
		parent::tearDown();
	}

    /**
     * @dataProvider GpsProvider
     */
    public function test_gpxviewGps2Num( $gps, $expected) {
		include_once 'C:\Bitnami\wordpress-5.2.2-0\apps\wordpress\htdocs\wp-content\plugins\fotorama_multi\tests\src\WrapFmFunctions.php';
		
        $tested = new mvbplugins\fotoramamulti\WrapFmFunctions();
        $result = $tested::gpxviewGps2Num( $gps );
        $this->assertEquals( $result, $expected );
	}

    public function GpsProvider() :array
    {
        return [
            [ '', 0],
            [ '11', 11],
            [ '11/22', 0.5 ],
            [ '/', 0 ],
            [ '//', 0 ],
            [ '1234,56789', 1234.0 ],
            [ '1234.56789', 1234.56789 ],
            [ 'a', 0 ],
            [ '0xaa/0xbb', 0 ],
            [ '\0xAA//\0xBB', 0 ],
            [ '11/22/33', 0.5 ],
            [ '11/22/33/44', 0.5 ],
            [ ' 11 / 22 ', 0.5 ],
            [ '11_/_22 ', 0 ],
        ]
        ;
    }

    /**
     * @dataProvider GetGpsProvider
     */
    public function test_gpxviewGetGps( $coord, $hemi, $expected) {
		include_once 'C:\Bitnami\wordpress-5.2.2-0\apps\wordpress\htdocs\wp-content\plugins\fotorama_multi\tests\src\WrapFmFunctions.php';
		
        $tested = new mvbplugins\fotoramamulti\WrapFmFunctions();
        $result = $tested::gpxviewGetGPS( $coord, $hemi );
        $this->assertEquals( $result, $expected );
	}

    public function GetGpsProvider() :array
    {
        return [
            [ [], "W", null],
            [ [0=>'11'], "W", -11],
            [ [0=>'11'], "E", 11],
            [ [0=>'11.34'], "S", -11.34],
            [ [0=>'-11.34'], "N", -11.34],
            [ [0=>'11', 1=>'20'], "N", 11.3333333333333],
            [ [0=>'11', 1=>'15', 2=>'1800'], "N", 11.75],
            [ [0=>'11', 1=>'15', 2=>'1800', 3=>'999999'], "N", 11.75],
            [ [0=>'180.0001', 1=>'15', 2=>'1800'], "N", null],
            [ [0=>'-10000', 1=>'15', 2=>'1800'], "N", null],
            [ [0=>'wrongstring', 1=>'15', 2=>'1800'], "N", 0.75],
            [ [0=>'11/22', 1=>'15/1', 2=>'1800/2', 3=>'999999'], "N", 1.0],
            [ [0=>'11/22', 1=>'15/1', 2=>'1800/2'], "N", 1.0],
            [ [0=>'11/22', 1=>'15/1'], "N", 0.75],
            [ [0=>'123456/43556'], "N", 2.8344200569381943],
            ]
        ;
    }

}