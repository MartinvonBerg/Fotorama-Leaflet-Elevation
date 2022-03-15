<?php
use PHPUnit\Framework\TestCase;
use function Brain\Monkey\setUp;
use function Brain\Monkey\tearDown;
use function Brain\Monkey\Functions\when;
use function Brain\Monkey\Functions\expect;
use function Brain\Monkey\Actions\expectDone;
use function Brain\Monkey\Filters\expectApplied;
use Brain\Monkey;
use Brain\Monkey\Functions;

/*
class AdminWrapper extends mvbplugins\fotoramamulti\FotoramaElevation 
{
    public function p_my_sanitize_special( $a, $b)
    {
            return parent::my_sanitize_special( $a, $b);
    }
}
*/
final class adminSettingsTest extends TestCase {
	public function setUp(): void 
    {
		parent::setUp();
		setUp(); 
        $path = __DIR__ . '\\..\\..\\..\\inc\\';
        expect( 'plugin_dir_path')
            //->twice()
            ->andReturn( $path );
        include_once 'C:\Bitnami\wordpress-5.2.2-0\apps\wordpress\htdocs\wp-content\plugins\fotorama_multi\inc\admin_settings.php';
	}

	public function tearDown(): void 
    {
		tearDown();
		parent::tearDown();
	}

    public function testAdminSettings_1() 
    {          
        $tested = new mvbplugins\fotoramamulti\FotoramaElevation();
        self::assertEquals( 10, (has_action('admin_init', [ $tested, 'fotorama_elevation_page_init' ]) ));
        self::assertEquals( 10, (has_action('admin_menu', [ $tested, 'fotorama_elevation_add_plugin_page' ]) ));
        //$result = $tested::my_sanitize_special('', array('false', 'true', array('integer', 0, 5000) ));
    }

    public function testMySanitizeSpecial() 
    {   
        Functions\when( 'sanitize_text_field' )->returnArg(1);

        $class = new \ReflectionClass('mvbplugins\fotoramamulti\FotoramaElevation');
        $privateMethod = $class->getMethod('my_sanitize_special');
        $privateMethod->setAccessible(TRUE);
        $tested = new mvbplugins\fotoramamulti\FotoramaElevation();

        $result = $privateMethod->invokeArgs( $tested, [ '', array('false', 'true', array('integer', 0, 5000) ) ] );
        $this->assertEquals($result, 'false');

        $result = $privateMethod->invokeArgs( $tested, [ 'FalSe', array('false', 'true', array('integer', 0, 5000) ) ] );
        $this->assertEquals($result, 'false');

        $result = $privateMethod->invokeArgs( $tested, [ 'TrUe', array('false', 'true', array('integer', 0, 5000) ) ] );
        $this->assertEquals($result, 'true');

        $result = $privateMethod->invokeArgs( $tested, [ '10', array('false', 'true', array('integer', 0, 5000) ) ] );
        $this->assertEquals($result, 10);

        $result = $privateMethod->invokeArgs( $tested, [ '1000000', array('false', 'true', array('integer', 0, 5000) ) ] );
        $this->assertEquals($result, 5000);

        $result = $privateMethod->invokeArgs( $tested, [ '10', array('false', 'true', array('integer', 100, 5000) ) ] );
        $this->assertEquals($result, 100);

        $result = $privateMethod->invokeArgs( $tested, [ '10', array('false', 'true', array('float', 100, 5000) ) ] );
        $this->assertEquals($result, 'false');

        $result = $privateMethod->invokeArgs( $tested, [ 'Ba_11A1234', array('false', 'true', array('integer', 0, 5000) ) ] );
        $this->assertEquals($result, 'false');
    }

    public function testMySanitizeIntWithLimits() 
    {   
        //Functions\when( 'sanitize_text_field' )->returnArg(1);

        $class = new \ReflectionClass('mvbplugins\fotoramamulti\FotoramaElevation');
        $privateMethod = $class->getMethod('my_sanitize_int_with_limits');
        $privateMethod->setAccessible(TRUE);
        $tested = new mvbplugins\fotoramamulti\FotoramaElevation();
        
        $result = $privateMethod->invokeArgs( $tested, [ '1', 0, 2  ] );
        $this->assertEquals($result, '1');

        $result = $privateMethod->invokeArgs( $tested, [ '10', 0, 2  ] );
        $this->assertEquals($result, '2');

        $result = $privateMethod->invokeArgs( $tested, [ '-10', 0, 2  ] );
        $this->assertEquals($result, '0'); 

        $result = $privateMethod->invokeArgs( $tested, [ '1.1', 0.0, 2  ] );
        $this->assertEquals($result, '1.1');

        $result = $privateMethod->invokeArgs( $tested, [ '10.1', 0.0, 2.1  ] );
        $this->assertEquals($result, '2.1');
        
        $result = $privateMethod->invokeArgs( $tested, [ '-10.1', -0.5, 2  ] );
        $this->assertEquals($result, '-0.5'); 

        $result = $privateMethod->invokeArgs( $tested, [ '-10', -20.0, 2.5  ] );
        $this->assertEquals($result, '-10'); 

        $result = $privateMethod->invokeArgs( $tested, [ '1a1', 0, 2  ] );
        $this->assertEquals($result, '2');

        $result = $privateMethod->invokeArgs( $tested, [ '1e10', 0, 1000  ] );
        $this->assertEquals($result, '110');
        
        $result = $privateMethod->invokeArgs( $tested, [ 'ABCD', -10, 1000  ] );
        $this->assertEquals($result, '0');

        $result = $privateMethod->invokeArgs( $tested, [ '1', 'MIN', 1000  ] );
        $this->assertEquals($result, '0');

        $result = $privateMethod->invokeArgs( $tested, [ '1', 0, 'MAX' ] );
        $this->assertEquals($result, '0');
    }

    public function testMySanitizeCssColor() 
    {   
        Functions\when( 'sanitize_text_field' )->returnArg(1);

        $class = new \ReflectionClass('mvbplugins\fotoramamulti\FotoramaElevation');
        $privateMethod = $class->getMethod('my_sanitize_csscolor');
        $privateMethod->setAccessible(TRUE);
        $tested = new mvbplugins\fotoramamulti\FotoramaElevation();
        
        $result = $privateMethod->invokeArgs( $tested, [ '1' ] );
        $this->assertEquals($result, '1');

        $result = $privateMethod->invokeArgs( $tested, [ 'ABCDEF' ] );
        $this->assertEquals($result, 'ABCDEF');
        
        $result = $privateMethod->invokeArgs( $tested, [ '#FFAABB' ] );
        $this->assertEquals($result, '#FFAABB');

        $result = $privateMethod->invokeArgs( $tested, [ '#000000' ] );
        $this->assertEquals($result, '#000000');

        $result = $privateMethod->invokeArgs( $tested, [ '#FFFFFF1' ] );
        $this->assertEquals($result, 'red');

        $result = $privateMethod->invokeArgs( $tested, [ 'blue' ] );
        $this->assertEquals($result, 'blue');

        $result = $privateMethod->invokeArgs( $tested, [ 'sdfdfgsfsdfg' ] );
        $this->assertEquals($result, 'sdfdfgsfsdfg');
    }

    public function testMySanitizePath() 
    {   
        Functions\when( 'sanitize_text_field' )->returnArg(1);

        $class = new \ReflectionClass('mvbplugins\fotoramamulti\FotoramaElevation');
        $privateMethod = $class->getMethod('my_sanitize_path');
        $privateMethod->setAccessible(TRUE);
        $tested = new mvbplugins\fotoramamulti\FotoramaElevation();
        
        $result = $privateMethod->invokeArgs( $tested, [ '/path-%&"§$' ] );
        $this->assertEquals($result, 'path-34');

        $result = $privateMethod->invokeArgs( $tested, [ '//path1/path2//' ] );
        $this->assertEquals($result, 'path1/path2');

        $result = $privateMethod->invokeArgs( $tested, [ '\\path1_1/path2_2\\' ] );
        $this->assertEquals($result, 'path1_1/path2_2');
    }

}