<?php
use mvbplugins\fotoramamulti\ReadImageFolder;

use PHPUnit\Framework\TestCase;
use function Brain\Monkey\setUp;
use function Brain\Monkey\tearDown;
use function Brain\Monkey\Functions\stubs;
use function Brain\Monkey\Functions\expect;
use function Brain\Monkey\Actions\expectDone;
use function Brain\Monkey\Filters\expectApplied;
use Brain\Monkey\Functions;

final class ReadImageFolderTest extends TestCase {
	public function setUp(): void {
		$_POST = [];
		parent::setUp();
		setUp();
	}
	public function tearDown(): void {
		tearDown();
		parent::tearDown();
	}
	public function test_readImageFolder() {
		include_once 'C:\Bitnami\wordpress-5.2.2-0\apps\wordpress\htdocs\wp-content\plugins\fotorama_multi\inc\readImageFolder.php';
		include_once 'C:\Bitnami\wordpress-5.2.2-0\apps\wordpress\htdocs\wp-content\plugins\fotorama_multi\inc\fm_functions.php';

        expect( 'get_option' )
			->once() // called 2x
			->with( 'thumbnail_size_h' ) // with specified arguments, like get_option( 'plugin-settings', [] );
			->andReturn( 150 ); // what it should return?

        expect( 'get_option' )
			->once() // called 2x
			->with( 'thumbnail_size_w' ) // with specified arguments, like get_option( 'plugin-settings', [] );
			->andReturn( 150 ); // what it should return?

		$folder = new mvbplugins\fotoramamulti\ReadImageFolder('test', '', 'https://www.example.com', 'false', 'false');

        $this->assertEquals( $folder->getImageNumber(), 0 );
		$this->assertIsInt( $folder->getImageNumber() );
		$this->assertTrue( $folder->areAllImgInWPLibrary() );
		$this->assertIsBool( $folder->areAllImgInWPLibrary() );
        $this->assertEmpty( $folder->getImagesForGallery() );
		$this->assertIsArray( $folder->getImagesForGallery() );
	}

	public function test_readImageFolder2() {
		include_once 'C:\Bitnami\wordpress-5.2.2-0\apps\wordpress\htdocs\wp-content\plugins\fotorama_multi\inc\readImageFolder.php';
		include_once 'C:\Bitnami\wordpress-5.2.2-0\apps\wordpress\htdocs\wp-content\plugins\fotorama_multi\inc\fm_functions.php';

      	// ---- new testcase
		expect( 'get_option' )
		   ->once() // called 2x
		   ->with( 'thumbnail_size_h' ) // with specified arguments, like get_option( 'plugin-settings', [] );
		   ->andReturn( 150 ); // what it should return?

	  	expect( 'get_option' )
		   ->once() // called 2x
		   ->with( 'thumbnail_size_w' ) // with specified arguments, like get_option( 'plugin-settings', [] );
		   ->andReturn( 150 ); // what it should return?  
       	
		expect( 'attachment_url_to_postid' )
			->once()
			->andReturn(0);
		
		expect( 'get_the_permalink' )
			->with( 'wpid', 0)
			->andReturn( false );
		
		Functions\when( 'wp_date' )->returnArg(2);

		stubs(
			[
				'esc_html__',
				'wp_unslash',
			]
		);		

		$path = pathinfo(__FILE__)['dirname'] . '\..\..\data\images';
        $folder = new mvbplugins\fotoramamulti\ReadImageFolder( $path, 'thumbs', 'https://www.example.com', 'true', 'false');
		
		$this->assertEquals( $folder->getImageNumber(), 1 );
		$this->assertIsInt( $folder->getImageNumber() );
		$this->assertFalse( $folder->areAllImgInWPLibrary() );
		$this->assertIsBool( $folder->areAllImgInWPLibrary() );
		$this->assertIsObject( $folder );
		$this->assertArrayHasKey('GPS', $folder->getImagesForGallery()[0] );
		$this->assertIsFloat( $folder->getImagesForGallery()[0]['lon'] );
		$this->assertIsFloat( $folder->getImagesForGallery()[0]['lat'] );

	}

	public function test_readImageFolder3() {
		include_once 'C:\Bitnami\wordpress-5.2.2-0\apps\wordpress\htdocs\wp-content\plugins\fotorama_multi\inc\readImageFolder.php';
		include_once 'C:\Bitnami\wordpress-5.2.2-0\apps\wordpress\htdocs\wp-content\plugins\fotorama_multi\inc\fm_functions.php';

      	// ---- new testcase
		expect( 'get_option' )
		   ->once() // called 2x
		   ->with( 'thumbnail_size_h' ) // with specified arguments, like get_option( 'plugin-settings', [] );
		   ->andReturn( 150 ); // what it should return?

	  	expect( 'get_option' )
		   ->once() // called 2x
		   ->with( 'thumbnail_size_w' ) // with specified arguments, like get_option( 'plugin-settings', [] );
		   ->andReturn( 150 ); // what it should return?  
       	
		expect( 'attachment_url_to_postid' )
			->once()
			->andReturn(0);
		
		expect( 'get_the_permalink' )
			->with( 'wpid', 0)
			->andReturn( false );
		
		Functions\when( 'wp_date' )->returnArg(2);

		stubs(
			[
				'esc_html__',
				'wp_unslash',
			]
		);		

		$path = pathinfo(__FILE__)['dirname'] . '\..\..\data\webp';
        $folder = new mvbplugins\fotoramamulti\ReadImageFolder( $path, 'thumbs', 'https://www.example.com', 'true', 'false');
		
		$this->assertEquals( $folder->getImageNumber(), 1 );
		$this->assertIsInt( $folder->getImageNumber() );
		$this->assertFalse( $folder->areAllImgInWPLibrary() );
		$this->assertIsBool( $folder->areAllImgInWPLibrary() );
		$this->assertIsObject( $folder );

	}
	
}