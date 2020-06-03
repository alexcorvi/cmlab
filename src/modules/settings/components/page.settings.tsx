import * as core from "@core";
import { status } from "@core";
import * as modules from "@modules";
import { dateNames, formatDate, second } from "@utils";
import { computed, observable } from "mobx";
import { observer } from "mobx-react";
import * as React from "react";
import {
	Col,
	ProfileSquaredComponent,
	Row,
	SectionComponent,
} from "@common-components";
import {
	ContextualMenu,
	DefaultButton,
	Dropdown,
	Icon,
	IconButton,
	MessageBar,
	MessageBarType,
	TextField,
	Toggle,
	TooltipHost,
} from "office-ui-fabric-react";

@observer
export class SettingsPage extends React.Component {
	unlockCombinations = [
		[5, 4, 9],
		[3, 2, 5],
		[6, 1, 7],
		[2, 6, 8],
		[5, 1, 6],
		[4, 1, 5],
	];

	chosenCombination = this.unlockCombinations[Math.floor(Math.random() * 6)];

	@observable compactionInProgress = false;
	@observable downloadInProgress = false;

	@observable inputEl: HTMLInputElement | null = null;

	@observable remoteBackupInProgress: boolean = false;

	@observable locked: boolean = true;

	componentDidMount() {
		setTimeout(() => modules.setting!.updateDropboxBackups(), second);
	}

	render() {
		return (
			<div className="settings-component container-fluid">
				{this.locked ? (
					<div className="lock-msg">
						<div className="lock-icon">
							<Icon iconName="lock"></Icon>
						</div>

						<div className="lock-header">
							<h2>{"Settings are locked"}</h2>
							<p>
								{
									"To prevent unintentional changes, solve the mathematical equation to unlock"
								}
							</p>
						</div>

						<hr />
						<div className="math-question">
							{<span id="cc-1">{this.chosenCombination[0]}</span>}{" "}
							+{" "}
							{<span id="cc-2">{this.chosenCombination[1]}</span>}{" "}
							={" "}
							<TextField
								type="number"
								onChange={(e, v) =>
									Number(v) === this.chosenCombination[2]
										? (this.locked = false)
										: ""
								}
							/>
						</div>
					</div>
				) : (
					<div className="unlocked">
						{" "}
						<SectionComponent title={`General Setting`}>
							<SettingInputComponent
								element={
									<Dropdown
										label={"Date format"}
										options={[
											{
												key: "dd/mm/yyyy",
												text: "dd/mm/yyyy",
											},
											{
												key: "mm/dd/yyyy",
												text: "mm/dd/yyyy",
											},
											{
												key: "dd MM 'YY",
												text: "dd MM 'YY",
											},
										]}
										defaultSelectedKey={modules.setting!.getSetting(
											"date_format"
										)}
										onChange={(ev, v) => {
											modules.setting!.setSetting(
												"date_format",
												v!.key.toString()
											);
										}}
									/>
								}
								info={`Set the date format to be used across this application`}
							/>

							<SettingInputComponent
								element={
									<TextField
										value={modules.setting!.getSetting(
											"dropbox_accessToken"
										)}
										label={"Dropbox access token"}
										onChange={(ev, val) => {
											modules.setting!.setSetting(
												"dropbox_accessToken",
												val!
											);

											setTimeout(
												() =>
													core.status.validateOnlineStatus(),
												second / 2
											);
										}}
									/>
								}
								info={`This access token is used to store files across the application, like backups and images`}
							/>
						</SectionComponent>
						<SectionComponent title={`Financial Settings`}>
							<SettingInputComponent
								element={
									<TextField
										label={"Currency symbol"}
										value={modules.setting!.getSetting(
											"currencySymbol"
										)}
										onChange={(ev, newVal) => {
											modules.setting!.setSetting(
												"currencySymbol",
												newVal!.toString()
											);
										}}
									/>
								}
								info={`This symbol you enter here will be used across your application`}
							/>
						</SectionComponent>
						<SectionComponent title={`Backup and Restore`}>
							{status.isOnline.server ? (
								<div>
									<DefaultButton
										onClick={async () => {
											this.compactionInProgress = true;
											await core.dbAction("compact");
											this.compactionInProgress = false;
										}}
										iconProps={{ iconName: "ZipFolder" }}
										className="m-l-5 m-t-5"
										text={"Run compaction"}
										disabled={this.compactionInProgress}
									/>

									<DefaultButton
										onClick={async () => {
											this.downloadInProgress = true;
											await core.downloadCurrentStateAsBackup();
											this.downloadInProgress = false;
										}}
										className="m-l-5 m-t-5"
										iconProps={{ iconName: "Database" }}
										text={"Download a backup"}
										disabled={this.downloadInProgress}
									/>

									<DefaultButton
										onClick={() =>
											this.inputEl
												? this.inputEl.click()
												: ""
										}
										className="m-l-5 m-t-5"
										iconProps={{ iconName: "DatabaseSync" }}
										text={"Restore from file"}
									/>

									<input
										ref={(el) => (this.inputEl = el)}
										hidden
										type="file"
										multiple={false}
										onChange={async (e) => {
											if (
												e.target.files &&
												e.target.files.length > 0
											) {
												core.restore.fromFile(
													e.target.files[0]
												);
											}
										}}
									/>
								</div>
							) : (
								<MessageBar
									messageBarType={MessageBarType.warning}
								>
									{
										"Backup and restore functionality are not available while you're offline"
									}
								</MessageBar>
							)}
						</SectionComponent>
						<SectionComponent
							title={`Automated Backup and Restore`}
						>
							{status.isOnline.client ? (
								status.isOnline.dropbox ? (
									<div>
										<Dropdown
											label={"Backup frequency"}
											options={[
												{
													key: "d",
													text: "Daily",
												},
												{
													key: "w",
													text: "Weekly",
												},
												{
													key: "m",
													text: "Monthly",
												},
												{
													key: "n",
													text: "Never",
												},
											]}
											selectedKey={modules.setting!.getSetting(
												"backup_freq"
											)}
											onChange={(ev, v) => {
												modules.setting!.setSetting(
													"backup_freq",
													v!.key.toString()
												);
											}}
										/>

										<TextField
											value={modules.setting!.getSetting(
												"backup_retain"
											)}
											label={"How many backups to retain"}
											onChange={(ev, val) => {
												modules.setting!.setSetting(
													"backup_retain",
													val!
												);
											}}
											type="number"
										/>

										{modules.setting!.dropboxBackups
											.length ? (
											<table className="ms-table">
												<thead>
													<tr>
														<th>{"Backup"}</th>
														<th>{"Actions"}</th>
													</tr>
												</thead>
												<tbody>
													{modules.setting!.dropboxBackups.map(
														(file) => {
															const date = new Date(
																file.client_modified
															);

															return (
																<tr
																	key={
																		file.id
																	}
																>
																	<td>
																		<ProfileSquaredComponent
																			onRenderInitials={() => (
																				<div
																					style={{
																						textAlign:
																							"center",
																						fontSize: 10,
																					}}
																				>
																					{`${date.getDate()}/${
																						date.getMonth() +
																						1
																					}`}
																				</div>
																			)}
																			text={formatDate(
																				date,
																				modules.setting!.getSetting(
																					"date_format"
																				)
																			)}
																			subText={`${Math.round(
																				file.size /
																					1000
																			)} KB`}
																		/>
																	</td>
																	<td>
																		<TooltipHost
																			content={
																				"Delete"
																			}
																		>
																			<IconButton
																				style={{
																					marginRight: 6,
																				}}
																				iconProps={{
																					iconName:
																						"delete",
																				}}
																				disabled={
																					this
																						.remoteBackupInProgress
																				}
																				onClick={() => {
																					this.remoteBackupInProgress = true;
																					core.backup
																						.deleteFromDropbox(
																							file.path_lower
																						)
																						.then(
																							() => {
																								this.remoteBackupInProgress = false;
																								modules.setting!.updateDropboxBackups();
																							}
																						)
																						.catch(
																							() => {
																								this.remoteBackupInProgress = false;
																								modules.setting!.updateDropboxBackups();
																							}
																						);
																				}}
																			/>
																		</TooltipHost>

																		<TooltipHost
																			content={
																				"Restore"
																			}
																		>
																			<IconButton
																				style={{
																					marginRight: 6,
																				}}
																				iconProps={{
																					iconName:
																						"DatabaseSync",
																				}}
																				disabled={
																					this
																						.remoteBackupInProgress
																				}
																				onClick={() => {
																					this.remoteBackupInProgress = true;
																					core.restore
																						.fromDropbox(
																							file.path_lower
																						)
																						.then(
																							() =>
																								(this.remoteBackupInProgress = false)
																						)
																						.catch(
																							() =>
																								(this.remoteBackupInProgress = false)
																						);
																				}}
																			/>
																		</TooltipHost>
																	</td>
																</tr>
															);
														}
													)}
												</tbody>
											</table>
										) : (
											""
										)}
									</div>
								) : (
									<MessageBar
										messageBarType={MessageBarType.warning}
									>
										A valid DropBox access token is required
										for this section
									</MessageBar>
								)
							) : (
								<MessageBar
									messageBarType={MessageBarType.warning}
								>
									{
										"Backup and restore functionality are not available while you're offline"
									}
								</MessageBar>
							)}
						</SectionComponent>
					</div>
				)}
			</div>
		);
	}
}
@observer
export class SettingInputComponent extends React.Component<{
	element: React.ReactElement<any>;
	info: string;
}> {
	render() {
		return (
			<Row gutter={8} style={{ marginBottom: 20 }}>
				<Col style={{ marginBottom: -15 }} md={12}>
					{this.props.element}
				</Col>
				<Col md={12}>
					<MessageBar
						style={{ marginTop: 22 }}
						messageBarType={MessageBarType.info}
					>
						{this.props.info}
					</MessageBar>
				</Col>
			</Row>
		);
	}
}
