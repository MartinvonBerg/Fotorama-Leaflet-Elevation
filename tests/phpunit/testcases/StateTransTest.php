<?php
use PHPUnit\Framework\TestCase;
use function Brain\Monkey\setUp;
use function Brain\Monkey\tearDown;
use function Brain\Monkey\Functions\stubs;
use function Brain\Monkey\Functions\expect;
use function Brain\Monkey\Actions\expectDone;
use function Brain\Monkey\Filters\expectApplied;

final class StateTransWithBrainMonkeyTest extends TestCase {
	public function setUp(): void {
		$_POST = [];
		parent::setUp();
		setUp();
	}
	public function tearDown(): void {
		tearDown();
		parent::tearDown();
	}

    public function testAddHooks() {
		include_once 'C:\Bitnami\wordpress-5.2.2-0\apps\wordpress\htdocs\wp-content\plugins\fotorama_multi\tests\src\WrapStateTransition.php';
		
		$tested = new mvbplugins\fotoramamulti\WrapStateTrans();
		
		$status = $tested::do('draft', 'publish');
        self::assertTrue( $status[1]);
		self::assertFalse( $status[0]);

		$status = $tested::do('publish', 'draft');
		self::assertTrue( $status[0]);
		self::assertFalse( $status[1]);
    }
}