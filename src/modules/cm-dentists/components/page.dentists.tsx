import { Report } from "../../reporting";
import * as core from "@core";
import { dentists } from "@modules";
import * as modules from "@modules";
import { day, formatDate, num } from "@utils";
import { computed, observable } from "mobx";
import { observer } from "mobx-react";
import { DatePicker, IconButton } from "office-ui-fabric-react";
import * as React from "react";
import {
	getRandomTagType,
	LineChartComponent,
	PieChartComponent,
	SectionComponent,
	DataTableComponent,
	PanelTabs,
	PanelTop,
	ProfileSquaredComponent,
	TagComponent,
	tagType,
	Row,
	Col,
} from "@common-components";

import {
	Checkbox,
	Dropdown,
	MessageBar,
	MessageBarType,
	Panel,
	PanelType,
	PrimaryButton,
	TextField,
	Toggle,
} from "office-ui-fabric-react";

@observer
export class DentistsPage extends React.Component {
	@observable report: Report = new Report({
		startingDate: new Date().getTime() - day * 60,
		endingDate: new Date().getTime(),
	});

	dt: null | DataTableComponent = null;

	tabs = [
		{
			key: "details",
			icon: "Contact",
			title: "Dentist Details",
		},
		{
			key: "reports",
			icon: "Chart",
			title: "Reports",
		},
		{
			key: "delete",
			icon: "trash",
			title: "Delete",
		},
	];
	@computed get selectedDentist() {
		return modules.dentists!.docs.find(
			(p) => p._id === core.router.selectedID
		);
	}

	render() {
		return (
			<div className="pc-pg">
				<DataTableComponent
					ref={(dt) => (this.dt = dt)}
					onDelete={(id) => {
						dentists!.deleteModal(id);
					}}
					commands={[
						{
							key: "addNew",
							title: "Add new",
							name: "Add new",
							onClick: () => {
								const newDoc = dentists!.new();
								dentists!.add(newDoc).then(() => {
									core.router.select({
										id: newDoc._id,
										tab: "details",
									});
								});
							},
							iconProps: {
								iconName: "Add",
							},
						},
					]}
					heads={["Dentist", "Specialty", "Region", "Enrolled"]}
					rows={dentists!.docs.map((dentist) => {
						return {
							id: dentist._id,
							searchableString: dentist.searchableString,
							actions: this.tabs.map((x) => ({
								key: x.key,
								title: x.title,
								icon: x.icon,
								onClick: () => {
									if (x.key === "delete") {
										modules.dentists!.deleteModal(
											dentist._id
										);
									} else {
										core.router.select({
											id: dentist._id,
											tab: x.key,
										});
									}
								},
							})),
							cells: [
								{
									dataValue: dentist.name,
									component: (
										<ProfileSquaredComponent
											text={dentist.name}
											onRenderSecondaryText={() => (
												<span className="itl">
													{dentist.phone}
												</span>
											)}
										/>
									),
									onClick: () => {
										core.router.select({
											id: dentist._id,
											tab: "details",
										});
									},
									className: "no-label",
								},
								{
									dataValue: dentist.specialty,
									component: <span>{dentist.specialty}</span>,
									className: "hidden-xs",
								},
								{
									dataValue: dentist.region
										? dentist.region.name
										: "",
									component: (
										<div>
											{dentist.region ? (
												<TagComponent
													text={dentist.region.name}
													type={getRandomTagType(
														dentist.region.name
													)}
													highlighted={
														this.dt
															? this.dt
																	.filterString ===
															  dentist.region
																	.name
															: false
													}
													onClick={() => {
														if (this.dt) {
															if (
																this.dt
																	.filterString ===
																dentist.region!
																	.name
															) {
																this.dt.filterString =
																	"";
															} else {
																this.dt.filterString = dentist.region!.name;
															}
														}
														this.forceUpdate();
													}}
												/>
											) : (
												""
											)}
										</div>
									),
									className: "hidden-xs",
								},
								{
									dataValue: `${
										dentist.isEnrolled ? " enrolled " : ""
									} ${dentist.isVisited ? " visited " : ""}`,
									component: (
										<div>
											{dentist.isEnrolled ? (
												<TagComponent
													text={"Enrolled"}
													type={tagType.success}
													highlighted={
														this.dt
															? this.dt
																	.filterString ===
															  "Enrolled"
															: false
													}
													onClick={() => {
														if (this.dt) {
															if (
																this.dt
																	.filterString ===
																"Enrolled"
															) {
																this.dt.filterString =
																	"";
															} else {
																this.dt.filterString =
																	"Enrolled";
															}
														}
														this.forceUpdate();
													}}
												/>
											) : (
												""
											)}

											{dentist.isVisited ? (
												<TagComponent
													text={"Visited"}
													type={tagType.primary}
													highlighted={
														this.dt
															? this.dt
																	.filterString ===
															  "Visited"
															: false
													}
													onClick={() => {
														if (this.dt) {
															if (
																this.dt
																	.filterString ===
																"Visited"
															) {
																this.dt.filterString =
																	"";
															} else {
																this.dt.filterString =
																	"Visited";
															}
														}
														this.forceUpdate();
													}}
												/>
											) : (
												""
											)}
										</div>
									),
									className: "hidden-xs",
								},
							],
						};
					})}
					maxItemsOnLoad={20}
				/>

				{this.selectedDentist ? (
					<Panel
						isOpen={!!this.selectedDentist}
						type={PanelType.medium}
						closeButtonAriaLabel="Close"
						isLightDismiss={true}
						onDismiss={() => {
							core.router.unSelect();
						}}
						onRenderNavigation={() => (
							<div className="panel-heading">
								<PanelTop
									title={this.selectedDentist!.name}
									type={"Dentist"}
									onDismiss={() => core.router.unSelect()}
									square
								/>
								<PanelTabs
									currentSelectedKey={core.router.selectedTab}
									onSelect={(key) =>
										core.router.select({ tab: key })
									}
									items={this.tabs}
								/>
							</div>
						)}
					>
						<div className="dentist-editor">
							{core.router.selectedTab === "details" ? (
								<div>
									<Row gutter={8}>
										<Col span={8}>
											<TextField
												label={"Name"}
												value={
													this.selectedDentist.name
												}
												onChange={(ev, val) => {
													this.selectedDentist!.name = val!;
												}}
											/>
										</Col>
										<Col span={8}>
											<TextField
												label={"Phone number"}
												value={
													this.selectedDentist.phone
												}
												onChange={(ev, val) =>
													(this.selectedDentist!.phone = val!)
												}
											/>
										</Col>
										<Col span={8}>
											<TextField
												label={"Specialty"}
												value={
													this.selectedDentist
														.specialty
												}
												onChange={(ev, val) =>
													(this.selectedDentist!.specialty = val!)
												}
											/>
										</Col>
									</Row>

									<Row gutter={8}>
										<Col span={6}>
											<Dropdown
												label="Region"
												options={modules.regions!.docs.map(
													(region) => ({
														key: region._id,
														text: region.name,
													})
												)}
												selectedKey={
													this.selectedDentist
														.regionID
												}
												onChange={(ev, val) => {
													if (val) {
														this.selectedDentist!.regionID = val.key.toString();
													}
												}}
											/>
										</Col>
										<Col span={18}>
											<TextField
												label={"Full Address"}
												value={
													this.selectedDentist
														.fullAddress
												}
												onChange={(ev, val) =>
													(this.selectedDentist!.fullAddress = val!)
												}
											/>
										</Col>
									</Row>

									<TextField
										label={"Notes"}
										value={this.selectedDentist.notes}
										onChange={(ev, val) =>
											(this.selectedDentist!.notes = val!)
										}
										multiline
									/>

									<br></br>
									<Checkbox
										label={"Visited"}
										checked={this.selectedDentist.isVisited}
										onChange={(ev, checked) => {
											this.selectedDentist!.isVisited = !!checked;
										}}
									/>
									<br></br>
									<Checkbox
										label={"Enrolled"}
										checked={
											this.selectedDentist.isEnrolled
										}
										onChange={(ev, checked) => {
											this.selectedDentist!.isEnrolled = !!checked;
										}}
									/>
								</div>
							) : (
								""
							)}

							{core.router.selectedTab === "reports" ? (
								<div>
									<Row gutter={8}>
										<Col span={12}>
											<DatePicker
												label={"Starting date"}
												value={
													new Date(
														this.report.startingDate
													)
												}
												onSelectDate={(date) => {
													if (date) {
														this.report.startingDate = date.setHours(
															0,
															0,
															0,
															0
														);
													}
												}}
												formatDate={(d) =>
													formatDate(
														d || 0,
														modules.setting!.getSetting(
															"date_format"
														)
													)
												}
											/>
										</Col>
										<Col span={12}>
											<DatePicker
												label={"Ending date"}
												value={
													new Date(
														this.report.endingDate
													)
												}
												onSelectDate={(date) => {
													if (date) {
														this.report.endingDate = date.setHours(
															0,
															0,
															0,
															0
														);
													}
												}}
												formatDate={(d) =>
													formatDate(
														d || 0,
														modules.setting!.getSetting(
															"date_format"
														)
													)
												}
											/>
										</Col>
									</Row>
									<hr />
									<SectionComponent title="Cases / Date">
										<LineChartComponent
											{...{
												height: 300,
												data: {
													xLabels: this.report
														.numberOfCasesByDate({
															doctor: this
																.selectedDentist
																._id,
														})
														.map((x) => x.date),
													lines: [
														{
															label: "Cases",
															data: this.report
																.numberOfCasesByDate(
																	{
																		doctor: this
																			.selectedDentist
																			._id,
																	}
																)
																.map(
																	(x) =>
																		x.number
																),
														},
													],
												},
											}}
										/>
									</SectionComponent>
									<SectionComponent title="Payments / Date">
										<LineChartComponent
											{...{
												height: 300,
												data: {
													xLabels: this.report
														.amountOfPaymentsByDate(
															{
																doctor: this
																	.selectedDentist
																	._id,
															}
														)
														.map((x) => x.date),
													lines: [
														{
															label: "Payments",
															data: this.report
																.amountOfPaymentsByDate(
																	{
																		doctor: this
																			.selectedDentist
																			._id,
																	}
																)
																.map(
																	(x) =>
																		x.amount
																),
														},
													],
												},
											}}
										/>
									</SectionComponent>
									<SectionComponent title="Rep comparison with others">
										<PieChartComponent
											{...{
												height: 300,
												data: Object.keys(
													this.report.numberOfCasesByDentist()
												).map((regionKey) => ({
													label: regionKey.split(
														"__"
													)[0],
													value: this.report.numberOfCasesByDentist()[
														regionKey
													],
												})),
											}}
										/>
									</SectionComponent>
								</div>
							) : (
								""
							)}

							{core.router.selectedTab === "delete" ? (
								<div>
									<br />
									<MessageBar
										messageBarType={MessageBarType.warning}
									>
										{"Are you sure you want to delete"}
									</MessageBar>
									<br />
									<PrimaryButton
										className="delete"
										iconProps={{
											iconName: "delete",
										}}
										text={"Delete"}
										onClick={() => {
											modules.regions!.delete(
												core.router.selectedID
											);
											core.router.unSelect();
										}}
									/>
								</div>
							) : (
								""
							)}
						</div>
					</Panel>
				) : (
					""
				)}
			</div>
		);
	}
}
