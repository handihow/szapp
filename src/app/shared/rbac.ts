export class RBAC {
	
	//list of all permissions
	public static permissions = 
		{
			// parent: [],
			student: [
				'read:evaluations',
				'write:evaluations',
				'read:comments',
				'read:overviews'
			],
			teacher: [
				'read:evaluations',
				'write:evaluations',
				'read:assessments',
				'write:assessments',
				'write:comments',
				'read:overviews',
				'manage:schoolcontents',
				'manage:programs',
				'manage:projects',
				'manage:courses',
				'manage:formatives'
			],
			schooladmin: [
				'download:data',
				'upload:skills',
			],
			// trajectorycounselor: [],
			// companyadmin: [],
			admin: [
				'manage:users',
				
			]	
		};

}
