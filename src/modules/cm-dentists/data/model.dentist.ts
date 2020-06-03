import { cases, DentistSchema, regions, reps } from "@modules";
import * as modules from "@modules";
import { computed, observable } from "mobx";
import { Model, observeModel } from "pouchx";

@observeModel
export class Dentist extends Model<DentistSchema> implements DentistSchema {
	@observable name: string = "";
	@observable phone: string = "";
	@observable regionID: string = "";
	@observable specialty: string = "";
	@observable fullAddress: string = "";
	@observable isEnrolled: boolean = false;
	@observable isVisited: boolean = false;

	@observable notes: string = "";
	@computed get region() {
		return regions!.docs.find((x) => x._id === this.regionID);
	}

	@computed get totalSales() {
		return cases!.docs.filter(
			(receivedCase) => receivedCase.dentistID === this._id
		);
	}

	@computed get salesThisMonth() {
		return cases!.docs
			.filter((receivedCase) => receivedCase.dentistID === this._id)
			.filter((receivedCase) => {
				const caseDate = new Date(receivedCase.dateReceived);
				const currentDate = new Date();
				if (
					caseDate.getFullYear() === currentDate.getFullYear() &&
					caseDate.getMonth() === currentDate.getMonth()
				) {
					return true;
				} else {
					return false;
				}
			});
	}

	@computed get expectedPaymentsFromThisMonth() {
		return this.salesThisMonth.reduce((total, current) => {
			total = total + current.treatmentPrice;
			return total;
		}, 0);
	}

	@computed get totalExpectedPayments() {
		return this.totalSales.reduce((total, current) => {
			total = total + current.treatmentPrice;
			return total;
		}, 0);
	}

	@computed get totalPayments() {
		const payments = this.totalSales.map((sale) => {
			return sale.paidInstallments.reduce((total, current) => {
				total = current.amount + total;
				return total;
			}, 0);
		});
		return payments.reduce((total, current) => {
			total = total + current;
			return total;
		}, 0);
	}

	@computed get repsResponsible() {
		return reps!.docs.filter((rep) =>
			rep.regionsIDs.includes(this.regionID)
		);
	}

	@computed
	get searchableString() {
		return `
			${this.name} 
			${this.phone} 
			${this.specialty} 
			${this.fullAddress} 
			${this.isEnrolled ? "enrolled" : ""} 
			${this.isVisited ? "visited" : ""}
			${(this.region || { name: "" }).name}
		`.toLowerCase();
	}

	toJSON(): DentistSchema {
		return {
			_id: this._id,
			name: this.name,
			phone: this.phone,
			regionID: this.regionID,
			specialty: this.specialty,
			fullAddress: this.fullAddress,
			isEnrolled: this.isEnrolled,
			isVisited: this.isVisited,
			notes: this.notes,
		};
	}

	fromJSON(json: Partial<DentistSchema>) {
		this.name = json.name ? json.name : this.name;
		this._id = json._id ? json._id : this._id;
		this.phone = json.phone ? json.phone : this.phone;
		this.regionID = json.regionID ? json.regionID : this.regionID;
		this.specialty = json.specialty ? json.specialty : this.specialty;
		this.fullAddress = json.fullAddress
			? json.fullAddress
			: this.fullAddress;
		this.isEnrolled = json.isEnrolled ? json.isEnrolled : this.isEnrolled;
		this.isVisited = json.isVisited ? json.isVisited : this.isVisited;
		this.notes = json.notes ? json.notes : this.notes;
		return this;
	}
}
