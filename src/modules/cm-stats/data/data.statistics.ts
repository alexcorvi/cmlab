import * as modules from "@modules";
import { day, getDayStartingPoint } from "@utils";
import * as utils from "@utils";
import { computed, observable } from "mobx";

export interface Payment {
	id: string;
	date: number;
	amount: number;
	repCommission: number;
	repPart: number;
	labPart: number;
	forCase: {
		patient: string;
		units: number;
		caseType: string;
	};
	dentist: modules.Dentist;
	rep: modules.Rep;
	region: modules.Region;
}

class Statistics {
	readonly todayDateObject: Date = new Date();
	readonly todayStartsWith: number = getDayStartingPoint(
		this.todayDateObject.getTime()
	);
	@observable specificDentist: string = "";
	@observable specificRep: string = "";
	@observable specificRegion: string = "";
	@observable specificTerm: string = "";
	@observable selectedDate: Date = new Date();
	@computed get startingDate() {
		return new Date(
			this.selectedDate.getFullYear(),
			this.selectedDate.getMonth(),
			1
		).setHours(1, 1, 1, 1);
	}
	@computed get endingDate() {
		return (
			new Date(
				this.selectedDate.getFullYear(),
				this.selectedDate.getMonth() + 1,
				0
			).setHours(0, 0, 0, 0) +
			day -
			10
		);
	}
	@computed
	private get numberOfSelectedDays() {
		return (this.endingDate - this.startingDate) / day;
	}

	@computed
	get selectedDays() {
		const days: Date[] = [];
		let i = 0;
		while (i <= this.numberOfSelectedDays) {
			days.push(new Date(this.startingDate + day * i));
			i++;
		}
		return days;
	}

	@computed get selectedCasesNoDateFilter() {
		if (!modules.cases) {
			return [];
		}
		return modules.cases.docs.filter((sCase) => {
			if (
				this.specificDentist &&
				sCase.dentistID !== this.specificDentist
			) {
				return false;
			}
			if (this.specificRep && sCase.repID !== this.specificRep) {
				return false;
			}
			if (
				this.specificRegion &&
				sCase.region &&
				sCase.region._id !== this.specificRegion
			) {
				return false;
			}
			if (
				this.specificTerm &&
				sCase.caseType
					.toLowerCase()
					.indexOf(this.specificTerm.toLowerCase()) === -1
			) {
				return false;
			}

			return true;
		});
	}

	@computed get acceptedCases() {
		return this.selectedCasesNoDateFilter.filter((sCase) => {
			if (!sCase.accepted) {
				return false;
			}
			if (
				sCase.dateReceived > this.endingDate ||
				sCase.dateReceived < this.startingDate
			) {
				return false;
			}
			return true;
		});
	}

	@computed get selectedPayments() {
		const payments: Payment[] = [];

		this.selectedCasesNoDateFilter.forEach((sCase) => {
			sCase.paidInstallments.forEach((installment) => {
				if (
					installment.date > this.endingDate ||
					installment.date < this.startingDate
				) {
					return;
				}

				const dentist = sCase.dentist || modules.dentists!.new();
				const rep = sCase.rep || modules.reps!.new();
				const region = sCase.region || modules.regions!.new();
				const repCommission = rep.commissionPerCase;
				const repPart = installment.amount * (repCommission / 100);
				payments.push({
					id:
						Math.random().toString().replace(/\D/g, "") +
						"__" +
						sCase._id,
					amount: installment.amount,
					date: installment.date,
					repCommission,
					repPart,
					labPart: installment.amount - repPart,
					forCase: {
						patient: sCase.patientName,
						units: sCase.unitsNumber,
						caseType: sCase.caseType,
					},
					dentist,
					rep,
					region,
				});
			});
		});

		return payments;
	}

	@computed get selectedPaymentsByRepByDay() {
		const repPayments: { [key: string]: number[] } = {};
		const formattedSelectedDays = this.selectedDays.map((x) =>
			utils.formatDate(x, modules.setting!.getSetting("date_format"))
		);
		this.selectedPayments
			.sort((a, b) => a.date - b.date)
			.forEach((payment) => {
				if (!repPayments[payment.rep._id]) {
					repPayments[payment.rep._id] = [];
					this.selectedDays.forEach((x) =>
						repPayments[payment.rep._id].push(0)
					);
				}
				const formattedDay = utils.formatDate(
					payment.date,
					modules.setting!.getSetting("date_format")
				);
				const i = formattedSelectedDays.indexOf(formattedDay);
				repPayments[payment.rep._id][i] =
					repPayments[payment.rep._id][i] + payment.amount;
			});
		return { repPayments, formattedSelectedDays };
	}

	@computed get repSalaries() {
		return modules.reps!.docs.map((rep) => {
			const commissions = this.acceptedCases
				.filter((sCase) => sCase.repID === rep._id)
				.reduce((total, x) => {
					total =
						total +
						x.treatmentPrice * (x.rep!.commissionPerCase / 100);
					return total;
				}, 0);
			return {
				rep,
				totalCommissions: commissions,
				totalBonuses: rep.bonusesThisMonth,
				fixedSalary: rep.fixedSalary,
				totalDeserved:
					commissions + rep.bonusesThisMonth + rep.fixedSalary,
			};
		});
	}
}
export const statistics = new Statistics();
