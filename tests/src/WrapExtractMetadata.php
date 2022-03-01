<?php
namespace mvbplugins\fotoramamulti;

include_once 'C:\Bitnami\wordpress-5.2.2-0\apps\wordpress\htdocs\wp-content\plugins\fotorama_multi\inc\extractMetadata.php';

/**
 * wrapper class for decodeExtendedChunkHeader in file ../fotorama_multi\inc\extractMetadata.php
 */
class WrapExtractMetadata {

    public function decodeLLChunkHeader ( string $header ) {
        return \mvbplugins\fotoramamulti\decodeLosslessChunkHeader( $header);
    }

    public function binRevert( string $binstring) {
        return \mvbplugins\fotoramamulti\binrevert( $binstring);
    }

    public function getRationale(string $buffer, string $pointer, int $count, bool $isIntel, string $type) 
    {
        return \mvbplugins\fotoramamulti\getrationale( $buffer, $pointer, $count, $isIntel, $type );
    }

    public function fromBuffer(string $buffer, int $offset, int $length, bool $isIntel) 
    {
        return \mvbplugins\fotoramamulti\frombuffer( $buffer, $offset, $length, $isIntel );
    }

    public function getGpsData( string $gpsbuffer, string $buffer, bool $isIntel )
    {
        return \mvbplugins\fotoramamulti\get_gps_data( $gpsbuffer, $buffer, $isIntel );
    }

    public function getMetaFromPiece( bool $isIntel, string $buffer, int $bufoffs, $piece, $tags ) 
    {
        return \mvbplugins\fotoramamulti\get_meta_from_piece( $isIntel, $buffer, $bufoffs, $piece, $tags); 
    }
    

}