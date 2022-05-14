<?php
use PHPUnit\Framework\TestCase;
use function Brain\Monkey\setUp;
use function Brain\Monkey\tearDown;
use function Brain\Monkey\Functions\stubs;
use function Brain\Monkey\Functions\expect;
use function Brain\Monkey\Actions\expectDone;
use function Brain\Monkey\Filters\expectApplied;

final class getWebpMetadataTest extends TestCase {
	public function setUp(): void {
		parent::setUp();
		setUp();
	}
	public function tearDown(): void {
		tearDown();
		parent::tearDown();
	}

    public function test_getWebpMetaData_1() {
		include_once 'C:\Bitnami\wordpress-5.2.2-0\apps\wordpress\htdocs\wp-content\plugins\fotorama_multi\tests\src\WrapExtractMetadata.php';
		
		expect( '\mvbplugins\fotoramamulti\extractMetadata' )
			->once() 
			->with( 'test1.jpg' ) // with specified arguments, like get_option( 'plugin-settings', [] );
			->andReturn( false ); // what it should return?

        $tested = new mvbplugins\fotoramamulti\WrapExtractMetadata();
        $result = $tested::getWebpMetaDataFromFile('test1.jpg');
        $this->assertEquals( $result, [] );
	}

    public function test_getWebpMetaData_2() {
		include_once 'C:\Bitnami\wordpress-5.2.2-0\apps\wordpress\htdocs\wp-content\plugins\fotorama_multi\tests\src\WrapExtractMetadata.php';
		
		expect( '\mvbplugins\fotoramamulti\findChunksFromFile' )
			->once() 
			->with( 'test2.jpg', 100 ) // with specified arguments, like get_option( 'plugin-settings', [] );
			->andReturn( false ); // what it should return?

        $tested = new mvbplugins\fotoramamulti\WrapExtractMetadata();
        $result = $tested::getWebpMetaDataFromFile('test2.jpg');
        $this->assertEquals( $result, [] );
	}

    public function test_getWebpMetaData_3() {
		include_once 'C:\Bitnami\wordpress-5.2.2-0\apps\wordpress\htdocs\wp-content\plugins\fotorama_multi\tests\src\WrapExtractMetadata.php';
		
		expect( '\mvbplugins\fotoramamulti\findChunksFromFile' )
			->once() 
			->with( 'test2.jpg', 100 ) // with specified arguments, like get_option( 'plugin-settings', [] );
			->andReturn( ['fourCC' => 'notWEBP'] ); // what it should return?

        $tested = new mvbplugins\fotoramamulti\WrapExtractMetadata();
        $result = $tested::getWebpMetaDataFromFile('test2.jpg');
        $this->assertEquals( $result, [] );
	}

    public function test_getWebpMetaData_4() {
		include_once 'C:\Bitnami\wordpress-5.2.2-0\apps\wordpress\htdocs\wp-content\plugins\fotorama_multi\tests\src\WrapExtractMetadata.php';
		
		expect( '\mvbplugins\fotoramamulti\findChunksFromFile' )
			->once() 
			->with( 'test2.jpg', 100 ) // with specified arguments, like get_option( 'plugin-settings', [] );
			->andReturn( ['fourCC' => 'WEBP', 'chunks' => [] ] ); // what it should return?

        $tested = new mvbplugins\fotoramamulti\WrapExtractMetadata();
        $result = $tested::getWebpMetaDataFromFile('test2.jpg');
        $this->assertEquals( $result, [] );
	}

    public function test_getWebpMetaData_5() {
		include_once 'C:\Bitnami\wordpress-5.2.2-0\apps\wordpress\htdocs\wp-content\plugins\fotorama_multi\tests\src\WrapExtractMetadata.php';
		
		expect( '\mvbplugins\fotoramamulti\findChunksFromFile' )
			->once() 
			->with( 'test5.jpg', 100 ) // with specified arguments, like get_option( 'plugin-settings', [] );
			->andReturn( ['fourCC' => 'WEBP', 'chunks' => [] ] ); // what it should return?

        expect( '\mvbplugins\fotoramamulti\extractMetadataFromChunks' )
			->once() 
			->with( [], 'test5.jpg' ) // with specified arguments, like get_option( 'plugin-settings', [] );
			->andReturn( ['meta' =>'metadata'] ); // what it should return?

        $tested = new mvbplugins\fotoramamulti\WrapExtractMetadata();
        $result = $tested::getWebpMetaDataFromFile('test5.jpg');
        $this->assertEquals( $result, ['meta' =>'metadata', 'meta_version' => '0.0.1'] );
	}
   

}