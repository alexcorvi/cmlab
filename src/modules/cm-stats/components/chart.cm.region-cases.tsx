import { PieChartComponent } from "@common-components";
import * as modules from "@modules";
import * as utils from "@utils";
import { observer } from "mobx-react";
import * as React from "react";

@observer
export class RegionsCasesPerMillion extends React.Component {
	render() {
		return (
			<PieChartComponent
				height={400}
				{...{
					data: modules.statistics.acceptedCases
						.reduce(
							(
								result: {
									label: string;
									id: string;
									value: number;
								}[],
								current
							) => {
								const currentRegion = (
									current.region || { name: "" }
								).name;
								let i = result.findIndex(
									(x) => x.label === currentRegion
								);
								if (i === -1) {
									result.push({
										label: currentRegion,
										id: (current.region || { _id: "" })._id,
										value: 0,
									});
									i = result.length - 1;
								}
								result[i].value = result[i].value + 1;
								return result;
							},
							[]
						)
						.map((dataForRegion) => {
							dataForRegion.value = utils.round(
								dataForRegion.value /
									(
										modules.regions!.docs.find(
											(x) => x._id === dataForRegion.id
										) || { population: 1 }
									).population
							);
							return dataForRegion;
						}),
				}}
			/>
		);
	}
}
