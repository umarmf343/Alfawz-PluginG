<?php
namespace AlfawzQuran\Models;

use function absint;
use function current_time;
use function sanitize_key;
use function sanitize_textarea_field;

/**
 * Stores personal reflections attached to specific surah/ayah combinations.
 */
class UserReflection {
    /**
     * @var \wpdb
     */
    private $wpdb;

    /**
     * @var string
     */
    private $table;

    public function __construct() {
        global $wpdb;
        $this->wpdb  = $wpdb;
        $this->table = $wpdb->prefix . 'alfawz_quran_reflections';
    }

    /**
     * Persist a new reflection entry for the given user.
     */
    public function create( $user_id, $surah_id, $verse_id, $content, $mood = '' ) {
        $user_id  = absint( $user_id );
        $surah_id = absint( $surah_id );
        $verse_id = absint( $verse_id );
        $mood     = $this->sanitize_mood( $mood );
        $content  = $this->sanitize_content( $content );

        if ( ! $user_id || ! $surah_id || ! $verse_id || '' === $content ) {
            return false;
        }

        $inserted = $this->wpdb->insert(
            $this->table,
            [
                'user_id'    => $user_id,
                'surah_id'   => $surah_id,
                'verse_id'   => $verse_id,
                'mood'       => $mood,
                'reflection' => $content,
                'created_at' => current_time( 'mysql', true ),
                'updated_at' => current_time( 'mysql', true ),
            ],
            [ '%d', '%d', '%d', '%s', '%s', '%s', '%s' ]
        );

        if ( false === $inserted ) {
            return false;
        }

        $id = (int) $this->wpdb->insert_id;

        return $this->get( $id, $user_id );
    }

    /**
     * Update an existing reflection for a user.
     */
    public function update( $id, $user_id, array $fields ) {
        $id      = absint( $id );
        $user_id = absint( $user_id );

        if ( ! $id || ! $user_id ) {
            return false;
        }

        $data  = [];
        $types = [];

        if ( array_key_exists( 'content', $fields ) ) {
            $content = $this->sanitize_content( $fields['content'] );
            if ( '' === $content ) {
                return false;
            }
            $data['reflection'] = $content;
            $types[]            = '%s';
        }

        if ( array_key_exists( 'mood', $fields ) ) {
            $data['mood'] = $this->sanitize_mood( $fields['mood'] );
            $types[]      = '%s';
        }

        if ( empty( $data ) ) {
            return false;
        }

        $data['updated_at'] = current_time( 'mysql', true );
        $types[]            = '%s';

        $updated = $this->wpdb->update(
            $this->table,
            $data,
            [
                'id'      => $id,
                'user_id' => $user_id,
            ],
            $types,
            [ '%d', '%d' ]
        );

        if ( false === $updated ) {
            return false;
        }

        return $this->get( $id, $user_id );
    }

    /**
     * Delete a reflection.
     */
    public function delete( $id, $user_id ) {
        $id      = absint( $id );
        $user_id = absint( $user_id );

        if ( ! $id || ! $user_id ) {
            return false;
        }

        $deleted = $this->wpdb->delete(
            $this->table,
            [
                'id'      => $id,
                'user_id' => $user_id,
            ],
            [ '%d', '%d' ]
        );

        return false !== $deleted;
    }

    /**
     * Fetch a single reflection belonging to the user.
     */
    public function get( $id, $user_id ) {
        $id      = absint( $id );
        $user_id = absint( $user_id );

        if ( ! $id || ! $user_id ) {
            return false;
        }

        $query = $this->wpdb->prepare(
            "SELECT * FROM {$this->table} WHERE id = %d AND user_id = %d",
            $id,
            $user_id
        );

        $row = $this->wpdb->get_row( $query, ARRAY_A );

        if ( ! $row ) {
            return false;
        }

        return $this->format_row( $row );
    }

    /**
     * Fetch reflections for a user with optional filters.
     */
    public function get_many( $user_id, array $args = [] ) {
        $user_id = absint( $user_id );

        if ( ! $user_id ) {
            return [];
        }

        $defaults = [
            'limit'    => 10,
            'offset'   => 0,
            'surah_id' => null,
            'verse_id' => null,
            'order'    => 'DESC',
        ];

        $args   = array_merge( $defaults, $args );
        $limit  = max( 1, min( 50, absint( $args['limit'] ) ) );
        $offset = max( 0, absint( $args['offset'] ) );
        $order  = strtoupper( sanitize_key( $args['order'] ) );
        $order  = in_array( $order, [ 'ASC', 'DESC' ], true ) ? $order : 'DESC';

        $conditions = [ 'user_id = %d' ];
        $values     = [ $user_id ];

        if ( ! empty( $args['surah_id'] ) ) {
            $conditions[] = 'surah_id = %d';
            $values[]     = absint( $args['surah_id'] );
        }

        if ( ! empty( $args['verse_id'] ) ) {
            $conditions[] = 'verse_id = %d';
            $values[]     = absint( $args['verse_id'] );
        }

        $where = implode( ' AND ', $conditions );

        $query = $this->wpdb->prepare(
            "SELECT * FROM {$this->table} WHERE {$where} ORDER BY created_at {$order} LIMIT %d OFFSET %d",
            array_merge( $values, [ $limit, $offset ] )
        );

        $rows = $this->wpdb->get_results( $query, ARRAY_A );

        if ( ! $rows ) {
            return [];
        }

        return array_map( [ $this, 'format_row' ], $rows );
    }

    /**
     * Return the most recent reflections for preview cards.
     */
    public function get_recent( $user_id, $limit = 3 ) {
        return $this->get_many(
            $user_id,
            [
                'limit' => max( 1, min( 10, absint( $limit ) ) ),
                'order' => 'DESC',
            ]
        );
    }

    private function sanitize_mood( $mood ) {
        if ( '' === $mood || null === $mood ) {
            return '';
        }
        $key = sanitize_key( $mood );
        return substr( $key, 0, 32 );
    }

    private function sanitize_content( $content ) {
        $content = sanitize_textarea_field( $content );
        return trim( $content );
    }

    private function format_row( array $row ) {
        return [
            'id'         => (int) $row['id'],
            'user_id'    => (int) $row['user_id'],
            'surah_id'   => (int) $row['surah_id'],
            'verse_id'   => (int) $row['verse_id'],
            'mood'       => $row['mood'] ?? '',
            'content'    => $row['reflection'] ?? '',
            'created_at' => $row['created_at'] ?? '',
            'updated_at' => $row['updated_at'] ?? '',
        ];
    }
}
