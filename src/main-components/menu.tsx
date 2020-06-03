import { menu } from "@core";
import * as core from "@core";
import { observer } from "mobx-react";
import { Icon, Nav, Panel, PanelType, TooltipHost } from "office-ui-fabric-react";
import * as React from "react";

class Version extends React.Component {
	render() {
		return (
			<div className="ver">
				apexo
				<br /> <span>--VERSION--</span>
			</div>
		);
	}
}

@observer
export class MenuView extends React.Component {
	public render() {
		return (
			<div className="menu-component">
				<Version />
				<div className="visible-lg visible-md icon-list">
					{menu.sortedItems.map(item => {
						const pageDisplayName = item.name;
						return (
							<TooltipHost
								key={item.key}
								content={
									pageDisplayName.charAt(0).toUpperCase() +
									pageDisplayName.substr(1)
								}
								directionalHint={12}
								tooltipProps={{
									calloutProps: {
										className: "menu-item-tt"
									}
								}}
							>
								<div
									className={
										"item" +
										` bg-menu-item-${item.key.toLowerCase()}` +
										(item.name ===
										core.router.currentNamespace
											? " selected"
											: "")
									}
									onClick={item.onClick}
								>
									<Icon iconName={item.icon} />
								</div>
							</TooltipHost>
						);
					})}
				</div>
				<Panel
					className="menu"
					isLightDismiss={true}
					isOpen={core.router.selectedMain === "menu"}
					type={PanelType.smallFixedNear}
					onDismiss={() => core.menu.hide()}
					hasCloseButton={false}
				>
					<Nav
						groups={[
							{
								links: core.menu.sortedItems.map(x => {
									return {
										icon: x.icon,
										name: x.name,
										title: x.name.toLocaleLowerCase(),
										key: x.key,
										url: x.url,
										onClick: x.onClick
									};
								})
							}
						]}
						selectedKey={core.router.currentNamespace}
						className="main-nav"
					/>
				</Panel>
			</div>
		);
	}
}
