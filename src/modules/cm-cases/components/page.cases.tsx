import * as core from "@core";
import { cases, setting } from "@modules";
import * as modules from "@modules";
import { formatDate, num } from "@utils";
import { computed, observable } from "mobx";
import { observer } from "mobx-react";
import * as React from "react";
import {
	DefaultButton,
	Label,
	TooltipHost,
	Dialog,
} from "office-ui-fabric-react";

import {
	DatePicker,
	Dropdown,
	IconButton,
	PersonaInitialsColor,
	Icon,
} from "office-ui-fabric-react";
import {
	Col,
	DataTableComponent,
	PanelTabs,
	PanelTop,
	ProfileSquaredComponent,
	TagComponent,
	TagInputComponent,
	tagType,
	PickAndUploadComponent,
	Row,
	fileTypes,
} from "@common-components";
import {
	MessageBar,
	MessageBarType,
	Panel,
	PanelType,
	PrimaryButton,
	TextField,
	Toggle,
} from "office-ui-fabric-react";

@observer
export class CasesPage extends React.Component {
	dt: null | DataTableComponent = null;
	@observable uploading: boolean = false;

	tabs = [
		{
			key: "details",
			icon: "Suitcase",
			title: "Case Details",
		},
		{
			key: "treatment",
			icon: "View",
			title: "Treatment Details",
		},
		{
			key: "payments",
			icon: "AllCurrency",
			title: "Pricing and payments",
		},
		{
			key: "delete",
			icon: "trash",
			title: "Delete",
		},
	];
	@computed get selectedCase() {
		return modules.cases!.docs.find(
			(p) => p._id === core.router.selectedID
		);
	}

	fetchImage(path: string) {
		core.imagesTable.fetchImage(path);
		return "https://media1.tenor.com/images/3aaadc45f4da67e52850a02aedf68040/tenor.gif";
	}

	render() {
		return (
			<div className="pc-pg">
				<DataTableComponent
					ref={(dt) => (this.dt = dt)}
					onDelete={(id) => {
						cases!.deleteModal(id);
					}}
					commands={[
						{
							key: "addNew",
							title: "Add new",
							name: "Add new",
							onClick: () => {
								const newDoc = cases!.new();
								cases!.add(newDoc).then(() => {
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
					heads={["Case", "Status", "Financial", "Dentist"]}
					rows={cases!.docs.map((singleCase) => {
						return {
							id: singleCase._id,
							searchableString: singleCase.searchableString,
							actions: this.tabs.map((x) => ({
								key: x.key,
								title: x.title,
								icon: x.icon,
								onClick: () => {
									if (x.key === "delete") {
										modules.cases!.deleteModal(
											singleCase._id
										);
									} else {
										core.router.select({
											id: singleCase._id,
											tab: x.key,
										});
									}
								},
							})),
							cells: [
								{
									dataValue: singleCase.patientName,
									component: (
										<ProfileSquaredComponent
											text={singleCase.patientName}
											onRenderSecondaryText={() => (
												<span className="itl">
													{singleCase.patientAge} yrs,{" "}
													{}
												</span>
											)}
										/>
									),
									onClick: () => {
										core.router.select({
											id: singleCase._id,
											tab: "details",
										});
									},
									className: "no-label",
								},
								{
									dataValue: singleCase.dateReceived,
									component: (
										<ProfileSquaredComponent
											text={
												singleCase.accepted
													? "Accepted"
													: "Rejected"
											}
											onRenderSecondaryText={() => (
												<span className="itl">
													{singleCase.sent
														? `Sent: ${formatDate(
																singleCase.dateSent,
																modules.setting!.getSetting(
																	"date_format"
																)
														  )}`
														: `Received: ${formatDate(
																singleCase.dateReceived,
																modules.setting!.getSetting(
																	"date_format"
																)
														  )}`}
												</span>
											)}
											initialsColor={
												singleCase.accepted
													? PersonaInitialsColor.blue
													: PersonaInitialsColor.black
											}
											onRenderInitials={() => (
												<Icon
													iconName={
														singleCase.accepted
															? "checkmark"
															: "Cancel"
													}
												></Icon>
											)}
										/>
									),
									className: "hidden-xs",
								},
								{
									dataValue: singleCase.outstandingPayments,
									component: (
										<ProfileSquaredComponent
											text={
												singleCase.outstandingPayments >
												0
													? "Outstanding"
													: "Fully paid"
											}
											initialsColor={
												singleCase.outstandingPayments >
												0
													? PersonaInitialsColor.red
													: PersonaInitialsColor.green
											}
											onRenderSecondaryText={() => (
												<span className="itl">
													Priced:{" "}
													{singleCase.treatmentPrice},
													Paid:{" "}
													{singleCase.totalPayments}
												</span>
											)}
											onRenderInitials={() => (
												<Icon
													iconName={
														singleCase.outstandingPayments >
														0
															? "Cancel"
															: "checkmark"
													}
												></Icon>
											)}
										/>
									),
									className: "hidden-xs",
								},
								{
									dataValue: singleCase.dentist
										? singleCase.dentist.name
										: "",
									component: singleCase.dentist ? (
										<ProfileSquaredComponent
											text={singleCase.dentist.name}
											onRenderSecondaryText={() => (
												<span className="itl">
													{singleCase.dentist!.region
														? singleCase.dentist!
																.region.name
														: ""}
												</span>
											)}
										/>
									) : (
										<i>not set</i>
									),
									className: "hidden-xs",
								},
							],
						};
					})}
					maxItemsOnLoad={20}
				/>

				{this.selectedCase ? (
					<Panel
						isOpen={!!this.selectedCase}
						type={PanelType.medium}
						closeButtonAriaLabel="Close"
						isLightDismiss={true}
						onDismiss={() => {
							core.router.unSelect();
						}}
						onRenderNavigation={() => (
							<div className="panel-heading">
								<PanelTop
									title={this.selectedCase!.patientName}
									type={"Case"}
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
						<div className="case-editor">
							{core.router.selectedTab === "details" ? (
								<div>
									<Row gutter={8}>
										<Col span={8}>
											<TextField
												label={"Patient name"}
												value={
													this.selectedCase
														.patientName
												}
												onChange={(ev, val) =>
													(this.selectedCase!.patientName = val!)
												}
											/>
										</Col>
										<Col span={8}>
											<TextField
												label={"Patient age"}
												value={this.selectedCase.patientAge.toString()}
												onChange={(ev, val) =>
													(this.selectedCase!.patientAge = num(
														val!
													))
												}
												type="number"
												min={0}
											/>
										</Col>
										<Col span={8}>
											<Dropdown
												label="Patient Gender"
												options={[
													{ key: "m", text: "Male" },
													{
														key: "f",
														text: "Female",
													},
												]}
												selectedKey={
													this.selectedCase.male
														? "m"
														: "f"
												}
												onChange={(ev, val) => {
													if (
														val &&
														val.key === "m"
													) {
														this.selectedCase!.male = true;
													} else {
														this.selectedCase!.male = false;
													}
												}}
											/>
										</Col>
									</Row>
									<Row gutter={8}>
										<Col span={12}>
											<TagInputComponent
												label={"Dentist"}
												options={modules
													.dentists!.docs.sort(
														(a, b) =>
															a.name.localeCompare(
																b.name
															)
													)
													.map((s) => {
														return {
															key: s._id,
															text: s.name,
														};
													})}
												value={
													this.selectedCase.dentist
														? [
																{
																	key: this
																		.selectedCase
																		.dentistID,
																	text: this
																		.selectedCase
																		.dentist
																		.name,
																},
														  ]
														: []
												}
												onChange={(newKeys) => {
													this.selectedCase!.dentistID =
														newKeys[0] || "";
													const region = this
														.selectedCase!.region;
													if (
														region &&
														!this.selectedCase!.rep
													) {
														this.selectedCase!.repID = (
															modules.reps!.docs.find(
																(x) =>
																	x.regionsIDs.indexOf(
																		region._id
																	) > -1
															) || { _id: "" }
														)._id;
													}
												}}
												suggestionsHeaderText={
													"Dentist"
												}
												noResultsFoundText={
													"No dentists found"
												}
												maxItems={1}
											/>
										</Col>
										<Col span={12}>
											<TagInputComponent
												label={"Representative"}
												options={modules
													.reps!.docs.sort((a, b) =>
														a.name.localeCompare(
															b.name
														)
													)
													.filter((rep) => {
														if (
															!this.selectedCase!
																.dentist
														) {
															return true;
														}
														const region = this
															.selectedCase!
															.dentist.region;
														if (!region) {
															return true;
														}
														return (
															rep.regionsIDs.indexOf(
																region._id
															) > -1
														);
													})
													.map((s) => {
														return {
															key: s._id,
															text: s.name,
														};
													})}
												value={
													this.selectedCase.rep
														? [
																{
																	key: this
																		.selectedCase
																		.repID,
																	text: this
																		.selectedCase
																		.rep
																		.name,
																},
														  ]
														: []
												}
												onChange={(newKeys) => {
													this.selectedCase!.repID =
														newKeys[0] || "";
												}}
												suggestionsHeaderText={
													"Representative"
												}
												noResultsFoundText={
													"No representatives found"
												}
												maxItems={1}
											/>
										</Col>
									</Row>
									<br />
									<Row gutter={8}>
										<Col span={12}>
											<Toggle
												checked={
													this.selectedCase!.accepted
												}
												onText={"Accepted"}
												offText={"Rejected"}
												onChange={(e, newVal) => {
													this.selectedCase!.accepted = newVal!;
												}}
											/>
										</Col>
										<Col span={12}>
											{this.selectedCase.accepted ? (
												<Toggle
													checked={
														this.selectedCase!.sent
													}
													onText={"Finished"}
													offText={"In progress"}
													onChange={(e, newVal) => {
														this.selectedCase!.sent = newVal!;
													}}
												/>
											) : (
												""
											)}
										</Col>
									</Row>

									<Row gutter={8}>
										<Col span={12}>
											{this.selectedCase.accepted ? (
												<DatePicker
													label="Date received"
													value={
														new Date(
															this.selectedCase.dateReceived
														)
													}
													onSelectDate={(date) => {
														if (date) {
															this.selectedCase!.dateReceived = date.setHours(
																1,
																0,
																0,
																0
															);
														}
													}}
													formatDate={(d) =>
														formatDate(
															this.selectedCase!
																.dateReceived,
															modules.setting!.getSetting(
																"date_format"
															)
														)
													}
												/>
											) : (
												""
											)}
										</Col>
										<Col span={12}>
											{this.selectedCase.sent &&
											this.selectedCase.accepted ? (
												<DatePicker
													label="Date sent"
													value={
														new Date(
															this.selectedCase.dateSent
														)
													}
													onSelectDate={(date) => {
														if (date) {
															this.selectedCase!.dateSent = date.setHours(
																1,
																0,
																0,
																0
															);
														}
													}}
													formatDate={(d) =>
														formatDate(
															this.selectedCase!
																.dateSent,
															modules.setting!.getSetting(
																"date_format"
															)
														)
													}
												/>
											) : (
												""
											)}
										</Col>
									</Row>
								</div>
							) : (
								""
							)}
							{core.router.selectedTab === "treatment" ? (
								<div>
									<Row gutter={8}>
										<Col span={12}>
											<TagInputComponent
												label={"Case type"}
												options={Array.from(
													new Set(
														modules
															.cases!.docs.sort(
																(a, b) =>
																	a.caseType.localeCompare(
																		b.caseType
																	)
															)
															.map(
																(x) =>
																	x.caseType
															)
													)
												).map((s) => {
													return {
														key: s,
														text: s,
													};
												})}
												loose
												value={
													this.selectedCase.caseType
														? [
																{
																	key: this
																		.selectedCase
																		.caseType,
																	text: this
																		.selectedCase
																		.caseType,
																},
														  ]
														: []
												}
												onChange={(newKeys) => {
													this.selectedCase!.caseType =
														newKeys[0] || "";
												}}
												suggestionsHeaderText={
													"Case type"
												}
												noResultsFoundText={
													"No case types found"
												}
												maxItems={1}
											/>
										</Col>
										<Col span={12}>
											<TextField
												label={"Units number"}
												value={this.selectedCase.unitsNumber.toString()}
												onChange={(ev, val) =>
													(this.selectedCase!.unitsNumber = num(
														val!
													))
												}
												type="number"
												min={0}
											/>
										</Col>
									</Row>
									<TextField
										label={"Case details"}
										value={this.selectedCase.caseDetails}
										onChange={(ev, val) =>
											(this.selectedCase!.caseDetails = val!)
										}
										multiline
									/>

									<div>
										<Label>Case sheet photo</Label>
										{this.selectedCase.caseSheetPhoto ? (
											<div>
												<div className="thumb">
													<div className="thumb-btns">
														<TooltipHost content="Open image">
															<IconButton
																className="thumb-btn"
																iconProps={{
																	iconName:
																		"zoom",
																}}
																onClick={async () => {
																	if (
																		core
																			.imagesTable
																			.table[
																			this
																				.selectedCase!
																				.caseSheetPhoto
																		]
																	) {
																		const newTab = window.open();
																		newTab!.document.body.innerHTML = `<img src="${
																			core
																				.imagesTable
																				.table[
																				this
																					.selectedCase!
																					.caseSheetPhoto
																			]
																		}">`;
																	}
																}}
															></IconButton>
														</TooltipHost>
														<TooltipHost content="Delete image">
															<IconButton
																className="thumb-btn"
																iconProps={{
																	iconName:
																		"trash",
																}}
																onClick={async () => {
																	try {
																		await core.files.remove(
																			this
																				.selectedCase!
																				.caseSheetPhoto
																		);
																	} finally {
																		this.selectedCase!.caseSheetPhoto =
																			"";
																	}
																}}
															></IconButton>
														</TooltipHost>
													</div>
													<a
														onClick={() => {
															if (
																core.imagesTable
																	.table[
																	this
																		.selectedCase!
																		.caseSheetPhoto
																]
															) {
																const newTab = window.open();
																newTab!.document.body.innerHTML = `<img src="${
																	core
																		.imagesTable
																		.table[
																		this
																			.selectedCase!
																			.caseSheetPhoto
																	]
																}">`;
															}
														}}
													>
														<img
															src={
																core.imagesTable
																	.table[
																	this
																		.selectedCase
																		.caseSheetPhoto
																]
																	? core
																			.imagesTable
																			.table[
																			this
																				.selectedCase
																				.caseSheetPhoto
																	  ]
																	: this.fetchImage(
																			this
																				.selectedCase
																				.caseSheetPhoto
																	  )
															}
														></img>
													</a>
												</div>
											</div>
										) : this.uploading ? (
											<Icon
												iconName="sync"
												className="rotate"
												style={{ padding: 10 }}
											/>
										) : (
											<PickAndUploadComponent
												allowMultiple={false}
												accept={fileTypes.image}
												onFinish={(paths) => {
													this.selectedCase!.caseSheetPhoto =
														paths[0];
												}}
												onStartLoading={() => {
													this.uploading = true;
												}}
												onFinishLoading={() => {
													this.uploading = false;
												}}
												targetDir={`casesheets/${this.selectedCase._id}`}
											>
												<TooltipHost
													content={
														"Upload photo of case sheet"
													}
												>
													<DefaultButton
														iconProps={{
															iconName:
																"Photo2Add",
														}}
														text="Upload"
													></DefaultButton>
												</TooltipHost>
											</PickAndUploadComponent>
										)}
									</div>
								</div>
							) : (
								""
							)}
							{core.router.selectedTab === "payments" ? (
								<div>
									<Row gutter={8}>
										<Col span={8}>
											<TextField
												label={"Total price"}
												value={this.selectedCase.treatmentPrice.toString()}
												onChange={(ev, val) =>
													(this.selectedCase!.treatmentPrice = num(
														val!
													))
												}
												type="number"
												prefix={setting!.getSetting(
													"currencySymbol"
												)}
												min={0}
											/>
										</Col>
										<Col span={8}>
											<TextField
												label={"Total paid"}
												value={this.selectedCase.totalPayments.toString()}
												type="number"
												prefix={setting!.getSetting(
													"currencySymbol"
												)}
												min={0}
												disabled
											/>
										</Col>
										<Col span={8}>
											<TextField
												label={"Outstanding"}
												value={this.selectedCase.outstandingPayments.toString()}
												type="number"
												prefix={setting!.getSetting(
													"currencySymbol"
												)}
												min={0}
												disabled
											/>
										</Col>
									</Row>
									<h3>Installments</h3>
									<table className="ms-table condensed-table">
										<thead>
											<tr>
												<th>Date</th>
												<th>Amount</th>
												<th></th>
											</tr>
										</thead>
										<tbody>
											{this.selectedCase!.paidInstallments.map(
												(installment, i) => (
													<tr>
														<td>
															<DatePicker
																value={
																	new Date(
																		installment.date
																	)
																}
																onSelectDate={(
																	date
																) => {
																	if (date) {
																		this.selectedCase!.paidInstallments[
																			i
																		].date = date.setHours(
																			1,
																			0,
																			0,
																			0
																		);
																	}
																}}
																formatDate={(
																	d
																) =>
																	formatDate(
																		d || 0,
																		modules.setting!.getSetting(
																			"date_format"
																		)
																	)
																}
															/>
														</td>
														<td>
															<TextField
																type="number"
																value={this.selectedCase!.paidInstallments[
																	i
																].amount.toString()}
																onChange={(
																	ev,
																	val
																) =>
																	(this.selectedCase!.paidInstallments[
																		i
																	].amount = num(
																		val!
																	))
																}
															/>
														</td>

														<td>
															<IconButton
																iconProps={{
																	iconName:
																		"Trash",
																}}
																onClick={() => {
																	this.selectedCase!.paidInstallments.splice(
																		i,
																		1
																	);
																}}
															></IconButton>
														</td>
													</tr>
												)
											)}
										</tbody>
									</table>
									<br />
									<PrimaryButton
										onClick={() => {
											this.selectedCase!.paidInstallments.push(
												{
													date: new Date().getTime(),
													amount: 0,
												}
											);
										}}
									>
										Add installment
									</PrimaryButton>
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

function openBase64InNewTab(data: string, mimeType: string) {
	const byteCharacters = atob(data);
	const byteNumbers = new Array(byteCharacters.length);
	for (let i = 0; i < byteCharacters.length; i++) {
		byteNumbers[i] = byteCharacters.charCodeAt(i);
	}
	const byteArray = new Uint8Array(byteNumbers);
	const file = new Blob([byteArray], { type: mimeType + ";base64" });
	const fileURL = URL.createObjectURL(file);
	window.open(fileURL);
}
