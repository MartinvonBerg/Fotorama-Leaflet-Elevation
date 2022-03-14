<?php
use PHPUnit\Framework\TestCase;
use function Brain\Monkey\setUp;
use function Brain\Monkey\tearDown;
use function Brain\Monkey\Functions\stubs;
use function Brain\Monkey\Functions\expect;
use function Brain\Monkey\Actions\expectDone;
use function Brain\Monkey\Filters\expectApplied;

final class extractMetaDataFromChunksTest extends TestCase {
	public function setUp(): void {
		parent::setUp();
		setUp();
	}
	public function tearDown(): void {
		tearDown();
		parent::tearDown();
	}

   
    /**
     * @dataProvider ChunksProvider
     */
    public function test_extractMetaDataFromChunks_1( array $chunks, string $filename, $expected ) {
		include_once 'C:\Bitnami\wordpress-5.2.2-0\apps\wordpress\htdocs\wp-content\plugins\fotorama_multi\tests\src\WrapExtractMetadata.php';
		
        expect( 'file_get_contents' )
            //->once() 
            //->with( 'test.jpg',  ) // with specified arguments, like get_option( 'plugin-settings', [] );
            ->andReturn( '<?xml version="1.0"?><dcx:descriptionSet><dcx:description>
            <dc:title><dcx:valueString>Home Page Title</dcx:valueString></dc:title>
            <dc:description><dcx:valueString>Test-Description</dcx:valueString></dc:description>
            <rdf:bag><rdf:li>tag1</rdf:li><rdf:li>tag2</rdf:li></rdf:bag>
            </dcx:description></dcx:descriptionSet>'); // what it should return?
    

		$tested = new mvbplugins\fotoramamulti\WrapExtractMetadata();
        $result = $tested::wrapExtractMetadataFromChunks($chunks, $filename);
        $this->assertEquals( $result, $expected );
	}

    public function ChunksProvider() :array
    {
        return [
            [ [], '', [] ],
            [ array(
                array('fourCC' => 'VP8L', 'start' => 0, 'size' => 10)), 'test1.jpg', [] ],
            [ array(
                array('fourCC' => 'XMP ', 'start' => 0, 'size' => 10)), 'test2.jpg', 
                array (
                    'title' => 'Home Page Title',
                    'caption' => 'Test-Description',
                    'keywords' => array (0 => 'tag1', 1 => 'tag2' )
                     ) ],
        ];
    }
    
    public function test_extractMetaDataFromChunks_2() {
		include_once 'C:\Bitnami\wordpress-5.2.2-0\apps\wordpress\htdocs\wp-content\plugins\fotorama_multi\tests\src\WrapExtractMetadata.php';
		
        expect( 'fread' )
            ->with( 'test1.jpg', 4 )
            ->andReturn( 'wrong_Content');

      	$tested = new mvbplugins\fotoramamulti\WrapExtractMetadata();
        $result = $tested::FindChunks( 'test1.jpg' );
        $this->assertFalse( $result );
	}

    public function test_extractMetaDataFromChunks_3() {
		include_once 'C:\Bitnami\wordpress-5.2.2-0\apps\wordpress\htdocs\wp-content\plugins\fotorama_multi\tests\src\WrapExtractMetadata.php';
		
        expect( 'fread' )
            ->twice()
            ->with( 'test2.jpg', 4 )
            ->andReturn( 'RIFF', 'wrong_length');

      	$tested = new mvbplugins\fotoramamulti\WrapExtractMetadata();
        $result = $tested::FindChunks( 'test2.jpg' );
        $this->assertFalse( $result );
	}

    public function test_extractMetaDataFromChunks_4() {
		include_once 'C:\Bitnami\wordpress-5.2.2-0\apps\wordpress\htdocs\wp-content\plugins\fotorama_multi\tests\src\WrapExtractMetadata.php';
		
        expect( 'fread' )
            ->times(3)
            ->with( 'test3.jpg', 4 )
            ->andReturn( 'RIFF', '1234', 'not_fourCC');

      	$tested = new mvbplugins\fotoramamulti\WrapExtractMetadata();
        $result = $tested::FindChunks( 'test3.jpg' );
        $this->assertFalse( $result );
	}

    public function test_extractMetaDataFromChunks_5() {
		include_once 'C:\Bitnami\wordpress-5.2.2-0\apps\wordpress\htdocs\wp-content\plugins\fotorama_multi\tests\src\WrapExtractMetadata.php';
		
        expect( 'fread' )
            ->times(5)
            ->with( 'test4.jpg', 4 )
            ->andReturn( 'RIFF', '1234', '44CC', 'prt1', 'chunk_size');
        
        expect( 'feof')
            ->once()
            ->with( 'test4.jpg' )
            ->andReturn( false );

        expect( 'ftell')
            ->once()
            ->with( 'test4.jpg' )
            ->andReturn( 17 );
        
      	$tested = new mvbplugins\fotoramamulti\WrapExtractMetadata();
        $result = $tested::FindChunks( 'test4.jpg' );
        $this->assertEquals( $result, 
                            array (
                                'fileSize' => 875770417,
                                'fourCC' => '44CC',
                                'chunks' => []
                                ) );
	}

    public function test_extractMetaDataFromChunks_6() {
		include_once 'C:\Bitnami\wordpress-5.2.2-0\apps\wordpress\htdocs\wp-content\plugins\fotorama_multi\tests\src\WrapExtractMetadata.php';
		
        expect( 'fread' )
            ->times(5)
            ->with( 'test5.jpg', 4 )
            ->andReturn( 'RIFF', '1234', '44CC', 'prt1', '1234');
        
        expect( 'feof')
            ->twice()
            ->with( 'test5.jpg' )
            ->andReturn( false, true );

        expect( 'ftell')
            ->once()
            ->with( 'test5.jpg' )
            ->andReturn( 17 );

        expect( 'fseek')
            ->once()
            ->with( 'test5.jpg', 875770418 , 1 )
            ->andReturn( -1 );
        
      	$tested = new mvbplugins\fotoramamulti\WrapExtractMetadata();
        $result = $tested::FindChunks( 'test5.jpg' );
        $this->assertEquals( $result, 
                            array (
                                'fileSize' => 875770417,
                                'fourCC' => '44CC',
                                'chunks' => array(
                                    0 => array(
                                    'fourCC' => 'prt1',
                                    'start' => 17,
                                    'size' => 875770417,
                                    ))
                                ) );
	}
}