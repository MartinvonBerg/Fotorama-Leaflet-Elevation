<?php
use PHPUnit\Framework\TestCase;
use function Brain\Monkey\setUp;
use function Brain\Monkey\tearDown;
use function Brain\Monkey\Functions\stubs;
use function Brain\Monkey\Functions\expect;
use function Brain\Monkey\Actions\expectDone;
use function Brain\Monkey\Filters\expectApplied;

final class decodeLossyChunkHeaderTest extends TestCase {
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
    public function test_decodeLossyChunkHeader_1(string $header, array $expected) {
		include_once 'C:\Bitnami\wordpress-5.2.2-0\apps\wordpress\htdocs\wp-content\plugins\fotorama_multi\tests\src\WrapExtractMetadata.php';
		
		$tested = new mvbplugins\fotoramamulti\WrapExtractMetadata();
        $result = $tested::decodeLossyChunkHeaderFromString($header);
        $this->assertEquals( $result, $expected );
	}

    public function HeaderProvider(): array
    {
        return [
            [ '', [] ],
            [ 'VP8L000000', [] ],
            [ 'VP8L0000000' . hex2bin('9D012A'), [] ],
            [ 'VP8L0000000' . hex2bin('9D012A'). '8888', ['compression' => 'lossy', 'width'=>14392, 'height'=>14392] ],
        ];
    }

}