import { BarChartComponent } from "@common-components";
import * as modules from "@modules";
import { observer } from "mobx-react";
import * as React from "react";

@observer
export class PaymentsByDate extends React.Component {
	render() {
		return (
			<BarChartComponent
				{...{
					height: 400,
					data: {
						xLabels:
							modules.statistics.selectedPaymentsByRepByDay
								.formattedSelectedDays,
						bars: Object.keys(
							modules.statistics.selectedPaymentsByRepByDay
								.repPayments
						).map((repID) => {
							return {
								label: (
									modules.reps!.docs.find(
										(x) => x._id === repID
									) || modules.reps!.new()
								).name,
								data:
									modules.statistics
										.selectedPaymentsByRepByDay.repPayments[
										repID
									],
							};
						}),
					},
				}}
			/>
		);
	}
}
