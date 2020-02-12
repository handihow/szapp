export interface Organisation {
	id?: string,
	name?: string,
	emailEndsWith?: string,
	roleDetectionRule?: any,
	registrationCode?: string,
	classes?: string[],
	subjects?: string[],
	tags?: string[],
	weightRed?: number,
	weightYellow?: number,
	weightLightGreen?: number,
	weightGreen?: number
}