/* permissions of this app */

const appPermissions: Record<string, string> = {
	VIEW_MODULES: "view_modules",
	ENROLL_MODULE: "enroll_module",
	UPDATE_MODULE: "update_module",
	DELETE_MODULE: "delete_module",
};

class PermissionsService {
	static syncWithAuthService() {
		// sync permissions with auth-service
		// call on app startup
	}
}

export { appPermissions };

export default PermissionsService;
