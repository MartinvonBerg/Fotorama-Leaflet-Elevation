<?php
use PHPUnit\Framework\TestCase;
use function Brain\Monkey\setUp;
use function Brain\Monkey\tearDown;
use function Brain\Monkey\Functions\stubs;
use function Brain\Monkey\Functions\expect;
use function Brain\Monkey\Actions\expectDone;
use function Brain\Monkey\Filters\expectApplied;

final class getJpgMetaDataTest extends TestCase {
	public function setUp(): void {
		parent::setUp();
		setUp();
	}
	public function tearDown(): void {
		tearDown();
		parent::tearDown();
	}

    /**
     * @-----------dataProvider HeaderProvider
     * @group skip
     */
    public function test_getJpgMetaData() {
		include_once 'C:\Bitnami\wordpress-5.2.2-0\apps\wordpress\htdocs\wp-content\plugins\fotorama_multi\tests\src\WrapExtractMetadata.php';
		
        expect( 'getimagesize', null )
			->once() 
			->with( 'test.jpg', null ) // with specified arguments, like get_option( 'plugin-settings', [] );
			->andReturnNull(); // what it should return?
        

		expect( 'exif_read_data', 'ANY_TAG', true )
			->with( 'test.jpg' ) // with specified arguments, like get_option( 'plugin-settings', [] );
			->andReturn( [] ); // what it should return?

		$tested = new mvbplugins\fotoramamulti\WrapExtractMetadata();
        $result = $tested::getJpgMetaData( 'test.jpg' );
        $this->assertIsArray( $result );
	}

}