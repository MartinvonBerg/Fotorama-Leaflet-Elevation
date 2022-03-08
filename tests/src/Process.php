<?php
namespace wppunk\Subscribe;
class Process {
	public function add_hooks() {
		add_action( 'wp_ajax_save_form', [ $this, 'save' ] );
		add_action( 'wp_ajax_nopriv_save_form', [ $this, 'save' ] );
	}
	public function save() {
		check_ajax_referer( 'subscribe', 'nonce' );

		if ( empty( $_POST['email'] ) ) {
			wp_send_json_error( esc_html__( 'Fill the email address', 'subscribe' ), 400 );
		}

		$email = apply_filters(
			'subscriber_email',
			sanitize_email( wp_unslash( $_POST['email'] ) )
		);

		global $wpdb;

		$subscriber = $wpdb->query( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.NoCaching
			$wpdb->prepare(
				'INSERT INTO ' . $wpdb->prefix . 'subscribers (email) VALUES (%s)',
				$email
			)
		);

		if ( ! $subscriber ) {
			wp_send_json_error( esc_html__( 'You are already subscribed', 'subscribe' ), 400 );
		}

		do_action( 'subscriber_added', $email );

		wp_send_json_success( esc_html__( 'You have successfully subscribed', 'subscribe' ) );
	}
}
