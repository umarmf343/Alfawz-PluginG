<?php
namespace AlfawzQuran\Core;

/**
 * Manage the custom Alfawz roles and capabilities.
 */
class Roles {

    /**
     * Register or update the Alfawz roles and ensure required capabilities exist.
     */
    public function register_roles() {
        $this->ensure_student_role();
        $this->ensure_teacher_role();
        $this->ensure_admin_role();
        $this->assign_cross_capabilities();
    }

    /**
     * Make sure the student role exists and has baseline capabilities.
     */
    private function ensure_student_role() {
        $capabilities = [
            'read'             => true,
            'alfawz_student'   => true,
        ];

        $this->ensure_role('student', \__( 'Alfawz Student', 'alfawzquran' ), $capabilities);
    }

    /**
     * Make sure the teacher role exists and can access teaching tools.
     */
    private function ensure_teacher_role() {
        $capabilities = [
            'read'             => true,
            'alfawz_student'   => true,
            'alfawz_teacher'   => true,
        ];

        $this->ensure_role('teacher', \__( 'Alfawz Teacher', 'alfawzquran' ), $capabilities);
    }

    /**
     * Ensure the lightweight portal admin role is registered.
     */
    private function ensure_admin_role() {
        $capabilities = [
            'read'             => true,
            'list_users'       => true,
            'edit_users'       => true,
            'create_users'     => true,
            'promote_users'    => true,
            'alfawz_student'   => true,
            'alfawz_teacher'   => true,
            'alfawz_admin'     => true,
        ];

        $this->ensure_role('alfawz_admin', \__( 'Alfawz Portal Admin', 'alfawzquran' ), $capabilities);
    }

    /**
     * Grant shared capabilities across WordPress core roles that interact with Alfawz.
     */
    private function assign_cross_capabilities() {
        $this->grant_capabilities('administrator', [
            'alfawz_admin'   => true,
            'alfawz_teacher' => true,
            'alfawz_student' => true,
        ]);

        $teacher_roles = apply_filters('alfawz_teacher_capability_roles', ['teacher', 'editor']);
        foreach ($teacher_roles as $role_key) {
            $this->grant_capabilities($role_key, [
                'alfawz_teacher' => true,
                'alfawz_student' => true,
            ]);
        }

        $this->grant_capabilities('subscriber', [
            'alfawz_student' => true,
        ]);
    }

    /**
     * Ensure a role exists and receives the desired capabilities.
     *
     * @param string $role_key      Role identifier.
     * @param string $display_name  Human friendly role name.
     * @param array  $capabilities  List of capabilities keyed by capability name.
     */
    private function ensure_role($role_key, $display_name, array $capabilities) {
        $role = get_role($role_key);

        if (!$role) {
            add_role($role_key, $display_name, $capabilities);
            $role = get_role($role_key);
        }

        if (!$role) {
            return;
        }

        foreach ($capabilities as $capability => $grant) {
            if ($grant) {
                $role->add_cap($capability);
            } else {
                $role->remove_cap($capability);
            }
        }
    }

    /**
     * Grant a set of capabilities to an existing role.
     *
     * @param string $role_key      Role identifier.
     * @param array  $capabilities  Capabilities to grant (true) or revoke (false).
     */
    private function grant_capabilities($role_key, array $capabilities) {
        $role = get_role($role_key);

        if (!$role) {
            return;
        }

        foreach ($capabilities as $capability => $grant) {
            if ($grant) {
                $role->add_cap($capability);
            } else {
                $role->remove_cap($capability);
            }
        }
    }
}
