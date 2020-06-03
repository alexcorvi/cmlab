import { Schema } from "pouchx";

export interface CaseSchema extends Schema {
	_id: string;
	repID: string;
	dentistID: string;
	accepted: boolean;
	patientName: string;
	patientAge: number;
	male: boolean;
	dateReceived: number;
	dateSent: number;
	sent: boolean;
	caseType: string;
	unitsNumber: number;
	caseDetails: string;
	caseSheetPhoto: string;
	treatmentPrice: number;
	paidInstallments: { date: number; amount: number }[];
}
