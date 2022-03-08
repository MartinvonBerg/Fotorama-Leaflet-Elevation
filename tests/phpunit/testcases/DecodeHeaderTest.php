<?php
use PHPUnit\Framework\TestCase;
use function Brain\Monkey\setUp;
use function Brain\Monkey\tearDown;
use function Brain\Monkey\Functions\stubs;
use function Brain\Monkey\Functions\expect;
use function Brain\Monkey\Actions\expectDone;
use function Brain\Monkey\Filters\expectApplied;

final class decodeLLChunkHeaderTest extends TestCase {
	public function setUp(): void {
		parent::setUp();
		setUp();
	}
	public function tearDown(): void {
		tearDown();
		parent::tearDown();
	}

   	/**
     * @dataProvider HeaderProvider
     */
	public function testDecodeLLHeaderwithProvider(string $header, array $expected) {
		include_once 'C:\Bitnami\wordpress-5.2.2-0\apps\wordpress\htdocs\wp-content\plugins\fotorama_multi\tests\src\WrapExtractMetadata.php';
		
		$tested = new mvbplugins\fotoramamulti\WrapExtractMetadata();
		$result = $tested::decodeLLChunkHeader( $header );
        $this->assertEquals( $result, $expected );
    }

	public function HeaderProvider(): array
    {
        return [
            [ 'VP8L000000', [] ],
            [ 'VP8L0000'. hex2bin('2F') . '00000000000000000000000000000000000', array( 
					'compression' => 'lossless', 
					'width' => 12337, 
					'height' => 193)
			],
			[ 'VP8L0000'. hex2bin('2F') . 'FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF', array( 
				'compression' => 'lossless', 
				'width' => 1607, 
				'height' => 2330) 
			],
			[ 'VP8L0000'. hex2bin('2F'), [] ],
			[ 'VP8L0000'. hex2bin('2A') . 'FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF', [] ],
        ];
    }

	/**
     * @dataProvider BinRevertProvider
     */
	public function testBinRevertwithProvider(string $binstring, string $expected) {
		include_once 'C:\Bitnami\wordpress-5.2.2-0\apps\wordpress\htdocs\wp-content\plugins\fotorama_multi\tests\src\WrapExtractMetadata.php';
		
		$tested = new mvbplugins\fotoramamulti\WrapExtractMetadata();
		$result = $tested::binRevert( $binstring );
        $this->assertEquals( $result, $expected );
    }

	public function BinRevertProvider(): array
    {
		return [
			['', '0x00'],
			['55555', '0x00'],
			['333', '0x00'],
			['1', '0x01'], // inconsistent conversion! Should be 0x31
			['24', '0x3432'],
			[ pack('H*', 'AAAA'), '0xAAAA'],
			[ pack('H*', 'DEAD'), '0xADDE'],
			[ pack('h*', 'EDAFFFEE'), '0xEEFFFADE'],
			[ pack('h*', '1234'), '0x4321'],
			[ pack('h*', '789'), '0x0987'],
			['7', '0x07'], // inconsistent conversion! Should be 0x37
			['A', '0x00'], // inconsistent conversion! Should be 0x37
		];
	}

	/**
     * @dataProvider GetRationaleProvider
     */
	public function testBinGetRationale( $a, $b, $c, $d, $e, $expected) {
		include_once 'C:\Bitnami\wordpress-5.2.2-0\apps\wordpress\htdocs\wp-content\plugins\fotorama_multi\tests\src\WrapExtractMetadata.php';
		
		$tested = new mvbplugins\fotoramamulti\WrapExtractMetadata();
		$result = $tested::getRationale( $a, $b, $c, $d, $e );
		$this->assertEquals( $result, $expected );
    }

	public function GetRationaleProvider(): array 
	{
		return [
			['', '', 0, true, 'wrong', 0.0],
			['', '', 0, false, 'wrong', 0.0],
			['0000000000000000000000000000', '0', 0, false, 'number', 1.0],
			['0000000000000000000000000000', '0', 0, false, 'gps', '808464432/808464432'],
			['0000000000000000000000000000', '0', 0, true,  'number', 1.0],
			['0000000000000000000000000000', '0', 0, true,  'gps', '808464432/808464432'],
			['123456789123456789123456789', '3', 0,  false, 'number', 0.9272779214553012],
			['123456789123456789123456789', '3', 0,  true,  'number', 1.1012587952244763],
			['0000000000000000', 'FF', 0, true, 'number', 0.0],
			['00000000', '0', 0, true, 'number', 0.0],
		];
	}

	/**
     * @dataProvider FromBufferProvider
     */
	public function testFromBuffer( $buffer, $offset, $length, $isIntel, $expected) {
		include_once 'C:\Bitnami\wordpress-5.2.2-0\apps\wordpress\htdocs\wp-content\plugins\fotorama_multi\tests\src\WrapExtractMetadata.php';
		
		$tested = new mvbplugins\fotoramamulti\WrapExtractMetadata();
		$result = $tested::fromBuffer( $buffer, $offset, $length, $isIntel );
		$this->assertEquals( $result, $expected );
    }

	public function FromBufferProvider(): array 
	{
		return [
			['', 0, 7, true, '0x00'],
			['', 0, 5, false, '0x00'],
			['12345', 0, 0, true, '0x00'],
			['12345', 0, 0, false, '0x00'],
			['A', 0, 1, false, '0x41'],
			['Z', 0, 1, false, '0x5A'],
			['A', 0, 1, true, '0x00'], // wrong expectation due to wrong function
		];
	}

	/**
     * @dataProvider GetGpsDataProvider
     */
	public function testGetGpsData( $gpsbuffer, $totalbuffer, $isIntel, $expected) {
		include_once 'C:\Bitnami\wordpress-5.2.2-0\apps\wordpress\htdocs\wp-content\plugins\fotorama_multi\tests\src\WrapExtractMetadata.php';
		
		$tested = new mvbplugins\fotoramamulti\WrapExtractMetadata();
		$result = $tested::getGpsData( $gpsbuffer, $totalbuffer, $isIntel );
		$this->assertEquals( $result, $expected );
    }

	public function GetGpsDataProvider(): array 
	{
		$buffer = hex2bin("45584946d22e000049492a00080000000b000f0102001200000092000000100102000c000000a40000001a01050001000000b00000001b01050001000000b80000002801030001000000020000003101020029000000c00000003201020014000000ea0000003b01020010000000fe000000988202001d0000000e01000069870400010000002c01000025880400010000009e030000100400004e494b4f4e20434f52504f524154494f4e004e494b4f4e20443735303000f000000001000000f00000000100000041646f62652050686f746f73686f70204c69676874726f6f6d20362e3134202857696e646f7773290000323032313a31313a32372031383a34363a3438004d617274696e20766f6e204265726700436f70797269676874206279204d617274696e20766f6e2042657267000025009a82050001000000ee0200009d82050001000000f60200002288030001000000020000002788030001000000640000003088030001000000020000003288040001000000640000000090070004000000303233310390020014000000fe02000004900200140000001203000001920a00010000002603000002920500010000002e03000004920a00010000003603000005920500010000003e0300000692050001000000460300000792030001000000050000000892030001000000000000000992030001000000100000000a920500010000004e03000092920200020000003700000001a00300010000000100000017a20300010000000200000000a30700010000000300000001a30700010000000100000002a30700080000005603000001a40300010000000000000002a40300010000000000000003a40300010000000000000005a40300010000003c00000006a40300010000000000000007a40300010000000000000008a40300010000000000000009a4030001000000000000000aa4030001000000000000000ca40300010000000000000031a40200080000005e03000032a40500040000006603000034a4020017000000860300000000000001000000fa0000000800000001000000323032313a31303a30332030393a30393a343700323032313a31303a30332030393a30393a343700588c790040420f00060000000100000000000000060000002e0000000a0000004f01000064000000900100000a00000002000200000101023630323231323200b40000000a000000260200000a000000230000000a000000380000000a00000031382e302d35352e30206d6d20662f332e352d352e360000050001000200020000004e0000000200050003000000e00300000300020002000000450000000400050003000000f8030000050001000100000000000000000000002f000000010000002100000001000000d210000064000000");
		$data =   substr( $buffer, 138 +8, 4);
		$ascii =  substr( $buffer, 8 + hexdec($data), 160 );
		$ascii = hex2bin('050001000200020000004e0000000200050003000000e00300000300020002000000450000000400050003000000f8030000050001000100000000000000000000002f000000010000002100000001000000d2100000640000000b000000010000002000000001000000411600006400000006000301030001000000060000001a');
		$result = 'a:5:{s:14:"GPSLatitudeRef";s:1:"N";s:11:"GPSLatitude";a:3:{i:0;s:4:"47/1";i:1;s:4:"33/1";i:2;s:8:"4306/100";}s:15:"GPSLongitudeRef";s:1:"E";s:12:"GPSLongitude";a:3:{i:0;d:0;i:1;d:0;i:2;d:0;}s:14:"GPSAltitudeRef";a:1:{i:0;s:4:"0x00";}}';
		return [
			['', '', true, false],
			['', '', false, false],
			[$ascii, $buffer, true, unserialize($result)],
			[$buffer, $ascii, true, false],
		];
	}

	/**
     * @dataProvider GetMetaFromPieceProvider
     */
	public function testGetMetaFromPiece( $isIntel, $buffer, $bufoffs, $d, $e, $expected) {
		include_once 'C:\Bitnami\wordpress-5.2.2-0\apps\wordpress\htdocs\wp-content\plugins\fotorama_multi\tests\src\WrapExtractMetadata.php';
		
		$tested = new mvbplugins\fotoramamulti\WrapExtractMetadata();
		$result = $tested::getMetaFromPiece( $isIntel, $buffer, $bufoffs, $d, $e );
		$this->assertEquals( $result, $expected );
    }

	public function GetMetaFromPieceProvider(): array 
	{
		$buffer = hex2bin("45584946d22e000049492a00080000000b000f0102001200000092000000100102000c000000a40000001a01050001000000b00000001b01050001000000b80000002801030001000000020000003101020029000000c00000003201020014000000ea0000003b01020010000000fe000000988202001d0000000e01000069870400010000002c01000025880400010000009e030000100400004e494b4f4e20434f52504f524154494f4e004e494b4f4e20443735303000f000000001000000f00000000100000041646f62652050686f746f73686f70204c69676874726f6f6d20362e3134202857696e646f7773290000323032313a31313a32372031383a34363a3438004d617274696e20766f6e204265726700436f70797269676874206279204d617274696e20766f6e2042657267000025009a82050001000000ee0200009d82050001000000f60200002288030001000000020000002788030001000000640000003088030001000000020000003288040001000000640000000090070004000000303233310390020014000000fe02000004900200140000001203000001920a00010000002603000002920500010000002e03000004920a00010000003603000005920500010000003e0300000692050001000000460300000792030001000000050000000892030001000000000000000992030001000000100000000a920500010000004e03000092920200020000003700000001a00300010000000100000017a20300010000000200000000a30700010000000300000001a30700010000000100000002a30700080000005603000001a40300010000000000000002a40300010000000000000003a40300010000000000000005a40300010000003c00000006a40300010000000000000007a40300010000000000000008a40300010000000000000009a4030001000000000000000aa4030001000000000000000ca40300010000000000000031a40200080000005e03000032a40500040000006603000034a4020017000000860300000000000001000000fa0000000800000001000000323032313a31303a30332030393a30393a343700323032313a31303a30332030393a30393a343700588c790040420f00060000000100000000000000060000002e0000000a0000004f01000064000000900100000a00000002000200000101023630323231323200b40000000a000000260200000a000000230000000a000000380000000a00000031382e302d35352e30206d6d20662f332e352d352e360000050001000200020000004e0000000200050003000000e00300000300020002000000450000000400050003000000f8030000050001000100000000000000000000002f000000010000002100000001000000d210000064000000");
		$data =   substr( $buffer, 138 +8, 4);
		$ascii =  substr( $buffer, 8 + hexdec($data), 160 );
		$ascii = hex2bin('050001000200020000004e0000000200050003000000e00300000300020002000000450000000400050003000000f8030000050001000100000000000000000000002f000000010000002100000001000000d2100000640000000b000000010000002000000001000000411600006400000006000301030001000000060000001a');
		$result = 'a:5:{s:14:"GPSLatitudeRef";s:1:"N";s:11:"GPSLatitude";a:3:{i:0;s:4:"47/1";i:1;s:4:"33/1";i:2;s:8:"4306/100";}s:15:"GPSLongitudeRef";s:1:"E";s:12:"GPSLongitude";a:3:{i:0;d:0;i:1;d:0;i:2;d:0;}s:14:"GPSAltitudeRef";a:1:{i:0;s:4:"0x00";}}';
		return [
			[true,  '', 0, 0, 0, false],
			[false, '', 0, 0, 0, false],
			[true, $buffer, 0, 0, 0, false],
			[true, $buffer, 18, 0, 0, "NIKON CORPORATION"],
			[false, $buffer, 18, 0, 0, false],
			[true, $buffer, 30, 0, 0, "NIKON D7500"],
			[true, $buffer, 114, 0, 0, "Copyright by Martin von Berg"],
			[true, $buffer, 138, 0, 0, unserialize($result)],
			[true, $buffer, 310, 0, 0, 0.004],
			[true, $buffer, 346, 0, 0, 100],

		];
	}

	public function testGetMetaFromPiece_2() {
		include_once 'C:\Bitnami\wordpress-5.2.2-0\apps\wordpress\htdocs\wp-content\plugins\fotorama_multi\tests\src\WrapExtractMetadata.php';
		
		$tested = new mvbplugins\fotoramamulti\WrapExtractMetadata();
		$buffer = hex2bin("0000030002000300030004000500060006");
		$bufoffs = -1;
		$result = $tested::getMetaFromPiece( false, $buffer, $bufoffs, 0, 0 );
		$this->assertEquals( $result, 3 );
    }

	public function testGetExifMeta() {
		include_once 'C:\Bitnami\wordpress-5.2.2-0\apps\wordpress\htdocs\wp-content\plugins\fotorama_multi\tests\src\WrapExtractMetadata.php';
		
		$tested = new mvbplugins\fotoramamulti\WrapExtractMetadata();
		$buffer = 'EXIF0000MM' . hex2bin("002A");
		$result = $tested::getExifMeta( $buffer );
		$this->assertEquals( $result, [] );

		$buffer = 'AFFE0000MM' . hex2bin("002A");
		$result = $tested::getExifMeta( $buffer );
		$this->assertEquals( $result, false );

		$buffer = 'EXIF0000II' . hex2bin("002A");
		$result = $tested::getExifMeta( $buffer );
		$this->assertEquals( $result, false );
    }

}