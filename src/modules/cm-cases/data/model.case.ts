import { CaseSchema, regions, setting } from "@modules";
import * as modules from "@modules";
import { generateID, num } from "@utils";
import { computed, observable } from "mobx";
import { Model, observeModel } from "pouchx";

@observeModel
export class Case extends Model<CaseSchema> implements CaseSchema {
	@observable repID: string = "";
	@observable dentistID: string = "";
	@observable accepted: boolean = false;
	@observable patientName: string = "";
	@observable patientAge: number = 0;
	@observable male: boolean = true;
	@observable dateReceived: number = new Date().getTime();
	@observable dateSent: number = new Date().getTime();
	@observable sent: boolean = false;
	@observable treatmentPrice: number = 0;
	@observable paidInstallments: { date: number; amount: number }[] = [];
	@observable caseType: string = "";
	@observable caseDetails: string = "";
	@observable unitsNumber: number = 0;
	@observable caseSheetPhoto: string = "";

	@computed get dentist() {
		return modules.dentists!.docs.find((x) => x._id === this.dentistID);
	}

	@computed get rep() {
		return modules.reps!.docs.find((x) => x._id === this.repID);
	}

	@computed get totalPayments() {
		return this.paidInstallments.reduce((total, current) => {
			total = total + current.amount;
			return total;
		}, 0);
	}

	@computed get outstandingPayments() {
		return this.treatmentPrice - this.totalPayments;
	}

	@computed get region() {
		return regions!.docs.find(
			(x) => x._id === (this.dentist || { regionID: "" }).regionID
		);
	}

	@computed
	get searchableString() {
		return `
			${this.patientName} ${this.patientAge} 
		`.toLowerCase();
	}

	toJSON(): CaseSchema {
		return {
			_id: this._id,
			repID: this.repID,
			dentistID: this.dentistID,
			accepted: this.accepted,
			patientName: this.patientName,
			patientAge: this.patientAge,
			male: this.male,
			dateReceived: this.dateReceived,
			dateSent: this.dateSent,
			sent: this.sent,
			treatmentPrice: this.treatmentPrice,
			paidInstallments: this.paidInstallments,
			caseDetails: this.caseDetails,
			caseType: this.caseType,
			caseSheetPhoto: this.caseSheetPhoto,
			unitsNumber: this.unitsNumber,
		};
	}

	fromJSON(json: Partial<CaseSchema>) {
		this._id = json._id ? json._id : this._id;
		this.repID = json.repID ? json.repID : this.repID;
		this.dentistID = json.dentistID ? json.dentistID : this.dentistID;
		this.accepted = json.accepted ? json.accepted : this.accepted;
		this.patientName = json.patientName
			? json.patientName
			: this.patientName;
		this.patientAge = json.patientAge ? json.patientAge : this.patientAge;
		this.male = json.male ? json.male : this.male;
		this.dateReceived = json.dateReceived
			? json.dateReceived
			: this.dateReceived;
		this.dateSent = json.dateSent ? json.dateSent : this.dateSent;
		this.sent = json.sent ? json.sent : this.sent;
		this.treatmentPrice = json.treatmentPrice
			? json.treatmentPrice
			: this.treatmentPrice;
		this.paidInstallments = json.paidInstallments
			? json.paidInstallments
			: this.paidInstallments;
		this.caseDetails = json.caseDetails
			? json.caseDetails
			: this.caseDetails;
		this.caseType = json.caseType ? json.caseType : this.caseType;
		this.caseSheetPhoto = json.caseSheetPhoto
			? json.caseSheetPhoto
			: this.caseSheetPhoto;
		this.unitsNumber = json.unitsNumber
			? json.unitsNumber
			: this.unitsNumber;
		return this;
	}
}
